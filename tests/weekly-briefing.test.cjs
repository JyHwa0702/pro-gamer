const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {game}=require('./game-harness.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));
test('구버전 선택 필드 누락·손상은 기존 자원과 알 수 없는 필드를 보존한다',()=>{
  for(const value of [undefined,null,{},'bad']){const g=game();const p=plain(g.run('P'));p.weeklyBriefingHistory=value;p.legacyCustom=42;g.storage.set('proRoadSave_v1',JSON.stringify(p));g.run('P=load()');assert.deepEqual(plain(g.run('P.weeklyBriefingHistory')),[]);assert.equal(g.run('P.legacyCustom'),42);assert.equal(g.run('P.money'),p.money);}
});
test('행동·주간 변화는 실제 상태와 일치하고 저장 후 재열람은 불변이다',async()=>{
  const g=game();const before=plain(g.run('P'));await g.run("takeTurn('lane')");const p=plain(g.run('P')),r=p.weeklyBriefingHistory?.[0];assert.ok(r,'완료한 주의 브리핑');assert.equal(r.key,'1:1');for(const k of ['money','fans','hp','stress']){assert.equal(r.before[k],before[k]);assert.equal(r.after[k],p[k]);}assert.deepEqual(r.after.s,p.s);assert.equal(p.week,2);
  const saved=g.storage.get('proRoadSave_v4');g.run('P=load()');const snap=JSON.stringify(g.run('P'));await g.run('showWeeklyBriefing(P.weeklyBriefingHistory[0])');assert.equal(JSON.stringify(g.run('P')),snap);assert.equal(g.storage.get('proRoadSave_v4'),saved);
});
test('무효·취소·busy에서는 주차와 기록을 추가하지 않는다',async()=>{
  const g=game();await g.run("takeTurn('invalid')");g.run('busy=true');await g.run("takeTurn('rest')");g.run('busy=false;handleDatingAction=async()=>null');await g.run("takeTurn('date')");assert.equal(g.run('P.week'),1);assert.equal(g.run('(P.weeklyBriefingHistory||[]).length'),0);
});
test('최근26주만 보존하고 같은 주 기록은 하나이다',async()=>{
  const g=game();for(let i=0;i<29;i++)await g.run("takeTurn('rest')");assert.equal(g.run('P.weeklyBriefingHistory.length'),26);assert.equal(g.run('P.weeklyBriefingHistory[0].key'),'1:4');assert.equal(g.run('P.weeklyBriefingHistory.at(-1).key'),'2:3');g.run('const record=P.weeklyBriefingHistory.at(-1);storeWeekBriefing(record);');assert.equal(g.run('P.weeklyBriefingHistory.length'),26);
});
test('자연 은퇴 전 마지막 주를 저장하고 새 커리어에는 기록이 섞이지 않는다',async()=>{
  const g=game();g.run("P.age=27;P.week=26;let endSawRecord=false;ending=async()=>{endSawRecord=!!P.weeklyBriefingHistory?.length;P=makePlayer('다음선수','mid',{mech:20,lane:20,macro:20,team:20,pool:20,mental:40});}");await g.run("takeTurn('rest')");assert.equal(g.run('endSawRecord'),true);assert.equal(g.run('P.name'),'다음선수');assert.equal(g.run('P.weeklyBriefingHistory.length'),0);
});
test('기록 문자열은 HTML로 실행되지 않는다',async()=>{
  const g=game();g.run("P.name='<img src=x onerror=alert(1)>';P.hist.titles.push('<script>bad</script>')");await g.run("takeTurn('rest')");const html=g.run('renderWeeklyBriefing(P.weeklyBriefingHistory[0])');assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img src=x'));
});
test('부분 손상된 기록은 버리고 정상 기록과 본래 세이브는 보존한다',async()=>{
  const g=game();await g.run("takeTurn('rest')");const record=plain(g.run('P.weeklyBriefingHistory[0]'));
  for(const mutate of [r=>r.before.rank=null,r=>r.after.s.mech=null,r=>r.after.games='bad',r=>r.before.year=null,r=>r.matches=[{label:'x',rating:null}]]){
    const broken=plain(record);mutate(broken);const p=plain(g.run('P'));p.weeklyBriefingHistory=[broken,record];g.storage.set('proRoadSave_v4',JSON.stringify(p));g.run('P=load()');assert.equal(g.run('P.weeklyBriefingHistory.length'),1);assert.equal(g.run('P.money'),p.money);assert.ok(g.run('renderWeeklyBriefing(P.weeklyBriefingHistory[0])').includes('주간 브리핑'));
  }
});
test('여러 경기·업적·콜업·인연 변화를 상세 기록한다',async()=>{
  const g=game();g.run(`checkAchievements=__nativeAchievements;weekEnd=async()=>{settleMatchResult({label:'결승 1',win:true,rating:9,phaseWins:3,big:true});settleMatchResult({label:'결승 2',win:false,rating:4,phaseWins:1,big:true});P.hist.titles.push('검증 우승');P.stage='pro';P.teamId=0;P.bonds.harin.unlocked=true;P.bonds.harin.aff=25;P.week++;}`);
  await g.run("takeTurn('lane')");const r=plain(g.run('P.weeklyBriefingHistory[0]'));assert.equal(r.matches.length,2);assert.equal(r.after.games-r.before.games,2);assert.equal(r.after.wins-r.before.wins,1);for(const t of ['우승','소속 변경','새 인연','업적'])assert.ok(r.events.some(e=>e.includes(t)),t);assert.equal(r.after.money,g.run('P.money'));
});
test('보통 주 결과는 닫기를 요구하지 않고 홈 카드와 상세 재열람으로 남는다',async()=>{
  const g=game();g.run('let briefCalls=0;ask=async html=>{if(html.includes("data-briefing-key"))briefCalls++;return 0;};');await g.run("takeTurn('rest')");assert.equal(g.run('briefCalls'),0);assert.equal(g.run('busy'),false);assert.equal(g.run('P.week'),2);g.run('__nativeRender()');assert.ok(g.nodes.get('#main').innerHTML.includes('data-weekly-result="1:1"'));assert.ok(g.nodes.get('#main').innerHTML.includes('bLastBriefing'));await g.run('showWeeklyBriefing(P.weeklyBriefingHistory[0])');assert.equal(g.run('briefCalls'),1);
});
test('중요 장면을 기다리는 동안 연타는 추가 일정이나 부분 저장을 만들지 않는다',async()=>{
  const g=game();g.run('let releaseScene;weekEnd=async()=>{await new Promise(r=>releaseScene=r);P.week++;};');const turn=g.run("takeTurn('rest')");for(let i=0;i<25&&!g.run('releaseScene');i++)await Promise.resolve();assert.equal(g.run('busy'),true);const before=JSON.stringify(g.run('P'));await g.run("takeTurn('solo')");assert.equal(JSON.stringify(g.run('P')),before);assert.equal(JSON.parse(g.storage.get('proRoadSave_v4')).week,1);g.run('releaseScene()');await turn;assert.equal(g.run('busy'),false);assert.equal(g.run('P.week'),2);
});
test('후반 스킨·명예의 전당 알림은 브리핑 앞에서 순서대로 종료한다',async()=>{
  const g=game();g.run(`P.hist.titles=['월드 챔피언십 우승','스프링 우승','서머 우승'];P.fans=500000;let notices=[];ask=async html=>{notices.push(html.includes('시그니처 스킨 헌정')?'skin':html.includes('Hall of Fame')?'hall':html.includes('data-briefing-key')?'brief':'other');return 0;};`);await g.run("takeTurn('rest')");const n=plain(g.run('notices'));assert.ok(n.indexOf('skin')>=0);assert.ok(n.indexOf('hall')>n.indexOf('skin'));assert.equal(n.includes('brief'),false);assert.equal(g.run('P.weeklyBriefingHistory[0].after.signatureSkin'),true);
});
test('솔랭에서 시작한 비동기 인연 장면이 끝나기 전에 주간 브리핑이 덮어쓰지 않는다',async()=>{
  const g=game();g.run(`P.rank={t:4,lp:99};P.s={mech:90,lane:90,macro:90,team:90,pool:90,mental:70};randomEvent=async()=>{};scouting=async()=>{};let releaseUnlocks=[];showHeroineCutscene=()=>new Promise(r=>releaseUnlocks.push(r));`);
  const turn=g.run("takeTurn('solo')");for(let i=0;i<35;i++)await Promise.resolve();assert.equal(g.run('P.week'),1);assert.equal(g.run('P.weeklyBriefingHistory.length'),0);g.run('showHeroineCutscene=async()=>0;releaseUnlocks.forEach(r=>r(0))');await turn;assert.equal(g.run('P.week'),2);assert.equal(g.run('P.weeklyBriefingHistory.length'),1);
});
test('번아웃 LP 차감에서 생긴 인연 장면도 번아웃 알림과 겹치지 않는다',async()=>{
  const g=game();g.run(`P.s.mech=79.9;P.stress=99;Object.values(P.bonds).forEach(b=>{b.unlocked=true;b.aff=0;});P.bonds.winter.unlocked=false;randomEvent=async()=>{};scouting=async()=>{};showHeroineCutscene=__nativeCutscene;let notices=[],release=[];ask=html=>{if(html.includes('vn-portrait')||html.includes('<h3>번아웃</h3>')){notices.push(html.includes('vn-portrait')?'scene':'burnout');return new Promise(r=>release.push(r));}return Promise.resolve(0);};`);
  const turn=g.run("takeTurn('lane')");for(let i=0;i<50;i++)await Promise.resolve();assert.equal(g.run('notices.length'),1);assert.equal(g.run('notices[0]'),'scene');g.run('release[0](0)');for(let i=0;i<50;i++)await Promise.resolve();assert.equal(g.run('notices[1]'),'burnout');g.run('release[1](0)');await turn;assert.equal(g.run('P.week'),2);assert.equal(g.run('busy'),false);
});
const baselineFile=process.env.BRIEFING_BASELINE;
test('아마추어 5포지션의 78주 성장·해금·스카우트도 수정 전후가 같다',{skip:!baselineFile},async()=>{
  const baseline=fs.readFileSync(baselineFile,'utf8');for(const pos of ['top','jg','mid','adc','sup']){
    const old=game(101,baseline),now=game(101);for(const g of [old,now])g.run(`Date=class extends Date{static now(){return 1793700000000;}};checkAchievements=__nativeAchievements;P=makePlayer('신인','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;`);
    for(let i=0;i<78;i++){for(const g of [old,now])await g.run('takeTurn(recommend())');const a=plain(old.run('P')),b=plain(now.run('P'));delete a.weeklyBriefingHistory;delete b.weeklyBriefingHistory;for(const p of [a,b]){delete p.seasonJourney;delete p.seasonArchive;delete p.career;}assert.deepEqual(b,a,`${pos} turn${i}`);}
    assert.equal(now.run('Math.random()'),old.run('Math.random()'));
  }
});
test('동일 시드의 수정 전후 78주 정산·주가·다음 난수가 같다',{skip:!baselineFile},async()=>{
  const baseline=fs.readFileSync(baselineFile,'utf8');for(const seed of [97,101,777]){
    const old=game(seed,baseline),now=game(seed);for(const g of [old,now])g.run("Date=class extends Date{static now(){return 1793700000000;}};checkAchievements=__nativeAchievements;P.age=19;P.stage='pro';P.teamId=0;P.fastSkip=true;P.salary=1000000;P.money=5000000;P.s={mech:75,lane:75,macro:75,team:75,pool:75,mental:75};P.syn=4;");
    for(let i=0;i<78;i++){for(const g of [old,now])await g.run('takeTurn(recommend())');const a=plain(old.run('P')),b=plain(now.run('P'));delete b.weeklyBriefingHistory;delete a.weeklyBriefingHistory;for(const p of [a,b]){delete p.seasonJourney;delete p.seasonArchive;delete p.career;}assert.deepEqual(b,a,`seed${seed} turn${i}`);}
    assert.equal(now.run('Math.random()'),old.run('Math.random()'));
  }
});
