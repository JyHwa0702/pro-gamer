// 실제 index.html의 드래프트·국면·QTE를 검사한다. 후보 HTML/소스 패치에 의존하지 않는다.
// node tests/core-match-simulation.cjs --seed=102030 --per-scenario=1000
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {game}=require('./game-harness.cjs');
const root=path.resolve(__dirname,'..');
const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const seed=args.seed===undefined?102030:Number(args.seed);
const perScenario=args['per-scenario']===undefined?1000:Number(args['per-scenario']);
if(!Number.isInteger(seed)||seed<0||!Number.isInteger(perScenario)||perScenario<1||perScenario>100000)throw Error('seed는 음이 아닌 정수, per-scenario는 1~100000 정수여야 합니다.');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sourceSha256=crypto.createHash('sha256').update(source).digest('hex');
const output=args.output?path.resolve(args.output):path.join(root,'docs/reports/CORE_MATCH_BALANCE_2026-11-04.json');
(async()=>{
 const results=[];
 for(const pos of ['top','jg','mid','adc','sup'])for(const skill of [55,65,75]){
  const g=game(seed,source);
  const result=await g.run(`(async()=>{
   let wins=0,rating=0;const champs={};
   for(let i=0;i<${perScenario};i++){
    P=makePlayer('실험','${pos}',{mech:${skill},lane:${skill},macro:${skill},team:${skill},pool:${skill},mental:${skill}});
    P.stage='pro';P.teamId=0;P.pro[0].str=65;P.syn=0;P.hp=100;P.stress=0;
    checkHeroineUnlocks=async()=>{};
    const r=await playMatch({name:'상대',str:65},'LCK 스프링 1라운드',false,true);
    wins+=+r.win;rating+=r.rating;champs[P.currentChamp.id]=(champs[P.currentChamp.id] || 0)+1;
   }
   return {n:${perScenario},wins,winRate:wins/${perScenario},rating:rating/${perScenario},champs};
  })()`);
  results.push({pos,skill,...result});
 }
 const g=game(seed,source),champions=g.run('CHAMPIONS.map(c=>({id:c.id,role:c.role}))');
 const missingIcons=champions.flatMap(c=>['champs/'+c.id+'.png','assets/champs/'+c.id+'.png'].filter(p=>!fs.existsSync(path.join(root,p))).map(p=>({id:c.id,path:p})));
 const checks=results.map(r=>({pos:r.pos,skill:r.skill,ok:r.skill===65?r.winRate>=.45&&r.winRate<=.60:r.skill===55?r.winRate<.5:r.winRate>.5&&r.winRate<=.98}));
 const report={sourceFile:'index.html',sourceSha256,generatedAt:new Date().toISOString(),seed,perScenario,totalMatches:15*perScenario,
  method:'Actual client source through tests/game-harness.cjs; 5 roles x 3 skill conditions. Fresh player fixture each match, deterministic continuous PRNG sequence per condition. Full draft, shared manual/automatic phase engine and actual QTE. Achievement and heroine unlock presentation disabled by harness to isolate match calculation.',
  boundaries:['게임용 추정 밸런스의 고정 조건 실험이며 실제 LoL 승률이나 사람이 느끼는 재미를 측정하지 않는다.','각 경기에서 체력100/스트레스0/시너지0/아군팀전력65/상대65/숙련Lv1로 초기화한다.','세트별 BO3/BO5 시리즈 및 피어리스는 검사 범위에 포함되지 않는다.','실제 브라우저 렌더링과 기기 실행을 증명하지 않는다.'],
  champions:{count:champions.length,roleCounts:Object.fromEntries(['top','jg','mid','adc','sup'].map(p=>[p,champions.filter(c=>c.role===p).length])),missingIcons},
  results,checks,passed:checks.every(x=>x.ok)&&missingIcons.length===0};
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
 console.log(JSON.stringify({sourceSha256,totalMatches:report.totalMatches,results:results.map(({pos,skill,winRate,rating})=>({pos,skill,winRate,rating})),missingIcons,passed:report.passed,output},null,2));
 if(!report.passed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
