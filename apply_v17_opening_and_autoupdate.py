# -*- coding: utf-8 -*-
import sys, os

index_path = 'd:/antigravity/pro-gamer/index.html'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject introSplash right after <body>
splash_html = '''<body>
<div id="introSplash" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:999999;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity 0.4s ease">
  <video id="introVideo" playsinline muted autoplay style="width:100%;height:100%;object-fit:cover;object-position:center;background:#000"></video>
  <button id="skipIntroBtn" style="position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.35);color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:20px;cursor:pointer;backdrop-filter:blur(6px);z-index:10;display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(0,0,0,0.5)">
    <span>건너뛰기</span> ⏩
  </button>
  <div style="position:absolute;bottom:24px;left:0;right:0;text-align:center;color:rgba(255,255,255,0.6);font-size:11.5px;letter-spacing:1px;pointer-events:none">
    화면을 터치하면 스킵하거나 소리를 켤 수 있습니다
  </div>
</div>'''

if '<div id="introSplash"' not in content:
    content = content.replace('<body>', splash_html, 1)
    print('[OK] Injected introSplash HTML after <body>')
else:
    print('[SKIP] introSplash already present')

# 2. Logic for opening video and auto update
new_js_logic = '''
// ======================================================================
// 회사 로고 오프닝 비디오 연출 & 인앱 자동 업데이트 (v1.7.0)
// ======================================================================
const CURRENT_VERSION = '1.7.0';
const CURRENT_VERSION_CODE = 3;

function initIntroVideo() {
  const splash = document.getElementById('introSplash');
  const video = document.getElementById('introVideo');
  const skipBtn = document.getElementById('skipIntroBtn');
  if (!splash || !video) return;

  // 화면 방향 감지: 세로(portrait) vs 가로(landscape)
  const isPortrait = window.innerHeight > window.innerWidth;
  const videoSrc = isPortrait ? 'assets/logo_portrait.mp4' : 'assets/logo_landscape.mp4';
  const fallbackSrc = isPortrait ? 'logo_portrait.mp4' : 'logo_landscape.mp4';

  video.src = videoSrc;
  video.onerror = () => {
    if (video.src.indexOf('assets/') !== -1) {
      video.src = fallbackSrc;
      video.play().catch(() => {});
    } else {
      dismissSplash();
    }
  };

  let dismissed = false;
  function dismissSplash() {
    if (dismissed) return;
    dismissed = true;
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      splash.remove();
      // 인트로 종료 즉시 백그라운드 자동 업데이트 확인 실행
      checkForUpdates(true);
    }, 400);
  }

  // 배속 설정: 6초 영상을 약 3.5초 만에 신속하고 임팩트 있게 재생 (1.65배속)
  video.playbackRate = 1.65;
  video.onloadedmetadata = () => {
    video.playbackRate = 1.65;
  };

  video.onended = () => {
    dismissSplash();
  };

  if (skipBtn) {
    skipBtn.onclick = (e) => {
      e.stopPropagation();
      dismissSplash();
    };
  }

  let tapCount = 0;
  splash.onclick = () => {
    tapCount++;
    if (video.muted) {
      video.muted = false; // 소리 재생 시도
    }
    if (tapCount >= 2) {
      dismissSplash();
    }
  };

  // 안전 타임아웃 (최대 4.5초 후 자동 종료)
  setTimeout(() => {
    dismissSplash();
  }, 4500);

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      video.muted = true;
      video.play().catch(() => {
        dismissSplash();
      });
    });
  }
}

async function checkForUpdates(silent = true) {
  try {
    const urls = [
      'https://raw.githubusercontent.com/JyHwa0702/pro-gamer/master/version.json',
      'version.json',
      'assets/version.json'
    ];
    let remoteData = null;
    for (const url of urls) {
      try {
        const res = await fetch(url + '?_t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          remoteData = await res.json();
          break;
        }
      } catch (e) {}
    }

    if (!remoteData || !remoteData.version) return;

    if (isNewerVersion(remoteData.version, CURRENT_VERSION)) {
      showUpdateModal(remoteData);
    } else if (!silent) {
      toast(`✨ 현재 최신 버전(v${CURRENT_VERSION})을 이용 중입니다.`);
    }
  } catch (err) {
    console.warn('Update check failed:', err);
  }
}

function isNewerVersion(remote, local) {
  const r = (remote || '').split('.').map(Number);
  const l = (local || '').split('.').map(Number);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const rv = r[i] || 0, lv = l[i] || 0;
    if (rv > lv) return true;
    if (rv < lv) return false;
  }
  return false;
}

function showUpdateModal(info) {
  const modalHtml = `
    <div style="text-align:center">
      <div style="font-size:38px;margin-bottom:6px">🚀</div>
      <h3 style="color:#fde047;margin:0 0 4px">새로운 버전 발견! (v${info.version})</h3>
      <p style="font-size:12px;color:#94a3b8;margin:0 0 12px">현재 버전: v${CURRENT_VERSION} ➔ 최신 버전: v${info.version}</p>
      
      <div style="background:#11162a;border:1px solid #3b82f6;border-radius:10px;padding:12px;text-align:left;margin-bottom:14px">
        <b style="color:#60a5fa;font-size:13px">🔥 업데이트 주요 변경 내역:</b>
        <ul style="margin:6px 0 0 18px;padding:0;font-size:12px;color:#e2e8f0;line-height:1.6">
          ${(info.changelog || ['성능 개선 및 버그 수정']).map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="${info.downloadUrl || 'pro-gamer.apk'}" target="_blank" class="btn gold" style="display:block;text-decoration:none;padding:10px;font-weight:900;font-size:14px;text-align:center">
          📥 최신 APK 다운로드 설치
        </a>
      </div>
    </div>
  `;
  ask(modalHtml, [{ t: '나중에 하기', cls: 'gray' }]);
}
'''

# 3. Insert new_js_logic and call initIntroVideo()
if 'initIntroVideo()' not in content:
    target_tail = '''P = load();
render();
addEventListener('pagehide', save);'''

    replacement_tail = new_js_logic + '''\nP = load();
render();
initIntroVideo();
addEventListener('pagehide', save);'''

    content = content.replace(target_tail, replacement_tail)
    print('[OK] Injected initIntroVideo and checkForUpdates logic')
else:
    print('[SKIP] initIntroVideo already in script')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('[SUCCESS] index.html updated successfully with v1.7.0 opening and auto-update!')
