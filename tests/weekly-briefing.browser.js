// 독립 테스트 origin 전용. 실제 행동/주간 처리와 모달을 사용한다.
async page => {
  const errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);
  const check=(x,m)=>{if(!x)throw Error(m);};
  const dismissUntilBrief=async()=>{
    for(let i=0;i<55;i++){
      if(await page.evaluate(()=>!busy)){await page.locator('#bLastBriefing').click();await page.locator('.weekly-briefing').waitFor();return;}
      const next=page.locator('#nextBtn');if(await next.isVisible())await next.click();
      else if(await page.locator('#modal:not(.hidden)').isVisible())await page.locator('#mBtns button:enabled').first().click();
      else await page.waitForTimeout(70);
    }throw Error('주간 브리핑 도달 실패');
  };
  try {
    await page.locator('#introSplash').waitFor({state:'hidden'});
    // 테스트 선수와 고정비만 준비한다. 정산 함수는 대체하지 않는다.
    await page.evaluate(()=>{P=makePlayer('브리핑 검증','mid',{mech:40,lane:40,macro:40,team:40,pool:40,mental:55});P.talent=1.15;P.fastSkip=true;P.hp=70;P.money=9876543;P.salary=123456;save();render();});
    await page.locator('[data-cat="life"]').click();await page.locator('[data-a="rest"]').click();await dismissUntilBrief();
    check(await page.locator('.weekly-briefing').getAttribute('data-briefing-key')==='1:1','완료 주차 불일치');
    const actual=await page.evaluate(()=>({record:P.weeklyBriefingHistory.at(-1),money:P.money,hp:P.hp,week:P.week,busy}));
    check(actual.week===2&&!actual.busy,'주차·busy 불일치');check(actual.record.after.money===actual.money&&actual.record.after.hp===actual.hp,'세이브와 브리핑 불일치');
    for(const width of [320,390,1100]){
      await page.setViewportSize({width,height:844});
      const bounds=await page.evaluate(()=>{const el=document.querySelector('.weekly-briefing'),box=document.querySelector('#modal .box'),close=document.querySelector('#mCloseBtn').getBoundingClientRect();return {scroll:el.scrollWidth,width:el.clientWidth,boxScroll:box.scrollWidth,boxWidth:box.clientWidth,close:close.bottom,view:innerHeight};});
      check(bounds.scroll<=bounds.width+1&&bounds.boxScroll<=bounds.boxWidth+1,'브리핑 가로 넘침 '+width);check(bounds.close<=bounds.view,'닫기 화면 이탈 '+width);
      if(width===390)await page.screenshot({path:'docs/reports/weekly-briefing/result-mobile.png',animations:'disabled'});
      if(width===1100)await page.screenshot({path:'docs/reports/weekly-briefing/result-desktop.png',animations:'disabled'});
    }
    await page.setViewportSize({width:390,height:844});await page.locator('.brief-details summary').click();check(await page.locator('.brief-stat-list').isVisible(),'상세 성장 미표시');
    await page.screenshot({path:'docs/reports/weekly-briefing/details-mobile.png',animations:'disabled'});
    const saved=await page.evaluate(()=>JSON.stringify(P));await page.keyboard.press('Escape');await page.waitForFunction(()=>!busy);
    await page.locator('#bLastBriefing').click();await page.locator('.weekly-briefing').waitFor();await page.locator('#mCloseBtn').click();
    check(await page.evaluate(()=>JSON.stringify(P))===saved,'재열람 시 상태 변경');
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});const afterReload=await page.evaluate(()=>JSON.stringify(P));
    await page.locator('#bStand').click();await page.locator('#mBtns button').filter({hasText:'주간 브리핑'}).click();await page.locator('#mBtns button').first().click();await page.locator('.weekly-briefing').waitFor();
    check(await page.locator('.weekly-briefing').getAttribute('data-briefing-key')==='1:1','재로드 후 기록 손실');await page.locator('#mCloseBtn').click();await page.locator('#mCloseBtn').click();
    check(await page.evaluate(()=>JSON.stringify(P))===afterReload,'기록 재열람 시 상태 변경');
    // 1군 빠른 경기에서도 공식 경기 결과와 실제 정산을 한 장에 담는다.
    await page.evaluate(()=>{P.age=19;P.stage='pro';P.teamId=0;P.hp=100;save();render();});
    await page.locator('[data-a="lane"]').click();await dismissUntilBrief();
    const match=await page.evaluate(()=>P.weeklyBriefingHistory.at(-1));check(match.matches.length===1,'공식 경기 기록 누락');check(match.after.games-match.before.games===1,'경기 중복');
    await page.locator('.brief-details summary').click();check((await page.locator('.brief-details').innerText()).includes(match.matches[0].label),'경기 상세 누락');
    await page.locator('#mCloseBtn').click();await page.waitForFunction(()=>!busy);
    check(errors.length===0,'pageerror: '+errors.join(','));return {result:'WEEKLY_BRIEFING_BROWSER_PASS',widths:[320,390,1100],readOnlyReplay:true,reload:true,matchCount:match.matches.length,pageErrors:errors};
  } finally {page.off('pageerror',onError);}
}
