const { test }=require('node:test');const assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
for(const pos of ['top','jg','mid','adc','sup'])test(`${pos}: 세 시즌 78주 실제 주간 처리`,async()=>{
  const g=game(97);g.run(`P.pos='${pos}';P.age=19;P.stage='pro';P.teamId=0;P.fastSkip=true;P.salary=1000000;P.money=5000000;P.s={mech:75,lane:75,macro:75,team:75,pool:75,mental:75};P.syn=4;`);
  for(let i=0;i<78;i++){
    await g.run('takeTurn(recommend())');
    assert.ok(g.run('P && Number.isFinite(P.money) && Object.values(P.s).every(Number.isFinite)'));
    assert.ok(g.run('P.money>=0&&P.week>=1&&P.week<=26&&P.hp>=0'));
  }
  assert.equal(g.run('P.year'),4);assert.equal(g.run('P.week'),1);assert.ok(g.run('P.hist.games')>0);
});
test('해외 제안 선택 후에도 팀 전력 계산이 가능하다',async()=>{
  const g=game();g.run("P.year=5;P.age=21;P.stage='pro';P.teamId=0;P.s={mech:95,lane:95,macro:95,team:95,pool:95,mental:95};ask=async(html,btns)=>html.includes('스토브리그')?btns.length-1:0;");
  await g.run('contracts()');assert.ok(Number.isFinite(g.run('teamPow()')));
});
for(const pos of ['jg','sup'])test(`${pos}: 새 선수의 추천 일정이 3시즌 내 프로 경로를 연다`,async()=>{
  const g=game(101);g.run(`P=makePlayer('초반검증','${pos}',rollBase('${pos}'));START_PERKS[0].apply(P);P.fastSkip=true;`);
  for(let i=0;i<78;i++)await g.run('takeTurn(recommend())');
  assert.notEqual(g.run('P.stage'),'ama');assert.ok(g.run('P.bestT')>=6);
});
