// Playwright CLI run-code에 이 파일의 내용을 전달한다.
// 사전 조건: 검증 전용 브라우저에서 선수를 생성하고 로컬 게임에 접속해 둘 것.
// OS 키보드 대신 visualViewport 수치만 주입한다. 실제 기기 검증을 대체하지 않는다.
async page => {
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  try {
    await page.reload();
    await page.locator('#introSplash').waitFor({ state: 'hidden' });
    await page.locator('#bSns').click();
    check(await page.locator('#modal').isVisible(), '인스타 피드 열기 실패');
    await page.locator('#bCreatePost').click();
    await page.locator('#captionInput').fill('키보드 회귀 검증 게시물');
    await page.evaluate(() => {
      Object.defineProperty(visualViewport, 'height', { configurable: true, value: 500 });
      Object.defineProperty(visualViewport, 'offsetTop', { configurable: true, value: 25 });
      visualViewport.dispatchEvent(new Event('resize'));
    });
    await page.waitForFunction(() => document.documentElement.classList.contains('keyboard-open'));
    const layout = await page.evaluate(() => {
      const modal = document.querySelector('#modal').getBoundingClientRect();
      const box = document.querySelector('#modal .box').getBoundingClientRect();
      return { top: modal.top, height: modal.height, boxTop: box.top, boxBottom: box.bottom,
        dock: getComputedStyle(document.querySelector('.bottom-nav-dock')).visibility,
        font: getComputedStyle(document.querySelector('#captionInput')).fontSize };
    });
    check(layout.top === 25 && layout.height === 500, '가시 영역 모달 배치 실패');
    check(layout.boxTop >= 25 && layout.boxBottom <= 525, '모달이 키보드 영역을 침범함');
    check(layout.dock === 'hidden' && parseFloat(layout.font) >= 16, '메뉴 숨김 또는 입력 확대 방지 실패');
    await page.locator('#captionInput').scrollIntoViewIfNeeded();
    const caption = await page.locator('#captionInput').boundingBox();
    check(caption.y >= 25 && caption.y + caption.height <= 525, '캡션이 입력 가능한 영역에 들어오지 않음');
    await page.screenshot({ path: '.system_generated/keyboard/keyboard-simulated.png' });
    await page.evaluate(() => {
      delete visualViewport.height; delete visualViewport.offsetTop;
      visualViewport.dispatchEvent(new Event('resize'));
    });
    await page.waitForFunction(() => !document.documentElement.classList.contains('keyboard-open'));
    await page.locator('[data-setfilter="juno"]').click();
    check(await page.locator('#captionInput').inputValue() === '키보드 회귀 검증 게시물', '필터 변경 시 캡션 손실');
    await page.locator('[data-pickphoto="0"]').click();
    check(await page.locator('#captionInput').inputValue() === '키보드 회귀 검증 게시물', '사진 변경 시 캡션 손실');
    await page.locator('[data-addtag="#LOL"]').click();
    await page.locator('#bPostShare').click();
    await page.locator('#bCreatePost').waitFor();
    check((await page.locator('#mBody').innerText()).includes('키보드 회귀 검증 게시물 #LOL'), '피드 게시 결과 누락');
    await page.locator('#bCreatePost').click();
    await page.locator('#mCloseBtn').click();
    await page.locator('#bCreatePost').waitFor();
    await page.locator('#tabDm').click();
    await page.locator('#tabFeed').click();
    await page.locator('#mBtns .btn').click();
    check(await page.locator('#modal').isHidden(), '피드 닫기 실패');
    await page.locator('#bSns').click();
    check(await page.locator('#bCreatePost').isVisible(), '닫은 뒤 피드 재진입 실패');
    await page.locator('#mCloseBtn').click();
    check(await page.locator('#modal').isHidden(), '모달 닫기 실패');
    check(errors.length === 0, `런타임 오류: ${errors.join(', ')}`);
    return ('BROWSER_PASS: 피드 진입, 캡션, 키보드 모의 높이, 메뉴 복원, 필터/사진/태그, 공유, 작성 닫기, DM 전환, 재진입 (pageerror 0)');
  } finally {
    await page.evaluate(() => {
      delete visualViewport.height; delete visualViewport.offsetTop;
      visualViewport.dispatchEvent(new Event('resize'));
    });
    page.off('pageerror', onError);
  }
}
