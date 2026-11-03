// 실행: node --test tests/mobile-viewport.test.cjs
// 실제 브라우저의 키보드 대신 visualViewport 이벤트/수치를 주입하는 회귀 검사.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const source = html.match(/function initMobileViewport\(\) \{[\s\S]*?\n\}/)?.[0];
function setup({ viewport = true, coarse = true } = {}) {
  assert.ok(source, '가시 영역에 맞춰 입력 모달을 조절하는 초기화 함수가 필요합니다.');
  const target = extra => Object.assign({ listeners: {}, addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }, emit(type) { for (const fn of this.listeners[type] || []) fn(); } }, extra);
  const styles = {}, classes = new Set();
  const root = { clientHeight: 844, style: { setProperty: (k, v) => styles[k] = v }, classList: { toggle(k, on) { on ? classes.add(k) : classes.delete(k); } } };
  const vv = target({ width: 390, height: 844, offsetTop: 0, scale: 1 });
  const window = target({ visualViewport: viewport ? vv : undefined, innerHeight: 844, innerWidth: 390, matchMedia: () => ({ matches: coarse }) });
  const document = target({ documentElement: root, activeElement: null });
  const context = { window, document, requestAnimationFrame: fn => fn() };
  vm.runInNewContext(source + '\ninitMobileViewport();', context);
  const focus = (tagName = 'TEXTAREA', type = 'text') => { document.activeElement = { tagName, type }; document.emit('focusin'); };
  const resize = height => { vv.height = height; vv.emit('resize'); };
  return { vv, window, document, root, styles, focus, resize, hidden: () => classes.has('keyboard-open') };
}
test('모달 높이와 위치를 실제 가시 영역으로 동기화한다', () => {
  const s = setup(); s.vv.offsetTop = 38; s.resize(510);
  assert.equal(s.styles['--visual-viewport-height'], '510px');
  assert.equal(s.styles['--visual-viewport-top'], '38px');
  assert.equal(s.hidden(), false);
});
test('캡션 입력 중 키보드가 열리면 메뉴를 숨기고 닫히면 복원한다', () => {
  const s = setup(); s.focus(); s.resize(500); assert.equal(s.hidden(), true);
  s.resize(844); assert.equal(s.hidden(), false);
});
test('레이아웃 영역도 함께 줄어드는 브라우저에서 키보드를 감지한다', () => {
  const s = setup(); s.focus(); s.window.innerHeight = 500; s.root.clientHeight = 500;
  s.resize(500); assert.equal(s.hidden(), true);
});
test('입력 포커스를 해제하면 키보드 종료 이벤트 전에도 메뉴가 복원된다', () => {
  const s = setup(); s.focus(); s.resize(500);
  s.document.activeElement = null; s.document.emit('focusout'); assert.equal(s.hidden(), false);
});
test('주소창 정도의 높이 변화나 확대를 키보드로 오인하지 않는다', () => {
  const s = setup(); s.focus(); s.resize(770); assert.equal(s.hidden(), false);
  s.vv.scale = 2; s.resize(420); assert.equal(s.hidden(), false);
});
test('데스크톱 창 크기 변경 중에도 메뉴를 유지한다', () => {
  const s = setup({ coarse: false }); s.focus(); s.resize(500); assert.equal(s.hidden(), false);
});
test('선택 버튼 및 읽기 전용 입력창은 키보드 감지에서 제외한다', () => {
  const s = setup(); s.focus('INPUT', 'button'); s.resize(500); assert.equal(s.hidden(), false);
  s.focus(); s.document.activeElement.readOnly = true; s.resize(500); assert.equal(s.hidden(), false);
});
test('가로 전환 시 이전 세로 높이로 키보드를 오인하지 않는다', () => {
  const s = setup(); s.focus(); s.window.innerWidth = 844;
  s.window.innerHeight = s.root.clientHeight = 390; s.vv.width = 844;
  s.resize(390); assert.equal(s.hidden(), false);
});
test('visualViewport 미지원 브라우저는 기존 레이아웃을 유지한다', () => {
  const s = setup({ viewport: false }); s.focus(); assert.equal(s.hidden(), false);
  assert.deepEqual(s.styles, {});
});
