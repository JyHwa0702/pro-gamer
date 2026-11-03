const { test } = require('node:test');
const assert = require('node:assert/strict');
const { game } = require('./game-harness.cjs');
const snapshot = value => JSON.parse(JSON.stringify(value));
test('오래된 세이브에서 누락된 나이와 부분 스탯을 보완한다',()=>{
  const g=game();const p=g.run('({...P,year:5,s:{mech:88}})');delete p.age;g.storage.set('proRoadSave_v2',JSON.stringify(p));g.run('P=load();');
  assert.equal(g.run('P.age'),21);assert.equal(g.run('P.s.mech'),88);assert.ok(Number.isFinite(g.run('ovr()')));
});
test('48주 기반 인연 타임스탬프를 한 번만 변환한다',()=>{
  const g=game();const p=g.run('({...P,year:3,week:1})');delete p.balanceSchema;p.bonds.jieun.lastInteractWeek=74;
  g.storage.set('proRoadSave_v3',JSON.stringify(p));g.run('P=load();');assert.equal(g.run('P.bonds.jieun.lastInteractWeek'),52);
  g.run('save();P=load();');assert.equal(g.run('P.bonds.jieun.lastInteractWeek'),52);
});
test('스폰서 DM은 JSON 저장/로드 후에도 한 번만 보상한다',async()=>{
  const g=game();g.run(`P.dms.list=[{templateId:'dm_sponsor_keyboard',sender:'검증',msg:'협찬',read:false,choices:[{t:'수락'}]}];save();P=load();ask=async()=>0;`);
  const cash=g.run('P.money');await g.run('openDmChat(0)');assert.equal(g.run('P.money'),cash+7000000);
  await g.run('openDmChat(0)');assert.equal(g.run('P.money'),cash+7000000);
});
test('공통 경기 정산은 승패 결과가 같으면 연출 모드와 무관하다',()=>{
  const samples=[game(888),game(888)].map(g=>{g.run("P.stage='pro';P.teamId=0;settleMatchResult({win:true,rating:8.8,phaseWins:3,big:true});");return snapshot(g.run('({hist:P.hist,fans:P.fans,hp:P.hp,stress:P.stress,s:P.s,ratings:P.ratings})'));});assert.deepEqual(samples[0],samples[1]);
});
test('같은 주의 수익 정산을 두 번 호출해도 중복되지 않는다',()=>{
  const g=game();g.run('P.fanclub.founded=true;P.hallOfFame=true;P.salary=100000;settleWeeklyResources();');const value=g.run('P.money');g.run('settleWeeklyResources();');assert.equal(g.run('P.money'),value);g.run('P.week++;settleWeeklyResources();');assert.ok(g.run('P.money')>value);
});
test('미성년 참여자에게 동일 ID의 건전한 대체 데이트만 실행한다',async()=>{const g=game();g.run('P.age=18;P.year=5;P.bonds.sora.unlocked=true;P.bonds.sora.aff=100;');const id=g.run('HEROINE_ORIGINALS.sora.dates.find(d=>d.sensual).id');assert.equal(await g.run(`performHeroineDate('sora',${JSON.stringify(id)})`),true);assert.equal(g.run('HEROINES.sora.dates.some(d=>d.sensual)'),false);});
test('주간 DM 보상은 서로 다른 인물도 최대 세 명이다',async()=>{
  const g=game();g.run("P.bonds.harin.unlocked=P.bonds.sora.unlocked=P.bonds.mina.unlocked=true;let who=0;let count=0;ask=async()=>[who,2,0][count++%3];");
  for(let i=0;i<3;i++){g.run(`who=${i};`);await g.run('openSendDmModal()');}
  g.run('who=3;');const before=g.run('P.bonds.mina.aff');await g.run('openSendDmModal()');assert.equal(g.run('P.bonds.mina.aff'),before);
});
test('선물은 같은 인물에게 같은 주 두 번 비용을 청구하지 않는다',async()=>{
  const g=game();g.run('showHeroineCutscene=async(h,b,btns=[])=>btns.length===5?3:0;');await g.run("openHeroineDirectMenu('jieun')");const money=g.run('P.money');await g.run("openHeroineDirectMenu('jieun')");assert.equal(g.run('P.money'),money);
});
test('주식 가격을 저장하고 재로드해도 유지한다',()=>{const g=game();g.run('STOCKS[0].p=12345;save();STOCKS[0].p=99999;P=load();');assert.equal(g.run('STOCKS[0].p'),12345);});
test('새 게시물을 계속 만들어도 댓글 성장 보상은 전체 주1회다',async()=>{
  const g=game();g.run('ask=async()=>1;');g.run("postToInsta('a','icon-512.png','a')");await g.run('replyToFeedComment(P.sns.posts[0].id)');
  const before=snapshot(g.run('[P.fans,P.s.mech]'));g.run("postToInsta('b','icon-512.png','b')");await g.run('replyToFeedComment(P.sns.posts[0].id)');assert.deepEqual(snapshot(g.run('[P.fans,P.s.mech]')),before);
});
test('연봉 협상과 계약 취소가 현재 계약을 바꾸지 않는다',async()=>{
  const g=game();g.run("P.stage='pro';P.teamId=0;P.salary=1230000;ask=async()=>-1;");
  assert.equal(await g.run('negotiateSalary(P.pro[0],2000000,true)'),null);await g.run('contracts()');assert.equal(g.run('P.salary'),1230000);
});
test('실제 월드 챔피언십 결승 라벨도 3선승이다',()=>{
  const g=game();const result=g.run("matchSetScore('🏆 월드 챔피언십 결승전 🏆',true,3,3.5,8.7)");assert.equal(result.mySetW,3);
});

