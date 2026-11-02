# -*- coding: utf-8 -*-
with open('d:/antigravity/pro-gamer/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('async function playoffs(sp) {')
idx2 = text.find('function intlTeams()', idx1)

if idx1 != -1 and idx2 != -1:
    new_code = '''async function playoffs(sp) {
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
      const title = `${P.year}년차 ${lname} ${sp} 우승`;
      P.hist.titles.push(title);
      P.hist.log.push(title);
      const bonus = key === 'pro' ? 50000000 : 5000000;
      P.money += bonus;
      P.fans += key === 'pro' ? 20000 : 3000;
      stressAdd(-35);
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
        <div class="c" style="color:#ffd23f;font-weight:900;font-size:15px;margin:10px 0">상금 +${won(bonus)}원 · 👥 팬 +${num(key === 'pro' ? 20000 : 3000)}명</div>
      `, [{ t: '우승의 감격', cls: 'gold' }]);
      checkAchievements();
    } else if (finalist) {
      await ask(`<div class="em">🥈</div><h3>준우승</h3><p class="c">결승에서 아쉽게 패배했다. 다음엔 반드시...</p>`);
      P.money += key === 'pro' ? 15000000 : 2000000;
    }
    if (key === 'pro' && sp === '서머' && P.stage === 'pro' && P.worldsQ) {
      P.worldsAlive = true; P.worldsWins = 0;
      await ask(`<div class="em">🌍</div><h3>월드 챔피언십 진출!</h3><p class="c">LCK 대표로 세계 무대에 선다!</p>`, [{ t: '가자!', cls: 'gold' }]);
    }
  }
}

'''
    content = text[:idx1] + new_code + text[idx2:]
    with open('d:/antigravity/pro-gamer/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('[SUCCESS] Playoffs replaced successfully with LCK 6-team bracket!')
else:
    print('[FAIL] Indices not found:', idx1, idx2)
