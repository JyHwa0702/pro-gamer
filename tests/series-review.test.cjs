const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));
function setup(g){
  g.run("P.stage='pro';P.teamId=0;P.syn=0;P.pro[0].str=65;for(const k of Object.keys(P.s))P.s[k]=65;checkHeroineUnlocks=async()=>{};");
}
function fixedSets(g){
  g.run("playSingleSet=async()=>({win:true,rating:8.5,phaseWins:3,adv:2,championId:'azir',effects:{stats:{mech:2},stress:3},autoContinue:true,draft:null,kda:{kills:1,deaths:0,assists:1}});");
}
test('재로드는 시퀀스를 유효 기록에서 복원하며 완료 결과의 재호출로 보상하지 않는다',async()=>{
  const g=game();setup(g);fixedSets(g);await g.run("playMatch({name:'상대',str:65},'리그',false,true,{bestOf:3})");
  g.run('delete P.seriesSequence;save();P=load();');assert.equal(g.run('P.seriesSequence'),1);
  const before=g.run('JSON.stringify(P)');g.run('commitSeriesResult(P.seriesHistory[0]);');assert.equal(g.run('JSON.stringify(P)'),before);
  await g.run("playMatch({name:'다음 상대',str:65},'리그',false,true,{bestOf:3})");assert.equal(g.run('P.seriesHistory.at(-1).seq'),2);assert.equal(g.run('P.hist.games'),2);
});
test('다른 선수의 완료 결과를 새 선수에게 정산하지 않는다',async()=>{
  const g=game();setup(g);fixedSets(g);await g.run("playMatch({name:'상대',str:65},'리그',false,true,{bestOf:3})");
  g.run("let oldReceipt=P.seriesHistory[0];P=makePlayer('새 커리어','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55});");
  const before=g.run('JSON.stringify(P)');assert.equal(g.run('commitSeriesResult(oldReceipt)'),null);assert.equal(g.run('JSON.stringify(P)'),before);
});
test('120개 초과 이후에도 누적 시리즈·숙련 예산은 실제 실행 횟수와 일치한다',async()=>{
  const g=game();setup(g);fixedSets(g);
  for(let i=0;i<122;i++)await g.run("playMatch({name:'상대',str:65},'리그',false,true,{bestOf:3})");
  assert.equal(g.run('P.seriesHistory.length'),120);assert.equal(g.run('P.seriesSequence'),122);assert.equal(g.run('P.hist.games'),122);assert.equal(g.run('P.ratings.length'),122);
  assert.equal(g.run('Object.values(P.champs).reduce((n,c)=>n+c.pts,0)'),12200);
  g.run('save();P=load();');assert.equal(g.run('P.seriesSequence'),122);assert.equal(g.run('P.seriesHistory[0].seq'),3);
});
test('이미 계산된 QTE 성장 delta에는 주택·특성 배율을 다시 적용하지 않는다',async()=>{
  const g=game();setup(g);fixedSets(g);g.run("P.perk='love';P.house='house_castle';P.car='car_rolls';P.bonds.harin.aff=100;");
  const mech=g.run('P.s.mech');await g.run("playMatch({name:'상대',str:65},'리그',false,true,{bestOf:5})");assert.equal(g.run('P.s.mech'),mech+2);
});
test('실제 세트 QTE 중 저장 호출은 시리즈 시작 전 체크포인트를 유지한다',async()=>{
  const g=game(43);setup(g);g.run("let savedDuringQte=null;Math.random=()=>.25;triggerClutchQTE=async()=>{grow('mech',2);stressAdd(12);save();savedDuringQte=JSON.parse(localStorage.getItem(SAVE));return {adv:2.5,kills:2,assists:1,success:true};};");
  const before=plain(g.run('P'));await g.run("playMatch({name:'상대',str:65},'리그',false,true,{bestOf:3})");
  assert.ok(g.run('savedDuringQte'));assert.deepEqual(plain(g.run('savedDuringQte.s')),before.s);assert.equal(g.run('savedDuringQte.stress'),before.stress);assert.equal(g.run('savedDuringQte.hist.games'),before.hist.games);
  assert.equal(g.run('JSON.parse(localStorage.getItem(SAVE)).hist.games'),1);
});
test('구세이브의 자산·계약·평점·아카이브는 새 시리즈 필드 손상만으로 초기화되지 않는다',()=>{
  for(const key of ['proRoadSave_v4','proRoadSave_v3','proRoadSave_v2','proRoadSave_v1','progamer_save']){
    const g=game();setup(g);g.run("P.money=1234567;P.ratings=[9,7,4];P.customLegacy={keep:true};P.seriesHistory=[{bad:true}];P.seriesSequence=null;");
    const before=plain(g.run('P'));g.storage.set(key,JSON.stringify(before));g.run('P=load();');
    assert.equal(g.run('P.money'),1234567);assert.deepEqual(plain(g.run('P.ratings')),[9,7,4]);assert.deepEqual(plain(g.run('P.customLegacy')),{keep:true});assert.equal(g.run('P.seriesSequence'),0);assert.deepEqual(plain(g.run('P.seriesHistory')),[]);assert.deepEqual(plain(g.run('P.contractBonusHistory')),before.contractBonusHistory);assert.deepEqual(plain(g.run('P.seasonArchive')),before.seasonArchive);
  }
});
test('단일 세트의 임시 QTE 성장은 업적의 영구 보상·수령 표시를 먼저 만들지 않는다',async()=>{
  const g=game();setup(g);g.run("P.bestT=6;P.achieves=Object.fromEntries(ACHIEVES.map(a=>[a.k,1]));delete P.achieves.a_dia;checkAchievements=__nativeAchievements;Math.random=()=>.25;");
  const before=plain(g.run('({money:P.money,s:P.s,achieves:P.achieves})'));
  await g.run("playSingleSet({name:'상대',str:65},'단일 세트',false,true,{bestOf:3})");
  assert.deepEqual(plain(g.run('({money:P.money,s:P.s,achieves:P.achieves})')),before);assert.equal(g.run('P.hist.games'),0);
});
test('대표 QTE가 없는 세트를 정산해도 보류한 업적 성장과 돈은 최종 시리즈에서 한 번 지급된다',async()=>{
  const g=game();setup(g);g.run("P.bestT=6;P.achieves=Object.fromEntries(ACHIEVES.map(a=>[a.k,1]));delete P.achieves.a_dia;checkAchievements=__nativeAchievements;Math.random=()=>.25;let nativeSet=playSingleSet,reviewSetCount=0;playSingleSet=async(...args)=>{if(reviewSetCount++===0){const s=await nativeSet(...args);return {...s,win:true};}Math.random=()=>.99;return {win:true,rating:8.5,phaseWins:3,adv:2,championId:'azir',effects:{stats:{},stress:0},autoContinue:true,draft:null,kda:{kills:1,deaths:0,assists:1}};};");
  const money=g.run('P.money');await g.run("playMatch({name:'상대',str:65},'리그',false,true,{bestOf:3})");
  assert.equal(g.run('P.seriesHistory[0].rewardSetIndex'),1);assert.equal(g.run('P.money'),money+1000000);assert.ok(g.run('P.s.mental')>66.5,'업적 멘탈 +2가 비대표 QTE 효과에 섞여 사라지면 안 된다');
  const before=g.run('JSON.stringify(P)');g.run('commitSeriesResult(P.seriesHistory[0]);checkAchievements();');assert.equal(g.run('JSON.stringify(P)'),before);
});
