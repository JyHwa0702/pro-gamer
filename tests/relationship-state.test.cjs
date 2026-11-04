const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function fixture(){
  const g=game();
  assert.equal(g.run('typeof ensureRelationships'),'function','관계 헬퍼는 실제 앱에 구현되어 있어야 한다');
  g.run("for(const k of ['jieun','harin','mina','sora','sea'])P.bonds[k]={...P.bonds[k],unlocked:true,aff:60};");
  return g;
}
const plain=x=>JSON.parse(JSON.stringify(x));
test('기존 친분·이야기·혼인 기록에서 새 연인을 창작하지 않는다',()=>{
  const g=fixture();g.run("P.bonds.jieun={unlocked:true,aff:100,lv:4,storyChoices:{4:1},married:true,cohabiting:true};P.relationships=null;");
  const before=plain(g.run('P.bonds.jieun'));
  assert.equal(g.run('ensureRelationships().partner'),null);
  assert.deepEqual(plain(g.run('P.bonds.jieun')),before);
  assert.equal(g.run("relationshipStatus('jieun')"),'friend');
});
test('손상 필드만 기본값 보완하고 알 수 없는 세이브 필드는 유지한다',()=>{
  const g=fixture();g.run("P.relationships={partner:'missing',flirts:['jieun','jieun','missing','harin','mina'],trust:null,incidents:[null,5],cooldowns:[],extra:'keep'};");
  assert.deepEqual(plain(g.run('ensureRelationships().flirts')),['jieun','harin']);
  assert.equal(g.run('P.relationships.partner'),null);assert.equal(g.run('P.relationships.trust'),100);assert.equal(g.run('P.relationships.extra'),'keep');
});
test('연인 1명·썸 2명에서 네 번째 인연 접근은 다음 주에도 막힌다',()=>{
  const g=fixture();
  assert.equal(g.run("tryBeginFlirt('jieun').ok"),true);assert.equal(g.run("confirmRelationship('jieun').ok"),true);
  assert.equal(g.run("tryBeginFlirt('harin').ok"),true);assert.equal(g.run("tryBeginFlirt('mina').ok"),true);
  assert.equal(g.run("tryBeginFlirt('sora').full"),true);g.run('P.week++;');
  assert.equal(g.run("tryBeginFlirt('sora').full"),true);
  assert.equal(g.run("canRomanticInteract('sora')"),false);assert.equal(g.run("relationshipLabel('jieun')"),'연인');
  assert.equal(g.run("confirmRelationship('harin').ok"),false);assert.equal(g.run('P.relationships.partner'),'jieun');
});
test('낮은 친분 고백은 거절하며 무료 연타가 호감·스탯을 올리지 않는다',()=>{
  const g=fixture();g.run("P.bonds.jieun.aff=49;tryBeginFlirt('jieun');");
  const before=plain(g.run('({s:P.s,money:P.money,hp:P.hp,stress:P.stress,aff:P.bonds.jieun.aff})'));
  assert.equal(g.run("confirmRelationship('jieun').rejected"),true);
  for(let i=0;i<20;i++){assert.equal(g.run("tryBeginFlirt('jieun').cooldown"),true);assert.equal(g.run("confirmRelationship('jieun').cooldown"),true);}
  assert.deepEqual(plain(g.run('({s:P.s,money:P.money,hp:P.hp,stress:P.stress,aff:P.bonds.jieun.aff})')),before);
  assert.equal(g.run("relationshipStatus('jieun')"),'cooldown');g.run('P.week+=3;');assert.equal(g.run("tryBeginFlirt('jieun').ok"),false);
  g.run('P.week++;P.bonds.jieun.aff=50;');assert.equal(g.run("tryBeginFlirt('jieun').ok"),true);assert.equal(g.run("confirmRelationship('jieun').ok"),true);
});
test('일반 친구 태그와 연인 본인 사진은 외도 증거가 아니다',()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');confirmRelationship('jieun');");
  assert.equal(g.run("recordRelationshipEncounter('harin',{kind:'post',publicEvidence:true})"),null);
  assert.equal(g.run("recordRelationshipEncounter('jieun',{kind:'post',publicEvidence:true})"),null);
  assert.equal(g.run('P.relationships.incidents.length'),0);
});
test('비밀 데이트는 주 1회 기록하고 정확한 상대 공개 사진이 그 사건을 발각시킨다',()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');confirmRelationship('jieun');tryBeginFlirt('harin');Math.random=()=>.99;");
  assert.equal(g.run("recordRelationshipEncounter('harin',{kind:'date'}).discovered"),false);
  assert.equal(g.run("recordRelationshipEncounter('harin',{kind:'date'})"),null);
  assert.equal(g.run("recordRelationshipEncounter('harin',{kind:'post',publicEvidence:true,postId:'post_1'}).discovered"),true);
  assert.equal(g.run('P.relationships.incidents.length'),1);assert.equal(g.run('P.relationships.incidents[0].other'),'harin');
  assert.equal(g.run('P.relationships.incidents[0].postId'),'post_1');assert.equal(g.run('P.relationships.trust'),100);
});
test('사과해도 신뢰 15 감소·중복 해결 무효·다음 사건에서는 상대가 이별한다',()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');confirmRelationship('jieun');tryBeginFlirt('harin');recordRelationshipEncounter('harin',{kind:'post',publicEvidence:true});");
  const before=g.run('P.bonds.jieun.aff');
  assert.equal(g.run("resolveRelationshipIncident('apologize').trustLoss"),15);
  assert.equal(g.run('P.relationships.trust'),85);assert.equal(g.run("resolveRelationshipIncident('apologize').ok"),false);
  assert.equal(g.run("recordRelationshipEncounter('harin',{kind:'post',publicEvidence:true})"),null);
  g.run("P.week++;recordRelationshipEncounter('harin',{kind:'post',publicEvidence:true});");
  assert.equal(g.run("resolveRelationshipIncident('apologize').brokenUp"),true);
  assert.equal(g.run('P.relationships.partner'),null);assert.equal(g.run('P.bonds.jieun.aff'),before-10);
  assert.equal(g.run("relationshipStatus('jieun')"),'cooldown');
});
test('거짓 해명으로 호감 보상을 얻지 않고 미발각 사건은 해결할 수 없다',()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');confirmRelationship('jieun');tryBeginFlirt('harin');Math.random=()=>.99;recordRelationshipEncounter('harin',{kind:'date'});");
  assert.equal(g.run("resolveRelationshipIncident('lie').ok"),false);
  g.run("recordRelationshipEncounter('harin',{kind:'post',publicEvidence:true});");
  const before=g.run('P.bonds.jieun.aff');assert.equal(g.run("resolveRelationshipIncident('lie').trustLoss"),25);
  assert.equal(g.run('P.bonds.jieun.aff'),before);assert.equal(g.run('P.relationships.trust'),75);
});
test('사건 20개 상한과 오래된 원본 스토리·게시물 보존',()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');confirmRelationship('jieun');tryBeginFlirt('harin');P.bonds.jieun.storyChoices={4:1};P.sns.posts=[{id:'legacy',caption:'keep'}];for(let n=0;n<25;n++){P.week++;recordRelationshipEncounter('harin',{kind:'post',publicEvidence:true});}");
  assert.equal(g.run('P.relationships.incidents.length'),20);assert.equal(g.run('P.bonds.jieun.storyChoices[4]'),1);assert.equal(g.run('P.sns.posts[0].caption'),'keep');
});
test('연도 경계에서 냉각은 누적 주차로 계산한다',()=>{
  const g=fixture();g.run("P.week=26;tryBeginFlirt('jieun');endRelationship('jieun');P.year=2;P.week=1;");
  assert.equal(g.run("tryBeginFlirt('jieun').cooldown"),true);g.run('P.week=4;');assert.equal(g.run("tryBeginFlirt('jieun').ok"),true);
});
test('이전5종 세이브의 높은 친분·스토리·혼인·사진은 보존하되 연애 슬롯을 자동 배정하지 않는다',async()=>{
  for(const key of ['proRoadSave_v4','proRoadSave_v3','proRoadSave_v2','proRoadSave_v1','progamer_save']){
    const g=fixture();g.run("P.bonds.jieun.aff=100;P.bonds.jieun.lv=4;P.bonds.jieun.married=true;P.bonds.jieun.storyChoices={1:1,4:0};P.sns.posts=[{id:'old',img:'assets/jieun_night.jpg',caption:'옛 기록'}];P.gallery=[{id:'old-album',img:'assets/harin_home.jpg',caption:'남겨둔 기록'}];delete P.relationships;");
    const original=plain(g.run('P'));g.storage.set(key,JSON.stringify(original));g.run('P=load();ensureRelationships();');
    assert.equal(g.run('P.relationships.partner'),null);assert.deepEqual(plain(g.run('P.relationships.flirts')),[]);
    assert.deepEqual(plain(g.run('P.bonds.jieun')),original.bonds.jieun);assert.deepEqual(plain(g.run('P.sns.posts')),original.sns.posts);assert.deepEqual(plain(g.run('P.gallery')),original.gallery);
    const money=g.run('P.money');assert.equal(await g.run("performHeroineDate('jieun',getHeroineDates('jieun')[0].id)"),false);assert.equal(g.run('P.money'),money);assert.equal(g.run('P.weeklyDates || 0'),0);
  }
});
test('사진과 다른 인물 메타데이터를 섞은 메모리는 게시하지 않는다',()=>{
  const g=fixture();g.run("tryBeginFlirt('harin');rememberSharedPhoto('harin',{loc:'공개 게이밍 라운지'});P.photoMemories[0].img='assets/couple_jieun_cafe.png';");
  assert.equal(g.run('publishSharedPhoto(P.photoMemories[0].key,0).ok'),false);assert.equal(g.run('P.sns.posts.length'),0);assert.equal(g.run('weeklyState().postRewarded'),false);
});
test('DM 문구 선택 중 선수가 바뀌면 새 선수에게 연애 답장·호감·저장을 적용하지 않는다',async()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');let answerCount=0,newPlayerSnapshot='';ask=async()=>{answerCount++;if(answerCount===2){P=makePlayer('교체선수','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55});newPlayerSnapshot=JSON.stringify(P);}return 0;};");
  await g.run('openSendDmModal()');assert.equal(g.run('JSON.stringify(P)'),g.run('newPlayerSnapshot'));
});
test('선물 선택 중 관계가 끝나면 비용·호감·주간 선물 보상을 적용하지 않는다',async()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');showHeroineCutscene=async(h,body,buttons=[])=>{if(body.includes('인연 일정'))return buttons.findIndex(x=>x.t.includes('맞춤 선물'));if(body.includes('선물 고르기')){endRelationship('jieun');return 0;}return 0;};");
  const before=plain(g.run('({money:P.money,aff:P.bonds.jieun.aff})'));
  assert.equal(await g.run("openHeroineDirectMenu('jieun')"),false);assert.deepEqual(plain(g.run('({money:P.money,aff:P.bonds.jieun.aff})')),before);assert.equal(g.run('!!weeklyState().gifts.jieun'),false);
});
test('사진 선택 모달 취소는 게시물·보상·관계 사건을 만들지 않는다',async()=>{
  const g=fixture();g.run("tryBeginFlirt('jieun');rememberSharedPhoto('jieun',{loc:'학교 앞 베이커리'});renderButtons=(buttons,resolve)=>resolve(1);");assert.equal(g.run('sharedPhotoOptions().length'),1);
  const before=g.run('JSON.stringify(P)');await assert.doesNotReject(g.run('openQuickPostModal()'));assert.equal(g.run('JSON.stringify(P)'),before);
});
