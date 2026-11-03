// Chromium 터치 입력 주입 검사. 실제 Android/iOS OS 동작 검증을 대신하지 않는다.
async page=>{
 const check=(v,m)=>{if(!v)throw Error(m);},errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const cdp=await page.context().newCDPSession(page);
 try{
  await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  await page.evaluate(()=>{P=makePlayer('터치 감상','mid',{mech:40,lane:40,macro:40,team:40,pool:40,mental:55});ensureSeasonJourney().opened=true;save();render();});
  const stable=await page.evaluate(()=>({p:JSON.stringify(P),save:localStorage.getItem('proRoadSave_v4')}));
  await page.locator('.season-companion-preview img').tap();await page.locator('#imageViewer[open]').waitFor();await page.waitForTimeout(200);
  await page.locator('#imageZoomIn').tap();check(await page.locator('#imageZoomValue').innerText()==='150%','터치 버튼 중복 방지');await page.locator('#imageZoomReset').tap();
  const b=await page.locator('#imageViewerStage').boundingBox(),y=b.y+b.height/2,cx=b.x+b.width/2;
  const point=(id,x,y)=>({id,x,y,radiusX:4,radiusY:4});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(1,cx-55,y),point(2,cx+55,y)]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(1,cx-100,y),point(2,cx+100,y)]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const zoom=await page.locator('#imageZoomValue').innerText();check(parseInt(zoom)>100,'두 손가락 확대');
  const before=await page.locator('#imageViewerStage').evaluate(e=>({x:e.scrollLeft,y:e.scrollTop}));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(1,cx,y)]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(1,cx-50,y-55)]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const after=await page.locator('#imageViewerStage').evaluate(e=>({x:e.scrollLeft,y:e.scrollTop}));check(after.x>before.x||after.y>before.y,'터치 드래그');
  await page.screenshot({path:'docs/reports/image-viewer/touch-zoom.png'});
  const resetBox=await page.locator('#imageZoomReset').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(7,resetBox.x+resetBox.width/2,resetBox.y+resetBox.height/2)]});await page.waitForTimeout(80);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(()=>document.querySelector('#imageZoomValue').textContent==='100%',null,{timeout:2000});check(await page.locator('#imageZoomValue').innerText()==='100%','터치 맞춤: '+await page.locator('#imageZoomValue').innerText());
  await page.locator('#imageViewerClose').tap();check(await page.locator('#imageViewer').isHidden(),'터치 닫기');
  const unchanged=await page.evaluate(()=>({p:JSON.stringify(P),save:localStorage.getItem('proRoadSave_v4')}));check(JSON.stringify(unchanged)===JSON.stringify(stable),'터치 감상 상태 변경');
  check(!errors.length,errors.join(','));return {result:'IMAGE_VIEWER_TOUCH_PASS',zoom,before,after,stateAndSaveUnchanged:true,pageErrors:errors};
 }finally{await cdp.detach();page.off('pageerror',onError);}
}
