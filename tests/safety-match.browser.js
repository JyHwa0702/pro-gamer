async page => {
  const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  const check=(v,m)=>{if(!v)throw Error(m);};
  try {
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    await page.evaluate(()=>{
      P.age=17;const h=HEROINES.camila,st=h.story[1];
      window.__safeResult='pending';
      showHeroineCutscene('camila','<div class="vn-dialogue">'+st.dialogue+'</div>',st.choice.map(t=>({t})),h.dates[0].img).then(v=>window.__safeResult=v);
    });
    check(await page.locator('#modal img').getAttribute('src')==='assets/camila.jpg','미성년 기본 초상화 차단 실패');
    const labels=await page.locator('#mBtns button').allTextContents();
    check(labels.every(t=>['응원의 마음을 전한다','차분하게 이야기를 나눈다'].includes(t)),'미성년 선택지 차단 실패');
    await page.locator('#mCloseBtn').click();await page.waitForFunction(()=>window.__safeResult===-1);
    await page.evaluate(()=>{
      P.age=19;P.fastSkip=false;P.hp=100;P.stress=10;P.stage='pro';P.teamId=0;
      P.__oldGames=P.hist.games;window.__savedRandom=Math.random;Math.random=()=>.9;
      window.__matchResult=null;playMatch({name:'브라우저 검증팀',str:70},'LCK 그랜드 파이널 (결승전)',true).then(r=>window.__matchResult=r);
    });
    await page.locator('#mCloseBtn').click();
    for(let i=0;i<3;i++)await page.locator('.choices button[data-i="auto"]').click();
    await page.locator('#nextBtn').click();
    for(let i=0;i<30;i++){
      if(await page.evaluate(()=>!!window.__matchResult))break;
      if(await page.locator('#modal').isVisible())await page.locator('#mCloseBtn').click();
      else await page.waitForTimeout(50);
    }
    const result=await page.evaluate(()=>({r:window.__matchResult,games:P.hist.games,oldGames:P.__oldGames}));
    check(result.r&&result.games===result.oldGames+1,'수동 경기 개인 기록 미정산');
    check((result.r.win?result.r.mySetW:result.r.mySetL)===3,'수동 결승 3선승 미반영');
    check(errors.length===0,'런타임 오류 '+errors.join(', '));
    return {result:'SAFETY_MANUAL_BROWSER_PASS',minorChoices:labels,game:result.r,pageErrors:errors};
  } finally {await page.evaluate(()=>{if(window.__savedRandom)Math.random=window.__savedRandom;P.age=19;render();});page.off('pageerror',onError);}
}
