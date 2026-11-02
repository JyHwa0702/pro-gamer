# -*- coding: utf-8 -*-
import sys, re

index_path = 'd:/antigravity/pro-gamer/index.html'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ----------------------------------------------------------------------
# 1. Add nayuna, elena, serin to HEROINES
# ----------------------------------------------------------------------
new_heroines_code = '''  nayuna: {
    id: 'nayuna', name: '나유나', age: 20,
    img: 'assets/nayuna.jpg', fallback: 'nayuna.jpg',
    tag: '천재 솔랭 1위 & 은둔의 저격수 (The Ghost)',
    unlockDesc: '솔로랭크 그랜드마스터(LP 800+) 또는 천상계 8승 달성 시 심야 귓속말로 만남',
    buff: '피지컬/라인전 훈련 효과 +35%, 솔랭 승리 시 추가 LP +10, 챔프 숙련도 가속',
    dates: [
      { id: 'pc', n: '🌙 심야 PC방 비밀 듀오 랭크', c: 30000, aff: 16, hp: 12, st: -30,
        img: 'assets/nayuna_date.jpg', fallback: 'nayuna_date.jpg', loc: '심야 골목 게이밍 벙커',
        dialogue: '"내 뒤에 숨어. 내가 다 찢어발겨 놓을 테니까 넌 숟가락만 얹어... 아, 물론 네 궁극기 타이밍은 나쁘지 않았어."' },
      { id: 'ramen', n: '🍜 새벽 편의점 컵라면 & 솔랭 피드백', c: 15000, aff: 14, hp: 14, st: -35,
        img: 'assets/nayuna_date.jpg', fallback: 'nayuna_date.jpg', loc: '조용한 편의점 파라솔',
        dialogue: '"찬바람 부니까 라면 국물 죽이네. 넌 프로 무대에서 안 떨려? 난 방송이나 대회는 무서운데... 네 경기 볼 때마다 심장이 뛰더라."' }
    ],
    gifts: [
      { n: '⚡ 고카페인 울트라 에너지 캔', c: 30000, aff: 15, msg: '"오, 이거 편의점에서도 품절인데 어떻게 구했어? 오늘 밤새 듀오 각이다."' },
      { n: '⌨️ 커스텀 알루미늄 기계식 키보드', c: 220000, aff: 35, msg: '"타건감 미쳤네... 너 진짜 센스 있다. 내 솔랭 본계정에 장착할게."' },
      { n: '🎧 플래그십 무선 게이밍 헤드셋', c: 550000, aff: 70, msg: '"이걸로 네 보이스 들으면... 발소리까지 귓가에 바로 꽂히겠다."' }
    ],
    story: [
      { lv: 1, req: 25, title: '심야 협곡의 유령', img: 'assets/nayuna.jpg', fallback: 'nayuna.jpg',
        dialogue: '"사람들은 날 은둔형 괴물이라 부르지만... 네 플레이는 날 협곡 밖으로 끌어내. 앞으로 딴 놈이랑 듀오 하면 죽는다 진짜."',
        choice: ['"나유나랑 듀오면 전승 1위지."', '"언제든 불러, 바로 갈게."'],
        gain: '솔랭 승률 +15% · 피지컬 +3' },
      { lv: 2, req: 50, title: '가면 뒤의 소녀', img: 'assets/nayuna_date.jpg', fallback: 'nayuna_date.jpg',
        dialogue: '"난 무대 공포증 때문에 프로를 포기했거든... 하지만 네가 큰 무대에서 활약할 때마다, 내가 같이 싸우는 기분이 들어. 고마워."',
        choice: ['나유나의 손을 조용히 잡아준다', '"네 몫까지 내가 세계 챔피언이 될게."'],
        gain: '스트레스 -45 · 라인전 +3' },
      { lv: 3, req: 75, title: '듀오를 넘어 연인으로', img: 'assets/nayuna_date.jpg', fallback: 'nayuna_date.jpg',
        dialogue: '"솔직히 말할게. 나 너한테 반했어. 네가 롤파크에서 경기할 때마다, 네 옆자리가 내 자리였으면 좋겠어... 내 남친 해줄래?"',
        choice: ['"기다렸던 말이야. 우리 사귀자."', '나유나를 따뜻하게 안아준다'],
        gain: '💖 [연인 관계 시작] 피지컬/라인전 영구 버프 +35%' },
      { lv: 4, req: 100, title: '은둔의 천재와 세계 최강의 짝', img: 'assets/nayuna.jpg', fallback: 'nayuna.jpg',
        dialogue: '"협곡에선 최강의 듀오, 현실에선 영원한 동반자. 은퇴하면 나랑 같이 게임 연구소 차리자. 평생 너만을 위한 서포터가 될게."',
        choice: ['커플 반지를 끼워주며 영원을 약속한다', '"평생 내 1순위 파트너가 되어줘."'],
        gain: '💍 [평생의 동반자] 은퇴 시 전설의 듀오 게이머 부부 엔딩' }
    ]
  },
  elena: {
    id: 'elena', name: '엘레나 로마노바', age: 25,
    img: 'assets/elena.jpg', fallback: 'elena.jpg',
    tag: '유럽 억만장자 게임단 구단주 & CEO',
    unlockDesc: '월즈 4강 진출 or 팬 2.5만 명 달성 시 롤파크 VIP 스카우트 제안으로 만남',
    buff: '주간 연봉/스폰서 수입 +50%, 부동산 및 주식 배당금 +25%, 해외 이적 몸값 폭증',
    dates: [
      { id: 'lounge', n: '🥂 강남 펜트하우스 스카이라운지 샴페인', c: 150000, aff: 22, hp: 15, st: -40,
        img: 'assets/elena_date.jpg', fallback: 'elena_date.jpg', loc: '시그니엘 100층 VIP 스카이바',
        dialogue: '"수백억짜리 e스포츠 구단을 굴리는 나지만, 당신의 플레이를 보면 아직도 가슴이 뛰어. 오늘은 계약서 얘기 말고, 둘만의 시간을 보내고 싶어."' },
      { id: 'heli', n: '🚁 전용 헬기 한강 야경 프라이빗 투어', c: 350000, aff: 26, hp: 18, st: -45,
        img: 'assets/elena_date.jpg', fallback: 'elena_date.jpg', loc: '서울 상공 전용기 스위트',
        dialogue: '"발밑에 펼쳐진 서울 야경 멋지지? 내가 마음만 먹으면 이 도시의 모든 스폰서를 네 발앞에 가져다줄 수 있어. 넌 그저 빛나기만 해."' }
    ],
    gifts: [
      { n: '🍾 최고급 빈티지 돔페리뇽 샴페인', c: 400000, aff: 22, msg: '"탁월한 취향이네. 오늘 밤 우리 둘만의 축하 파티에서 같이 오픈하자."' },
      { n: '⌚ 스위스 명품 리미티드 크로노그래프', c: 1800000, aff: 50, msg: '"당신의 손목에 어울리는 건 오직 최고뿐이야. 아주 잘 어울려."' },
      { n: '💎 카르티에 하이주얼리 플래티넘 브레이슬릿', c: 6000000, aff: 95, msg: '"다이아몬드보다 더 눈부시게 빛나는 건... 내 눈앞의 당신이야."' }
    ],
    story: [
      { lv: 1, req: 25, title: '100억 연봉의 제안', img: 'assets/elena.jpg', fallback: 'elena.jpg',
        dialogue: '"내 구단으로 와. 100억 연봉과 전용기, 네가 원하는 모든 코칭스태프를 붙여줄게. 넌 내 최고의 보물이 될 거야."',
        choice: ['"제 가치를 알아봐 주셔서 감사합니다."', '"조건보다 엘레나 대표님과 함께하고 싶습니다."'],
        gain: '스폰서 수입 +40% · 멘탈 +3' },
      { lv: 2, req: 50, title: '비즈니스 너머의 감정', img: 'assets/elena_date.jpg', fallback: 'elena_date.jpg',
        dialogue: '"난 평생 투자와 숫자만 보며 살았어. 하지만 너랑 와인을 마실 때면... 내가 한 여자가 된 것 같아. 내 곁에 더 머물러줘."',
        choice: ['엘레나의 어깨를 감싸 안는다', '"대표님 곁이라면 언제든 함께하겠습니다."'],
        gain: '자산 +5,000만 원 · 스트레스 -45' },
      { lv: 3, req: 75, title: 'VIP 스위트의 고백', img: 'assets/elena_date.jpg', fallback: 'elena_date.jpg',
        dialogue: '"계약서의 선수와 구단주 관계는 이제 잊어. 난 당신의 여자가 되고 싶어. 내 모든 부와 명예보다... 당신 하나를 원해."',
        choice: ['샴페인 잔을 내려놓고 키스한다', '"내 모든 미래를 엘레나 당신에게 바칠게요."'],
        gain: '💖 [연인 관계 시작] 주간 로열티 +3,000만 원 지급' },
      { lv: 4, req: 100, title: '글로벌 e스포츠 제국의 황제와 여제', img: 'assets/elena.jpg', fallback: 'elena.jpg',
        dialogue: '"당신은 협곡의 황제, 나는 세계 e스포츠의 여제. 이제 전 세계 구단을 인수해서 우리 둘만의 왕국을 완성하자."',
        choice: ['다이아몬드 반지로 청혼한다', '"평생 내 뒤를 지켜줘, 나의 여왕님."'],
        gain: '💍 [평생의 동반자] 은퇴 시 글로벌 e스포츠 재벌 부부 엔딩' }
    ]
  },
  serin: {
    id: 'serin', name: '유세린', age: 22,
    img: 'assets/serin.jpg', fallback: 'serin.jpg',
    tag: '롤파크 치어리더 퀸 & 공식 팬클럽 회장',
    unlockDesc: '공식전 4승 달성 or 팬 1만 명 달성 시 경기장 퇴근길 손편지로 만남',
    buff: '경기 승리 시 팬 유입량 +60%, 스트레스 회복량 상시 +50%, 멘탈 슬럼프 완전 방어',
    dates: [
      { id: 'exit', n: '💌 롤파크 출구 골목길 손편지와 응원 드링크', c: 20000, aff: 16, hp: 16, st: -35,
        img: 'assets/serin_date.jpg', fallback: 'serin_date.jpg', loc: '종로 롤파크 비밀 비상구',
        dialogue: '"선수님 오늘 펜타킬 진짜 미쳤어요! 저 관중석에서 목 터지게 응원하다 울 뻔했잖아요... 이 음료수, 제가 직접 비타민 갈아 넣은 거예요!"' },
      { id: 'amuse', n: '🎡 놀이공원 교복 데이트 & 머리띠 셀카', c: 50000, aff: 20, hp: 14, st: -40,
        img: 'assets/serin_date.jpg', fallback: 'serin_date.jpg', loc: '잠실 롯데월드 매직아일랜드',
        dialogue: '"히히, 우리 고등학생 같죠? 오늘만큼은 경기 생각 싹 잊고 신나게 놀아요! 저기 롤러코스터 타러 뛰어가요!"' }
    ],
    gifts: [
      { n: '🎀 핑크 리본 머리띠 & 캐릭터 텀블러', c: 25000, aff: 15, msg: '"우와 너무 귀여워요! 다음 경기 때 이거 머리에 쓰고 맨 앞줄에서 응원할게요!"' },
      { n: '📷 아날로그 감성 인스탁스 즉석카메라', c: 130000, aff: 32, msg: '"선수님이랑 오늘 찍은 사진, 제 다이어리 1면에 붙여놓을 거예요 헤헤~"' },
      { n: '👗 디자이너 한정판 러블리 원피스', c: 480000, aff: 60, msg: '"어머... 너무 예뻐요! 다음 팬미팅 때 선수님 보러 갈 때 꼭 입을게요!"' }
    ],
    story: [
      { lv: 1, req: 25, title: '응원석의 천사', img: 'assets/serin.jpg', fallback: 'serin.jpg',
        dialogue: '"관중석에서 선수님이 헤드셋 끼고 집중하는 모습 볼 때마다 심장이 터질 것 같아요. 제가 세상에서 제일 큰 소리로 응원할게요!"',
        choice: ['"세린 씨 응원 소리 무대 위에서도 다 들려요."', '"언제나 응원해줘서 정말 고마워요."'],
        gain: '팬 유입 +20% · 멘탈 +2' },
      { lv: 2, req: 50, title: '비밀 비상구의 온기', img: 'assets/serin_date.jpg', fallback: 'serin_date.jpg',
        dialogue: '"선수님 패배하고 고개 숙일 때마다 가슴이 찢어지는 줄 알았어요... 제가 항상 경기장 뒤에서 기다리고 있을게요. 힘내세요!"',
        choice: ['세린의 손을 따뜻하게 잡아준다', '응원 드링크를 단숨에 마시며 미소 짓는다'],
        gain: '스트레스 -50 · 멘탈 +3' },
      { lv: 3, req: 75, title: '당신만을 위한 전속 치어리더', img: 'assets/serin_date.jpg', fallback: 'serin_date.jpg',
        dialogue: '"저 이젠 수천 명 관중 중 한 명이 아니라... 선수님만의 유일한 1호 치어리더이자 여자친구가 되고 싶어요. 제 마음 받아주실래요?"',
        choice: ['"기다렸던 고백이야. 우리 사귀자!"', '세린을 품에 꼭 끌어안는다'],
        gain: '💖 [연인 관계 시작] 경기 승리 시 팬 +60% 버프' },
      { lv: 4, req: 100, title: '영원한 승리의 여신', img: 'assets/serin.jpg', fallback: 'serin.jpg',
        dialogue: '"무대 위에서도, 은퇴 후 평범한 일상에서도... 당신 인생의 모든 순간을 가장 뜨겁게 응원하는 영원한 아내가 될게요!"',
        choice: ['프로포즈 링을 건네며 키스한다', '"평생 내 승리의 여신이 되어줘."'],
        gain: '💍 [평생의 동반자] 은퇴 시 국민 치어리더 & 스타 부부 엔딩' }
    ]
  }
};'''

