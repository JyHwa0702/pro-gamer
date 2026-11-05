// 별도 컨텍스트에서 같은 실제 선택으로26주를 진행한다. 게임의 경기/정산/계약 함수를 대체하지 않는다.
async original=>{
 const context=await original.context().browser().newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],counts=[],screens=[];
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);const check=(v,m)=>{if(!v)throw Error(m);};let phase='초기화',total=0,reviewSeen=false;
 const intro=async()=>{if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});};
 const inspect=async label=>{const size=await page.evaluate(()=>{const e=document.querySelector('#modal:not(.hidden) .box')||document.querySelector('#main');return {width:innerWidth,doc:document.documentElement.scrollWidth,client:e.clientWidth,scroll:e.scrollWidth};});check(size.doc<=size.width&&size.scroll<=size.client+1,label+' 가로 넘침');screens.push({label,...size});};
 try{
  await page.goto('http://127.0.0.1:5544/');await intro();
  await page.evaluate(()=>{Date.now=()=>1793836800000;let seed=101;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};P=makePlayer('시즌흐름검증','mid',{mech:68,lane:68,macro:68,team:68,pool:68,mental:65});P.stage='pro';P.teamId=0;P.hist.bestStage='pro';P.salary=300000;P.money=5000000;P.fans=5000;P.syn=3;P.fastSkip=true;for(const k of ['harin','mina'])P.bonds[k].unlocked=true;ensureSeasonJourney().opened=true;P.seasonJourney.companion='harin';P.seasonJourney.focus='balance';save();render();});
  await page.locator('.week-card').screenshot({path:'output/playwright/season-flow-after-preview.png',animations:'disabled'});
  for(let week=1;week<=26;week++){
   phase='주간 진행 '+week;check(await page.evaluate(()=>P.week)===week,'시작 주차');await page.locator('#bFastTurn').click();let clicked=0;
   for(let step=0;step<150;step++){
    if(await page.evaluate(()=>!busy))break;
    if(await page.locator('#modal:not(.hidden)').isVisible()){
     if(week===26&&await page.locator('.season-review').count()){
      reviewSeen=true;await page.waitForTimeout(750);await page.screenshot({path:'output/playwright/season-flow-after-review.png',animations:'disabled'});
      const state=await page.evaluate(()=>JSON.stringify(P));await page.locator('.season-match-highlights>summary').click();await page.locator('.season-match-highlights .series-recap').first().waitFor();check(await page.evaluate(()=>JSON.stringify(P))===state,'결산 경기 재열람 변경');await page.locator('.season-match-highlights>summary').click();
     }
     const buttons=page.locator('#mBtns button:enabled');if(await buttons.count())await buttons.first().click();else await page.locator('#mCloseBtn').click();clicked++;
    }else await page.waitForTimeout(20);
   }
   check(await page.evaluate(()=>!busy),'주간 진행 완료');counts.push({week,confirmations:clicked});total+=clicked;
   if(week===1){
    phase='첫 경기 요약';await page.locator('.weekly-result-card').screenshot({path:'output/playwright/season-flow-after-result.png',animations:'disabled'});await page.locator('#bLastBriefing').click();await page.waitForTimeout(750);await page.screenshot({path:'output/playwright/season-flow-after-briefing.png',animations:'disabled'});
    const state=await page.evaluate(()=>JSON.stringify(P));await page.locator('#mBody .recap-details>summary').first().click();check(await page.locator('#mBody .recap-details .series-record').first().isVisible(),'세트 상세 연결');await page.locator('#mBody .recap-details>summary').first().click();
    await page.locator('#mBody .recap-champions img').first().click();await page.locator('#imageViewer[open]').waitFor();await page.locator('#imageZoomIn').click();check(await page.locator('#imageZoomValue').innerText()==='150%','결과 이미지 확대');await page.keyboard.press('Escape');check(await page.locator('#modal:not(.hidden)').isVisible(),'확대로 브리핑 종료');check(await page.evaluate(()=>JSON.stringify(P))===state,'결과 재열람·확대 상태 변경');await page.locator('#mCloseBtn').click();
   }
   if([1,9,20,24,26].includes(week))await inspect('주간 '+week);
  }
  phase='시즌 완료';check(reviewSeen,'26주 결산 선택 누락');check(await page.evaluate(()=>P.year===2&&P.week===1&&!busy),'다음 시즌 진입');
  const state=await page.evaluate(()=>JSON.parse(JSON.stringify(P))),random=await page.evaluate(()=>Math.random());
  // 같은 브리핑의 재열람만으로 실제 수치·기록·저장 데이터가 바뀌지 않아야 한다.
  await page.evaluate(()=>{showWeeklyBriefing(P.weeklyBriefingHistory.slice().reverse().find(r=>r.matches.length));});
  for(const width of [320,390,1100]){await page.setViewportSize({width,height:844});await inspect('시즌 마지막 브리핑');await page.waitForFunction(()=>[...document.querySelectorAll('#modal .recap-champions img')].every(i=>i.complete&&i.naturalWidth>0));}await page.locator('#mCloseBtn').click();
  phase='사진과 대사';await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{P.photoMemories=[{key:'park',hid:'mina',year:1,week:1,kind:'together',people:['player','mina'],img:COMMON_SHARED_PHOTOS.walk.img,loc:'동네 공원'}];const scene=safeRelationshipPresentation('mina','공원을 함께 걸으며 이번 시즌을 돌아보자.','한 시즌의 기록');scene.place='동네 공원';showYouthPresentation('mina',scene);});
  await page.locator('.vn-portrait img').waitFor();check(await page.locator('.vn-portrait img').getAttribute('src')==='assets/couple_walk_shared.png','공원 장면 장소 일치');await page.waitForFunction(()=>document.querySelector('.vn-portrait img').naturalWidth>0);await page.screenshot({path:'output/playwright/season-flow-after-dialogue.png',animations:'disabled'});await page.locator('#mCloseBtn').click();
  await page.evaluate(()=>{showYouthPresentation('mina',safeRelationshipPresentation('mina','패배가 아쉽지만 다음 경기를 준비하자.','경기가 끝난 뒤'));});await page.locator('.vn-portrait img').waitFor();check(await page.locator('.vn-portrait img').getAttribute('src')==='assets/mina_concerned.png','패배 대사 표정');await page.locator('#mCloseBtn').click();
  phase='저장·오프라인';await page.evaluate(()=>save());const stable=await page.evaluate(()=>JSON.stringify({hist:P.hist,series:P.seriesHistory,archive:P.seasonArchive,bonds:P.bonds,money:P.money,fans:P.fans,week:P.week,year:P.year}));
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await intro();await page.waitForFunction(async()=>!!(await caches.match(location.href)));check(await page.evaluate(()=>JSON.stringify({hist:P.hist,series:P.seriesHistory,archive:P.seasonArchive,bonds:P.bonds,money:P.money,fans:P.fans,week:P.week,year:P.year}))===stable,'새로고침 저장 보존');await context.setOffline(true);await page.reload();await intro();check(await page.evaluate(()=>JSON.stringify({hist:P.hist,series:P.seriesHistory,archive:P.seasonArchive,bonds:P.bonds,money:P.money,fans:P.fans,week:P.week,year:P.year}))===stable,'오프라인 보존');await page.evaluate(()=>{showWeeklyBriefing(P.weeklyBriefingHistory.slice().reverse().find(r=>r.matches.length));});await inspect('오프라인 브리핑');await page.locator('#mBody .recap-details>summary').first().click();check(await page.locator('#mBody .series-record').first().isVisible(),'오프라인 실제 세트 기록');
  check(!errors.length,errors.join('\n'));return {result:'SEASON_FLOW_26_WEEKS_PASS',version:await page.evaluate(()=>CURRENT_VERSION),counts,total,reviewSeen,state,random,screens,photoPlace:'park',photoMood:'concerned',imageZoom:'150%',reload:true,offline:true,pageErrors:errors};
 }catch(e){await context.setOffline(false);await page.screenshot({path:'output/playwright/season-flow-failure.png'}).catch(()=>{});throw Error(phase+' / '+e.message);}finally{await context.setOffline(false);await context.close();}
}
