// Grade-3 correction checks: every lesson playable (all kinds), every skill has practice + separate check items,
// lessons teach before checks test, hints never eliminate, new kinds grade exactly, migration, readiness skip.
const { chromium } = require('playwright'); const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../chriss-learning-club.html');
const R = []; const ok = (n, c, i) => R.push((c ? 'PASS ' : 'FAIL ') + n + (i !== undefined ? '  (' + i + ')' : ''));
async function answer(pg, wrongFirst) {
  for (let g = 0; g < 5; g++) {
    const st = await pg.evaluate(() => { const v = window.__CLC.view(), QS = v.qs; if (!QS || QS.done) return null; const q = QS.q; let ans = q.ans; if (QS.phase === 'noun') { ans = []; q.ans.forEach(i => { const t = q.toks[i].to; if (!ans.includes(t)) ans.push(t); }); } return { kind: q.kind, ans, a: q.a, a2: q.a2, ok: q.ok, items: q.items, wrong: q.wrong, order: q.okOrders ? q.okOrders[0] : null, sel: QS.sel, cur: QS.order }; });
    if (!st) return;
    if (st.kind === 'select') { for (const i of st.sel) if (!st.ans.includes(i)) await pg.click(`[data-act="tok"][data-i="${i}"]`); for (const i of st.ans) if (!st.sel.includes(i)) await pg.click(`[data-act="tok"][data-i="${i}"]`); }
    if (st.kind === 'mc') await pg.click(`[data-act="choice"][data-i="${st.a}"]`);
    if (st.kind === 'mc2') { await pg.click(`[data-act="choice"][data-i="${st.a}"]`); await pg.click(`[data-act="choice2"][data-i="${st.a2}"]`); }
    if (st.kind === 'fix') { const cur = await pg.evaluate(() => window.__CLC.view().qs.tok); if (cur !== st.wrong) await pg.click(`[data-act="ftok"][data-i="${st.wrong}"]`); await pg.click(`[data-act="choice"][data-i="${st.a}"]`); }
    if (st.kind === 'order') { while ((await pg.evaluate(() => window.__CLC.view().qs.order.length)) > 0) await pg.click('[data-act="orem"][data-i="0"]'); for (const i of st.order) await pg.click(`[data-act="oadd"][data-i="${i}"]`); }
    if (st.kind === 'sort') for (let i = 0; i < st.items.length; i++) await pg.click(`[data-act="sort"][data-i="${i}"][data-b="${st.items[i][1]}"]`);
    if (st.kind === 'ev') await pg.click(`[data-act="ev"][data-i="${st.ok[0]}"]`);
    await pg.click('[data-act="check"]');
  }
}
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } }); const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); await pg.goto(FILE);
  const info = await pg.evaluate(() => {
    const C = window.__CLC, o = { skills: [], kinds: {} };
    AREAS.forEach(a => SKILLS[a.id].forEach(s => {
      const prac = (C.AREA_Q[a.id] || []).filter(q => q.sk === s.id).length, chk = (C.CHECK_Q[a.id] || []).filter(q => q.sk === s.id).length;
      const les = LESSONS[a.id].find(l => l.id === s.lesson);
      o.skills.push({ a: a.id, sk: s.id, prac, chk, lesson: !!les, lessonSkill: les ? les.skill : null, optional: !!s.optional });
    }));
    Object.values(C.QBY).forEach(q => o.kinds[q.kind] = (o.kinds[q.kind] || 0) + 1);
    const pr = new Set(); Object.values(C.AREA_Q).flat().forEach(q => pr.add(q.id)); o.overlap = Object.values(C.CHECK_Q).flat().filter(q => pr.has(q.id)).map(q => q.id);
    o.lessons = AREAS.map(a => ({ a: a.id, ids: LESSONS[a.id].map(l => l.id) }));
    return o;
  });
  info.skills.forEach(s => ok(`skill ${s.a}.${s.sk}: lesson exists and teaches it`, s.lesson && (s.lessonSkill === s.sk || s.a === 'vowels'), s.lessonSkill));
  info.skills.filter(s => !['challenge', 'helpers'].includes(s.sk)).forEach(s => ok(`skill ${s.a}.${s.sk}: practice ${s.prac} / check ${s.chk}`, s.prac >= 4 && (s.chk >= 2 || s.a === 'reading')));
  ok('no check item in a practice pool', info.overlap.length === 0, info.overlap.join(','));
  console.log('item kinds:', JSON.stringify(info.kinds));
  // play every lesson
  for (const a of info.lessons) for (const l of a.ids) {
    await pg.click('[data-act="home"] >> nth=0'); await pg.click(`[data-act="area"][data-a="${a.a}"]`); await pg.click('[data-act="learn"]'); await pg.click(`[data-act="lesson"][data-l="${l}"]`);
    let n = 0; while ((await pg.evaluate(() => window.__CLC.view().v)) === 'lesson' && n++ < 30) {
      if (await pg.locator('[data-act="cover"]').count()) { await pg.click('[data-act="cover"]'); await pg.click('[data-act="reveal"]'); }
      if (await pg.evaluate(() => !!window.__CLC.view().qs)) await answer(pg);
      await pg.click('[data-act="lnext"]');
    }
    ok(`lesson ${a.a} ${l} completes`, (await pg.evaluate(() => window.__CLC.view().v)) === 'lessonEnd');
  }
  // practice round per skill (with one hint pair), hints never eliminate
  let elim = [];
  for (const s of info.skills.filter(s => s.prac)) {
    await pg.click('[data-act="home"] >> nth=0'); await pg.click(`[data-act="area"][data-a="${s.a}"]`); await pg.click('[data-act="pick"][data-mode="practice"]'); await pg.click(`[data-act="startRound"][data-sk="${s.sk}"]`);
    const total = await pg.evaluate(() => window.__CLC.view().ids.length);
    for (let k = 0; k < total; k++) {
      if (k === 0) { await pg.click('[data-act="hint"]'); await pg.click('[data-act="hint"]'); const h = await pg.textContent('.hint'); if (/It is NOT|goes in “/.test(h)) elim.push(s.a + '.' + s.sk); }
      await answer(pg); await pg.click('[data-act="nextQ"]');
    }
    if ((await pg.evaluate(() => window.__CLC.view().v)) !== 'roundEnd') ok(`practice ${s.a}.${s.sk} round completes`, false);
  }
  ok('practice rounds for every skill complete', true);
  ok('no hint 2 eliminates a choice', elim.length === 0, elim.join(','));
  // ---- exact grading for the new response kinds (every item) ----
  const g = await pg.evaluate(() => {
    const C = window.__CLC, bad = [];
    Object.values(C.QBY).forEach(q => {
      if (q.kind === 'fix') { if (!C.gradeOnly(q, { tok: q.wrong, choice: q.a })) bad.push('fix full ' + q.id); q.c.forEach((_, i) => { if (i !== q.a && C.gradeOnly(q, { tok: q.wrong, choice: i })) bad.push('fix wrong choice ' + q.id); }); q.toks.forEach(t => { if (t.i !== q.wrong && C.gradeOnly(q, { tok: t.i, choice: q.a })) bad.push('fix wrong word ' + q.id); }); }
      if (q.kind === 'order') { if (!C.gradeOnly(q, { order: q.okOrders[0] })) bad.push('order ' + q.id); const r = q.okOrders[0].slice().reverse(); if (C.gradeOnly(q, { order: r })) bad.push('order reversed passes ' + q.id); if (C.gradeOnly(q, { order: q.okOrders[0].slice(1) })) bad.push('order partial passes ' + q.id); }
      if (q.kind === 'mc2') { if (!C.gradeOnly(q, { choice: q.a, choice2: q.a2 })) bad.push('mc2 ' + q.id); if (C.gradeOnly(q, { choice: q.a, choice2: (q.a2 + 1) % q.c2.length })) bad.push('mc2 half passes ' + q.id); if (C.gradeOnly(q, { choice: (q.a + 1) % q.c.length, choice2: q.a2 })) bad.push('mc2 half passes ' + q.id); }
    });
    return bad;
  });
  ok('new kinds grade exactly (fix: word AND correction; order: exact sequence; mc2: both parts)', g.length === 0, g.slice(0, 5).join('; '));
  // ---- wrong arrangement gets feedback, not credit ----
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="workshop"]'); await pg.click('[data-act="learn"]'); await pg.click('[data-act="lesson"][data-l="B"]');
  for (let s = 0; s < 5; s++) { if (await pg.evaluate(() => { const v = window.__CLC.view(); return !!(v.qs && !v.qs.done); })) await answer(pg); await pg.click('[data-act="lnext"]'); }
  const isOrder = () => pg.evaluate(() => { const v = window.__CLC.view(); return !!(v.qs && v.qs.q.kind === 'order'); });
  ok('Workshop Lesson B serves an arrange-the-parts item', await isOrder());
  if (await isOrder()) {
    const ord = await pg.evaluate(() => window.__CLC.view().qs.q.okOrders[0].slice().reverse());
    for (const x of ord) await pg.click(`[data-act="oadd"][data-i="${x}"]`); await pg.click('[data-act="check"]');
    ok('arrange parts: wrong order is not accepted and gets a reading strategy', !(await pg.evaluate(() => window.__CLC.view().qs.done)) && /Read your sentence/.test(await pg.textContent('.fb')));
  }
  // ---- predicate adjectives are not practiced or checked before Lesson F ----
  const c3 = await b.newContext(); const p3 = await c3.newPage(); p3.on('pageerror', e => errs.push(e.message)); await p3.goto(FILE);
  await p3.evaluate(() => { const P = window.__CLC.P(); ['A', 'B', 'C', 'D', 'E'].forEach(l => P.lessons['adjectives:' + l] = true); });
  await p3.click('[data-act="area"][data-a="adjectives"]'); await p3.click('[data-act="testSetup"]'); await p3.click('[data-act="startTest"][data-n="10"]');
  const sks = await p3.evaluate(() => window.__CLC.view().ids.map(id => window.__CLC.QBY[id].sk));
  ok('before Lesson F: adjective check has no after-linking-verb items', !sks.includes('after') && !sks.includes('compare'), sks.join(','));
  await p3.click('[data-act="quitTest"]'); await p3.click('[data-act="pick"][data-mode="practice"]'); await p3.click('[data-act="startRound"][data-sk=""]');
  const psk = await p3.evaluate(() => window.__CLC.view().ids.map(id => window.__CLC.QBY[id].sk));
  ok('before Lesson F: mixed practice has no after-linking-verb items', !psk.includes('after'), psk.join(','));
  await c3.close();
  // ---- Foundation Review can be skipped after a passed Ready Check ----
  for (const pass of [true, false]) {
    const c4 = await b.newContext(); const p4 = await c4.newPage(); p4.on('pageerror', e => errs.push(e.message)); await p4.goto(FILE);
    await p4.click('[data-act="area"][data-a="vowels"]'); await p4.click('[data-act="learn"]');
    ok('Word Study shows Foundation Review and Grade 3 sections', /Foundation Review/.test(await p4.textContent('#app')) && /Grade 3 Word Study/.test(await p4.textContent('#app')));
    await p4.click('[data-act="readyCheck"]');
    const n = await p4.evaluate(() => window.__CLC.view().ids.length);
    for (let i = 0; i < n; i++) {
      const k = await p4.evaluate(() => { const q = window.__CLC.view().qs.q; return { kind: q.kind, a: q.a, c: q.c ? q.c.length : 0, items: q.items, sk: q.sk }; });
      const right = pass || i > 1; // fail run: 2 wrong -> 3/5
      if (k.kind === 'mc') await p4.click(`[data-act="choice"][data-i="${right ? k.a : (k.a + 1) % k.c}"]`);
      if (k.kind === 'sort') for (let j = 0; j < k.items.length; j++) await p4.click(`[data-act="sort"][data-i="${j}"][data-b="${right ? k.items[j][1] : 1 - k.items[j][1]}"]`);
      await p4.click(i < n - 1 ? '[data-act="tnext"]' : '[data-act="treview"]');
    }
    const foundOnly = await p4.evaluate(() => window.__CLC.view().ids.every(id => { const q = window.__CLC.QBY[id]; return SKILLS.vowels.find(s => s.id === q.sk).foundation; }));
    await p4.click('[data-act="submitTest"]');
    const msg = await p4.textContent('#app');
    await p4.click('[data-act="area"]'); 
    const lead = await p4.textContent('.lead');
    if (pass) ok('Ready Check passed: foundation skipped, coach moves to Lesson I', foundOnly && /Ready! Foundation Review is marked as skipped/.test(msg) && /Lesson I/.test(lead), lead);
    else ok('Ready Check not passed: foundation stays, coach suggests Lesson A', /review the Foundation lessons first/.test(msg) && /Lesson A/.test(lead), lead);
    await c4.close();
  }
  // ---- history migration: theme/problem answers no longer count as main idea ----
  const c5 = await b.newContext(); const p5 = await c5.newPage(); p5.on('pageerror', e => errs.push(e.message));
  await p5.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('chrissLearningClub.v1', JSON.stringify({ v: 1, nick: 'Chris', lessons: { 'reading:A': true }, stats: { p3q5: { n: 2, ind: 1, help: 1, rev: 0 }, p1q1: { n: 1, ind: 1, help: 0, rev: 0 }, seen_q: { cp2q1: 1 } }, skills: { 'reading.main': { hist: ['ind', 'ind', 'help'], ind: 2, help: 1, rev: 0, chkRight: 1, chkTotal: 2, lastChk: { right: 1, total: 2 } } }, checks: [{ a: 'reading', date: '2026-11-20T10:00:00Z', n: 5, score: 4, missed: ['main'] }] })); } });
  await p5.goto(FILE);
  const mig = await p5.evaluate(() => { const P = window.__CLC.P(); return { v: P.v, legacy: P.skills['reading.legacy_main'], main: P.skills['reading.main'], theme: P.skills['reading.theme'], missed: P.checks[0].missed, legacyFlag: P.checks[0].legacy }; });
  ok('migration keeps old main-idea record as legacy mixed comprehension', mig.v === 2 && mig.legacy && mig.legacy.ind === 2 && mig.legacy.help === 1 && mig.legacy.chkTotal === 2 && /Legacy mixed comprehension/.test(mig.legacy.legacy), JSON.stringify(mig.legacy));
  ok('migration rebuilds main idea only from genuine main-idea questions', mig.main.ind === 1 && mig.main.help === 0 && mig.main.hist.length === 0 && mig.main.chkTotal === 0, JSON.stringify(mig.main));
  ok('migration moves theme answers to Theme', mig.theme && mig.theme.ind === 1 && mig.theme.help === 1, JSON.stringify(mig.theme));
  ok('old check history relabeled, not deleted', mig.missed.join() === 'legacy_main' && mig.legacyFlag === true);
  await p5.reload();
  ok('migration runs once (stable after reload)', await p5.evaluate(() => { const P = window.__CLC.P(); return P.skills['reading.main'].ind === 1 && P.skills['reading.legacy_main'].ind === 2; }));
  await p5.click('[data-act="grown"] >> nth=0');
  ok('grown-up view shows the legacy row and the new reading skills', /Legacy mixed comprehension/.test(await p5.textContent('#app')) && /Theme \/ lesson/.test(await p5.textContent('#app')) && /Character problem and solution/.test(await p5.textContent('#app')));
  await c5.close();
  ok('no JS errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await b.close(); console.log(R.join('\n')); const f = R.filter(x => x.startsWith('FAIL')).length; console.log(`\n${R.length - f} passed, ${f} failed`); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); console.log(R.join('\n')); process.exit(1); });
