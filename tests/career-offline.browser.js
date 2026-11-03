async page=>{
 const errors=[],onError=e=>errors.push(e.message),check=(x,m)=>{if(!x)throw Error(m);};page.on('pageerror',onError);
 try{
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  await page.waitForFunction(async()=>!!(await(await caches.open('progamer-road-v2-7-1-image-viewer')).match(location.href)));
  const before=await page.evaluate(()=>({name:P.name,year:P.year,week:P.week,money:P.money}));await page.context().setOffline(true);await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  const after=await page.evaluate(()=>({name:P.name,year:P.year,week:P.week,money:P.money}));check(JSON.stringify(before)===JSON.stringify(after),'오프라인 게임 복구 불일치');
  await page.locator('#bSeason').click();if(await page.locator('[data-season-scene="opening"]').count())await page.locator('#mBtns button').first().click();await page.locator('#seasonCareer').click();await page.locator('[data-career-panel]').waitFor();
  const snapshot=await page.evaluate(()=>JSON.stringify(P));await page.locator('#mBtns button').filter({hasText:'동행 인연의 선택 기억'}).click();await page.locator('#mCloseBtn').click();await page.locator('#mCloseBtn').click();check(await page.evaluate(()=>JSON.stringify(P))===snapshot,'오프라인 기억 재열람 상태 변경');
  check(errors.length===0,errors.join(','));return {result:'CAREER_OFFLINE_PASS',version:await page.evaluate(()=>CURRENT_VERSION),scope:'캐시된 게임·세이브 복구, 커리어 평가와 인연 기억 재열람',pageErrors:errors};
 }finally{await page.context().setOffline(false);page.off('pageerror',onError);}
}
