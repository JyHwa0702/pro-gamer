const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game:baseGame}=require('./game-harness.cjs');
// 이 파일은 명시적으로 썸을 선택한 선수의 추천 일정·기회비용을 검사한다.
function game(...args){const g=baseGame(...args);assert.equal(g.run("tryBeginFlirt('jieun').ok"),true);return g;}
const plain=v=>JSON.parse(JSON.stringify(v));

test('균형 목표 소통은 시즌에 분산되고 이미 소통한 주에는 중복 추천하지 않는다',()=>{
  const g=game();g.run("const s=ensureSeasonJourney();s.opened=true;s.focus='balance';P.week=7;P.hp=100;P.stress=0;");
  assert.equal(g.run('recommend()'),'date');
  const plan=plain(g.run('recommendationPlan()'));
  assert.equal(plan.date.hid,'jieun');assert.ok(plan.reason.includes('소통'));assert.ok(plan.date.cost<=g.run('P.money'));
  g.run("recordSeasonContact('jieun')");assert.notEqual(g.run('recommend()'),'date');
  g.run('P.week=8');assert.notEqual(g.run('recommend()'),'date');
  g.run('P.week=14');assert.equal(g.run('recommend()'),'date');
});

test('지갑에 맞는 실제 코스만 추천하고 횟수·체력 경계를 지킨다',()=>{
  const g=game();g.run("P.stress=90;P.hp=60;const cheapest=Math.min(...getHeroineDates('jieun').map(d=>d.c));P.money=cheapest-1");
  assert.equal(g.run('recommend()'),'rest');
  g.run("P.money=cheapest;P.weeklyDates=0");const plan=plain(g.run('recommendationPlan()'));
  assert.equal(plan.key,'date');assert.equal(plan.date.cost,g.run(`getHeroineDates('${plan.date.hid}').find(d=>(d.id||d.n)==='${plan.date.dateId}').c`));
  g.run('P.weeklyDates=1');assert.equal(g.run('recommend()'),'rest');
  g.run('P.weeklyDates=0;P.hp=7');assert.equal(g.run('recommend()'),'rest');
});

test('다른 인물이 미해금이어도 선택한 썸의 가능한 코스를 안내하고 비용은 방송 일정으로 마련한다',()=>{
  const g=game();g.run("const s=ensureSeasonJourney();s.opened=true;s.companion='harin';P.week=7;P.hp=100;P.stress=0;P.money=50000");
  assert.equal(g.run('recommendationPlan().date.hid'),'jieun');
  g.run('P.money=0');const plan=plain(g.run('recommendationPlan()'));assert.equal(plan.key,'stream');assert.ok(plan.reason.includes('비용'));assert.ok(g.run('ACTS.some(a=>a.k===recommend() && !a.cost)'));
});

test('기본기 목표는 솔랭 조건보다 핵심 훈련을 먼저 채우고 추천 조회는 상태·난수 불변',()=>{
  const a=game(77),b=game(77);for(const g of [a,b])g.run("const s=ensureSeasonJourney();s.opened=true;s.focus='foundation';P.s={mech:80,lane:80,macro:80,team:80,pool:80,mental:80};");
  const before=JSON.stringify(a.run('P'));assert.ok(['lane','mech','vod','pool'].includes(a.run('recommend()')));assert.ok(a.run('recommendationPlan().reason').includes('기본기'));assert.equal(JSON.stringify(a.run('P')),before);assert.equal(a.run('Math.random()'),b.run('Math.random()'));
});

test('실제 정규시즌 상대의 전력차만 설명하고 추천은 가상 카운터 보상을 만들지 않는다',()=>{
  const g=game();g.run("P.stage='pro';P.teamId=0;P.week=2;P.syn=1;P.hp=100;P.stress=0;ensureSeasonJourney().focus='foundation';");
  const plan=plain(g.run('recommendationPlan()'));assert.equal(plan.key,'scrim');assert.ok(plan.opponent.name);assert.ok(plan.reason.includes('팀 호흡'));assert.ok(plan.opponent.threat.includes('전력'));const before=JSON.stringify(g.run('P'));g.run('recommendationPlan()');assert.equal(JSON.stringify(g.run('P')),before);
});

test('추천 진행은 안내한 인물·코스의 비용과 주간 소통을 실제 적용한다',async()=>{
  const g=game();g.run("const s=ensureSeasonJourney();s.opened=true;P.week=7;P.hp=100;P.money=500000;P.bonds.harin.unlocked=true;endRelationship('jieun');tryBeginFlirt('harin');let offered='';ask=async html=>{offered+=html;return 0;};weekEnd=async()=>{P.week++;P.weeklyDates=0;};");
  const plan=plain(g.run('recommendationPlan()'));const before=plain(g.run('P'));assert.equal(plan.date.hid,'harin');
  await g.run('runRecommendedTurn()');assert.equal(g.run('P.money'),before.money-plan.date.cost);assert.equal(g.run('P.hp'),before.hp-8);assert.equal(g.run('P.week'),8);assert.ok(g.run('offered').includes(plan.date.name));assert.deepEqual(plain(g.run('P.seasonJourney.contactWeeks')),[7]);
});

test('추천 데이트 취소·자원 변화는 일정과 기록을 실행하지 않는다',async()=>{
  const g=game();g.run("const s=ensureSeasonJourney();s.opened=true;ensureCareer();P.week=7;P.hp=100;ask=async()=>-1;save();");const before=JSON.stringify(g.run('P'));
  await g.run('runRecommendedTurn()');assert.equal(JSON.stringify(g.run('P')),before);assert.equal(g.run('P.weeklyBriefingHistory.length'),0);
});

test('확인 중 돈이 줄면 같은 추천을 강제로 실행하지 않는다',async()=>{
  const g=game();g.run("const s=ensureSeasonJourney();s.opened=true;P.week=7;P.hp=100;ask=async()=>{P.money=0;return 0;};");const hp=g.run('P.hp'),aff=g.run('P.bonds.jieun.aff');
  await g.run('runRecommendedTurn()');assert.equal(g.run('P.week'),7);assert.equal(g.run('P.hp'),hp);assert.equal(g.run('P.bonds.jieun.aff'),aff);assert.equal(g.run('P.weeklyDates||0'),0);assert.equal(g.run('P.weeklyBriefingHistory.length'),0);
});

test('신인 초기 자원으로 추천26주를 따라가면 연말 비용 사건에도 균형 목표를 실제로 채운다',async()=>{
  const g=game(12345);g.run("P.fastSkip=true;const s=ensureSeasonJourney();s.opened=true;s.focus='balance';");const actions=[];
  for(let i=0;i<26;i++){actions.push(g.run('recommend()'));await g.run('runRecommendedTurn()');}
  const record=plain(g.run('P.seasonArchive[0]'));assert.equal(record.progress.done,true,record.progress.detail);assert.equal(record.contactWeeks.length,4);assert.ok(record.weeks.filter(w=>['lane','mech','vod','pool','solo','scrim'].includes(w.action)).length>=7);assert.equal(g.run('P.year'),2);assert.equal(g.run('P.week'),1);
});

test('최근 상대 분석 약속은 실제 경기 분석 일정으로 이어진다',()=>{
  const g=game();g.run("const s=ensureSeasonJourney();s.opened=true;s.focus='challenge';s.scenes.push({id:'summerStart',title:'다시 준비',label:'상대를 분석한다',text:'약속',week:12,choice:0});P.week=13;P.hp=100;P.stress=0;");assert.equal(g.run('recommend()'),'vod');assert.ok(g.run('recommendationPlan().reason').includes('약속'));
});
