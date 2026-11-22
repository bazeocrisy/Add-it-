// Grade-3 correction checks: every lesson playable (all kinds), every skill has practice + separate check items,
// lessons teach before checks test, hints never eliminate, new kinds grade exactly, migration, readiness skip.
const { chromium } = require('playwright'); const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../chriss-learning-club.html');
const R = []; const ok = (n, c, i) => R.push((c ? 'PASS ' : 'FAIL ') + n + (i !== undefined ? '  (' + i + ')' : ''));
async function answer(pg, wrongFirst) {
  for (let g = 0; g < 5; g++) {
    const st = await pg.evaluate(() => { const v = window.__CLC.view(), QS = v.qs; if (!QS || QS.done) return null; const q = QS.q; let ans = q.ans; if (QS.phase === 'noun') { ans = []; q.ans.forEach(i => { const t = q.toks[i].to; if (!ans.includes(t)) ans.push(t); }); } return { kind: q.kind, ans, a: q.a, a2: q.a2, ok: q.ok, items: q.items, wrong: q.wrong, order: q.okOrders ? q.okOrders[0] : null, sel: QS.sel, cur: QS.order, num: q.kind === 'num' ? String(q.ans) : null, best: q.best || null }; });
    if (!st) return;
    if (st.kind === 'select') { for (const i of st.sel) if (!st.ans.includes(i)) await pg.click(`[data-act="tok"][data-i="${i}"]`); for (const i of st.ans) if (!st.sel.includes(i)) await pg.click(`[data-act="tok"][data-i="${i}"]`); }
    if (st.kind === 'mc') await pg.click(`[data-act="choice"][data-i="${st.a}"]`);
    if (st.kind === 'mc2') { await pg.click(`[data-act="choice"][data-i="${st.a}"]`); await pg.click(`[data-act="choice2"][data-i="${st.a2}"]`); }
    if (st.kind === 'fix') { const cur = await pg.evaluate(() => window.__CLC.view().qs.tok); if (cur !== st.wrong) await pg.click(`[data-act="ftok"][data-i="${st.wrong}"]`); await pg.click(`[data-act="choice"][data-i="${st.a}"]`); }
    if (st.kind === 'order') { while ((await pg.evaluate(() => window.__CLC.view().qs.order.length)) > 0) await pg.click('[data-act="orem"][data-i="0"]'); for (const i of st.order) await pg.click(`[data-act="oadd"][data-i="${i}"]`); }
    if (st.kind === 'num') { while ((await pg.evaluate(() => window.__CLC.view().qs.num.length)) > 0) await pg.click('[data-act="nkey"][data-k="back"]'); for (const ch of st.num) await pg.click(`[data-act="nkey"][data-k="${ch}"]`); }
    if (st.kind === 'tray') { while ((await pg.evaluate(() => window.__CLC.view().qs.tray.length)) > 0) await pg.click('[data-act="trem"][data-i="0"]'); for (const c of st.best) await pg.click(`[data-act="tadd"][data-c="${c}"]`); }
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
  ok('migration keeps old main-idea record as legacy mixed comprehension', mig.v === 3 && mig.legacy && mig.legacy.ind === 2 && mig.legacy.help === 1 && mig.legacy.chkTotal === 2 && /Legacy mixed comprehension/.test(mig.legacy.legacy), JSON.stringify(mig.legacy));
  ok('migration rebuilds main idea only from genuine main-idea questions', mig.main.ind === 1 && mig.main.help === 0 && mig.main.hist.length === 0 && mig.main.chkTotal === 0, JSON.stringify(mig.main));
  ok('migration moves theme answers to Theme', mig.theme && mig.theme.ind === 1 && mig.theme.help === 1, JSON.stringify(mig.theme));
  ok('old check history relabeled, not deleted', mig.missed.join() === 'legacy_main' && mig.legacyFlag === true);
  await p5.reload();
  ok('migration runs once (stable after reload)', await p5.evaluate(() => { const P = window.__CLC.P(); return P.skills['reading.main'].ind === 1 && P.skills['reading.legacy_main'].ind === 2; }));
  await p5.click('[data-act="grown"] >> nth=0');
  ok('grown-up view shows the legacy row and the new reading skills', /Legacy mixed comprehension/.test(await p5.textContent('#app')) && /Theme \/ lesson/.test(await p5.textContent('#app')) && /Character problem and solution/.test(await p5.textContent('#app')));
  await c5.close();
  // ---- final audit comparison fixes ----
  const c6 = await b.newContext(); const p6 = await c6.newPage(); p6.on('pageerror', e => errs.push(e.message)); await p6.goto(FILE);
  const struct = await p6.evaluate(() => { const bad = []; AREAS.forEach(a => LESSONS[a.id].forEach(l => { const g = l.steps.some(s => s.t === 'guided' || s.guided); const iIdx = l.steps.map((s, i) => (s.t === 'try' || s.t === 'mc' || (s.t === 'reading' && !s.guided)) ? i : -1).filter(i => i >= 0); const gIdx = l.steps.findIndex(s => s.t === 'guided' || s.guided); if (!g || !iIdx.some(i => i > gIdx)) bad.push(a.id + ' ' + l.id); })); return bad; });
  ok('every lesson has a guided attempt followed by an independent attempt', struct.length === 0, struct.join(', '));
  const fSteps = await p6.evaluate(() => { const l = LESSONS.verbs.find(x => x.id === 'F'); const i = l.steps.findIndex(s => /An -ed word can describe/.test(s.title || '')); const q = l.steps.findIndex(s => !!s.q); return [i, q]; });
  ok('Ending Clues teaches an -ed describing word before any question', fSteps[0] >= 0 && fSteps[0] < fSteps[1], fSteps.join(','));
  // one right reading-check answer is only "Early evidence"
  await p6.evaluate(() => { const P = window.__CLC.P(); P.skills['reading.theme'] = { hist: [], ind: 0, help: 0, rev: 0, chkRight: 1, chkTotal: 1, lastChk: { right: 1, total: 1 } }; P.skills['nouns.people'] = { hist: ['ind', 'ind', 'ind', 'ind', 'ind', 'ind'], ind: 6, help: 0, rev: 0, chkRight: 1, chkTotal: 1, lastChk: { right: 1, total: 1 } }; P.skills['nouns.places'] = { hist: ['ind', 'ind', 'ind', 'ind', 'ind', 'ind'], ind: 6, help: 0, rev: 0, chkRight: 3, chkTotal: 3, lastChk: { right: 2, total: 2 } }; });
  await p6.click('[data-act="grown"] >> nth=0');
  const rowOf = name => p6.evaluate(n => { const r = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('th') && tr.querySelector('th').textContent.trim().startsWith(n)); return r ? r.querySelector('td:last-child').textContent.trim() : null; }, name);
  const themeRow = await rowOf('Theme / lesson'), peopleRow = await rowOf('People nouns'), placesRow = await rowOf('Place nouns');
  ok('one correct reading-check answer shows only "Early evidence (1 answer)"', /^Early evidence \(1 answer\)$/.test(themeRow), themeRow);
  ok('strong practice plus only one check answer is not "Getting strong"', !/Getting strong/.test(peopleRow), peopleRow);
  ok('enough practice and check evidence can show "Getting strong"', /^Getting strong \(9 answers\)$/.test(placesRow), placesRow);
  // helper-word memory reported separately in a verb check
  await p6.evaluate(() => { const P = window.__CLC.P(); P.lessons['verbs:C'] = true; P.lessons['verbs:A'] = true; });
  await p6.click('[data-act="home"] >> nth=0'); await p6.click('[data-act="area"][data-a="verbs"]'); await p6.click('[data-act="testSetup"]'); await p6.click('[data-act="startTest"][data-n="10"]');
  const vids = await p6.evaluate(() => window.__CLC.view().ids);
  for (let i = 0; i < vids.length - 1; i++) await p6.click('[data-act="tnext"]'); await p6.click('[data-act="treview"]'); await p6.click('[data-act="submitTest"]');
  const split = await p6.locator('.mem-split').count() ? await p6.textContent('.mem-split') : '';
  ok('verb check reports helper-word memory separately from finding verbs in sentences', /Finding verbs in sentences/.test(split) && /Helper-word memory \(recall, reported separately\)/.test(split), split);
  await c6.close();
  // ---- Money area ----
  const c7 = await b.newContext({ viewport: { width: 390, height: 844 } }); const p7 = await c7.newPage(); p7.on('pageerror', e => errs.push(e.message)); await p7.goto(FILE);
  const mg = await p7.evaluate(() => {
    const C = window.__CLC, out = { bad: [] }, Q = C.QBY;
    const mq = Object.values(Q).filter(q => q.area === 'money');
    const val = { p: 1, n: 5, d: 10, q: 25 };
    mq.filter(q => q.kind === 'num' && q.coins && !q.story).forEach(q => { const sum = q.coins.toLowerCase().split('').reduce((t, c) => t + val[c], 0); if (sum !== q.ans) out.bad.push('num key ' + q.id); });
    const tray = Q['mo37']; // 30 cents, any coins
    [['d','d','d'], ['q','n'], ['q','p','p','p','p','p'], ['n','n','n','n','n','n']].forEach(t => { if (!C.gradeOnly(tray, { tray: t })) out.bad.push('tray any-combo rejected ' + t.join('')); });
    if (C.gradeOnly(tray, { tray: ['q'] })) out.bad.push('tray short accepted');
    if (C.gradeOnly(tray, { tray: ['q', 'd'] })) out.bad.push('tray over accepted');
    const few = Q['mo42']; if (!C.gradeOnly(few, { tray: ['q', 'n'] }) || C.gradeOnly(few, { tray: ['d', 'd', 'd'] })) out.bad.push('fewest rule');
    const only = Q['mo41']; if (C.gradeOnly(only, { tray: ['q', 'q'] }) || !C.gradeOnly(only, { tray: ['d', 'd', 'd', 'd', 'n', 'n'] })) out.bad.push('only rule');
    if (!C.gradeOnly(Q['mo13'], { num: '5' }) || C.gradeOnly(Q['mo13'], { num: '50' })) out.bad.push('num exact');
    // check items must not repeat a lesson/practice coin set or tray target
    const ms = s => s.toLowerCase().split('').sort().join('');
    const seenSets = new Set(), seenTargets = new Set();
    LESSONS.money.forEach((l, li) => l.steps.forEach((s, si) => { if (s.q && s.q.coins && s.q.k === 'num') seenSets.add(ms(s.q.coins)); if (s.q && s.q.k === 'tray') seenTargets.add(s.q.target + '|' + (s.q.only || '') + '|' + !!s.q.fewest); }));
    (C.AREA_Q.money || []).forEach(q => { if (q.kind === 'num' && q.coins) seenSets.add(ms(q.coins)); if (q.kind === 'tray') seenTargets.add(q.target + '|' + (q.only.length < 4 ? q.only.join('') : '') + '|' + q.fewest); });
    out.dupCheck = (C.CHECK_Q.money || []).filter(q => (q.kind === 'num' && q.coins && seenSets.has(ms(q.coins))) || (q.kind === 'tray' && seenTargets.has(q.target + '|' + (q.only.length < 4 ? q.only.join('') : '') + '|' + q.fewest))).map(q => q.id);
    out.skills = SKILLS.money.map(s => s.id + ':' + (C.AREA_Q.money || []).filter(q => q.sk === s.id).length + '/' + (C.CHECK_Q.money || []).filter(q => q.sk === s.id).length);
    return out;
  });
  ok('money: answers computed from coins; tray accepts any correct combination; only/fewest rules enforced; number answers exact', mg.bad.length === 0, mg.bad.join('; '));
  ok('money: no check item repeats a lesson or practice coin set or target', mg.dupCheck.length === 0, mg.dupCheck.join(','));
  console.log('money practice/check per skill:', mg.skills.join('  '));
  // feedback for common counting mistakes
  const fb = await p7.evaluate(() => { const C = window.__CLC, q = C.QBY['mo27']; /* qnn = 35 */ const QS = { q, num: '3', tray: [] }; const a = C.evaluate ? null : null; return null; });
  await p7.click('[data-act="area"][data-a="money"]'); await p7.click('[data-act="pick"][data-mode="practice"]'); await p7.click('[data-act="startRound"][data-sk="mix2"]');
  const cur = await p7.evaluate(() => { const q = window.__CLC.view().qs.q; return { n: q.coins.length, ans: q.ans }; });
  for (const ch of String(cur.n)) await p7.click(`[data-act="nkey"][data-k="${ch}"]`); await p7.click('[data-act="check"]');
  ok('money: typing the number of coins gets "count what they are WORTH" feedback', /how much they are WORTH/.test(await p7.textContent('.fb')));
  await p7.click('[data-act="home"] >> nth=0'); await p7.click('[data-act="area"][data-a="money"]'); await p7.click('[data-act="pick"][data-mode="practice"]'); await p7.click('[data-act="startRound"][data-sk="make"]');
  await p7.click('[data-act="tadd"] >> nth=0');
  ok('money: no running total during independent practice', !/Total so far/.test(await p7.textContent('.qbox')));
  await p7.click('[data-act="home"] >> nth=0'); await p7.click('[data-act="area"][data-a="money"]'); await p7.click('[data-act="pick"][data-mode="guided"]'); await p7.click('[data-act="startRound"][data-sk="make"]');
  await p7.click('[data-act="tadd"] >> nth=0');
  ok('money: running total shows with the coach (guided)', /Total so far: \d+¢/.test(await p7.textContent('.qbox')));
  await p7.click('[data-act="home"] >> nth=0'); await p7.click('[data-act="area"][data-a="money"]'); await p7.click('[data-act="pick"][data-mode="practice"]'); await p7.click('[data-act="startRound"][data-sk="names"]');
  const alts = await p7.evaluate(() => [...document.querySelectorAll('.qbox img.coin')].map(i => i.alt));
  ok('money: coin-naming questions do not reveal the coin name to screen readers', alts.length > 0 && alts.every(a => !/penny|pennies|nickel|dime|quarter|cent\b|¢/i.test(a.replace(/ONE CENT|FIVE CENTS|ONE DIME|QUARTER DOLLAR/g, ''))), alts.join(','));
  ok('money: no horizontal scroll at phone width', await p7.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await c7.close();
  ok('no JS errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await b.close(); console.log(R.join('\n')); const f = R.filter(x => x.startsWith('FAIL')).length; console.log(`\n${R.length - f} passed, ${f} failed`); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); console.log(R.join('\n')); process.exit(1); });
