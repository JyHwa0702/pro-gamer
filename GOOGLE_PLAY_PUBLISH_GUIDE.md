# 🚀 구글 플레이 스토어 정식 출시 완벽 가이드
## (Google Play Console Release Master Guide)

이 문서는 **『켠김에 GOAT까지』**를 구글 플레이 스토어(Google Play Store)에 등록하고 정식 프로덕션 출시 승인을 받기 위한 단계별 실전 가이드입니다.

---

## 📦 0. 배포 준비 완료된 에셋 및 빌드 파일 요약

모든 필수 파일이 준비되어 있습니다:

| 구분 | 파일명 | 경로 / 규격 | 용도 |
| :--- | :--- | :--- | :--- |
| **AAB (공식 번들)** | `pro-gamer.aab` | `c:\antigravity\pro-gamer\pro-gamer.aab` (38.5 MB) | **구글 플레이 필수 업로드 파일** |
| **APK (직접 설치용)** | `pro-gamer.apk` | `c:\antigravity\pro-gamer\pro-gamer.apk` (41.5 MB) | 개발자/테스터 폰 직접 설치용 |
| **서명 키스토어** | `progamer-release.jks` | `c:\antigravity\pro-gamer\keystore\progamer-release.jks` | 릴리스 영구 보존 키 (절대 분실 금지) |
| **앱 아이콘** | `icon-512.png` | `c:\antigravity\pro-gamer\icon-512.png` (512x512) | 스토어 대표 아이콘 |
| **피처 그래픽** | `feature-graphic.png` | `c:\antigravity\pro-gamer\feature-graphic.png` (1024x500) | 스토어 상단 대표 배너 |
| **개인정보처리방침** | `privacy-policy.html`| `c:\antigravity\pro-gamer\privacy-policy.html` | 필수 개인정보처리방침 URL |
| **스토어 텍스트** | `STORE_LISTING.md` | `c:\antigravity\pro-gamer\STORE_LISTING.md` | 앱 소개 문구 및 ASO 키워드 |

> **⚠️ 서명 키스토어 분실 주의**:
> `progamer-release.jks`는 향후 앱 업데이트 시 반드시 동일한 키가 필요합니다. 구글 플레이 앱 서명(Play App Signing)을 사용하더라도 원본 업로드 키이므로 안전한 클라우드나 외장 드라이브에 백업해 두세요.
> * **Keystore Pass**: `proroad2026!`
> * **Alias**: `progamerkey`
> * **Key Pass**: `proroad2026!`

---

## 🛠️ 1단계: 구글 개발자 계정 준비 및 앱 생성

