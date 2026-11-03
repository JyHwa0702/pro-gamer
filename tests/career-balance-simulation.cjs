const {game}=require('./game-harness.cjs'),fs=require('node:fs'),assert=require('node:assert/strict');
const rows=[],seeds=[17,97,101,333,777],positions=['top','jg','mid','adc','sup'];
const median=xs=>{const a=xs.slice().sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
async function career(seed,pos,activities){
 const g=game(seed);g.run(`Date=class extends Date{static now(){return 1793700000000;}};checkAchievements=__nativeAchievements;P=makePlayer('커리어밸런스','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;ask=async(html,buttons)=>html.includes('스토브리그 - 계약 제안')&&${seed}%2===1&&buttons.length>1?1:0;`);
 for(let turn=0;turn<78;turn++){
  if(activities && g.run('P.week===1||P.week===25'))for(const id of g.run('SEASON_PROJECT_IDS.slice()'))await g.run(`confirmSeasonProject('${id}')`);
  await g.run('takeTurn(recommend())');assert.ok(g.run('Number.isFinite(P.money)&&P.money>=0&&P.hp>=0&&P.stress>=0&&P.stress<=100&&Object.values(P.s).every(Number.isFinite)'));
 }
 const p=JSON.parse(JSON.stringify(g.run(`({stage:P.stage,ovr:ovr(),money:P.money,fans:P.fans,games:P.hist.games,wins:P.hist.wins,archives:P.seasonArchive,career:P.career})`)));
 const receipts=p.archives.flatMap(a=>Object.entries(a.projects).map(([id,r])=>({id,...r})));
 for(const id of ['support','fanmeet','interview','album','careerReview','relocation','brandCampaign'])assert.ok(receipts.filter(r=>r.id===id).length<=3,id);
 const directIncome=receipts.reduce((n,r)=>n+r.income,0);assert.ok(directIncome<=6000000);
 const settled=p.career.contracts.filter(c=>c.settled);assert.ok(settled.every(c=>c.kind==='transfer'));assert.ok(receipts.filter(r=>r.id==='relocation').length<=settled.length);
 return {stage:p.stage,ovr:p.ovr,money:p.money,fans:p.fans,games:p.games,wins:p.wins,spent:receipts.reduce((n,r)=>n+r.cost,0),directIncome,activities:receipts.length,relocations:settled.length};
}
(async()=>{for(const pos of positions)for(const seed of seeds)rows.push({pos,seed,control:await career(seed,pos,false),activities:await career(seed,pos,true)});
 const summary=key=>{const r=rows.map(x=>x[key]);return {careers:r.length,pro:r.filter(x=>x.stage==='pro').length,academy:r.filter(x=>x.stage==='aca').length,amateur:r.filter(x=>x.stage==='ama').length,medianOvr:median(r.map(x=>x.ovr)),medianMoney:median(r.map(x=>x.money)),medianFans:median(r.map(x=>x.fans)),medianGames:median(r.map(x=>x.games)),medianActivitySpend:median(r.map(x=>x.spent)),maxDirectIncome:Math.max(...r.map(x=>x.directIncome)),settledRelocations:r.reduce((n,x)=>n+x.relocations,0)};};
 const report={careers:50,totalWeeks:3900,weeksPerCareer:78,positions,seeds,policy:'기본 특성·추천 일정·빠른 경기. 양군 모두 실제 제안2개이상이면 두번째 계약 선택. 활동군은매년1/25주 가능한7종활동을시도하되시즌1회·같은이적1회제한. 기존업적활성화.',control:summary('control'),activities:summary('activities'),rows,scope:'지정25조건 쌍 비교. 활동 후 경기/난수경로와총수입이달라질수있으므로최종자산차이를직접활동수익으로해석하지않는다.'};
 fs.writeFileSync('docs/reports/CAREER_BALANCE_SIMULATION_2026-11-04.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined,result:'CAREER_BALANCE_50_CAREERS_PASS'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
