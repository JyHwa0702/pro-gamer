// 실제 클라이언트 자동 시즌 3전략 x 3시작상태 x 10시드. 앱 소스는 수정하지 않는다.
// node tests/core-season-simulation.cjs --seed-count=10
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {game}=require('./game-harness.cjs');
const root=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const seedCount=args['seed-count']===undefined?10:Number(args['seed-count']);
if(!Number.isInteger(seedCount)||seedCount<1||seedCount>100)throw Error('seed-count는 1~100 정수여야 합니다.');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sourceSha256=crypto.createHash('sha256').update(source).digest('hex');
const fixtureDefinitions=[{name:'ama30',stage:'ama',skill:30,mental:55,salary:'0',teamId:-1},{name:'aca55',stage:'aca',skill:55,mental:65,salary:'salaryFor(P.aca[0]) = 300000',teamId:0},{name:'pro65',stage:'pro',skill:65,mental:65,salary:'salaryFor(P.pro[0]) = 4850000 at start',teamId:0}];
const output=args.output?path.resolve(args.output):path.join(root,'docs/reports/CORE_SEASON_BALANCE_2026-11-04.json');
(async()=>{
 const runs=[];
 for(const fixture of fixtureDefinitions)for(const strategy of ['career','growth','balanced'])for(let seedIndex=0;seedIndex<seedCount;seedIndex++){
  const seed=1001+seedIndex*7919,g=game(seed,source);
  g.run(`P=makePlayer('시즌실험','mid',{mech:${fixture.skill},lane:${fixture.skill},macro:${fixture.skill},team:${fixture.skill},pool:${fixture.skill},mental:${fixture.mental}});P.stage='${fixture.stage}';P.teamId=${fixture.teamId};P.talent=1.15;P.fastSkip=false;
   if(P.stage!=='ama'){P.pro[0].str=65;P.pro[0].starter=65;P.aca[0].str=55;P.salary=salaryFor(myTeam());}
   globalThis.seasonAudit={asks:0,prompts:0,checkpoints:[],errors:[]};
   ask=(html,buttons)=>{seasonAudit.asks++;return __nativeAsk(html,buttons)};
   renderButtons=()=>{seasonAudit.prompts++;throw Error('완전자동에서 화면 선택 대기가 발생했습니다.');};
   showHeroineCutscene=__nativeCutscene;checkAchievements=__nativeAchievements;
   autoYield=async()=>{
    const raw=localStorage.getItem(SAVE),saved=raw?JSON.parse(raw):null;
    const numeric=[P.money,P.hp,P.stress,P.fans,P.salary,ovr(),...Object.values(P.s)];
    const checkpoint={year:P.year,week:P.week,action:P.lastAction,stage:P.stage,ovr:ovr(),money:P.money,hp:P.hp,stress:P.stress,fans:P.fans,games:P.hist.games,wins:P.hist.wins,salary:P.salary,fastSkip:P.fastSkip,pending:!!currentAskResolve,busy,activeTurn:!!activeWeekBriefing,allFinite:numeric.every(Number.isFinite),savedEqual:raw===JSON.stringify(P),savedYear:saved?.year,savedWeek:saved?.week,savedFastSkip:saved?.fastSkip};
    if(!checkpoint.allFinite || checkpoint.pending || checkpoint.busy || checkpoint.activeTurn || !checkpoint.savedEqual || checkpoint.savedFastSkip!==false)seasonAudit.errors.push({type:'checkpoint',checkpoint});
    seasonAudit.checkpoints.push(checkpoint);
   };
  `);
  const before=g.run('({year:P.year,week:P.week,stage:P.stage,ovr:ovr(),money:P.money,salary:P.salary,hp:P.hp,stress:P.stress,fans:P.fans,stats:{...P.s}})');
  let result,error=null;try{result=await g.run(`startAutomaticSeason({strategy:'${strategy}',interactive:false,maxWeeks:26})`);}catch(e){error=String(e.stack || e);}
  const after=g.run('({year:P.year,week:P.week,stage:P.stage,teamId:P.teamId,ovr:ovr(),money:P.money,salary:P.salary,hp:P.hp,stress:P.stress,fans:P.fans,games:P.hist.games,wins:P.hist.wins,rank:{...P.rank},titles:[...P.hist.titles],achievements:Object.keys(P.achieves),stats:{...P.s},fastSkip:P.fastSkip,pending:!!currentAskResolve,busy,automatic:!!automaticSeason,briefings:P.weeklyBriefingHistory.length,seasonArchive:P.seasonArchive.map(s=>({year:s.year,focus:s.focus,goal:s.goal,contactWeeks:s.contactWeeks,trainingWeeks:s.trainingWeeks})),archiveCount:P.seasonArchive.length})');
  const audit=g.run('seasonAudit');
  const completed=!!(result?.weeks===26&&after.year===2&&after.week===1);
  const passed=completed&&!error&&!audit.errors.length&&!audit.prompts&&!after.pending&&!after.busy&&!after.automatic&&after.fastSkip===false&&audit.checkpoints.length===26;
  runs.push({fixture:fixture.name,strategy,seed,before,result,error,after,audit,passed});
 }
 const groups=[];
 for(const fixture of fixtureDefinitions)for(const strategy of ['career','growth','balanced']){
  const group=runs.filter(r=>r.fixture===fixture.name&&r.strategy===strategy),mean=key=>group.reduce((sum,r)=>sum+r.after[key],0)/group.length;
  const totalGames=group.reduce((n,r)=>n+r.after.games,0);
  groups.push({fixture:fixture.name,strategy,runs:group.length,passed:group.filter(r=>r.passed).length,stages:Object.fromEntries(['ama','aca','pro'].map(s=>[s,group.filter(r=>r.after.stage===s).length])),meanOvr:mean('ovr'),meanOvrGain:group.reduce((sum,r)=>sum+r.after.ovr-r.before.ovr,0)/group.length,meanMoney:mean('money'),minMoney:Math.min(...group.map(r=>r.after.money)),meanFans:mean('fans'),meanGames:mean('games'),winRate:totalGames?group.reduce((n,r)=>n+r.after.wins,0)/totalGames:null,actions:group.flatMap(r=>r.audit.checkpoints).reduce((counts,w)=>{counts[w.action]=(counts[w.action] || 0)+1;return counts;},{})});
 }
 const report={sourceFile:'index.html',sourceSha256,generatedAt:new Date().toISOString(),seedCount,seeds:Array.from({length:seedCount},(_,i)=>1001+i*7919),plannedRuns:9*seedCount,plannedWeeks:9*seedCount*26,totalCompletedWeeks:runs.reduce((n,r)=>n+(r.result?.weeks || 0),0),passed:runs.every(r=>r.passed),passedRuns:runs.filter(r=>r.passed).length,
  fixtures:fixtureDefinitions,commonFixture:{pos:'mid',year:1,week:1,age:17,money:500000,fans:50,hp:100,stress:10,talent:1.15,perk:'none',fastSkip:false,relationships:'fresh player, no partner/flirt selected',league:'native seeded newLeague; aca/pro home team pro0.str65 starter65 and aca0.str55; other teams native'},
  method:'Actual index.html through VM harness. Native ask policy, native cutscenes, native achievements, automatic schedule, weekly economy, league and match/QTE all run. DOM rendering/audio/sleeps stubbed; autoYield captures every completed weekly save checkpoint without consuming RNG. No candidate source or source-patch dependency.',
  boundaries:['10개 고정 시드·미드 포지션·특성 없음의 초기 상태 비교이며 모든 플레이 스타일을 보장하지 않는다.','능력별 시작 급여와 소속을 명시한 고정 시뮬레이션이며 실제 선수 성장/연봉 통계가 아니다.','브라우저 프레임·실제 기기·사람이 느끼는 재미·세트별 피어리스는 검증 범위 밖이다.'],groups,runs};
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
 console.log(JSON.stringify({sourceSha256,passed:report.passed,passedRuns:report.passedRuns,totalCompletedWeeks:report.totalCompletedWeeks,groups,failures:runs.filter(r=>!r.passed).map(r=>({fixture:r.fixture,strategy:r.strategy,seed:r.seed,error:r.error,errors:r.audit.errors,prompts:r.audit.prompts,result:r.result})),output},null,2));
 if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
