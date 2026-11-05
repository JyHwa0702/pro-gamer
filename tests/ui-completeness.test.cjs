const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {game}=require('./game-harness.cjs');

test('이미지 fallback은 같은 경로를 재시도하지 않고 마지막 실패에서 중단한다',()=>{
 const g=game();g.run("let picture={src:'assets/lost.png',dataset:{},onerror:()=>{}};let tried=[];");
 for(let i=0;i<8;i++)g.run("if(advanceImageFallback(picture,['assets/lost.png','lost.png','icon-192.png']))tried.push(picture.src)");
 assert.deepEqual(JSON.parse(JSON.stringify(g.run('tried'))),['lost.png','icon-192.png']);assert.equal(g.run('picture.onerror'),null);
});
test('같은 img의 사진을 바꾸면 이전 실패 경로는 새 사진의 fallback을 막지 않는다',()=>{
 const g=game();g.run("let picture={src:'old.jpg',dataset:{},onerror:()=>{}};advanceImageFallback(picture,['old.jpg','icon-192.png']);picture.src='new.jpg';picture.dataset={};advanceImageFallback(picture,['new.jpg','new-fallback.jpg','icon-192.png'])");
 assert.equal(g.run('picture.src'),'new-fallback.jpg');
});
test('구세이브의 손상된 현재 챔피언도 홈에 실존 에셋을 표시하며 저장 상태를 바꾸지 않는다',()=>{
 for(const c of [null,'azir',{id:'removed'},{id:'azir',n:'오래된 이름'}]){
  const g=game();g.run('P.currentChamp='+JSON.stringify(c));const before=JSON.stringify(g.run('P'));
  assert.doesNotThrow(()=>g.run('__nativeRender()'));const out=g.nodes.get('#main').innerHTML;assert.ok(!out.includes('undefined.png'));assert.ok(out.includes('alt="아지르"'));assert.equal(JSON.stringify(g.run('P')),before);
 }
 const g=game();assert.ok(fs.existsSync(g.run('getChampIcon(null)')));
});
test('커리어 요약은 모든 사건을 안전하게 보존하고 오래된 사건만 접는다',()=>{
 const g=game();g.run("P.hist.log=Array.from({length:12},(_,i)=>'사건'+i);P.hist.log[0]+='<img src=x>';P.hist.games=10;P.hist.wins=7;");const before=JSON.stringify(g.run('P'));
 const out=g.run('renderCareerRecord()');assert.ok(out.includes('70%'));assert.ok(out.includes('<details'));assert.ok(!out.includes('<img src=x>'));for(let i=0;i<12;i++)assert.ok(out.includes('사건'+i));assert.ok(out.includes('data-image-viewer'));assert.equal(JSON.stringify(g.run('P')),before);
});
test('손상된 옛 사건 목록과 첫 시즌 빈 기록도 안내 문구로 표시한다',()=>{
 const g=game();for(const value of [null,[],[null,123]]){g.run('P.hist.log='+JSON.stringify(value));assert.doesNotThrow(()=>g.run('renderCareerRecord()'));}g.run('P.hist.log=[]');assert.ok(g.run('renderCareerRecord()').includes('첫 기록'));
});