if '  yejin: {' in content:
    # replace the closing of HEROINES with new heroines
    content = content.replace('      gain: \'💍 [평생의 동반자] 은퇴 시 거대 e스포츠 엔터 제국 대표 부부 엔딩\' }\n    ]\n  }\n};',
                              '      gain: \'💍 [평생의 동반자] 은퇴 시 거대 e스포츠 엔터 제국 대표 부부 엔딩\' }\n    ]\n  },\n' + new_heroines_code)
    print('[OK] Injected nayuna, elena, serin into HEROINES')
else:
    print('[FAIL] yejin: { not found')

# ----------------------------------------------------------------------
# 2. Add nayuna, elena, serin to makePlayer bonds
# ----------------------------------------------------------------------
old_bonds = '''      yejin: { aff: 0, lv: 0, unlocked: false }
    },'''
new_bonds = '''      yejin: { aff: 0, lv: 0, unlocked: false },
      nayuna:{ aff: 0, lv: 0, unlocked: false },
      elena: { aff: 0, lv: 0, unlocked: false },
      serin: { aff: 0, lv: 0, unlocked: false }
    },'''
if old_bonds in content:
    content = content.replace(old_bonds, new_bonds)
    print('[OK] Updated makePlayer bonds')
else:
    print('[FAIL] old_bonds not found')

