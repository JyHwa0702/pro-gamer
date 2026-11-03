// 검증 전용 origin. 실제 대화창 Promise와 저장을 대체하지 않는다.
async page=>{
 const check=(v,m)=>{if(!v)throw Error(m);},errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);page.setDefaultTimeout(10000);
 const results=[];
 try{
  await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  await page.evaluate(()=>{P=makePlayer('이미지 감상 검증','mid',{mech:45,lane:45,macro:45,team:45,pool:45,mental:55});ensureSeasonJourney().opened=true;P.fastSkip=true;save();render();});
  const stable=await page.evaluate(()=>({state:JSON.stringify(P),save:localStorage.getItem('proRoadSave_v4')}));
  for(const width of [320,390,1100]){
   await page.setViewportSize({width,height:844});await page.locator('.season-companion-preview img').click();await page.locator('#imageViewer[open]').waitFor();
   const size=await page.locator('#imageViewerImage').evaluate(e=>({natural:e.naturalWidth,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,fit:getComputedStyle(e).objectFit}));check(size.natural>0&&size.fit==='contain','전체 이미지 표시 '+width);
   await page.locator('#imageZoomIn').click();check(await page.locator('#imageZoomValue').innerText()==='150%','확대');
   await page.locator('#imageZoomReset').click();check(await page.locator('#imageZoomValue').innerText()==='100%','맞춤');
   if(width===390){
    await page.locator('#imageViewerCanvas').click();check(await page.locator('#imageViewer[open]').isVisible(),'사진 터치로 감상창이 닫힘');
    await page.locator('#imageViewerCanvas').dblclick();check(await page.locator('#imageZoomValue').innerText()==='200%','두 번 눌러 확대');
    const before=await page.locator('#imageViewerStage').evaluate(e=>({x:e.scrollLeft,y:e.scrollTop}));const box=await page.locator('#imageViewerStage').boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2-70,box.y+box.height/2-70,{steps:5});await page.mouse.up();
    const moved=await page.locator('#imageViewerStage').evaluate(e=>({x:e.scrollLeft,y:e.scrollTop}));check(moved.x>before.x||moved.y>before.y,'확대 이미지 이동');
    await page.keyboard.press('0');check(await page.locator('#imageZoomValue').innerText()==='100%','키보드 맞춤');
    await page.screenshot({path:'docs/reports/image-viewer/fit-mobile.png',animations:'disabled'});
   }
   await page.locator('#imageViewerClose').click();check(await page.locator('#imageViewer').isHidden(),'닫기');results.push({width,size});
  }
  await page.evaluate(()=>{window.__imageChoice='pending';showHeroineCutscene('jieun','<h4>대화 대기</h4><div class="vn-dialogue">함께 준비할 일정을 정하자.</div>',[{t:'대화를 이어간다'},{t:'다음에 이야기한다'}]).then(v=>window.__imageChoice=v);});
  await page.locator('.vn-portrait img').click();await page.locator('#imageViewer[open]').waitFor();await page.keyboard.press('Escape');
  check(await page.locator('#modal:not(.hidden)').isVisible(),'확대 닫기가 원래 대화를 닫음');check(await page.evaluate(()=>window.__imageChoice)==='pending','확대가 선택을 처리함');check(await page.locator('.vn-portrait img').evaluate(e=>document.activeElement===e),'이미지 포커스 복귀');
  await page.locator('#mBtns button').first().click();check(await page.evaluate(()=>window.__imageChoice)===0,'원래 선택 불능');
  const after=await page.evaluate(()=>({state:JSON.stringify(P),save:localStorage.getItem('proRoadSave_v4')}));check(JSON.stringify(after)===JSON.stringify(stable),'이미지 감상이 게임/저장 변경');
  await page.locator('#bBond').click();await page.locator('.roster-open:not(:disabled)').first().click();await page.locator('#imageViewer[open]').waitFor();await page.locator('#imageViewerClose').click();await page.locator('[data-roster]').first().click();check(await page.locator('.vn-portrait').isVisible(),'인연 메뉴 경로');await page.keyboard.press('Escape');
  // 실제로 표시한 Fallback만 확대하며, 별도 원본/성인 에셋을 구성하지 않는다.
  await page.keyboard.press('Escape');await page.evaluate(()=>{const img=document.querySelector('.season-companion-preview img');img.src='missing-viewer-image.jpg';});
  await page.waitForFunction(()=>{const e=document.querySelector('.season-companion-preview img');return e.complete&&e.naturalWidth>0&&e.dataset.fb;});const fallback=await page.locator('.season-companion-preview img').evaluate(e=>e.currentSrc);
  await page.locator('.season-companion-preview img').focus();await page.keyboard.press('Enter');await page.locator('#imageViewer[open]').waitFor();check(await page.locator('#imageViewerImage').getAttribute('src')===fallback,'Fallback 원본 불일치');
  await page.keyboard.press('Tab');check(await page.locator('#imageViewer').evaluate(e=>e.contains(document.activeElement)),'뷰어 포커스 이탈');await page.keyboard.press('Escape');
  check(errors.length===0,errors.join(','));return {result:'IMAGE_VIEWER_BROWSER_PASS',results,dialogPreserved:true,stateAndSaveUnchanged:true,roster:true,pageErrors:errors};
 }finally{page.off('pageerror',onError);}
}
