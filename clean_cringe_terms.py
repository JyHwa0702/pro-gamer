# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

index_path = 'd:/antigravity/pro-gamer/index.html'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    # 1. HTML Title
    ('<title>프로의 길 : 인연 (7인의 로맨스 & 대박 잭팟)</title>',
     '<title>프로의 길 : 인연 (PRO ROAD : BONDS)</title>'),

    # 2. Action description
    ("d: '7인 히로인 밀착 데이트 & 대박 잭팟'",
     "d: '소중한 인연과의 휴식 데이트 · 멘탈 회복 & 깊은 교감'"),

    # 3. Jackpot Header & UI
    ("대박 잭팟! 계 탔다!!",
     "✨ 특별한 서프라이즈 (Special Moment)"),
    ("🎁 잭팟 횡재 보상 획득",
     "🎁 특별 서포트 혜택 획득"),
    ("{ t: '대박이다!! (계타기 성공)', cls: 'gold' }",
     "{ t: '정말 고마워! (혜택 받기)', cls: 'gold' }"),
    ("toast('🎰 초대박 잭팟 달성!!');",
     "toast('✨ 소중한 인연으로부터 특별한 서포트를 받았습니다!');"),
    ('title: \'🎟️ "대박대박!! 너랑 재미로 샀던 로또가 2등 당첨됐어!!"\',',
     'title: \'🎟️ "너랑 재미로 참여했던 이벤트... 1등으로 뽑혔어!!"\','),

    # 4. Negotiation
    ("🎰 3. 초대박 배짱 튕기기 (+50% 파격 인상)<br><small style=\"font-weight:500;color:#94a3b8\">성공 시 대박! 실패 시 구단 결렬 위기!</small>",
     "💼 3. 리그 최고 대우 요구 (+50% 파격 인상)<br><small style=\"font-weight:500;color:#94a3b8\">성공 시 역대급 계약! 실패 시 구단 협상 난항</small>"),
    ("<h3>초대박 계약 성사!</h3>",
     "<h3>최고 대우 계약 성사!</h3>"),

    # 5. Achievements
    ("{ k: 'a_jackpot', n: '인생 역전! 계 탔다! 🎉', d: '데이트 또는 선물 중 대박 잭팟 1회 달성'",
     "{ k: 'a_jackpot', n: '뜻밖의 선물 🎁', d: '데이트 중 특별한 서프라이즈 이벤트 1회 달성'"),
    ("{ k: 'a_grand_harem', n: '협곡의 절대 하렘 군주 👑', d: '5명 이상의 히로인과 연인(호감도 75+) 달성'",
     "{ k: 'a_grand_harem', n: '모두가 사랑하는 별 ⭐', d: '5명 이상의 히로인과 깊은 연인 관계 달성'"),
    ("{ k: 'a_harem', n: '협곡의 마성남', d: '3명 이상의 히로인과 연인 달성'",
     "{ k: 'a_harem', n: '빛나는 매력남 💖', d: '3명 이상의 히로인과 연인 관계 달성'"),
    ("{ k: 'a_10harem', n: '협곡의 절대 신 (10인의 여인) 👑', d: '10명의 히로인과 모두 인연 해금'",
     "{ k: 'a_10harem', n: '모든 인연의 정점 👑', d: '10명 이상의 히로인과 모두 인연 해금'"),

    # 6. Ending Title & Story
    ('<h4 style="color:#f472b6;margin:0 0 6px">👑 [하렘 트루 엔딩] 모두에게 사랑받는 전설의 황제</h4>',
     '<h4 style="color:#f472b6;margin:0 0 6px">👑 [트루 엔딩] 소중한 사람들과 함께 만든 전설</h4>'),
    ("소환사의 협곡에서 모든 트로피를 들어 올린 당신의 곁에는, 당신을 진심으로 사랑하는 ${loves80.map(k => `<b>${HEROINES[k].name}</b>`).join(', ')}이(가) 언제나 함께하고 있습니다.<br>\n          그녀들의 따뜻한 사랑 속에서 당신은 프로로서도, 한 사람으로서도 완벽한 전설이 되었습니다!",
     "치열했던 소환사의 협곡에서 모든 트로피를 들어 올린 당신의 곁에는, 가장 힘든 순간부터 정상에 오르기까지 묵묵히 곁을 지켜준 ${loves80.map(k => `<b>${HEROINES[k].name}</b>`).join(', ')}이(가) 함께하고 있습니다.<br>\n          그녀들의 진심 어린 응원과 사랑 속에서, 당신의 커리어는 프로게이머를 넘어 한 사람의 눈부신 인생으로 완성되었습니다."),

    # 7. Mad movie wording
    ("sub: '황제의 진형 · 점멸 5인궁 대박'",
     "sub: '황제의 진형 · 점멸 5인궁 슈퍼플레이'"),
    ("{ u: 'esports_today', t: '오늘 폼 대박이던데 인터뷰 멋있었어요 🔥' }",
     "{ u: 'esports_today', t: '오늘 경기 폼 미쳤던데요, 인터뷰도 최고였습니다 🔥' }"),
    ("{ n: '💄 프랑스 명품 립스틱 세트', c: 90000, aff: 18, msg: '\"어머! 내가 이번 방송에서 바르고 싶었던 신상 컬러인데! 센스 대박이다~\"' }",
     "{ n: '💄 프랑스 명품 립스틱 세트', c: 90000, aff: 18, msg: '\"어머! 내가 이번 방송에서 바르고 싶었던 신상 컬러인데! 센스 정말 최고다~\"' }")
]

replaced_count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        replaced_count += 1
        print(f"[REPLACED] {old[:40]}... -> {new[:40]}...")
    else:
        print(f"[NOT FOUND] {old[:50]}...")

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n[DONE] Successfully replaced {replaced_count} tacky/cringe phrases with polished eSports visual novel text!")