# ----------------------------------------------------------------------
# 3. Add heroine unlock conditions in checkHeroineUnlocks
# ----------------------------------------------------------------------
target_unlock_end = '''    await showHeroineCutscene('seolah', `<h3>🩺 e스포츠 스포츠 메디컬 클리닉</h3>
      <div class="vn-dialogue">반복된 스크림과 연습으로 지친 손목을 진료받으러 찾은 전용 메디컬 센터. 단아한 흰 가운의 백설아 원장이 부드럽게 손목을 짚는다.<br><br><b>백설아:</b> "반가워요, ${P.name} 선수. 저도 1세대 프로 출신이라 당신이 겪는 통증을 누구보다 잘 알아요. 오늘부터 제가 당신의 전담 주치의예요."</div>
      <p class="c" style="color:#f472b6;font-weight:800">💖 백설아(스포츠 의학 전문의)와의 인연이 열렸습니다!</p>`,
      [{ t: '확인', cls: 'pink' }], 'assets/seolah_clinic.jpg', '스포츠 메디컬 클리닉');
  }'''

new_unlocks = '''    await showHeroineCutscene('seolah', `<h3>🩺 e스포츠 스포츠 메디컬 클리닉</h3>
      <div class="vn-dialogue">반복된 스크림과 연습으로 지친 손목을 진료받으러 찾은 전용 메디컬 센터. 단아한 흰 가운의 백설아 원장이 부드럽게 손목을 짚는다.<br><br><b>백설아:</b> "반가워요, ${P.name} 선수. 저도 1세대 프로 출신이라 당신이 겪는 통증을 누구보다 잘 알아요. 오늘부터 제가 당신의 전담 주치의예요."</div>
      <p class="c" style="color:#f472b6;font-weight:800">💖 백설아(스포츠 의학 전문의)와의 인연이 열렸습니다!</p>`,
      [{ t: '확인', cls: 'pink' }], 'assets/seolah_clinic.jpg', '스포츠 메디컬 클리닉');
  }
  if (P.bonds.rin && !P.bonds.rin.unlocked && (P.bestT >= 5 || P.rank?.t >= 5)) {
    P.bonds.rin.unlocked = true;
    P.bonds.rin.aff = 15;
    await showHeroineCutscene('rin', `<h3>🌸 한일 솔랭 교류전에서의 인연</h3>
      <div class="vn-dialogue">한일 천상계 랭크전에서 마주친 LJL 최강의 여고수 미야모토 린. 경기 직후 그녀가 귓속말을 걸어왔다!<br><br><b>미야모토 린:</b> "한국 서버 미드라이너 중에 너처럼 날 당황하게 만든 녀석은 처음이야! 다음엔 절대 안 져!"</div>
      <p class="c" style="color:#f472b6;font-weight:800">💖 미야모토 린(일본 프로 코스플레이어)과의 인연이 열렸습니다!</p>`,
      [{ t: '확인', cls: 'pink' }], 'assets/rin_date.jpg', '한일 솔랭 교류');
  }
  if (P.bonds.camila && !P.bonds.camila.unlocked && (P.hist.games >= 6 || P.stage === 'pro')) {
    P.bonds.camila.unlocked = true;
    P.bonds.camila.aff = 15;
    await showHeroineCutscene('camila', `<h3>🔥 피트니스 트레이닝 센터</h3>
      <div class="vn-dialogue">거북목과 손목 통증 관리를 위해 방문한 구단 연계 피트니스 센터. 구릿빛 피부의 카밀라 코치가 활기차게 다가온다.<br><br><b>카밀라:</b> "Olá! 게이머도 운동선수야! 내 지옥의 코어 루틴을 따라오면 5세트 혈투에도 지치지 않는 강철 체력을 만들어줄게!"</div>
      <p class="c" style="color:#f472b6;font-weight:800">💖 카밀라 노바(피트니스 코치)와의 인연이 열렸습니다!</p>`,
      [{ t: '확인', cls: 'pink' }], 'assets/camila_date.jpg', '피트니스 센터');
  }
  if (P.bonds.yejin && !P.bonds.yejin.unlocked && (P.salary >= 800000 || P.hist.wins >= 3)) {
    P.bonds.yejin.unlocked = true;
    P.bonds.yejin.aff = 20;
    await showHeroineCutscene('yejin', `<h3>💼 최고급 로펌 대표 변호사의 방문</h3>
      <div class="vn-dialogue">구단과의 재계약을 앞둔 날, e스포츠 전문 로펌 서예진 대표 변호사가 명함을 건넨다.<br><br><b>서예진:</b> "노예계약서에 함부로 도장 찍지 마. 네 실력의 정당한 가치를 내가 보장해 줄게. 내 손 잡아, ${P.name}."</div>
      <p class="c" style="color:#f472b6;font-weight:800">💖 서예진(로펌 대표 & 에이전시 CEO)과의 인연이 열렸습니다!</p>`,
      [{ t: '확인', cls: 'pink' }], 'assets/yejin_date.jpg', '로펌 VIP 집무실');
  }
  if (P.bonds.nayuna && !P.bonds.nayuna.unlocked && (P.rank?.t >= 6 || P.bestT >= 6 || (P.hist.wins >= 5 && statMix({mech:1}) >= 55))) {
    P.bonds.nayuna.unlocked = true;
    P.bonds.nayuna.aff = 20;
    await showHeroineCutscene('nayuna', `<h3>🌙 [히든 히로인] 심야 솔랭 천상계의 유령</h3>
      <div class="vn-dialogue">새벽 3시, 솔랭 1위를 지키는 수수께끼의 유저 [TheGhost] 나유나로부터 비밀 귓속말이 도착했다.<br><br><b>나유나:</b> "...너, 플레이 꽤 날카롭네. 프로판 놈들은 다 뻔해서 지루했는데. 오늘 밤 나랑 비밀 듀오 한 판 때릴래?"</div>
      <p class="c" style="color:#a855f7;font-weight:900">✨ [히든 히로인 해금] 천재 솔랭전사 나유나와의 인연이 열렸습니다!</p>`,
      [{ t: '듀오 수락', cls: 'pink' }], 'assets/nayuna_date.jpg', '심야 솔랭 벙커');
  }
  if (P.bonds.elena && !P.bonds.elena.unlocked && (P.hist.worlds > 0 || P.fans >= 20000 || P.hist.titles.some(t => t.includes('우승')))) {
    P.bonds.elena.unlocked = true;
    P.bonds.elena.aff = 25;
    await showHeroineCutscene('elena', `<h3>🚁 [히든 히로인] 유럽 억만장자 구단주의 전용기 초대</h3>
      <div class="vn-dialogue">롤파크 경기 종료 후 VIP 전용 리무진이 당신을 맞이한다. 유럽 거대 게임단 구단주 엘레나 로마노바가 매혹적인 미소를 짓는다.<br><br><b>엘레나:</b> "Nice to meet you, superstar. 당신의 플레이에 매료되었어. 100억 연봉이든 전용기든, 원하는 건 뭐든 줄게. 나와 함께 세계를 제패하자."</div>
      <p class="c" style="color:#facc15;font-weight:900">✨ [히든 히로인 해금] 유럽 구단주 엘레나 로마노바와의 인연이 열렸습니다!</p>`,
      [{ t: '초대 응하기', cls: 'gold' }], 'assets/elena_date.jpg', '시그니엘 VIP 라운지');
  }
  if (P.bonds.serin && !P.bonds.serin.unlocked && (P.hist.wins >= 4 || P.fans >= 8000)) {
    P.bonds.serin.unlocked = true;
    P.bonds.serin.aff = 20;
    await showHeroineCutscene('serin', `<h3>🎀 [히든 히로인] 롤파크 비상구의 손편지</h3>
      <div class="vn-dialogue">치열한 경기를 마치고 퇴근하는 길, 관중석에서 목이 터져라 응원하던 롤파크 치어리더 퀸 유세린이 수줍게 다가왔다.<br><br><b>유세린:</b> "선수님! 오늘 경기 진짜 감동이었어요...! 이거 제가 직접 탄 비타민 드링크랑 손편지예요... 꼭 읽어주세요 헤헤 🥺"</div>
      <p class="c" style="color:#f472b6;font-weight:900">✨ [히든 히로인 해금] 롤파크 치어리더 퀸 유세린과의 인연이 열렸습니다!</p>`,
      [{ t: '편지 받기', cls: 'pink' }], 'assets/serin_date.jpg', '롤파크 퇴근길');
  }'''

