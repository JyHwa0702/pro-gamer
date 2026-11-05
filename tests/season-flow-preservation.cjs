// 실행: SEASON_FLOW_BASELINE에 수정 전 HTML 지정. 표시 메타데이터 notices만 제외해 전체 상태를 대조한다.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
const baselinePath=process.env.SEASON_FLOW_BASELINE || '.system_generated/season-flow-before.html';
const baseline=fs.readFileSync(baselinePath,'utf8'),results=[];
const gameplay=value=>{const p=JSON.parse(JSON.stringify(value));for(const r of p.weeklyBriefingHistory || [])delete r.notices;return p;};
(async()=>{
 for(const stage of ['ama','pro'])for(const pos of ['top','jg','mid','adc','sup']){
  const old=game(1801,baseline),now=game(1801);
  for(const g of [old,now])g.run(`Date=class extends Date{static now(){return 1793836800000;}};P=makePlayer('한시즌보강비교','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;P.money=5000000;P.fans=5000;P.stage='${stage}';${stage==='pro'?"P.teamId=0;P.salary=300000;Object.keys(P.s).forEach(k=>P.s[k]=65);P.hist.bestStage='pro';":''}ensureSeasonJourney().opened=true;`);
  for(let i=0;i<26;i++){
   const key=old.run('recommendationPlan().key');assert.equal(now.run('recommendationPlan().key'),key);
   now.run('renderMatchPreview();renderLatestWeeklyResult();renderCareerRecord()');
   for(const g of [old,now])await g.run(`takeTurn('${key}')`);
   assert.deepEqual(gameplay(now.run('P')),gameplay(old.run('P')),stage+'/'+pos+'/'+i);
  }
  assert.equal(now.run('Math.random()'),old.run('Math.random()'));for(const g of [old,now])g.run('save()');assert.deepEqual(gameplay(JSON.parse(now.storage.get('proRoadSave_v4'))),gameplay(JSON.parse(old.storage.get('proRoadSave_v4'))));
  results.push({stage,pos,weeks:26,games:now.run('P.hist.games'),sameGameplayState:true,sameRandom:true,sameSavedGameplay:true});
 }
 console.log(JSON.stringify({result:'SEASON_FLOW_PRESERVATION_PASS',baselineSha256:crypto.createHash('sha256').update(baseline).digest('hex'),pairedCareers:10,pairedWeeks:260,executedWeeks:520,excludedMetadata:['weeklyBriefingHistory[].notices'],results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
