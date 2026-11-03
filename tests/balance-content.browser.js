// 검증 전용 origin/브라우저에서 실행. 실제 사용자 세이브에는 실행하지 않는다.
async page => {
  const errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  const check=(value,message)=>{if(!value)throw Error(message);};
  try {
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    await page.evaluate(()=>{
      const p=makePlayer('호환성검증','mid',{mech:85,lane:85,macro:80,team:80,pool:75,mental:70});
      p.money=30000000000;p.fans=10000;p.stage='pro';p.teamId=0;p.year=3;p.age=19;p.salary=1000000;
      p.legacyNote={keep:true};delete p.fanclub;delete p.house;delete p.balanceSchema;
      localStorage.removeItem('proRoadSave_v4');localStorage.setItem('proRoadSave_v1',JSON.stringify(p));P=null;
    });
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    check(await page.evaluate(()=>P.legacyNote.keep && P.money===30000000000 && P.house==='house_goshiwon'),'이전 세이브 복원 실패');
    await page.locator('#bShop').click();await page.locator('#stSkin').click();
    await page.locator('#mBtns button').first().click();
    check(await page.evaluate(()=>!!P.equippedSkin),'스킨 탭 구매 실패');
    await page.locator('#mCloseBtn').click();
    await page.locator('#bWealth').click();await page.locator('#tabReal').click();
    await page.locator('#mBtns button').filter({hasText:'신림동 풀옵션 원룸'}).click();
    check(await page.evaluate(()=>P.properties.includes('room')),'임대 부동산 구매 실패');
    await page.locator('#tabLife').click();
    await page.locator('#mBtns button').filter({hasText:'강남역 쾌적한 오피스텔'}).click();
    await page.locator('#mBtns button').filter({hasText:'국산 프리미엄 세단'}).click();
    await page.locator('#mBtns button').filter({hasText:'공식 팬클럽 창단'}).click();
    check(await page.evaluate(()=>P.house==='house_officetel'&&P.car==='car_sedan'&&P.fanclub.founded),'거주/차량/팬클럽 구매 실패');
    await page.locator('#mCloseBtn').click();
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    check(await page.evaluate(()=>P.house==='house_officetel'&&P.car==='car_sedan'&&P.fanclub.founded&&!!P.equippedSkin&&P.legacyNote.keep),'구매 내역 재로드 실패');
    await page.evaluate(()=>{
      const t=DM_TEMPLATES.find(t=>t.id==='dm_sponsor_keyboard');
      P.dms={unread:1,list:[{templateId:t.id,sender:t.sender,msg:t.msg,choices:t.choices,read:false}]};save();
    });
    await page.reload();await page.locator('#introSplash').waitFor({state:'hidden'});
    const cash=await page.evaluate(()=>P.money);
    await page.locator('#bSns').click();await page.locator('#tabDm').click();
    await page.locator('.insta-dm-item').first().click();await page.locator('#mBtns button').first().click();
    check(await page.evaluate(()=>P.dms.list[0].claimed&&P.dms.unread===0),'저장 후 DM 수락 실패');
    check(await page.evaluate(()=>P.money)===cash+7000000,'저장 후 협찬 보상 불일치');
    await page.locator('.insta-dm-item').first().click();await page.locator('#mBtns button').first().click();
    check(await page.evaluate(()=>P.money)===cash+7000000,'DM 중복 보상');
    await page.locator('#mCloseBtn').click();
    await page.locator('#bSns').click();await page.locator('#tabFeed').click();
    await page.locator('#bPickGallery').click();await page.locator('#mCloseBtn').click();
    await page.locator('#bCreatePost').waitFor();await page.locator('#mCloseBtn').click();
    await page.evaluate(()=>{window.__salaryResult='pending';negotiateSalary(P.pro[P.teamId],P.salary,true).then(v=>window.__salaryResult=v);});
    await page.locator('#mCloseBtn').click();await page.waitForFunction(()=>window.__salaryResult===null);
    check(errors.length===0,'런타임 오류: '+errors.join(', '));
    await page.screenshot({path:'.system_generated/keyboard/balance-after.png'});
    return {result:'BALANCE_BROWSER_PASS',checks:['v1 세이브 로드','스킨 탭 구매','임대 구매','주거·차량·팬클럽','재로드 보존','저장 DM 수락/중복 방지','갤러리 취소/복귀','협상 취소'],pageErrors:errors};
  } finally {page.off('pageerror',onError);}
}