if target_unlock_end in content:
    content = content.replace(target_unlock_end, new_unlocks)
    print('[OK] Updated checkHeroineUnlocks with hidden heroines')
else:
    print('[FAIL] target_unlock_end not found')

# ----------------------------------------------------------------------
# 4. Add DM templates for nayuna, elena, serin
# ----------------------------------------------------------------------
new_dms = '''  {
    id: 'dm_nayuna_scrim',
    sender: '나유나 🌙',
    badge: '솔랭 1위',
    tagCls: 'tag-heroine',
    avatar: 'assets/nayuna.jpg',
    fallback: 'nayuna.jpg',
    category: 'heroine',
    req: p => p.bonds?.nayuna?.unlocked,
    msg: '"야, 자냐? 나 지금 칼바람 말고 본계정 챌린저 솔랭 돌릴 건데 큐 같이 잡자. 네가 미드 서면 내가 정글로 갱 10번 가줌 ㅋㅋㅋ"',
    choices: [
      { t: '🎮 "콜! 나 지금 손 풀렸어. 바로 큐 돌리자"', gain: '💖 나유나 호감도 +15 · 솔랭 승률 +15%', act: p => { p.bonds.nayuna.aff = Math.min(100, (p.bonds.nayuna.aff || 0) + 15); grow('mech', 2); grow('lane', 2); } },
      { t: '🌙 "오늘 경기 뛰어서 피곤한데... 편의점 야식 사줄래?"', gain: '💖 나유나 호감도 +18 · 체력 +15', act: p => { p.bonds.nayuna.aff = Math.min(100, (p.bonds.nayuna.aff || 0) + 18); p.hp = Math.min(100, p.hp + 15); } }
    ]
  },
  {
    id: 'dm_elena_offer',
    sender: '엘레나 로마노바 🚁',
    badge: '유럽 구단주',
    tagCls: 'tag-celeb',
    avatar: 'assets/elena.jpg',
    fallback: 'elena.jpg',
    category: 'heroine',
    req: p => p.bonds?.elena?.unlocked,
    msg: '"Tonight in my penthouse sky-lounge, I have reserved a 1982 Petrus for us. 계약 이야기는 접어두고, 둘만의 서울 밤을 만끽하러 와요."',
    choices: [
      { t: '🥂 "엘레나의 초대를 거절할 남자는 없죠. 지금 출발합니다."', gain: '💖 엘레나 호감도 +20 · 💰 VIP 선물 (2,000만 원)', act: p => { p.bonds.elena.aff = Math.min(100, (p.bonds.elena.aff || 0) + 20); p.money += 20000000; p.stress = Math.max(0, p.stress - 30); } },
      { t: '💼 "비즈니스 파트너이자 동반자로서 최고의 밤을 만들죠."', gain: '💖 엘레나 호감도 +15 · 주간 수익 +20%', act: p => { p.bonds.elena.aff = Math.min(100, (p.bonds.elena.aff || 0) + 15); } }
    ]
  },
  {
    id: 'dm_serin_cheer',
    sender: '유세린 🎀',
    badge: '치어리더 퀸',
    tagCls: 'tag-heroine',
    avatar: 'assets/serin.jpg',
    fallback: 'serin.jpg',
    category: 'heroine',
    req: p => p.bonds?.serin?.unlocked,
    msg: '"선수님! 이번 주말 롤파크 직관 티켓 1열 구했어요!! 제가 직접 만든 [${p.name} 사랑해] 야광 응원봉 들고 갈 거니까 무대에서 꼭 봐주셔야 해요 헤헤 💖"',
    choices: [
      { t: '💌 "세린이 응원봉 바로 찾아볼게! 오늘 무조건 POG 받는다!"', gain: '💖 세린 호감도 +18 · 멘탈 +3 · 피로도 회복', act: p => { p.bonds.serin.aff = Math.min(100, (p.bonds.serin.aff || 0) + 18); grow('mental', 3); p.stress = Math.max(0, p.stress - 25); } },
      { t: '🥤 "경기 끝나고 비상구에서 잠깐 볼까? 커피 사줄게!"', gain: '💖 세린 호감도 +22 · 👥 팬 +5,000', act: p => { p.bonds.serin.aff = Math.min(100, (p.bonds.serin.aff || 0) + 22); p.fans += 5000; } }
    ]
  },'''

