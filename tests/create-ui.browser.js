async page => {
  const tab=await page.context().newPage();const errors=[];tab.on('pageerror',e=>errors.push(e.message));
  try {
    await tab.goto('http://127.0.0.1:5528');await tab.locator('#introSplash').waitFor({state:'hidden'});
    await tab.evaluate(()=>{P=null;cr=null;render();});
    for(const width of [320,390,1100]){
      await tab.setViewportSize({width,height:900});
      if(await tab.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('생성 화면 가로 넘침 '+width);
    }
    await tab.setViewportSize({width:390,height:844});
    await tab.locator('#nm').fill('에이스"7');await tab.locator('[data-perk="fame"]').click();
    if(await tab.locator('#nm').inputValue()!=='에이스"7')throw Error('이름 선택 상태 유실');
    if((await tab.locator('[data-perk="fame"]').getAttribute('aria-pressed'))!=='true')throw Error('특성 선택 상태');
    await tab.screenshot({path:'docs/reports/ui-ux/create-mobile.png',animations:'disabled'});
    if(!await tab.locator('#gameNav').isHidden())throw Error('생성 화면 메뉴 노출');
    if(errors.length)throw Error(errors.join(', '));
    return {result:'CREATE_UI_PASS',viewports:[320,390,1100],pageErrors:errors};
  } finally {await tab.close();}
}
