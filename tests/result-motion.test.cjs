const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');

test('결과 숫자는 부호·쉼표·소수·한국어 단위를 보존해 보간한다',()=>{
  const g=game();
  assert.equal(g.run('typeof parseResultNumber'),'function','결과 숫자 파서가 필요하다');
  for(const [text,value,half] of [
    ['+1,234원',1234,'+617원'],['−12.50',-12.5,'−6.25'],['+1.2만',1.2,'+0.6만'],
    ['-2.4억원',-2.4,'-1.2억원'],['24주',24,'12주'],['0',0,'0'],['1.00%',1,'0.50%']
  ]){
    assert.equal(g.run(`parseResultNumber(${JSON.stringify(text)}).value`),value,text);
    assert.equal(g.run(`formatResultNumber(parseResultNumber(${JSON.stringify(text)}),0.5)`),half,text);
    assert.equal(g.run(`formatResultNumber(parseResultNumber(${JSON.stringify(text)}),1)`),text,'최종 원문 '+text);
  }
});
test('서술·복합 수치와 비정상 큰 숫자는 임의 해석하지 않는다',()=>{
  const g=game();assert.equal(g.run('typeof parseResultNumber'),'function');
  for(const text of ['승리','1 → 2','2승 1패','1.2.3','Infinity','1e9','1,23원','9'.repeat(400),'1.'+'1'.repeat(101)])assert.equal(g.run(`parseResultNumber(${JSON.stringify(text)})`),null,text);
});
test('결과 색상은 증가·감소·변화 없음과 스트레스 역방향 의미를 반영한다',()=>{
  const g=game();assert.equal(g.run('typeof resultMotionTone'),'function');
  for(const [label,delta,expected] of [['OVR',1,'positive'],['현금',-100,'negative'],['팬',0,'neutral'],['스트레스',-12,'positive'],['스트레스',4,'negative'],['체력',-8,'negative']]){
    assert.equal(g.run(`resultMotionTone(${JSON.stringify(label)},${delta})`),expected,label);
  }
});
