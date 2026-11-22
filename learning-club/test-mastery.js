// Verifies the separate 59-sentence Verb Mastery Challenge, Lesson H, and bank separation.
// Run: node learning-club/test-mastery.js [screenshotDir]
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../chriss-learning-club.html');
const SHOTS = process.argv[2] || null;
const R = []; const ok = (n, c, i) => R.push((c ? 'PASS ' : 'FAIL ') + n + (i !== undefined ? '  (' + i + ')' : ''));

(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(FILE);

  // ---------- data ----------
  const d = await pg.evaluate(() => {
    const C = window.__CLC, norm = s => s.replace(/[\[\]]|@\w+|:\w+/g, '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
    const M = C.MASTERY_Q, out = {};
    out.practice59 = VERB_BANK.length; out.mastery = M.length; out.hPractice = VERB_MULTI_PRACTICE.length; out.check = (C.CHECK_Q.verbs || []).length;
    out.cats = {}; M.forEach(q => out.cats[q.cat] = (out.cats[q.cat] || 0) + 1);
    out.catsWanted = MASTERY_CATS.map(c => c.id + '=' + c.count).join(' ');
    const ms = M.map(q => norm(VERB_MASTERY.find(r => r.id === q.id).s));
    out.dupMastery = ms.length - new Set(ms).size;
    const other = [].concat(VERB_BANK.map(r => r.s), VERB_MULTI_PRACTICE.map(r => r.s), VERB_CHECK.map(r => r.s));
    Object.keys(LESSONS).forEach(a => LESSONS[a].forEach(l => l.steps.forEach(st => { if (st.s) other.push(st.s); if (st.q && st.q.s) other.push(st.q.s); (st.items || []).forEach(it => other.push(it.s)); })));
    const on = other.map(norm);
    out.overlapExact = ms.filter(s => on.includes(s));
    // near-duplicate check: Jaccard on words after removing names and short function words
    const STOP = new Set('the a an my our your his her their to of in on at for and with by is was are were has have had will can'.split(' '));
    const NAMES = new Set('chris maya jamal mia jada marcus lena sam ella ben dad mom grandma grandpa'.split(' '));
    const ws = s => new Set(s.split(' ').filter(w => !STOP.has(w) && !NAMES.has(w)));
    let worst = { j: 0 };
    ms.forEach(m => { const A = ws(m); on.concat(ms.filter(x => x !== m)).forEach(o => { const B = ws(o); const inter = [...A].filter(x => B.has(x)).length; const j = inter / (new Set([...A, ...B]).size || 1); if (j > worst.j) worst = { j: +j.toFixed(2), m, o }; }); });
    out.worst = worst;
    // structure per category
    const adj = t => t.every((x, i) => i === 0 || x === t[i - 1] + 1);
    const BEHAVEDO = ['am','is','are','was','were','be','being','been','have','has','had','do','does','did'];
    out.struct = M.filter(q => {
      const T = q.teams, n = q.ans.length;
      if (q.cat === 'action') return !(T.length === 1 && n === 1 && !BEHAVEDO.includes(q.toks[q.ans[0]].lw));
      if (q.cat === 'being') return !(T.length === 1 && n === 1 && BEHAVEDO.includes(q.toks[q.ans[0]].lw));
      if (q.cat === 'team2') return !(T.length === 1 && n === 2 && adj(T[0]));
      if (q.cat === 'team3') return !(T.length === 1 && n === 3 && adj(T[0]));
      if (q.cat === 'between') return !(T.length === 1 && n >= 2 && !adj(T[0]));
      if (q.cat === 'multi') return !(T.length >= 2);
      return true;
    }).map(q => q.id);
    // grading: exact sets only
    out.grade = [];
    M.forEach(q => {
      if (!C.gradeOnly(q, { sel: q.ans.slice() })) out.grade.push('full fails ' + q.id);
      q.ans.forEach((_, k) => { if (C.gradeOnly(q, { sel: q.ans.filter((__, j) => j !== k) })) out.grade.push('missing word passes ' + q.id); });
      q.toks.forEach(t => { if (!q.ans.includes(t.i) && C.gradeOnly(q, { sel: q.ans.concat(t.i) })) out.grade.push('extra passes ' + q.id); });
    });
    // separation of banks
    const practiceIds = new Set(C.AREA_Q.verbs.map(q => q.id)), checkIds = new Set(C.CHECK_Q.verbs.map(q => q.id)), mIds = new Set(M.map(q => q.id));
    out.sepPM = [...mIds].filter(i => practiceIds.has(i) || checkIds.has(i)).length;
    out.sepPC = [...checkIds].filter(i => practiceIds.has(i)).length;
    const cs = C.CHECK_Q.verbs.filter(q => q.kind === 'select').map(q => norm(VERB_CHECK.find(r => r.id === q.id).s));
    out.checkOverlap = cs.filter(s => on.filter(x => x === s).length > 1 || ms.includes(s) || VERB_BANK.map(r => norm(r.s)).includes(s));
    out.bench53 = C.masteryMeets(53); out.bench54 = C.masteryMeets(54); out.bench = MASTERY_BENCHMARK;
    out.list = M.map(q => q.id + ' [' + q.cat + '] ' + q.toks.map(t => t.w).join(' ') + '  =>  ' + q.teams.map(t => t.map(i => q.toks[i].w).join(' ')).join(' | '));
    return out;
  });
  console.log(d.list.join('\n') + '\n');
  ok('59 original practice sentences kept', d.practice59 === 59, d.practice59);
  ok('59 mastery sentences', d.mastery === 59, d.mastery);
  ok('category counts exact (8/8/18/12/8/5)', JSON.stringify(d.cats) === JSON.stringify({ action: 8, being: 8, team2: 18, team3: 12, between: 8, multi: 5 }), JSON.stringify(d.cats));
  ok('each sentence matches its category structure', d.struct.length === 0, d.struct.join(','));
  ok('no duplicate mastery sentences', d.dupMastery === 0, d.dupMastery);
  ok('no mastery sentence reused from practice/lessons/checks', d.overlapExact.length === 0, d.overlapExact.join(' | '));
  ok('no near-duplicates (word overlap < 0.5 ignoring names)', d.worst.j < 0.5, JSON.stringify(d.worst));
  ok('exact-set grading on all 59 (missing word or extra word fails)', d.grade.length === 0, d.grade.slice(0, 5).join('; '));
  ok('mastery ids separate from practice & check banks', d.sepPM === 0);
  ok('check bank separate from practice bank', d.sepPC === 0 && d.checkOverlap.length === 0, 'check items: ' + d.check);
  ok('benchmark default 54; 53 not met; 54 met', d.bench === 54 && d.bench53 === false && d.bench54 === true);

  // ---------- Lesson H ----------
  await pg.click('[data-act="area"][data-a="verbs"]'); await pg.click('[data-act="learn"]');
  ok('Lesson H listed', (await pg.locator('[data-act="lesson"][data-l="H"]').count()) === 1);
  await pg.click('[data-act="lesson"][data-l="H"]');
  for (let i = 0; i < 4; i++) await pg.click('[data-act="lnext"]');
  const st = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; return { s: q.toks.map(t => t.w).join(' '), teams: q.teams }; });
  await pg.click(`[data-act="tok"][data-i="${st.teams[0][0]}"]`); await pg.click('[data-act="check"]');
  const fbH = (await pg.textContent('.fb')).trim();
  ok('Lesson H: one verb found -> told to find the other', /You found 1 of 2\. Keep reading/.test(fbH), st.s + ' -> ' + fbH);
  await pg.click(`[data-act="tok"][data-i="${st.teams[1][0]}"]`); await pg.click('[data-act="check"]');
  ok('Lesson H: both verbs correct', await pg.evaluate(() => window.__CLC.view().qs.done));
  await pg.click('[data-act="lnext"]');
  // try 1: two teams; pick only helper of team 2 + full team 1
  const st2 = await pg.evaluate(() => window.__CLC.view().qs.q.teams);
  for (const i of st2[0]) await pg.click(`[data-act="tok"][data-i="${i}"]`);
  await pg.click(`[data-act="tok"][data-i="${st2[1][0]}"]`); await pg.click('[data-act="check"]');
  ok('Lesson H: partial second team -> helper clue', /You found a helper!.*This sentence has 2 verbs or verb teams/.test(await pg.textContent('.fb')));
  await pg.click('[data-act="showme"]'); await pg.click('[data-act="lnext"]');
  const st3 = await pg.evaluate(() => window.__CLC.view().qs.q.ans); for (const i of st3) await pg.click(`[data-act="tok"][data-i="${i}"]`); await pg.click('[data-act="check"]'); await pg.click('[data-act="lnext"]');
  ok('Lesson H completes, offers Verb Identification Benchmark', (await pg.evaluate(() => window.__CLC.view().v)) === 'lessonEnd' && (await pg.locator('[data-act="masteryIntro"]').count()) === 1);
  await pg.click('[data-act="practiceSkill"]');
  ok('Lesson H practice round runs (multi-verb items)', (await pg.evaluate(() => { const v = window.__CLC.view(); return v.v === 'round' && v.ids.every(id => id.startsWith('vh')); })));

  // ---------- verb Check My Skills uses only the check bank ----------
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="verbs"]'); await pg.click('[data-act="testSetup"]'); await pg.click('[data-act="startTest"][data-n="10"]');
  ok('verb skills check draws only from check bank', await pg.evaluate(() => window.__CLC.view().ids.every(id => /^v?hc\d|^vc\d/.test(id))), await pg.evaluate(() => window.__CLC.view().ids.join(',')));
  await pg.click('[data-act="quitTest"]');

  // ---------- Mastery UI ----------
  ok('mastery button on verb module', (await pg.locator('[data-act="masteryIntro"]').count()) === 1);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/verbs-area.png' });
  await pg.click('[data-act="masteryIntro"]'); await pg.click('[data-act="mStart"]');
  const leakSel = '.badge, .msg, .hint, .coach, .tok-label, [data-act="check"], [data-act="hint"], [data-act="showme"], .m-ok, .m-no, .links-list, .shown';
  const order = await pg.evaluate(() => window.__CLC.P().mastery.order);
  const key = await pg.evaluate(() => { const o = {}; window.__CLC.MASTERY_Q.forEach(q => o[q.id] = { ans: q.ans, teams: q.teams, toks: q.toks.length }); return o; });
  let leaks = 0, cats = new Set();
  const answer = async (i, mode) => { // mode: 'right' | 'missHelper' | 'missMain' | 'extra' | 'blank'
    const id = order[i], k = key[id]; let sel = k.ans.slice();
    if (mode === 'missMain') sel = sel.filter(x => x !== k.teams[0][k.teams[0].length - 1]);
    if (mode === 'missHelper') sel = sel.filter(x => x !== k.teams[0][0]);
    if (mode === 'extra') { const e = [...Array(k.toks).keys()].find(x => !k.ans.includes(x)); sel.push(e); }
    if (mode === 'blank') sel = [];
    const cur = await pg.evaluate(() => window.__CLC.view().qs.sel.slice());
    for (const x of cur) if (!sel.includes(x)) await pg.click(`[data-act="tok"][data-i="${x}"]`);
    for (const x of sel) if (!cur.includes(x)) await pg.click(`[data-act="tok"][data-i="${x}"]`);
    leaks += await pg.locator(leakSel).count();
    const txt = await pg.textContent('#app'); if (/helper|main verb|verb team has|two-word|three-word|category/i.test(txt.replace(/main verbs and their helpers/i, ''))) leaks++;
  };
  // Plan for run 1 (53/59): 6 wrong = missHelper, missMain, extra, extra, missMain, blank
  const wrongPlan = { 3: 'missHelper', 7: 'missMain', 15: 'extra', 22: 'extra', 41: 'missMain', 58: 'blank' };
  // ensure missHelper/missMain targets are team items
  const teamIdx = order.map((id, i) => key[id].teams[0].length > 1 ? i : -1).filter(i => i >= 0);
  const plan = {}; plan[teamIdx[0]] = 'missHelper'; plan[teamIdx[1]] = 'missMain'; plan[teamIdx[2]] = 'missMain'; plan[15] = plan[15] || 'extra'; plan[22] = plan[22] || 'extra'; plan[58] = 'blank';
  let nWrong = Object.keys(plan).length; let extraIdx = 30; while (nWrong < 6) { if (!plan[extraIdx]) { plan[extraIdx] = 'extra'; nWrong++; } extraIdx++; }
  for (let i = 0; i < 12; i++) {
    await answer(i, plan[i] || 'right');
    if (i === 9) { await pg.click('[data-act="mNext"]'); ok('break offered after 10', (await pg.evaluate(() => window.__CLC.view().v)) === 'masteryBreak'); if (SHOTS) await pg.screenshot({ path: SHOTS + '/mastery-break.png' }); await pg.click('[data-act="mResume"]'); continue; }
    if (i === 11) break;
    await pg.click('[data-act="mNext"]');
  }
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/mastery-question.png' });
  // save + resume: reload, continue from home
  const before = await pg.evaluate(() => JSON.stringify(window.__CLC.P().mastery.ans));
  await pg.reload();
  ok('home Continue mentions mastery', /Verb Identification Benchmark, sentence 12 of 59/.test(await pg.textContent('.continue')));
  await pg.click('[data-act="resume"]');
  const after = await pg.evaluate(() => JSON.stringify(window.__CLC.P().mastery.ans));
  ok('save/resume preserves answers and position', before === after && (await pg.evaluate(() => window.__CLC.P().mastery.i)) === 11, (await pg.evaluate(() => Object.keys(window.__CLC.P().mastery.ans).length)) + ' answers kept');
  // go back and check earlier selection still shown
  await pg.click('[data-act="mPrev"]');
  const pressed = await pg.locator('button.tok[aria-pressed="true"]').count();
  const exp = await pg.evaluate(() => { const m = window.__CLC.P().mastery; return (m.ans[m.order[10]] || { sel: [] }).sel.length; });
  ok('Back shows saved selection', pressed === exp && exp > 0, pressed + '/' + exp);
  await pg.click('[data-act="mNext"]');
  for (let i = 11; i < 59; i++) {
    await answer(i, plan[i] || 'right');
    if (i < 58) { await pg.click('[data-act="mNext"]'); if (await pg.locator('[data-act="mResume"]').count() && (await pg.evaluate(() => window.__CLC.view().v)) === 'masteryBreak') await pg.click('[data-act="mResume"]'); }
  }
  ok('no answer leaks on any of 59 screens (no marks/hints/labels/category words)', leaks === 0, leaks);
  await pg.click('[data-act="mReview"]');
  ok('review lists 1 unanswered', /<b>1<\/b> unanswered/.test(await pg.innerHTML('#app')));
  await pg.click('[data-act="mSubmit"]');
  const r1 = await pg.evaluate(() => { const v = window.__CLC.view(); return { score: v.score, met: v.met }; });
  ok('53/59 does NOT meet benchmark', r1.score === 53 && r1.met === false && /Not yet\. The goal is 54 of 59\. 1 more/.test(await pg.textContent('.mresult')), JSON.stringify(r1));
  ok('results by category shown', (await pg.locator('table tbody tr').count()) === 6);
  ok('6 missed sentences explained', (await pg.locator('.missed-item').count()) === 6);
  const missedText = await pg.textContent('#app');
  ok('missed items show selections, correct words, diagnosis', /Your selections:/.test(missedText) && /Correct verb words:/.test(missedText) && /Missed the helper/.test(missedText) && /Missed the main verb/.test(missedText) && /Extra word/.test(missedText) && /No answer was given/.test(missedText));
  ok('recommended practice buttons', (await pg.locator('[data-act="lessonV"]').count()) >= 1 && (await pg.locator('[data-act="practiceSkill"]').count()) >= 1);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/mastery-result-53.png', fullPage: true });
  await pg.click('[data-act="lessonV"] >> nth=0');
  ok('recommended lesson opens', (await pg.evaluate(() => window.__CLC.view().v)) === 'lesson');

  // Run 2: exactly 5 wrong -> 54/59 met
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="verbs"]'); await pg.click('[data-act="masteryIntro"]'); await pg.click('[data-act="mStart"]');
  const order2 = await pg.evaluate(() => window.__CLC.P().mastery.order);
  order.splice(0, order.length, ...order2);
  const team2 = order.map((id, i) => key[id].teams[0].length > 1 ? i : -1).filter(i => i >= 0);
  const plan2 = {}; plan2[team2[0]] = 'missHelper'; plan2[team2[1]] = 'missMain'; plan2[team2[2]] = 'missHelper'; plan2[team2[3]] = 'extra'; plan2[team2[4]] = 'extra';
  for (let i = 0; i < 59; i++) { await answer(i, plan2[i] || 'right'); if (i < 58) { await pg.click('[data-act="mNext"]'); if ((await pg.evaluate(() => window.__CLC.view().v)) === 'masteryBreak') await pg.click('[data-act="mResume"]'); } }
  await pg.click('[data-act="mReview"]'); await pg.click('[data-act="mSubmit"]');
  const r2 = await pg.evaluate(() => { const v = window.__CLC.view(); return { score: v.score, met: v.met }; });
  ok('54/59 meets benchmark', r2.score === 54 && r2.met === true && /Benchmark met/.test(await pg.textContent('.mresult')), JSON.stringify(r2));
  ok('partial verb teams graded wrong (all 3 team misses counted)', (await pg.locator('.missed-item').count()) === 5);
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="grown"] >> nth=0');
  ok('grown-up view shows mastery history', /54 of 59/.test(await pg.textContent('#app')) && /53 of 59/.test(await pg.textContent('#app')));

  // mobile layout of a mastery question
  const m = await b.newContext({ viewport: { width: 360, height: 740 } }); const mp = await m.newPage(); await mp.goto(FILE);
  await mp.click('[data-act="area"][data-a="verbs"]'); await mp.click('[data-act="masteryIntro"]'); await mp.click('[data-act="mStart"]');
  const w = await mp.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); ok('mastery mobile no horizontal scroll', w[0] <= w[1], w.join(' vs '));
  if (SHOTS) await mp.screenshot({ path: SHOTS + '/mastery-mobile.png', fullPage: true });
  await m.close();

  ok('no JS errors', errs.length === 0, errs.join(' | '));
  await b.close();
  console.log(R.join('\n')); const f = R.filter(x => x.startsWith('FAIL')).length; console.log(`\n${R.length - f} passed, ${f} failed`); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); console.log(R.join('\n')); process.exit(1); });
