// 표시 보강 전 고정 커밋과 같은 입력을 비교한다. 이후 추가된 주간 notices 표시 메타데이터만 제외한다.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const baselineCommit='b7dd185ae9577d7a7ccab1fac4c69b0eb3a1ac16';
const baseline=cp.execFileSync('git',['show',baselineCommit+':index.html'],{encoding:'utf8',maxBuffer:4*1024*1024});
const results=[];
const gameplay=value=>{const p=JSON.parse(JSON.stringify(value));for(const r of p.weeklyBriefingHistory || [])delete r.notices;return p;};
(async()=>{
 for(const stage of ['ama','pro'])for(const pos of ['top','jg','mid','adc','sup']){
  const old=game(1801,baseline),now=game(1801);
  for(const g of [old,now])g.run(`Date=class extends Date{static now(){return 1793836800000;}};P=makePlayer('화면보강비교','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;P.money=5000000;P.fans=5000;P.stage='${stage}';${stage==='pro'?"P.teamId=0;P.salary=300000;Object.keys(P.s).forEach(k=>P.s[k]=65);P.hist.bestStage='pro';":''}ensureSeasonJourney().opened=true;`);
  for(let i=0;i<26;i++){
   const action=old.run('recommendationPlan().key');assert.equal(now.run('recommendationPlan().key'),action,'동일 추천');
   // 새 표시 함수를 반복해 열어도 이후 정산·난수를 바꾸지 않는다.
   now.run('renderCareerRecord();renderSeasonVisual();__nativeRender()');
   for(const g of [old,now])await g.run(`takeTurn('${action}')`);
   assert.deepEqual(gameplay(now.run('P')),gameplay(old.run('P')),stage+'/'+pos+'/'+i+' 게임 상태');
  }
  assert.equal(now.run('Math.random()'),old.run('Math.random()'),'다음 난수 일치');
  for(const g of [old,now])g.run('save()');assert.deepEqual(gameplay(JSON.parse(now.storage.get('proRoadSave_v4'))),gameplay(JSON.parse(old.storage.get('proRoadSave_v4'))),'저장 게임 상태 일치');
  results.push({stage,pos,weeks:26,games:now.run('P.hist.games'),sameGameplayState:true,sameRandom:true,sameSavedGameplay:true});
 }
 const out={result:'UI_PRESERVATION_PASS',baselineCommit,pairedCareers:results.length,pairedWeeks:260,executedWeeks:520,excludedMetadata:['weeklyBriefingHistory[].notices'],results};console.log(JSON.stringify(out,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
