// 독립 로컬 origin 전용. 상태 fixture 이외에 정산·모달 함수는 대체하지 않는다.
async page => {
  const errors=[],onError=e=>errors.push(e.message),check=(x,m)=>{if(!x)throw Error(m);};page.on('pageerror',onError);
  const close=()=>page.locator('#mCloseBtn').click();const button=t=>page.locator('#mBtns button').filter({hasText:t});
  let rollbackTested=false;const scenes=[],activityReceipts=[];
  try {
    await page.locator('#introSplash').waitFor({state:'hidden'});
    await page.evaluate(()=>{P=makePlayer('시즌 통합 검증','mid',{mech:70,lane:70,macro:70,team:70,pool:70,mental:70});P.age=19;P.stage='pro';P.teamId=0;P.talent=1.15;P.fastSkip=true;P.money=5000000;P.fans=5000;P.salary=1000000;P.syn=3;Object.values(P.bonds).forEach(b=>{b.unlocked=true;b.aff=20;});syncHeroineAges();save();render();});
    for(const width of [320,390,1100]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'홈 가로 넘침 '+width);}
    await page.setViewportSize({width:390,height:844});await page.locator('#bSeason').click();await page.locator('#seasonCompanion').selectOption('harin');await button('기본기 완성').click();
    check(await page.evaluate(()=>P.seasonJourney.companion)==='harin','동행 선택 유실');
    await page.locator('#seasonActivities').click();await page.screenshot({path:'docs/reports/season-experience/activities-mobile.png',animations:'disabled'});
    for(const [id,label] of [['support','훈련 환경 지원'],['fanmeet','팬 초청 공개행사'],['interview','인터뷰 협업'],['album','동행 기록집']]){
      const before=await page.evaluate(id=>({money:P.money,fans:P.fans,week:P.week,quote:seasonProjectOffer(id)}),id);await button(label).click();await button('실행').click();
      const after=await page.evaluate(id=>({money:P.money,fans:P.fans,week:P.week,receipt:P.seasonJourney.projects[id],available:seasonProjectOffer(id).available}),id);
      check(after.money===before.money-before.quote.cost+before.quote.income,'활동 현금 불일치 '+id);check(after.week===before.week&&!after.available,'활동 주차/중복 '+id);activityReceipts.push(after.receipt);
    }
    await page.locator('#seasonJournal').click();check((await page.locator('#mBody').innerText()).includes('동행 기록집'),'활동 일지 누락');await close();
    await page.screenshot({path:'docs/reports/season-experience/home-mobile.png',animations:'disabled'});
    for(let turn=1;turn<=26;turn++){
      const beforeTurn=await page.evaluate(()=>({week:P.week,s:JSON.stringify(P.s),money:P.money}));check(beforeTurn.week===turn,'주간 진행 누락 '+turn);
      const action=await page.evaluate(()=>P.hp<45||P.stress>65?'rest':'lane');await page.locator(`[data-a="${action}"]`).click();
      let done=false;
      for(let step=0;step<100;step++){
        if(await page.evaluate(()=>!busy)){done=true;break;}
        if(await page.locator('.weekly-briefing').isVisible()){await close();await page.waitForFunction(()=>!busy);done=true;break;}
        if(await page.locator('.season-review').isVisible()){
          if(!rollbackTested){
            const checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem('proRoadSave_v4')));check(checkpoint.week===26&&JSON.stringify(checkpoint.s)===beforeTurn.s,'부분 정산 저장');
            await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});check(await page.evaluate(()=>P.week===26&&P.seasonArchive.length===0),'결산 새로고침 복구 실패');
            rollbackTested=true;await page.locator(`[data-a="${action}"]`).click();continue;
          }
          await page.screenshot({path:'docs/reports/season-experience/review-mobile.png',animations:'disabled'});await close();continue;
        }
        if(await page.locator('#modal:not(.hidden)').isVisible()){
          const sceneNode=page.locator('[data-season-scene]');const marker=await sceneNode.count()?await sceneNode.getAttribute('data-season-scene'):null;
          if(marker){scenes.push(marker);if(marker==='spring')await page.screenshot({path:'docs/reports/season-experience/spring-mobile.png',animations:'disabled'});}
          const choices=page.locator('#mBtns button:enabled');const count=await choices.count();if(count)await choices.nth(marker&&count>1?1:0).click();else await close();
        }else if(await page.locator('#nextBtn').isVisible())await page.locator('#nextBtn').click();else await page.waitForTimeout(25);
      }
      check(done,'브리핑까지 진행 실패 '+turn);
    }
    const final=await page.evaluate(()=>({year:P.year,week:P.week,record:P.seasonArchive[0],history:P.seasonArchive.length}));check(final.year===2&&final.week===1&&final.history===1,'연차/시즌 중복');check(final.record.weeks.length===26&&final.record.scenes.length===6,'시즌 기록 누락');check(final.record.progress.done,'기본기 목표 평가');check(final.record.epilogue.includes('기록집'),'기록집 후일담 누락');
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});const saved=await page.evaluate(()=>JSON.stringify(P));
    await page.locator('#bStand').click();await button('시즌 결산').click();await page.locator('#mBtns button').first().click();await page.locator('.season-review').waitFor();
    for(const width of [320,390,1100]){await page.setViewportSize({width,height:900});const size=await page.locator('#modal .box').evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth}));check(size.scroll<=size.width+1,'결산 가로 넘침 '+width);}
    await page.locator('.season-review details>summary').first().click();await page.screenshot({path:'docs/reports/season-experience/review-desktop.png',animations:'disabled'});
    await close();await close();check(await page.evaluate(()=>JSON.stringify(P))===saved,'아카이브 재열람 상태 변화');
    check(errors.length===0,errors.join(','));return {result:'SEASON_26_WEEK_BROWSER_PASS',committedWeeks:26,rollbackDuringFinalReview:rollbackTested,scenes,activityReceipts,goal:final.record.progress,officialGames:final.record.result.games-final.record.baseline.games,rival:final.record.rival,readOnlyArchive:true,pageErrors:errors};
  } finally {page.off('pageerror',onError);}
}