if '  {\n    id: \'dm_sora_luxury\',' in content:
    content = content.replace('  {\n    id: \'dm_sora_luxury\',', new_dms + '\n  {\n    id: \'dm_sora_luxury\',')
    print('[OK] Injected DMs for nayuna, elena, serin')
else:
    print('[FAIL] dm_sora_luxury not found')

# ----------------------------------------------------------------------
# 5. Update playMatch set score logic & return
# ----------------------------------------------------------------------
old_match_res = '''  const win = bdWin ? true : Math.random() < sig(adv / 2.2);
  if (win && deaths > 3) deaths = 3;'''

new_match_res = '''  const win = bdWin ? true : Math.random() < sig(adv / 2.2);
  if (win && deaths > 3) deaths = 3;

  let mySetW, mySetL;
  if (win) {
    if (adv >= 2.2 || rating >= 8.2) {
      mySetW = 2; mySetL = 0;
    } else {
      mySetW = 2; mySetL = 1;
    }
  } else {
    if (adv >= -1.8 || rating >= 6.8) {
      mySetW = 1; mySetL = 2;
    } else {
      mySetW = 0; mySetL = 2;
    }
  }'''

if old_match_res in content:
    content = content.replace(old_match_res, new_match_res)
    print('[OK] Updated playMatch set score calculation')
