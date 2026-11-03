// 지정 시드·추천 일정의 3시즌 비교. 전체 플레이 스타일을 대표하는 통계는 아니다.
const {game}=require('./game-harness.cjs'),fs=require('node:fs'),assert=require('node:assert/strict');
const rows=[];const seeds=[17,97,101,333,777],positions=['top','jg','mid','adc','sup'];
async function career(seed,pos,activities){
 const g=game(seed);g.run(`Date=class extends Date{static now(){return 1793700000000;}};checkAchievements=__nativeAchievements;P=makePlayer('장기밸런스','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;`);
 for(let week=0;week<78;week++){
  if(activities && g.run('P.week===1'))for(const id of ['support','fanmeet','interview','album'])await g.run(`confirmSeasonProject('${id}')`);
  await g.run('takeTurn(recommend())');assert.ok(g.run('Number.isFinite(P.money)&&P.money>=0&&P.hp>=0&&P.stress>=0&&P.stress<=100&&Object.values(P.s).every(Number.isFinite)'));
 }
 const result=JSON.parse(JSON.stringify(g.run(`({stage:P.stage,ovr:ovr(),money:P.money,fans:P.fans,games:P.hist.games,wins:P.hist.wins,years:P.year-1,archives:P.seasonArchive,aff:P.bonds.jieun.aff})`)));
 const receipts=result.archives.flatMap(s=>Object.entries(s.projects).map(([id,r])=>({id,...r})));delete result.archives;
 result.spent=receipts.reduce((n,r)=>n+r.cost,0);result.activityIncome=receipts.reduce((n,r)=>n+r.income,0);result.activities=receipts.length;
 assert.ok(result.activityIncome<=1500000);for(const id of ['support','fanmeet','interview','album'])assert.ok(receipts.filter(r=>r.id===id).length<=3);
 return result;
}
const median=xs=>{const a=xs.slice().sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
(async()=>{
 for(const pos of positions)for(const seed of seeds){const free=await career(seed,pos,false),active=await career(seed,pos,true);rows.push({pos,seed,free,active});}
 const summarize=key=>{const r=rows.map(x=>x[key]);return {careers:r.length,pro:r.filter(x=>x.stage==='pro').length,academy:r.filter(x=>x.stage==='aca').length,amateur:r.filter(x=>x.stage==='ama').length,medianOvr:median(r.map(x=>x.ovr)),medianMoney:median(r.map(x=>x.money)),medianFans:median(r.map(x=>x.fans)),medianGames:median(r.map(x=>x.games)),medianActivitySpend:median(r.map(x=>x.spent)),maxActivityIncome:Math.max(...r.map(x=>x.activityIncome))};};
 const report={seedCount:seeds.length,positions,seeds,careers:50,weeksPerCareer:78,totalCommittedWeeks:3900,policy:'기존 추천 일정, 기본 특성, 빠른 경기. 활동군은 매년 첫 주에 가능한 활동4종을 각각1회 시도. 기존 업적 활성화.',control:summarize('free'),activities:summarize('active'),rows,scope:'지정25조건의 쌍 비교. 활동 이후 선택·경기·난수 경로가 달라질 수 있으며, 활동이 승리를 보장한다는 실험이 아님.'};
 fs.writeFileSync('docs/reports/SEASON_BALANCE_SIMULATION_2026-11-03.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:'SEASON_BALANCE_50_CAREERS_PASS',...report,rows:undefined},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
