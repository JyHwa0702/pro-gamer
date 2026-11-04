// 읽기 전용 실제 v2.8 단판 vs 실제 BO3/BO5. node tests/series-balance-simulation.cjs --n=2000
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {game}=require('./game-harness.cjs');
const root=path.resolve(__dirname,'..'),args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const n=args.n===undefined?2000:Number(args.n),seed=args.seed===undefined?102030:Number(args.seed);
if(!Number.isInteger(n)||n<1000||n>100000||!Number.isInteger(seed)||seed<0)throw Error('n은 1000~100000, seed는 음이 아닌 정수여야 합니다.');
const baselineRevision='b1707be8a78c2f0be4c8eae618fc9bcdb755238e';
const before=execFileSync('git',['show',baselineRevision+':index.html'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}),after=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const output=args.output?path.resolve(args.output):path.join(root,'docs/reports/SERIES_BALANCE_2026-11-05.json');
async function sample(source,pos,skill,bestOf){
 const g=game(seed,source);
 g.run('checkHeroineUnlocks=async()=>{};');
 return await g.run(`(async()=>{
  const totals={wins:0,pog:0,rating:0,ratingSquared:0,fanDelta:0,moneyDelta:0,hpDelta:0,stressDelta:0,mechDelta:0,mentalDelta:0,teamDelta:0,totalSets:0,totalRawP:0,totalEffectiveP:0,championCount:0},errors=[],scoreCounts={},ratingBuckets={'below5':0,'5to7':0,'7to8.3':0,'8.3plus':0},phaseCounts={},pogSweep=Object.fromEntries(Array.from({length:11},(_,i)=>[(1+i/10).toFixed(1),0])),pogCandidateDistribution={};
  for(let i=0;i<${n};i++){
   P=makePlayer('다전제실험','${pos}',{mech:${skill},lane:${skill},macro:${skill},team:${skill},pool:${skill},mental:${skill}});P.stage='pro';P.teamId=0;P.pro[0].str=65;P.syn=0;P.hp=100;P.stress=0;
   const initialFans=P.fans,initialMoney=P.money;
   const r=await playMatch({name:'고정상대',str:65},'LCK 스프링 1라운드',false,true${bestOf?`,{bestOf:${bestOf}}`:''});
   const points=Object.values(P.champs || {}).reduce((sum,c)=>sum+c.pts,0),setCount=r.sets?.length || 1;
   const metrics={wins:+r.win,pog:P.hist.mvp,rating:r.rating,ratingSquared:r.rating*r.rating,fanDelta:P.fans-initialFans,moneyDelta:P.money-initialMoney,hpDelta:P.hp-100,stressDelta:P.stress,mechDelta:P.s.mech-${skill},mentalDelta:P.s.mental-${skill},teamDelta:P.s.team-${skill},totalSets:setCount,championCount:new Set((r.sets || [{championId:P.currentChamp.id}]).map(s=>s.championId)).size};
   if(r.sets)for(const s of r.sets){metrics.totalRawP=(metrics.totalRawP || 0)+(s.rawWinProb || 0);metrics.totalEffectiveP=(metrics.totalEffectiveP || 0)+(s.effectiveWinProb || 0);}
   if(r.sets){const candidates=r.sets.filter(s=>s.rating>=8.3&&s.phaseWins>=2).length,ratio=candidates/r.sets.length,key=(r.win?'win:':'loss:')+candidates+'/'+r.sets.length;pogCandidateDistribution[key]=(pogCandidateDistribution[key] || 0)+1;for(const k of Object.keys(pogSweep))pogSweep[k]+=r.win?Math.min(Number(k)*ratio,1):0;}
   for(const [key,value] of Object.entries(metrics))totals[key]+=value;
   const score=r.mySetW+':'+r.mySetL;scoreCounts[score]=(scoreCounts[score] || 0)+1;
   ratingBuckets[r.rating<5?'below5':r.rating<7?'5to7':r.rating<8.3?'7to8.3':'8.3plus']++;
   const phase=r.phaseWins;phaseCounts[phase]=(phaseCounts[phase] || 0)+1;
   const bad=!Object.values(metrics).every(Number.isFinite)||points!==100||P.hp!==92||P.hist.games!==1||P.ratings.length!==1||currentAskResolve!==null${bestOf?`||setCount<${(bestOf+1)/2}||setCount>${bestOf}||Math.max(r.mySetW,r.mySetL)!==${(bestOf+1)/2}||r.mySetW+r.mySetL!==setCount`:''};
   if(bad&&errors.length<10)errors.push({i,points,hp:P.hp,histGames:P.hist.games,ratings:P.ratings.length,pending:!!currentAskResolve,setCount,result:r});
  }
  return {n:${n},wins:totals.wins,winRate:totals.wins/${n},pogRate:totals.pog/${n},meanRating:totals.rating/${n},ratingStdDev:Math.sqrt(Math.max(0,totals.ratingSquared/${n}-(totals.rating/${n})**2)),meanFanDelta:totals.fanDelta/${n},meanMoneyDelta:totals.moneyDelta/${n},meanHpDelta:totals.hpDelta/${n},meanStressDelta:totals.stressDelta/${n},meanMechDelta:totals.mechDelta/${n},meanMentalDelta:totals.mentalDelta/${n},meanTeamDelta:totals.teamDelta/${n},meanSets:totals.totalSets/${n},meanDistinctChampions:totals.championCount/${n},meanRawP:totals.totalRawP/totals.totalSets,meanEffectiveP:totals.totalEffectiveP/totals.totalSets,scoreCounts,ratingBuckets,phaseCounts,pogSweep:Object.fromEntries(Object.entries(pogSweep).map(([k,v])=>[k,v/${n}])),pogCandidateDistribution,errors};
 })()`);
}
(async()=>{
 const fixtures=[];
 for(const pos of ['top','jg','mid','adc','sup'])for(const skill of [55,65,75]){
  const baseline=await sample(before,pos,skill,null),bo3=await sample(after,pos,skill,3),bo5=await sample(after,pos,skill,5);
  const compare=result=>({winRateDifference:result.winRate-baseline.winRate,absoluteWinRateDifference:Math.abs(result.winRate-baseline.winRate),withinFivePercentagePoints:Math.abs(result.winRate-baseline.winRate)<=.05,equalSkillWithin45To60:skill===65?result.winRate>=.45&&result.winRate<=.60:null,pogRateDifference:result.pogRate-baseline.pogRate,meanRatingDifference:result.meanRating-baseline.meanRating,ratingStdDevRatio:result.ratingStdDev/baseline.ratingStdDev,fanDeltaDifference:result.meanFanDelta-baseline.meanFanDelta,fanDeltaRatio:baseline.meanFanDelta?result.meanFanDelta/baseline.meanFanDelta:null,mechDeltaDifference:result.meanMechDelta-baseline.meanMechDelta,mentalDeltaDifference:result.meanMentalDelta-baseline.meanMentalDelta,teamDeltaDifference:result.meanTeamDelta-baseline.meanTeamDelta,resourceBudgetValid:result.errors.length===0});
  fixtures.push({pos,skill,baseline,bo3,bo5,comparison:{bo3:compare(bo3),bo5:compare(bo5)}});
 }
 const summary=[3,5].map(bestOf=>{const key='bo'+bestOf,comparisons=fixtures.map(f=>f.comparison[key]),worst=fixtures.reduce((a,b)=>a.comparison[key].absoluteWinRateDifference>b.comparison[key].absoluteWinRateDifference?a:b);return {bestOf,nPerFixture:n,series:15*n,maxAbsoluteWinRateDifference:worst.comparison[key].absoluteWinRateDifference,meanAbsoluteWinRateDifference:comparisons.reduce((sum,c)=>sum+c.absoluteWinRateDifference,0)/15,worstFixture:{pos:worst.pos,skill:worst.skill},allWithinFivePercentagePoints:comparisons.every(c=>c.withinFivePercentagePoints),allEqualSkillWithin45To60:comparisons.every(c=>c.equalSkillWithin45To60!==false),allResourceBudgetsValid:comparisons.every(c=>c.resourceBudgetValid)};});
 const pogCalibration=[];for(const bestOf of [3,5])for(const k of Array.from({length:11},(_,i)=>(1+i/10).toFixed(1))){const rows=fixtures.map(f=>({pos:f.pos,skill:f.skill,baseline:f.baseline.pogRate,expected:f['bo'+bestOf].pogSweep[k]})).map(r=>({...r,error:r.expected-r.baseline}));for(const scope of ['all15','equal65']){const cases=scope==='all15'?rows:rows.filter(r=>r.skill===65);pogCalibration.push({bestOf,k:Number(k),scope,maxAbsoluteError:Math.max(...cases.map(r=>Math.abs(r.error))),meanAbsoluteError:cases.reduce((n,r)=>n+Math.abs(r.error),0)/cases.length,meanSignedError:cases.reduce((n,r)=>n+r.error,0)/cases.length,meanBaseline:cases.reduce((n,r)=>n+r.baseline,0)/cases.length,meanExpected:cases.reduce((n,r)=>n+r.expected,0)/cases.length,rows:cases});}}
 const report={baselinePath:'git:'+baselineRevision+':index.html',baselineSha256:sha(before),sourceFile:'index.html',sourceSha256:sha(after),sourceChangedDuringRun:sha(after)!==sha(fs.readFileSync(path.join(root,'index.html'),'utf8')),generatedAt:new Date().toISOString(),seed,nPerFixture:n,totalBaselineMatches:15*n,totalNewSeries:30*n,
  method:'Actual baseline and actual new client through tests/game-harness.cjs, fresh player each match/series. Native draft, QTE and settlement. Achievements/unlocks disabled to isolate the match calculation. Same continuous seeded PRNG per fixture; samples are not paired identical RNG traces because actual series consume additional random draws.',
  fixture:{stage:'pro',teamId:0,teamStrength:65,opponentStrength:65,stats:'all six 55/65/75',hp:100,stress:0,syn:0,mastery:'fresh lv1',fans:50,money:500000,perk:'none',talent:'default 1',big:false,automatic:true},
  boundaries:['실제 시리즈 정지·드래프트·QTE·대표 보상 세트·평균 평점을 실행한다.','100숙련/체력8/매치1회 기록을 매 실행 검증한다.','실제 유저 세이브·큰 경기·스킨·특성·부상 조건·브라우저 동작을 전수 보장하지 않는다.','평균 평점의 분산 감소와 대표 세트 POG는 의도한 집계 방식이며 확률 보정만으로 기존 분포와 동일해지지 않는다.'],
  summary,pogCalibration,passed:summary.every(s=>s.allWithinFivePercentagePoints&&s.allEqualSkillWithin45To60&&s.allResourceBudgetsValid),fixtures};
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
 console.log(JSON.stringify({sourceSha256:report.sourceSha256,sourceChangedDuringRun:report.sourceChangedDuringRun,totalBaselineMatches:report.totalBaselineMatches,totalNewSeries:report.totalNewSeries,summary,passed:report.passed,fixtures:fixtures.map(f=>({pos:f.pos,skill:f.skill,baselineWin:f.baseline.winRate,bo3Win:f.bo3.winRate,bo5Win:f.bo5.winRate,baselineFan:f.baseline.meanFanDelta,bo3Fan:f.bo3.meanFanDelta,bo5Fan:f.bo5.meanFanDelta,baselinePog:f.baseline.pogRate,bo3Pog:f.bo3.pogRate,bo5Pog:f.bo5.pogRate,baselineRating:f.baseline.meanRating,bo3Rating:f.bo3.meanRating,bo5Rating:f.bo5.meanRating})),output},null,2));
 if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
