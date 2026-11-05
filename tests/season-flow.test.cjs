const {test}=require('node:test'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));
async function matchFixture(){const g=game(101);g.run("P.stage='pro';P.teamId=0;P.fastSkip=true;");await g.run("playMatch({id:1,name:'검증 상대',str:65},'LCK 스프링',false,true,{bestOf:3})");return g;}
test('경기 요약은 실제 스코어·챔피언을 표시하며 상태와 난수를 소비하지 않는다',async()=>{
 const g=await matchFixture(),r=plain(g.run('P.seriesHistory[0]')),before=JSON.stringify(g.run('P'));
 const html=g.run('renderSeriesRecap(P.seriesHistory[0])');assert.ok(html.includes(`${r.mySetW} : ${r.mySetL}`));for(const s of r.sets)assert.ok(html.includes(s.championId+'.png'));assert.ok(html.includes('data-series-open'));assert.ok(html.includes('data-image-viewer'));assert.equal(JSON.stringify(g.run('P')),before);
});
test('주간 요약은 해당 주의 seriesId만 연결하고 예전 기록의 챔피언을 만들지 않는다',async()=>{
 const g=await matchFixture();g.run("let briefing={before:{year:1,week:1},matches:[{seriesId:P.seriesHistory[0].id,label:'경기',win:true,rating:7}]};");assert.equal(g.run('seriesForBriefing(briefing).length'),1);g.run('briefing.before.week=2');assert.equal(g.run('seriesForBriefing(briefing).length'),0);
 const html=g.run("renderBriefingMatches({matches:[{label:'구버전 경기',win:true,rating:7.1}]})");assert.ok(html.includes('구버전 경기'));assert.ok(!html.includes('<img'));assert.ok(!html.includes('BO3'));
});
test('일반 알림은 진행 중인 주에만 순수 텍스트로 모으고 선택이 있으면 원래 대기한다',async()=>{
 const g=game();g.run('let asks=0;ask=async()=>{asks++;return 1};activeWeekBriefing={player:P};');
 assert.equal(await g.run("showWeeklyNotice('<h3>팬들의 응원</h3><p>이번 주 소식</p>')"),0);assert.equal(g.run('asks'),0);assert.equal(g.run('activeWeekBriefing.notices[0].title'),'팬들의 응원');
 assert.equal(await g.run("showWeeklyNotice('<h3>계약 선택</h3>',[{t:'서명'},{t:'거절'}])"),1);assert.equal(g.run('asks'),1);g.run('activeWeekBriefing=null');await g.run("showWeeklyNotice('<h3>메뉴 밖 알림</h3>')");assert.equal(g.run('asks'),2);
});
test('알림 재열람은 HTML과 알 수 없는 사진 경로를 실행하지 않고 구버전도 표시한다',()=>{
 const g=game();const before=JSON.stringify(g.run('P'));const html=g.run("renderWeeklyNotices({notices:[{title:'<img src=x>',text:'<script>bad</script>',image:'assets/unknown-night.jpg'}]})");assert.ok(!html.includes('<script>'));assert.ok(!html.includes('src=x>'));assert.ok(!html.includes('unknown-night.jpg'));assert.equal(g.run('renderWeeklyNotices({})'),'');assert.equal(g.run("renderWeeklyNotices({notices:'broken'})"),'');assert.equal(JSON.stringify(g.run('P')),before);
});
test('공원에서 함께 찍은 실제 기억은 라운지 사진으로 바뀌지 않는다',()=>{
 const g=game();g.run("P.bonds.mina.unlocked=true;P.photoMemories=[{key:'park',hid:'mina',year:1,week:1,kind:'together',people:['player','mina'],img:COMMON_SHARED_PHOTOS.walk.img,loc:'동네 공원'}]");const before=JSON.stringify(g.run('P'));
 assert.equal(g.run("dialogueVisual('mina','공원을 함께 걸으며 한 시즌을 돌아보자',{authored:true,place:'동네 공원',title:'한 시즌의 기록'}).img"),'assets/couple_walk_shared.png');assert.equal(JSON.stringify(g.run('P')),before);
 assert.equal(g.run("dialogueVisual('jieun','한 시즌의 기록',{authored:true,place:'동네 공원'}).img"),'assets/jieun.jpg');
});
test('걱정·패배·사과는 같은 인물의 건전한 표정을 우선하고 미성년 성인 CG를 차단한다',()=>{
 const g=game();for(const hid of ['jieun','harin','mina']){assert.equal(g.run(`dialogueVisual('${hid}','경기 패배가 아쉽지만 다음 준비를 하자',{authored:true}).img`),'assets/'+hid+'_concerned.png');assert.equal(g.run(`dialogueVisual('${hid}','오늘도 응원할게',{sceneImg:'assets/'+ '${hid}' +'_night.jpg'}).img`),g.run(`HEROINES['${hid}'].img`));}
});
test('왜곡된 사진 기억과 장소가 다른 기억은 대화 사진으로 사용하지 않는다',()=>{
 const g=game();g.run("P.photoMemories=[{key:'wrong',hid:'mina',year:1,week:1,kind:'together',people:['player','jieun'],img:COMMON_SHARED_PHOTOS.walk.img,loc:'동네 공원'}]");assert.equal(g.run("dialogueVisual('mina','함께 돌아보자',{authored:true,place:'동네 공원'}).img"),'assets/mina.jpg');
});
test('같은 카페 사진 유형이어도 장소 이름이 다르면 현재 장면을 과거 장소로 덮지 않는다',()=>{
 const g=game();g.run("P.photoMemories=[{key:'cafe',hid:'jieun',year:1,week:1,kind:'together',people:['player','jieun'],img:SHARED_PHOTOS.jieun.img,loc:'단골 베이커리 카페'}]");const r=plain(g.run("dialogueVisual('jieun','전시를 준비하자',{authored:true,place:'학교 앞 베이커리'})"));assert.equal(r.img,'assets/jieun.jpg');assert.ok(!r.place);
});
test('개별 세트 해설은 시리즈 점수나 아직 확정되지 않은 POG를 만들어 말하지 않는다',()=>{
 const g=game();const text=g.run('setAssessment(false,3)');assert.ok(text.includes('패배'));assert.ok(!/MVP|만장일치|POG.*선정/.test(text));assert.ok(text.includes('시리즈 종료 후 확정'));assert.ok(!g.run('setAssessment(false,0)').includes('0:2'));assert.ok(g.run('setAssessment(true,3)').includes('승리'));
});
test('구세이브5형식은 notices 없이도 기록·돈·인연을 복원하고 새 요약을 다시 열 수 있다',async()=>{
 for(const key of ['proRoadSave_v4','proRoadSave_v3','proRoadSave_v2','proRoadSave_v1','progamer_save']){
  const g=game();await g.run("takeTurn('rest')");const legacy=plain(g.run('P'));for(const r of legacy.weeklyBriefingHistory)delete r.notices;legacy.money=7654321;legacy.fans=4321;legacy.legacyMarker='보존';g.storage.clear();g.storage.set(key,JSON.stringify(legacy));g.run('P=load()');assert.equal(g.run('P.money'),7654321);assert.equal(g.run('P.fans'),4321);assert.equal(g.run('P.legacyMarker'),'보존');assert.deepEqual(plain(g.run('P.hist')),legacy.hist);assert.deepEqual(plain(g.run('P.bonds')),legacy.bonds);const before=JSON.stringify(g.run('P'));assert.doesNotThrow(()=>g.run('renderWeeklyBriefing(P.weeklyBriefingHistory[0]);renderLatestWeeklyResult();renderSeasonVisual()'));assert.equal(JSON.stringify(g.run('P')),before);
 }
});