test('모든 미성년 스토리의 화면과 버튼이 안전한 대화로 대체된다',async()=>{
  const g=game();g.run('showHeroineCutscene=__nativeCutscene;ask=async(html,buttons)=>{globalThis.scene={html,buttons};return -1;};');
  for(const age of [17,18]){
    g.run(`P.age=${age};`);
    await g.run(`(async()=>{for(const [hid,h] of Object.entries(HEROINES)){for(const st of h.story){await showHeroineCutscene(hid,'<h4>'+st.title+'</h4><div class="vn-dialogue">'+st.dialogue+'</div>',st.choice.map(t=>({t})),st.img);if(!scene.html.includes('src="'+h.img+'"'))throw Error('초상화');if(!scene.buttons.every(b=>['응원의 마음을 전한다','차분하게 이야기를 나눈다'].includes(b.t)))throw Error('선택지');}}})()`);
  }
});
test('신규 인연 패시브가 표시 조건에서 실제 성장에 반영된다',()=>{
  const a=game(33),b=game(33);b.run('P.bonds.chaewon.aff=75;');a.run('grow("mech",2);');b.run('grow("mech",2);');assert.ok(b.run('P.s.mech')>a.run('P.s.mech'));
});
test('최대 체력 패시브는 세이브 재로드로 중복 지급되지 않는다',()=>{
  const g=game();g.run('P.bonds.camila.aff=75;save();P=load();');const max=g.run('P.maxHp');g.run('save();P=load();');assert.equal(g.run('P.maxHp'),max);assert.equal(max,140);
});
test('스타 답글의 표시와 실제 팬 보상이 일치한다',async()=>{const g=game();g.run("P.sns.posts=[{id:'one',title:'검증',caption:'검증',comments:[]}];ask=async()=>1;");await g.run("replyToFeedComment('one')");assert.equal(g.run('P.fans'),53);});
test('받은 인연 DM도 스토리와 상호작용 시점을 갱신한다',async()=>{const g=game();g.run("const t=DM_TEMPLATES.find(t=>t.id==='dm_jieun_sweet');P.dms.list=[{templateId:t.id,sender:t.sender,msg:t.msg,choices:t.choices,read:false}];ask=async()=>0;");await g.run('openDmChat(0)');assert.equal(g.run('P.bonds.jieun.lv'),1);assert.equal(g.run('P.bonds.jieun.lastInteractWeek'),1);});
test('PC방 대회 결승 패배가 준우승 보상으로 연결된다',async()=>{const g=game();g.run('P.s={mech:80,lane:80,macro:80,team:80,pool:80,mental:80};let calls=0;Math.random=()=>++calls<=5?.1:.99;');await g.run('playPcBangTournament()');assert.equal(g.run('P.money'),1400000);assert.equal(g.run('P.fans'),1250);});
test('부분적으로 null인 옛 SNS/DM/기록도 재개된다',()=>{const g=game();const p=g.run('({...P,sns:{posts:null},dms:{list:null},hist:{titles:null,log:null,wins:0}})');g.storage.set('proRoadSave_v2',JSON.stringify(p));g.run('P=load();');assert.equal(g.run('P.sns.posts.length+P.dms.list.length+P.hist.titles.length+P.hist.log.length'),0);});
