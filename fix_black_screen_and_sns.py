# -*- coding: utf-8 -*-
import sys

index_path = 'd:/antigravity/pro-gamer/index.html'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the standalone "if (!P.sns)" that crashed when P is null
buggy_str = """if (!P.sns) P.sns = { posts: [], followers: 120 };
  if (!P.dms) P.dms = { unread: 0, list: [] };"""

if buggy_str in content:
    content = content.replace(buggy_str, """if (P) {
    if (!P.sns) P.sns = { posts: [], followers: 120 };
    if (!P.dms) P.dms = { unread: 0, list: [] };
  }""")
    print('[OK] Fixed top-level P.sns crash!')
else:
    print('[NOTE] Exact buggy_str not found, searching with regex')
    import re
    content = re.sub(
        r'if\s*\(!P\.sns\)\s*P\.sns\s*=\s*\{\s*posts:\s*\[\],\s*followers:\s*120\s*\};\s*if\s*\(!P\.dms\)\s*P\.dms\s*=\s*\{\s*unread:\s*0,\s*list:\s*\[\]\s*\};',
        'if (P) { if (!P.sns) P.sns = { posts: [], followers: 120 }; if (!P.dms) P.dms = { unread: 0, list: [] }; }',
        content
    )
    print('[OK] Applied regex fix for P.sns')

# 2. Add sns and dms to makePlayer()
make_player_target = """    hist: { games: 0, wins: 0, titles: [], worlds: 0, mvp: 0, bestStage: 'ama', log: [] }
  };"""
make_player_replacement = """    sns: { posts: [], followers: 120 },
    dms: { unread: 0, list: [] },
    hist: { games: 0, wins: 0, titles: [], worlds: 0, mvp: 0, bestStage: 'ama', log: [] }
  };"""

if make_player_target in content:
    content = content.replace(make_player_target, make_player_replacement)
    print('[OK] Added sns and dms to makePlayer()')

# 3. Replace introSplash with robust logo fallback and zero-delay dismiss
old_splash = '''<div id="introSplash" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:999999;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity 0.4s ease">
  <video id="introVideo" playsinline muted autoplay style="width:100%;height:100%;object-fit:cover;object-position:center;background:#000"></video>
  <button id="skipIntroBtn" style="position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.35);color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:20px;cursor:pointer;backdrop-filter:blur(6px);z-index:10;display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(0,0,0,0.5)">
    <span>건너뛰기</span> ⏩
  </button>
  <div style="position:absolute;bottom:24px;left:0;right:0;text-align:center;color:rgba(255,255,255,0.6);font-size:11.5px;letter-spacing:1px;pointer-events:none">
    화면을 터치하면 스킵하거나 소리를 켤 수 있습니다
  </div>
</div>'''

new_splash = '''<div id="introSplash" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#080c16;z-index:999999;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity 0.35s ease;cursor:pointer">
  <div id="introLogoFallback" style="text-align:center;padding:20px;z-index:1;user-select:none">
    <div style="font-size:56px;margin-bottom:8px;animation:pulse 1s infinite">🔨</div>
    <h2 style="font-size:24px;font-weight:900;background:linear-gradient(135deg,#fde047,#f59e0b,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 6px">PRO ROAD GAMING</h2>
    <div style="font-size:12px;color:#94a3b8;letter-spacing:1.5px">소환사의 협곡으로 입장하는 중...</div>
  </div>
  <video id="introVideo" playsinline muted autoplay style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:2;opacity:0;transition:opacity 0.3s ease"></video>
  <button id="skipIntroBtn" style="position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.35);color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:20px;cursor:pointer;backdrop-filter:blur(6px);z-index:10;display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(0,0,0,0.5)">
    <span>건너뛰기</span> ⏩
  </button>
  <div style="position:absolute;bottom:24px;left:0;right:0;text-align:center;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:1px;z-index:10;pointer-events:none">
    화면을 터치하면 즉시 게임을 시작합니다
  </div>
</div>'''

if old_splash in content:
    content = content.replace(old_splash, new_splash)
    print('[OK] Replaced introSplash with resilient fallback UI')
else:
    print('[NOTE] old_splash not exact match, checking')

# 4. Replace initIntroVideo with bulletproof dismiss & 1-tap skip
old_init_regex = r'function initIntroVideo\(\)\s*\{[\s\S]*?checkForUpdates\(true\);\s*\}\s*,\s*400\);[\s\S]*?setTimeout\(\(\)\s*=>\s*\{\s*dismissSplash\(\);\s*\}\s*,\s*4500\);[\s\S]*?\}\s*\}'

new_init_func = '''function initIntroVideo() {
  const splash = document.getElementById('introSplash');
  const video = document.getElementById('introVideo');
  const skipBtn = document.getElementById('skipIntroBtn');
  if (!splash) return;

  let dismissed = false;
  function dismissSplash() {
    if (dismissed) return;
    dismissed = true;
    splash.style.opacity = '0';
    setTimeout(() => {
      try {
        splash.style.display = 'none';
        splash.remove();
      } catch (e) {}
      checkForUpdates(true);
    }, 350);
  }

  // 1-터치 즉시 스킵: 화면 어디든 탭하면 바로 게임으로 진입
  splash.onclick = (e) => {
    e.stopPropagation();
    dismissSplash();
  };

  if (skipBtn) {
    skipBtn.onclick = (e) => {
      e.stopPropagation();
      dismissSplash();
    };
  }

  if (video) {
    const isPortrait = window.innerHeight > window.innerWidth;
    const videoSrc = isPortrait ? 'assets/logo_portrait.mp4' : 'assets/logo_landscape.mp4';
    const fallbackSrc = isPortrait ? 'logo_portrait.mp4' : 'logo_landscape.mp4';

    video.src = videoSrc;
    video.playbackRate = 1.65;

    // 비디오가 정상 재생 시작되면 부드럽게 페이드인 노출
    video.onplaying = () => {
      video.style.opacity = '1';
    };

    video.onended = () => {
      dismissSplash();
    };

    video.onerror = () => {
      // 비디오 재생 실패 시 조용히 스플래시 종료하여 게임 화면 즉시 표시
      if (video.src.indexOf('assets/') !== -1) {
        video.src = fallbackSrc;
        video.play().catch(() => { dismissSplash(); });
      } else {
        dismissSplash();
      }
    };

    const p = video.play();
    if (p !== undefined) {
      p.catch(() => {
        video.muted = true;
        video.play().catch(() => {
          // 비디오 재생 불가능한 기기에서는 1.5초 후 자동 게임 진입
          setTimeout(dismissSplash, 1500);
        });
      });
    }
  }

  // 안전 타임아웃: 어떤 기기든 최대 3.0초 후 무조건 게임 메인 화면 노출 보장!
  setTimeout(() => {
    dismissSplash();
  }, 3000);
}'''

import re
idx = content.find('function initIntroVideo()')
idx_next = content.find('async function checkForUpdates', idx)

if idx != -1 and idx_next != -1:
    content = content[:idx] + new_init_func + '\n\n' + content[idx_next:]
    print('[OK] Replaced initIntroVideo with bulletproof zero-hang logic')
else:
    print('[FAIL] Could not locate initIntroVideo boundaries')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('[SUCCESS] index.html successfully fixed!')
