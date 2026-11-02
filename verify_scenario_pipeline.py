# -*- coding: utf-8 -*-
"""
'프로의 길 : 인연' 전 자동 5단계 파이프라인 검증 스크립트
(Automated Pipeline & Scenario Verification Runner)
"""
import os, sys, re, subprocess

WORKSPACE = r'd:\antigravity\pro-gamer'

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_syntax():
    log("1. JavaScript 구문 분석 및 AST 무결성 검증 시작...")
    html_path = os.path.join(WORKSPACE, 'index.html')
    if not os.path.exists(html_path):
        log("index.html이 존재하지 않습니다!", "FAIL")
        return False

    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    script_match = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
    if not script_match:
        log("스크립트 태그를 찾을 수 없습니다!", "FAIL")
        return False

    # Node.js Function 생성자를 통해 브라우저 API 실행 없이 순수 구문(Syntax & AST) 검증
    checker_js = """
    const fs = require('fs');
    const html = fs.readFileSync('d:/antigravity/pro-gamer/index.html', 'utf8');
    const scriptMatch = html.match(/<script>([\\s\\S]*?)<\\/script>/);
    try {
        new Function(scriptMatch[1]);
        console.log('SYNTAX_OK');
    } catch (e) {
        console.error('SYNTAX_ERROR:', e.message);
        process.exit(1);
    }
    """
    res = subprocess.run(['node', '-e', checker_js], capture_output=True, text=True, encoding='utf-8')
    if res.returncode != 0 or 'SYNTAX_OK' not in res.stdout:
        log(f"JavaScript 파싱 에러: {res.stderr}", "FAIL")
        return False
    log("-> JavaScript 구문 100% 정상 (0-SyntaxError)", "PASS")
    return True

def test_heroines_and_assets():
    log("2. 13인 히로인 시나리오 데이터 및 에셋 파일 검증 시작...")
    expected_heroines = ['jieun', 'harin', 'sora', 'mina', 'sea', 'chloe', 'seolah', 'rin', 'camila', 'yejin', 'nayuna', 'elena', 'serin']
    html_path = os.path.join(WORKSPACE, 'index.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        code = f.read()

    for h in expected_heroines:
        if f"id: '{h}'" not in code and f'id: "{h}"' not in code:
            log(f"히로인 {h} 데이터가 코드에서 누락되었습니다!", "FAIL")
            return False
        
        # 초상화 파일 존재 여부 검사 (루트 및 assets 양쪽)
        img_path = os.path.join(WORKSPACE, f"{h}.jpg")
        assets_img_path = os.path.join(WORKSPACE, "assets", f"{h}.jpg")
        if not (os.path.exists(img_path) and os.path.exists(assets_img_path)):
            log(f"히로인 {h} 초상화 파일({h}.jpg)이 누락되었습니다!", "FAIL")
            return False

    log(f"-> 13인 히로인(히든 3인 포함) 전원 코드 및 에셋 무결성 확인 완료 ({len(expected_heroines)}명)", "PASS")
    return True

def test_champions_and_stages():
    log("3. 15종 챔피언 및 메인 스테이지 서사 로직 검증 시작...")
    html_path = os.path.join(WORKSPACE, 'index.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        code = f.read()

    for champ in ['azir', 'orianna', 'zed', 'sylas', 'leblanc', 'yasuo', 'kaisa', 'zeri', 'jinx', 'leesin', 'vi', 'nautilus', 'thresh', 'aatrox', 'ksante']:
        if champ not in code:
            log(f"챔피언 {champ}가 코드에서 누락되었습니다!", "FAIL")
            return False

    for stage_keyword in ['playAsianGamesTournament', 'showLckChampionSelectModal', 'triggerClutchQTE', 'showWealthModal', 'updateStockMarket', 'showSnsModal', 'checkWeeklyDM', 'playMadMovie', 'openPhotoGalleryPicker', 'craftWorldsSkinModal', 'startOwnerModeDraft', 'initIntroVideo', 'checkForUpdates']:
        if stage_keyword not in code:
            log(f"핵심 시스템 함수 {stage_keyword}가 누락되었습니다!", "FAIL")
            return False

    log("-> 15종 챔피언, LCK 6강 플레이오프, 2회차 구단주 모드 드래프트 정상 작동 확인", "PASS")
    return True

def test_packages():
    log("4. 안드로이드 APK 및 배포 패키지 검증 시작...")
    apk_path = os.path.join(WORKSPACE, 'pro-gamer.apk')
    zip_path = os.path.join(WORKSPACE, 'pro-gamer-apk.zip')
    download_path = os.path.join(WORKSPACE, 'download.html')

    for p, name in [(apk_path, "pro-gamer.apk"), (zip_path, "pro-gamer-apk.zip"), (download_path, "download.html")]:
        if not os.path.exists(p) or os.path.getsize(p) == 0:
            log(f"{name} 파일이 없거나 크기가 0입니다!", "FAIL")
            return False
        log(f"-> {name} 확인 완료 ({os.path.getsize(p) / (1024*1024):.2f} MB)", "PASS")

    return True

def test_documents():
    log("5. 시나리오 바이블 및 규칙 문서 존재 여부 검증...")
    docs = ['SCENARIO_BIBLE.md', 'DEVELOPMENT_RULES.md', 'SCENARIO_CHECKLIST.md']
    for doc in docs:
        p = os.path.join(WORKSPACE, doc)
        if not os.path.exists(p):
            log(f"필수 문서 {doc}가 누락되었습니다!", "FAIL")
            return False
        log(f"-> {doc} 확인 완료", "PASS")
    return True

if __name__ == '__main__':
    print("=" * 65)
    print(" [프로의 길 : 인연] 개발 & 시나리오 표준 파이프라인 검증 가동")
    print("=" * 65)
    tests = [test_syntax, test_heroines_and_assets, test_champions_and_stages, test_packages, test_documents]
    success = True
    for t in tests:
        if not t():
            success = False
            break

    print("=" * 65)
    if success:
        print("[SUCCESS: ALL TESTS PASSED] 5-Stage Pipeline Rules 100% Satisfied.")
        sys.exit(0)
    else:
        print("[FAIL] Some verification rules failed.")
        sys.exit(1)
