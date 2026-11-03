// 독립 로컬 origin의 테스트 세이브 전용. 실제 정산·대화·저장 함수는 대체하지 않는다.
async page => {
 const check=(ok,msg)=>{if(!ok)throw Error(msg);},errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);page.setDefaultTimeout(12000);
 const close=()=>page.locator('#mCloseBtn').click(),button=t=>page.locator('#mBtns button').filter({hasText:t});
 const scenes=[],youth=[],actions=[];let contract=false;
 const dismissIntro=async()=>{if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});};
 try{
  await page.reload();await dismissIntro();await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{let seed=101;window.__polishRandom=Math.random;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};P=makePlayer('한 시즌의 약속','mid',{mech:68,lane:68,macro:68,team:68,pool:68,mental:65});P.stage='pro';P.teamId=0;P.salary=300000;P.money=5000000;P.fans=5000;P.syn=3;P.fastSkip=true;P.maxHp=100;P.properties=[];for(const k of ['harin','mina'])P.bonds[k].unlocked=true;syncHeroineAges();save();render();});
  await page.locator('#bSeason').click();await page.locator('#seasonCompanion').selectOption('harin');await button('균형').click();await close();
  for(let week=1;week<=26;week++){
   check(await page.evaluate(()=>P.week)===week,'주차 시작 '+week);actions.push(await page.evaluate(()=>recommendationPlan().key));
   await page.locator('#bFastTurn').click();let done=false;
   for(let step=0;step<120;step++){
    if(await page.evaluate(()=>!busy)){done=true;break;}
    if(await page.locator('#modal:not(.hidden)').isVisible()){
     const text=await page.locator('#mBody').innerText();
     if(await page.locator('.season-review').count()){await page.waitForTimeout(700);await page.screenshot({path:'docs/reports/season-polish/season-review-mobile.png',animations:'disabled'});}
     const marker=page.locator('[data-season-scene]');if(await marker.count())scenes.push(await marker.getAttribute('data-season-scene'));
     if(text.includes('하린의 첫 리플레이 해설 방송')||text.includes('겹친 일정, 지킬 수 있는 약속')||text.includes('틀린 장면까지 담은 첫 해설')){youth.push({week,text:text.slice(-400)});check(!/침실|밀착|스킨십/.test(text),'청춘 보호 경계');await page.screenshot({path:'docs/reports/season-polish/youth-'+week+'.png',animations:'disabled'});}
     if(text.includes('연봉 협상 테이블')){await button('성과급 인센티브 옵션').click();contract=true;continue;}
     const buttons=page.locator('#mBtns button:enabled');if(await buttons.count())await buttons.first().click();else await close();
    }else if(await page.locator('#nextBtn').isVisible())await page.locator('#nextBtn').click();else await page.waitForTimeout(30);
   }
   check(done,'주간 완료 '+week);check(await page.locator('#modal:not(.hidden)').count()===0,'일반 결과가 진행을 멈춤 '+week);
   check(await page.locator('[data-weekly-result]').count()===1,'홈 결과 누락 '+week);
  }
  const result=await page.evaluate(()=>({year:P.year,week:P.week,record:P.seasonArchive[0],youth:P.bonds.harin.youthArc,contract:P.contractBonus}));
  check(result.year===2&&result.week===1,'시즌 종료');check(result.record.progress.done,'균형 목표 미달');check(result.record.contactWeeks.length>=4,'소통 주차');check(result.youth.step===3&&result.youth.outcome==='kept','준비/후속 분기');check(contract&&result.contract?.year===2,'다음 시즌 계약');
  const stable=await page.evaluate(()=>JSON.stringify(P));await page.locator('#bLastBriefing').click();await page.locator('.weekly-briefing').waitFor();
  for(const width of [320,390,1100]){await page.setViewportSize({width,height:900});const b=await page.locator('#modal .box').evaluate(e=>({w:e.clientWidth,s:e.scrollWidth}));check(b.s<=b.w+1,'결과 넘침 '+width);}
  await close();check(await page.evaluate(()=>JSON.stringify(P))===stable,'재열람 재정산');
  await page.reload();await dismissIntro();const reloaded=await page.evaluate(()=>JSON.stringify(P));if(reloaded!==stable){const differences=[];const diff=(a,b,path='P')=>{if(JSON.stringify(a)===JSON.stringify(b))return;if(!a||!b||typeof a!=='object'||typeof b!=='object'){differences.push({path,before:a,after:b});return;}for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],path+'.'+k);};diff(JSON.parse(stable),JSON.parse(reloaded));check(differences.length===0,'새로고침 저장 호환 '+JSON.stringify(differences.slice(0,5)));}
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{ensureSeasonJourney().opened=true;P.seasonJourney.companion='harin';render();});
  for(const width of [320,390,1100]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'홈 넘침 '+width);check(await page.locator('.season-companion-preview img').evaluate(e=>e.complete&&e.naturalWidth>0),'시즌 이미지 누락');if(width===390||width===1100)await page.screenshot({path:'docs/reports/season-polish/home-'+width+'.png',animations:'disabled'});}
  await page.locator('#bSeason').click();await page.locator('#seasonCareer').click();check((await page.locator('#mBody').innerText()).includes('성과급'),'성과급 내역');await close();
  check(errors.length===0,errors.join(','));return {result:'SEASON_POLISH_26_WEEK_BROWSER_PASS',weeks:26,actions,scenes,youthScenes:youth,goal:result.record.progress,contactWeeks:result.record.contactWeeks,youthArc:result.youth,contract:result.contract,widths:[320,390,1100],readOnlyReplay:true,reload:true,pageErrors:errors};
 }finally{await page.evaluate(()=>{if(window.__polishRandom){Math.random=window.__polishRandom;delete window.__polishRandom;}save();});page.off('pageerror',onError);}
}