1. **Google Play Console 접속**: [play.google.com/console](https://play.google.com/console)
2. **앱 만들기 (Create App)** 클릭:
   - **앱 이름**: `켠김에 GOAT까지`
   - **기본 언어**: `한국어 - ko-KR`
   - **앱 또는 게임**: `게임 (Game)`
   - **무료 또는 유료**: `무료 (Free)`
   - 선언 사항: 개발자 프로그램 정책 및 미국 수출법 동의 체크
   - 하단 **[앱 만들기]** 클릭.

---

## 📝 2단계: 스토어 등록정보 설정 (Store Listing)

좌측 메뉴에서 **[성장] > [스토어 등록정보] > [기본 스토어 등록정보]**로 이동합니다.

1. **텍스트 입력 (`STORE_LISTING.md` 내용 복사)**:
   - **앱 이름**: `켠김에 GOAT까지`
   - **간단한 설명**: `흙수저 아마추어에서 LCK·월즈 전설까지! 13인 히로인과 함께하는 e스포츠 성장기`
   - **자세한 설명**: `STORE_LISTING.md`의 자세한 설명 전체 붙여넣기
2. **그래픽 업로드**:
   - **앱 아이콘**: `c:\antigravity\pro-gamer\icon-512.png` 업로드
   - **그래픽 이미지(피처 그래픽)**: `c:\antigravity\pro-gamer\feature-graphic.png` 업로드
   - **휴대전화 스크린샷**: 스마트폰 또는 브라우저에서 가로/세로 게임 실행 화면 2~8장 캡처 후 업로드.
3. 하단 **[저장]** 클릭.

---

## 🔒 3단계: 앱 콘텐츠 및 정책 작성 (App Content)

좌측 최하단 **[정책 및 프로그램] > [앱 콘텐츠]**로 이동하여 설문을 완료합니다:

1. **개인정보처리방침**:
   - `privacy-policy.html`을 웹 호스팅(GitHub Pages, Vercel, 개인 도메인 등)에 올린 뒤 해당 URL을 입력합니다.
2. **광고 (Ads)**:
   - `아니요, 앱에 광고가 포함되어 있지 않습니다` 선택.
3. **앱 액세스 권한**:
   - `모든 기능을 특별한 접근 권한 없이 이용할 수 있습니다` 선택.
4. **콘텐츠 등급 (IARC)**:
   - 이메일 주소 입력 후 카테고리 `게임` 선택.
   - 폭력성: 없음 / 성적 콘텐츠: 경미함 / 도박/약물: 없음.
   - 예상 결과: 12세 이상 이용가 획득.
5. **타깃층 및 콘텐츠**:
   - `18세 이상` (또는 `13세 이상`) 선택.
6. **데이터 보안 (Data Safety)**:
   - 사용자 데이터를 수집하거나 공유합니까? ➔ **`아니요`** 선택.

---

## 🚀 4단계: AAB 파일 업로드 및 출시

2021년 8월부터 신규 앱은 APK가 아닌 **`.aab`** 파일 업로드가 필수입니다.

1. 좌측 메뉴 **[출시] > [프로덕션]** (또는 내부 테스트)으로 이동합니다.
2. 우측 상단 **[새 버전 만들기 (Create new release)]** 클릭.
3. **Play 앱 서명 (Google Play App Signing)**:
   - `Google에서 생성한 키 사용` 또는 권장 기본 설정 유지.
4. **App Bundle 업로드**:
   - `c:\antigravity\pro-gamer\pro-gamer.aab` 파일을 드래그 앤 드롭으로 업로드.
   - versionCode: `10`, versionName: `2.0.0` 자동 감지 및 초록색 체크 확인.
5. **출시 노트 (Release Notes)**:
   ```text
   <ko-KR>
   - 정식 릴리스 v2.0.0 출시
   - 10개년 장기 커리어 & 아시안게임 한중 결승전 탑재
   - 13인 히로인 심야 데이트 및 롤드컵 무대 공식 프러포즈 엔딩 추가
   - 한국 서버 실시간 챌린저 TOP 50 순위표 및 티어 세분화
   - 2회차 뉴게임+ 구단주 모드 지원
   </ko-KR>
   ```
6. **[다음] ➔ [오류 및 경고 확인] ➔ [프로덕션 트랙 출시 시작]** 클릭!

---

## 💡 APK 직접 다운로드 업데이트 문제 해결 가이드

기존에 스마트폰에 APK를 설치해 둔 상태에서 새로 다운로드받은 APK가 "앱이 설치되지 않았습니다"로 뜨는 원인과 해결법:

1. **원인 1: versionCode 중복**:
   - 이전 APK의 versionCode가 6으로 같아서 안드로이드 시스템이 업데이트로 인식하지 못했던 문제입니다. 이번 빌드에서 **`versionCode=10`**으로 상향하여 완전히 해결되었습니다.
2. **원인 2: 서명 키 불일치 (Signature Mismatch)**:
   - 이전에 설치된 APK가 다른 임시 키(예: debug 키 또는 D드라이브 키)로 서명되어 있는 경우, 보안을 위해 기존 앱을 먼저 **[삭제(제거)]**한 뒤 새로운 v2.0.0 APK를 설치해야 합니다.
   - 이번 패치부터는 `keystore/progamer-release.jks` 정식 고정 키로 영구 고정되었으므로, **이번에 1회만 기존 구버전 삭제 후 재설치**하시면 이후부터는 삭제할 필요 없이 덮어쓰기 업데이트가 정상 동작합니다.
