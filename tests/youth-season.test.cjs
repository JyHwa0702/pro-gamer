const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('대표3인의 미성년 코스는 서로 다른 안전한 목표와 공개 장소를 가진다',()=>{
 const g=game();const titles=[];
 for(const hid of ['jieun','harin','mina']){const d=g.run(`getHeroineDates('${hid}')[0]`);titles.push(d.n);assert.ok(!d.sensual);assert.ok(d.youthScene);assert.ok(!/침실|밀착|스킨십/.test(d.dialogue+d.loc));}
 assert.equal(new Set(titles).size,3);
});
test('실제 준비 일정을 수행해야 약속 이행 선택이 열리며 후속 만남이 달라진다',async()=>{
 for(const hid of ['jieun','harin','mina']){
  const branches=[];
  for(const prepared of [false,true]){const g=game();g.run(`P.money=10000000;P.bonds.${hid}.unlocked=true;P.bonds.${hid}.aff=0;tryBeginFlirt('${hid}');checkBondMilestone=async()=>{};triggerDatingJackpot=async()=>false;`);
   await g.run(`performHeroineDate('${hid}',getHeroineDates('${hid}')[0].id)`);
   g.run(`P.week++;P.weeklyDates=0;${prepared?`advanceYouthPreparation({player:P,action:youthArcState('${hid}').task})`:''}`);
   const scene=g.run(`youthDatePresentation('${hid}')`);assert.equal(scene.options[0].tag,prepared?'promise-kept':'honest-reschedule');
   await g.run(`performHeroineDate('${hid}',getHeroineDates('${hid}')[0].id)`);
   branches.push(g.run(`youthDatePresentation('${hid}').title`));
   const before=g.run('P.money');assert.equal(await g.run(`performHeroineDate('${hid}',getHeroineDates('${hid}')[0].id)`),false);assert.equal(g.run('P.money'),before);
  }assert.notEqual(branches[0],branches[1]);
 }
});
test('검토된 안전 장면만 공통 경계를 통과하고 기존 성인 대사는 계속 차단된다',async()=>{
 const g=game();g.run('let shown="";ask=async html=>{shown=html;return 0;};showHeroineCutscene=__nativeCutscene;');
 await g.run(`showYouthPresentation('harin',youthDatePresentation('harin'))`);assert.match(g.run('shown'),/리플레이/);
 await g.run(`showHeroineCutscene('harin','<h4>비밀</h4><div class="vn-dialogue">미검증 성인 원문</div>')`);assert.ok(!g.run('shown').includes('미검증 성인 원문'));
});
test('청춘 마지막 장면 이후 성인이 되면 실제 평생 약속을 새로 확인한다',async()=>{
 const g=game();g.run("P.bonds.jieun.aff=100;tryBeginFlirt('jieun');confirmRelationship('jieun');");await g.run("checkBondMilestone('jieun')");
 g.run('P.bonds.jieun.storyChoices[4]=1;');const old=g.run('JSON.stringify(P.bonds.jieun.storyChoices)');g.run('P.age=19;P.year=3;let confirmed=0;showHeroineCutscene=async()=>{confirmed++;return 0;}');
 await g.run("checkBondMilestone('jieun')");assert.equal(g.run('P.bonds.jieun.adultLifetimePromise'),true);assert.equal(g.run('confirmed'),1);
 await g.run("checkBondMilestone('jieun')");assert.equal(g.run('confirmed'),1);assert.equal(g.run('JSON.stringify(P.bonds.jieun.storyChoices)'),old);assert.equal(g.run('P.bonds.jieun.adultLifetimeChoice'),0);
});
test('인연 장면을 기다리는 중 선수가 바뀌면 새 커리어의 주차를 진행하지 않는다',async()=>{
 const g=game();g.run("tryBeginFlirt('jieun');ensureSeasonJourney().opened=true;P.week=7;P.money=10000000;showHeroineCutscene=async()=>{P=makePlayer('새선수','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55});return 0;};");
 await g.run('runRecommendedTurn()');assert.equal(g.run('P.week'),1);assert.equal(g.run('P.lastAction'),undefined);assert.equal(g.run('P.weeklyBriefingHistory.length'),0);
});
test('추천은 선택한 썸과 약속한 실제 준비를 한 주 연결하며 조회로 상태를 바꾸지 않는다',async()=>{
 const g=game();g.run("tryBeginFlirt('jieun');P.money=10000000;checkBondMilestone=async()=>{};triggerDatingJackpot=async()=>false;ensureSeasonJourney().opened=true;");
 await g.run("performHeroineDate('jieun',getHeroineDates('jieun')[0].id)");g.run('P.week++;P.weeklyDates=0;P.hp=100;P.stress=0;');
 const before=g.run('JSON.stringify(P)');assert.equal(g.run('recommendationPlan().key'),'rest');assert.match(g.run('recommendationPlan().reason'),/약속/);assert.equal(g.run('JSON.stringify(P)'),before);
 await g.run('runRecommendedTurn()');assert.equal(g.run('P.bonds.jieun.youthArc.prepared'),true);
});
test('청춘 마일스톤Lv4는 성인 평생약속으로 기록하지 않는다',async()=>{
 const g=game();g.run("P.bonds.jieun.aff=100;tryBeginFlirt('jieun');confirmRelationship('jieun');");await g.run(`checkBondMilestone('jieun')`);
 assert.equal(g.run('P.bonds.jieun.lv'),4);assert.equal(g.run('P.bonds.jieun.adultLifetimePromise'),undefined);assert.equal(g.run('P.bonds.jieun.youthMilestones.includes(4)'),true);
});
test('누락·손상된 새 서사 필드는 기존5종 세이브의 관계·현금·장비를 보존한다',()=>{
 for(const key of ['proRoadSave_v4','proRoadSave_v3','proRoadSave_v2','proRoadSave_v1','progamer_save']){const g=game();const p=JSON.parse(JSON.stringify(g.run('P')));p.money=1234567;p.gear.oldSpecial=1;p.bonds.jieun.storyChoices={1:1};p.bonds.jieun.youthArc={step:'broken'};g.storage.set(key,JSON.stringify(p));g.run('P=load();youthArcState("jieun");save();P=load()');assert.equal(g.run('P.money'),1234567);assert.equal(g.run('P.gear.oldSpecial'),1);assert.equal(g.run('P.bonds.jieun.storyChoices[1]'),1);assert.equal(g.run('P.bonds.jieun.youthArc.step'),0);}
});
test('새 시즌 경계는 지난 진행장을 아카이브에 남기고 재로드 상태와 일치한다',async()=>{
 const g=game();g.run('P.week=26;save();P=load();');await g.run("takeTurn('rest')");assert.equal(g.run('P.seasonJourney'),null);
 const before=g.run('JSON.stringify(P)');g.run('P=load()');assert.equal(g.run('JSON.stringify(P)'),before);assert.equal(g.run('P.seasonArchive.length'),1);
});
test('시즌 결산은 당시 청춘 선택을 별도 스냅샷으로 남기며 재열람 때 현재 기억을 섞지 않는다',async()=>{
 const g=game();g.run("tryBeginFlirt('jieun');P.money=10000000;checkBondMilestone=async()=>{};triggerDatingJackpot=async()=>false;ensureSeasonJourney().opened=true;");
 await g.run("performHeroineDate('jieun',getHeroineDates('jieun')[0].id)");await g.run('finishSeasonJourney(P.seasonJourney)');
 assert.equal(g.run('P.seasonArchive[0].youthSummary.events[0].tag'),'shared-preparation');
 const before=g.run('renderSeasonJournal(P.seasonArchive[0])');g.run("P.bonds.jieun.youthArc.log[0].label='현재의 다른 선택'");assert.equal(g.run('renderSeasonJournal(P.seasonArchive[0])'),before);assert.match(before,/사진 전시/);
 assert.equal(g.run('renderSeasonYouthSummary({events:"손상"})'),'');
});
