// 독립 로컬 origin 전용. 결과 DOM만 추가하며 게임 상태/저장/난수를 변경하지 않는다.
async page => {
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);
  try {
    await page.emulateMedia({reducedMotion:'no-preference'});
    const first=await page.evaluate(()=>{
      const before={state:JSON.stringify(P),saves:JSON.stringify({...localStorage})};
      const fixture=document.createElement('section');fixture.id='resultMotionFixture';
      fixture.innerHTML='<div class="brief-metric"><span>스트레스</span><strong>20.0</strong><small>32.0 → 20.0</small><b>-12.0</b></div><div class="brief-metric"><span>현금</span><strong>1,234원</strong><small>2,000 → 1,234</small><b>-766원</b></div><div class="season-result-grid"><div><b>+1.2만</b><small>팬 순변화</small></div><div><b>승리</b><small>설명</small></div><div><b>0</b><small>공식 경기</small></div></div>';
      document.body.append(fixture);return before;
    });
    await page.waitForFunction(()=>document.querySelector('#resultMotionFixture .brief-metric').classList.contains('result-positive'),{},{timeout:2000});
    const during=await page.evaluate(()=>({aria:document.querySelector('#resultMotionFixture strong').getAttribute('aria-label'),negative:document.querySelectorAll('#resultMotionFixture .brief-metric')[1].classList.contains('result-negative'),unparsed:document.querySelectorAll('#resultMotionFixture .season-result-grid b')[1].textContent}));
    check(during.aria==='20.0'&&during.negative&&during.unparsed==='승리','접근성/손실/서술 보존');
    const intermediate=await page.evaluate(async()=>{
      const card=document.createElement('div');card.id='intermediateResult';card.className='brief-metric';card.innerHTML='<span>팬</span><strong>100,000</strong><small>0 → 100,000</small>';document.body.append(card);
      for(let i=0;i<3;i++)await new Promise(requestAnimationFrame);
      return Number(card.querySelector('strong').textContent.replace(/,/g,''));
    });
    check(intermediate>0&&intermediate<100000,'숫자 중간 프레임 증가');
    await page.emulateMedia({reducedMotion:'reduce'});
    // Chromium dispatches matchMedia change at its next rendering opportunity.
    await page.evaluate(()=>new Promise(requestAnimationFrame));
    check(await page.locator('#intermediateResult strong').textContent()==='100,000','동작 줄이기 변경 시 즉시 완료');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForTimeout(800);
    const settled=await page.evaluate(()=>{
      const fixture=document.querySelector('#resultMotionFixture');let mutations=0;
      const watch=new MutationObserver(records=>{mutations+=records.length;});watch.observe(fixture,{childList:true,subtree:true});
      window.__resultMotionWatch={watch,count:()=>mutations};
      return {values:[...fixture.querySelectorAll('strong,.season-result-grid b')].map(n=>n.textContent),state:JSON.stringify(P),saves:JSON.stringify({...localStorage})};
    });
    check(JSON.stringify(settled.values)===JSON.stringify(['20.0','1,234원','+1.2만','승리','0']),'최종 숫자 원문');
    check(settled.state===first.state&&settled.saves===first.saves,'결과 연출의 게임/저장 불변');
    await page.waitForTimeout(200);
    check(await page.evaluate(()=>window.__resultMotionWatch.count())===0,'관찰자 자체 재실행');
    await page.evaluate(()=>{
      window.__resultMotionWatch.watch.disconnect();delete window.__resultMotionWatch;
      const fixture=document.querySelector('#resultMotionFixture');fixture.remove();document.body.append(fixture);
    });
    await page.waitForTimeout(50);
    check(await page.locator('#resultMotionFixture strong').first().textContent()==='20.0','같은 DOM 재삽입 재연출 금지');
    // 진행 중 제거하면 분리된 노드도 원문으로 복구되고 RAF는 이어지지 않는다.
    await page.evaluate(()=>{
      const card=document.createElement('div');card.className='brief-metric';card.innerHTML='<span>팬</span><strong>99,999</strong><small>0 → 99,999</small>';
      document.body.append(card);window.__removedResult=card;
    });
    await page.waitForTimeout(50);await page.evaluate(()=>window.__removedResult.remove());
    await page.waitForTimeout(50);
    check(await page.evaluate(()=>window.__removedResult.querySelector('strong').textContent)==='99,999','분리된 카드 애니메이션 취소/복구');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>{
      const card=document.createElement('div');card.id='reducedResult';card.className='brief-metric';card.innerHTML='<span>OVR</span><strong>75.25</strong><small>74 → 75.25</small>';document.body.append(card);
    });
    await page.waitForTimeout(30);
    check(await page.locator('#reducedResult strong').textContent()==='75.25','동작 줄이기 즉시 최종 숫자');
    check(await page.locator('#reducedResult').evaluate(n=>getComputedStyle(n).animationName)==='none','동작 줄이기 CSS');
    check(errors.length===0,'브라우저 오류 '+errors.join(', '));
    return {pass:true,checks:['역방향 색상','음수 색상','원문/aria-label','숫자 중간 프레임','800ms 내 완료','저장/게임 불변','observer 안정','DOM 재삽입','분리 시 취소','동작 줄이기/진행중 전환'],intermediate,pageErrors:errors};
  } finally {
    await page.evaluate(()=>{document.querySelector('#resultMotionFixture')?.remove();document.querySelector('#reducedResult')?.remove();document.querySelector('#intermediateResult')?.remove();delete window.__removedResult;});
    await page.emulateMedia({reducedMotion:null});page.off('pageerror',onError);
  }
}
