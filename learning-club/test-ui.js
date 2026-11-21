// End-to-end walkthrough. Run: node learning-club/test-ui.js [screenshotDir]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const FILE = 'file://' + path.resolve(__dirname, '../chriss-learning-club.html');
const SHOTS = process.argv[2] || null;
const results = []; const ok = (name, cond, info) => { results.push((cond ? 'PASS ' : 'FAIL ') + name + (info ? '  (' + info + ')' : '')); };

async function answerCurrent(pg, correct = true) {
  // Answers whatever question is active using the app's own answer key, through real clicks.
  for (let guard = 0; guard < 4; guard++) {
    const st = await pg.evaluate(() => { const v = window.__CLC.view(), QS = v.qs; if (!QS || QS.done) return null; const q = QS.q;
      let targets = q.ans; if (QS.phase === 'noun') { targets = []; q.ans.forEach(i => { const t = q.toks[i].to; if (targets.indexOf(t) < 0) targets.push(t); }); }
      return { kind: q.kind, ans: targets, a: q.a, ok: q.ok, items: q.items, sel: QS.sel }; });
    if (!st) return;
    if (st.kind === 'select') { for (const i of st.sel) if (st.ans.indexOf(i) < 0) await pg.click(`[data-act="tok"][data-i="${i}"]`); for (const i of st.ans) if (st.sel.indexOf(i) < 0) await pg.click(`[data-act="tok"][data-i="${i}"]`); }
    if (st.kind === 'mc') await pg.click(`[data-act="choice"][data-i="${st.a}"]`);
    if (st.kind === 'sort') for (let i = 0; i < st.items.length; i++) await pg.click(`[data-act="sort"][data-i="${i}"][data-b="${st.items[i][1]}"]`);
    if (st.kind === 'ev') await pg.click(`[data-act="ev"][data-i="${st.ok[0]}"]`);
    await pg.click('[data-act="check"]');
  }
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1200, height: 900 } });
  const net = []; await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('file:') && !u.startsWith('blob:') && !u.startsWith('data:')) { net.push(u); return r.abort(); } return r.continue(); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(FILE);
  ok('home shows 6 areas', (await pg.locator('.area-card').count()) === 6);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/home-desktop.png' });

  // Every lesson in every area, start to finish
  const areas = await pg.evaluate(() => AREAS.map(a => ({ id: a.id, lessons: LESSONS[a.id].map(l => l.id) })));
  for (const a of areas) {
    await pg.click('[data-act="home"] >> nth=0'); await pg.click(`[data-act="area"][data-a="${a.id}"]`);
    ok(a.id + ' has 4 learning steps', (await pg.locator('.path-step').count()) === 4);
    for (const l of a.lessons) {
      await pg.click('[data-act="learn"]'); await pg.click(`[data-act="lesson"][data-l="${l}"]`);
      let n = 0;
      while ((await pg.evaluate(() => window.__CLC.view().v)) === 'lesson' && n++ < 30) {
        if (await pg.locator('[data-act="cover"]').count()) { await pg.click('[data-act="cover"]'); ok('cards cover hides words', (await pg.locator('.mem.covered').count()) === 8); await pg.click('[data-act="reveal"]'); await pg.click('[data-act="fam"][data-i="3"]'); ok('cards other family', (await pg.locator('.mem').count()) === 9); }
        const hasQ = await pg.evaluate(() => !!window.__CLC.view().qs);
        if (hasQ) { ok(`${a.id} ${l} next locked before answer`, (await pg.locator('[data-act="lnext"]').count()) === 0 || (await pg.evaluate(() => window.__CLC.view().qs.done))); await answerCurrent(pg); }
        if (SHOTS && a.id === 'adjectives' && l === 'A' && hasQ) await pg.screenshot({ path: SHOTS + '/adj-arrow.png' });
        await pg.click('[data-act="lnext"]');
      }
      ok(`${a.id} lesson ${l} completes`, (await pg.evaluate(() => window.__CLC.view().v)) === 'lessonEnd');
    }
  }

  // Verb lesson D: partial-team feedback through the UI
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="verbs"]'); await pg.click('[data-act="learn"]'); await pg.click('[data-act="lesson"][data-l="D"]');
  for (let i = 0; i < 3; i++) await pg.click('[data-act="lnext"]');
  const sent = await pg.evaluate(() => window.__CLC.view().qs.q.toks.map(t => t.w).join(' '));
  await pg.click('[data-act="tok"][data-i="1"]'); // "are"
  const verbDeco = await pg.evaluate(() => getComputedStyle(document.querySelector('[data-act="tok"][data-i="1"]')).textDecorationStyle);
  ok('verb selection is double underline', verbDeco === 'double', verbDeco);
  await pg.click('[data-act="check"]');
  const fb1 = await pg.textContent('.fb');
  ok('helper-only gets specific clue', /You found a helper!.*Find the rest of the verb team/.test(fb1), sent + ' -> ' + fb1.trim());
  ok('coach shown in guided step', (await pg.locator('.coach').count()) === 1);
  await pg.click('[data-act="tok"][data-i="1"]'); await pg.click('[data-act="tok"][data-i="2"]'); await pg.click('[data-act="check"]');
  ok('main-only gets helper clue', /You found the main verb! Look for its helper/.test(await pg.textContent('.fb')));
  await pg.click('[data-act="showme"]');
  ok('show me reveals answer', /Here is the answer/.test(await pg.textContent('.fb')));

  // Noun underline is single
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="nouns"]'); await pg.click('[data-act="pick"][data-mode="practice"]'); await pg.click('[data-act="startRound"][data-sk=""]');
  await pg.click('[data-act="tok"] >> nth=0');
  const nounDeco = await pg.evaluate(() => getComputedStyle(document.querySelector('button.tok[aria-pressed="true"]')).textDecorationStyle);
  ok('noun selection is single underline', nounDeco === 'solid', nounDeco);

  // Practice rounds in every area: first question wrong, hint, then correct; rest correct
  for (const a of areas) {
    await pg.click('[data-act="home"] >> nth=0'); await pg.click(`[data-act="area"][data-a="${a.id}"]`); await pg.click('[data-act="pick"][data-mode="practice"]');
    if (a.id === 'reading') await pg.click('[data-act="startStory"] >> nth=0'); else await pg.click('[data-act="startRound"][data-sk=""]');
    const total = await pg.evaluate(() => window.__CLC.view().ids.length);
    ok(a.id + ' practice round has 5 questions', total === 5, total);
    // wrong attempt
    const wrongDone = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; return q.kind; });
    if (wrongDone === 'mc') { const a2 = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; return (q.a + 1) % q.c.length; }); await pg.click(`[data-act="choice"][data-i="${a2}"]`); }
    else if (wrongDone === 'select') { const i = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; return q.toks.find(t => q.ans.indexOf(t.i) < 0 && !['the','a','an','my','her','his','our','their','your','its'].includes(t.lw)).i; }); await pg.click(`[data-act="tok"][data-i="${i}"]`); }
    else if (wrongDone === 'ev') { const i = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; let i = 0; while (q.ok.indexOf(i) >= 0) i++; return i; }); await pg.click(`[data-act="ev"][data-i="${i}"]`); }
    else if (wrongDone === 'sort') { const n = await pg.evaluate(() => window.__CLC.view().qs.q.items.length); for (let i = 0; i < n; i++) await pg.click(`[data-act="sort"][data-i="${i}"][data-b="0"]`); }
    await pg.click('[data-act="check"]');
    const wrongFb = (await pg.textContent('.fb')).trim();
    ok(a.id + ' wrong answer gets specific feedback', wrongFb.length > 20 && !/^Try again\.?$/.test(wrongFb), wrongFb.slice(0, 110));
    await pg.click('[data-act="hint"]');
    const hint = (await pg.textContent('.hint')).trim();
    ok(a.id + ' hint matches question', hint.length > 15, hint.slice(0, 100));
    if (a.id === 'reading' && SHOTS) await pg.screenshot({ path: SHOTS + '/reading-desktop.png' });
    for (let k = 0; k < total; k++) { await answerCurrent(pg); await pg.click('[data-act="nextQ"]'); }
    ok(a.id + ' round end screen', (await pg.evaluate(() => window.__CLC.view().v)) === 'roundEnd');
    const firstOutcome = await pg.evaluate(() => window.__CLC.view().res[0]);
    ok(a.id + ' assisted answer not counted as first-try', firstOutcome === 'help', firstOutcome);
  }

  // Guided practice: coach + hint visible immediately, outcome counted as help
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="adverbs"]'); await pg.click('[data-act="pick"][data-mode="guided"]'); await pg.click('[data-act="startRound"][data-sk="how"]');
  ok('guided shows coach and hint up front', (await pg.locator('.coach').count()) === 1 && (await pg.locator('.hint').count()) === 1);
  await answerCurrent(pg);
  ok('guided correct counted as help', (await pg.evaluate(() => window.__CLC.view().res[0])) === 'help');

  // Check My Skills (verbs, 10): no hints/feedback, back/forward, unanswered review, partial team graded wrong
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="verbs"]'); await pg.click('[data-act="testSetup"]'); await pg.click('[data-act="startTest"][data-n="10"]');
  const tn = await pg.evaluate(() => window.__CLC.view().ids.length); ok('test has 10 questions', tn === 10, tn);
  ok('test has no hint/check/showme/coach', (await pg.locator('[data-act="hint"],[data-act="check"],[data-act="showme"],.coach,.hint').count()) === 0);
  // Q1: give partial answer if it's a team, else correct
  const q1 = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; return { kind: q.kind, ans: q.ans, a: q.a }; });
  if (q1.kind === 'select') await pg.click(`[data-act="tok"][data-i="${q1.ans[0]}"]`); else await pg.click(`[data-act="choice"][data-i="${q1.a}"]`);
  ok('test gives no correctness marks', (await pg.locator('.badge, .m-ok, .m-no, .msg').count()) === 0);
  await pg.click('[data-act="tnext"]'); await pg.click('[data-act="tprev"]');
  ok('back keeps answer', (await pg.locator('[aria-pressed="true"]').count()) >= 1);
  for (let k = 1; k < tn - 1; k++) { await pg.click('[data-act="tnext"]'); const q = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; return { kind: q.kind, ans: q.ans, a: q.a }; }); if (q.kind === 'select') for (const i of q.ans) await pg.click(`[data-act="tok"][data-i="${i}"]`); else await pg.click(`[data-act="choice"][data-i="${q.a}"]`); }
  await pg.click('[data-act="tnext"]'); // last left blank
  await pg.click('[data-act="treview"]');
  ok('review lists unanswered question', /1<\/b> unanswered/.test(await pg.innerHTML('#app')) && (await pg.locator('[data-act="tjump"]').count()) === 1);
  await pg.click('[data-act="submitTest"]');
  const res = await pg.evaluate(() => { const v = window.__CLC.view(); return { score: v.score, items: v.items.map(i => i.ok) }; });
  const expected = (q1.kind === 'select' && q1.ans.length > 1) ? tn - 2 : tn - 1;
  ok('test scoring (partial team + blank wrong)', res.score === expected, JSON.stringify(res) + ' q1 team size ' + (q1.ans ? q1.ans.length : '-'));
  ok('missed items explained', (await pg.locator('.review').count()) === tn - res.score);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/test-result.png', fullPage: true });

  // Reading check (5 = one story)
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="reading"]'); await pg.click('[data-act="testSetup"]'); await pg.click('[data-act="startTest"][data-n="5"]');
  ok('reading test shows passage', (await pg.locator('.passage').count()) === 1);
  await pg.click('[data-act="quitTest"]');

  // Guides: real PDF download, byte-identical
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="guides"] >> nth=0');
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('[data-act="pdfDownload"]')]);
  const p = await dl.path(); const got = fs.readFileSync(p), orig = fs.readFileSync(path.join(__dirname, 'verb-guide.pdf'));
  ok('PDF download is byte-identical', crypto.createHash('sha256').update(got).digest('hex') === crypto.createHash('sha256').update(orig).digest('hex'), dl.suggestedFilename() + ' ' + got.length + ' bytes, starts ' + got.slice(0, 5).toString());
  for (const k of ['verbs', 'nouns', 'adjectives', 'adverbs', 'vowels']) {
    await pg.click('[data-act="guides"] >> nth=0').catch(() => {});
    if (await pg.locator(`[data-act="sheet"][data-k="${k}"]`).count() === 0) { await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="guides"] >> nth=0'); }
    await pg.click(`[data-act="sheet"][data-k="${k}"]`);
    await pg.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
    await pg.click('[data-act="print"]');
    ok('sheet ' + k + ' print button works', (await pg.evaluate(() => window.__printed)) === 1 && (await pg.locator('.sh-key').count()) === 1);
    if (k === 'verbs') { await pg.emulateMedia({ media: 'print' }); await pg.pdf({ path: (SHOTS || '/tmp') + '/verb-sheet-print.pdf' }); await pg.emulateMedia({ media: 'screen' }); }
  }

  // Grown-up view + reset confirm
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="grown"] >> nth=0');
  ok('grown-up shows next skill + tables', (await pg.locator('.next-skill').count()) === 1 && (await pg.locator('table').count()) === 6);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/grownup.png', fullPage: true });
  await pg.click('[data-act="askReset"]'); ok('reset asks to confirm', (await pg.locator('[data-act="doReset"]').count()) === 1);
  await pg.click('[data-act="cancelReset"]'); ok('cancel keeps progress', await pg.evaluate(() => Object.keys(window.__CLC.P().lessons).length > 0));

  // Resume after reload
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="nouns"]'); await pg.click('[data-act="learn"]'); await pg.click('[data-act="lesson"][data-l="E"]');
  await pg.click('[data-act="lnext"]'); await pg.click('[data-act="lnext"]');
  await pg.reload();
  ok('continue button after reload', (await pg.locator('[data-act="resume"]').count()) === 1, (await pg.textContent('.continue')).trim().replace(/\s+/g, ' '));
  await pg.click('[data-act="resume"]');
  ok('resume returns to same step', await pg.evaluate(() => { const v = window.__CLC.view(); return v.v === 'lesson' && v.l === 'E' && v.step === 2; }));
  ok('lesson progress persisted', await pg.evaluate(() => Object.keys(window.__CLC.P().lessons).length >= 30));

  // Reset (confirmed)
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="grown"] >> nth=0'); await pg.click('[data-act="askReset"]'); await pg.click('[data-act="doReset"]');
  ok('reset clears progress', await pg.evaluate(() => Object.keys(window.__CLC.P().lessons).length === 0));

  // Keyboard: tab to a token and toggle with Space
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="verbs"]'); await pg.click('[data-act="learn"]'); await pg.click('[data-act="lesson"][data-l="A"]');
  for (let i = 0; i < 3; i++) await pg.click('[data-act="lnext"]');
  await pg.focus('[data-act="tok"][data-i="0"]'); await pg.keyboard.press('Tab'); await pg.keyboard.press('Tab'); await pg.keyboard.press('Space');
  ok('keyboard toggles token + keeps focus', await pg.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-i') === '2' && document.activeElement.getAttribute('aria-pressed') === 'true'));
  await pg.keyboard.press('Enter'); // toggles off
  const outline = await pg.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  ok('visible focus outline', outline !== 'none', outline);

  ok('no network requests', net.length === 0, net.join(', '));
  ok('no JS errors', errs.length === 0, errs.join(' | '));

  // Mobile layout: no horizontal scroll on main screens
  const m = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1 }); const mp = await m.newPage(); mp.on('pageerror', e => errs.push(e.message));
  await mp.goto(FILE);
  const hs = async (name) => { const w = await mp.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); ok('mobile no h-scroll: ' + name, w[0] <= w[1], w.join(' vs ')); };
  await hs('home'); if (SHOTS) await mp.screenshot({ path: SHOTS + '/home-mobile.png', fullPage: true });
  await mp.click('[data-act="area"][data-a="verbs"]'); await hs('area');
  await mp.click('[data-act="learn"]'); await mp.click('[data-act="lesson"][data-l="D"]'); await mp.click('[data-act="lnext"]'); await hs('worked example'); if (SHOTS) await mp.screenshot({ path: SHOTS + '/verb-worked-mobile.png', fullPage: true });
  await mp.click('[data-act="lnext"]'); await mp.click('[data-act="lnext"]'); await mp.click('[data-act="tok"][data-i="1"]'); await mp.click('[data-act="check"]'); await hs('verb guided'); if (SHOTS) await mp.screenshot({ path: SHOTS + '/verb-guided-mobile.png', fullPage: true });
  await mp.click('[data-act="home"] >> nth=0'); await mp.click('[data-act="area"][data-a="reading"]'); await mp.click('[data-act="pick"][data-mode="practice"]'); await mp.click('[data-act="startStory"] >> nth=0'); await hs('reading'); if (SHOTS) await mp.screenshot({ path: SHOTS + '/reading-mobile.png', fullPage: true });
  await mp.click('[data-act="home"] >> nth=0'); await mp.click('[data-act="area"][data-a="adjectives"]'); await mp.click('[data-act="learn"]'); await mp.click('[data-act="lesson"][data-l="E"]'); await mp.click('[data-act="lnext"]'); await hs('adjective arrows'); if (SHOTS) await mp.screenshot({ path: SHOTS + '/adj-mobile.png', fullPage: true });
  await mp.click('[data-act="home"] >> nth=0'); await mp.click('[data-act="area"][data-a="vowels"]'); await mp.click('[data-act="pick"][data-mode="practice"]'); await mp.click('[data-act="startRound"][data-sk="teams"]'); await hs('vowels');
  await mp.click('[data-act="home"] >> nth=0'); await mp.click('[data-act="grown"] >> nth=0'); await hs('grown-up');
  await m.close();

  // Storage blocked
  const s1 = await b.newContext(); await s1.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError'); } }); });
  const sp = await s1.newPage(); const e1 = []; sp.on('pageerror', e => e1.push(e.message)); await sp.goto(FILE);
  ok('storage blocked: app works + notice', e1.length === 0 && (await sp.locator('.area-card').count()) === 6 && /not letting the app save/.test(await sp.textContent('#notice')));
  await sp.click('[data-act="area"][data-a="verbs"]'); await sp.click('[data-act="learn"]'); await sp.click('[data-act="lesson"][data-l="A"]'); await sp.click('[data-act="lnext"]');
  ok('storage blocked: lesson still runs', e1.length === 0 && (await sp.locator('.worked').count()) === 1);
  await s1.close();
  // Corrupted storage
  const s2 = await b.newContext(); await s2.addInitScript(() => { try { if (!sessionStorage.getItem('x')) { localStorage.setItem('chrissLearningClub.v1', '{not json'); sessionStorage.setItem('x', 1); } } catch (e) {} });
  const cp = await s2.newPage(); const e2 = []; cp.on('pageerror', e => e2.push(e.message)); await cp.goto(FILE);
  ok('corrupt storage: fresh start + notice', e2.length === 0 && (await cp.locator('.area-card').count()) === 6 && /could not be read/.test(await cp.textContent('#notice')));
  await s2.close();

  // Reduced motion
  const rm = await b.newContext({ reducedMotion: 'reduce' }); const rp = await rm.newPage(); await rp.goto(FILE);
  await rp.click('[data-act="area"][data-a="verbs"]'); await rp.click('[data-act="learn"]'); await rp.click('[data-act="lesson"][data-l="A"]'); for (let i = 0; i < 3; i++) await rp.click('[data-act="lnext"]');
  await rp.click('[data-act="tok"][data-i="2"]'); await rp.click('[data-act="check"]');
  ok('reduced motion disables animation', (await rp.evaluate(() => getComputedStyle(document.querySelector('.yay')).animationName)) === 'none');
  await rm.close();

  await b.close();
  console.log(results.join('\n'));
  const f = results.filter(r => r.startsWith('FAIL')).length; console.log(`\n${results.length - f} passed, ${f} failed`); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); console.log(results.join('\n')); process.exit(1); });