else:
    print('[FAIL] old_match_res not found')

# Result card set score banner
old_res_banner = '''  log += `<div class="result"><div class="big ${win ? 'win' : 'lose'}">${win ? '승리' : '패배'}</div>
    <div class="kda"><div><b>${kills}/${deaths}/${assists}</b>KDA</div><div><b>${rating.toFixed(1)}</b>평점</div><div><b>+${num(fanGain)}</b>팬</div></div>
    ${mvp ? '<div style="color:#fde047;font-weight:900">🏅 POG(Player of the Game) 선정!</div>' : ''}</div>`;'''

new_res_banner = '''  const setDesc = win ? (mySetL === 0 ? '완승 (2:0 Shutout)' : '혈투 끝 신승 (2:1 Clutch)') : (mySetW === 1 ? '풀세트 석패 (1:2 Defeat)' : '완패 (0:2 Sweep)');
  log += `<div class="result"><div class="big ${win ? 'win' : 'lose'}">${win ? '승리' : '패배'}</div>
    <div style="font-size:14.5px;font-weight:900;color:${win ? '#4ade80' : '#f87171'};margin-bottom:6px">🔥 세트 스코어 <b>${mySetW} : ${mySetL}</b> · ${setDesc}</div>
    <div class="kda"><div><b>${kills}/${deaths}/${assists}</b>KDA</div><div><b>${rating.toFixed(1)}</b>평점</div><div><b>+${num(fanGain)}</b>팬</div></div>
    ${mvp ? '<div style="color:#fde047;font-weight:900">🏅 POG(Player of the Game) 선정!</div>' : ''}</div>`;'''

if old_res_banner in content:
    content = content.replace(old_res_banner, new_res_banner)
    print('[OK] Updated playMatch result banner')
else:
    print('[FAIL] old_res_banner not found')

# playMatch return
old_ret = 'return { win, rating };'
new_ret = 'return { win, rating, mySetW, mySetL };'
if old_ret in content:
    content = content.replace(old_ret, new_ret)
    print('[OK] Updated playMatch return')
else:
    print('[FAIL] old_ret not found')

# ----------------------------------------------------------------------
# 6. Update weekEnd set accumulation
# ----------------------------------------------------------------------
old_weekend_match = '''    const res = await playMatch(opp, `${P.stage === 'pro' ? 'KCL' : 'KCL 챌린저스'} ${ph.sp} ${ph.r}라운드`);
    if (res.win) { me.w++; opp.l++; } else { me.l++; opp.w++; }
    simRound(lg, [me.id, opp.id]);'''

new_weekend_match = '''    const res = await playMatch(opp, `${P.stage === 'pro' ? 'LCK' : 'LCK 챌린저스'} ${ph.sp} ${ph.r}라운드`);
    if (!me.setW) { me.setW = me.w * 2; me.setL = me.l * 2; }
    if (!opp.setW) { opp.setW = opp.w * 2; opp.setL = opp.l * 2; }
    if (res.win) {
      me.w++; opp.l++;
      me.setW += (res.mySetW || 2); me.setL += (res.mySetL || 0);
      opp.setW += (res.mySetL || 0); opp.setL += (res.mySetW || 2);
    } else {
      me.l++; opp.w++;
      me.setW += (res.mySetW || 0); me.setL += (res.mySetL || 2);
      opp.setW += (res.mySetL || 2); opp.setL += (res.mySetW || 0);
    }
    simRound(lg, [me.id, opp.id]);'''

if old_weekend_match in content:
    content = content.replace(old_weekend_match, new_weekend_match)
    print('[OK] Updated weekEnd set accumulation')
else:
    print('[FAIL] old_weekend_match not found')

# ----------------------------------------------------------------------
# 7. Authentic LCK 6-Team Playoff Bracket
# ----------------------------------------------------------------------
old_playoffs_regex = r'async function playoffs\(sp\) \{[\s\S]*?checkAchievements\(\);\s*\}\s*\}'

