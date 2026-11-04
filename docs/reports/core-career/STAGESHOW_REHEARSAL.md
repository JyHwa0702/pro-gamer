# Rehearsal: 커리어와 GamerGram

Gold: StageShow `dark-hero`를 `gold/`로 복사했다. 안정적인 Window 구조, 단계적 상태 변화, 내부 목록과 결과의 관계를 유지했다. 실제 게임의 방향에 맞춰 밝은 배경과 파란색 강조로 바꾸고, 커리어 요약·피드 작성·관계 메시지로 내용을 교체했다. 좁은 화면에서는 Window를 축소하지 않고 Phone과 단일 열로 재구성했다.

Beats: 시즌 자동진행 → 26주 결과 → 지은과 함께 찍은 카페 일러스트 선택 → 준비된 멘트 선택과 공유 → 새 DM과 선택 가능한 답장. 약 13초의 once 재생 후 결과 유지. 외부 `다시 보기` 버튼이 명시적으로 재시작한다. 실제 게임 자동 진행과 연결되지 않은 연출이다.

Captured: viewport 1100과 390. Light+blue, opening/각 mark/mark 이후 0.7초/마지막 상태. 두 너비 reduced-motion poster. 15초 WebM과 전체 호스트 정지 화면.

Gate:

```text
1100 --states --gate: rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)
390 --states --gate: rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)
1100 --still --reduced --gate: rehearsal passed
390 --still --reduced --gate: rehearsal passed
```

Film findings and fixes:

- 좁은 데스크톱 창 → compact에서 kit Phone으로 재구성.
- 기본 Card 패딩, 직접 Row 스타일 변경 → Row `pad`와 Card의 props 사용, 선택 상태만 제품 스타일로 표현.
- 버튼 press에서 중첩 Roll 이동 → 버튼은 자체 상태 전환만 사용하고 press를 배경 명도 변화로 표현.
- 숫자 Count strip의 보이지 않는 reset 경고 → 숫자의 의미 있는 변화만 Roll로 표현.
- 커플사진 미구비 placeholder → 게임 작업에서 제작한 `couple_jieun_cafe.png` 사용. 두 사람이 한 프레임에 있는 일러스트를 직접 확인함. 원본 일러스트/안전한 기본 초상화를 demo root/assets에 각각 복사.
- 모바일 하단 DM 카드가 stage에 가까움 → 상단 패딩을 줄여 카드 하단의 안전 여백 확보.
- 최종 390 상태 촬영: 프레임/레이아웃 관련 finding 없음.
- 최종 1100·390 상태 촬영: 프레임/레이아웃/모션 관련 finding 없음. 추가 ripple은 버튼 명도 변화 및 기본 터치 포인터와 역할이 겹쳐 제거했다.

Review: 부모 에이전트가 초기 wide/compact poster를 육안 확인하고 기본 배치를 적합하다고 회신함. 이후 light+blue 및 커플 일러스트, 완전자동 26주·관계 선택은 선택적이라는 내용을 반영함. 최종 wide/compact 정지 화면과 10개 상태 contact sheet를 작성자가 확인함. 중요한 문구, 양쪽 얼굴과 주요 행동이 crop 안에 있음.

Assumptions:

- 능력치 54→57, 팬 84→126, 좋아요 12개와 메시지는 데모용 예시. 실제 게임 밸런스 결과를 증명하지 않는다.
- 실제 게임의 완전자동 모드는 관계 알림으로 정지하지 않는 방향과 맞췄다. DM은 선택 가능한 카드로만 남는다.
- 사진은 게임 내 제작 일러스트이며 실제 인물 사진이 아니다.

Unresolved:

- film의 모션 coverage는 최종 wide 2105 frames/16.36초, 최대 gap 149.6ms; compact 2579 frames/16.24초, 최대 gap 152.1ms로 `inconclusive`다. `rehearsal passed`는 never-intentional layout gate 통과이고 모든 중간 animation frame을 검증했다는 뜻이 아니다. 보고서 JSON에 gap을 보존했다. 촬영 간격 기준이나 gate 조건은 수정하지 않았다. 마지막 두 소스 촬영 모두 findings 배열은 비어 있다.

Not checked:

- 실제 Android/설치 PWA, 실제 게임 세이브/턴/26주 자동스킵 기능, 실제 계정 공유.
- 모든 전환의 40ms 확대 재촬영, 사용자 눈으로 정상 속도 영상 재생 승인, 실제 터치 기기, offscreen/hidden/pause 복귀와 재생 중 reduced-motion 설정 전환.

Technical verification: `npm run typecheck` 성공. `npm run build`로 `dist/index.html` 생성 확인. 본 데모의 React/Vite는 `work/stageshow-career`에만 있으며 게임의 Vanilla 단일 파일 구조에 추가하지 않았다. `node_modules`, 로컬 ffmpeg 복사본과 `dist`는 로컬 `.gitignore`로 제외했다.

촬영 환경 보충: production-preview 촬영에서는 CSS가 단일 번들로 합쳐져 StageShow 검사기가 순정 kit CSS를 예제의 override로 오인했다. 해당 실패를 기준 완화로 숨기지 않고 CSS 원본 경로가 유지되는 Vite 소스 미리보기로 복귀해 최종 두 너비를 다시 촬영했다. Production 빌드는 성공하지만 film CSS 출처 판정은 소스 미리보기에서만 검증했다.
