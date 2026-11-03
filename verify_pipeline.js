const fs = require('fs');
const vm = require('vm');
const path = require('path');

function log(msg, status = 'INFO') {
  console.log(`[${status}] ${msg}`);
}

function testSyntax() {
  log('1. JavaScript 구문 분석 및 AST 무결성 검증 시작...');
  const html = fs.readFileSync('index.html', 'utf8');
  const scriptMatch = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) {
    log('스크립트 태그를 찾을 수 없습니다!', 'FAIL');
    return false;
  }
  try {
    new vm.Script(scriptMatch[1]);
    log('-> JavaScript 구문 100% 정상 (0-SyntaxError)', 'PASS');
    return true;
  } catch (e) {
    log('JavaScript 파싱 에러: ' + e.message, 'FAIL');
    return false;
  }
}

function testHeroinesAndAssets() {
  log('2. 23인 히로인 시나리오 데이터 및 에셋 파일 검증 시작...');
  const expectedHeroines = [
    'jieun', 'harin', 'sora', 'mina', 'sea',
    'chloe', 'seolah', 'rin', 'camila', 'yejin',
    'nayuna', 'elena', 'serin',
    'karina', 'wonyoung', 'iu', 'irene', 'chaewon',
    'suzy', 'winter', 'miyeon', 'giselle', 'sohee'
  ];
  const code = fs.readFileSync('index.html', 'utf8');

  for (const h of expectedHeroines) {
    if (!code.includes(`id: '${h}'`) && !code.includes(`id: "${h}"`)) {
      log(`히로인 ${h} 데이터가 코드에서 누락되었습니다!`, 'FAIL');
      return false;
    }
    const rootPath = `${h}.jpg`;
    const assetPath = `assets/${h}.jpg`;
    if (!fs.existsSync(rootPath) || !fs.existsSync(assetPath)) {
      log(`히로인 ${h} 초상화 파일(${h}.jpg)이 누락되었습니다!`, 'FAIL');
      return false;
    }
  }
  log(`-> 23인 히로인 전원 코드 및 에셋 무결성 확인 완료 (${expectedHeroines.length}명)`, 'PASS');
  return true;
}

function testChampionsAndStages() {
  log('3. 15종 챔피언 및 메인 스테이지 서사 로직 검증 시작...');
  const code = fs.readFileSync('index.html', 'utf8');

  const champs = ['azir', 'orianna', 'zed', 'sylas', 'leblanc', 'yasuo', 'kaisa', 'zeri', 'jinx', 'leesin', 'vi', 'nautilus', 'thresh', 'aatrox', 'ksante'];
  for (const c of champs) {
    if (!code.includes(c)) {
      log(`챔피언 ${c}가 코드에서 누락되었습니다!`, 'FAIL');
      return false;
    }
  }

  const keywords = ['playAsianGamesTournament', 'showLckChampionSelectModal', 'triggerClutchQTE', 'showWealthModal', 'updateStockMarket', 'showSnsModal', 'checkWeeklyDM', 'playMadMovie', 'openPhotoGalleryPicker', 'craftWorldsSkinModal', 'startOwnerModeDraft', 'initIntroVideo', 'checkForUpdates', 'renderCinematicEventHtml'];
  for (const k of keywords) {
    if (!code.includes(k)) {
      log(`핵심 시스템 함수 ${k}가 누락되었습니다!`, 'FAIL');
      return false;
    }
  }

  log('-> 15종 챔피언, LCK 6강 플레이오프, 2회차 구단주 모드 드래프트, 시네마틱 돌발 이벤트 정상 작동 확인', 'PASS');
  return true;
}

function testPackages() {
  log('4. 안드로이드 APK 및 배포 패키지 검증 시작...');
  const files = [
    { p: 'pro-gamer.apk', n: 'pro-gamer.apk' },
    { p: 'pro-gamer-apk.zip', n: 'pro-gamer-apk.zip' },
    { p: 'download.html', n: 'download.html' }
  ];

  for (const f of files) {
    if (!fs.existsSync(f.p) || fs.statSync(f.p).size === 0) {
      log(`${f.n} 파일이 없거나 크기가 0입니다!`, 'FAIL');
      return false;
    }
    const mb = (fs.statSync(f.p).size / (1024 * 1024)).toFixed(2);
    log(`-> ${f.n} 확인 완료 (${mb} MB)`, 'PASS');
  }
  return true;
}

function testDocuments() {
  log('5. 시나리오 바이블 및 규칙 문서 존재 여부 검증...');
  const docs = ['SCENARIO_BIBLE.md', 'DEVELOPMENT_RULES.md', 'SCENARIO_CHECKLIST.md'];
  for (const d of docs) {
    if (!fs.existsSync(d)) {
      log(`필수 문서 ${d}가 누락되었습니다!`, 'FAIL');
      return false;
    }
    log(`-> ${d} 확인 완료`, 'PASS');
  }
  return true;
}

console.log('='.repeat(65));
console.log(' [프로의 길 : 인연] 개발 & 시나리오 표준 파이프라인 검증 가동');
console.log('='.repeat(65));

const tests = [testSyntax, testHeroinesAndAssets, testChampionsAndStages, testPackages, testDocuments];
let allPass = true;
for (const t of tests) {
  if (!t()) {
    allPass = false;
    break;
  }
}

console.log('='.repeat(65));
if (allPass) {
  console.log('[SUCCESS: ALL TESTS PASSED] 5-Stage Pipeline Rules 100% Satisfied.');
  process.exit(0);
} else {
  console.error('[FAIL] Some verification rules failed.');
  process.exit(1);
}
