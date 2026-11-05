// 실제 DOM의 색 대비·표면·선택 표시를 확인한다. 별도 컨텍스트만 사용한다.
async original=>{
 const context=await original.context().browser().newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],screens=[],contrastIssues=[];page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
 const check=(v,m)=>{if(!v)throw Error(m);},verify=true;
 const inspect=async name=>{
  await page.waitForTimeout(250);
  const data=await page.evaluate(()=>{
   const root=document.querySelector('#modal:not(.hidden) .box')||document.querySelector('#main'),rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number),lum=c=>{const a=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
   const issues=[],walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let text;
   while(text=walk.nextNode()){
    const e=text.parentElement;if(!text.textContent.trim()||e.closest('button:disabled,.locked,[hidden],svg,style,script'))continue;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);if(!r.width||!r.height||r.bottom<=0||r.top>=innerHeight||cs.visibility==='hidden'||cs.display==='none')continue;
    let opacity=1,layer=e,bg=null,photo=false;
    while(layer){const s=getComputedStyle(layer);opacity*=+s.opacity;if(s.backgroundImage!=='none')photo=true;const c=rgb(s.backgroundColor);if(c.length===3||c[3]>=.99){bg=c;break;}layer=layer.parentElement;}
    if(!bg||opacity<.9||photo||e.closest('.vn-portrait,.cine-banner-wrap,.roster-open,.insta-photo-wrap'))continue;
    const a=lum(rgb(cs.color)),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),large=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
    if(ratio<(large?3:4.5))issues.push({text:text.textContent.trim().slice(0,65),tag:e.tagName,cls:e.className,color:cs.color,bg,ratio:+ratio.toFixed(2)});
   }
   return{width:innerWidth,doc:document.documentElement.scrollWidth,client:root.clientWidth,scroll:root.scrollWidth,bg:getComputedStyle(root).backgroundColor,issues};
  });check(data.doc<=data.width&&data.scroll<=data.client+1,name+' 가로 넘침');if(verify&&await page.locator('#modal:not(.hidden)').count())check(data.bg==='rgb(29, 43, 58)',name+' 모달 표면 미적용');contrastIssues.push(...data.issues.map(x=>({view:name,...x})));screens.push({name,...data});if(data.width===390)await page.screenshot({path:'output/playwright/midnight-after-'+name+'.png',animations:'disabled'});
 };
 const close=()=>page.locator('#mCloseBtn').click();
 try{
  await page.goto('http://127.0.0.1:5544/');if(await page.locator('#introSplash').isVisible())await page.locator('#skipIntroBtn').click();await page.locator('#introSplash').waitFor({state:'hidden'});
  await inspect('create');
  await page.evaluate(()=>{P=makePlayer('미드나이트검증','mid',{mech:68,lane:68,macro:68,team:68,pool:68,mental:65});P.stage='pro';P.teamId=0;P.hist.bestStage='pro';P.money=5000000;P.fans=5000;P.age=19;P.salary=300000;for(const k of ['jieun','harin','mina'])P.bonds[k].unlocked=true;ensureSeasonJourney().opened=true;save();render();});
  if(verify){const colors=await page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor,button:getComputedStyle(document.querySelector('#bAutoSeason')).backgroundColor,ink:getComputedStyle(document.querySelector('#bAutoSeason')).color}));check(colors.bg==='rgb(17, 26, 36)','선택② 배경 미적용');check(colors.button==='rgb(128, 201, 213)'&&colors.ink==='rgb(18, 38, 44)','선택② 주요 버튼 미적용');}
  await inspect('home');await page.locator('.stats-panel>summary').click();await page.locator('.stats-panel').scrollIntoViewIfNeeded();await inspect('stats');await page.locator('.stats-panel>summary').click();await page.locator('.week-card').scrollIntoViewIfNeeded();await inspect('match-preview');await page.locator('.action-panel>summary').click();await inspect('actions');
  for(const view of ['season','record','rank','bonds','sns','wealth','shop','auto-setup','dialogue']){
   await page.evaluate(view=>{if(view==='season')showSeasonHub();if(view==='record')showRecord();if(view==='rank')showLeaderboardModal();if(view==='bonds')showBondsModal();if(view==='sns')showSnsModal();if(view==='wealth')showWealthModal();if(view==='shop')showHubShop();if(view==='auto-setup')showAutomaticSeasonSetup();if(view==='dialogue')showYouthPresentation('mina',safeRelationshipPresentation('mina','패배가 아쉽지만 다음 경기를 준비하자.','경기가 끝난 뒤'));},view);
   await page.locator('#modal:not(.hidden)').waitFor();for(const [width,height]of [[320,568],[390,844],[1100,844],[844,390]]){await page.setViewportSize({width,height});await inspect(view);}await close();
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{P.sns.posts=[{id:'theme-post',img:COMMON_SHARED_PHOTOS.walk.img,caption:'경기가 끝난 뒤 함께 걷는 길.',likes:12,comments:[{u:'동료',t:'오늘 경기 수고했어.'}],time:'1년차 1주차'}];P.dms.list=[{id:'theme-dm',sender:'강하린',badge:'친구',tagCls:'tag-heroine',avatar:'assets/harin.jpg',msg:'다음 경기 준비도 잘해.',time:'1년차 1주차',read:true}];activeSnsTab='feed';showSnsModal();});await page.locator('.insta-time-row').scrollIntoViewIfNeeded();await inspect('sns-post-time');await page.locator('#tabDm').scrollIntoViewIfNeeded();await page.locator('#tabDm').click();await page.locator('.insta-dm-item').waitFor();await inspect('sns-dm');await close();
  if(verify)check(contrastIssues.length===0,'글자 대비 부족 '+JSON.stringify(contrastIssues));check(!errors.length,errors.join('\n'));return{result:verify?'MIDNIGHT_THEME_BROWSER_PASS':'MIDNIGHT_BEFORE_CAPTURED',screens,contrastIssues,pageErrors:errors};
 }finally{await context.close();}
}
