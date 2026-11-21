// Data + grading checks. Run: node learning-club/test-data.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('file://' + path.resolve(__dirname, '../chriss-learning-club.html'));
  const r = await pg.evaluate(() => {
    const C = window.__CLC, out = { fails: [], counts: {}, verbs: [], ev: [] };
    const fail = m => out.fails.push(m);
    Object.keys(C.AREA_Q).forEach(a => out.counts[a] = C.AREA_Q[a].length);
    out.verbCount = VERB_BANK.length;
    const ids = new Set();
    Object.values(C.QBY).forEach(q => {
      if (ids.has(q.id)) fail('dup ' + q.id); ids.add(q.id);
      if ((!q.h && !q.cat) || !q.ex) fail('missing hint/explain ' + q.id);
      if (!SKILLS[q.area].some(s => s.id === q.sk)) fail('bad skill ' + q.id + ' ' + q.sk);
      if (q.kind === 'select') {
        if (!C.gradeOnly(q, { sel: q.ans.slice() })) fail('answer fails ' + q.id);
        if (C.gradeOnly(q, { sel: [] })) fail('empty passes ' + q.id);
        // every strict subset must fail
        if (q.ans.length > 1) for (let k = 0; k < q.ans.length; k++) { const s = q.ans.filter((_, j) => j !== k); if (C.gradeOnly(q, { sel: s })) fail('partial passes ' + q.id); }
        // any extra non-ignorable word must fail
        q.toks.forEach(t => { if (q.ans.indexOf(t.i) < 0 && !(q.mode === 'adj' && ['a','an','the','my','your','his','her','its','our','their'].includes(t.lw))) { if (C.gradeOnly(q, { sel: q.ans.concat([t.i]) })) fail('extra passes ' + q.id + ' ' + t.w); } });
        // feedback messages exist for wrong answers
        const ev = C.evaluate(q, q.ans.slice(0, 1).concat(q.toks.filter(t => q.ans.indexOf(t.i) < 0 && !(q.mode === 'adj' && ['a','an','the','my','your','his','her','its','our','their'].includes(t.lw))).slice(0, 1).map(t => t.i)));
        if (ev.correct || !ev.msgs.length) fail('no feedback ' + q.id);
        if (q.area === 'verbs') out.verbs.push(q.id + ' [' + q.sk + '] ' + q.toks.map(t => t.w).join(' ') + '  =>  ' + q.ans.map(i => q.toks[i].w).join(' '));
      }
      if (q.kind === 'mc') { if (!(q.a >= 0 && q.a < q.c.length)) fail('mc idx ' + q.id); if (new Set(q.c).size !== q.c.length) fail('dup choice ' + q.id); }
      if (q.kind === 'sort') { if (!q.items.every(it => it[1] >= 0 && it[1] < q.b.length)) fail('sort ' + q.id); }
      if (q.kind === 'ev') { q.ok.forEach(i => { if (!q.passage.sents[i]) fail('ev idx ' + q.id); }); out.ev.push(q.id + ': ' + q.q + '\n     -> ' + q.ok.map(i => q.passage.sents[i]).join(' | ')); }
    });
    // passage word counts and 4+ questions
    out.passages = PASSAGES.map(p => p.id + ' ' + p.type + ' ' + p.sents.join(' ').split(/\s+/).length + ' words, ' + p.qs.length + ' qs, ev:' + p.qs.filter(q => q.k === 'ev').length);
    // lesson questions build
    Object.keys(LESSONS).forEach(a => LESSONS[a].forEach(l => l.steps.forEach((st, i) => { if (st.q) { try { const q = C.lessonQ(a, l, i); if (q.kind === 'select' && !C.gradeOnly(q, { sel: q.ans })) fail('lesson ans ' + a + l.id + i); } catch (e) { fail('lesson build ' + a + l.id + i + ' ' + e.message); } } })));
    // specific required behaviors
    const Q = id => C.QBY[id];
    const idx = (q, w) => q.toks.findIndex(t => t.lw === w);
    const v25 = Q('v25'); // The boy was playing yesterday.
    out.wasOnly = C.evaluate(v25, [idx(v25, 'was')]).msgs.map(m => m.x);
    out.playingOnly = C.evaluate(v25, [idx(v25, 'playing')]).msgs.map(m => m.x);
    out.isAlone = C.gradeOnly(Q('v15'), { sel: [idx(Q('v15'), 'is')] });
    out.haveAlone = C.gradeOnly(Q('v20'), { sel: [idx(Q('v20'), 'have')] });
    const v55 = Q('v55');
    out.notIncluded = C.gradeOnly(v55, { sel: [idx(v55, 'is'), idx(v55, 'not'), idx(v55, 'sleeping')] });
    out.notMsg = C.evaluate(v55, [idx(v55, 'is'), idx(v55, 'not'), idx(v55, 'sleeping')]).msgs.map(m => m.x);
    const v56 = Q('v56');
    out.easily = C.gradeOnly(v56, { sel: [idx(v56, 'can'), idx(v56, 'catch')] });
    return out;
  });
  console.log('counts', r.counts, 'verb bank', r.verbCount);
  console.log(r.passages.join('\n'));
  console.log('\nVERBS:\n' + r.verbs.join('\n'));
  console.log('\nEVIDENCE:\n' + r.ev.join('\n'));
  console.log('\nwas only ->', r.wasOnly, '\nplaying only ->', r.playingOnly);
  console.log('is alone passes', r.isAlone, '| have alone passes', r.haveAlone, '| team incl. not passes', r.notIncluded, '| can..catch passes', r.easily);
  console.log('not msg', r.notMsg);
  console.log('\nFAILS:', r.fails.length ? r.fails : 'none', '\nJS ERRORS:', errs.length ? errs : 'none');
  await b.close();
  process.exit(r.fails.length || errs.length || r.verbCount !== 59 || !r.isAlone || !r.haveAlone || r.notIncluded || !r.easily ? 1 : 0);
})();
