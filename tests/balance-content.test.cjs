const { test } = require('node:test');
const assert = require('node:assert/strict');
const { game } = require('./game-harness.cjs');
const plain = value => JSON.parse(JSON.stringify(value));
for (const key of ['proRoadSave_v4','proRoadSave_v3','proRoadSave_v2','proRoadSave_v1','progamer_save']) {
  test(`세이브 ${key}: 자산과 알 수 없는 필드 보존`, () => {
    const g=game();const saved=g.run(`({...P,money:7654321,customLegacy:{token:'keep'}})`);
    delete saved.bonds.winter;delete saved.house;delete saved.fanclub;
    g.storage.set(key,JSON.stringify(saved));g.run('P=load();');
    assert.equal(g.run('P.money'),7654321);assert.equal(g.run('P.customLegacy.token'),'keep');
    assert.equal(g.run('P.bonds.winter.unlocked'),false);assert.ok(g.run('P.house'));assert.ok(g.run('P.fanclub'));
    assert.equal(JSON.parse(g.storage.get(key)).money,7654321);
  });
}
test('성인 커리어 후 미성년 새 커리어에서 성인용 데이터가 남지 않는다',()=>{
  const g=game();g.run('P.year=3;P.age=19;syncHeroineAges();');
  g.run(`P=makePlayer('새선수','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55});syncHeroineAges();`);
  assert.equal(g.run('HEROINES.jieun.dates.some(d=>d.sensual)'),false);
});
test('19세 경계에서 플레이어와 상대 양쪽 나이를 검사한다',()=>{
  const g=game();g.run('P.year=2;P.age=18;');assert.equal(g.run("canAdultRomance('jieun')"),false);
  g.run('P.age=19;');assert.equal(g.run("canAdultRomance('jieun')"),true);
});
test('미성년 구간 데이트는 건전한 대화와 기본 초상화만 사용한다',()=>{
  const g=game();const dates=plain(g.run("getHeroineDates('sora')"));
  assert.ok(dates.length);assert.ok(dates.every(d=>!d.sensual && d.img==='assets/sora.jpg'));
});
test('피드를 250회 반복해도 같은 주 성장 보상은 한 번이다',()=>{
  const g=game();g.run("postToInsta('검증','icon-512.png','첫 게시물');");const fans=g.run('P.fans');
  g.run("for(let i=0;i<249;i++)postToInsta('검증','icon-512.png','반복 게시물');");assert.equal(g.run('P.fans'),fans);
  g.run("P.week++;postToInsta('검증','icon-512.png','다음 주');");assert.ok(g.run('P.fans')>fans);
});
test('같은 팬 수의 좋아요가 실제 OVR을 반영한다',()=>{
  const likes=[20,100].map(n=>{const g=game(777);g.run(`Object.keys(P.s).forEach(k=>P.s[k]=${n});P.fans=10000;`);return g.run('calculateInstaMetrics().likes');});assert.ok(likes[1]>likes[0]);
});
test('같은 인물의 DM을 반복해도 호감도와 멘탈 보상은 주1회다',async()=>{
  const g=game();g.run('let dialog=0;ask=async()=>[0,2,0][dialog++%3];P.stress=90;');
  await g.run('openSendDmModal()');const before=g.run('[P.bonds.jieun.aff,P.stress]');
  await g.run('openSendDmModal()');assert.deepEqual(plain(g.run('[P.bonds.jieun.aff,P.stress]')),plain(before));
});
test('잔액 부족과 유효하지 않은 일정은 데이트 횟수를 초기화하지 않는다',async()=>{
  const g=game();g.run('P.money=100000;P.weeklyDates=1;');await g.run("takeTurn('care')");await g.run('takeTurn(null)');
  assert.equal(g.run('P.weeklyDates'),1);assert.equal(g.run('P.week'),1);
});
test('진행 중 중복 입력은 주간 수입이나 회복을 지급하지 않는다',async()=>{
  const g=game();g.run("busy=true;P.fanclub.founded=true;P.money=0;P.hp=10;P.house='house_apt';P.weeklyDates=1;");
  for(let i=0;i<10;i++)await g.run("takeTurn('solo')");assert.equal(g.run('P.money'),0);assert.equal(g.run('P.hp'),10);assert.equal(g.run('P.weeklyDates'),1);
});
test('직접 메뉴와 일정은 같은 주간 데이트 제한을 공유한다',async()=>{
  const g=game();g.run('P.weeklyDates=1;let ends=0;weekEnd=async()=>ends++;');await g.run("takeTurn('date')");assert.equal(g.run('ends'),0);assert.equal(g.run('P.money'),500000);
});
test('데이트 실행은 체력과 돈을 지불하고 주1회만 허용한다',async()=>{
  const g=game();assert.equal(await g.run("performHeroineDate('jieun','cafe')"),true);
  assert.equal(g.run('P.money'),470000);assert.equal(g.run('P.hp'),92);
  assert.equal(await g.run("performHeroineDate('jieun','cafe')"),false);assert.equal(g.run('P.money'),470000);
});
test('최고 성과 상태에서 신규 10인 해금이 연결된다',async()=>{
  const g=game();g.run("P.s.mech=100;P.hp=50;P.stage='pro';P.rank={t:9,lp:2500};P.bestT=9;P.fans=1000000;P.hist.wins=100;P.hist.mvp=50;P.hist.worlds=5;P.hist.titles=['월드 챔피언십 우승'];P.salary=100000000;");
  await g.run('checkHeroineUnlocks()');assert.equal(g.run('Object.values(P.bonds).filter(b=>b.unlocked).length'),23);
});
for (const [index,pos,age] of [[0,'mid',17],[1,'sup',22],[2,'adc',18]]) test(`드래프트 ${index+1}번 선택과 나이 보존`,async()=>{
  const g=game();g.run(`ask=async()=>${index};`);await g.run('startOwnerModeDraft()');assert.equal(g.run('P.pos'),pos);assert.equal(g.run('P.age'),age);assert.equal(g.run('P.isOwnerMode'),true);
});
test('구단주 은퇴 선택이 실제 드래프트에 진입한다',async()=>{
  const g=game();g.run('P.money=100000000;let calls=0;startOwnerModeDraft=async()=>calls++;ask=async()=>0;');await g.run('ending(false)');assert.equal(g.run('calls'),1);assert.ok(g.run('P'));
});
test('추천 진행은 시너지가 높은 프로에게도 유효한 행동을 반환한다',()=>{
  const g=game();g.run("P.stage='pro';P.teamId=0;P.syn=5;");assert.equal(g.run('ACTS.some(a=>a.k===recommend())'),true);
});
test('빠른 경기에도 개인 경기 기록과 보상이 정산된다',async()=>{
  const g=game();g.run("P.stage='pro';P.teamId=0;P.fastSkip=true;P.syn=3;");await g.run("playMatch({name:'상대',str:65},'검증')");assert.equal(g.run('P.hist.games'),1);assert.equal(g.run('P.ratings.length'),1);assert.ok(g.run('P.hp')<100);
});
test('BO5 결승은 승리 팀의 세트 스코어가 3이다',async()=>{
  const g=game();g.run("P.stage='pro';P.teamId=0;P.fastSkip=true;");const r=await g.run("playMatch({name:'상대',str:65},'LCK 그랜드 파이널 (결승전)',true)");assert.equal(r.win?r.mySetW:r.mySetL,3);
});
test('최대 체력 보상은 hpAdd 이후에도 유지된다',()=>{const g=game();g.run('P.maxHp=140;P.hp=130;hpAdd(0);');assert.equal(g.run('P.hp'),130);});
test('성장 상한은 기존 명예의 전당 초월 능력치를 깎지 않는다',()=>{const g=game();g.run('P.s.mech=140;grow("mech",2);');assert.ok(g.run('P.s.mech')>=140);});
test('특성 적용은 세이브에 특성 식별자를 보존한다',()=>{const g=game();g.run('START_PERKS[3].apply(P);');assert.equal(g.run('P.perk'),'fame');});
test('마스터 이후 티어 판정이 화면 갱신과 일치한다',()=>{const g=game();g.run('P.rank={t:7,lp:300};addLP(0);');const before=g.run('P.rank.t');g.run('updateKrRank();');assert.equal(g.run('P.rank.t'),before);});
test('인연 주차는 26주 종료 후 연속된 27주로 계산한다',()=>{const g=game();g.run('P.year=2;P.week=1;');assert.equal(g.run('careerWeek()'),27);});
test('미구현 SNS 콜백이 모두 실행 가능한 함수로 존재한다',()=>{const g=game();for(const name of ['openDmChat','handleReplyToComments','openPickGalleryModal'])assert.equal(g.run(`typeof ${name}`),'function');});
