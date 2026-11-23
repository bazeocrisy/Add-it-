// Money area: tests with INDEPENDENT expectations.
// Every key is re-derived here from the raw item data in money.js (read directly, not through the app),
// using this file's own coin table and brute-force coin math. The app's stored answers are only compared against.
// Run: node learning-club/test-money.js [screenshotDir]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const FILE = 'file://' + path.resolve(__dirname, '../chriss-learning-club.html');
const SHOTS = process.argv[2] || null;
const R = []; const ok = (n, c, i) => R.push((c ? 'PASS ' : 'FAIL ') + n + (i !== undefined && i !== '' ? '  (' + i + ')' : ''));

// ---- independent reference data: U.S. Mint coin specifications (usmint.gov, "Coin Specifications") ----
const VAL = { p: 1, n: 5, d: 10, q: 25 };
const MM = { p: 19.05, n: 21.21, d: 17.91, q: 24.26 };
const NAME = { p: 'penny', n: 'nickel', d: 'dime', q: 'quarter' };
const PLURAL = { p: 'pennies', n: 'nickels', d: 'dimes', q: 'quarters' };
const total = s => s.toLowerCase().split('').reduce((t, c) => t + VAL[c], 0);
const sortKey = s => s.toLowerCase().split('').sort().join('');

// ---- read money.js directly in a sandbox ----
const sb = { AREAS: [], SKILLS: {}, LESSONS: {} }; vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'money.js'), 'utf8') + '\n;this.MONEY_BANK = MONEY_BANK; this.MONEY_CHECK = MONEY_CHECK;', sb);
const RAW_P = sb.MONEY_BANK, RAW_C = sb.MONEY_CHECK, LES = sb.LESSONS.money, SK = sb.SKILLS.money;
const lessonItems = []; LES.forEach(l => l.steps.forEach((s, si) => { if (s.q) lessonItems.push(Object.assign({ id: 'L:money:' + l.id + ':' + si, sk: l.skill, _step: s.t }, s.q)); }));

// all coin combinations (count vectors) using allowed coins that total exactly `target`
function combos(target, only) {
  const out = []; const kinds = ['q', 'd', 'n', 'p'].filter(c => only.includes(c));
  (function rec(i, left, acc) {
    if (i === kinds.length) { if (left === 0) out.push(acc.slice()); return; }
    const c = kinds[i];
    for (let k = 0; k * VAL[c] <= left; k++) { acc.push(c.repeat(k)); rec(i + 1, left - k * VAL[c], acc); acc.pop(); }
  })(0, target, []);
  return out.map(a => a.join('').split('')).filter(a => a.length > 0);
}
// what the item is supposed to be worth, derived from its fields and the question wording
function expectNum(r) {
  if (r.groups && r.diff) { const t = r.groups.map(g => total(g.coins)); return Math.abs(t[0] - t[1]); }
  if (r.coins && r.price != null) return r.price - total(r.coins);
  if (r.prices && r.paid != null) return r.paid - r.prices.reduce((a, b) => a + b, 0);
  if (r.prices) return r.prices.reduce((a, b) => a + b, 0);
  if (r.coins) return total(r.coins);
  return r.ans;
}
// parse a coin-set description written by the app ("2 quarters and 5 dimes", "3 quarters, 2 dimes, and 1 nickel")
function wantOf(r) { const price = r.q.match(/costs (\d+)¢/), make = r.q.match(/make (\d+)¢/); if (price && /\$1\.00/.test(r.q)) return 100 - Number(price[1]); if (/\$1\.00/.test(r.q)) return 100; if (make) return Number(make[1]); }
// the right choice for a multiple-choice item, worked out here (not read from the app)
function expectMC(r) {
  if (r.groups && r.cmp) { const t = r.groups.map(g => total(g.coins)); return t.indexOf(/LESS/.test(r.q) ? Math.min(...t) : Math.max(...t)); }
  if (r.opts) return r.opts.map(total).indexOf(wantOf(r));
  return r.a;
}
function parseDesc(txt) {
  let t = 0; const re = /(\d+)\s+(penny|pennies|nickels?|dimes?|quarters?)/g; let m;
  while ((m = re.exec(txt))) { const w = m[2]; const c = w.startsWith('penn') ? 'p' : w[0]; t += Number(m[1]) * VAL[c]; }
  return t;
}

