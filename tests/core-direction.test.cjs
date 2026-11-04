const {test}=require('node:test'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
test('완전자동은 일반모달 입력 없이 시즌26주를 완료하고 원래 경기 설정을 복원한다',async()=>{
 const g=game(12345);g.run("let prompts=0;ask=__nativeAsk;showHeroineCutscene=__nativeCutscene;autoYield=async()=>{};P.fastSkip=false;");
 const result=await g.run("startAutomaticSeason({strategy:'career',interactive:false,maxWeeks:26})");assert.equal(result.weeks,26);assert.equal(g.run('P.year'),2);assert.equal(g.run('P.week'),1);assert.equal(g.run('P.fastSkip'),false);assert.equal(g.run('currentAskResolve'),null);
});
test('자동 진행 중 저장한 체크포인트에 임시 빠른 경기 설정이 남지 않는다',async()=>{
 const g=game();g.run("ask=__nativeAsk;P.fastSkip=false;let checkpointFast=null;autoYield=async()=>{checkpointFast=JSON.parse(localStorage.getItem(SAVE)).fastSkip;stopAutomaticSeason();};");
 await g.run("startAutomaticSeason({maxWeeks:3})");assert.equal(g.run('checkpointFast'),false);
});
test('중요 선택 직접 모드는 대기 상태를 표시하며 중지로 선택 대기를 해제한다',async()=>{
 const g=game();g.run("automaticSeason={player:P,interactive:true,stop:false,completed:0};$('#mCloseBtn').click=$('#mCloseBtn').onclick;");
 const pending=g.run("__nativeAsk('<h3>연봉 협상</h3>',[{t:'서명'},{t:'취소'}])");assert.equal(g.run('automaticSeason.paused'),true);g.run('stopAutomaticSeason()');assert.equal(await pending,-1);assert.equal(g.run('automaticSeason.paused'),false);
});
test('시즌 개막에는 히로인을 파티원으로 고르는 동행 선택을 요구하지 않는다',async()=>{
 const g=game();g.run("let body='';ask=async html=>{body+=html;return 0;}");await g.run('beginSeasonJourney()');assert.ok(!g.run('body').includes('id="seasonCompanion"'));assert.ok(!g.run('body').includes('동행 인연'));
});
test('자동 성장과 커리어 전략은 도전 가능한 아마추어에게 다른 일정을 배정한다',()=>{
 const g=game();g.run("P.week=3;for(const k of Object.keys(P.s))P.s[k]=70;P.hp=100;P.stress=0;ensureSeasonJourney().opened=true;");
 assert.equal(g.run("autoTurnPlan('career').key"),'solo');assert.notEqual(g.run("autoTurnPlan('growth').key"),'solo');
});
test('친분만 높아진 친구는 고백 확인 없이 연인 마일스톤으로 자동 진행하지 않는다',async()=>{
 const g=game();g.run('P.bonds.jieun.aff=100;');await g.run("checkBondMilestone('jieun')");assert.ok(g.run('P.bonds.jieun.lv')<3);assert.equal(g.run('ensureRelationships().partner'),null);
});
test('직접 데이트도 썸·연인 슬롯 밖이면 비용·주간 횟수를 소모하지 않는다',async()=>{
 const g=game();const before=g.run('P.money');assert.equal(await g.run("performHeroineDate('jieun',getHeroineDates('jieun')[0].id)"),false);assert.equal(g.run('P.money'),before);assert.equal(g.run('P.weeklyDates||0'),0);
});
test('함께 찍은 사진은 실제 만남 뒤 해금되고 게시물에 상대와 사진 종류를 보존한다',async()=>{
 const g=game();g.run("tryBeginFlirt('jieun');P.bonds.jieun.aff=60;confirmRelationship('jieun');triggerDatingJackpot=async()=>false;");assert.equal(g.run('sharedPhotoOptions().length'),0);
 await g.run("performHeroineDate('jieun',getHeroineDates('jieun')[0].id)");assert.ok(g.run("sharedPhotoOptions().some(p=>p.people.includes('player')&&p.people.includes('jieun'))"));
 const result=g.run("publishSharedPhoto(sharedPhotoOptions()[0].key,0)");assert.equal(result.ok,true);assert.equal(g.run('P.sns.posts[0].kind'),'together');assert.equal(g.run('P.sns.posts[0].partnerId'),'jieun');assert.ok(g.run('P.sns.posts[0].caption').length>0);
});
test('기념사진은 실제 공개 장소에 맞게 고르고 사적 장소를 카페 사진으로 만들지 않는다',()=>{
 const g=game();assert.equal(g.run("sharedPhotoForDate('jieun',{loc:'가로등 켜진 공원 길'}).img"),'assets/couple_walk_shared.png');
 assert.equal(g.run("sharedPhotoForDate('sora',{loc:'동네 카페'}).img"),'assets/couple_cafe_shared.png');
 assert.equal(g.run("sharedPhotoForDate('jieun',{loc:'둘만의 옥상'})"),null);
 assert.equal(g.run("rememberSharedPhoto('jieun',{loc:'집 안'})"),false);assert.equal(g.run('sharedPhotoOptions().length'),0);
 g.run("rememberSharedPhoto('jieun',{loc:'가로등 켜진 공원 길'})");assert.equal(g.run('sharedPhotoOptions()[0].loc'),'가로등 켜진 공원 길');
});
