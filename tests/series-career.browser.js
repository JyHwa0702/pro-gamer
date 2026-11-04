// 새 BrowserContext의 합성 세이브만 사용. 실제 경기/정산/계약 함수를 대체하지 않는다.
async originalPage=>{
 const context=await originalPage.context().browser().newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);const check=(v,m)=>{if(!v)throw Error(m);};
 const intro=async()=>{if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});};
 const close=()=>page.locator('#mCloseBtn').click(),choose=t=>page.locator('#mBtns button:enabled').filter({hasText:t}).first().click();
 const fixture=async name=>page.evaluate(name=>{P=makePlayer(name,'mid',{mech:65,lane:65,macro:65,team:65,pool:65,mental:65});P.stage='pro';P.teamId=0;P.pro[0].str=65;P.salary=300000;P.money=5000000;P.fans=5000;P.syn=0;P.fastSkip=false;ensureSeasonJourney().opened=true;save();render();},name);
 try{
  await page.goto('http://127.0.0.1:5544/');await intro();check(await page.evaluate(()=>localStorage.length)===0,'별도 저장소 전제');await fixture('실제 BO5 검증');
  await page.evaluate(()=>{let seed=777;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};window.__seriesDone=null;playMatch({id:1,name:'검증 상대',str:65},'월즈 결승 검증',true,false,{bestOf:5}).then(r=>window.__seriesDone=r);});
  await page.waitForFunction(()=>!!window.__seriesDone);const bo5=await page.evaluate(()=>({wins:__seriesDone.mySetW,losses:__seriesDone.mySetL,sets:__seriesDone.sets.map(s=>({win:s.win,championId:s.championId})),games:P.hist.games,mastery:Object.values(P.champs).reduce((n,c)=>n+c.pts,0),hp:P.hp}));
  check(Math.max(bo5.wins,bo5.losses)===3&&bo5.sets.length===bo5.wins+bo5.losses,'BO5 실제 종료');check(bo5.games===1&&bo5.mastery===100&&bo5.hp===92,'시리즈 정산 예산');await page.evaluate(()=>render());
  await page.locator('#bStand').click();await choose('실제 시리즈 기록');await page.locator('#mBtns button').first().click();await page.locator('.series-record').waitFor();
  for(const width of [320,390,1100]){await page.setViewportSize({width,height:844});check(await page.locator('#modal .box').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'시리즈 상세 넘침 '+width);await page.screenshot({path:'docs/reports/series-career/series-'+width+'.png',animations:'disabled'});}
  await close();await close();await page.setViewportSize({width:390,height:844});
  await fixture('26주 커리어 통합 검증');await page.locator('#bAutoSeason').click();await page.waitForFunction(()=>P.year===2&&!isCareerAutoPlaying()&&!busy,{},{timeout:60000});
  const season=await page.evaluate(()=>{const r=P.seasonArchive[0],contract=r.careerSummary.contracts.at(-1);return {year:P.year,week:P.week,games:P.hist.games,records:P.seriesHistory.length,summary:r.seriesSummary,contract,pending:!!currentAskResolve,control:P.seriesPreferences.control};});
  check(season.year===2&&season.week===1&&!season.pending&&season.control==='auto','26주 완전자동');check(season.summary.series===season.games&&season.records===season.games,'시즌 시리즈 일치');check(season.summary.setWins+season.summary.setLosses>=season.games,'실제 세트 집계');check(Number.isFinite(season.contract?.evidence?.performance.average),'계약 당시 성과 스냅샷');
  const stable=await page.evaluate(()=>JSON.stringify({hist:P.hist,series:P.seriesHistory,archive:P.seasonArchive,career:P.career}));
  await page.locator('#bStand').click();await choose('시즌 결산');await page.locator('#mBtns button').first().click();await page.locator('.season-review .series-summary').waitFor();await page.waitForTimeout(750);
  check(await page.locator('.season-review .season-result-grid>div>b').first().innerText()===String(season.games),'수치 애니메이션 완료 후 실제 경기 수');await page.screenshot({path:'docs/reports/series-career/season-review-mobile.png',animations:'disabled'});
  await page.locator('.season-review>details>summary').click();await page.locator('[data-contract-evidence]>summary').first().click();await page.locator('[data-contract-evidence]').first().screenshot({path:'docs/reports/series-career/contract-evidence.png'});
  await close();await close();check(await page.evaluate(()=>JSON.stringify({hist:P.hist,series:P.seriesHistory,archive:P.seasonArchive,career:P.career}))===stable,'결산 재열람 무변경');
  await page.reload();await intro();check(await page.evaluate(()=>JSON.stringify({hist:P.hist,series:P.seriesHistory,archive:P.seasonArchive,career:P.career}))===stable,'시리즈/계약/결산 저장 복원');
  // 직접 경기에서 세트1 완료·세트2 대기 중 새로고침: 주간 시작 저장으로 돌아간다.
  await fixture('중간 새로고침 검증');await page.locator('#bMore').click();await choose('경기 진행 방식');await choose('직접 밴픽');await page.locator('#bFastTurn').click();await page.locator('#mBody').filter({hasText:'팀 추천 밴'}).waitFor();
  const checkpoint=await page.evaluate(()=>localStorage.getItem(SAVE));await page.locator('#mBtns button').first().click();await choose('출전 확정');
  for(let i=0;i<160;i++){
   if(await page.evaluate(()=>activeMatchSeries?.sets.length===1))break;
   if(await page.locator('#modal:not(.hidden)').isVisible())await page.locator('#mBtns button:enabled').first().click();
   else if(await page.locator('#nextBtn').isVisible())await page.locator('#nextBtn').click();
   else if(await page.locator('.choices .btn[data-i="0"]').isVisible())await page.locator('.choices .btn[data-i="0"]').click();
   await page.waitForTimeout(50);
  }
  check(await page.evaluate(()=>activeMatchSeries?.sets.length===1),'실제 첫 세트 완료');check(await page.evaluate(()=>localStorage.getItem(SAVE))===checkpoint,'세트 중 부분 저장 금지');await page.reload();await intro();
  check(await page.evaluate(()=>P.week===1&&P.hist.games===0&&P.seriesHistory.length===0&&!activeMatchSeries),'중간 재열기 주간 복구');
  await page.evaluate(()=>startAutomaticSeason({maxWeeks:1}));check(await page.evaluate(()=>P.week===2&&P.hist.games===1),'다시 진행 정산1회');
  // 실제 수동 세트의 자동 버튼은 다음 세트 밴픽까지 맡긴다.
  await fixture('수동에서 시리즈 자동');await page.evaluate(()=>{window.__manualDone=null;playMatch({name:'검증',str:65},'직접 BO5',true,false,{bestOf:5,control:'manual'}).then(r=>window.__manualDone=r);});
  await page.locator('#mBody').filter({hasText:'팀 추천 밴'}).waitFor();await page.locator('#mBtns button').first().click();await choose('출전 확정');await page.locator('.choices .btn[data-i="auto"]').click();await page.waitForFunction(()=>!!window.__manualDone);
  const transition=await page.evaluate(()=>({sets:__manualDone.sets.length,games:P.hist.games,pending:!!currentAskResolve}));check(transition.sets>=3&&transition.games===1&&!transition.pending,'수동→전체 자동');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.reload();await intro();await page.waitForFunction(async()=>!!(await caches.match(location.href)));await context.setOffline(true);await page.reload();await intro();check(await page.evaluate(()=>CURRENT_VERSION==='2.9.0'&&P.hist.games===1),'오프라인 기록 복원');
  check(!errors.length,errors.join('\n'));return {result:'SERIES_CAREER_BROWSER_PASS',bo5,season,animatedTotalsSettled:true,readOnlyArchive:true,reload:true,midSeriesCheckpoint:true,manualToSeriesAuto:transition,widths:[320,390,1100],offline:true,pageErrors:errors};
 }catch(error){await page.screenshot({path:'docs/reports/series-career/failure.png',fullPage:true});throw error;}
 finally{await context.close();}
}
