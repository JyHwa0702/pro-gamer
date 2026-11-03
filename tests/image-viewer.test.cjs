const {test}=require('node:test'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
test('확대 크기는 이미지 비율을 유지하고 배율을1~4배로 제한한다',()=>{
 const g=game();assert.equal(g.run('typeof imageViewerSize'),'function');
 for(const [w,h,vw,vh,z] of [[600,900,390,700,1],[900,600,1100,800,2],[600,900,320,500,99]]){
  const r=g.run(`imageViewerSize(${w},${h},${vw},${vh},${z})`);assert.ok(Math.abs(r.width/r.height-w/h)<.001);assert.ok(r.zoom>=1&&r.zoom<=4);if(z===1){assert.ok(r.width<=vw);assert.ok(r.height<=vh);}
 }
});
test('깨진 이미지 크기에도 유한한 화면 맞춤 결과를 반환한다',()=>{
 const g=game();const a=g.run('imageViewerSize(0,NaN,0,0,Infinity)');assert.ok(Number.isFinite(a.width)&&Number.isFinite(a.height));assert.equal(a.zoom,1);
});
