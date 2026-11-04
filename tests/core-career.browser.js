// Playwright CLI run-code. 저장소가 없는 별도 BrowserContext에서만 실행한다.
async originalPage=>{
 const context=await originalPage.context().browser().newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),errors=[],check=(ok,msg)=>{if(!ok)throw Error(msg);};
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);
 const buttons=()=>page.locator('#mBtns button:enabled'),choose=t=>buttons().filter({hasText:t}).first().click();
 const close=()=>page.locator('#mCloseBtn').click();
 const settle=async predicate=>{
  for(let i=0;i<150;i++){
   if(await page.evaluate(predicate))return;
   if(await page.locator('#modal:not(.hidden)').isVisible()){
    if(await buttons().count())await buttons().first().click();else await close();
   }else await page.waitForTimeout(30);
  }throw Error('대화/진행 완료 시간 초과');
 };
 const roster=async()=>{if(!await page.locator('[data-roster="jieun"]').isVisible())await page.locator('#bBond').click();};
 const flirt=async hid=>{await roster();await page.locator('[data-roster="'+hid+'"]').click();await choose('서로 알아가기');await page.locator('[data-roster="jieun"]').waitFor();};
 const date=async hid=>{await roster();await page.locator('[data-roster="'+hid+'"]').click();await buttons().first().click();await settle(()=>!!document.querySelector('[data-roster="jieun"]'));};
 const nextWeek=async()=>{await close();await page.locator('#bFastTurn').click();await settle(()=>!busy);};
 const composer=async()=>{await page.locator('#bSns').click();await page.locator('#bCreatePost').click();await page.locator('.quick-post-preview').waitFor();};
 try{
  await page.goto('http://127.0.0.1:5544/');if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();
  await page.locator('#introSplash').waitFor({state:'hidden'});
  check(await page.evaluate(()=>localStorage.length)===0,'임시 컨텍스트 초기 저장소');
  await page.evaluate(()=>{P=makePlayer('커리어 통합 검증','mid',{mech:65,lane:65,macro:65,team:65,pool:65,mental:65});P.money=5000000;P.fans=5000;P.fastSkip=true;for(const k of ['jieun','harin','mina','sora']){P.bonds[k].unlocked=true;P.bonds[k].aff=60;}ensureSeasonJourney().opened=true;save();render();});
  const sizes=[];
  for(const width of [320,390,1100]){
   await page.setViewportSize({width,height:844});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'홈 가로 넘침 '+width);
   check(await page.locator('.nav-tab:visible').count()===4,'메뉴 4개');
   check(!await page.locator('.action-panel').evaluate(e=>e.open),'수동 일정 기본 접힘');
   check(await page.locator('#bAutoSeason').isVisible(),'자동 진행 진입');
   await page.screenshot({path:'docs/reports/core-career/home-'+width+'.png',animations:'disabled'});sizes.push(width);
  }
  await page.setViewportSize({width:390,height:844});
  await flirt('jieun');await page.locator('[data-roster="jieun"]').click();await choose('관계 정하기');await choose('마음을 고백한다');await choose('알겠어');await page.locator('[data-roster="jieun"]').waitFor();
  await flirt('harin');await flirt('mina');await flirt('sora');
  check(await page.evaluate(()=>ensureRelationships().partner==='jieun'&&ensureRelationships().flirts.join(',')==='harin,mina'),'연인1+썸2, 네 번째 접근 거부');
  await date('jieun');
  check(await page.evaluate(()=>P.weeklyDates===1&&P.photoMemories.length===1),'실제 만남과 함께 찍은 사진');
  await page.locator('[data-roster="harin"]').click();check(await buttons().first().isEnabled()===false||await page.locator('#mBtns button').first().isDisabled(),'주간 데이트 제한');await close();await page.locator('[data-roster="jieun"]').waitFor();await close();
  await composer();check(await page.locator('#mBody textarea').count()===0,'멘트 직접 입력 제거');
  await page.locator('[data-quick-caption="1"]').click();
  await page.locator('.quick-post-preview').click();await page.locator('#imageViewer[open]').waitFor();await page.locator('#imageZoomIn').click();check(await page.locator('#imageZoomValue').innerText()==='150%','새 사진 확대');await page.locator('#imageViewerClose').click();
  await page.screenshot({path:'docs/reports/core-career/share-mobile.png',animations:'disabled'});
  await choose('공유하기');await page.locator('#bCreatePost').waitFor();
  check(await page.evaluate(()=>P.sns.posts[0].kind==='together'&&P.sns.posts[0].people.join(',')==='player,jieun'&&P.sns.posts[0].captionId===1),'선택한 커플 사진·문구 게시');
  await nextWeek();
  await page.evaluate(()=>{window.__originalRandom=Math.random;Math.random=()=>.99;});await date('harin');await page.evaluate(()=>{Math.random=window.__originalRandom;delete window.__originalRandom;});
  check(await page.evaluate(()=>ensureRelationships().incidents.some(i=>i.other==='harin'&&!i.discovered)),'비밀 만남은 실제 사건으로 기록');
  await close();await composer();
  check((await page.locator('.quick-post-preview').getAttribute('src')).includes('couple_harin_game'),'최근 함께 찍은 실제 상대 사진');
  await choose('공유하기');await page.locator('#mBody').filter({hasText:'숨긴 만남이 드러난 날'}).waitFor();
  const concerned=await page.locator('.vn-portrait img').getAttribute('src');check(concerned.includes('jieun_concerned'),'질투 대사에 맞는 이미지');
  await page.waitForFunction(()=>document.querySelector('.vn-portrait img')?.naturalWidth>0);
  await page.screenshot({path:'docs/reports/core-career/jealousy-mobile.png',animations:'disabled'});
  await choose('사실대로 인정');await page.locator('#bCreatePost').waitFor();
  check(await page.evaluate(()=>ensureRelationships().trust===85&&ensureRelationships().incidents.filter(i=>i.resolved).length===1),'사과해도 신뢰 비용, 사건1회 해결');
  const saved=await page.evaluate(()=>({relationships:JSON.stringify(P.relationships),photos:JSON.stringify(P.photoMemories),posts:JSON.stringify(P.sns.posts)}));
  await close();await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  check(await page.evaluate(saved=>JSON.stringify(P.relationships)===saved.relationships&&JSON.stringify(P.photoMemories)===saved.photos&&JSON.stringify(P.sns.posts)===saved.posts,saved),'관계/사진/피드 새로고침 보존');
  // 새로운 검증 선수도 같은 임시 컨텍스트 안에서만 생성한다.
  await page.evaluate(()=>{P=makePlayer('26주 완전자동 검증','mid',{mech:65,lane:65,macro:65,team:65,pool:65,mental:65});P.stage='pro';P.teamId=0;P.salary=300000;P.money=5000000;P.fans=5000;P.syn=3;P.fastSkip=false;save();render();});
  await page.locator('#bAutoSeason').click();await page.waitForFunction(()=>isCareerAutoPlaying());
  await page.locator('#bStopAuto').click();await page.waitForFunction(()=>!isCareerAutoPlaying()&&!busy);
  const stopped=await page.evaluate(()=>P.week);check(stopped>1&&stopped<27,'중지 후 현재 주 확정');
  await page.locator('#bAutoSeason').click();await page.waitForFunction(()=>!isCareerAutoPlaying()&&!busy&&P.year===2,{},{timeout:60000});
  const automatic=await page.evaluate(()=>({year:P.year,week:P.week,archive:P.seasonArchive.length,fastSkip:P.fastSkip,pending:!!currentAskResolve,games:P.hist.games,money:P.money}));
  check(automatic.year===2&&automatic.week===1&&automatic.archive===1&&!automatic.fastSkip&&!automatic.pending,'자동26주 종료와 경기설정 보존');
  check(await page.locator('#modal:not(.hidden)').count()===0,'완전자동에 대화 입력 대기 없음');
  await page.screenshot({path:'docs/reports/core-career/automatic-season-mobile.png',animations:'disabled'});
  const icons=await page.evaluate(async()=>{const list=await Promise.all(CHAMPIONS.map(c=>new Promise(resolve=>{const e=new Image();e.onload=()=>resolve(true);e.onerror=()=>resolve(false);e.src=getChampIcon(c);})));return {count:list.length,loaded:list.filter(Boolean).length};});check(icons.loaded===45,'챔피언45개 실제 아이콘');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  await context.setOffline(true);await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  check(await page.evaluate(()=>P.year===2&&P.week===1),'오프라인 재열기 세이브');
  check(errors.length===0,errors.join('\n'));
  return {result:'CORE_CAREER_BROWSER_PASS',isolatedContext:true,widths:sizes,relationshipCap:'1+2',actualDate:true,weeklyDateLimit:true,photoAndCaption:true,photoZoom:true,discovery:true,trustAfterApology:85,reload:true,stopAndResume:true,automatic,icons,offline:true,pageErrors:errors};
 }catch(error){await page.screenshot({path:'docs/reports/core-career/browser-failure.png',fullPage:true});throw error;}
 finally{await context.close();}
}
