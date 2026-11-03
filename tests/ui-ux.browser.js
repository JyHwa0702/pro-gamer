// 별도 검증 origin에서만 실행. 게임의 상태와 비용/횟수 규칙은 기존 함수로 확인한다.
async page => {
  const errors=[],failed=[];const error=e=>errors.push(e.message);const response=r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1:5528'))failed.push(r.url());};
  page.on('pageerror',error);page.on('response',response);
  const check=(v,m)=>{if(!v)throw Error(m);};
  try {
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    for(const width of [320,390,1100]){
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>render());
      const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,main:document.querySelector('#main').getBoundingClientRect().bottom,nav:document.querySelector('#gameNav').getBoundingClientRect().top}));
      check(size.scroll<=size.viewport,'홈 가로 넘침 '+width);check(size.main<=size.nav+1,'본문과 하단 메뉴 겹침 '+width);
      const nav=await page.locator('#gameNav').boundingBox();await page.locator('#main').evaluate(el=>el.scrollTop=el.scrollHeight);
      const scrolledNav=await page.locator('#gameNav').boundingBox();check(nav.y===scrolledNav.y,'하단 메뉴 이동 '+width);
      await page.locator('#main').evaluate(el=>el.scrollTop=0);
      if(width===390)await page.screenshot({path:'docs/reports/ui-ux/home-mobile.png'});
      if(width===1100)await page.screenshot({path:'docs/reports/ui-ux/home-desktop.png'});
    }
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>render());
    await page.locator('[data-cat="life"]').click();
    check(await page.locator('[data-a="rest"]').isVisible(),'여가 일정 찾기 실패');
    await page.locator('[data-cat="all"]').click();
    await page.locator('.stats-panel summary').click();check(await page.locator('.stats-panel .bars').isVisible(),'능력치 펼침 실패');
    await page.locator('#bBond').click();
    check(await page.locator('.roster-card').count()===23,'인연 카드 누락');
    check(await page.evaluate(()=>document.querySelector('#app').inert),'모달 배경 오조작 차단 실패');
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('.roster-open img')).slice(0,6).every(img=>img.complete&&img.naturalWidth>0));
    await page.screenshot({path:'docs/reports/ui-ux/bonds-mobile.png',animations:'disabled'});
    await page.locator('[data-roster="jieun"]').click();
    check((await page.locator('#mBtns').innerText()).includes('체력 -8'),'데이트 비용 표시 누락');
    await page.locator('#mCloseBtn').click();await page.locator('.roster-grid').waitFor();await page.locator('#mCloseBtn').click();
    await page.locator('#bStand').click();await page.locator('#mBtns button').nth(1).click();
    check((await page.locator('#mBody').innerText()).includes('커리어 기록'),'기록 경로 누락');await page.keyboard.press('Escape');
    await page.locator('#bShop').click();await page.locator('#stSkin').click();await page.locator('#mCloseBtn').click();
    await page.waitForFunction(()=>document.activeElement.id==='bShop');
    await page.locator('#bWealth').click();await page.locator('#tabLife').click();await page.locator('#mCloseBtn').click();
    check(await page.evaluate(()=>!document.querySelector('#app').inert),'모달 종료 후 입력 차단 잔류');
    check(errors.length===0,'JS 오류 '+errors.join(', '));check(failed.length===0,'리소스 오류 '+failed.join(', '));
    return {result:'UI_UX_BROWSER_PASS',viewports:[320,390,1100],checks:['본문/하단 메뉴 분리','일정 필터','능력치 접기','23인 카드/데이트 비용','기록 접근','자산/스킨 탭','Escape/배경 차단 복원'],pageErrors:errors,failedResources:failed};
  } finally {page.off('pageerror',error);page.off('response',response);}
}
