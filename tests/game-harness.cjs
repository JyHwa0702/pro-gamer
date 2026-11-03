const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(process.env.GAME_SOURCE_FILE || 'index.html', 'utf8').match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i)[1];
function game(seed = 12345, htmlOverride) {
  const gameSource = htmlOverride ? htmlOverride.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i)[1] : source;
  const storage = new Map(), nodes = new Map();
  const element = key => {
    if (!nodes.has(key)) nodes.set(key, { innerHTML: '', style: {}, dataset: {}, scrollTop: 0, classList: { add() {}, remove() {}, contains() { return false; } }, querySelectorAll() { return []; }, appendChild() {} });
    return nodes.get(key);
  };
  let state = seed;
  const math = Object.create(Math);
  math.random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const context = vm.createContext({ console, Math: math, Date, window: {}, document: { querySelector: element, querySelectorAll: () => [], createElement: () => element(Symbol()) }, localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) }, setTimeout: () => 0, clearTimeout() {} });
  vm.runInContext(gameSource.slice(0, gameSource.lastIndexOf('P = load();')).replace('const sleep =', 'let sleep ='), context);
  vm.runInContext('globalThis.__nativeCutscene=showHeroineCutscene;globalThis.__nativeAchievements=checkAchievements;globalThis.__nativeRender=render;', context);
  const run = code => vm.runInContext(code, context);
  run(`toast=()=>{}; render=()=>{}; renderTop=()=>{}; playJackpotSound=()=>{}; playDateSound=()=>{}; playCoinSound=()=>{}; sleep=async()=>{};
    ask=async()=>0; showHeroineCutscene=async()=>0; checkAchievements=()=>{};
    P=makePlayer('회귀검증','mid',{mech:30,lane:30,macro:30,team:30,pool:30,mental:55});P.talent=1.15;`);
  return { run, storage, nodes };
}
module.exports = { game };
