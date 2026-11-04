// 실제 v2.8 vs 실제 다전제 통합 자동 시즌 비교. 원 CORE 보고서는 변경하지 않는다.
// node tests/series-season-simulation.cjs --seed-count=10
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {game}=require('./game-harness.cjs');
const root=path.resolve(__dirname,'..'),args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const seedCount=args['seed-count']===undefined?10:Number(args['seed-count']);
if(!Number.isInteger(seedCount)||seedCount<1||seedCount>100)throw Error('seed-count는 1~100 정수여야 합니다.');
const baselineRevision='b1707be8a78c2f0be4c8eae618fc9bcdb755238e';
const sources={baseline:execFileSync('git',['show',baselineRevision+':index.html'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}),series:fs.readFileSync(path.join(root,'index.html'),'utf8')};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const fixtures=[{name:'ama30',stage:'ama',skill:30,mental:55,teamId:-1,salary:0},{name:'aca55',stage:'aca',skill:55,mental:65,teamId:0,salary:300000},{name:'pro65',stage:'pro',skill:65,mental:65,teamId:0,salary:4850000}];
const output=args.output?path.resolve(args.output):path.join(root,'docs/reports/SERIES_SEASON_BALANCE_2026-11-05.json');
async function runCase(version,source,fixture,strategy,seed){
 const g=game(seed,source);
 g.run(`P=makePlayer('시즌실험','mid',{mech:${fixture.skill},lane:${fixture.skill},macro:${fixture.skill},team:${fixture.skill},pool:${fixture.skill},mental:${fixture.mental}});P.stage='${fixture.stage}';P.teamId=${fixture.teamId};P.talent=1.15;P.fastSkip=false;
  if(P.stage!=='ama'){P.pro[0].str=65;P.pro[0].starter=65;P.aca[0].str=55;P.salary=salaryFor(myTeam());}
  globalThis.audit={asks:0,prompts:0,checkpoints:[],matches:[],errors:[]};
  ask=(html,buttons)=>{audit.asks++;return __nativeAsk(html,buttons)};
  renderButtons=()=>{audit.prompts++;throw Error('완전자동에서 화면 선택 대기가 발생했습니다.');};
  showHeroineCutscene=__nativeCutscene;checkAchievements=__nativeAchievements;
  const actualPlayMatch=playMatch;
  playMatch=async(...args)=>{
   const player=P,year=P.year,week=P.week,stage=P.stage;
   const before={pog:P.hist.mvp,fans:P.fans,money:P.money,hp:P.hp,mech:P.s.mech,mental:P.s.mental};
   const result=await actualPlayMatch(...args);
   if(P===player)audit.matches.push({year,week,stage,label:args[1],bestOf:result.bestOf ?? null,win:result.win,rating:result.rating,sets:result.sets?.length ?? null,mySetW:result.mySetW,mySetL:result.mySetL,pog:P.hist.mvp-before.pog,fanDelta:P.fans-before.fans,moneyDelta:P.money-before.money,hpDelta:P.hp-before.hp,mechDelta:P.s.mech-before.mech,mentalDelta:P.s.mental-before.mental});
   return result;
  };
  autoYield=async()=>{
   const raw=localStorage.getItem(SAVE),saved=raw?JSON.parse(raw):null;
   const finite=[P.money,P.hp,P.stress,P.fans,P.salary,ovr(),...Object.values(P.s)].every(Number.isFinite);
   const checkpoint={year:P.year,week:P.week,action:P.lastAction,stage:P.stage,ovr:ovr(),money:P.money,hp:P.hp,stress:P.stress,fans:P.fans,games:P.hist.games,wins:P.hist.wins,pog:P.hist.mvp,salary:P.salary,fastSkip:P.fastSkip,pending:!!currentAskResolve,busy,activeTurn:!!activeWeekBriefing,activeSeries:typeof activeMatchSeries!=='undefined'&&!!activeMatchSeries,finite,savedEqual:raw===JSON.stringify(P),savedFastSkip:saved?.fastSkip};
   if(!finite||checkpoint.pending||busy||checkpoint.activeTurn||checkpoint.activeSeries||!checkpoint.savedEqual||checkpoint.savedFastSkip!==false)audit.errors.push({type:'checkpoint',checkpoint});
   audit.checkpoints.push(checkpoint);
  };
 `);
 const before=g.run('({year:P.year,week:P.week,stage:P.stage,ovr:ovr(),money:P.money,fans:P.fans,salary:P.salary,stats:{...P.s}})');
 let result,error=null;try{result=await g.run(`startAutomaticSeason({strategy:'${strategy}',interactive:false,maxWeeks:26})`);}catch(e){error=String(e.stack || e);}
 const after=g.run(`({year:P.year,week:P.week,stage:P.stage,teamId:P.teamId,ovr:ovr(),money:P.money,salary:P.salary,hp:P.hp,stress:P.stress,fans:P.fans,games:P.hist.games,wins:P.hist.wins,pog:P.hist.mvp,rank:{...P.rank},titles:[...P.hist.titles],achievements:Object.keys(P.achieves),stats:{...P.s},fastSkip:P.fastSkip,pending:!!currentAskResolve,busy,automatic:!!automaticSeason,briefings:P.weeklyBriefingHistory.length,archiveCount:P.seasonArchive.length,careerTrust:P.career?.coachTrust ?? null,contracts:(P.career?.contracts || []).map(c=>({year:c.year,week:c.week,kind:c.kind,from:c.from?.name,to:c.to?.name,salary:c.salary,settled:c.settled,evidence:c.evidence || null})),contractBonus:P.contractBonus,bonusPaid:(P.contractBonusHistory || []).reduce((n,c)=>n+c.amount,0),seriesRecorded:P.seriesHistory?.length || 0,seriesSets:(P.seriesHistory || []).reduce((n,c)=>n+c.sets.length,0),seriesFormats:(P.seriesHistory || []).reduce((n,c)=>{n[c.bestOf]=(n[c.bestOf] || 0)+1;return n;},{}),seasonArchives:P.seasonArchive.map(s=>({year:s.year,focus:s.focus,resultGames:s.result?.games,resultWins:s.result?.wins,progress:s.progress,seriesSummary:s.seriesSummary || null,careerSummary:s.careerSummary || null})),performance:typeof careerPerformance==='function'?careerPerformance():null})`);
 const audit=g.run('audit'),complete=result?.weeks===26&&after.year===2&&after.week===1;
 const passed=!!(complete&&!error&&!audit.errors.length&&!audit.prompts&&!after.pending&&!after.busy&&!after.automatic&&after.fastSkip===false&&audit.checkpoints.length===26&&after.briefings===26&&after.archiveCount===1&&after.games===audit.matches.length);
 return {version,fixture:fixture.name,strategy,seed,before,result,error,after,audit,passed};
}
(async()=>{
 const runs=[];
 for(const [version,source] of Object.entries(sources))for(const fixture of fixtures)for(const strategy of ['career','growth','balanced'])for(let i=0;i<seedCount;i++)runs.push(await runCase(version,source,fixture,strategy,1001+i*7919));
 const groups=[];
 for(const version of ['baseline','series'])for(const fixture of fixtures)for(const strategy of ['career','growth','balanced']){
  const group=runs.filter(r=>r.version===version&&r.fixture===fixture.name&&r.strategy===strategy),mean=k=>group.reduce((n,r)=>n+r.after[k],0)/group.length,totalGames=group.reduce((n,r)=>n+r.after.games,0),totalPog=group.reduce((n,r)=>n+r.after.pog,0);
  groups.push({version,fixture:fixture.name,strategy,runs:group.length,passed:group.filter(r=>r.passed).length,stages:Object.fromEntries(['ama','aca','pro'].map(s=>[s,group.filter(r=>r.after.stage===s).length])),meanOvr:mean('ovr'),meanMoney:mean('money'),minMoney:Math.min(...group.map(r=>r.after.money)),meanFans:mean('fans'),meanGames:mean('games'),meanPog:mean('pog'),pogPerMatch:totalGames?totalPog/totalGames:null,winRate:totalGames?group.reduce((n,r)=>n+r.after.wins,0)/totalGames:null,meanSets:mean('seriesSets'),meanSalary:mean('salary'),meanCareerTrust:mean('careerTrust'),meanMech:group.reduce((n,r)=>n+r.after.stats.mech,0)/group.length,meanMental:group.reduce((n,r)=>n+r.after.stats.mental,0)/group.length,totalContracts:group.reduce((n,r)=>n+r.after.contracts.length,0),contractKinds:group.flatMap(r=>r.after.contracts).reduce((counts,c)=>{counts[c.kind]=(counts[c.kind] || 0)+1;return counts;},{}),meanBonusPaid:mean('bonusPaid'),seasonGoalsCompleted:group.filter(r=>r.after.seasonArchives[0]?.progress?.done).length,actions:group.flatMap(r=>r.audit.checkpoints).reduce((counts,c)=>{counts[c.action]=(counts[c.action] || 0)+1;return counts;},{})});
 }
 const comparisons=groups.filter(g=>g.version==='series').map(s=>{const b=groups.find(g=>g.version==='baseline'&&g.fixture===s.fixture&&g.strategy===s.strategy),changes={};for(const k of ['meanOvr','meanMoney','meanFans','meanGames','meanPog','pogPerMatch','winRate','meanSalary','meanCareerTrust','meanMech','meanMental','meanBonusPaid'])changes[k]={baseline:b[k],series:s[k],difference:b[k]==null||s[k]==null?null:s[k]-b[k],ratio:b[k]?s[k]/b[k]:null};return {fixture:s.fixture,strategy:s.strategy,baselineStages:b.stages,seriesStages:s.stages,changes};});
 const summary=['baseline','series'].map(version=>{const group=runs.filter(r=>r.version===version);return {version,runs:group.length,passed:group.filter(r=>r.passed).length,completedWeeks:group.reduce((n,r)=>n+(r.result?.weeks || 0),0),prompts:group.reduce((n,r)=>n+r.audit.prompts,0),checkpointErrors:group.reduce((n,r)=>n+r.audit.errors.length,0),matches:group.reduce((n,r)=>n+r.after.games,0),actualSets:group.reduce((n,r)=>n+r.after.seriesSets,0)};});
 const report={baselineFile:'git:'+baselineRevision+':index.html',baselineSha256:sha(sources.baseline),sourceFile:'index.html',sourceSha256:sha(sources.series),sourceChangedDuringRun:sha(sources.series)!==sha(fs.readFileSync(path.join(root,'index.html'),'utf8')),generatedAt:new Date().toISOString(),seedCount,seeds:Array.from({length:seedCount},(_,i)=>1001+i*7919),fixtures,commonFixture:{pos:'mid',year:1,week:1,age:17,money:500000,fans:50,hp:100,stress:10,talent:1.15,perk:'none',fastSkip:false,relationships:'fresh no partner/flirt',league:'native random league; aca/pro team0 pro.str65 starter65, aca.str55'},method:'Actual baseline vs current native automatic season, native asks/cutscenes/achievements/economy/contracts and match calculations. Only DOM/audio/delay stubbed. Every weekly checkpoint equals saved JSON, resources finite, no pending input. Extra series RNG means same seed is not an identical future event trajectory.',boundaries:['90시즌씩 고정 미드/초기조건 비교이며 모든 사용자 세이브·포지션·특성을 전수검사하지 않는다.','기존 기록은 매치 단위로 보존한다. baseline은 실제 세트가 없어 actualSets=0으로 표시하며 허구의 세트 수를 만들지 않는다.','확률/팬/평점 집계와 추가 난수로 대진·업적·계약 결과가 달라질 수 있다. 개별 시즌의 완전 동일 상태 보존을 주장하지 않는다.','과거 CORE_MATCH/CORE_SEASON 보고서는 수정하지 않는다.'],summary,passed:runs.every(r=>r.passed),groups,comparisons,runs};
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
 console.log(JSON.stringify({sourceSha256:report.sourceSha256,sourceChangedDuringRun:report.sourceChangedDuringRun,passed:report.passed,summary,groups,failures:runs.filter(r=>!r.passed).map(r=>({version:r.version,fixture:r.fixture,strategy:r.strategy,seed:r.seed,error:r.error,result:r.result,errors:r.audit.errors})) ,output},null,2));if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
