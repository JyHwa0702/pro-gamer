async page => {
  try {
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    await page.waitForFunction(async()=>!!(await (await caches.open('progamer-road-v2-7-1-image-viewer')).match(location.href)));
    const before=await page.evaluate(()=>({money:P.money,name:P.name}));
    await page.context().setOffline(true);
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    const after=await page.evaluate(()=>({money:P.money,name:P.name,version:CURRENT_VERSION}));
    if(before.money!==after.money||before.name!==after.name||after.version!=='2.6.0')throw Error('오프라인 저장 게임 재개 실패');
    await page.locator('#bWealth').click();await page.locator('#tabLife').click();await page.locator('#mCloseBtn').click();
    let seasonArchive=false;
    if(await page.evaluate(()=>!!P.seasonArchive?.length)){
      const snapshot=await page.evaluate(()=>JSON.stringify(P));
      await page.locator('#bStand').click();await page.locator('#mBtns button').filter({hasText:'시즌 결산'}).click();await page.locator('#mBtns button').first().click();await page.locator('.season-review').waitFor();
      await page.locator('#mCloseBtn').click();await page.locator('#mCloseBtn').click();
      if(await page.evaluate(()=>JSON.stringify(P))!==snapshot)throw Error('오프라인 결산 재열람 상태 변경');seasonArchive=true;
    }
    return {result:'OFFLINE_WARM_CACHE_PASS',version:after.version,seasonArchive,scope:'기존에 캐시한 게임과 로컬 세이브 재실행·자산 메뉴·가능한 시즌 결산 재열람'};
  } finally {await page.context().setOffline(false);}
}
