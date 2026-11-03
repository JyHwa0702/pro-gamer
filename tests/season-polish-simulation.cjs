// 사용: node tests/season-polish-simulation.cjs [수정 전 index.html 경로]
// VM 정산 실험이며 실제 이용자의 재미·모바일 기기 동작을 증명하지 않는다.
const {game}=require('./game-harness.cjs'),fs=require('node:fs'),assert=require('node:assert/strict');
const plain=x=>JSON.parse(JSON.stringify(x));
const median=xs=>xs.slice().sort((a,b)=>a-b)[Math.floor(xs.length/2)];
async function main(){
 const baseline=process.argv[2]&&fs.readFileSync(process.argv[2],'utf8'),rows=[],parity=[],matched=[];
 const cases=[['top',17],['jg',17],['mid',17],['adc',17],['sup',17],['jg',97],['mid',97],['sup',97]];
 if(baseline)for(const [pos,seed] of cases){const pair=[game(seed,baseline),game(seed)];
  for(const g of pair)g.run(`Date=class extends Date{static now(){return 1793700000000;}};checkAchievements=__nativeAchievements;P=makePlayer('공통일정대조','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;`);
  for(let i=0;i<78;i++){
   const key=pair[0].run("P.hp<35||P.stress>70?'rest':recommend()==='date'?'rest':recommend()");
   for(const g of pair)await g.run(`takeTurn('${key}')`);
   const states=pair.map(g=>plain(g.run('P')));for(const p of states){for(const k of ['seasonJourney','seasonArchive','career','weeklyBriefingHistory','contractBonus','contractBonusHistory'])delete p[k];}
   assert.deepEqual(states[1],states[0],`${pos}/${seed} 공통일정${i}`);
  }assert.equal(pair[1].run('Math.random()'),pair[0].run('Math.random()'));parity.push({pos,seed,weeks:78});
 }
 for(const pos of ['top','jg','mid','adc','sup'])for(const seed of [17,97,101,333,777])for(const focus of ['challenge','balance']){
  const g=game(seed);g.run(`Date=class extends Date{static now(){return 1793700000000;}};checkAchievements=__nativeAchievements;P=makePlayer('추천정책검증','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;let prompts=0;ask=async html=>{prompts++;return 0;};`);
  const actions={};for(let i=0;i<78;i++){
   g.run(`ensureSeasonJourney().opened=true;P.seasonJourney.focus='${focus}';`);
   const key=g.run('recommend()');actions[key]=(actions[key]||0)+1;const week=g.run('careerWeek()');await g.run('runRecommendedTurn()');assert.equal(g.run('careerWeek()'),week+1);
   assert.ok(g.run('P.money>=0&&Number.isFinite(P.money)&&P.hp>=0&&P.stress>=0&&P.stress<=100&&Object.values(P.s).every(Number.isFinite)'));
  }
  rows.push(plain(g.run(`({pos:P.pos,seed:${seed},focus:'${focus}',stage:P.stage,ovr:ovr(),money:P.money,fans:P.fans,games:P.hist.games,wins:P.hist.wins,prompts,contacts:P.seasonArchive.map(x=>x.contactWeeks.length),goals:P.seasonArchive.map(x=>x.progress.done),youth:P.bonds.jieun.youthArc || null,actions:${JSON.stringify(actions)}})`)));
 }
 const summarize=focus=>{const a=rows.filter(x=>x.focus===focus);return {careers:a.length,pro:a.filter(x=>x.stage==='pro').length,medianOvr:median(a.map(x=>x.ovr)),medianMoney:median(a.map(x=>x.money)),medianFans:median(a.map(x=>x.fans)),medianGames:median(a.map(x=>x.games)),completedSeasons:a.reduce((n,x)=>n+x.goals.filter(Boolean).length,0),totalSeasons:a.length*3,contactWeeks:a.reduce((n,x)=>n+x.contacts.reduce((n,v)=>n+v,0),0),askCalls:a.reduce((n,x)=>n+x.prompts,0),dateActions:a.reduce((n,x)=>n+(x.actions.date||0),0)};};
 if(baseline)for(const pos of ['mid','jg','sup'])for(const seed of [17,97,101]){
  const results=[];for(const old of [true,false]){const g=game(seed,old?baseline:undefined);g.run(`checkAchievements=__nativeAchievements;showHeroineCutscene=__nativeCutscene;P=makePlayer('대화밀도대조','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;let prompts=0;ask=async()=>{prompts++;return 0;};`);
   for(let i=0;i<78;i++){g.run("ensureSeasonJourney().opened=true;P.seasonJourney.focus='balance';");await g.run(old?'takeTurn(recommend())':'runRecommendedTurn()');}
   results.push(plain(g.run('({prompts,ovr:ovr(),money:P.money,stage:P.stage,contacts:P.seasonArchive.reduce((n,s)=>n+s.contactWeeks.length,0),completed:P.seasonArchive.filter(s=>s.progress.done).length})')));
  }matched.push({pos,seed,before:results[0],after:results[1]});
 }
 const sum=(key,field)=>matched.reduce((n,x)=>n+x[key][field],0);
 const report={version:'2.7.0',parity:{careers:parity.length,weeks:parity.length*78,result:baseline?'CORE_AND_NEXT_RNG_EQUAL':'NO_BASELINE',cases:parity},recommendation:{careers:rows.length,weeks:rows.length*78,challenge:summarize('challenge'),balance:summarize('balance')},matched:{careersPerVersion:matched.length,weeksPerVersion:matched.length*78,before:{prompts:sum('before','prompts'),contacts:sum('before','contacts'),completed:sum('before','completed')},after:{prompts:sum('after','prompts'),contacts:sum('after','contacts'),completed:sum('after','completed')},rows:matched},scope:'5포지션×5시드×도전/균형. 기본 특성·빠른 경기·기존 업적 활성화·새 추천 버튼과 첫 대화 선택. 소통은 유료 실제 데이트이며 자원 사건에 따라 목표 실패 가능. 비교군 공통일정은 기본 성장/경기/급여/재산/다음 난수 불변 검증용이다. 대화밀도대조9조건은 양쪽 균형목표·원본장면을 사용한다.',rows};
 fs.writeFileSync('docs/reports/SEASON_POLISH_BALANCE_2026-11-04.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
