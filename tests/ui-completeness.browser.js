// 독립 BrowserContext의 합성 데이터만 사용한다. 정상 화면과 의도적 이미지 실패를 구분한다.
async originalPage=>{
 const context=await originalPage.context().browser().newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],screens=[];
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);
 let phase='초기화';const check=(v,m)=>{if(!v)throw Error(m);};
 const intro=async()=>{if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});};
 const close=async()=>{if(await page.locator('#modal:not(.hidden)').isVisible())await page.locator('#mCloseBtn').click();};
 const fixture=async()=>page.evaluate(()=>{P=makePlayer('화면완성도검증긴이름','mid',{mech:65,lane:65,macro:65,team:65,pool:65,mental:65});P.stage='pro';P.teamId=0;P.money=1e12;P.fans=1e9;P.salary=987654321;P.syn=5;P.fastSkip=true;ensureSeasonJourney().opened=true;for(const k of ['jieun','harin','mina'])P.bonds[k].unlocked=true;P.hist.log=Array.from({length:12},(_,i)=>'사건 '+i+' · 한빛 타이탄즈에서 경기를 돌아보고 다음 시즌의 계약과 목표를 정리합니다.');save();render();});
 const inspect=async(view,width,height)=>{
  phase=view+' '+width;
  await page.waitForFunction(()=>[...document.querySelectorAll('#modal:not(.hidden) img,#main img')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight;}).every(e=>e.complete&&e.naturalWidth>0));
  const info=await page.evaluate(()=>{const box=document.querySelector('#modal:not(.hidden) .box')||document.querySelector('#main');return {documentWidth:document.documentElement.scrollWidth,width:innerWidth,client:box.clientWidth,scroll:box.scrollWidth};});
  check(info.documentWidth<=width,'문서 가로 넘침 '+view+width);check(info.scroll<=info.client+1,'화면 가로 넘침 '+view+width);
  if(view!=='home')check(await page.locator('#mCloseBtn').isVisible(),'닫기 버튼 누락 '+view);
  screens.push({view,width,height,...info});
  if(width===390&&['home','season','record','rank','sns'].includes(view))await page.screenshot({path:'output/playwright/ui-after-'+view+'.png',animations:'disabled'});
 };
 try{
  await page.goto('http://127.0.0.1:5544/');await intro();await fixture();
  for(const [width,height]of [[320,844],[390,844],[1100,844],[844,390]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>render());await inspect('home',width,height);
   for(const view of ['season','record','rank','standings','bonds','sns','wealth','shop','achievements']){
    await page.evaluate(view=>{if(view==='season')showSeasonHub();if(view==='record')showRecord();if(view==='rank')showLeaderboardModal();if(view==='standings')showStandings();if(view==='bonds')showBondsModal();if(view==='sns')showSnsModal();if(view==='wealth')showWealthModal();if(view==='shop')showHubShop();if(view==='achievements')showAchievementsModal();},view);
    await page.locator('#modal:not(.hidden)').waitFor();await inspect(view,width,height);
    if(view==='record'){
     check(await page.locator('.record-timeline li').count()===12,'과거 사건 유실');
     const before=await page.evaluate(()=>JSON.stringify(P));await page.locator('.career-identity img').click();await page.locator('#imageViewer[open]').waitFor();await page.locator('#imageZoomIn').click();check(await page.locator('#imageZoomValue').innerText()==='150%','새 기록 이미지 확대');await page.keyboard.press('Escape');check(await page.locator('#modal:not(.hidden)').isVisible(),'확대로 원본 기록 닫힘');check(await page.evaluate(()=>JSON.stringify(P))===before,'기록 확대가 선수 상태 변경');
    }
    if(view==='bonds'){
     for(const img of await page.locator('.roster-open img').all())await img.scrollIntoViewIfNeeded();
     await page.waitForFunction(()=>[...document.querySelectorAll('.roster-open img')].every(e=>e.complete&&e.naturalWidth>0));check(await page.locator('.roster-open img').count()===23,'인물 사진 누락');
    }
    await close();await page.locator('#modal').waitFor({state:'hidden'});
   }
  }
  // 320px에서 긴 영문 이름·큰 숫자가 저장돼 있어도 잘리지 않는다.
  await page.setViewportSize({width:320,height:844});await page.evaluate(()=>{P.name='VeryLongLegacyPlayerName'.repeat(6);render();showSnsModal();});await inspect('sns-long-legacy',320,844);await close();
  phase='실제 밴픽';
  // 실제 대회 밴 선택→출전 선택. 전 단계 닫기를 확정으로 취급하는 기존 흐름과 분리한다.
  await fixture();await page.evaluate(()=>{window.__draftResult=null;showLckChampionSelectModal({name:'검증 상대',str:65}).then(r=>window.__draftResult=r);});await page.locator('#mBtns button').first().click();await page.locator('[data-cid]').first().waitFor();await inspect('draft',320,844);await page.locator('#mBtns button').first().click();await page.locator('#modal').waitFor({state:'hidden'});
  phase='챔피언 fallback';
  // SW·이미지 메모리 캐시가 의도한 404를 가리지 않도록 실패 검사는 별도 컨텍스트로 분리한다.
  const faultContext=await originalPage.context().browser().newContext({serviceWorkers:'block'}),faultPage=await faultContext.newPage();
  const missing=[];
  try{
   faultPage.on('pageerror',e=>errors.push(e.message));
   await faultPage.route('**/assets/champs/azir.png',route=>route.fulfill({status:404,body:''}));
   await faultPage.goto('http://127.0.0.1:5544/');if(await faultPage.locator('#introSplash').isVisible())await faultPage.locator('#skipIntroBtn').click();
   await faultPage.evaluate(()=>{P=makePlayer('이미지 실패 검증','mid',{mech:65,lane:65,macro:65,team:65,pool:65,mental:65});render();});
   await faultPage.waitForFunction(()=>{const e=document.querySelector('.champion-avatar');return e.complete&&e.naturalWidth>0&&e.getAttribute('src')==='champs/azir.png';});
   await faultPage.route('**/ui-missing-*.png',route=>{missing.push(route.request().url());return route.fulfill({status:404,body:''});});
   await faultPage.evaluate(()=>{const e=document.createElement('img');e.id='missingImageProbe';e.alt='사진을 불러올 수 없습니다';e.onerror=()=>advanceImageFallback(e,['/ui-missing-a.png','/ui-missing-b.png','/ui-missing-c.png']);document.body.appendChild(e);e.src='/ui-missing-a.png';});
   await faultPage.waitForFunction(()=>document.querySelector('#missingImageProbe').classList.contains('image-unavailable'));await faultPage.waitForTimeout(150);check(missing.length===3,'이미지 무한 재요청 '+missing.length);
  }finally{await faultContext.close();}
  // 게임 내 공백 상태가 잘못된 데이터나 임의 사진으로 채워지지 않는다.
  await page.evaluate(()=>{P.hist.log=[];showRecord();});check(await page.locator('.record-empty').isVisible(),'첫 기록 안내');await close();await fixture();
  phase='오프라인 캐시 준비';await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await intro();
  await page.waitForFunction(async()=>!!(await caches.match(location.href)));
  const saved=await page.evaluate(()=>JSON.stringify({hist:P.hist,money:P.money,fans:P.fans,bonds:P.bonds,week:P.week}));await context.setOffline(true);await page.reload();await intro();check(await page.evaluate(()=>JSON.stringify({hist:P.hist,money:P.money,fans:P.fans,bonds:P.bonds,week:P.week}))===saved,'오프라인 저장 복원');await page.locator('#bSeason').click();await inspect('offline-season',320,844);await close();
  check(errors.length===0,'JS 오류 '+errors.join(', '));return {result:'UI_COMPLETENESS_BROWSER_PASS',screens,portraits:23,fallbackRequests:missing.length,imageZoom:'150%',offline:'PASS',pageErrors:errors};
 }catch(e){let diagnostics={};try{await page.waitForLoadState('domcontentloaded',{timeout:2000});diagnostics=await page.evaluate(()=>({text:document.querySelector('#mBody')?.innerText.slice(0,200),images:[...document.images].filter(e=>!e.complete||!e.naturalWidth).map(e=>({src:e.getAttribute('src'),loading:e.loading,rect:e.getBoundingClientRect().toJSON()}))}));await page.screenshot({path:'output/playwright/ui-failure.png'});}catch{}throw Error(phase+' / completed='+screens.length+' / '+e.message+' / '+JSON.stringify(diagnostics));}finally{await context.setOffline(false);await context.close();}
}