new_playoffs_code = '''async function playoffs(sp) {
  for (const key of ['pro', 'aca']) {
    const lg = P[key];
    const top = standings(lg).slice(0, 6);
    const mine = P.stage === key ? myTeam() : null;
    const lname = key === 'pro' ? 'LCK' : 'LCK 챌린저스';
    const inPO = mine && top.includes(mine);
    const myRank = inPO ? top.indexOf(mine) + 1 : -1;

    if (mine && !inPO) {
      await ask(`<div class="em">📉</div><h3>플레이오프 진출 실패</h3><p class="c">${lname} ${sp} 정규시즌 ${standings(lg).indexOf(mine) + 1}위로 마감했습니다. 아쉽지만 오프시즌 동안 전력을 재정비해야 합니다.</p>`);
      stressAdd(10);
    }

    const play = async (a, b, label) => {
      if (inPO && (a === mine || b === mine)) {
        const opp = a === mine ? b : a;
        const r = await playMatch(opp, label, true);
        return r.win ? mine : opp;
      }
      return simGame(a, b) ? a : b;
    };

    if (inPO) {
      await ask(`
        <div class="em">🏟️</div>
        <h3>${lname} ${sp} 6강 플레이오프 개막!</h3>
        <p class="c">정규시즌 <b>${myRank}위</b>로 포스트시즌 진출에 성공했습니다!</p>
        <div style="background:#11162a;border:1px solid #3b82f6;border-radius:10px;padding:12px;margin:10px 0;font-size:12.5px;line-height:1.7">
          <div style="color:#4ade80;font-weight:700">🏆 1~2위 (${top[0].name}, ${top[1].name}): PO 2라운드(준결승) 직행</div>
          <div style="color:#fde047;font-weight:700">⚔️ PO 1R Match 1: 3위 ${top[2].name} VS 6위 ${top[5].name}</div>
          <div style="color:#fde047;font-weight:700">⚔️ PO 1R Match 2: 4위 ${top[3].name} VS 5위 ${top[4].name}</div>
        </div>
      `, [{ t: '토너먼트 돌입!', cls: 'gold' }]);
    }

    // 1라운드: 3위 vs 6위, 4위 vs 5위
    let r1_winA, r1_winB;
    if (inPO && (mine === top[2] || mine === top[5])) {
      r1_winA = await play(top[2], top[5], `${lname} ${sp} PO 1라운드 (Match 1)`);
    } else {
      r1_winA = simGame(top[2], top[5]) ? top[2] : top[5];
    }
    if (inPO && (mine === top[3] || mine === top[4])) {
      r1_winB = await play(top[3], top[4], `${lname} ${sp} PO 1라운드 (Match 2)`);
    } else {
      r1_winB = simGame(top[3], top[4]) ? top[3] : top[4];
    }

    // 1라운드 탈락 체크
    if (inPO && (myRank >= 3 && myRank <= 6)) {
      if (mine !== r1_winA && mine !== r1_winB) {
        await ask(`<div class="em">😭</div><h3>플레이오프 1라운드 탈락</h3><p class="c">치열한 다전제 접전 끝에 1라운드에서 무릎을 꿇었습니다. 다음 시즌을 기약합시다.</p>`);
        stressAdd(12);
      }
    }

    // 1~2위 휴식 보너스
    if (inPO && (myRank === 1 || myRank === 2)) {
      hpAdd(30);
      stressAdd(-20);
      toast('✨ 1/2위 2라운드 직행 어드밴티지: 충분한 휴식으로 컨디션 회복 (체력 +30, 스트레스 -20)!');
    }

    // 2라운드 (준결승) 매칭:
    const r1_winners = [r1_winA, r1_winB].sort((a, b) => top.indexOf(a) - top.indexOf(b));
    const semi1_opp = r1_winners[1]; // 낮은 시드
    const semi2_opp = r1_winners[0]; // 높은 시드

    if (inPO && (mine === top[0] || mine === top[1] || mine === r1_winA || mine === r1_winB)) {
      await ask(`
        <div class="em">⚔️</div>
        <h3>${lname} ${sp} 플레이오프 2라운드 (준결승)</h3>
        <p class="c">결승전 티켓을 건 운명의 맞대결!</p>
        <div style="background:#11162a;border:1px solid #6366f1;border-radius:10px;padding:10px;margin:8px 0;font-size:12px;line-height:1.6">
          <div><b>준결승 1경기:</b> ${top[0].name} (1위) VS ${semi1_opp.name}</div>
          <div><b>준결승 2경기:</b> ${top[1].name} (2위) VS ${semi2_opp.name}</div>
        </div>
      `, [{ t: '준결승 출전!', cls: 'gold' }]);
    }

    const f1 = await play(top[0], semi1_opp, `${lname} ${sp} 준결승 1경기`);
    const f2 = await play(top[1], semi2_opp, `${lname} ${sp} 준결승 2경기`);

    const finalist = mine && (f1 === mine || f2 === mine);
    if (inPO && !finalist && (mine === top[0] || mine === top[1] || mine === r1_winA || mine === r1_winB)) {
      await ask(`<div class="em">😭</div><h3>준결승 탈락</h3><p class="c">아쉽게 결승 문턱에서 멈췄습니다. 3/4위전 순위로 시즌을 마감합니다.</p>`);
      stressAdd(10);
    }

    // 결승전 (Grand Finals)
    if (finalist) {
      await ask(`
        <div class="em">🎆</div>
        <h3>🏆 ${lname} ${sp} 대망의 결승전!</h3>
        <p class="c">수만 관중이 운집한 특설 무대, 소환사의 컵이 눈앞에 있습니다!</p>
        <div style="background:#281534;border:2px solid #facc15;border-radius:10px;padding:12px;margin:10px 0;text-align:center">
          <div style="font-size:18px;font-weight:900;color:#facc15">${f1.name} VS ${f2.name}</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px">5전 3선승제 결승 매치</div>
        </div>
      `, [{ t: '결승 무대로 입장!', cls: 'gold' }]);
    }

    const champ = await play(f1, f2, `${lname} ${sp} 그랜드 파이널 (결승전)`);

    if (key === 'pro') {
      if (sp === '스프링') P.springChamp = champ.id;
      if (sp === '서머' && mine && key === P.stage) {
        P.worldsQ = finalist || P.springChamp === mine.id;
      }
    }

    if (mine && champ === mine) {
      P.fans += 5000;
      P.money += 50000000;
      P.hist.titles.push(`${P.year}년차 ${lname} ${sp} 우승`);
      playJackpotSound();
      postToInsta(
        `🏆 ${lname} ${sp} 우승 트로피를 들어올렸습니다!`,
        'assets/harin_stage.jpg',
        `모두의 응원 덕분에 해냈습니다. 끝까지 믿어준 팬들과 팀원들에게 영광을 돌립니다! #LCK #우승 #${teamName()} #소환사의컵`
      );
      await ask(`
        <div class="em">🏆</div>
        <h3>🎉 ${lname} ${sp} 챔피언 등극!!</h3>
        <p class="c">황금빛 꽃가루가 쏟아지는 무대 한가운데서 트로피를 번쩍 들어올렸습니다!</p>
        <div class="c" style="color:#ffd23f;font-weight:900;font-size:15px;margin:10px 0">상금 +5,000만 원 · 👥 팬 +5,000명</div>
      `, [{ t: '우승의 감격', cls: 'gold' }]);
      checkAchievements();
    }
  }
}'''

