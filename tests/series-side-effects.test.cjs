const {test}=require('node:test'),assert=require('node:assert/strict'),{game}=require('./game-harness.cjs');
const setup=g=>g.run("P.stage='pro';P.teamId=0;P.syn=0;P.pro[0].str=65;checkHeroineUnlocks=async()=>{};");
const scripted=g=>g.run("playSingleSet=async()=>({win:true,rating:8,phaseWins:2,adv:2,championId:'azir',effects:{stats:Object.fromEntries(Object.keys(P.s).map(k=>[k,0])),stress:0},autoContinue:true,draft:null,kda:{kills:1,deaths:1,assists:1}});");
test('대표 세트 효과 0은 기존 130 초과 능력치를 깎지 않는다',async()=>{const g=game();setup(g);scripted(g);g.run('P.s.mech=155;');await g.run("playMatch({name:'상대',str:65},'검사',false,true,{bestOf:3})");assert.equal(g.run('P.s.mech'),155);});
test('기존 숫자 라이벌 ID가 새 시리즈 정산에서도 이어진다',async()=>{const g=game();setup(g);scripted(g);g.run("const s=ensureSeasonJourney();s.rival={id:1,league:'pro',name:P.pro[1].name,games:0,wins:0};");await g.run("playMatch(P.pro[1],'LCK 스프링 1라운드',false,true,{bestOf:3})");assert.equal(g.run('P.seasonJourney.rival.games'),1);assert.equal(g.run('P.seasonJourney.rival.wins'),1);});
test('수동 국면의 자동 버튼은 다음 세트까지 전파되어 입력을 한 번만 요구한다',async()=>{
 const g=game(19);setup(g);let phaseInputs=0;
 g.run("$('#main');$('#mBtns');$('#nextBtn')");
 g.nodes.get('#mBtns').appendChild=e=>{if(e.innerHTML.includes('출전 확정'))Promise.resolve().then(()=>e.onclick());};
 g.nodes.get('#main').querySelectorAll=selector=>selector==='.choices .btn'?[{dataset:{i:'auto'},disabled:false,set onclick(fn){phaseInputs++;Promise.resolve().then(fn);}}]:[];
 Object.defineProperty(g.nodes.get('#nextBtn'),'onclick',{set(){throw Error('자동 버튼 이후 계속 입력이 발생했습니다.');}});
 const r=await g.run("playMatch({name:'상대',str:65},'LCK 스프링 1라운드',false,false,{bestOf:3,control:'manual'})");
 assert.equal(phaseInputs,1);assert.ok(r.sets.length>=2);assert.equal(g.run('currentAskResolve'),null);assert.equal(g.run('P.hist.games'),1);
});
