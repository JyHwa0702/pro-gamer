async page => {
  const errors=[],onError=e=>errors.push(e.message),check=(x,m)=>{if(!x)throw Error(m);};page.on('pageerror',onError);page.setDefaultTimeout(15000);
  const button=t=>page.locator('#mBtns button').filter({hasText:t}),close=()=>page.locator('#mCloseBtn').click();
  const receipts=[],scenes=[];let motion=null,transferred=false;
  const apply=async(id,label)=>{const before=await page.evaluate(id=>({money:P.money,hp:P.hp,offer:seasonProjectOffer(id)}),id);check(before.offer.available,'활동 조건 '+id);await button(label).click();await button('실행').click();const after=await page.evaluate(id=>({money:P.money,receipt:P.seasonJourney.projects[id],available:seasonProjectOffer(id).available}),id);check(after.money===before.money-before.offer.cost+before.offer.income,'활동 금액 '+id);check(!after.available,'활동 중복 '+id);receipts.push(after.receipt);};
  try {
    if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();
    await page.locator('#introSplash').waitFor({state:'hidden'});
    await page.evaluate(()=>{window.__careerRandom=Math.random;let seed=303;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};P=makePlayer('커리어 통합 검증','mid',{mech:85,lane:85,macro:85,team:85,pool:85,mental:85});P.age=19;P.stage='pro';P.teamId=0;P.talent=1.15;P.fastSkip=true;P.money=20000000;P.fans=20000;P.salary=1000000;P.syn=3;Object.values(P.bonds).forEach(b=>{b.unlocked=true;b.aff=20;});P.bonds.yejin.storyChoices={1:1};P.bonds.yejin.relationshipStyle='independent';syncHeroineAges();save();render();});
    await page.locator('#bSeason').click();await page.locator('#seasonCompanion').selectOption('yejin');await button('기본기 완성').click();await page.locator('#seasonCareer').click();
    await page.waitForTimeout(700);await page.screenshot({path:'docs/reports/career-flow/evaluation-mobile.png',animations:'disabled'});
    await button('이번 시즌 커리어 방향 정하기').click();await button('새 팀에서 도전').click();check(await page.evaluate(()=>P.career.intentions[0].path)==='move','진로 선택 저장');
    await button('동행 인연의 선택 기억').click();check((await page.locator('#mBody').innerText()).includes('존중'),'기존 선택 기억 미반영');await close();
    await page.locator('#seasonActivities').click();await apply('careerReview','개인 분석 리포트');await apply('brandCampaign','브랜드 공동 기획');await close();
    for(let week=1;week<=26;week++){
      check(await page.evaluate(()=>P.week)===week,'주차 불일치 '+week);
      if(week===25){check(transferred,'스토브리그 이적 미실행');await page.locator('#bSeason').click();await page.locator('#seasonActivities').click();await apply('relocation','이적 정착 지원');await close();}
      const action=await page.evaluate(()=>P.hp<45||P.stress>65?'rest':'lane');await page.locator(`[data-a="${action}"]`).click();let done=false;
      for(let step=0;step<110;step++){
        if(await page.evaluate(()=>!busy)){if(!motion){await page.locator('#bLastBriefing').click();}else{done=true;break;}}
        if(await page.locator('.weekly-briefing').isVisible()){
          if(!motion){const before=await page.evaluate(()=>({state:JSON.stringify(P),save:localStorage.getItem('proRoadSave_v4')}));motion=await page.locator('.brief-metric strong').first().evaluate(el=>({frame:el.textContent,target:el.getAttribute('aria-label'),tone:el.closest('.brief-metric').className}));await page.waitForTimeout(700);const after=await page.evaluate(()=>({state:JSON.stringify(P),save:localStorage.getItem('proRoadSave_v4')}));check(before.state===after.state&&before.save===after.save,'결산 모션 상태 변경');check(await page.locator('.brief-metric strong').first().innerText()===motion.target,'최종 수치 복원');await page.screenshot({path:'docs/reports/career-flow/weekly-result-mobile.png',animations:'disabled'});}
          await close();await page.waitForFunction(()=>!busy);done=true;break;
        }
        if(await page.locator('.season-review').isVisible()){await page.waitForTimeout(700);await page.screenshot({path:'docs/reports/career-flow/season-result-mobile.png',animations:'disabled'});await close();continue;}
        if(await page.locator('#modal:not(.hidden)').isVisible()){
          const body=await page.locator('#mBody').innerText();
          if(body.includes('스토브리그 - 계약 제안')){await page.screenshot({path:'docs/reports/career-flow/offers-mobile.png',animations:'disabled'});const offers=page.locator('#mBtns button').filter({hasText:'이적'});check(await offers.count()>0,'외부 제안 없음');await offers.first().click();continue;}
          if(await page.locator('[data-career-contract]').count()){await page.screenshot({path:'docs/reports/career-flow/contract-memory-mobile.png',animations:'disabled'});await page.locator('#mBtns button').nth(1).click();transferred=true;continue;}
          const node=page.locator('[data-season-scene]'),marker=await node.count()?await node.getAttribute('data-season-scene'):null;if(marker)scenes.push(marker);
          if(marker==='summerEnd'){check(!body.includes('현 팀에 남아 증명'),'이미 정한 진로를 다시 선택');check(body.includes('새 팀'),'이적 의향 미반영');}
          const buttons=page.locator('#mBtns button:enabled');if(await buttons.count())await buttons.first().click();else await close();
        }else if(await page.locator('#nextBtn').isVisible())await page.locator('#nextBtn').click();else await page.waitForTimeout(30);
      }check(done,'주간 완료 실패 '+week);
    }
    const final=await page.evaluate(()=>({year:P.year,week:P.week,career:P.career,archive:P.seasonArchive[0]}));check(final.year===2&&final.week===1,'연차 경계');check(final.career.intentions[0].status==='kept','실제 이적과 약속 불일치');check(final.career.contracts.some(x=>x.kind==='transfer'&&x.settled),'정착 기록 누락');check(final.career.memories.yejin.some(x=>x.topic==='move'&&x.label.includes('다음 계획')),'계약 인연 기억 누락');
    await page.reload();if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
    const saved=await page.evaluate(()=>JSON.stringify(P));await page.locator('#bStand').click();await button('시즌 결산').click();await page.locator('#mBtns button').first().click();await page.locator('.season-review').waitFor();await page.waitForTimeout(700);
    for(const width of [320,390,1100]){await page.setViewportSize({width,height:900});const d=await page.locator('#modal .box').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));check(d.scroll<=d.width+1,'가로 넘침 '+width);}
    await page.locator('.season-review details>summary').first().click();check((await page.locator('#mBody').innerText()).includes('커리어'),'결산 커리어 기록 누락');await page.screenshot({path:'docs/reports/career-flow/career-review-desktop.png',animations:'disabled'});await close();await close();check(await page.evaluate(()=>JSON.stringify(P))===saved,'결산 재열람 상태 변경');
    await page.setViewportSize({width:390,height:844});await page.locator('#bSeason').click();check((await page.locator('#mBody').innerText()).includes('이적 도전'),'다음 시즌 약속 누락');await page.screenshot({path:'docs/reports/career-flow/next-season-mobile.png',animations:'disabled'});await button('기본기 완성').click();await page.locator('#seasonActivities').click();check(await button('이적 정착 지원').isDisabled(),'같은 이적 연차 중복');await close();
    check(errors.length===0,errors.join(','));return {result:'CAREER_26_WEEK_BROWSER_PASS',weeks:26,scenes,receipts,motion,contract:final.career.contracts.at(-1),promise:final.career.intentions[0],memories:final.career.memories.yejin.length,nextSeason:true,readOnlyReplay:true,widths:[320,390,1100],pageErrors:errors};
  } finally {await page.evaluate(()=>{if(window.__careerRandom){Math.random=window.__careerRandom;delete window.__careerRandom;}save();});page.off('pageerror',onError);}
}
