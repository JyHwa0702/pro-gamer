const {test}=require('node:test'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));
test('메뉴 분류는 선택의 원래 인덱스와 닫기를 보존한다',()=>{
 const g=game();g.run("let choices=[{t:'주거',group:'house'},{t:'차량',group:'car'},{t:'팬클럽',group:'club'},{t:'닫기',type:'close'}]");assert.deepEqual(plain(g.run("menuChoiceIndexes(choices,'car')")),[1,3]);assert.deepEqual(plain(g.run("menuChoiceIndexes(choices,'all')")),[0,1,2,3]);assert.deepEqual(plain(g.run("menuChoiceIndexes(choices,'unknown')")),[0,1,2,3]);
});
test('분류는 알려진 표시 그룹만 만들며 원본 선택 배열을 변경하지 않는다',()=>{
 const g=game();g.run("let choices=[{t:'차량1',group:'car'},{t:'차량2',group:'car'},{t:'주거',group:'house'},{t:'닫기'}]");const before=JSON.stringify(g.run('choices'));const groups=plain(g.run('menuChoiceGroups(choices)'));assert.equal(groups.find(x=>x.key==='car').count,2);assert.equal(JSON.stringify(g.run('choices')),before);assert.deepEqual(plain(g.run("menuChoiceGroups([{group:'constructor'}])")),[]);
});
test('아이템 표시의 이름·비용·상태는 실제 선택 문자열과 일치한다',()=>{
 const g=game();const a=plain(g.run("menuChoicePresentation({t:'구매 · 테스트 주택 · 100만 원',type:'house',item:{n:'테스트 주택'}})"));assert.equal(a.title,'테스트 주택');assert.ok(a.detail.includes('구매'));assert.ok(a.detail.includes('100만 원'));assert.ok(!a.detail.includes('테스트 주택'));const b=plain(g.run("menuChoicePresentation({t:'✨ [기념 스킨] 장착하기',type:'equip',skin:{n:'기념 스킨'}})"));assert.equal(b.title,'기념 스킨');assert.equal(b.detail,'장착하기');
});
test('선택 표시 정보는 가격이나 선수 상태·보유 목록을 바꾸지 않는다',()=>{
 const g=game(),before=JSON.stringify(g.run('P'));g.run("menuChoicePresentation({t:'키보드 (80만원)',type:'gear',item:{n:'키보드',c:800000}});menuChoiceGroups([{group:'house'}]);menuChoiceIndexes([{group:'house'},{t:'닫기'}],'house')");assert.equal(JSON.stringify(g.run('P')),before);
});
