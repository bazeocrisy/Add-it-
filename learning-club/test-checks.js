// Verifies Check My Skills banks are separate, unseen in lessons/practice, leak-free, and recorded correctly.
// Run: node learning-club/test-checks.js
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../chriss-learning-club.html');
const R = []; const ok = (n, c, i) => R.push((c ? 'PASS ' : 'FAIL ') + n + (i !== undefined ? '  (' + i + ')' : ''));
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 1100, height: 900 } })).newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(FILE);
  const d = await pg.evaluate(() => {
    const C = window.__CLC, out = {};
    const norm = s => String(s).replace(/[\[\]]|@\w+|:\w+/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
    const STOP = new Set('the a an my our your his her their to of in on at for and with by is was are were has have had will can it we i'.split(' '));
    const NAMES = new Set('chris maya jamal mia jada marcus lena sam ella ben dad mom grandma grandpa keisha andre jasmine rosa tasha rex biscuit'.split(' '));
    const ws = s => new Set(s.split(' ').filter(w => w && !STOP.has(w) && !NAMES.has(w)));
    const jac = (a, b) => { const A = ws(a), B = ws(b); const i = [...A].filter(x => B.has(x)).length; return i / (new Set([...A, ...B]).size || 1); };
    // everything a child can see outside checks: lessons, practice banks, mastery
    const seenSent = [], seenQ = [], seenChoices = [], seenSort = [];
    const raw = id => { for (const bank of [VERB_BANK, VERB_MULTI_PRACTICE, NOUN_BANK, ADJ_BANK, ADV_BANK, VOWEL_BANK, HELPER_MC, VERB_MASTERY]) { const r = bank.find(x => x.id === id); if (r) return r; } return null; };
    [VERB_BANK, VERB_MULTI_PRACTICE, NOUN_BANK, ADJ_BANK, ADV_BANK, VOWEL_BANK, HELPER_MC, VERB_MASTERY].forEach(bank => bank.forEach(r => { if (r.s) seenSent.push(norm(r.s)); if (r.q) seenQ.push(norm(r.q)); if (r.c) seenChoices.push(r.c.map(norm).sort().join('|')); if (r.items) seenSort.push(r.items.map(x => x[0]).sort().join('|')); }));
    Object.keys(LESSONS).forEach(a => LESSONS[a].forEach(l => l.steps.forEach(st => { if (st.s) seenSent.push(norm(st.s)); (st.items || []).forEach(it => seenSent.push(norm(it.s))); if (st.q) { if (st.q.s) seenSent.push(norm(st.q.s)); if (st.q.q) seenQ.push(norm(st.q.q)); if (st.q.c) seenChoices.push(st.q.c.map(norm).sort().join('|')); } if (st.mini) st.mini.forEach(m => seenSent.push(norm(m))); })));
    const practiceStorySents = new Set(PASSAGES.flatMap(p => p.sents.map(norm)));
    PASSAGES.forEach(p => p.qs.forEach(q => { seenQ.push(norm(q.q)); if (q.c) seenChoices.push(q.c.map(norm).sort().join('|')); }));
    out.counts = {}; out.inPractice = []; out.exact = []; out.near = { j: 0 }; out.mcDup = [];
    const checkRaw = {}; [NOUN_CHECK, ADJ_CHECK, ADV_CHECK, VOWEL_CHECK, VERB_CHECK, HELPER_CHECK].forEach(bk => bk.forEach(r => checkRaw[r.id] = r));
    Object.keys(C.CHECK_Q).forEach(a => {
      out.counts[a] = C.CHECK_Q[a].length;
      C.CHECK_Q[a].forEach(q => {
        if ((C.AREA_Q[a] || []).some(x => x.id === q.id)) out.inPractice.push(q.id);
        const r = checkRaw[q.id];
        if (r && r.s) { const n = norm(r.s); if (seenSent.includes(n)) out.exact.push(q.id); seenSent.forEach(o => { const j = jac(n, o); if (j > out.near.j) out.near = { j: +j.toFixed(2), check: n, other: o }; }); }
        if (r && r.q) { if (seenQ.includes(norm(r.q))) out.mcDup.push(q.id + ' question'); if (r.c && seenChoices.includes(r.c.map(norm).sort().join('|'))) out.mcDup.push(q.id + ' choices'); if (r.items && seenSort.includes(r.items.map(x => x[0]).sort().join('|'))) out.mcDup.push(q.id + ' sort words'); }
        if (q.passage && q.kind === 'mc' && seenChoices.includes(q.c.map(norm).sort().join('|'))) out.mcDup.push(q.id + ' reading choices');
      });
    });
    out.storyOverlap = CHECK_PASSAGES.flatMap(p => p.sents.map(norm)).filter(s => practiceStorySents.has(s)).length;
    out.storyInPractice = PASSAGES.some(p => CHECK_PASSAGES.some(c => c.id === p.id || c.title === p.title));
    out.words = CHECK_PASSAGES.map(p => p.title + ': ' + p.sents.join(' ').split(/\s+/).length + ' words');
    return out;
  });
  ok('bank sizes: verbs 22, nouns/adj/adv/vowels/reading 10', JSON.stringify(d.counts) === JSON.stringify({ verbs: 22, nouns: 10, adjectives: 10, adverbs: 10, vowels: 10, reading: 10 }), JSON.stringify(d.counts));
  ok('no check item is in a practice pool', d.inPractice.length === 0, d.inPractice.join(','));
  ok('no check sentence repeats a lesson/practice/mastery sentence', d.exact.length === 0, d.exact.join(','));
  ok('no near-duplicate check sentences (word overlap < 0.5, names ignored)', d.near.j < 0.5, JSON.stringify(d.near));
  ok('no check MC/sort question reuses a practice question, choice set, or word set', d.mcDup.length === 0, d.mcDup.join(','));
  ok('reading check stories are new and not in practice', d.storyOverlap === 0 && !d.storyInPractice, d.words.join('; '));

  // practice/guided never serve check passages
  for (const mode of ['guided', 'practice']) {
    await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="area"][data-a="reading"]'); await pg.click(`[data-act="pick"][data-mode="${mode}"]`);
    const stories = await pg.locator('[data-act="startStory"]').evaluateAll(els => els.map(e => e.getAttribute('data-p')));
    ok(`reading ${mode}: story list has no check passages`, stories.every(p => /^p\d$/.test(p)), [...new Set(stories)].join(','));
    for (const sk of ['main', 'detail', 'sequence', 'inference', 'vocab', 'evidence']) {
      await pg.click(`[data-act="startRound"][data-sk="${sk}"]`);
      const ids = await pg.evaluate(() => window.__CLC.view().ids);
      if (ids.some(id => id.startsWith('cp'))) ok(`reading ${mode} ${sk} round avoids check questions`, false, ids.join(','));
      await pg.click('[data-act="quitRound"]'); await pg.click(`[data-act="pick"][data-mode="${mode}"]`);
    }
  }
  ok('reading guided/practice skill rounds never use check questions', true);

  const leakSel = '.badge, .msg, .hint, .coach, .tok-label, [data-act="check"], [data-act="hint"], [data-act="showme"], .m-ok, .m-no, .links-list';
  for (const a of ['verbs', 'nouns', 'adjectives', 'adverbs', 'vowels', 'reading']) {
    for (const n of [10, 5]) {
      await pg.click('[data-act="home"] >> nth=0'); await pg.click(`[data-act="area"][data-a="${a}"]`); await pg.click('[data-act="testSetup"]'); await pg.click(`[data-act="startTest"][data-n="${n}"]`);
      const info = await pg.evaluate(a => { const v = window.__CLC.view(); const bank = new Set(window.__CLC.CHECK_Q[a].map(q => q.id)); return { ids: v.ids, all: v.ids.every(id => bank.has(id)) }; }, a);
      ok(`${a} ${n}-question check draws only from its own bank`, info.all && info.ids.length === n, info.ids.join(','));
      let leaks = 0; const wrongAt = 0;
      for (let i = 0; i < info.ids.length; i++) {
        const k = await pg.evaluate(() => { const q = window.__CLC.view().qs.q; return { kind: q.kind, ans: q.ans, a: q.a, c: q.c ? q.c.length : 0, ok: q.ok, items: q.items, toks: q.toks ? q.toks.length : 0 }; });
        const wrong = i === wrongAt;
        if (k.kind === 'select') { if (wrong) { const e = await pg.evaluate(ans => [...document.querySelectorAll('button[data-act="tok"]')].map(b => +b.dataset.i).find(x => !ans.includes(x)), k.ans); for (const x of k.ans) await pg.click(`[data-act="tok"][data-i="${x}"]`); await pg.click(`[data-act="tok"][data-i="${e}"]`); } else for (const x of k.ans) await pg.click(`[data-act="tok"][data-i="${x}"]`); }
        if (k.kind === 'mc') await pg.click(`[data-act="choice"][data-i="${wrong ? (k.a + 1) % k.c : k.a}"]`);
        if (k.kind === 'sort') for (let j = 0; j < k.items.length; j++) await pg.click(`[data-act="sort"][data-i="${j}"][data-b="${wrong && j === 0 ? 1 - k.items[j][1] : k.items[j][1]}"]`);
        if (k.kind === 'ev') { let p = k.ok[0]; if (wrong) { p = 0; while (k.ok.includes(p)) p++; } await pg.click(`[data-act="ev"][data-i="${p}"]`); }
        leaks += await pg.locator(leakSel).count();
        await pg.click(i < info.ids.length - 1 ? '[data-act="tnext"]' : '[data-act="treview"]');
      }
      ok(`${a} ${n}: no hints, feedback, or explanations before submission`, leaks === 0, leaks);
      const before = await pg.evaluate(a => { const P = window.__CLC.P(); const o = {}; SKILLS[a].forEach(s => { const r = P.skills[a + '.' + s.id]; o[s.id] = r ? [r.chkRight, r.chkTotal] : [0, 0]; }); return { o, nChecks: P.checks.length }; }, a);
      await pg.click('[data-act="submitTest"]');
      const res = await pg.evaluate(([a, before, ids]) => {
        const P = window.__CLC.P(), v = window.__CLC.view(), last = P.checks[P.checks.length - 1];
        const exp = {}; ids.forEach((id, i) => { const sk = window.__CLC.QBY[id].sk; exp[sk] = exp[sk] || [0, 0]; exp[sk][1]++; if (i !== 0) exp[sk][0]++; });
        let skillOK = true; Object.keys(exp).forEach(sk => { const r = P.skills[a + '.' + sk]; if (!r || r.chkRight - before.o[sk][0] !== exp[sk][0] || r.chkTotal - before.o[sk][1] !== exp[sk][1]) skillOK = false; });
        return { score: v.score, logged: P.checks.length === before.nChecks + 1 && last.a === a && last.n === ids.length && last.score === ids.length - 1, repeat: last.repeat, skillOK, missedSkill: last.missed };
      }, [a, before, info.ids]);
      ok(`${a} ${n}: scored and logged correctly (1 wrong)`, res.score === n - 1 && res.logged && res.skillOK, JSON.stringify(res));
      ok(`${a} ${n}: repeat questions ${n === 5 ? 'flagged' : 'none on first check'}`, n === 10 ? res.repeat === 0 || a === 'verbs' : res.repeat > 0 || a === 'verbs', 'repeat=' + res.repeat);
      ok(`${a} ${n}: explanation shown after submission`, (await pg.locator('.review .msg.info').count()) === 1);
    }
  }
  await pg.click('[data-act="home"] >> nth=0'); await pg.click('[data-act="grown"] >> nth=0');
  ok('grown-up history labels repeated questions', /repeated question/.test(await pg.textContent('#app')));
  // ---------- exposure tracking (fresh browser profile) ----------
  const ctx2 = await b.newContext(); const p2 = await ctx2.newPage(); p2.on('pageerror', e => errs.push(e.message)); await p2.goto(FILE);
  const runCheck = async (a, n, quitAfter) => {
    await p2.click('[data-act="home"] >> nth=0'); await p2.click(`[data-act="area"][data-a="${a}"]`); await p2.click('[data-act="testSetup"]');
    const left = (await p2.textContent('.card')).match(/(\d+) of (\d+) check/);
    await p2.click(`[data-act="startTest"][data-n="${n}"]`);
    const ids = await p2.evaluate(() => window.__CLC.view().ids);
    if (quitAfter) { for (let i = 1; i < quitAfter; i++) await p2.click('[data-act="tnext"]'); await p2.click('[data-act="quitTest"]'); return { ids, left: left && left[1] }; }
    for (let i = 0; i < ids.length - 1; i++) await p2.click('[data-act="tnext"]');
    await p2.click('[data-act="treview"]'); await p2.click('[data-act="submitTest"]');
    const last = await p2.evaluate(() => { const P = window.__CLC.P(); return P.checks[P.checks.length - 1]; });
    return { ids, last, note: (await p2.textContent('.exposure')).trim(), left: left && left[1] };
  };
  const n1 = await runCheck('nouns', 5), n2 = await runCheck('nouns', 5), n3 = await runCheck('nouns', 5);
  ok('nouns: 2nd five-question check uses the 5 unused questions', n2.ids.every(id => !n1.ids.includes(id)) && n2.last.unseen === true && n2.last.repeat === 0, n2.ids.join(','));
  ok('nouns: both first checks labeled unseen', n1.last.unseen && /unseen check/.test(n1.note) && /unseen check/.test(n2.note));
  ok('nouns: 3rd check repeats and is labeled', n3.last.repeat === 5 && !n3.last.unseen && /5 of 5 questions were seen/.test(n3.note) && n3.left === '0', n3.note + ' | left before=' + n3.left);
  const a1 = await runCheck('adjectives', 5, 3); // looks at 3 questions then quits
  const a2 = await runCheck('adjectives', 10);
  const shownA1 = a1.ids.slice(0, 3);
  ok('quit check: questions actually shown count as seen', a2.last.repeat === 3 && a2.left === '7', 'repeat=' + a2.last.repeat + ' left=' + a2.left);
  ok('quit check: unshown questions still count as new', a1.ids.slice(3).every(id => a2.ids.includes(id)) && shownA1.every(id => a2.ids.includes(id)));
  const r1 = await runCheck('reading', 5), r2 = await runCheck('reading', 5), r3 = await runCheck('reading', 5);
  ok('reading: 2nd check uses the other unseen story', r1.ids[0].slice(0, 3) !== r2.ids[0].slice(0, 3) && r2.last.unseen, r1.ids[0] + ' then ' + r2.ids[0]);
  ok('reading: 3rd check flags story seen before', r3.last.passRepeat === 1 && !r3.last.unseen && /story was read in an earlier check/.test(r3.note), r3.note);
  // reading: questions new but passage seen -> not unseen. Simulate: mark passage seen only.
  await p2.evaluate(() => { const P = window.__CLC.P(); P.stats.seen_q = {}; P.stats.seen_p = { cp1: 1, cp2: 1 }; });
  const r4 = await runCheck('reading', 5);
  ok('reading: new questions about a seen story are NOT labeled unseen', r4.last.repeat === 0 && r4.last.passRepeat === 1 && !r4.last.unseen, JSON.stringify(r4.last));
  // mastery exposure
  await p2.click('[data-act="home"] >> nth=0'); await p2.click('[data-act="area"][data-a="verbs"]'); await p2.click('[data-act="masteryIntro"]'); await p2.click('[data-act="mStart"]');
  ok('mastery first attempt prior=0', await p2.evaluate(() => window.__CLC.P().mastery.prior === 0));
  await p2.click('[data-act="mNext"]'); await p2.click('[data-act="mNext"]');
  await p2.click('[data-act="mPause"]'); await p2.click('[data-act="area"][data-a="verbs"]'); await p2.click('[data-act="masteryIntro"]'); await p2.click('[data-act="mRestartAsk"]'); await p2.click('[data-act="mRestart"]');
  ok('mastery restart counts sentences already shown', await p2.evaluate(() => window.__CLC.P().mastery.prior === 3), await p2.evaluate(() => window.__CLC.P().mastery.prior));
  await p2.click('[data-act="mPause"]'); await p2.click('[data-act="grown"] >> nth=0');
  ok('grown-up history shows unseen/repeat tags', /unseen/.test(await p2.textContent('#app')) && /repeated question/.test(await p2.textContent('#app')) && /story seen before/.test(await p2.textContent('#app')));
  // adjective convention: articles/possessives not tappable
  await p2.click('[data-act="home"] >> nth=0'); await p2.click('[data-act="area"][data-a="adjectives"]'); await p2.click('[data-act="pick"][data-mode="practice"]'); await p2.click('[data-act="startRound"][data-sk=""]');
  const adj = await p2.evaluate(() => { const q = window.__CLC.view().qs.q; const ign = q.toks.filter(t => ['a','an','the','my','our','her','his','your','their','its'].includes(t.lw) && !q.ans.includes(t.i)); return { ign: ign.map(t => t.i), btns: ign.filter(t => document.querySelector(`button[data-act="tok"][data-i="${t.i}"]`)).length, legend: document.querySelector('.legend').textContent }; });
  ok('adjectives: the/a/my are not tappable and the rule is explained', adj.btns === 0 && /cannot be tapped/.test(adj.legend), 'non-tappable: ' + adj.ign.length);
  await ctx2.close();

  ok('no JS errors', errs.length === 0, errs.join('|'));
  await b.close();
  console.log(R.join('\n')); const f = R.filter(x => x.startsWith('FAIL')).length; console.log(`\n${R.length - f} passed, ${f} failed`); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); console.log(R.join('\n')); process.exit(1); });
