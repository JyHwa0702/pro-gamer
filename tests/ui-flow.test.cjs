const {test}=require('node:test'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
test('홈의 정보 재배치·상세 재열람은 선수·저장·난수를 바꾸지 않는다',()=>{
 for(const stage of ['ama','pro']){
  const a=game(1407),b=game(1407);for(const g of [a,b])g.run(`P.stage='${stage}';P.teamId=0;ensureSeasonJourney().opened=true;__nativeRender();save();`);
  const before=JSON.stringify(a.run('P')),stored=a.storage.get('proRoadSave_v4');a.run('for(let i=0;i<5;i++){__nativeRender();renderSeasonCard();renderLatestWeeklyResult();}');assert.equal(JSON.stringify(a.run('P')),before);assert.equal(a.storage.get('proRoadSave_v4'),stored);assert.equal(a.run('Math.random()'),b.run('Math.random()'));
 }
});
test('경기가 있는 주의 반복 사건 문구는 홈에서 줄이고 주간 상세에 보존한다',async()=>{
 const g=game(101);g.run("P.stage='pro';P.teamId=0;P.fastSkip=true;ensureSeasonJourney().opened=true;");await g.run("takeTurn('lane')");assert.ok(g.run('P.weeklyBriefingHistory[0].matches.length')>0);g.run("P.weeklyBriefingHistory[0].events[0]='고유한 경기 후 사건 기록';");const before=JSON.stringify(g.run('P'));assert.ok(!g.run('renderLatestWeeklyResult()').includes('고유한 경기 후 사건 기록'));assert.ok(g.run('renderWeeklyBriefing(P.weeklyBriefingHistory[0])').includes('고유한 경기 후 사건 기록'));assert.equal(JSON.stringify(g.run('P')),before);
 g.run('P.weeklyBriefingHistory[0].matches=[]');assert.ok(g.run('renderLatestWeeklyResult()').includes('고유한 경기 후 사건 기록'));
});