(async () => {
  const b = await chromium.launch();
  const errs = [];
  const newPage = async (opts, seed) => {
    const ctx = await b.newContext(opts || { viewport: { width: 1200, height: 900 } });
    const net = []; await ctx.route('**/*', r => { const u = r.request().url(); if (!/^(file|blob|data):/.test(u)) { net.push(u); return r.abort(); } return r.continue(); });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p._net = net;
    if (seed) await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('chrissLearningClub.v1', s); } }, JSON.stringify(seed));
    await p.goto(FILE); return p;
  };
  const allLessons = {}; LES.forEach(l => { allLessons['money:' + l.id] = true; });
  const seedDone = { v: 3, nick: 'Chris', lessons: allLessons, stats: {}, skills: {}, checks: [] };

  // ===================== 1. coin facts =====================
  const p = await newPage();
  const app = await p.evaluate(() => { const C = window.__CLC; const L = {}; C.LESSONS.money.forEach(l => l.steps.forEach((s, si) => { if (s.q) { const q = C.lessonQ('money', l, si); L[q.id] = q; } })); return { qby: Object.assign(Object.fromEntries(Object.values(C.QBY).filter(q => q.area === 'money').map(q => [q.id, q])), L), check: C.CHECK_Q.money.map(q => q.id), practice: C.AREA_Q.money.map(q => q.id), build: C.BUILD_ID }; });
  const Q = app.qby;
  const coinTable = await p.evaluate(() => { const out = {}; const d = document.createElement('div'); d.innerHTML = window.__CLC.sheetHTML('money'); document.body.appendChild(d); d.querySelectorAll('.sh-coins figure').forEach(f => { out[f.querySelector('b').textContent] = { cap: f.querySelector('figcaption').textContent, w: f.querySelector('.coin').getAttribute('width'), h: f.querySelector('.coin').getAttribute('height') }; }); d.remove(); return out; });
  ok('coin values: penny 1¢, nickel 5¢, dime 10¢, quarter 25¢ (reference sheet)', ['p', 'n', 'd', 'q'].every(c => coinTable[NAME[c]] && coinTable[NAME[c]].cap.includes(VAL[c] + '¢')), JSON.stringify(coinTable));
  ok('coin pictures are square boxes (never stretched)', Object.values(coinTable).every(x => x.w === x.h));
  const ratio = (a, c) => Number(coinTable[NAME[a]].w) / Number(coinTable[NAME[c]].w);
  ok('picture sizes follow U.S. Mint diameters (dime 17.91, penny 19.05, nickel 21.21, quarter 24.26 mm)', ['p', 'n', 'd'].every(c => Math.abs(ratio(c, 'q') - MM[c] / MM.q) < 0.02), ['p', 'n', 'd'].map(c => c + ':' + ratio(c, 'q').toFixed(3) + ' vs ' + (MM[c] / MM.q).toFixed(3)).join(' '));
  const imgs = await p.evaluate(() => Promise.all(['penny', 'nickel', 'dime', 'quarter'].flatMap(n => ['heads', 'tails'].map(s => new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, im.width, im.height).data; let edge = 0, corner = d[3]; for (let i = 0; i < im.width; i++) { if (d[(i) * 4 + 3] > 20) edge++; if (d[((im.height - 1) * im.width + i) * 4 + 3] > 20) edge++; if (d[(i * im.width) * 4 + 3] > 20) edge++; if (d[(i * im.width + im.width - 1) * 4 + 3] > 20) edge++; } res({ k: n + '-' + s, w: im.width, h: im.height, edge, corner }); }; im.src = IMAGES['coin-' + n + '-' + s]; })))));
  ok('8 coin images (4 coins x heads/tails), square, transparent corners', imgs.length === 8 && imgs.every(i => i.w === i.h && i.corner === 0), imgs.map(i => i.k + ' ' + i.w + 'x' + i.h).join(', '));
  ok('no coin image touches the edge of its picture (no clipped rims)', imgs.every(i => i.edge === 0), imgs.map(i => i.k + ':' + i.edge).join(' '));

  // ===================== 2. keys from structured data =====================
  const allRaw = RAW_P.map(r => ['practice', r]).concat(RAW_C.map(r => ['check', r])).concat(lessonItems.map(r => ['lesson', r]));
  const bad = [];
  let nNum = 0, nTray = 0, nTrayCombos = 0, nCmp = 0, nOpts = 0;
  allRaw.forEach(([where, r]) => {
    const q = Q[r.id]; if (!q) { bad.push('missing in app: ' + r.id); return; }
    if (r.k === 'num') {
      nNum++; const e = expectNum(r);
      if (q.ans !== e) bad.push(r.id + ' key ' + q.ans + ' expected ' + e);
      if (!(e > 0 && e <= 100 && Number.isInteger(e))) bad.push(r.id + ' out of range ' + e);
      if (r.coins && !r.price && !/\d+¢/.test(q.ex.split('That is').pop())) bad.push(r.id + ' explanation lacks total');
      if (r.coins && !r.price && !q.ex.includes(e + '¢') && !(e === 100 && q.ex.includes('100¢'))) bad.push(r.id + ' explanation total does not match ' + e);
      // numbers in a story must be in the words the child reads
      if (r.price != null && !r.q.includes(r.price + '¢')) bad.push(r.id + ' price not in text');
      (r.prices || []).forEach(x => { if (!r.q.includes(x + '¢')) bad.push(r.id + ' price ' + x + ' not in text'); });
      if (r.paid === 100 && !r.q.includes('$1.00')) bad.push(r.id + ' paid $1.00 not in text');
      if (r.paid && r.paid !== 100 && !r.q.includes(r.paid + '¢')) bad.push(r.id + ' paid not in text');
      if (r.groups && r.diff) { const m = r.q.match(/does (\w+) have than (\w+)/); const t = r.groups.map(g => total(g.coins)); if (!m || r.groups[0].label.indexOf(m[1]) !== 0 || t[0] <= t[1]) bad.push(r.id + ' "more than" wording does not match the larger group'); }
      if (r.price != null && /how much more/i.test(r.q) && r.price <= total(r.coins)) bad.push(r.id + ' already has enough');
      if (r.ex && e !== undefined && !r.ex.includes(String(e))) bad.push(r.id + ' explanation does not state ' + e);
    }
    if (r.k === 'tray') {
      nTray++;
      const only = r.only ? r.only.split('') : ['q', 'd', 'n', 'p'];
      const valid = combos(r.target, only);
      if (!valid.length) { bad.push(r.id + ' target cannot be made'); return; }
      const min = Math.min(...valid.map(v => v.length));
      // the rule must be shown before answering
      if (r.only && !q.q.includes('only ' + only.map(c => PLURAL[c]).join(' and '))) bad.push(r.id + ' restriction not stated: ' + q.q);
      if (r.fewest && !/FEWEST/i.test(q.q)) bad.push(r.id + ' fewest rule not stated');
      if (!r.fewest && /fewest/i.test(q.q)) bad.push(r.id + ' says fewest but is not graded that way');
      if (q.best.length !== (r.fewest ? min : q.best.length) || total(q.best.join('')) !== r.target) bad.push(r.id + ' shown answer wrong');
      if (r.fewest && q.best.length !== min) bad.push(r.id + ' fewest ' + q.best.length + ' vs true minimum ' + min);
      r._valid = valid; r._min = min; r._only = only; nTrayCombos += valid.length;
    }
    if (r.k === 'mc' && r.groups && r.cmp) {
      nCmp++; const t = r.groups.map(g => total(g.coins)); const want = /LESS/.test(r.q) ? Math.min(...t) : Math.max(...t);
      if (t.filter(x => x === want).length !== 1) bad.push(r.id + ' tie');
      if (q.a !== t.indexOf(want)) bad.push(r.id + ' compare key ' + q.a + ' expected ' + t.indexOf(want));
      if ((r.cmp === 'less') !== /LESS/.test(r.q)) bad.push(r.id + ' cmp does not match wording');
    }
    if (r.k === 'mc' && r.opts) {
      nOpts++;
      let want; const price = r.q.match(/costs (\d+)¢/); const make = r.q.match(/make (\d+)¢/);
      if (price && /\$1\.00/.test(r.q)) want = 100 - Number(price[1]); else if (/\$1\.00/.test(r.q)) want = 100; else if (make) want = Number(make[1]);
      const tot = q.c.map(parseDesc); const hits = tot.map((x, i) => x === want ? i : -1).filter(i => i >= 0);
      if (hits.length !== 1 || q.a !== hits[0]) bad.push(r.id + ' coin-choice key ' + q.a + ' expected ' + hits + ' (' + q.c.join(' | ') + ' want ' + want + ')');
      q.c.forEach((c, i) => { if (parseDesc(c) !== total(r.opts[i])) bad.push(r.id + ' choice text does not match coins: ' + c); });
    }
    if (r.k === 'mc' && !r.opts && !(r.groups && r.cmp)) { if (q.a !== r.a) bad.push(r.id + ' mc key changed'); }
    if (r.k === 'mc' && q.why && q.why.length && q.why[q.a] != null) bad.push(r.id + ' "why" text for the right answer should be empty');
  });
  ok('every Money item is in the app and every key matches an independent calculation', bad.length === 0, bad.slice(0, 12).join('; ') + ` [num ${nNum}, tray ${nTray}, compare ${nCmp}, coin-choice ${nOpts}]`);

  // tray grading: every valid combination accepted (unless fewest), fewest accepts all ties and nothing else; disallowed coins rejected
  const trayRes = await p.evaluate(items => {
    const C = window.__CLC, out = [], LQ = {}; C.LESSONS.money.forEach(l => l.steps.forEach((s, si) => { if (s.q) { const q = C.lessonQ('money', l, si); LQ[q.id] = q; } }));
    items.forEach(it => {
      const q = C.QBY[it.id] || LQ[it.id];
      it.valid.forEach(v => { const want = !it.fewest || v.length === it.min; if (C.trayOK(q, v) !== want) out.push(it.id + ' ' + v.join('') + ' graded ' + !want); });
      if (C.trayOK(q, it.valid[0].concat(['p']))) out.push(it.id + ' over-amount accepted');
      const bannedC = ['q', 'd', 'n', 'p'].find(c => !it.only.includes(c));
      if (bannedC) { const v = it.valid[0].slice(); v.push(bannedC); if (C.trayOK(q, v)) out.push(it.id + ' disallowed coin accepted'); }
    });
    return out;
  }, allRaw.filter(([, r]) => r.k === 'tray').map(([, r]) => ({ id: r.id, valid: r._valid, min: r._min, fewest: !!r.fewest, only: r._only })));
  ok('make-an-amount: all ' + nTrayCombos + ' valid combinations graded correctly (fewest accepts every tie, nothing else)', trayRes.length === 0, trayRes.slice(0, 8).join('; '));
  const dp = await p.evaluate(() => { const C = window.__CLC; return { a: C.minCoins(30, ['q', 'd']).join(''), b: C.minCoins(40, ['q', 'd']).join(''), c: C.minCoins(65, ['q', 'd', 'n', 'p']).length, d: C.minCoins(15, ['q', 'd']) }; });
  ok('fewest coins uses the true minimum (30¢ with quarters+dimes = 3 dimes; greedy would fail)', dp.a === 'ddd' && dp.b === 'dddd' && dp.c === 4 && dp.d === null, JSON.stringify(dp));

  // ===================== 3. overlap audit with normalized keys =====================
  function keysOf(r) {
    const ks = [];
    if (r.k === 'num' && r.coins && r.price == null) ks.push('count:' + sortKey(r.coins));
    if (r.k === 'num' && r.price != null) ks.push('more:' + total(r.coins) + '>' + r.price);
    if (r.k === 'num' && r.prices) ks.push((r.paid != null ? 'change:' + r.paid + '-' : 'sum:') + r.prices.slice().sort((a, b) => a - b).join('+'));
    if (r.k === 'num' && r.groups && r.diff) ks.push('diff:' + r.groups.map(g => sortKey(g.coins)).sort().join('|'));
    if (r.k === 'num' && !r.coins && !r.prices && !r.groups) ks.push('fact:' + r.q.toLowerCase());
    if (r.k === 'tray') {
      ks.push('make:' + r.target + '/' + (r.only || 'all') + '/' + !!r.fewest);
      const pc = r.q && r.q.match(/costs (\d+)¢/); if (pc) ks.push('change:100-' + pc[1]);
      if (r.target === 100 && r.only && r.only.length === 1) ks.push('dollar-of:' + r.only);
    }
    if (r.k === 'mc' && r.groups && r.cmp) ks.push('cmp:' + r.groups.map(g => sortKey(g.coins)).sort().join('|'));
    if (r.k === 'mc' && r.opts) { ks.push('opts:' + r.opts.map(sortKey).sort().join('|')); const pc = r.q.match(/costs (\d+)¢/); if (pc) ks.push('change:100-' + pc[1]); }
    if (r.k === 'mc' && !r.opts && !r.groups) {
      if (r.cc || r.coins) {
        const ansCoin = r.cc ? r.c[r.a] : r.coins; const ask = /MORE|MOST|LESS/.test(r.q) ? 'cmp' : /worth/i.test(r.q) ? 'value' : 'name';
        ks.push('id:' + ask + ':' + ansCoin.toLowerCase() + ':' + (r.cc ? 'choices-' + (ansCoin === ansCoin.toUpperCase() ? 'tails' : 'heads') : 'shown-' + r.coins));
      } else ks.push('text:' + r.q.toLowerCase().replace(/[^a-z0-9$. ]/g, '') + ':' + r.c.slice().sort().join('|'));
    }
    const dm = r.q && r.q.match(/How many (\w+) make one dollar/); if (dm) ks.push('dollar-of:' + dm[1][0]);
    return ks;
  }
  const taught = new Map();
  RAW_P.concat(lessonItems).forEach(r => keysOf(r).forEach(k => taught.set(k, r.id)));
  // worked examples in lessons count as seen too
  LES.forEach(l => l.steps.forEach(s => { if (s.t === 'coins' && s.rows) s.rows.forEach(row => { if (row.labels && row.labels.every(x => /¢|\$/.test(x)) && row.labels.length === row.coins.length) taught.set('count:' + sortKey(row.coins), 'worked ' + l.id); }); if (s.groups) taught.set('cmp:' + s.groups.map(g => sortKey(g.coins)).sort().join('|'), 'worked ' + l.id); }));
  const overlaps = [];
  RAW_C.forEach(r => { const ks = keysOf(r); if (!ks.length) overlaps.push(r.id + ' has no key'); ks.forEach(k => { if (taught.has(k)) overlaps.push(r.id + ' = ' + taught.get(k) + ' [' + k + ']'); }); });
  const checkKeys = new Map(); const dupInCheck = []; RAW_C.forEach(r => keysOf(r).forEach(k => { if (checkKeys.has(k)) dupInCheck.push(r.id + '=' + checkKeys.get(k)); checkKeys.set(k, r.id); }));
  ok('overlap audit: no check item shares a normalized key with a lesson, worked example, or practice item', overlaps.length === 0, overlaps.join('; ') + ` [${RAW_C.length} check items, ${taught.size} taught keys]`);
  ok('overlap audit: no two check items share a key', dupInCheck.length === 0, dupInCheck.join('; '));
  ok('checks are a separate bank from practice', app.check.every(id => !app.practice.includes(id)) && RAW_C.every(r => !RAW_P.some(x => x.id === r.id)));

  // ===================== 4. lessons and banks =====================
  const lessonProblems = [];
  LES.forEach(l => {
    const types = l.steps.map(s => s.t);
    if (!l.goal) lessonProblems.push(l.id + ' no goal');
    if (!(l.mins >= 5 && l.mins <= 10)) lessonProblems.push(l.id + ' minutes ' + l.mins);
    if (!l.steps.some(s => s.worked || s.box)) lessonProblems.push(l.id + ' no worked example');
    if (!types.includes('guided')) lessonProblems.push(l.id + ' no coached attempt');
    if (!types.includes('try')) lessonProblems.push(l.id + ' no independent attempt');
    if (!l.steps.some(s => /optional/i.test(s.title || '') && /real coins|Play store/i.test((s.text || []).join(' ')))) lessonProblems.push(l.id + ' no optional real-coin activity');
    l.steps.filter(s => s.q).forEach(s => { if (!s.q.h || !s.q.h2) lessonProblems.push(l.id + ' item missing a hint'); });
  });
  ok('lessons A–J: goal, worked example, coached attempt, independent attempt, optional real-coin activity, 5–10 minutes', LES.length === 10 && lessonProblems.length === 0, lessonProblems.join('; '));
  ok('A–H are foundation, I–J are application', LES.filter(l => l.part === 'basic').map(l => l.id).join('') === 'ABCDEFGH' && LES.filter(l => l.part === 'apply').map(l => l.id).join('') === 'IJ');
  const perSkill = SK.map(s => s.id + ' ' + RAW_P.filter(r => r.sk === s.id).length + '/' + RAW_C.filter(r => r.sk === s.id).length);
  ok('application skills: at least 6 practice and 4 check items each', ['compare', 'change'].every(id => RAW_P.filter(r => r.sk === id).length >= 6 && RAW_C.filter(r => r.sk === id).length >= 4), perSkill.join(', '));
  ok('application items have authored hints and explanations', RAW_P.concat(RAW_C).filter(r => ['compare', 'change'].includes(r.sk)).every(r => r.h && r.h2 && r.ex && r.h !== r.h2));

  // ===================== 5. wording rules =====================
  const textOf = r => [r.q, r.h, r.h2, r.ex].concat(r.why || []).filter(Boolean).join(' ');
  const allText = RAW_P.concat(RAW_C).map(textOf).concat(LES.flatMap(l => [l.title, l.key, l.goal].concat(l.steps.flatMap(s => [s.title, s.coach].concat(s.text || [], s.box || [], (s.rows || []).flatMap(r => r.labels || []), s.q ? [textOf(s.q)] : [])))).filter(Boolean)).join('\n');
  const engineText = await p.evaluate(() => { const C = window.__CLC; return Object.values(C.QBY).filter(q => q.area === 'money').map(q => q.ex + ' ' + q.q).join('\n'); });
  ok('no "bigger"/"biggest" where value is meant', !/\bbig(ger|gest)\b/i.test(allText + engineText), (allText + engineText).match(/.{0,40}\bbig(ger|gest)\b.{0,40}/i));
  ok('hints and answers never rely on seeing a coin edge in a picture', RAW_P.concat(RAW_C).every(r => !/edge|bumpy|ridge/i.test(textOf(r))) && lessonItems.every(r => !/edge|bumpy|ridge/i.test(textOf(r))));
  ok('lesson teaches smooth vs reeded edges on REAL coins and says pictures cannot show it', /reeded edge/.test(allText) && /Pictures cannot really show the edge/.test(allText));
  ok('lesson says size does not tell value, with the nickel/dime example', /size does not tell you the value/i.test(allText) && /dime is SMALLER than the nickel, but the dime is worth MORE/.test(allText));
  ok('lesson says real coins can have other designs', /Real coins can have other designs/.test(allText));
  ok('no sales tax, no standards or grade-equivalent claims in Money', !/tax|Common Core|standard|grade[- ]level|grade equivalent/i.test(allText));
  // Hint 2 never states the answer
  const h2bad = [];
  Object.values(Q).forEach(q => {
    if (!q.h2) { h2bad.push(q.id + ' none'); return; }
    if (q.kind === 'num' && new RegExp('(^|[^0-9])' + q.ans + '([^0-9]|$)').test(q.h2) && !(q.coins && !q.story && q.ans === total(q.coins) && false)) h2bad.push(q.id + ' h2 contains ' + q.ans);
    if (q.kind === 'mc') { const right = q.cc ? NAME[q.c[q.a].toLowerCase()] : q.c[q.a]; if (q.h2.toLowerCase().includes(right.toLowerCase()) && !q.q.toLowerCase().includes(right.toLowerCase())) h2bad.push(q.id + ' h2 names "' + right + '"'); }
  });
  ok('Hint 2 never states the answer (checked on every Money item)', h2bad.length === 0, h2bad.join('; '));

  // ===================== 6. diagnoses =====================
  const dg = await p.evaluate(() => {
    const C = window.__CLC, d = (id, n) => C.moneyDiagnoses(C.QBY[id], n).join(' | ');
    return { coinCount: d('mo30', 5), swap: d('mo28', 35), restart: d('mc20', 40), quarter20: d('mo30', 70), dollar1: d('mo45', 1), none: d('mo30', 81), right: C.moneyDiagnoses(C.QBY['mo13'], 5).length };
  });
  // independent derivations of the mistaken answers: mo30 = qqddd (80¢) has 5 coins; quarters counted as 20 → 40+30 = 70
  // mo28 = dddnn: dimes as 5 and nickels as 10 → 15+20 = 35; mc20 = qdddd restarting at 0 for the dimes → 40
  ok('diagnosis: counted coins instead of value (conditional wording)', /may be how many coins/.test(dg.coinCount), dg.coinCount);
  ok('diagnosis: nickel/dime switched', /Maybe they got switched/.test(dg.swap), dg.swap);
  ok('diagnosis: started over at zero when the coins changed', /may have started over at 0/.test(dg.restart), dg.restart);
  ok('diagnosis: quarters miscounted', /Each quarter is worth 25¢/.test(dg.quarter20), dg.quarter20);
  ok('diagnosis: cents vs dollars (typed 1 for 100¢)', /1 is one DOLLAR/.test(dg.dollar1), dg.dollar1);
  ok('no diagnosis is invented when nothing fits', dg.none === '', dg.none);
  ok('diagnoses use possible-cause wording, never a certain one', [dg.coinCount, dg.swap, dg.restart].every(x => /may|Maybe|looks like|Did you/.test(x)));

  // ===================== 7. practice UI: keypad, tray, help ladder, outcomes =====================
  const go = async (pg, mode, sk) => { await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="money"]'); await pg.click(`[data-act="pick"][data-mode="${mode}"]`); await pg.click(`[data-act="startRound"][data-sk="${sk}"]`); };
  const pp = await newPage({ viewport: { width: 390, height: 844 } }, seedDone);
  await go(pp, 'practice', 'mix');
  const qid = await pp.evaluate(() => window.__CLC.view().qs.q.id); const raw = RAW_P.find(r => r.id === qid); const want = String(total(raw.coins));
  ok('number field is clearly labeled as cents only', /Type the answer in cents/.test(await pp.textContent('.num-entry')));
  for (const k of ['9', '9']) await pp.click(`[data-act="nkey"][data-k="${k}"]`);
  await pp.click('[data-act="nkey"][data-k="back"]'); await pp.click('[data-act="nkey"][data-k="back"]');
  for (const k of want) await pp.click(`[data-act="nkey"][data-k="${k}"]`);
  ok('keypad: erase corrects a typed number', (await pp.evaluate(() => window.__CLC.view().qs.num)) === want);
  ok('no running total or answer shown before Check in practice', !/Total so far/.test(await pp.textContent('.qbox')) && !(await pp.textContent('.fb')).trim());
  await pp.click('[data-act="check"]');
  let st = await pp.evaluate(id => window.__CLC.P().stats[id], qid);
  ok('first-try right with no hint is recorded as first try (ind)', st && st.ind === 1 && st.n === 1, JSON.stringify(st));
  await pp.click('[data-act="nextQ"]');
  // wrong, then right → retry
  const q2 = await pp.evaluate(() => window.__CLC.view().qs.q.id); const want2 = String(total(RAW_P.find(r => r.id === q2).coins));
  await pp.click('[data-act="nkey"][data-k="1"]'); await pp.click('[data-act="check"]');
  ok('wrong answer gets feedback explaining why, no answer revealed', /Not quite|may|Check the/.test(await pp.textContent('.fb')) && !(await pp.textContent('.fb')).includes(want2 + '¢.'));
  await pp.click('[data-act="nkey"][data-k="back"]'); for (const k of want2) await pp.click(`[data-act="nkey"][data-k="${k}"]`); await pp.click('[data-act="check"]');
  st = await pp.evaluate(id => window.__CLC.P().stats[id], q2);
  ok('wrong then right with no hint is recorded as a retry, not as help', st && st.retry === 1 && !st.help && !st.ind, JSON.stringify(st));
  await pp.click('[data-act="nextQ"]');
  // hint then right → help
  const q3 = await pp.evaluate(() => window.__CLC.view().qs.q.id); const want3 = String(total(RAW_P.find(r => r.id === q3).coins));
  await pp.click('[data-act="hint"]'); const h1 = await pp.textContent('.hint'); await pp.click('[data-act="hint"]'); const h2 = await pp.textContent('.hint');
  ok('help ladder: Hint 1 is a strategy, Hint 2 adds more without the answer', h1.length > 10 && h2.length > h1.length && !new RegExp('(^|[^0-9])' + want3 + '([^0-9]|$)').test(h2), h2);
  for (const k of want3) await pp.click(`[data-act="nkey"][data-k="${k}"]`); await pp.click('[data-act="check"]');
  st = await pp.evaluate(id => window.__CLC.P().stats[id], q3);
  ok('right after a hint is recorded as with help', st && st.help === 1, JSON.stringify(st));
  await pp.click('[data-act="nextQ"]');
  await pp.click('[data-act="nkey"][data-k="1"]'); await pp.click('[data-act="check"]'); await pp.click('[data-act="showme"]');
  const q4 = await pp.evaluate(() => window.__CLC.view().qs.q.id); st = await pp.evaluate(id => window.__CLC.P().stats[id], q4);
  ok('Show me reveals the answer and records it as shown', st && st.rev === 1 && /Here is the answer/.test(await pp.textContent('.fb')), JSON.stringify(st));
  await pp.click('[data-act="nextQ"]');
  const q5 = await pp.evaluate(() => window.__CLC.view().qs.q.id); for (const k of String(total(RAW_P.find(r => r.id === q5).coins))) await pp.click(`[data-act="nkey"][data-k="${k}"]`); await pp.click('[data-act="check"]');
  await pp.click('[data-act="nextQ"]');
  const tally = await pp.textContent('.tally');
  ok('round end tallies first try, right after another try, with help, and shown separately', /First try: 2/.test(tally) && /another try: 1/.test(tally) && /With help: 1/.test(tally) && /Shown: 1/.test(tally), tally.replace(/\s+/g, ' '));
  const sk = await pp.evaluate(() => window.__CLC.P().skills['money.mix']);
  ok('skill record keeps the four outcomes apart', sk.ind === 2 && sk.retry === 1 && sk.help === 1 && sk.rev === 1, JSON.stringify(sk));

  // tray: add, remove one, undo, clear, cap
  await go(pp, 'practice', 'make');
  const trayId = await pp.evaluate(() => window.__CLC.view().qs.q.id); const tr = RAW_P.find(r => r.id === trayId);
  const prompt = await pp.textContent('.prompt');
  ok('tray rules are shown before answering', (!tr.only || prompt.includes('Use only')) && (!tr.fewest || /FEWEST/.test(prompt)), prompt);
  const bank = await pp.evaluate(() => [...document.querySelectorAll('[data-act="tadd"]')].map(b => b.getAttribute('data-c')));
  for (const c of bank) await pp.click(`[data-act="tadd"][data-c="${c}"]`);
  await pp.click('[data-act="tundo"]');
  let tray = await pp.evaluate(() => window.__CLC.view().qs.tray.slice());
  ok('tray: Undo removes the last coin added', tray.join('') === bank.slice(0, -1).join(''), tray.join(''));
  await pp.click('[data-act="trem"][data-i="0"]'); tray = await pp.evaluate(() => window.__CLC.view().qs.tray.slice());
  ok('tray: tapping a coin in the tray removes that coin', tray.join('') === bank.slice(1, -1).join(''), tray.join(''));
  await pp.click('[data-act="tclear"]'); tray = await pp.evaluate(() => window.__CLC.view().qs.tray.length);
  ok('tray: Clear empties the tray', tray === 0);
  for (let i = 0; i < 32; i++) await pp.click(`[data-act="tadd"][data-c="${bank[bank.length - 1]}"]`);
  ok('tray: holds at most 30 coins; long collections wrap without sideways scrolling', (await pp.evaluate(() => window.__CLC.view().qs.tray.length)) === 30 && await pp.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await pp.click('[data-act="tclear"]');
  // independent combination: build one valid answer that is not the app's own shown answer
  const appBest = await pp.evaluate(() => window.__CLC.view().qs.q.best.join(''));
  const cands = tr._valid.filter(v => (!tr.fewest || v.length === tr._min) && v.length <= 30);
  const alt = cands.find(v => v.slice().sort().join('') !== appBest.split('').sort().join('')) || cands[0];
  for (const c of alt) await pp.click(`[data-act="tadd"][data-c="${c}"]`);
  await pp.click('[data-act="check"]');
  ok('tray accepts a different valid combination than the shown example', await pp.evaluate(() => window.__CLC.view().qs.done) && !/Not quite/.test(await pp.textContent('.fb')), alt.join('') + ' vs ' + appBest);
  if (SHOTS) await pp.screenshot({ path: path.join(SHOTS, 'money-tray-360.png'), fullPage: true });
  // fewest feedback
  const fx = await pp.evaluate(() => { const C = window.__CLC, q = C.QBY['mo42'], QS = C.newQS(q, 'practice'); QS.tray = ['d', 'd', 'd']; return C.evaluateQS(QS); });
  ok('fewest-coins rule: right amount with too many coins gets a specific message', !fx.correct && /asks for the FEWEST coins/.test(fx.msgs[0].x), fx.msgs[0].x);

  // ===================== 8. checks: hidden feedback, review, links, exposure, shorter check =====================
  const pc = await newPage({ viewport: { width: 1200, height: 900 } }, seedDone);
  await pc.click('[data-act="area"][data-a="money"]'); await pc.click('[data-act="testSetup"]');
  await pc.click('[data-act="startTest"][data-n="10"]');
  const ids = await pc.evaluate(() => window.__CLC.view().ids);
  ok('10-question check, no repeated question', ids.length === 10 && new Set(ids).size === 10);
  ok('check uses only the check bank', ids.every(id => RAW_C.some(r => r.id === id)));
  const hidden = await pc.evaluate(() => !document.querySelector('[data-act="hint"]') && !document.querySelector('[data-act="showme"]') && !document.querySelector('.fb') && !/Total so far/.test(document.getElementById('app').innerText));
  ok('check: no hints, no Show me, no feedback, no running total before turning it in', hidden);
  const seenAfter1 = await pc.evaluate(() => Object.keys(window.__CLC.P().stats.seen_q || {}).filter(id => /^mc/.test(id)));
  ok('exposure is recorded when a question is displayed (only the one shown so far)', seenAfter1.length === 1 && seenAfter1[0] === ids[0], seenAfter1.join(','));
  // answer some, leave one unanswered, change an answer
  for (let i = 0; i < 9; i++) {
    const info = await pc.evaluate(() => { const q = window.__CLC.view().qs.q; return { kind: q.kind, id: q.id, n: q.c ? q.c.length : 0 }; });
    const r = RAW_C.find(x => x.id === info.id); info.a = r.k === 'mc' ? expectMC(r) : null;
    if (info.kind === 'mc') await pc.click(`[data-act="choice"][data-i="${(info.a + 1) % 2}"]`);
    if (info.kind === 'num') for (const k of String(expectNum(r))) await pc.click(`[data-act="nkey"][data-k="${k}"]`);
    if (info.kind === 'tray') { const v = combos(r.target, r.only ? r.only.split('') : ['q', 'd', 'n', 'p']).sort((a, b) => a.length - b.length)[0]; for (const c of v) await pc.click(`[data-act="tadd"][data-c="${c}"]`); }
    if (info.kind === 'mc') { await pc.click(`[data-act="choice"][data-i="${info.a}"]`); } // changed answer
    ok('check q' + (i + 1) + ': still no feedback after answering', await pc.evaluate(() => !document.querySelector('.fb') && !document.querySelector('.m-ok, .m-no')));
    await pc.click('[data-act="tnext"]');
  }
  await pc.click('[data-act="treview"]');
  ok('review lists the unanswered question', /1<\/b> unanswered/.test(await pc.innerHTML('.card')) && (await pc.locator('[data-act="tjump"]').count()) === 1);
  // save, close, resume in a new page of the same context
  const ctxState = await pc.evaluate(() => localStorage.getItem('chrissLearningClub.v1'));
  const pr = await newPage({ viewport: { width: 1200, height: 900 } }, JSON.parse(ctxState));
  ok('save and resume: the unfinished check is offered on Home', /Check My Skills, question/.test(await pr.textContent('body')));
  await pr.click('[data-act="resume"]');
  const restored = await pr.evaluate(() => Object.keys(window.__CLC.view().ans).length);
  ok('save and resume: answers come back', restored >= 9, String(restored));
  await pr.click('[data-act="treview"]'); await pr.click('[data-act="submitTest"]');
  const resTxt = await pr.textContent('#app');
  const expScore = ids.slice(0, 9).length; // all nine answered with independently computed answers
  ok('independently computed answers score ' + expScore + ' of 10 (the unanswered one is wrong)', new RegExp(expScore + ' of 10 correct').test(resTxt), resTxt.match(/\d+ of \d+ correct/));
  ok('results explain the mistake and link back to the lesson', /Your answer:.*No answer/s.test(resTxt) && (await pr.locator('#app [data-act="lesson"]').count()) >= 1);
  ok('first check is labeled unseen', /unseen check/.test(resTxt));
  // second check prefers unseen questions
  await pr.click('[data-act="area"][data-a="money"]'); await pr.click('[data-act="testSetup"]'); await pr.click('[data-act="startTest"][data-n="10"]');
  const ids2 = await pr.evaluate(() => window.__CLC.view().ids);
  ok('next check uses unseen questions first', ids2.every(id => !ids.includes(id)), ids2.filter(id => ids.includes(id)).join(','));
  // shorter check when few questions are eligible
  const ps = await newPage({ viewport: { width: 1200, height: 900 } }, { v: 3, nick: 'Chris', lessons: { 'money:A': true }, stats: {}, skills: {}, checks: [] });
  await ps.click('[data-act="area"][data-a="money"]'); await ps.click('[data-act="testSetup"]'); await ps.click('[data-act="startTest"][data-n="10"]');
  const sids = await ps.evaluate(() => window.__CLC.view().ids);
  const eligible = RAW_C.filter(r => r.sk === 'names').length;
  ok('only taught skills are checked; shorter check (' + eligible + ' questions) is explained, never padded', sids.length === eligible && new Set(sids).size === sids.length && sids.every(id => RAW_C.find(r => r.id === id).sk === 'names') && /This check has \d+ questions?, not 10/.test(await ps.textContent('#app')), sids.join(','));

  // ===================== 9. migration =====================
  const old = { v: 2, nick: 'Chris', lessons: { 'money:A': true }, stats: { mo1: { n: 3, ind: 1, help: 2, rev: 0, last: 4 } }, skills: { 'money.names': { hist: ['ind', 'help', 'help'], ind: 1, help: 2, rev: 0, chkRight: 3, chkTotal: 4, lastChk: { right: 3, total: 4 } } }, checks: [{ a: 'money', date: '2026-11-01T10:00:00Z', n: 4, score: 3, unseen: true, missed: ['names'] }], ready: { vowels: '2026-10-01' } };
  const pm = await newPage({ viewport: { width: 1200, height: 900 } }, old);
  const mg = await pm.evaluate(() => window.__CLC.P());
  ok('migration v2 → v3 keeps every count, check, and setting', mg.v === 3 && mg.stats.mo1.n === 3 && mg.stats.mo1.help === 2 && mg.skills['money.names'].ind === 1 && mg.skills['money.names'].help === 2 && mg.skills['money.names'].chkTotal === 4 && mg.checks.length === 1 && mg.ready.vowels && mg.lessons['money:A'] && typeof mg.helpBefore === 'string', JSON.stringify({ v: mg.v, hb: mg.helpBefore }));
  await pm.click('[data-act="grown"]');
  const gtxt = await pm.textContent('#app');
  ok('grown-up view: separate retry column, older "with help" counts explained, sample sizes shown', /Right after a retry/.test(gtxt) && /count a retry as “with help”/.test(gtxt) && /\(\d+ answers?\)/.test(gtxt));
  ok('grown-up view: Money strands (recognition, counting, making amounts, comparison, change) are distinguishable', ['recognition', 'counting', 'making amounts', 'comparison', 'change'].every(s => gtxt.includes('(' + s + ')')));
  ok('grown-up view shows the build id', gtxt.includes(app.build) && /^[0-9a-f]{12}$/.test(app.build), app.build);
  const statusOne = await pm.evaluate(() => { const P = window.__CLC.P(); return P; });
  const statuses = await pm.evaluate(() => [...document.querySelectorAll('#app .status')].map(e => e.textContent));
  await pm.evaluate(() => { const P = window.__CLC.P(); P.skills['money.values'] = { hist: [], ind: 0, retry: 0, help: 0, rev: 0, chkRight: 1, chkTotal: 1, lastChk: { right: 1, total: 1 } }; });
  await pm.click('[data-act="home"] >> nth=0'); await pm.click('[data-act="grown"]');
  const oneAns = await pm.evaluate(() => [...document.querySelectorAll('#app tr')].find(tr => /What each coin is worth/.test(tr.textContent)).querySelector('.status').textContent);
  ok('no mastery claim: statuses are evidence labels, and one right check answer is only "Early evidence"', statuses.every(t => !/master/i.test(t)) && oneAns === 'Early evidence', statuses.join(',') + ' / ' + oneAns);

  // ===================== 10. storage problems =====================
  const pb = await b.newContext(); const pbp = await pb.newPage(); pbp.on('pageerror', e => errs.push(e.message));
  await pbp.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await pbp.goto(FILE); await pbp.click('[data-act="area"][data-a="money"]'); await pbp.click('[data-act="learn"]'); await pbp.click('[data-act="lesson"][data-l="C"]');
  ok('storage blocked: Money still works and the app says progress is not saved', (await pbp.locator('.lesson-card').count()) === 1 && /not letting the app save/.test(await pbp.textContent('body')));
  const pcor = await newPage(null, null); await pcor.evaluate(() => { localStorage.setItem('chrissLearningClub.v1', '{broken'); }); await pcor.reload();
  ok('corrupted storage: fresh start with a notice', /could not be read/.test(await pcor.textContent('body')));

  // ===================== 11. layout, sizes, keyboard, a11y =====================
  for (const [w, h] of [[360, 760], [768, 1024], [1280, 900], [320, 640]]) {
    const pl = await newPage({ viewport: { width: w, height: h } }, seedDone);
    await pl.click('[data-act="area"][data-a="money"]'); await pl.click('[data-act="learn"]');
    const learnTxt = await pl.textContent('#app');
    if (w === 360) ok('lesson list shows Money Basics (foundation) and Use Your Money Skills (application)', /Money Basics/.test(learnTxt) && /Use Your Money Skills/.test(learnTxt) && /foundation/.test(learnTxt) && /application/.test(learnTxt) && !/Grade 3 Money/.test(learnTxt));
    await pl.click('[data-act="lesson"][data-l="A"]'); await pl.click('[data-act="lnext"]');
    const sizes = await pl.evaluate(() => [...document.querySelectorAll('.coin-row img.coin')].slice(0, 4).map(i => { const r = i.getBoundingClientRect(); return [r.width, r.height]; }));
    const rr = sizes.map(s => s[0] / sizes[3][0]);
    ok(w + 'px: lesson coins are circles at true relative size (penny, nickel, dime vs quarter)', sizes.every(s => Math.abs(s[0] - s[1]) < 1) && [MM.p, MM.n, MM.d].every((m, i) => Math.abs(rr[i] - m / MM.q) < 0.03), rr.map(x => x.toFixed(3)).join(','));
    ok(w + 'px: no sideways scrolling in Lesson A', await pl.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (SHOTS && w !== 320) await pl.screenshot({ path: path.join(SHOTS, 'money-lessonA-' + w + '.png'), fullPage: true });
    // application lesson with coin groups
    await pl.click('[data-act="learn"]'); await pl.click('[data-act="lesson"][data-l="I"]'); await pl.click('[data-act="lnext"]');
    ok(w + 'px: Lesson I comparison groups fit without sideways scrolling', (await pl.locator('.coin-group').count()) === 2 && await pl.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (SHOTS && w === 360) await pl.screenshot({ path: path.join(SHOTS, 'money-lessonI-360.png'), fullPage: true });
    // coin-picture choices keep true sizes too (dime vs quarter)
    await pl.click('[data-act="learn"]'); await pl.click('[data-act="lesson"][data-l="A"]'); for (let i = 0; i < 7; i++) { if (await pl.locator('[data-act="lnext"]').count()) await pl.click('[data-act="lnext"]'); else { await pl.click('[data-act="choice"][data-i="0"]'); await pl.click('[data-act="check"]'); await pl.click('[data-act="showme"]'); await pl.click('[data-act="lnext"]'); } if (await pl.locator('.coin-choices').count() && await pl.evaluate(() => window.__CLC.view().qs.q.c.join('') === 'nqd')) break; }
    const ch = await pl.evaluate(() => [...document.querySelectorAll('.coin-choices img.coin')].map(i => i.getBoundingClientRect().width));
    ok(w + 'px: coin-picture choices keep true relative sizes (dime/quarter)', ch.length === 3 && Math.abs(ch[2] / ch[1] - MM.d / MM.q) < 0.03, ch.map(x => x.toFixed(1)).join(','));
    // long collection
    await pl.click('[data-act="home"] >> nth=0'); await pl.click('[data-act="area"][data-a="money"]'); await pl.click('[data-act="pick"][data-mode="practice"]'); await pl.click('[data-act="startRound"][data-sk="count1"]');
    ok(w + 'px: long coin collections wrap without sideways scrolling', await pl.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const tgt = await pl.evaluate(() => [...document.querySelectorAll('.key, .choice, .btn')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); }));
    ok(w + 'px: touch targets at least 44px', tgt.every(x => x >= 44), Math.min(...tgt).toFixed(1));
  }
  // keyboard only
  const pk = await newPage({ viewport: { width: 1000, height: 800 } }, seedDone);
  await pk.click('[data-act="area"][data-a="money"]'); await pk.click('[data-act="pick"][data-mode="practice"]'); await pk.click('[data-act="startRound"][data-sk="count2"]');
  const kq = await pk.evaluate(() => window.__CLC.view().qs.q.id); const kans = String(total(RAW_P.find(r => r.id === kq).coins));
  await pk.focus('[data-act="nkey"][data-k="1"]');
  for (const k of kans) { await pk.focus(`[data-act="nkey"][data-k="${k}"]`); await pk.keyboard.press('Enter'); }
  await pk.focus('[data-act="check"]'); await pk.keyboard.press('Enter');
  ok('keyboard only: keypad and Check work with Enter', await pk.evaluate(() => window.__CLC.view().qs.done));
  const focusStyle = await pk.evaluate(() => { const b = document.querySelector('[data-act="nextQ"]'); b.focus(); const s = getComputedStyle(b); return s.outlineStyle !== 'none' || s.boxShadow !== 'none'; });
  ok('keyboard focus is visible', focusStyle);
  // tab reaches the coin bank in a tray item
  await pk.click('[data-act="home"] >> nth=0'); await pk.click('[data-act="area"][data-a="money"]'); await pk.click('[data-act="pick"][data-mode="practice"]'); await pk.click('[data-act="startRound"][data-sk="make"]');
  let reached = false; for (let i = 0; i < 40 && !reached; i++) { await pk.keyboard.press('Tab'); reached = await pk.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-act') === 'tadd'); }
  ok('keyboard only: Tab reaches the coins to add', reached);
  if (reached) { await pk.keyboard.press('Enter'); ok('keyboard only: Enter adds a coin', (await pk.evaluate(() => window.__CLC.view().qs.tray.length)) === 1); }
  // screen-reader names
  const names = await pk.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.getAttribute('aria-label') || b.textContent || (b.querySelector('img') || {}).alt || '').trim()));
  ok('every visible button has a name', names.every(n => n.length > 0), names.filter(n => !n).length + ' unnamed');
  // read-aloud and labels never include hidden answers in a check
  const pchk = await newPage({ viewport: { width: 1000, height: 800 } }, seedDone);
  await pchk.click('[data-act="area"][data-a="money"]'); await pchk.click('[data-act="testSetup"]'); await pchk.click('[data-act="startTest"][data-n="10"]');
  const leaks = [];
  for (let i = 0; i < 10; i++) {
    const info = await pchk.evaluate(() => { const q = window.__CLC.view().qs.q; const says = [...document.querySelectorAll('[data-text]')].map(e => e.getAttribute('data-text')).join(' '); const labels = [...document.querySelectorAll('[aria-label], img[alt]')].map(e => e.getAttribute('aria-label') || e.alt).join(' | '); return { id: q.id, kind: q.kind, ex: q.ex, says, labels, best: q.best }; });
    if (info.says.includes(info.ex) || (info.ex && info.labels.includes(info.ex))) leaks.push(info.id + ' explanation exposed');
    if (info.kind === 'tray' && /Total so far/.test(info.labels)) leaks.push(info.id + ' total exposed');
    if (/^mc[1-8]$/.test(info.id) && /\b(penny|nickel|dime|quarter)\b/i.test(info.labels.replace(/Go to question[^|]*/g, '').replace(/ONE DIME|QUARTER DOLLAR/g, ''))) leaks.push(info.id + ' coin name in a label: ' + info.labels);
    if (i < 9) await pchk.click('[data-act="tnext"]');
  }
  ok('checks: read-aloud text and screen-reader labels do not reveal answers', leaks.length === 0, leaks.join('; '));
  // reduced motion
  const prm = await newPage({ viewport: { width: 800, height: 800 }, reducedMotion: 'reduce' }, seedDone);
  ok('reduced motion is respected', await prm.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches && [...document.querySelectorAll('*')].every(e => { const s = getComputedStyle(e); return s.animationName === 'none' || parseFloat(s.animationDuration) <= 0.01; })));
  // contrast of key Money text (navy on cream labels, num label)
  const contrast = await pp.evaluate(() => {
    const lum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
    const bgOf = e => { while (e) { const b = getComputedStyle(e).backgroundColor; if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) return b; e = e.parentElement; } return 'rgb(255,255,255)'; };
    return [...document.querySelectorAll('.prompt, .num-label, .small, .msg, .btn')].filter(e => e.offsetParent).map(e => { const a = lum(getComputedStyle(e).color), b = lum(bgOf(e)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); });
  });
  ok('text contrast at least 4.5:1 on the Money practice screen', contrast.length > 0 && contrast.every(x => x >= 4.5), Math.min(...contrast).toFixed(2));

  // ===================== 12. printable =====================
  const sheet = await p.evaluate(() => window.__CLC.sheetHTML('money'));
  const key = sheet.match(/Answer key<\/h2><p>(.*?)<\/p>/)[1];
  const fewest40 = Math.min(...combos(40, ['q', 'd', 'n', 'p']).map(v => v.length));
  ok('Money sheet answer key matches independent math', key.includes('1. ' + (3 * 10 + 2) + '¢') && key.includes('2. ' + (2 * 25 + 5) + '¢') && key.includes('(' + fewest40 + ' coins)') && key.includes('4. ' + (30 + 15) + '¢') && key.includes('5. ' + (100 - 70) + '¢'), key);
  const pg2 = await newPage(); await pg2.click('[data-act="guides"]');
  ok('Money Reference Sheet is listed with the other printables', /Money Reference Sheet/.test(await pg2.textContent('#app')) && /Verb Teams Quick Sheet/.test(await pg2.textContent('#app')));
  await pg2.click('[data-act="sheet"][data-k="money"]');
  ok('Money sheet shows the four coins to scale', (await pg2.locator('.sheet .sh-coins img.coin').count()) === 4);

  // ===================== 13. offline =====================
  ok('offline: no network requests were attempted on any page', [p, pp, pc, pr, ps, pm, pk, pchk, prm, pg2].every(x => x._net.length === 0), [p, pp, pc].map(x => x._net.join(',')).join(''));
  ok('no JavaScript errors', errs.length === 0, errs.join(' | '));

  await b.close();
  console.log(R.join('\n'));
  console.log('\nMoney items per skill (practice/check): ' + perSkill.join(', '));
  console.log('practice ' + RAW_P.length + ', check ' + RAW_C.length + ', lesson items ' + lessonItems.length + ', lessons ' + LES.length);
  const f = R.filter(x => x.startsWith('FAIL')).length; console.log('\n' + (R.length - f) + ' passed, ' + f + ' failed'); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
