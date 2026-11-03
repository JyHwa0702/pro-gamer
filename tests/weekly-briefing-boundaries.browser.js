async page => {
  const check=(x,m)=>{if(!x)throw Error(m);};const errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);
  try {
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    await page.evaluate(()=>{P=makePlayer('연속 해금','mid',{mech:85,lane:85,macro:85,team:85,pool:85,mental:70});P.rank={t:4,lp:99};P.fastSkip=true;syncHeroineAges();render();});
    await page.locator('[data-a="solo"]').click();const speakers=[];
    for(let i=0;i<55;i++){
      if(await page.evaluate(()=>!busy))break;
      if(await page.locator('#modal:not(.hidden)').isVisible()){
        const names=await page.locator('.vn-speaker').allTextContents();speakers.push(...names);
        if(names.length)check(await page.evaluate(()=>P.week)===1,'인연 장면 전에 주차 진행');
        await page.locator('#mBtns button:enabled').first().click();
      }else await page.waitForTimeout(50);
    }
    await page.waitForFunction(()=>!busy);check(await page.locator('[data-weekly-result]').isVisible(),'홈 솔랭 브리핑 누락');check(speakers.length>=2,'여러 인연 장면 검증 실패');
    await page.locator('#bLastBriefing').click();await page.locator('.weekly-briefing').waitFor();await page.locator('#mCloseBtn').click();
    await page.evaluate(()=>{P=makePlayer('번아웃 경계','mid',{mech:79.9,lane:40,macro:40,team:40,pool:40,mental:55});P.stress=99;Object.values(P.bonds).forEach(b=>{b.unlocked=true;b.aff=0;});P.bonds.winter.unlocked=false;syncHeroineAges();window.__briefRandom=Math.random;Math.random=()=>.99;ensureSeasonJourney().opened=true;render();});
    await page.locator('[data-a="lane"]').click();await page.locator('.vn-speaker').waitFor();
    check((await page.locator('.vn-speaker').innerText()).includes('김민정'),'번아웃 해금 인연 누락');
    check(await page.evaluate(()=>P.week)===1,'번아웃 장면 전 주차 진행');
    await page.locator('#mCloseBtn').click();await page.locator('#mBody h3').filter({hasText:'번아웃'}).waitFor();await page.locator('#mCloseBtn').click();
    await page.waitForFunction(()=>!busy);await page.locator('[data-weekly-result]').waitFor();await page.locator('#bLastBriefing').click();await page.locator('.weekly-briefing').waitFor();await page.locator('#mCloseBtn').click();
    check(await page.evaluate(()=>P.week===2&&P.weeklyBriefingHistory.length===1),'번아웃 이후 중복/교착');check(errors.length===0,errors.join(','));
    await page.evaluate(()=>{Math.random=window.__briefRandom;delete window.__briefRandom;save();});
    return {result:'BRIEFING_NARRATIVE_BOUNDARIES_PASS',soloSpeakers:speakers,burnoutOrder:['인연 장면','번아웃 알림','주간 브리핑'],pageErrors:errors};
  } finally {await page.evaluate(()=>{if(window.__briefRandom){Math.random=window.__briefRandom;delete window.__briefRandom;}});page.off('pageerror',onError);}
}
