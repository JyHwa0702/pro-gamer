// 실제 세이브와 분리된 임시 컨텍스트에서 수동 밴픽→국면→완전 자동 전환.
async originalPage=>{
 const context=await originalPage.context().browser().newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 const errors=[],check=(ok,msg)=>{if(!ok)throw Error(msg);};page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);
 try{
  await page.goto('http://127.0.0.1:5544/');if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  await page.evaluate(()=>{P=makePlayer('수동 밴픽 검증','mid',{mech:65,lane:65,macro:65,team:65,pool:65,mental:65});P.stage='pro';P.teamId=0;P.pro[0].str=65;P.fastSkip=false;P.syn=0;ensureSeasonJourney().opened=true;save();render();window.__draftResult=null;playMatch({name:'검증 상대',str:65},'LCK 스프링 1라운드').then(r=>window.__draftResult=r);});
  await page.locator('#mBody').filter({hasText:'팀 추천 밴'}).waitFor();await page.locator('#mBtns button').nth(1).click();
  await page.locator('.champ-pick-card').first().waitFor();
  const initial=await page.locator('.champ-pick-card').count();check(initial>=2,'내 역할 남은 후보');
  await page.locator('.champ-pick-card').last().click();await page.locator('.champ-pick-card.sel').waitFor();
  for(const width of [320,390,1100]){await page.setViewportSize({width,height:844});const layout=await page.locator('#modal .box').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,overflow:[...e.querySelectorAll('*')].filter(x=>x.getBoundingClientRect().right>e.getBoundingClientRect().right).map(x=>({tag:x.tagName,cls:x.className,w:Math.round(x.getBoundingClientRect().width)})).slice(0,12)}));check(layout.scroll<=layout.width+1,'밴픽 넘침 '+width+' '+JSON.stringify(layout));}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/reports/core-career/draft-mobile.png',animations:'disabled'});
  const selected=await page.locator('.champ-pick-card.sel').getAttribute('data-cid');await page.locator('#mBtns button').filter({hasText:'출전 확정'}).click();
  await page.locator('.choices .btn[data-i="0"]').waitFor();await page.locator('.choices .btn[data-i="0"]').click();
  await page.locator('.choices .btn[data-i="auto"]').waitFor();await page.locator('.choices .btn[data-i="auto"]').click();await page.waitForFunction(()=>window.__draftResult!==null);
  const result=await page.evaluate(()=>({match:window.__draftResult,games:P.hist.games,selected:P.currentChamp.id,mastery:P.champs[P.currentChamp.id].pts,pending:!!currentAskResolve}));
  check(result.games===1&&result.selected===selected&&result.mastery===100&&!result.pending,'실제 선택/숙련 정산과 대기 해제');
  check(!await page.locator('#modal:not(.hidden)').count(),'자동 전환 후 추가 선택 대기');check(errors.length===0,errors.join(','));
  return {result:'MANUAL_DRAFT_BROWSER_PASS',candidates:initial,widths:[320,390,1100],manualPhase:true,remainingAutomatic:true,state:result,pageErrors:errors};
 }catch(error){await page.screenshot({path:'docs/reports/core-career/draft-failure.png',fullPage:true});throw error;}
 finally{await context.close();}
}