match = re.search(old_playoffs_regex, content)
if match:
    content = content[:match.start()] + new_playoffs_code + content[match.end():]
    print('[OK] Replaced playoffs with LCK 6-team bracket')
else:
    print('[FAIL] playoffs regex did not match')

# ----------------------------------------------------------------------
# 8. Add New Game+ franchise draft to ending
# ----------------------------------------------------------------------
old_ending_ask = '''  await ask(html, [{ t: '새 커리어 시작', cls: 'gold' }]);
  store.del(SAVE); P = null; render();
}'''

new_ending_ask = '''  const endChoices = [{ t: '새 커리어 시작', cls: 'gold' }];
  if (P.money >= 30000000 || h.titles.length > 0) {
    endChoices.unshift({ t: '👑 [2회차] 신생 구단 창단 (구단주 모드)', cls: 'blue' });
  }

  const ans = await ask(html, endChoices);
  if (ans && ans.t && ans.t.includes('구단주 모드')) {
    await startOwnerModeDraft();
    return;
  }
  store.del(SAVE); P = null; render();
}

async function startOwnerModeDraft() {
  const inheritedCash = Math.max(50000000, Math.round((P.money || 0) * 0.25));
  const oldName = P.name;
  const titlesCount = P.hist.titles.length;

  const rookies = [
    { n: '박도현', age: 17, pos: 'mid', type: '⚡ 천재 솔랭전사', s: { mech: 85, lane: 82, macro: 65, team: 70, pool: 65, mental: 72 }, d: '솔랭 1위 출신의 초신성 피지컬 괴물. 라인전 무력 최상급.' },
    { n: '최우석', age: 22, pos: 'sup', type: '🧠 노련한 사령관', s: { mech: 70, lane: 70, macro: 86, team: 85, pool: 75, mental: 82 }, d: '넓은 시야와 침착한 오더로 팀을 이끄는 베테랑 유망주.' },
    { n: '김하늘', age: 18, pos: 'adc', type: '💎 육각형 완성형', s: { mech: 76, lane: 76, macro: 76, team: 76, pool: 76, mental: 76 }, d: '결점이 없는 완벽한 육각형 스탯. 성장 잠재력 1.5배 보정.' }
  ];

  const html = `
    <div class="em">👑</div>
    <h3>[2회차] 신생 프로게임단 창단 & 유망주 드래프트</h3>
    <p class="c">전설의 게이머 <b>${oldName}</b> 은퇴 후, 자본금 <b>${won(inheritedCash)}원</b>을 들고 신생 게임단을 창단합니다!<br>구단의 미래를 짊어질 프랜차이즈 스타 1순위 유망주를 지명하세요.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin:12px 0">
      ${rookies.map((r, i) => `
        <div style="background:#11162a;border:1px solid #3b82f6;border-radius:10px;padding:12px;text-align:left">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <b style="color:#fde047;font-size:15px">${r.n} (${POS[r.pos].n})</b>
            <span style="font-size:12px;color:#60a5fa">${r.type}</span>
          </div>
          <div style="font-size:12.5px;color:#cbd5e1;line-height:1.5">${r.d}</div>
          <div style="font-size:11.5px;color:#94a3b8;margin-top:6px">기본 전력: 피지컬 ${r.s.mech} / 라인전 ${r.s.lane} / 운영 ${r.s.macro} / 멘탈 ${r.s.mental}</div>
        </div>
      `).join('')}
    </div>
  `;

  const picked = await ask(html, rookies.map((r, i) => ({ t: `🎯 ${r.n} 지명 (${r.type})`, cls: 'gold', idx: i })));
  const rookie = rookies[picked.idx || 0];

  store.del(SAVE);
  P = makePlayer(rookie.n, rookie.pos, rookie.s);
  P.money = inheritedCash;
  P.isOwnerMode = true;
  P.mentorName = oldName;
  P.hist.log.push(`[2회차 구단주 모드] 전설 ${oldName}의 신생 게임단 창단 및 ${rookie.n} 지명`);
  save();
  toast(`👑 [창단 완료] ${oldName} 구단주님의 새로운 신화가 시작됩니다!`);
  render();
}'''

if old_ending_ask in content:
    content = content.replace(old_ending_ask, new_ending_ask)
    print('[OK] Updated ending with New Game+ owner mode draft')
else:
    print('[FAIL] old_ending_ask not found')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('[SUCCESS] index.html successfully updated with v1.6 enhancements!')
