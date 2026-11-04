const {test}=require('node:test'),assert=require('node:assert/strict'),{game}=require('./game-harness.cjs');
const setup=g=>g.run("P.stage='pro';P.teamId=0;P.syn=0;P.pro[0].str=65;for(const k of Object.keys(P.s))P.s[k]=65;checkHeroineUnlocks=async()=>{};");
const scripted=(g,outcomes)=>g.run(`let setCalls=0;playSingleSet=async()=>{const win=${JSON.stringify(outcomes)}[setCalls++];return {win,rating:win?8.5:4.5,phaseWins:win?3:1,adv:win?2:-2,championId:'azir',effects:{stats:{},stress:0},autoContinue:true,draft:null,kda:{kills:1,deaths:1,assists:1}};};`);
test('실제 BO3는 2승에 종료하고 허구의 나머지 세트를 만들지 않는다',async()=>{
 const g=game();setup(g);scripted(g,[true,true,false]);const r=await g.run("playMatch({name:'상대',str:65},'정규리그',false,true,{bestOf:3})");
 assert.equal(g.run('setCalls'),2);assert.equal(r.mySetW,2);assert.equal(r.mySetL,0);assert.equal(r.sets.length,2);assert.equal(g.run('P.hist.games'),1);assert.equal(g.run('P.ratings.length'),1);
});
test('실제 BO5는 두 세트 패배 후 세 번 승리하면 3:2 역전으로 확정한다',async()=>{
 const g=game();setup(g);scripted(g,[false,false,true,true,true]);const r=await g.run("playMatch({name:'상대',str:65},'결승',true,true,{bestOf:5})");
 assert.equal(r.mySetW,3);assert.equal(r.mySetL,2);assert.equal(r.win,true);assert.equal(r.sets.length,5);assert.equal(r.rating,6.9);assert.equal(g.run('P.hp'),92);assert.equal(g.run("Object.values(P.champs).reduce((n,c)=>n+c.pts,0)"),100);
});
test('시리즈의 중복 정산은 경기·체력·평점·성과급을 다시 변경하지 않는다',async()=>{
 const g=game();setup(g);scripted(g,[true,true]);await g.run("playMatch({name:'상대',str:65},'정규리그',false,true,{bestOf:3})");const before=g.run('JSON.stringify(P)');g.run('commitSeriesResult(P.seriesHistory[0])');assert.equal(g.run('JSON.stringify(P)'),before);
});
test('기본 시리즈는 선택 입력 없이 실제 세트를 끝내며 자동 선택을 저장 설정에 강요하지 않는다',async()=>{
 const g=game(3);setup(g);g.run("ask=__nativeAsk;showHeroineCutscene=__nativeCutscene;renderButtons=()=>{throw Error('기본 경기에서 입력 대기')};");
 const r=await g.run("playMatch({name:'상대',str:65},'정규리그')");assert.ok(r.sets.length>=2&&r.sets.length<=3);assert.equal(g.run('currentAskResolve'),null);assert.equal(g.run('P.seriesPreferences.control'),'auto');
});
test('신규 세트 기록의 손상 항목만 제외하고 과거 경기·평가·계약은 보존한다',()=>{
 const g=game();g.run("P.hist.games=123;P.ratings=[9,7,4];P.seriesHistory=[{broken:true}];const old=JSON.stringify(P.hist);localStorage.setItem(SAVE,JSON.stringify(P));P=load();");
 assert.equal(g.run('P.hist.games'),123);assert.equal(g.run('P.ratings.join()'),'9,7,4');assert.equal(g.run('validSeriesHistory(P.seriesHistory).length'),0);assert.equal(g.run('careerPerformance().average'),20/3);assert.equal(g.run('careerPerformance().recent'),20/3);
});
test('구간 승률 보정은 대칭·단조이며 BO3/BO5에서 단판 우세의 과도한 증폭을 막는다',()=>{
 const g=game();for(const bo of [3,5]){let last=0;for(const p of [.05,.2,.5,.8,.95]){const q=g.run(`seriesSetProbability(${p},${bo})`);assert.ok(q>last);assert.ok(Math.abs(q+g.run(`seriesSetProbability(${1-p},${bo})`)-1)<1e-6);last=q;}assert.equal(g.run(`seriesSetProbability(.5,${bo})`),.5);}
});
test('기존 초월 능력치 155는 0변화 효과를 정산해도 내려가지 않는다',async()=>{
 const g=game();setup(g);g.run('P.s.mech=155');scripted(g,[true,true]);await g.run("playMatch({name:'상대',str:65},'정규리그',false,true)");assert.equal(g.run('P.s.mech'),155);
});
test('QTE 선택 중 선수가 교체되면 새 선수에게 성장·스트레스를 적용하지 않는다',async()=>{
 const g=game();g.run("let replacement='';ask=async()=>{P=makePlayer('새 선수','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55});replacement=JSON.stringify(P);return 0;};");
 await assert.rejects(g.run('triggerClutchQTE(false)'));assert.equal(g.run('JSON.stringify(P)'),g.run('replacement'));
});
test('최근 120개 밖으로 밀린 과거 시리즈도 다시 정산되지 않는다',async()=>{
 const g=game();setup(g);scripted(g,[true,true]);await g.run("playMatch({name:'상대',str:65},'정규리그',false,true)");g.run('let evicted=P.seriesHistory[0];P.seriesHistory=[];');const before=g.run('JSON.stringify(P)');assert.equal(g.run('commitSeriesResult(evicted)'),null);assert.equal(g.run('JSON.stringify(P)'),before);
});
test('계약 당시 성과 스냅샷은 이후 평점/팀 기준 변화로 다시 계산되지 않는다',()=>{
 const g=game();setup(g);g.run("P.ratings=[9,9,9,4,4,4];let from=careerClub(),evidence={performance:careerPerformance(),offeredThreshold:70,offeredClub:{...from}};recordCareerContract(from,'transfer',evidence);P.ratings=[1];P.pro[0].starter=90;");assert.equal(g.run('P.career.contracts[0].evidence.performance.average'),6.5);assert.equal(g.run('P.career.contracts[0].evidence.performance.recent'),4);assert.equal(g.run('P.career.contracts[0].evidence.offeredThreshold'),70);
});
test('시즌 결산은 실제 세트 수와 계약 근거를 완료 당시 스냅샷으로 보관한다',async()=>{
 const g=game();setup(g);g.run('let journey=ensureSeasonJourney();journey.opened=true;');scripted(g,[true,true]);await g.run("playMatch({name:'상대',str:65},'정규리그',false,true)");await g.run('finishSeasonJourney(journey)');assert.equal(g.run('P.seasonArchive[0].seriesSummary.series'),1);assert.equal(g.run('P.seasonArchive[0].seriesSummary.setWins'),2);g.run('P.seriesHistory=[];P.ratings=[1]');assert.equal(g.run('P.seasonArchive[0].seriesSummary.setWins'),2);
});
test('실제 BO5 정산의 POG 성과급은 한 번만 지급하고 재로드·재열람에 재지급하지 않는다',async()=>{
 const g=game();setup(g);scripted(g,[true,true,true]);g.run("P.contractBonus={...contractBonusTerms(300000),year:P.year,signedWeek:P.week,teamId:P.teamId,stage:P.stage,startGames:0,paid:0};");const before=g.run('P.money');
 await g.run("playMatch({name:'상대',str:65},'결승',true,true,{bestOf:5})");assert.equal(g.run('P.money')-before,30000);assert.equal(g.run('P.contractBonusHistory.length'),1);assert.equal(g.run('P.hist.mvp'),1);
 g.run('save();P=load();');const saved=g.run('JSON.stringify(P)');g.run('commitSeriesResult(P.seriesHistory[0]);renderSeriesDetails(P.seriesHistory[0]);');assert.equal(g.run('JSON.stringify(P)'),saved);
});
