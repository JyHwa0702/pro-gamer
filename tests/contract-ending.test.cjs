const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const plain=v=>JSON.parse(JSON.stringify(v));
test('금메달 기록을 가진 커리어의 관계 후일담은 무관으로 잘못 서술하지 않는다',async()=>{
 const g=game();g.run("P.age=28;P.year=12;P.hist.titles=['1년차 아시안게임 금메달 🥇'];P.bonds.jieun.aff=70;P.bonds.harin.unlocked=true;P.bonds.harin.aff=70;let endingText='';ask=async html=>{endingText=html;return -1;};");
 await g.run('ending(true)');assert.ok(!g.run('endingText').includes('우승 기록 없이'));assert.ok(g.run('endingText').includes('금메달'));
});

test('성과급은 서명 확정 뒤 실제 POG에만 지급하고 연간 상한·재지급 방지를 지킨다',async()=>{
 const g=game();g.run("P.stage='pro';P.teamId=0;const draft={};let askCount=0;ask=async()=>askCount++===0?3:0;");
 const before=g.run('P.money');assert.equal(await g.run('negotiateSalary(P.pro[0],300000,false,draft)'),330000);
 assert.equal(g.run('P.contractBonus || null'),null);g.run('commitSalaryContract(draft,330000)');
 assert.equal(g.run('P.contractBonus.cap'),600000);
 g.run("settleMatchResult({win:true,rating:9,phaseWins:3,big:false,label:'LCK 정규'})");
 assert.equal(g.run('P.money'),before+30000);
 assert.equal(g.run("payContractBonus('pog','pog:1','중복 POG')"),0);
 for(let i=0;i<8;i++)g.run(`payContractBonus('title','title:${i}','LCK 우승')`);
 assert.equal(g.run('P.money'),before+600000);assert.equal(g.run('P.contractBonus.paid'),600000);
 const snap=JSON.stringify(g.run('P'));g.run('renderContractBonusLedger()');assert.equal(JSON.stringify(g.run('P')),snap);
 g.run("save();P=load();payContractBonus('title','title:0','LCK 우승')");assert.equal(g.run('P.money'),before+600000);
 g.run("P.year++;payContractBonus('pog','next-year','만료 경기')");assert.equal(g.run('P.money'),before+600000);
});
test('서명 취소·선수 교체는 기존 옵션 보존, 일반계약은 옵션 해제',async()=>{
 const g=game();g.run("P.stage='pro';P.teamId=0;const draft={};let count=0;ask=async()=>count++===0?3:0;");
 await g.run('negotiateSalary(P.pro[0],300000,false,draft)');g.run('commitSalaryContract(draft,330000)');const old=plain(g.run('P.contractBonus'));
 g.run('const canceled={};count=0;ask=async()=>count++===0?3:-1');assert.equal(await g.run('negotiateSalary(P.pro[0],900000,false,canceled)'),null);assert.deepEqual(plain(g.run('P.contractBonus')),old);
 g.run('const stale={};count=0;ask=async()=>count++===0?3:0');await g.run('negotiateSalary(P.pro[0],900000,false,stale)');g.run("P=makePlayer('다른선수','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55})");assert.equal(g.run('commitSalaryContract(stale,990000)'),false);assert.equal(g.run('P.contractBonus || null'),null);
 g.run("P.stage='pro';P.teamId=0;const standard={};count=0;ask=async()=>count++===0?0:0");await g.run('negotiateSalary(P.pro[0],300000,false,standard)');assert.equal(g.run('commitSalaryContract(standard,300000)'),true);assert.equal(g.run('P.contractBonus'),null);
});
test('구세이브와 손상된 계약 필드는 자산을 보존하며 가짜 성과급을 만들지 않는다',()=>{
 for(const bad of [undefined,null,'bad',{}, {year:1,cap:Infinity}]){const g=game();const p=plain(g.run('P'));p.contractBonus=bad;p.contractBonusHistory='bad';g.storage.set('progamer_save',JSON.stringify(p));g.run('P=load()');assert.equal(g.run('P.money'),p.money);assert.equal(g.run('P.contractBonus'),null);assert.deepEqual(plain(g.run('P.contractBonusHistory')),[]);}
});
async function endingHtml(g){g.run('globalThis.endHtml="";ask=async html=>{endHtml=html;return -1}');await g.run('ending(true)');return g.run('endHtml');}
test('엔딩 리그 평가는 LCK·구 KCL 우승만 세고 챌린저스·진출·준우승을 제외',async()=>{
 const g=game();g.run("P.hist.bestStage='pro';P.hist.titles=['1년차 LCK 스프링 우승','2년차 KCL 서머 우승','3년차 LCK 챌린저스 우승','4년차 월드 챔피언십 준우승'];");assert.match(await endingHtml(g),/⭐ 레전드/);
 g.run("P.hist.titles=['1년차 LCK 챌린저스 우승','2년차 LCK 진출','3년차 월드 챔피언십 준우승']");assert.match(await endingHtml(g),/🎽 프로게이머/);
 g.run("P.hist.titles=['1년차 월드 챔피언십 우승']");assert.match(await endingHtml(g),/👑 전설/);
});
test('엔딩은 친밀도만으로 웨딩·트루엔딩·트로피 획득을 지어내지 않는다',async()=>{
 const g=game();g.run('P.age=28;P.year=12;P.bonds.jieun.aff=70;P.bonds.jieun.lv=0;');assert.doesNotMatch(await endingHtml(g),/웨딩|영원한 약속/);
 g.run('P.bonds.harin.aff=70;P.bonds.harin.unlocked=true');let html=await endingHtml(g);assert.doesNotMatch(html,/트루 엔딩|모든 트로피/);assert.match(html,/우승 기록 없이/);
 g.run('P.bonds.harin.aff=0;P.bonds.jieun.lv=4');assert.match(await endingHtml(g),/웨딩/);
 g.run('P.age=18;P.year=2');assert.doesNotMatch(await endingHtml(g),/웨딩|영원한 약속/);
});
test('실제 스토브리그의 성과급 계약과 일반 재계약에 옵션 확정이 연결된다',async()=>{
 const g=game();g.run("P.stage='pro';P.teamId=0;P.week=24;P.ratings=[8];ask=async(html,buttons)=>html.includes('연봉 협상 테이블')?buttons.findIndex(b=>b.t.includes('4.')):0");
 await g.run('contracts()');assert.equal(g.run('validContractBonus(P.contractBonus)'),true);assert.equal(g.run('P.salary'),g.run('Math.round(P.contractBonus.baseSal*1.1)'));
 const before=g.run('P.money');g.run("P.year++;P.week=1;settleMatchResult({win:true,rating:9,phaseWins:3,big:false,label:'다음시즌실제계약뒤경기'})");assert.equal(g.run('P.money')-before,g.run('P.contractBonus.pog'));
 g.run('ask=async()=>0');await g.run('contracts()');assert.equal(g.run('P.contractBonus'),null);assert.equal(g.run('P.contractBonusHistory.length'),1);
});
test('1군 직행 스카우트도 최종 팀과 서명 조건에만 성과급을 연결한다',async()=>{
 const g=game();g.run("P.rank.t=9;Object.keys(P.s).forEach(k=>P.s[k]=100);Math.random=()=>0;ask=async(html,buttons)=>html.includes('연봉 협상 테이블')?buttons.findIndex(b=>b.t.includes('4.')):0");
 await g.run('scouting()');assert.equal(g.run('P.stage'),'pro');assert.equal(g.run('P.contractBonus.teamId'),g.run('P.teamId'));assert.equal(g.run('validContractBonus(P.contractBonus)'),true);
});
test('고액 기본 제시에도 POG10만·우승50만·연간100만 상한과 다음 계약 연간누적 보존',async()=>{
 const g=game();g.run("P.stage='pro';P.teamId=0;const draft={};ask=async(html,buttons)=>html.includes('연봉 협상 테이블')?buttons.findIndex(b=>b.t.includes('4.')):0");
 await g.run('negotiateSalary(P.pro[0],1e9,false,draft)');g.run('commitSalaryContract(draft,1.1e9)');assert.equal(g.run('P.contractBonus.pog'),100000);assert.equal(g.run('P.contractBonus.title'),500000);assert.equal(g.run('P.contractBonus.cap'),1000000);
 const before=g.run('P.money');g.run("recordTitleReward('1년차 LCK 스프링 우승');recordTitleReward('1년차 LCK 스프링 우승');");assert.equal(g.run('P.money')-before,500000);
 g.run('const nextDraft={}');await g.run('negotiateSalary(P.pro[0],1e9,true,nextDraft)');g.run("commitSalaryContract(nextDraft,1.1e9);recordTitleReward('1년차 LCK 서머 우승');recordTitleReward('1년차 월드 챔피언십 우승')");assert.equal(g.run('P.money')-before,1000000);
});
test('실제 월즈 결승·국가대표 우승 경로에서 기존 상금 외 계약 성과급이 기록된다',async()=>{
 for(const action of ["worlds('wf')",'triggerAsianGames()','playAsianGamesTournament()']){const g=game();g.run("P.stage='pro';P.teamId=0;P.worldsQ=true;P.worldsAlive=true;const draft={};ask=async(html,buttons)=>html.includes('연봉 협상 테이블')?buttons.findIndex(b=>b.t.includes('4.')):0");await g.run('negotiateSalary(P.pro[0],300000,false,draft)');g.run("commitSalaryContract(draft,330000);playMatch=async()=>({win:true});ask=async()=>0");await g.run(action);assert.equal(g.run('P.contractBonusHistory.length'),1);assert.equal(g.run('P.contractBonusHistory[0].kind'),'title');assert.equal(g.run('P.contractBonusHistory[0].amount'),150000);}
});
test('청춘4단계의 성인화는 결혼을 만들지 않고 성인 약속·실제 혼인기록을 존중한다',async()=>{
 const g=game();g.run('P.age=28;P.year=12;P.bonds.jieun.aff=100;P.bonds.jieun.lv=4;P.bonds.jieun.youthMilestones=[1,2,3,4]');assert.doesNotMatch(await endingHtml(g),/웨딩/);
 g.run('P.bonds.jieun.adultLifetimePromise=true');assert.match(await endingHtml(g),/웨딩/);
 g.run('P.bonds.jieun.lv=0;P.bonds.jieun.adultLifetimePromise=false;P.bonds.jieun.married=true');assert.match(await endingHtml(g),/웨딩/);
 g.run('P.year=1');assert.doesNotMatch(await endingHtml(g),/웨딩/);
});
test('24주 이후 스토브리그 옵션은 다음 시즌에만 지급하고 3년차에는 만료된다',async()=>{
 for(const week of [24,25,26]){const g=game();g.run(`P.stage='pro';P.teamId=0;P.week=${week};const draft={};ask=async(html,buttons)=>html.includes('연봉 협상 테이블')?buttons.findIndex(b=>b.t.includes('4.')):0`);await g.run('negotiateSalary(P.pro[0],300000,true,draft)');g.run('commitSalaryContract(draft,330000)');assert.equal(g.run('P.contractBonus.year'),2);
 const before=g.run('P.money');g.run("settleMatchResult({win:true,rating:9,phaseWins:3,big:false,label:'서명해경기'})");assert.equal(g.run('P.money'),before);assert.match(g.run('renderContractBonusLedger()'),/2년차/);
 g.run("P.year=2;P.week=1;save();P=load();settleMatchResult({win:true,rating:9,phaseWins:3,big:false,label:'적용시즌'})");assert.equal(g.run('P.money'),before+30000);
 g.run("P.year=3;P.week=1;settleMatchResult({win:true,rating:9,phaseWins:3,big:false,label:'만료경기'})");assert.equal(g.run('P.money'),before+30000);}
});
test('계약 제안 대기 중 선수를 바꾸면 이전 선수의 오퍼를 새 선수에게 적용하지 않는다',async()=>{
 const g=game();g.run("P.stage='pro';P.teamId=0;P.ratings=[8];let replacement;ask=async(html)=>{if(html.includes('스토브리그 - 계약 제안')){P=makePlayer('교체선수','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55});replacement=JSON.stringify(P);}return 0;}");await g.run('contracts()');assert.equal(JSON.stringify(g.run('P')),g.run('replacement'));
});
