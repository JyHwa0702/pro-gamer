# 📋 '프로의 길 : 인연' 시나리오 & 개발 체크리스트 (Verification Log)

> **원칙 (User Route)**: 모든 개발은 `기획` ➔ `기획검증` ➔ `개발규칙 개발` ➔ `검증규칙 검증` ➔ `적용` 5단계를 거쳐 본 문서에 체크 및 기록한 후 완료 처리합니다.

---

## 🎯 1. 시나리오 & 핵심 시스템 검증 매트릭스 (현재 빌드 v1.2.0)

| 시스템 분류 | 기획 명세 | 기획 검증 (바이블 일치) | 개발 규칙 준수 | 검증 규칙 통과 | 적용 상태 |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Stage 0 서사** | 흙수저 PC방, 장비 부족, 지은 헌신, PC방 토너먼트 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **Stage 1 서사** | 2군 CL 합숙, 주전 경쟁, 강미나 멘토링, 1군 콜업 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **Stage 2 서사** | 롤파크 데뷔, 클로이 POG 인터뷰, 하린 직관, 백설아 클리닉 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **Stage 3 서사** | LCK 결승, 월즈 우승, 윤소라 스폰서, 장세아 교감, 점멸 5인궁 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **Stage 4 서사** | 아시안게임 국대 선발전 & 결승전, 병역특례, 훈장 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **Stage 5 서사** | LPL 100억 오퍼, 서예진 에이전시, 린 한일전, 카밀라 코칭 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **Stage 6 서사** | 영구결번 은퇴식, 동거/결혼 아침밥, 구단주 모드(New Game+) | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **10인 히로인** | 10인 고유 외모, 헤어스타일, 체형, 인연 버프, 데이트 CG | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **15종 챔피언** | 포지션별 15챔피언 마스터리, 3밴 3픽, 상성 카운터 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **장비 & 스킨** | 5단계 게이밍 기어 및 3종 챔피언 스킨 (스탯 보정) | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **부와 경제** | 오피스텔~구단타워 부동산(임대료), e스포츠/테크 주식 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |
| **배포 & 패키징** | 안드로이드 APK 빌드, 모바일 다운로드 센터, PWA 오프라인 캐시 | ✅ PASS | ✅ PASS | ✅ PASS | 🚀 적용완료 |

---

## 🔍 2. 10인 히로인 시나리오 무결성 체크

- [x] **이지은 (소꿉친구)**: 초상화 `jieun.jpg` / 데이트 CG `jieun_cafe.jpg`, `jieun_night.jpg` / 헌신 버프 / 숏폼 잭팟
- [x] **하린 (톱 아이돌)**: 초상화 `harin.jpg` / 데이트 CG `harin_home.jpg`, `harin_stage.jpg` / 팬덤 버프 / MV 주연 잭팟
- [x] **윤소라 (재벌 3세)**: 초상화 `sora.jpg` / 데이트 CG `sora_dinner.jpg`, `sora_drive.jpg` / 투자 할인 버프 / 신주 상장 잭팟
- [x] **강미나 (레전드 선배)**: 초상화 `mina.jpg` / 데이트 CG `mina_pcbang.jpg`, `mina_rooftop.jpg` / 스크림 버프 / 올스타 잭팟
- [x] **장세아 (천재 첼리스트)**: 초상화 `sea.jpg` / 데이트 CG `sea_hall.jpg`, `sea_yacht.jpg` / 멘탈 슬럼프 방지 버프 / 교향시 잭팟
- [x] **클로이 (글로벌 인터뷰어)**: 초상화 `chloe.jpg` / 데이트 CG `chloe_interview.jpg`, `chloe_seoul.jpg` / 해외 몸값 버프 / 앰버서더 잭팟
- [x] **백설아 (팀 주치의)**: 초상화 `seolah.jpg` / 데이트 CG `seolah_clinic.jpg`, `seolah_night.jpg` / 부상 0% 버프 / 특허 보호대 잭팟
- [x] **미야모토 린 (일본 LJL 여고수)**: 초상화 `rin.jpg` / 데이트 CG `rin_date.jpg` / 숙련도 속도 버프 / 굿즈 완판 잭팟
- [x] **카밀라 노바 (브라질 피트니스 코치)**: 초상화 `camila.jpg` / 데이트 CG `camila_date.jpg` / 체력 피로도 절감 버프 / 글로벌 영상 잭팟
- [x] **서예진 (에이전시 CEO 누님)**: 초상화 `yejin.jpg` / 데이트 CG `yejin_date.jpg` / 연봉 광고 버프 / 전속 광고 잭팟

---

## 🛠️ 3. 자동화 검증 스크립트 실행 이력 (Verification Test History)

| 실행 일시 | 검증 항목 | 도구 / 스크립트 | 결과 | 비고 |
| :--- | :--- | :--- | :---: | :--- |
| **2026-11-02 13:11** | JavaScript 문법 및 AST 무결성 | Node.js `Function` 생성자 검사 | ✅ PASS | 0-SyntaxError 확인 |
| **2026-11-02 13:13** | 안드로이드 APK 패키징 컴파일 | `build_apk.py` (aapt2 + d8 + apksigner) | ✅ PASS | `pro-gamer.apk` 정상 서명 |
| **2026-11-02 13:16** | 모바일 다운로드 센터 및 QR 생성 | `download.html` HTTP 서버 응답 | ✅ PASS | 7,882 바이트 200 OK |
| **2026-11-02 13:27** | 5단계 전수 자동화 검증 파이프라인 | `verify_scenario_pipeline.py` | ✅ ALL PASS | 10히로인, 15챔프, 장비/스킨, APK 전수 통과 |
| **2026-11-02 13:28** | 최신 통합 프로덕션 APK 빌드 | `build_apk.py` (20.53 MB) | ✅ PASS | 서명 완료 및 ZIP 배포팩 갱신 |
| **2026-11-02 14:45** | 체력 시인성 & 원클릭 UI/UX 개편 | `index.html` + `verify_scenario_pipeline.py` | ✅ ALL PASS | 상단 고정 체력바, 1클릭 턴/밴픽, 이미지 경로 동기화 (22.01MB APK) |

---

## 📝 4. 다음 작업 큐 (Next Pipeline Queue)
1. **[기획]**: 2회차 구단주 모드(New Game+) 전용 드래프트 시스템 (선수 스카우트 3인 제시 및 코치진 고용)
2. **[기획 검증]**: Stage 6 시나리오 바이블 및 밸런스 공식(예산 100억~500억) 검토
3. **[개발 규칙 개발]**: `P.franchise` 구조체 추가 및 하위 호환성 유지
4. **[검증 규칙 검증]**: 드래프트 턴 진행 시뮬레이션 및 데이터 무결성 테스트
5. **[적용]**: 배포 및 체크리스트 업데이트
