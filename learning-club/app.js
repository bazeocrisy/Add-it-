/* Chris's Learning Club — app logic. No network, no accounts, no tracking. */
(function () {
  'use strict';
  var D = document;
  var PIC_ALT = {
    home: 'Chris, a smiling Black boy in a teal number 21 jersey, holding a bat and a book',
    verbs: 'Chris swinging a bat at a baseball',
    nouns: 'Chris and his coach standing on the baseball field',
    adjectives: 'A big red ball, a small red ball, and a yellow ball',
    adverbs: 'Chris running quickly toward a base',
    vowels: 'A baseball cap and a superhero cape',
    reading: 'Three teammates throwing and catching on the baseball field'
  };
  function pic(k, cls) { var src = (typeof IMAGES !== 'undefined') && IMAGES[k]; return src ? '<img class="pic ' + (cls || '') + '" src="' + src + '" alt="' + esc(PIC_ALT[k] || '') + '">' : ''; }
  var HOSTED = !!window.__CLC_HOSTED; // claude.ai hosted copy: printing and downloads are blocked there
  var app = D.getElementById('app');

  /* ───────────── small helpers ───────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function areaById(id) { for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i]; return null; }
  function skillById(a, sk) { var l = SKILLS[a] || []; for (var i = 0; i < l.length; i++) if (l[i].id === sk) return l[i]; return null; }
  function lessonById(a, id) { var l = LESSONS[a] || []; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function lessonForSkill(a, sk) { var s = skillById(a, sk); return s ? lessonById(a, s.lesson) : null; }
  var PRAISE = ['Great job!', 'You got it!', 'Home run!', 'Nice work!', 'Way to go!', 'Strong thinking!'];
  function praise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

  /* ───────────── sentence parsing (token positions are the answer key) ───────────── */
  var TOK_RE = /^([“"‘(]*)(\[?)([A-Za-z][A-Za-z'’]*)(?:@([A-Za-z]+))?(?::([A-Za-z]+))?(\]?)([.,!?;:”"’)]*)$/;
  function parseSentence(s) {
    return s.trim().split(/\s+/).map(function (raw, i) {
      var m = raw.match(TOK_RE);
      if (!m || (m[2] === '[') !== (m[6] === ']')) throw new Error('Bad token "' + raw + '" in: ' + s);
      return { i: i, pre: m[1], w: m[3], lw: m[3].toLowerCase(), ans: m[2] === '[', target: m[4] ? m[4].toLowerCase() : null, tags: m[5] || '', post: m[7], to: -1 };
    });
  }
  function nearest(toks, i, word) {
    var best = -1, bd = 1e9;
    toks.forEach(function (t) { if (t.i !== i && t.lw === word && Math.abs(t.i - i) < bd) { bd = Math.abs(t.i - i); best = t.i; } });
    return best;
  }
  function wantMatch(mode, want, t) {
    if (!want) return true;
    if (mode === 'noun') {
      if (want === 'P') return t.tags.indexOf('P') >= 0;
      if (want === 'c') return t.tags.indexOf('P') < 0;
      return t.tags.indexOf(want) >= 0;
    }
    if (mode === 'adv') return t.tags === want;
    return true;
  }
  function lowerKeys(o) { var r = {}; if (o) Object.keys(o).forEach(function (k) { r[k.toLowerCase()] = o[k]; }); return r; }
  function mkSelect(raw, area, mode, id) {
    var toks = parseSentence(raw.s);
    toks.forEach(function (t) { if (t.target) { t.to = nearest(toks, t.i, t.target); if (t.to < 0) throw new Error('No target "' + t.target + '" in ' + raw.s); } });
    var marked = toks.filter(function (t) { return t.ans; }).map(function (t) { return t.i; });
    var ans = marked.filter(function (i) { return wantMatch(mode, raw.want, toks[i]); });
    if (!ans.length) throw new Error('No answer in ' + raw.s);
    var teams = [];
    if (mode === 'verb') { var tmap = {}, order = []; ans.forEach(function (i) { var k = toks[i].tags || 'x'; if (!tmap[k]) { tmap[k] = []; order.push(k); } tmap[k].push(i); }); teams = order.map(function (k) { return tmap[k]; }); }
    return { id: id || raw.id, area: area, sk: raw.sk, cat: raw.cat || null, kind: 'select', mode: mode, toks: toks, marked: marked, ans: ans, teams: teams, want: raw.want || null, ask: raw.ask || null, h: raw.h || '', ex: raw.ex, notes: lowerKeys(raw.notes), labels: lowerKeys(raw.labels) };
  }
  function mkMC(raw, area, id) {
    return { id: id || raw.id, area: area, sk: raw.sk, kind: 'mc', q: raw.q, c: raw.c, a: raw.a, h: raw.h, ex: raw.ex, why: raw.why || [], say: !!raw.say };
  }
  function mkSort(raw, area) { return { id: raw.id, area: area, sk: raw.sk, kind: 'sort', q: raw.q, b: raw.b, items: raw.items, h: raw.h, ex: raw.ex }; }
  function mkReading(raw, p, id) {
    var base = { id: id || raw.id, area: 'reading', sk: raw.sk, passage: p, h: raw.h, ex: raw.ex };
    if (raw.k === 'ev' || raw.ok) { base.kind = 'ev'; base.q = raw.q; base.ok = raw.ok; return base; }
    base.kind = 'mc'; base.q = raw.q; base.c = raw.c; base.a = raw.a; base.why = raw.why || []; return base;
  }

  /* Build all question banks */
  var QBY = {}, AREA_Q = {};
  function addQ(q) { QBY[q.id] = q; (AREA_Q[q.area] = AREA_Q[q.area] || []).push(q); }
  VERB_BANK.forEach(function (r) { addQ(mkSelect(r, 'verbs', 'verb')); });
  HELPER_MC.forEach(function (r) { addQ(mkMC(r, 'verbs')); });
  NOUN_BANK.forEach(function (r) { addQ(mkSelect(r, 'nouns', 'noun')); });
  ADJ_BANK.forEach(function (r) { addQ(mkSelect(r, 'adjectives', 'adj')); });
  ADV_BANK.forEach(function (r) { addQ(r.k === 'mc' ? mkMC(r, 'adverbs') : mkSelect(r, 'adverbs', 'adv')); });
  VOWEL_BANK.forEach(function (r) { addQ(r.k === 'sort' ? mkSort(r, 'vowels') : mkMC(r, 'vowels')); });
  VERB_MULTI_PRACTICE.forEach(function (r) { addQ(mkSelect(r, 'verbs', 'verb')); });
  /* Check My Skills items live in their own bank (verbs), never mixed into practice */
  var CHECK_Q = {};
  function addCheck(q) { QBY[q.id] = q; (CHECK_Q[q.area] = CHECK_Q[q.area] || []).push(q); }
  VERB_CHECK.forEach(function (r) { addCheck(mkSelect(r, 'verbs', 'verb')); });
  HELPER_CHECK.forEach(function (r) { addCheck(mkMC(r, 'verbs')); });
  NOUN_CHECK.forEach(function (r) { addCheck(mkSelect(r, 'nouns', 'noun')); });
  ADJ_CHECK.forEach(function (r) { addCheck(mkSelect(r, 'adjectives', 'adj')); });
  ADV_CHECK.forEach(function (r) { addCheck(r.k === 'mc' ? mkMC(r, 'adverbs') : mkSelect(r, 'adverbs', 'adv')); });
  VOWEL_CHECK.forEach(function (r) { addCheck(r.k === 'sort' ? mkSort(r, 'vowels') : mkMC(r, 'vowels')); });
  CHECK_PASSAGES.forEach(function (p) {
    p.sents = []; p.paraOf = [];
    p.paras.forEach(function (para, pi) { para.forEach(function (s) { p.sents.push(s); p.paraOf.push(pi); }); });
    p.qs.forEach(function (r) { addCheck(mkReading(r, p)); });
  });
  /* Mastery challenge: 59 sentences used ONLY in the final assessment */
  var MASTERY_Q = VERB_MASTERY.map(function (r) {
    var cat = MASTERY_CATS.filter(function (c) { return c.id === r.cat; })[0];
    var q = mkSelect({ id: r.id, s: r.s, sk: cat.skill, cat: r.cat, ex: r.ex }, 'verbs', 'verb'); QBY[q.id] = q; return q;
  });
  var MASTERY_IDS = MASTERY_Q.map(function (q) { return q.id; });
  var PBY = {};
  PASSAGES.forEach(function (p) {
    var n = 0; p.sents = []; p.paraOf = [];
    p.paras.forEach(function (para, pi) { para.forEach(function (s) { p.sents.push(s); p.paraOf.push(pi); n++; }); });
    PBY[p.id] = p;
    p.qs.forEach(function (r) { addQ(mkReading(r, p)); });
  });

  /* Lesson questions are built on demand (ids are stable: L:area:lesson:step) */
  var LQ = {};
  function lessonQ(a, l, si) {
    var key = 'L:' + a + ':' + l.id + ':' + si;
    if (LQ[key]) return LQ[key];
    var st = l.steps[si], raw = st.q, q;
    if (st.t === 'reading') {
      var mini = { id: key + 'p', title: '', paras: [st.mini], sents: st.mini.slice(), paraOf: st.mini.map(function () { return 0; }) };
      q = mkReading({ sk: l.skill, q: raw.q, c: raw.c, a: raw.a, ok: raw.ok, h: raw.h, ex: raw.ex, why: raw.why }, mini, key);
    } else if (raw.mode) {
      q = mkSelect({ s: raw.s, sk: l.skill, want: raw.want, ask: raw.ask, h: raw.h, ex: raw.ex, notes: raw.notes }, a, raw.mode, key);
    } else {
      q = mkMC({ sk: l.skill, q: raw.q, c: raw.c, a: raw.a, h: raw.h, ex: raw.ex, why: raw.why, say: raw.say }, a, key);
    }
    LQ[key] = q; return q;
  }
  function showQ(st, a) { var m = { s: st.s, sk: '', labels: st.labels }; return mkSelect(m, a, st.mode, 'show'); }

  /* ───────────── speech (optional, never required) ───────────── */
  var canSpeak = false;
  try { canSpeak = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'; } catch (e) { canSpeak = false; }
  function speak(text) {
    if (!canSpeak) return;
    try { window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.rate = 0.85; window.speechSynthesis.speak(u); } catch (e) { /* ignore */ }
  }
  function sayBtn(text, label) {
    if (!canSpeak) return '';
    return '<button type="button" class="say" data-act="say" data-text="' + esc(text) + '" aria-label="' + esc(label || 'Read aloud') + '"><span aria-hidden="true">🔊</span> ' + esc(label || 'Read to me') + '</button>';
  }

  /* ───────────── progress storage ───────────── */
  var KEY = 'chrissLearningClub.v1';
  var storageOK = true, storageNote = '', noticeDismissed = false;
  function defP() { return { v: 1, nick: 'Player', lessons: {}, stats: {}, skills: {}, checks: [], resume: null, serve: 0, mastery: null, masteryResults: [] }; }
  function loadP() {
    var ls;
    try { ls = window.localStorage; var t = '__clc_test'; ls.setItem(t, '1'); ls.removeItem(t); }
    catch (e) { storageOK = false; storageNote = 'This browser is not letting the app save progress right now (private mode or blocked storage). Learning still works, but progress will be lost when the page closes.'; return defP(); }
    var raw;
    try { raw = ls.getItem(KEY); } catch (e) { storageOK = false; return defP(); }
    if (!raw) return defP();
    try {
      var d = JSON.parse(raw), p = defP();
      if (!d || typeof d !== 'object') throw new Error('bad');
      if (typeof d.nick === 'string' && d.nick.trim()) p.nick = d.nick.slice(0, 20);
      ['lessons', 'stats', 'skills'].forEach(function (k) { if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) p[k] = d[k]; });
      if (Array.isArray(d.checks)) p.checks = d.checks.slice(-50);
      if (d.resume && typeof d.resume === 'object') p.resume = d.resume;
      if (typeof d.serve === 'number') p.serve = d.serve;
      if (d.mastery && typeof d.mastery === 'object') p.mastery = d.mastery;
      if (Array.isArray(d.masteryResults)) p.masteryResults = d.masteryResults.slice(-10);
      if (d.daily && typeof d.daily === 'object') p.daily = d.daily;
      return p;
    } catch (e) {
      storageNote = 'Saved progress could not be read, so the app started fresh. Old progress was not used.';
      return defP();
    }
  }
  var P = loadP();
  function saveP() {
    if (!storageOK) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(P)); }
    catch (e) { storageOK = false; storageNote = 'Progress could not be saved (storage is full or blocked). Learning still works, but progress may not be kept.'; }
  }

  function lessonDone(a, id) { return !!P.lessons[a + ':' + id]; }
  function skillRec(a, sk) { var k = a + '.' + sk; if (!P.skills[k]) P.skills[k] = { hist: [], ind: 0, help: 0, rev: 0, chkRight: 0, chkTotal: 0, lastChk: null }; return P.skills[k]; }
  function record(q, outcome) {
    var s = P.stats[q.id] || (P.stats[q.id] = { n: 0, ind: 0, help: 0, rev: 0, last: 0 });
    s.n++; s[outcome]++;
    if (s.n === 1) s.first = outcome;
    var r = skillRec(q.area, q.sk);
    r[outcome]++; r.hist.push(outcome); if (r.hist.length > 12) r.hist = r.hist.slice(-12);
    saveP();
  }
  function skillStatus(a, sk) {
    var r = P.skills[a + '.' + sk];
    if (!r || (!r.hist.length && !r.chkTotal)) return { key: 'none', label: 'Not started' };
    if (r.lastChk && r.lastChk.right < r.lastChk.total) return { key: 'review', label: 'Needs review' };
    var recent = r.hist.slice(-8), ind = recent.filter(function (x) { return x === 'ind'; }).length;
    if (recent.length >= 3 && ind / recent.length < 0.5) return { key: 'review', label: 'Needs review' };
    if (ind >= 5 && ind / recent.length >= 0.8) return { key: 'strong', label: 'Getting strong' };
    return { key: 'practicing', label: 'Practicing' };
  }
  function nextSkill() {
    var i, a, list, j;
    for (i = 0; i < AREAS.length; i++) { a = AREAS[i].id; list = SKILLS[a]; for (j = 0; j < list.length; j++) if (skillStatus(a, list[j].id).key === 'review') return { a: a, sk: list[j], why: 'needs review' }; }
    for (i = 0; i < AREAS.length; i++) { a = AREAS[i].id; list = SKILLS[a]; for (j = 0; j < list.length; j++) if (!list[j].optional && !lessonDone(a, list[j].lesson)) return { a: a, sk: list[j], why: 'lesson not done yet' }; }
    var best = null, bn = 1e9;
    AREAS.forEach(function (ar) { SKILLS[ar.id].forEach(function (s) { if (s.optional) return; var r = P.skills[ar.id + '.' + s.id]; var n = r ? r.hist.length : 0; if (skillStatus(ar.id, s.id).key !== 'strong' && n < bn) { bn = n; best = { a: ar.id, sk: s, why: 'more practice will help' }; } }); });
    return best;
  }

  /* ───────────── question pools & rotation ───────────── */
  function bankFor(a) { return (AREA_Q[a] || []).slice(); }
  function poolFor(a, sk) {
    var all = bankFor(a);
    if (sk) return all.filter(function (q) { return q.sk === sk; });
    var core = SKILLS[a].filter(function (s) { return !s.optional; });
    var done = core.filter(function (s) { return lessonDone(a, s.lesson); });
    var use = done.length ? done : core.slice(0, 2);
    return all.filter(function (q) { return use.some(function (s) { return s.id === q.sk; }); });
  }
  function pickRotating(list, n) {
    var withKey = shuffle(list).map(function (q) { var s = P.stats[q.id]; return { q: q, k: s && s.last ? s.last : 0 }; });
    withKey.sort(function (x, y) { return x.k - y.k; });
    var chosen = withKey.slice(0, n).map(function (x) { return x.q; });
    chosen.forEach(function (q) { P.serve++; var s = P.stats[q.id] || (P.stats[q.id] = { n: 0, ind: 0, help: 0, rev: 0, last: 0 }); s.last = P.serve; });
    saveP();
    return shuffle(chosen);
  }
  function storyOrder() {
    return PASSAGES.slice().sort(function (x, y) {
      var lx = (P.stats['story:' + x.id] || {}).last || 0, ly = (P.stats['story:' + y.id] || {}).last || 0; return lx - ly;
    });
  }
  function markStory(pid) { P.serve++; var s = P.stats['story:' + pid] || (P.stats['story:' + pid] = { n: 0, last: 0 }); s.last = P.serve; s.n++; saveP(); }
  /* Exposure: a check question, check passage, or mastery sentence counts as seen once it is SHOWN. */
  function expo(kind) { var k = 'seen_' + kind; return P.stats[k] || (P.stats[k] = {}); }
  function markShown() {
    var changed = false, id;
    if (view.v === 'test' && view.qs) {
      id = view.qs.q.id; if (!expo('q')[id]) { expo('q')[id] = 1; changed = true; }
      var p = view.qs.q.passage; if (p && !expo('p')[p.id]) { expo('p')[p.id] = 1; changed = true; }
    }
    if (view.v === 'mastery' && view.qs) { id = view.qs.q.id; if (!expo('m')[id]) { expo('m')[id] = 1; changed = true; } }
    if (changed) saveP();
  }
  function testPick(a, n) {
    var core = SKILLS[a].filter(function (s) { return !s.optional || (s.id === 'long' && lessonDone(a, 'E')); });
    var src = CHECK_Q[a] || bankFor(a), seen = expo('q');
    var inCore = src.filter(function (q) { return core.some(function (s) { return s.id === q.sk; }); });
    var out = [];
    // pass 1: unseen questions, spread across skills; pass 2: fill with already-seen questions
    [false, true].forEach(function (wantSeen) {
      var bySk = core.map(function (s) { return shuffle(inCore.filter(function (q) { return q.sk === s.id && !!seen[q.id] === wantSeen && out.indexOf(q) < 0; })); }).filter(function (l) { return l.length; });
      var i = 0;
      while (out.length < n && bySk.some(function (l) { return l.length; })) { var l = bySk[i % bySk.length]; if (l.length) out.push(l.pop()); i++; }
    });
    return shuffle(out).map(function (q) { return q.id; });
  }
  function newLeft(a) {
    if (a === 'reading') return { n: CHECK_PASSAGES.filter(function (p) { return !expo('p')[p.id]; }).length, of: CHECK_PASSAGES.length, unit: 'stories' };
    var src = CHECK_Q[a] || []; return { n: src.filter(function (q) { return !expo('q')[q.id]; }).length, of: src.length, unit: 'questions' };
  }

  /* ───────────── question state ───────────── */
  var IGNORE_ADJ = { a: 'article', an: 'article', the: 'article', my: 'whose', your: 'whose', his: 'whose', her: 'whose', its: 'whose', our: 'whose', their: 'whose' };
  var PRONOUNS = { i: 1, me: 1, you: 1, he: 1, she: 1, it: 1, we: 1, they: 1, him: 1, us: 1, them: 1 };
  var JOINERS = { and: 1, but: 1, so: 1, or: 1, while: 1, when: 1, because: 1 };
  var CAT = { p: 'person', l: 'place', t: 'thing', i: 'idea' };
  var CATQ = { p: 'Who?', l: 'Where?', t: 'What thing?', i: 'What feeling or idea?' };
  function nounCat(t) { var c = (t.tags || '').replace('P', '').charAt(0); return CAT[c] || 'thing'; }
  function isGuidedCtx(ctx) { return ctx === 'guided' || ctx === 'lguided'; }

  function newQS(q, ctx, saved) {
    var QS = { q: q, ctx: ctx, sel: [], choice: null, sort: {}, pick: null, fb: null, hint: isGuidedCtx(ctx) ? 1 : 0, tries: 0, done: false, revealed: false, phase: null, nounIdx: null };
    if (q.kind === 'select' && q.mode === 'adj' && isGuidedCtx(ctx)) {
      var tg = uniqueTargets(q); if (tg.length === 1) QS.phase = 'noun';
    }
    if (saved) {
      if (q.kind === 'select' && Array.isArray(saved.sel)) QS.sel = saved.sel.slice();
      if (q.kind === 'mc' && typeof saved.choice === 'number') QS.choice = saved.choice;
      if (q.kind === 'sort' && saved.sort) QS.sort = JSON.parse(JSON.stringify(saved.sort));
      if (q.kind === 'ev' && typeof saved.pick === 'number') QS.pick = saved.pick;
    }
    return QS;
  }
  function uniqueTargets(q) { var s = []; q.ans.forEach(function (i) { var t = q.toks[i].to; if (t >= 0 && s.indexOf(t) < 0) s.push(t); }); return s; }
  function answered(QS) {
    var q = QS.q;
    if (q.kind === 'select') return QS.sel.length > 0;
    if (q.kind === 'mc') return QS.choice !== null;
    if (q.kind === 'sort') return Object.keys(QS.sort).length === q.items.length;
    if (q.kind === 'ev') return QS.pick !== null;
    return false;
  }
  function saveAnswer(QS) {
    var q = QS.q;
    if (q.kind === 'select') return { sel: QS.sel.slice() };
    if (q.kind === 'mc') return { choice: QS.choice };
    if (q.kind === 'sort') return { sort: JSON.parse(JSON.stringify(QS.sort)) };
    if (q.kind === 'ev') return { pick: QS.pick };
  }

  /* Grade exactly: by token-index sets, chosen index, or sentence index */
  function gradeOnly(q, ans) {
    if (!ans) return false;
    if (q.kind === 'select') {
      var sel = (ans.sel || []).filter(function (i) { return !(q.mode === 'adj' && IGNORE_ADJ[q.toks[i].lw] && q.ans.indexOf(i) < 0); });
      if (sel.length !== q.ans.length) return false;
      return q.ans.every(function (i) { return sel.indexOf(i) >= 0; });
    }
    if (q.kind === 'mc') return ans.choice === q.a;
    if (q.kind === 'sort') return q.items.every(function (it, i) { return ans.sort && ans.sort[i] === it[1]; });
    if (q.kind === 'ev') return q.ok.indexOf(ans.pick) >= 0;
    return false;
  }

  function autoNote(q, t, phaseNoun) {
    var w = '“' + t.w + '”';
    if (q.notes[t.lw]) return q.notes[t.lw];
    if (phaseNoun) {
      if (q.ans.indexOf(t.i) >= 0) return w + ' is a describing word. First find the NOUN it describes.';
      return w + ' is not the noun we need. Look for a naming word: a person, place, or thing.';
    }
    if (q.mode === 'verb') {
      if (PRONOUNS[t.lw]) return w + ' is a pronoun. It tells who, not the action.';
      if (JOINERS[t.lw]) return w + ' joins parts of the sentence. It is not a verb.';
      if (IGNORE_ADJ[t.lw] === 'article') return w + ' is a little pointer word. It is not a verb.';
      return w + ' is not part of the verb here. Ask: does it show action, tell about being, or help the main verb?';
    }
    if (q.mode === 'noun') {
      if (t.ans) {
        if (q.want === 'P') return w + ' is a common noun. Look for a special name that starts with a capital letter.';
        if (q.want === 'c') return w + ' is a proper noun (a special name). Find the common noun.';
        return w + ' is a noun, but it names a ' + nounCat(t) + '. This question wants a ' + CAT[q.want] + '.';
      }
      if (PRONOUNS[t.lw]) return w + ' is a pronoun. It stands in for a noun, so we do not tap it here.';
      if (IGNORE_ADJ[t.lw] === 'article') return w + ' is a little pointer word. It points to a noun, but it is not one.';
      return w + ' is not a noun. Ask: does it name a person, place, thing, or idea?';
    }
    if (q.mode === 'adj') {
      var isTarget = q.ans.some(function (i) { return q.toks[i].to === t.i; });
      if (isTarget) return w + ' is the noun. Find the word that describes it.';
      return w + ' does not describe a noun in this sentence. Ask: what kind? which one? how many?';
    }
    if (q.mode === 'adv') {
      if (t.ans) return w + ' is an adverb, but it tells ' + t.tags.toUpperCase() + '. Find the one that tells ' + (q.want || '').toUpperCase() + '.';
      var isVerb = q.ans.some(function (i) { return q.toks[i].to === t.i; });
      if (isVerb) return w + ' is the verb. Find the word that tells about it.';
      return w + ' does not tell how, when, or where here.';
    }
    return w + ' does not belong.';
  }
  function ignoreNote(t) {
    var w = '“' + cap(t.w) + '”';
    return IGNORE_ADJ[t.lw] === 'article' ? w + ' is a little pointer word called an article. We skip it and look for words that tell what kind, which one, or how many.'
      : w + ' tells whose. We skip it here and look for words that tell what kind, which one, or how many.';
  }
  function teamClue(team, hit, ask) {
    var main = team[team.length - 1], helpers = team.slice(0, -1);
    var hitHelper = helpers.some(function (i) { return hit.indexOf(i) >= 0; });
    var hitMain = hit.indexOf(main) >= 0;
    var missH = helpers.filter(function (i) { return hit.indexOf(i) < 0; }).length;
    if (hitHelper && !hitMain) return 'You found a helper! ' + (ask ? ask + ' ' : '') + 'Find the rest of the verb team.';
    if (hitMain && missH) return 'You found the main verb! Look for its helper' + (missH > 1 ? 's' : '') + '.';
    if (hitHelper && hitMain) return 'You have part of the team. This team has ' + team.length + ' verb words.';
    return 'Not yet. ' + (ask ? 'Ask: ' + ask : 'Look for the word that shows action or tells about being.');
  }
  function missingClue(q, miss, hit) {
    if (q.mode === 'verb') {
      var teams = q.teams && q.teams.length ? q.teams : [q.ans];
      var has = function (i) { return hit.indexOf(i) >= 0; };
      if (teams.length > 1) {
        var full = teams.filter(function (t) { return t.every(has); }).length;
        var part = teams.filter(function (t) { return t.some(has) && !t.every(has); });
        if (part.length) return teamClue(part[0], hit, null) + ' This sentence has ' + teams.length + ' verbs or verb teams.';
        if (full) return 'You found ' + full + ' of ' + teams.length + '. Keep reading! Something else happens in this sentence. Find every verb.';
        return 'Not yet. Read the whole sentence. Look for every action or being word. There is more than one.';
      }
      return teamClue(teams[0], hit, q.ask);
    }
    if (q.mode === 'noun') {
      var n = miss.length, t = q.toks[miss[0]];
      var pre = hit.length ? 'You found ' + hit.length + '! ' : '';
      if (q.want === 'P') return pre + 'Look for ' + (n > 1 ? n + ' more special names' : 'a special name') + ' that start with a capital letter.';
      return pre + 'You still need ' + n + ' more noun' + (n > 1 ? 's' : '') + '. Look for a word that names a ' + nounCat(t) + '. Ask: ' + CATQ[(t.tags.replace('P', '').charAt(0)) || 't'];
    }
    if (q.mode === 'adj') {
      var tt = q.toks[miss[0]], noun = q.toks[tt.to].w;
      return (hit.length ? 'Good start! ' : '') + 'Look at the noun “' + noun + '”. Which word tells what kind, which one, or how many?';
    }
    if (q.mode === 'adv') {
      var at = q.toks[miss[0]];
      return 'Find the verb “' + q.toks[at.to].w + '”. Ask: ' + at.tags.toUpperCase() + '? Tap the word that answers.';
    }
    return 'Something is missing.';
  }

  function evaluate(QS) {
    var q = QS.q, msgs = [], marks = {};
    if (!answered(QS)) return { empty: true, msgs: [{ t: 'fix', x: q.kind === 'sort' ? 'Choose a group for every word first.' : 'Choose an answer first.' }] };
    if (q.kind === 'select') {
      var phaseNoun = QS.phase === 'noun';
      var A = phaseNoun ? uniqueTargets(q) : q.ans;
      var hit = [], extra = [], ign = [], miss = [];
      QS.sel.forEach(function (i) {
        if (A.indexOf(i) >= 0) hit.push(i);
        else if (!phaseNoun && q.mode === 'adj' && IGNORE_ADJ[q.toks[i].lw]) ign.push(i);
        else extra.push(i);
      });
      A.forEach(function (i) { if (QS.sel.indexOf(i) < 0) miss.push(i); });
      hit.forEach(function (i) { marks[i] = 'ok'; });
      extra.forEach(function (i) { marks[i] = 'no'; });
      ign.forEach(function (i) { marks[i] = 'info'; });
      var correct = !extra.length && !miss.length;
      if (correct) {
        if (!phaseNoun) msgs.push({ t: 'good', x: q.ex });
      } else {
        if (miss.length) msgs.push({ t: 'fix', x: phaseNoun ? 'Find the noun first: a person, place, or thing that gets described.' : missingClue(q, miss, hit) });
        extra.forEach(function (i) { msgs.push({ t: 'fix', x: autoNote(q, q.toks[i], phaseNoun) }); });
      }
      ign.forEach(function (i) { msgs.push({ t: 'info', x: ignoreNote(q.toks[i]) }); });
      return { correct: correct, msgs: msgs, marks: marks };
    }
    if (q.kind === 'mc') {
      var ok = QS.choice === q.a;
      if (ok) msgs.push({ t: 'good', x: q.ex });
      else { msgs.push({ t: 'fix', x: 'Not quite. ' + (q.why[QS.choice] || q.h) }); marks[QS.choice] = 'no'; }
      if (ok) marks[QS.choice] = 'ok';
      return { correct: ok, msgs: msgs, marks: marks };
    }
    if (q.kind === 'sort') {
      var wrong = [];
      q.items.forEach(function (it, i) { if (QS.sort[i] === it[1]) marks[i] = 'ok'; else { marks[i] = 'no'; wrong.push(it[0]); } });
      if (!wrong.length) msgs.push({ t: 'good', x: q.ex });
      else msgs.push({ t: 'fix', x: 'Look again at: ' + wrong.join(', ') + '. ' + q.h });
      return { correct: !wrong.length, msgs: msgs, marks: marks };
    }
    if (q.kind === 'ev') {
      var good = q.ok.indexOf(QS.pick) >= 0;
      marks[QS.pick] = good ? 'ok' : 'no';
      if (good) msgs.push({ t: 'good', x: q.ex });
      else msgs.push({ t: 'fix', x: 'That sentence is in the text, but it does not prove this answer. ' + q.h });
      return { correct: good, msgs: msgs, marks: marks };
    }
  }

  function hintText(QS, level) {
    var q = QS.q;
    if (level <= 1) {
      if (QS.phase === 'noun') return 'The noun is a naming word. ' + q.h;
      return q.h;
    }
    if (q.kind === 'select') {
      var n = q.ans.length;
      if (QS.phase === 'noun') return 'The noun is “' + q.toks[uniqueTargets(q)[0]].w + '”. Tap it.';
      if (q.mode === 'verb' && q.teams && q.teams.length > 1) return 'This sentence has ' + q.teams.length + ' verbs or verb teams, with ' + n + ' verb words in all.';
      if (q.mode === 'verb') return n === 1 ? 'The verb is just ONE word here.' : 'This verb team has ' + n + ' words. Find all ' + n + '.';
      if (q.mode === 'noun') return 'Look for ' + n + ' noun' + (n > 1 ? 's' : '') + (q.want && CAT[q.want] ? ' that name' + (n > 1 ? '' : 's') + ' a ' + CAT[q.want] : '') + '.';
      if (q.mode === 'adj') { var nouns = uniqueTargets(q).map(function (i) { return '“' + q.toks[i].w + '”'; }); return 'Look for ' + n + ' describing word' + (n > 1 ? 's' : '') + '. Check the noun' + (nouns.length > 1 ? 's ' : ' ') + nouns.join(' and ') + '.'; }
      if (q.mode === 'adv') { var at = q.toks[q.ans[0]]; return 'The verb is “' + q.toks[at.to].w + '”. Which word tells ' + at.tags.toUpperCase() + ' about it?'; }
    }
    if (q.kind === 'mc') { var wi = (q.a + 1) % q.c.length; return 'It is NOT “' + q.c[wi] + '”.'; }
    if (q.kind === 'sort') return 'Here is one: “' + q.items[0][0] + '” goes in “' + q.b[q.items[0][1]] + '”.';
    if (q.kind === 'ev') return 'Look in paragraph ' + (q.passage.paraOf[q.ok[0]] + 1) + '.';
    return q.h;
  }

  function coachText(QS, stepCoach) {
    var q = QS.q;
    if (QS.phase === 'noun') return 'Step 1: Find the NOUN (the naming word) that gets described. Tap it.';
    if (QS.phase === 'adj') return 'Step 2: What word describes the “' + q.toks[QS.nounIdx].w + '”? Tap it.';
    if (stepCoach) return stepCoach;
    if (q.kind === 'select') {
      if (q.mode === 'verb') return q.ask ? 'Ask: “' + q.ask + '” Then tap every verb word.' : 'Find the word that shows action or tells about being.';
      if (q.mode === 'noun') return 'Check each word. Ask: is it a person, place, thing, or idea?';
      if (q.mode === 'adv') { var at = q.toks[q.ans[0]]; return 'Find the verb “' + q.toks[at.to].w + '”. Ask: ' + at.tags.toUpperCase() + '?'; }
      if (q.mode === 'adj') return 'Find each noun. Ask: what kind, which one, or how many?';
    }
    if (q.kind === 'ev') return 'Read the question. Then look back in the text for the sentence that proves it.';
    if (q.passage) return 'Read the question. Then look back in the text before you choose.';
    return 'Read every choice before you pick.';
  }

  function outcomeOf(QS) { if (QS.revealed) return 'rev'; if (isGuidedCtx(QS.ctx)) return 'help'; return (QS.tries === 1 && QS.hint === 0) ? 'ind' : 'help'; }

  /* ───────────── icons & art ───────────── */
  var ICON = {
    bat: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="#fff" stroke="#13294b" stroke-width="2.5"/><path d="M12 10c5 5 5 23 0 28M36 10c-5 5-5 23 0 28" fill="none" stroke="#d1342f" stroke-width="2.5" stroke-dasharray="3 3"/></svg>',
    glove: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 26c0-10 7-18 16-18s16 8 16 18v4H8z" fill="#13294b"/><rect x="5" y="28" width="38" height="5" rx="2.5" fill="#f4b41a"/><circle cx="24" cy="16" r="3" fill="#fff"/></svg>',
    star: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5l5.6 12.2 13.4 1.4-10 9 2.9 13.1L24 34l-11.9 6.7L15 27.6l-10-9 13.4-1.4z" fill="#f4b41a" stroke="#13294b" stroke-width="2"/></svg>',
    cleats: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 30c0-4 2-12 8-12h6l4 6c6 1 18 2 18 8v2H6z" fill="#0e7c7b"/><path d="M6 34h36" stroke="#13294b" stroke-width="3"/><path d="M10 38v3M18 38v3M26 38v3M34 38v3" stroke="#13294b" stroke-width="3"/><path d="M30 12l8-4M32 18l9-2M28 6l4-3" stroke="#f4b41a" stroke-width="2.5" stroke-linecap="round"/></svg>',
    abc: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="8" width="40" height="32" rx="8" fill="#0e7c7b"/><text x="24" y="32" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" font-family="Verdana, sans-serif">a e i</text></svg>',
    book: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 10c6-2 12-2 18 2v28c-6-4-12-4-18-2z" fill="#fff" stroke="#13294b" stroke-width="2.5"/><path d="M42 10c-6-2-12-2-18 2v28c6-4 12-4 18-2z" fill="#f4b41a" stroke="#13294b" stroke-width="2.5"/></svg>'
  };
  var KID = '<svg class="kid" viewBox="0 0 200 200" role="img" aria-label="A smiling Black boy in a baseball cap holding a bat">' +
    '<circle cx="100" cy="100" r="96" fill="#d9f2ef"/>' +
    '<path d="M40 70l18-50 10 4-16 48z" fill="#e3a21a" stroke="#13294b" stroke-width="3"/>' +
    '<path d="M54 196c0-40 20-62 46-62s46 22 46 62z" fill="#0e7c7b"/>' +
    '<text x="100" y="182" text-anchor="middle" font-size="30" font-weight="700" fill="#fff" font-family="Verdana, sans-serif">3</text>' +
    '<rect x="88" y="118" width="24" height="20" fill="#6b3f22"/>' +
    '<circle cx="100" cy="88" r="38" fill="#7a4a2a"/>' +
    '<path d="M60 80c0-26 18-40 40-40s40 14 40 40z" fill="#13294b"/>' +
    '<path d="M100 78h54c4 0 4 8 0 8h-54z" fill="#13294b"/>' +
    '<circle cx="100" cy="60" r="7" fill="#f4b41a"/>' +
    '<circle cx="86" cy="96" r="4.5" fill="#1a1a1a"/><circle cx="114" cy="96" r="4.5" fill="#1a1a1a"/>' +
    '<path d="M86 108c8 8 20 8 28 0" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>' +
    '<circle cx="60" cy="150" r="10" fill="#7a4a2a"/><path d="M58 146L46 78" stroke="#7a4a2a" stroke-width="12" stroke-linecap="round"/>' +
    '</svg>';
  var KID2 = '<svg class="kid" viewBox="0 0 200 200" role="img" aria-label="A smiling Black girl with hair puffs holding a trophy">' +
    '<circle cx="100" cy="100" r="96" fill="#fff1c9"/>' +
    '<circle cx="62" cy="52" r="20" fill="#2b1a10"/><circle cx="138" cy="52" r="20" fill="#2b1a10"/>' +
    '<path d="M50 196c0-40 22-62 50-62s50 22 50 62z" fill="#13294b"/>' +
    '<rect x="88" y="118" width="24" height="20" fill="#5a3418"/>' +
    '<circle cx="100" cy="88" r="38" fill="#5f3a1f"/>' +
    '<path d="M62 82c0-26 16-40 38-40s38 14 38 40c-8-12-20-18-38-18s-30 6-38 18z" fill="#2b1a10"/>' +
    '<circle cx="86" cy="94" r="4.5" fill="#111"/><circle cx="114" cy="94" r="4.5" fill="#111"/>' +
    '<path d="M84 106c9 9 23 9 32 0" fill="none" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M134 128h34v6c0 12-8 20-17 20s-17-8-17-20z" fill="#f4b41a" stroke="#13294b" stroke-width="2.5"/><rect x="145" y="154" width="12" height="12" fill="#f4b41a" stroke="#13294b" stroke-width="2.5"/>' +
    '</svg>';

  /* ───────────── view state ───────────── */
  var view = { v: 'home' };
  var flash = null; // short celebration text

  function go(v) { view = v; flash = null; saveResume(); render(true); }
  function saveResume() {
    var v = view, r = null;
    if (v.v === 'lesson') r = { v: 'lesson', a: v.a, l: v.l, step: v.step };
    else if (v.v === 'round') r = { v: 'round', a: v.a, mode: v.mode, sk: v.sk || null, story: v.story || null, ids: v.ids, i: v.i, res: v.res };
    else if (v.v === 'test' || v.v === 'testReview') r = { v: 'test', a: v.a, ids: v.ids, i: v.i, ans: v.ans, priorQ: v.priorQ || [], priorP: v.priorP || [] };
    else if (v.v === 'mastery' || v.v === 'masteryBreak' || v.v === 'masteryReview') r = { v: 'mastery', a: 'verbs' };
    if (r) { P.resume = r; saveP(); }
    else if (v.v === 'roundEnd' || v.v === 'testResult' || v.v === 'lessonEnd' || v.v === 'masteryResult') { P.resume = null; saveP(); }
  }
  function resumeDesc(r) {
    var a = areaById(r.a); if (!a) return null;
    if (r.v === 'lesson') { var l = lessonById(r.a, r.l); if (!l) return null; return a.short + ': Lesson ' + l.id + ' – ' + l.title + ' (step ' + (r.step + 1) + ')'; }
    if (r.v === 'round') return a.short + ': ' + (r.mode === 'guided' ? 'Guided practice' : 'Practice') + ', question ' + (r.i + 1) + ' of ' + r.ids.length;
    if (r.v === 'test') return a.short + ': Check My Skills, question ' + (r.i + 1) + ' of ' + r.ids.length;
    if (r.v === 'mastery') return validMastery(P.mastery) ? 'Verb Mastery Challenge, sentence ' + (P.mastery.i + 1) + ' of ' + MASTERY_IDS.length + ' (' + mAnswered() + ' answered)' : null;
    return null;
  }
  function doResume() {
    var r = P.resume; if (!r) return go({ v: 'home' });
    try {
      if (r.v === 'lesson') { var l = lessonById(r.a, r.l); if (!l) throw 0; return startLesson(r.a, r.l, Math.min(r.step, l.steps.length - 1)); }
      if (r.v === 'round') { if (!r.ids.every(function (id) { return QBY[id]; })) throw 0; var v = { v: 'round', a: r.a, mode: r.mode, sk: r.sk, story: r.story, ids: r.ids, i: Math.min(r.i, r.ids.length - 1), res: r.res || [] }; v.qs = newQS(QBY[v.ids[v.i]], r.mode); return go(v); }
      if (r.v === 'mastery') { if (!validMastery(P.mastery)) throw 0; return openMasteryQ(P.mastery.i); }
      if (r.v === 'test') { if (!r.ids.every(function (id) { return QBY[id]; })) throw 0; var t = { v: 'test', a: r.a, ids: r.ids, i: Math.min(r.i, r.ids.length - 1), ans: r.ans || {}, priorQ: r.priorQ || [], priorP: r.priorP || [] }; t.qs = newQS(QBY[t.ids[t.i]], 'test', t.ans[t.ids[t.i]]); return go(t); }
    } catch (e) { /* fall through */ }
    P.resume = null; saveP(); go({ v: 'home' });
  }

  /* ───────────── sentence rendering ───────────── */
  var SEL_CLASS = { verb: 'sel-verb', noun: 'sel-noun', adj: 'sel-adj', adv: 'sel-adv' };
  var MODE_LEGEND = {
    verb: 'Your choice gets <span class="sel-verb demo">two lines</span>.',
    noun: 'Your choice gets <span class="sel-noun demo">one line</span>.',
    adj: 'Your choice gets a <span class="sel-adj demo">gold highlight</span>. Gray words like <i>the</i>, <i>a</i>, and <i>my</i> cannot be tapped: we look for words that tell what kind, which one, or how many.',
    adv: 'Your choice gets a <span class="sel-adv demo">teal highlight</span>.'
  };
  function sentenceHTML(q, opt) {
    // opt: {interactive, sel[], marks{}, show (answer display), links (draw arrows), nounIdx}
    opt = opt || {};
    var cls = SEL_CLASS[q.mode];
    var hasLinks = (q.mode === 'adj' || q.mode === 'adv') && opt.links;
    var h = '<div class="sent' + (hasLinks ? ' has-links' : '') + '" data-mode="' + q.mode + '">';
    q.toks.forEach(function (t) {
      var on = opt.show ? q.ans.indexOf(t.i) >= 0 : (opt.sel && opt.sel.indexOf(t.i) >= 0);
      var mark = opt.marks ? opt.marks[t.i] : null;
      var c = 'tok' + (on ? ' ' + cls : '') + (mark ? ' m-' + mark : '') + (opt.show && on ? ' shown' : '') + (opt.nounIdx === t.i ? ' noun-found' : '');
      var linkAttr = (hasLinks && on && t.to >= 0 && (opt.show || mark === 'ok' || mark === 'reveal')) ? ' data-to="' + t.to + '"' : '';
      var label = opt.show && q.labels ? q.labels[t.lw] : (opt.nounIdx === t.i ? 'noun' : null);
      var badge = mark === 'ok' ? '<span class="badge ok" aria-hidden="true">✓</span>' : mark === 'no' ? '<span class="badge no" aria-hidden="true">✕</span>' : mark === 'reveal' ? '<span class="badge rv" aria-hidden="true">★</span>' : '';
      var srState = mark === 'ok' ? ', correct' : mark === 'no' ? ', not this one' : mark === 'reveal' ? ', answer' : mark === 'info' ? ', skip this word' : '';
      h += '<span class="w">' + (t.pre ? '<span class="punct">' + esc(t.pre) + '</span>' : '');
      var fixed = opt.interactive && q.mode === 'adj' && IGNORE_ADJ[t.lw] && q.ans.indexOf(t.i) < 0;
      if (fixed) {
        h += '<span class="tok fixed" data-ti="' + t.i + '">' + esc(t.w) + '</span>';
      } else if (opt.interactive) {
        h += '<button type="button" class="' + c + '" data-act="tok" data-i="' + t.i + '" data-ti="' + t.i + '" data-fkey="tok' + t.i + '" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + esc(t.w + (on ? ', chosen' : '') + srState) + '"' + linkAttr + '>' + esc(t.w) + badge + '</button>';
      } else {
        h += '<span class="' + c + '" data-ti="' + t.i + '"' + linkAttr + '>' + esc(t.w) + badge + '</span>';
      }
      h += (t.post ? '<span class="punct">' + esc(t.post) + '</span>' : '');
      if (label) h += '<span class="tok-label">' + esc(label) + '</span>';
      h += '</span> ';
    });
    h += '</div>';
    return h;
  }
  function plainSentence(q) { return q.toks.map(function (t) { return t.pre + t.w + t.post; }).join(' '); }
  function linkSummary(q, which) {
    var rows = which.filter(function (i) { return q.toks[i].to >= 0; }).map(function (i) {
      var t = q.toks[i]; return '<li><b>' + esc(t.w) + '</b> → ' + esc(q.toks[t.to].w) + (q.mode === 'adv' && t.tags ? ' <span class="muted">(tells ' + esc(t.tags) + ')</span>' : '') + '</li>';
    });
    return rows.length ? '<ul class="links-list" aria-label="What each word describes">' + rows.join('') + '</ul>' : '';
  }

  /* Draw arrows from describing words to the word they describe */
  function drawLinks() {
    var sents = app.querySelectorAll('.sent.has-links');
    Array.prototype.forEach.call(sents, function (s) {
      var old = s.querySelector('svg.links'); if (old) old.remove();
      var from = s.querySelectorAll('[data-to]'); if (!from.length) return;
      var box = s.getBoundingClientRect();
      var ns = 'http://www.w3.org/2000/svg';
      var svg = D.createElementNS(ns, 'svg'); svg.setAttribute('class', 'links'); svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
      var defs = D.createElementNS(ns, 'defs'), mk = D.createElementNS(ns, 'marker');
      var mid = 'ah' + Math.floor(Math.random() * 1e6);
      mk.setAttribute('id', mid); mk.setAttribute('viewBox', '0 0 10 10'); mk.setAttribute('refX', '8'); mk.setAttribute('refY', '5'); mk.setAttribute('markerWidth', '7'); mk.setAttribute('markerHeight', '7'); mk.setAttribute('orient', 'auto-start-reverse');
      var mp = D.createElementNS(ns, 'path'); mp.setAttribute('d', 'M0 0L10 5L0 10z'); mp.setAttribute('class', 'arrowhead'); mk.appendChild(mp); defs.appendChild(mk); svg.appendChild(defs);
      Array.prototype.forEach.call(from, function (el) {
        var to = s.querySelector('[data-ti="' + el.getAttribute('data-to') + '"]'); if (!to) return;
        var a = el.getBoundingClientRect(), b = to.getBoundingClientRect();
        var x1 = a.left + a.width / 2 - box.left, y1 = a.top - box.top + 2;
        var x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top + 2;
        var top = Math.min(y1, y2) - 26;
        var p = D.createElementNS(ns, 'path');
        p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + top + ' ' + x2 + ' ' + top + ' ' + x2 + ' ' + y2);
        p.setAttribute('class', 'link-path'); p.setAttribute('marker-end', 'url(#' + mid + ')');
        svg.appendChild(p);
      });
      s.appendChild(svg);
    });
  }

  /* ───────────── question widget ───────────── */
  function passageHTML(p, QS, test) {
    var evMode = QS && QS.q.kind === 'ev', idx = 0;
    var showMarks = QS && QS.fb && !test;
    var h = '<div class="passage" aria-label="Story text">' + (p.title ? '<h3 class="p-title">' + esc(p.title) + ' <span class="p-type">' + esc(p.type) + '</span></h3>' : '') + (p.img ? '<div class="passage-pic-wrap">' + pic(p.img, 'passage-pic') + '</div>' : '');
    if (p.title) h += sayBtn(p.title + '. ' + p.sents.join(' '), 'Read the story to me');
    p.paras.forEach(function (para) {
      h += '<p>';
      para.forEach(function (s) {
        var i = idx++;
        if (evMode) {
          var picked = QS.pick === i, mk = showMarks && QS.fb.marks ? QS.fb.marks[i] : null;
          h += '<button type="button" class="sent-btn' + (picked ? ' picked' : '') + (mk ? ' m-' + mk : '') + '" data-act="ev" data-i="' + i + '" data-fkey="ev' + i + '" aria-pressed="' + (picked ? 'true' : 'false') + '">' + esc(s) + '</button> ';
        } else h += '<span class="ps">' + esc(s) + '</span> ';
      });
      h += '</p>';
    });
    return h + '</div>' + (p.title ? '<p class="scroll-cue">\u2195 Scroll inside the story box to read it all.</p>' : '');
  }

  function qWidget(QS, opts) {
    opts = opts || {};
    var q = QS.q, test = QS.ctx === 'test', guided = isGuidedCtx(QS.ctx);
    var h = '';
    var main = '<div class="qbox">';
    if (guided && !QS.done) main += '<div class="coach"><span class="coach-tag">Coach</span> ' + esc(coachText(QS, opts.coach)) + '</div>';
    if (q.kind === 'select') {
      var prompt = QS.phase === 'noun' ? 'Step 1: Tap the NOUN.' : QS.phase === 'adj' ? 'Step 2: Tap the adjective that describes it.' : promptFor(q);
      main += '<p class="prompt">' + esc(prompt) + '</p>';
      var marks = QS.fb && QS.fb.marks && !test ? QS.fb.marks : null;
      main += sentenceHTML(q, { interactive: !QS.done, sel: QS.sel, marks: marks, links: QS.done && !test, nounIdx: QS.phase === 'adj' ? QS.nounIdx : null });
      main += '<p class="legend">' + (QS.phase === 'noun' ? 'Tap the naming word.' : MODE_LEGEND[q.mode]) + ' Tap again to remove it. The line means “my choice,” not “correct.”</p>';
      main += sayBtn(plainSentence(q), 'Read the sentence');
      if (QS.done && !test && (q.mode === 'adj' || q.mode === 'adv')) main += linkSummary(q, q.ans);
    } else if (q.kind === 'mc') {
      main += '<p class="prompt big">' + nl(q.q) + '</p>' + sayBtn(q.q.replace(/\n/g, ' ') + ' ' + q.c.join('. '), 'Read the question');
      main += '<div class="choices" role="group" aria-label="Answer choices">';
      q.c.forEach(function (c, i) {
        var on = QS.choice === i, mk = QS.fb && QS.fb.marks && !test ? QS.fb.marks[i] : null;
        main += '<button type="button" class="choice' + (on ? ' on' : '') + (mk ? ' m-' + mk : '') + '" data-act="choice" data-i="' + i + '" data-fkey="ch' + i + '" aria-pressed="' + (on ? 'true' : 'false') + '"' + (QS.done ? ' disabled' : '') + '><span class="ch-letter">' + 'ABCD'.charAt(i) + '</span> ' + esc(c) + '</button>';
      });
      main += '</div>';
      if (q.say && canSpeak) main += '<p class="muted small">Tip: tap “Read the question” to hear the words.</p>';
    } else if (q.kind === 'sort') {
      main += '<p class="prompt big">' + esc(q.q) + '</p><div class="sort">';
      q.items.forEach(function (it, i) {
        var mk = QS.fb && QS.fb.marks && !test ? QS.fb.marks[i] : null;
        main += '<div class="sort-row' + (mk ? ' m-' + mk : '') + '"><span class="sort-word">' + esc(it[0]) + (mk === 'ok' ? ' ✓' : mk === 'no' ? ' ✕' : '') + '</span>';
        if (canSpeak) main += '<button type="button" class="say mini" data-act="say" data-text="' + esc(it[0]) + '" aria-label="Hear ' + esc(it[0]) + '">🔊</button>';
        main += '<span class="sort-btns" role="group" aria-label="Group for ' + esc(it[0]) + '">';
        q.b.forEach(function (b, bi) {
          var on = QS.sort[i] === bi;
          main += '<button type="button" class="bucket' + (on ? ' on' : '') + '" data-act="sort" data-i="' + i + '" data-b="' + bi + '" data-fkey="s' + i + '_' + bi + '" aria-pressed="' + (on ? 'true' : 'false') + '"' + (QS.done ? ' disabled' : '') + '>' + esc(b) + '</button>';
        });
        main += '</span></div>';
      });
      main += '</div>';
    } else if (q.kind === 'ev') {
      main += '<p class="prompt big">' + esc(q.q) + '</p><p class="legend">Tap a sentence in the text. ' + (q.passage.title ? 'The text is ' + '<span class="only-wide">on the left</span><span class="only-narrow">above</span>.' : '') + '</p>';
    }

    // hints / feedback / actions
    if (!test) {
      if (QS.hint > 0 && !QS.done) {
        main += '<div class="hint"><b>Hint:</b> ' + esc(hintText(QS, 1)) + (QS.hint > 1 ? '<br><b>Bigger hint:</b> ' + esc(hintText(QS, 2)) : '') + '</div>';
      }
      main += '<div class="fb" role="status" aria-live="polite">';
      if (flash && QS.done && !QS.revealed) main += '<div class="yay"><span aria-hidden="true">⭐</span> ' + esc(flash) + '</div>';
      if (QS.fb) QS.fb.msgs.forEach(function (m) { main += '<p class="msg ' + m.t + '">' + esc(m.x) + '</p>'; });
      main += '</div>';
      main += '<div class="qactions">';
      if (!QS.done) {
        main += '<button type="button" class="btn primary" data-act="check" data-fkey="check"' + (answered(QS) ? '' : ' aria-disabled="true"') + '>Check</button>';
        if (QS.hint < 2) main += '<button type="button" class="btn" data-act="hint" data-fkey="hint">' + (QS.hint === 0 ? 'Hint' : 'Bigger hint') + '</button>';
        if (QS.tries > 0 || QS.hint > 0) main += '<button type="button" class="btn ghost" data-act="showme" data-fkey="showme">Show me</button>';
      }
      main += '</div>';
    }
    main += '</div>';

    if (q.passage) {
      h = '<div class="read-layout"><div class="read-text">' + passageHTML(q.passage, QS, test) + '</div><div class="read-q">' + main + '</div></div>';
    } else h = main;
    return h;
  }
  function promptFor(q) {
    if (q.mode === 'verb') return 'Tap EVERY verb word: main verbs and their helpers.';
    if (q.mode === 'noun') {
      if (!q.want) return 'Tap ALL the nouns.';
      return { p: 'Tap the noun that names a PERSON.', l: 'Tap the noun that names a PLACE.', t: 'Tap the noun that names a THING.', i: 'Tap the noun that names an IDEA.', P: 'Tap every PROPER noun (special names).', c: 'Tap every COMMON noun.' }[q.want];
    }
    if (q.mode === 'adj') return 'Tap every adjective (describing word).';
    if (q.mode === 'adv') return q.want ? 'Tap the adverb that tells ' + q.want.toUpperCase() + '.' : 'Tap the adverb.';
    return '';
  }

  /* Actions on the active question */
  function activeQS() { return view.qs || null; }
  function qAct(act, el) {
    var QS = activeQS(); if (!QS) return;
    var q = QS.q, i = el ? parseInt(el.getAttribute('data-i'), 10) : -1;
    if (act === 'tok' && !QS.done) {
      var k = QS.sel.indexOf(i); if (k >= 0) QS.sel.splice(k, 1); else QS.sel.push(i);
      QS.fb = null;
    } else if (act === 'choice' && !QS.done) { QS.choice = i; QS.fb = null; }
    else if (act === 'sort' && !QS.done) { QS.sort[i] = parseInt(el.getAttribute('data-b'), 10); QS.fb = null; }
    else if (act === 'ev' && !QS.done) { QS.pick = i; QS.fb = null; }
    else if (act === 'hint' && !QS.done) { QS.hint = Math.min(2, QS.hint + 1); }
    else if (act === 'check' && !QS.done) {
      if (QS.ctx === 'test') return;
      var r = evaluate(QS);
      if (r.empty) { QS.fb = r; render(); return; }
      QS.tries++; QS.fb = r;
      if (r.correct) {
        if (QS.phase === 'noun') {
          QS.nounIdx = uniqueTargets(q)[0]; QS.phase = 'adj'; QS.sel = [];
          QS.fb = { msgs: [{ t: 'good', x: 'Yes! “' + q.toks[QS.nounIdx].w + '” is the noun. Now find the word that describes it.' }], marks: {} };
        } else {
          QS.done = true; flash = praise(); questionDone(QS);
        }
      }
    } else if (act === 'showme' && !QS.done) {
      QS.revealed = true; QS.done = true; QS.phase = null; QS.nounIdx = null;
      var marks = {};
      if (q.kind === 'select') { QS.sel = q.ans.slice(); q.ans.forEach(function (j) { marks[j] = 'reveal'; }); }
      if (q.kind === 'mc') { QS.choice = q.a; marks[q.a] = 'ok'; }
      if (q.kind === 'sort') { q.items.forEach(function (it, j) { QS.sort[j] = it[1]; marks[j] = 'ok'; }); }
      if (q.kind === 'ev') { QS.pick = q.ok[0]; marks[q.ok[0]] = 'ok'; }
      QS.fb = { msgs: [{ t: 'info', x: 'Here is the answer. ' + q.ex }], marks: marks };
      questionDone(QS);
    }
    if (view.v === 'test') { view.ans[q.id] = saveAnswer(QS); saveResume(); }
    if (view.v === 'mastery' && P.mastery) { P.mastery.ans[q.id] = saveAnswer(QS); saveP(); }
    render();
  }
  function questionDone(QS) {
    if (view.v === 'round') {
      var oc = outcomeOf(QS);
      record(QS.q, oc);
      view.res[view.i] = oc;
      saveResume();
    }
  }

  /* ───────────── screens ───────────── */
  function topNav(items) { return '<nav class="subnav" aria-label="Screen controls">' + items.join('') + '</nav>'; }
  function btn(act, label, extra, cls) { return '<button type="button" class="btn ' + (cls || '') + '" data-act="' + act + '" data-fkey="' + act + (extra && extra.key ? extra.key : '') + '"' + (extra && extra.attrs ? ' ' + extra.attrs : '') + '>' + label + '</button>'; }

  function todayKey() { return new Date().toDateString(); }
  function dailyPlan() {
    var t = todayKey();
    if (P.daily && P.daily.date === t && areaById(P.daily.a) && skillById(P.daily.a, P.daily.sk)) return P.daily;
    var ns = nextSkill(); if (!ns) return null;
    P.daily = { date: t, a: ns.a, sk: ns.sk.id, lesson: false, practice: false }; saveP();
    return P.daily;
  }
  function markDaily(kind) { if (P.daily && P.daily.date === todayKey()) { P.daily[kind] = true; saveP(); } }
  function dailyHTML() {
    var d = dailyPlan(); if (!d) return '';
    var ar = areaById(d.a), sk = skillById(d.a, d.sk), l = lessonById(d.a, sk.lesson);
    var h = '<section class="card daily"><h2>Today\u2019s plan <span class="muted small">(about 10 minutes)</span></h2><ol class="daily-steps">';
    h += '<li class="' + (d.lesson ? 'done' : '') + '"><span>' + (d.lesson ? '\u2713 ' : '') + '<b>1 lesson:</b> ' + esc(ar.short) + ' \u2013 Lesson ' + l.id + ': ' + esc(l.title) + '</span>' + (d.lesson ? '' : btn('dayLesson', 'Start lesson', null, 'primary')) + '</li>';
    h += '<li class="' + (d.practice ? 'done' : '') + '"><span>' + (d.practice ? '\u2713 ' : '') + '<b>5 practice questions:</b> ' + esc(sk.name) + '</span>' + (d.practice ? '' : btn('dayPractice', 'Practice 5', null, d.lesson ? 'primary' : '')) + '</li></ol>';
    if (d.lesson && d.practice) h += '<p class="good-text">Today\u2019s plan is done! You can stop here, or keep going.</p>';
    return h + '</section>';
  }
  function screenHome() {
    var h = '<section class="hero"><div class="hero-art">' + (pic('home', 'hero-pic') || KID) + '</div><div class="hero-text">';
    h += '<h1 id="scr-title" tabindex="-1">Hi, ' + esc(P.nick) + '!</h1>';
    h += '<p class="lead">Pick a skill. Learn it, try it with the coach, then practice.</p>';
    if (view.editName) {
      h += '<form class="name-form" data-form="name"><label for="nick">Your nickname</label><input id="nick" name="nick" maxlength="20" value="' + esc(P.nick === 'Player' ? '' : P.nick) + '" placeholder="Player" autocomplete="off"><button class="btn primary" type="submit">Save</button> <button type="button" class="btn ghost" data-act="cancelName">Cancel</button></form>';
    } else h += '<button type="button" class="btn ghost small" data-act="editName" data-fkey="editName">Change nickname</button>';
    h += '</div></section>';
    h += dailyHTML();
    var rd = P.resume ? resumeDesc(P.resume) : null;
    if (rd) h += '<section class="card continue"><div><h2>Continue where I stopped</h2><p>' + esc(rd) + '</p></div>' + btn('resume', 'Continue ▶', null, 'primary big') + '</section>';
    h += '<h2 class="section-h">Learning areas</h2><div class="area-grid">';
    AREAS.forEach(function (a) {
      var ls = LESSONS[a.id], done = ls.filter(function (l) { return lessonDone(a.id, l.id); }).length;
      h += '<button type="button" class="area-card" data-act="area" data-a="' + a.id + '" data-fkey="area' + a.id + '"><span class="area-icon">' + ICON[a.icon] + '</span><span class="area-name">' + esc(a.name) + '</span><span class="area-blurb">' + esc(a.blurb) + '</span><span class="area-prog">' + done + ' of ' + ls.length + ' lessons done</span></button>';
    });
    h += '</div><div class="home-links">' + btn('guides', '🖨️ Printable learning guides', null, 'big') + btn('grown', '📊 Grown-up progress', null, 'big') + '</div>';
    return h;
  }

  function screenArea() {
    var a = areaById(view.a), ls = LESSONS[a.id];
    var next = ls.filter(function (l) { return !l.optional && !lessonDone(a.id, l.id); })[0];
    var h = '';
    h += '<div class="area-head"><span class="area-icon lg">' + ICON[a.icon] + '</span><h1 id="scr-title" tabindex="-1">' + esc(a.name) + '</h1></div>' + (pic(a.id, 'area-pic') ? '<div class="area-pic-wrap">' + pic(a.id, 'area-pic') + '</div>' : '');
    var nextOpt = a.id === 'verbs' ? ls.filter(function (l) { return l.optional && !lessonDone(a.id, l.id); })[0] : null;
    if (next) h += '<p class="lead">Coach suggests: <b>Lesson ' + next.id + ': ' + esc(next.title) + '</b>.</p>';
    else if (nextOpt) h += '<p class="lead">Coach suggests: <b>Lesson ' + nextOpt.id + ': ' + esc(nextOpt.title) + '</b>. The Verb Mastery Challenge tests it.</p>';
    else h += '<p class="lead">All lessons are done. Keep practicing!</p>';
    h += '<div class="path">';
    h += '<button type="button" class="path-step" data-act="learn" data-fkey="learn"><span class="num">1</span><span><b>LEARN</b><span>Short lessons, 2–4 minutes</span></span></button>';
    h += '<button type="button" class="path-step" data-act="pick" data-mode="guided" data-fkey="pickg"><span class="num">2</span><span><b>GUIDED PRACTICE</b><span>The coach helps on every question</span></span></button>';
    h += '<button type="button" class="path-step" data-act="pick" data-mode="practice" data-fkey="pickp"><span class="num">3</span><span><b>PRACTICE</b><span>5 questions. Hints when you want them.</span></span></button>';
    h += '<button type="button" class="path-step" data-act="testSetup" data-fkey="tests"><span class="num">4</span><span><b>CHECK MY SKILLS</b><span>No hints. Show what you know.</span></span></button>';
    if (a.id === 'verbs') {
      var mInfo = validMastery(P.mastery) ? 'In progress: ' + mAnswered() + ' of ' + MASTERY_IDS.length + ' answered' : (P.masteryResults.length ? 'Last score: ' + P.masteryResults[P.masteryResults.length - 1].score + ' of ' + MASTERY_IDS.length : '59 new sentences. Breaks every 10.');
      h += '<button type="button" class="path-step final" data-act="masteryIntro" data-fkey="mastery"><span class="num">\u2605</span><span><b>FINAL: VERB MASTERY CHALLENGE</b><span>' + esc(mInfo) + '</span></span></button>';
    }
    h += '</div>';
    return h;
  }

  function screenLearn() {
    var a = areaById(view.a), ls = LESSONS[a.id];
    var h = topNav([btn('area', '← ' + esc(a.short), { attrs: 'data-a="' + a.id + '"' })]);
    h += '<h1 id="scr-title" tabindex="-1">' + esc(a.short) + ' lessons</h1><p class="lead">One idea at a time. Pick a lesson.</p><ol class="lesson-list">';
    ls.forEach(function (l) {
      var done = lessonDone(a.id, l.id);
      h += '<li><button type="button" class="lesson-item' + (done ? ' done' : '') + '" data-act="lesson" data-l="' + l.id + '" data-fkey="les' + l.id + '"><span class="l-id">' + l.id + '</span><span class="l-title">' + esc(l.title) + (l.optional ? ' <span class="tag">' + (a.id === 'verbs' ? 'extra \u00B7 on the Mastery Challenge' : 'optional') + '</span>' : '') + '</span><span class="l-state">' + (done ? '✓ Done' : 'Start') + '</span></button></li>';
    });
    h += '</ol>';
    if (a.id === 'verbs') h += '<p class="muted">Want to drill the 23 helping verbs again? Open Lesson C any time.</p>';
    return h;
  }

  function startLesson(a, l, step) {
    var v = { v: 'lesson', a: a, l: l, step: step || 0, cards: { f: 0, covered: false, revealed: false } };
    setLessonQS(v);
    go(v);
  }
  function setLessonQS(v) {
    var les = lessonById(v.a, v.l), st = les.steps[v.step];
    v.qs = null;
    if (st && (st.t === 'guided' || st.t === 'try' || st.t === 'mc' || st.t === 'reading')) {
      v.qs = newQS(lessonQ(v.a, les, v.step), st.t === 'guided' ? 'lguided' : 'ltry');
    }
  }

  function screenLesson() {
    var a = areaById(view.a), les = lessonById(view.a, view.l), st = les.steps[view.step], n = les.steps.length;
    var h = topNav([btn('lrepeat', '↻ Repeat lesson'), btn('learn', 'All lessons')]);
    h += '<p class="crumb">' + esc(a.short) + ' · Lesson ' + les.id + ': ' + esc(les.title) + '</p>';
    h += '<div class="steps-bar" aria-label="Step ' + (view.step + 1) + ' of ' + n + '">';
    for (var i = 0; i < n; i++) h += '<span class="dot' + (i < view.step ? ' past' : i === view.step ? ' now' : '') + '"></span>';
    h += '<span class="steps-text">Step ' + (view.step + 1) + ' of ' + n + '</span></div>';
    var title = st.title || ({ guided: 'Let’s do one together', 'try': 'Your turn', mc: 'Quick check', reading: 'Read and answer', cards: 'Helper memory cards' })[st.t] || '';
    h += '<section class="card lesson-card"><h1 id="scr-title" tabindex="-1">' + esc(title) + '</h1>';
    if (st.img) h += '<div class="lesson-pic-wrap">' + pic(st.img, 'lesson-pic') + '</div>';
    var canNext = true;
    if (st.t === 'explain') {
      if (st.tiles) h += '<div class="tiles">' + st.tiles.map(function (t) { return canSpeak ? '<button type="button" class="tile" data-act="say" data-text="' + esc(t) + '">' + esc(t) + '</button>' : '<span class="tile">' + esc(t) + '</span>'; }).join('') + '</div>';
      h += '<div class="explain">' + st.text.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' + sayBtn(st.text.join(' '));
    } else if (st.t === 'show') {
      var sq = showQ(st, view.a);
      h += '<div class="worked"><span class="tag">Worked example</span>' + sentenceHTML(sq, { show: true, links: true }) + '</div>';
      if (sq.mode === 'adj' || sq.mode === 'adv') h += linkSummary(sq, sq.ans);
      h += '<div class="explain">' + st.text.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' + sayBtn(plainSentence(sq) + ' ' + st.text.join(' '));
    } else if (st.t === 'compare') {
      h += '<div class="compare">';
      st.items.forEach(function (it) {
        var cq = showQ(it, view.a);
        h += '<div class="cmp">' + sentenceHTML(cq, { show: true, links: true }) + '<p>' + esc(it.line) + '</p></div>';
      });
      h += '</div>';
      if (st.text) h += '<div class="explain">' + st.text.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>';
    } else if (st.t === 'words') {
      st.groups.forEach(function (g) {
        h += '<div class="word-group"><h3>' + esc(g.name) + '</h3><div class="chips">' + g.words.map(function (w) { return (st.say || canSpeak) && canSpeak ? '<button type="button" class="chip" data-act="say" data-text="' + esc(w) + '">' + esc(w) + '</button>' : '<span class="chip">' + esc(w) + '</span>'; }).join('') + '</div></div>';
      });
      if (st.text) h += '<div class="explain">' + st.text.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>';
      if (st.say && !canSpeak) h += '<p class="muted">No sound on this device. Say each word slowly and stretch the vowel: c-a-a-p.</p>';
      else if (canSpeak) h += '<p class="muted small">Tap a word to hear it (optional).</p>';
    } else if (st.t === 'table') {
      h += '<table class="tbl"><thead><tr>' + st.head.map(function (x) { return '<th scope="col">' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        st.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + (canSpeak && st.say ? '<button type="button" class="chip" data-act="say" data-text="' + esc(c) + '">' + esc(c) + '</button>' : esc(c)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      if (st.text) h += '<div class="explain">' + st.text.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>';
      if (st.say && !canSpeak) h += '<p class="muted">No sound on this device. Read each pair out loud. Listen for the vowel saying its name in the second word.</p>';
    } else if (st.t === 'cards') {
      h += cardsHTML();
    } else if (view.qs) {
      h += qWidget(view.qs, { coach: st.coach });
      canNext = view.qs.done;
    }
    h += '</section>';
    var last = view.step === n - 1;
    h += '<div class="lesson-foot">' + btn('lback', '← Back') + (canNext ? btn('lnext', last ? 'Finish lesson ✓' : 'Next →', null, 'primary big') : '<span class="muted">Answer to go on. Stuck? Use Hint or Show me.</span>') + '</div>';
    return h;
  }

  function cardsHTML() {
    var c = view.cards, fam = HELPER_FAMILIES[c.f];
    var h = '<p class="lead">Learn ONE family at a time. Look → Cover → Say → Reveal.</p>';
    h += '<div class="fam-tabs" role="group" aria-label="Helper families">' + HELPER_FAMILIES.map(function (f, i) { return '<button type="button" class="fam-tab' + (i === c.f ? ' on' : '') + '" data-act="fam" data-i="' + i + '" data-fkey="fam' + i + '" aria-pressed="' + (i === c.f) + '">' + esc(f.name) + '</button>'; }).join('') + '</div>';
    h += '<div class="memcard"><h3>' + esc(fam.name) + ' <span class="muted">(' + fam.words.length + ' words)</span></h3><div class="mem-words">';
    fam.words.forEach(function (w) { h += c.covered ? '<span class="mem covered" aria-label="hidden word">?</span>' : '<span class="mem">' + esc(w) + '</span>'; });
    h += '</div><ol class="mem-steps"><li class="' + (!c.covered && !c.revealed ? 'now' : '') + '">Look</li><li class="' + (c.covered ? 'now' : '') + '">Cover</li><li class="' + (c.covered ? 'now' : '') + '">Say them aloud</li><li class="' + (c.revealed ? 'now' : '') + '">Reveal and check</li></ol>';
    if (!c.covered) h += btn('cover', 'Cover the words', null, 'primary') + (c.revealed ? ' <span class="good-text">Did you say them all? Great! Try the next family.</span>' : '');
    else h += '<p>Say the ' + fam.words.length + ' words out loud. Then check!</p>' + btn('reveal', 'Reveal and check', null, 'primary');
    h += ' ' + sayBtn(fam.words.join(', '), 'Hear this family');
    h += '</div><p class="chant"><b>Chant:</b> am, is, are, was, were, be, being, been; have, has, had; do, does, did; can, could, may, might, must, shall, should, will, would.</p>';
    return h;
  }

  function screenLessonEnd() {
    var a = areaById(view.a), les = lessonById(view.a, view.l), ls = LESSONS[view.a];
    var idx = ls.indexOf(les), next = ls[idx + 1];
    var h = '<section class="card center end-card"><div class="end-art">' + KID2 + '</div><h1 id="scr-title" tabindex="-1">Lesson complete! <span aria-hidden="true">⭐</span></h1>';
    h += '<p class="key"><b>Remember:</b> ' + esc(les.key) + '</p>';
    h += '<div class="end-btns">' + btn('practiceSkill', 'Practice this (5 questions)', { attrs: 'data-a="' + a.id + '" data-sk="' + les.skill + '" data-mode="practice"' }, 'primary big');
    if (next) h += btn('lesson', 'Next lesson: ' + esc(next.title) + (next.optional ? ' (optional)' : ''), { attrs: 'data-l="' + next.id + '"' }, 'big');
    if (view.a === 'verbs' && !next) h += btn('masteryIntro', '\u2605 Verb Mastery Challenge', null, 'big');
    h += btn('learn', 'All lessons', null, 'big') + btn('home', '\u2302 Home', null, 'big') + '</div></section>';
    return h;
  }

  function screenPick() {
    var a = areaById(view.a), guided = view.mode === 'guided';
    var h = topNav([btn('area', '← ' + esc(a.short), { attrs: 'data-a="' + a.id + '"' })]);
    h += '<h1 id="scr-title" tabindex="-1">' + (guided ? 'Guided practice' : 'Practice') + ': ' + esc(a.short) + '</h1>';
    h += '<p class="lead">' + (guided ? 'The coach gives a clue on every question. Take your time.' : 'Five questions, one at a time. Hints are there if you need them.') + '</p>';
    h += '<div class="pick-grid">';
    if (a.id === 'reading') {
      var order = storyOrder();
      h += '<button type="button" class="pick main" data-act="startStory" data-p="' + order[0].id + '" data-fkey="pmix"><b>Next story</b><span>' + esc(order[0].title) + ' (5 questions)</span></button></div><h2 class="section-h">Pick a story</h2><div class="pick-grid">';
      PASSAGES.forEach(function (p) { h += '<button type="button" class="pick" data-act="startStory" data-p="' + p.id + '" data-fkey="ps' + p.id + '"><b>' + esc(p.title) + '</b><span>' + esc(p.type) + '</span></button>'; });
      h += '</div><h2 class="section-h">Or practice one reading skill</h2><div class="pick-grid">';
    } else {
      h += '<button type="button" class="pick main" data-act="startRound" data-sk="" data-fkey="pmix"><b>Mix it up</b><span>Skills from lessons you finished</span></button>';
    }
    SKILLS[a.id].forEach(function (s) {
      var n = poolFor(a.id, s.id).length, st = skillStatus(a.id, s.id);
      h += '<button type="button" class="pick" data-act="startRound" data-sk="' + s.id + '" data-fkey="pk' + s.id + '"><b>' + esc(s.name) + (s.optional ? ' <span class="tag">optional</span>' : '') + '</b><span>' + (lessonDone(a.id, s.lesson) ? 'Lesson done' : 'Lesson ' + s.lesson + ' not done yet') + ' · ' + esc(st.label) + (n < 5 ? ' · ' + n + ' questions' : '') + '</span></button>';
    });
    h += '</div>';
    return h;
  }

  function startRound(a, mode, sk, storyId) {
    var ids;
    if (storyId) { ids = PBY[storyId].qs.map(function (q) { return q.id; }); markStory(storyId); }
    else ids = pickRotating(poolFor(a, sk || null), 5).map(function (q) { return q.id; });
    if (!ids.length) return;
    var v = { v: 'round', a: a, mode: mode, sk: sk || null, story: storyId || null, ids: ids, i: 0, res: [] };
    v.qs = newQS(QBY[ids[0]], mode);
    go(v);
  }

  function roundDots(v) {
    var h = '<div class="round-dots" aria-label="Question ' + (v.i + 1) + ' of ' + v.ids.length + '">';
    v.ids.forEach(function (id, i) {
      var r = v.res[i];
      h += '<span class="rdot' + (i === v.i ? ' now' : '') + (r === 'ind' ? ' ind' : r === 'help' ? ' help' : r === 'rev' ? ' rev' : '') + '" aria-hidden="true">' + (r === 'ind' ? '★' : r === 'help' ? '✓' : r === 'rev' ? '•' : i + 1) + '</span>';
    });
    return h + '<span class="steps-text">Question ' + (v.i + 1) + ' of ' + v.ids.length + '</span></div>';
  }
  function screenRound() {
    var a = areaById(view.a), sk = view.sk ? skillById(view.a, view.sk) : null;
    var h = topNav([btn('quitRound', '← Stop round')]);
    var label = view.story ? PBY[view.story].title : sk ? sk.name : 'Mixed skills';
    h += '<p class="crumb">' + esc(a.short) + ' · ' + (view.mode === 'guided' ? 'Guided practice' : 'Practice') + ' · ' + esc(label) + '</p>';
    h += roundDots(view);
    h += '<section class="card"><h1 id="scr-title" tabindex="-1" class="sr-only">Question ' + (view.i + 1) + '</h1>' + qWidget(view.qs) + '</section>';
    if (view.qs.done) h += '<div class="lesson-foot">' + btn('nextQ', view.i === view.ids.length - 1 ? 'See my round →' : 'Next question →', null, 'primary big') + '</div>';
    return h;
  }
  function screenRoundEnd() {
    var a = areaById(view.a), r = view.res;
    var ind = r.filter(function (x) { return x === 'ind'; }).length, help = r.filter(function (x) { return x === 'help'; }).length, rev = r.filter(function (x) { return x === 'rev'; }).length;
    var line = view.mode === 'guided' ? 'You worked through every question with the coach. That is how skills grow!' : ind === r.length ? 'Every one on the first try. Wow!' : ind >= r.length - 1 ? 'Strong round! You are getting it.' : 'Good effort! Every try makes your brain stronger.';
    var h = '<section class="card center"><h1 id="scr-title" tabindex="-1">Round complete! <span aria-hidden="true">⭐</span></h1><p class="lead">' + esc(line) + '</p><ul class="tally">';
    if (view.mode !== 'guided') h += '<li><span class="rdot ind">★</span> First try: <b>' + ind + '</b></li>';
    h += '<li><span class="rdot help">✓</span> With help: <b>' + help + '</b></li><li><span class="rdot rev">•</span> Shown: <b>' + rev + '</b></li></ul>';
    var missedSk = [];
    view.ids.forEach(function (id, i) { if (r[i] !== 'ind') { var q = QBY[id]; if (missedSk.indexOf(q.sk) < 0) missedSk.push(q.sk); } });
    h += '<div class="end-btns">' + btn('again', 'Another round', null, 'primary big');
    if (view.mode === 'practice' && missedSk.length && view.a !== 'reading') {
      var l = lessonForSkill(view.a, missedSk[0]);
      if (l) h += btn('lesson', 'Review lesson: ' + esc(l.title), { attrs: 'data-l="' + l.id + '"' }, 'big');
    }
    h += btn('area', 'Back to ' + esc(a.short), { attrs: 'data-a="' + a.id + '"' }, 'big') + btn('home', '⌂ Home', null, 'big') + '</div></section>';
    return h;
  }

  function screenTestSetup() {
    var a = areaById(view.a);
    var h = topNav([btn('area', '← ' + esc(a.short), { attrs: 'data-a="' + a.id + '"' })]);
    h += '<h1 id="scr-title" tabindex="-1">Check My Skills: ' + esc(a.short) + '</h1>';
    h += '<div class="card"><ul class="rules"><li>No timer. Take your time.</li><li>No hints. Show what YOU know.</li><li>You can go back and change answers.</li><li>You find out how you did at the end.</li></ul>';
    h += '<div class="end-btns">' + btn('startTest', '5 questions', { attrs: 'data-n="5"', key: '5' }, 'primary big') + btn('startTest', '10 questions', { attrs: 'data-n="10"', key: '10' }, 'big') + '</div>';
    var nl = newLeft(a.id);
    h += '<p class="muted small center">For grown-ups: ' + nl.n + ' of ' + nl.of + ' check ' + nl.unit + ' are still unseen. New ones are used first' + (a.id === 'reading' ? ' (a 5-question check uses one story, 10 uses two).' : '.') + (nl.n === 0 ? ' All have been seen, so a new check will repeat questions.' : '') + '</p></div>';
    return h;
  }
  function startTest(a, n) {
    var ids;
    if (a === 'reading') {
      /* Reading checks use CHECK_PASSAGES only, never the practice stories */
      var ps = expo('p');
      var order = CHECK_PASSAGES.slice().sort(function (x, y) { return ((ps[x.id] ? 1e9 : 0) + ((P.stats['story:' + x.id] || {}).last || 0)) - ((ps[y.id] ? 1e9 : 0) + ((P.stats['story:' + y.id] || {}).last || 0)); });
      var stories = order.slice(0, n >= 10 ? 2 : 1);
      ids = []; stories.forEach(function (p) { markStory(p.id); p.qs.forEach(function (q) { ids.push(q.id); }); });
    } else ids = testPick(a, n);
    var priorQ = ids.filter(function (id) { return expo('q')[id]; });
    var priorP = []; ids.forEach(function (id) { var p = QBY[id].passage; if (p && expo('p')[p.id] && priorP.indexOf(p.id) < 0) priorP.push(p.id); });
    var v = { v: 'test', a: a, ids: ids, i: 0, ans: {}, priorQ: priorQ, priorP: priorP };
    v.qs = newQS(QBY[ids[0]], 'test');
    go(v);
  }
  function screenTest() {
    var a = areaById(view.a), n = view.ids.length;
    var h = topNav([btn('quitTest', '← Stop')]);
    h += '<p class="crumb">' + esc(a.short) + ' · Check My Skills (no hints)</p>';
    h += '<div class="round-dots" aria-label="Question ' + (view.i + 1) + ' of ' + n + '">';
    view.ids.forEach(function (id, i) { var done = answered(newQS(QBY[id], 'test', view.ans[id])); h += '<button type="button" class="rdot jump' + (i === view.i ? ' now' : '') + (done ? ' answered' : '') + '" data-act="tjump" data-i="' + i + '" data-fkey="tj' + i + '" aria-label="Go to question ' + (i + 1) + (done ? ', answered' : ', not answered') + '">' + (i + 1) + '</button>'; });
    h += '<span class="steps-text">Question ' + (view.i + 1) + ' of ' + n + '</span></div>';
    h += '<section class="card"><h1 id="scr-title" tabindex="-1" class="sr-only">Question ' + (view.i + 1) + '</h1>' + qWidget(view.qs) + '</section>';
    h += '<div class="lesson-foot">' + (view.i > 0 ? btn('tprev', '← Back') : '<span></span>') + (view.i < n - 1 ? btn('tnext', 'Next →', null, 'primary big') : btn('treview', 'Review my answers →', null, 'primary big')) + '</div>';
    return h;
  }
  function screenTestReview() {
    var missing = [];
    view.ids.forEach(function (id, i) { if (!answered(newQS(QBY[id], 'test', view.ans[id]))) missing.push(i); });
    var h = topNav([btn('tback', '← Back to questions')]);
    h += '<section class="card"><h1 id="scr-title" tabindex="-1">Ready to turn it in?</h1>';
    if (missing.length) {
      h += '<p class="lead">You have <b>' + missing.length + '</b> unanswered question' + (missing.length > 1 ? 's' : '') + ':</p><div class="end-btns">';
      missing.forEach(function (i) { h += btn('tjump', 'Question ' + (i + 1), { attrs: 'data-i="' + i + '"', key: 'r' + i }); });
      h += '</div><p>You can answer them now, or turn it in anyway.</p>';
    } else h += '<p class="lead">Every question has an answer. Nice!</p>';
    h += '<div class="end-btns">' + btn('submitTest', 'Turn it in', null, 'primary big') + btn('tback', 'Keep checking', null, 'big') + '</div></section>';
    return h;
  }
  function submitTest() {
    var items = view.ids.map(function (id) { var q = QBY[id]; return { id: id, ok: gradeOnly(q, view.ans[id]), given: view.ans[id] || null }; });
    var score = items.filter(function (x) { return x.ok; }).length;
    var per = {};
    items.forEach(function (it) { var q = QBY[it.id]; per[q.sk] = per[q.sk] || { right: 0, total: 0 }; per[q.sk].total++; if (it.ok) per[q.sk].right++; });
    Object.keys(per).forEach(function (sk) { var r = skillRec(view.a, sk); r.chkRight += per[sk].right; r.chkTotal += per[sk].total; r.lastChk = per[sk]; });
    var repeat = (view.priorQ || []).length, passRepeat = (view.priorP || []).length;
    var unseen = !repeat && !passRepeat;
    P.checks.push({ a: view.a, date: new Date().toISOString(), n: items.length, score: score, repeat: repeat, passRepeat: passRepeat, unseen: unseen, missed: Object.keys(per).filter(function (k) { return per[k].right < per[k].total; }) });
    if (P.checks.length > 50) P.checks = P.checks.slice(-50);
    saveP();
    go({ v: 'testResult', a: view.a, items: items, score: score, per: per, repeat: repeat, passRepeat: passRepeat, unseen: unseen });
  }
  function givenText(q, g) {
    if (!g) return 'No answer';
    if (q.kind === 'select') return g.sel && g.sel.length ? g.sel.slice().sort(function (x, y) { return x - y; }).map(function (i) { return q.toks[i].w; }).join(', ') : 'No answer';
    if (q.kind === 'mc') return g.choice != null ? q.c[g.choice] : 'No answer';
    if (q.kind === 'sort') return q.items.map(function (it, i) { return it[0] + ' → ' + (g.sort && g.sort[i] != null ? q.b[g.sort[i]] : '?'); }).join('; ');
    if (q.kind === 'ev') return g.pick != null ? q.passage.sents[g.pick] : 'No answer';
    return '';
  }
  function correctText(q) {
    if (q.kind === 'select') return q.ans.map(function (i) { return q.toks[i].w; }).join(', ');
    if (q.kind === 'mc') return q.c[q.a];
    if (q.kind === 'sort') return q.items.map(function (it) { return it[0] + ' → ' + q.b[it[1]]; }).join('; ');
    if (q.kind === 'ev') return q.ok.map(function (i) { return q.passage.sents[i]; }).join('  OR  ');
  }
  function qLabel(q) {
    if (q.kind === 'select') return promptFor(q) + '  “' + plainSentence(q) + '”';
    return q.q.replace(/\n/g, ' ');
  }
  function exposureNote(r) {
    var t = r.unseen ? 'For grown-ups: every question' + (r.a === 'reading' ? ' and story' : '') + ' was new to him, so this is an unseen check.'
      : 'For grown-ups: ' + (r.repeat ? r.repeat + ' of ' + (r.items ? r.items.length : r.n) + ' questions were seen in an earlier check. ' : '') + (r.passRepeat ? 'The story was read in an earlier check. ' : '') + 'This is not a fully unseen check.';
    return '<p class="muted small exposure">' + esc(t) + '</p>';
  }
  function screenTestResult() {
    var a = areaById(view.a), n = view.items.length;
    var h = '<section class="card center"><h1 id="scr-title" tabindex="-1">You finished! <span aria-hidden="true">⭐</span></h1><p class="score">' + view.score + ' of ' + n + ' correct</p>';
    h += '<p class="lead">' + (view.score === n ? 'Every single one. Amazing!' : 'Let’s look at the ones to practice. Mistakes help us learn.') + '</p>' + exposureNote(view) + '</section>';
    var missed = view.items.filter(function (x) { return !x.ok; });
    if (missed.length) {
      h += '<h2 class="section-h">Let’s learn from these</h2>';
      missed.forEach(function (it) {
        var q = QBY[it.id];
        h += '<div class="card review"><p class="rq">' + esc(qLabel(q)) + '</p>';
        if (q.kind === 'select') h += sentenceHTML(q, { show: true, links: true });
        h += '<p><b>Your answer:</b> ' + esc(givenText(q, it.given)) + '</p><p><b>Correct answer:</b> ' + esc(correctText(q)) + '</p><p class="msg info">' + esc(q.ex) + '</p>';
        if (q.kind === 'select' && q.mode === 'verb' && it.given && it.given.sel && it.given.sel.length && q.ans.length > 1 && it.given.sel.every(function (i) { return q.ans.indexOf(i) >= 0; })) h += '<p class="msg fix">You found part of the verb team. A whole team needs every verb word.</p>';
        h += '</div>';
      });
      var sks = [];
      missed.forEach(function (it) { var s = QBY[it.id].sk; if (sks.indexOf(s) < 0) sks.push(s); });
      h += '<h2 class="section-h">Practice what you missed</h2><div class="end-btns">';
      sks.forEach(function (s) { var so = skillById(view.a, s); h += btn('practiceSkill', 'Practice: ' + esc(so ? so.name : s), { attrs: 'data-a="' + view.a + '" data-sk="' + s + '" data-mode="guided"', key: s }, 'big'); });
      h += '</div>';
    }
    h += '<div class="end-btns">' + btn('area', 'Back to ' + esc(a.short), { attrs: 'data-a="' + a.id + '"' }, 'primary big') + btn('home', '⌂ Home', null, 'big') + '</div>';
    return h;
  }

  /* ───────────── guides ───────────── */
  var SHEETS = {
    verbs: { title: 'Verb Teams Quick Sheet' },
    nouns: { title: 'Nouns Reference Sheet' },
    adjectives: { title: 'Adjectives Reference Sheet' },
    adverbs: { title: 'Adverbs Reference Sheet' },
    vowels: { title: 'Vowel Patterns Reference Sheet' }
  };
  function hasPDF() { var el = D.getElementById('verb-guide-pdf'); return !!(el && el.textContent.trim().length > 100); }
  function screenGuides() {
    var h = '';
    h += '<h1 id="scr-title" tabindex="-1">Printable learning guides</h1>';
    h += '<div class="card"><h2>Verb Memory Guide (PDF, 4 pages)</h2><p>The 23 helping verbs by family, action verbs, whole verb-team examples, -ed/-ing clues, and a short practice page with a separate answer key.</p>';
    if (HOSTED) h += '<p class="msg info">This online version cannot download or print files. To get the PDF and print the sheets, download chriss-learning-club.html and open it in a browser.</p>';
    else if (hasPDF()) h += '<div class="end-btns">' + btn('pdfDownload', '⬇ Download the PDF', null, 'primary big') + btn('pdfOpen', 'Open PDF to print', null, 'big') + '</div><p class="muted small">This is the real PDF file, saved inside the app. No internet needed.</p>';
    else h += '<p class="muted">The PDF is not included in this copy. Use the Verb Teams Quick Sheet below.</p>';
    h += '</div><h2 class="section-h">Reference sheets (print or save as PDF)</h2><div class="pick-grid">';
    Object.keys(SHEETS).forEach(function (k) { h += '<button type="button" class="pick" data-act="sheet" data-k="' + k + '" data-fkey="sh' + k + '"><b>' + esc(SHEETS[k].title) + '</b><span>Open, then Print / Save as PDF</span></button>'; });
    h += '</div>';
    return h;
  }
  function pdfBlob() {
    var b64 = D.getElementById('verb-guide-pdf').textContent.replace(/\s+/g, '');
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: 'application/pdf' });
  }
  var pdfURL = null;
  function getPdfURL() { if (!pdfURL) pdfURL = URL.createObjectURL(pdfBlob()); return pdfURL; }

  function sheetHTML(k) {
    var h = '<article class="sheet">';
    var sec = function (t, body) { return '<section class="sh-sec"><h2>' + t + '</h2>' + body + '</section>'; };
    var ul = function (arr) { return '<ul>' + arr.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; };
    if (k === 'verbs') {
      h += '<h1>Verb Teams Quick Sheet</h1><p class="sh-sub">A verb can show action or tell about being. Double-underline every verb word.</p>';
      h += sec('The 23 helping verbs', HELPER_FAMILIES.map(function (f) { return '<p><b>' + f.name + ' (' + f.words.length + '):</b> ' + f.words.join(', ') + '</p>'; }).join('') + '<p class="sh-note">These words are not always helpers. "I <u>have</u> a glove." Have is the main verb. "I have packed my bag." Have helps packed.</p>');
      h += sec('Common action verbs', '<p>run, walk, jump, throw, catch, swing, hit, kick, read, write, draw, sing, talk, look, listen, think, know, learn, help, play, eat, build, carry</p>');
      h += sec('Whole verb teams', ul(['The boy <b>was playing</b> yesterday. (was = helper, playing = main verb)', 'We <b>are reading</b>.', 'She <b>has finished</b>.', 'He <b>can swim</b>.', 'He <b>has been practicing</b>. (three verb words!)', 'The boy <b>is</b> not <b>sleeping</b>. (not is NOT a verb)']));
      h += sec('Ending clues', '<p>play → played → playing &nbsp; jump → jumped → jumping &nbsp; help → helped → helping</p><p>Words that change: run → ran, eat → ate, catch → caught, write → wrote</p><p class="sh-note">An ending is a clue, not proof. "The running shoes are red." Running describes the shoes. The verb is are.</p>');
      h += sec('Practice: double-underline the whole verb', '<ol class="sh-practice"><li>Mom cooks dinner.</li><li>He is happy.</li><li>We are reading.</li><li>She has a new bat.</li><li>They will practice.</li><li>The puppy was sleeping on the rug.</li><li>She had been waiting for the bus.</li><li>The running shoes are red.</li></ol>');
      h += '<section class="sh-sec sh-key"><h2>Answer key (fold or cut off)</h2><p>1. cooks &nbsp; 2. is &nbsp; 3. are reading &nbsp; 4. has &nbsp; 5. will practice &nbsp; 6. was sleeping &nbsp; 7. had been waiting &nbsp; 8. are</p></section>';
    } else if (k === 'nouns') {
      h += '<h1>Nouns Reference Sheet</h1><p class="sh-sub">A noun names a person, place, thing, or idea. Draw ONE line under a noun.</p>';
      h += sec('Kinds of nouns', ul(['<b>Person:</b> mom, coach, teacher, friend', '<b>Place:</b> park, school, kitchen, field', '<b>Thing:</b> bat, ball, book, dog (animals are things too)', '<b>Idea:</b> kindness, joy, courage, friendship']));
      h += sec('Common and proper', '<p>Common: boy, city, dog, holiday<br>Proper (special names, capital letter): Marcus, Atlanta, Rex, Thanksgiving</p>');
      h += sec('Practice: underline every noun', '<ol class="sh-practice"><li>Chris carries a bat.</li><li>The coach stood on the field.</li><li>My sister found a shell at the beach.</li><li>Maya lives in Georgia.</li><li>Her kindness helped the new student.</li></ol>');
      h += '<section class="sh-sec sh-key"><h2>Answer key</h2><p>1. Chris, bat &nbsp; 2. coach, field &nbsp; 3. sister, shell, beach &nbsp; 4. Maya, Georgia &nbsp; 5. kindness, student</p></section>';
    } else if (k === 'adjectives') {
      h += '<h1>Adjectives Reference Sheet</h1><p class="sh-sub">An adjective describes a noun. Find the noun, then ask:</p>';
      h += sec('Three questions', ul(['<b>What kind?</b> the <u>red</u> ball, a <u>small</u> puppy', '<b>Which one?</b> the <u>last</u> player, the <u>next</u> game', '<b>How many?</b> <u>three</u> players, <u>many</u> leaves']));
      h += sec('Draw an arrow', '<p>red → ball &nbsp;&nbsp; small → puppy &nbsp;&nbsp; An adjective can come after is: My bat is <u>heavy</u>. (heavy → bat)</p>');
      h += sec('Practice: circle each adjective and draw an arrow to its noun', '<ol class="sh-practice"><li>The brown dog barked.</li><li>Five birds sat on the fence.</li><li>We will win the next game.</li><li>The little kitten has green eyes.</li></ol>');
      h += '<section class="sh-sec sh-key"><h2>Answer key</h2><p>1. brown → dog &nbsp; 2. Five → birds &nbsp; 3. next → game &nbsp; 4. little → kitten, green → eyes</p></section>';
    } else if (k === 'adverbs') {
      h += '<h1>Adverbs Reference Sheet</h1><p class="sh-sub">An adverb can describe a verb. It tells how, when, or where.</p>';
      h += sec('How? When? Where?', ul(['<b>How:</b> quickly, slowly, carefully, well, fast', '<b>When:</b> yesterday, today, soon, later, tonight', '<b>Where:</b> outside, here, upstairs, away, inside']));
      h += sec('Adjective or adverb?', '<p>The <u>careful</u> player throws. → careful describes player (noun): <b>adjective</b><br>The player throws <u>carefully</u>. → carefully describes throws (verb): <b>adverb</b></p><p class="sh-note">Many adverbs end in -ly, but not all (fast, well, soon). Some -ly words are adjectives (the friendly dog).</p>');
      h += sec('Practice: circle the adverb. Write how, when, or where.', '<ol class="sh-practice"><li>Chris runs quickly.</li><li>We practiced yesterday.</li><li>The children played outside.</li><li>The team played well.</li></ol>');
      h += '<section class="sh-sec sh-key"><h2>Answer key</h2><p>1. quickly (how) &nbsp; 2. yesterday (when) &nbsp; 3. outside (where) &nbsp; 4. well (how)</p></section>';
    } else if (k === 'vowels') {
      h += '<h1>Vowel Patterns Reference Sheet</h1><p class="sh-sub">Vowel letters: a, e, i, o, u</p>';
      h += sec('Short vowels (one vowel between consonants)', '<p>cap, bed, kit, hop, cub</p>');
      h += sec('Silent e (often makes the vowel say its name)', '<p>cap → cape &nbsp; kit → kite &nbsp; hop → hope &nbsp; cub → cube</p><p class="sh-note">Not always: have and give end in e, but the vowel is short.</p>');
      h += sec('Vowel teams', ul(['<b>ai</b> often says long a: rain, tail, paint', '<b>ee</b> says long e: feet, seed, tree', '<b>ea</b> often says long e: team, seat, beach (sometimes short e: bread)', '<b>oa</b> says long o: boat, coat, road']));
      h += sec('Practice: write S (short) or L (long)', '<ol class="sh-practice"><li>cape ___</li><li>hop ___</li><li>rain ___</li><li>pet ___</li><li>boat ___</li></ol>');
      h += '<section class="sh-sec sh-key"><h2>Answer key</h2><p>1. L &nbsp; 2. S &nbsp; 3. L &nbsp; 4. S &nbsp; 5. L</p></section>';
    }
    h += '<p class="sh-foot">Chris’s Learning Club</p></article>';
    return h;
  }
  function screenSheet() {
    var h = '<div class="no-print">' + topNav([btn('guides', '← Guides')]) + '<h1 id="scr-title" tabindex="-1" class="sr-only">' + esc(SHEETS[view.k].title) + '</h1>' + (HOSTED ? '<p class="msg info">This online version cannot print. To print this sheet, open the downloaded chriss-learning-club.html file in a browser.</p>' : '<div class="end-btns">' + btn('print', '🖨️ Print / Save as PDF', null, 'primary big') + '</div><p class="muted small">To make a PDF, choose “Save as PDF” in the print window.</p>') + '</div>';
    return h + sheetHTML(view.k);
  }

  /* ───────────── grown-up view ───────────── */
  function screenGrown() {
    var h = '';
    h += '<h1 id="scr-title" tabindex="-1">Grown-up progress</h1>';
    h += '<div class="card"><p>' + (storageOK ? 'Progress is saved in this browser on this device only. It does not sync to other devices and is never sent anywhere.' : '<b>Progress is not being saved.</b> ' + esc(storageNote)) + '</p>';
    var ns = nextSkill();
    if (ns) { var ar = areaById(ns.a); h += '<p class="next-skill"><b>Next skill to practice:</b> ' + esc(ar.short) + ' – ' + esc(ns.sk.name) + ' <span class="muted">(' + esc(ns.why) + ')</span></p>'; }
    h += '<p class="muted small"><b>First try</b> = right on the first Check with no hint. <b>With help</b> = used a hint, the coach, or a retry. <b>Shown</b> = used “Show me.” “Getting strong” needs at least 5 first-try answers in recent practice; the app never calls a skill mastered from one answer. Check My Skills results are kept separate from practice.</p><p class="muted small"><b>About checks:</b> each subject has its own check questions that never appear in lessons or practice (verbs 22, nouns 10, adjectives 10, adverbs 10, vowels 10, reading 2 check-only stories with 5 questions each). Because the banks are small, a second check repeats questions he has already seen; those are marked \u201crepeated\u201d below, and the first check is the best independent measure.</p></div>';
    AREAS.forEach(function (a) {
      var ls = LESSONS[a.id], done = ls.filter(function (l) { return lessonDone(a.id, l.id); }).length;
      h += '<div class="card"><h2>' + esc(a.name) + ' <span class="muted small">· ' + done + ' of ' + ls.length + ' lessons done</span></h2><div class="tbl-wrap"><table class="tbl small"><thead><tr><th scope="col">Skill</th><th scope="col">Lesson</th><th scope="col">First try</th><th scope="col">With help</th><th scope="col">Shown</th><th scope="col">Checks</th><th scope="col">Status</th></tr></thead><tbody>';
      SKILLS[a.id].forEach(function (s) {
        var r = P.skills[a.id + '.' + s.id] || { ind: 0, help: 0, rev: 0, chkRight: 0, chkTotal: 0 }, st = skillStatus(a.id, s.id);
        h += '<tr><th scope="row">' + esc(s.name) + (s.optional ? ' <span class="tag">optional</span>' : '') + '</th><td>' + (lessonDone(a.id, s.lesson) ? '✓' : '–') + '</td><td>' + r.ind + '</td><td>' + r.help + '</td><td>' + r.rev + '</td><td>' + (r.chkTotal ? r.chkRight + '/' + r.chkTotal : '–') + '</td><td><span class="status s-' + st.key + '">' + esc(st.label) + '</span></td></tr>';
      });
      h += '</tbody></table></div></div>';
    });
    h += '<div class="card"><h2>Verb Mastery Challenge</h2><p class="muted small">59 sentences used only in this final check. Benchmark: ' + MASTERY_BENCHMARK + ' of ' + MASTERY_IDS.length + ' with no help. Every verb word must be found; a partial verb team or an extra word makes that sentence wrong.</p>';
    if (validMastery(P.mastery)) h += '<p><b>In progress:</b> ' + mAnswered() + ' of ' + MASTERY_IDS.length + ' answered (saved).</p>';
    if (!P.masteryResults.length) h += '<p class="muted">Not taken yet.</p>';
    P.masteryResults.slice(-5).reverse().forEach(function (r) { var d = new Date(r.date); h += '<p>' + esc(isNaN(d) ? '' : d.toLocaleDateString()) + ': <b>' + r.score + ' of ' + r.total + '</b> \u00B7 ' + (r.met ? 'benchmark met' : 'benchmark not met yet') + (r.prior ? ' \u00B7 <span class="tag">repeat attempt: ' + r.prior + ' sentences seen before</span>' : ' \u00B7 <span class="tag">unseen</span>') + '</p>' + catTable(r.byCat); });
    h += '</div>';
    h += '<div class="card"><h2>Check My Skills history</h2>';
    if (!P.checks.length) h += '<p class="muted">No checks yet.</p>';
    else h += '<ul class="hist">' + P.checks.slice(-10).reverse().map(function (c) { var a = areaById(c.a); var d = new Date(c.date); return '<li>' + esc(isNaN(d) ? '' : d.toLocaleDateString()) + ' · ' + esc(a ? a.short : c.a) + ': <b>' + c.score + ' of ' + c.n + '</b>' + (c.unseen ? ' <span class="tag">unseen</span>' : (c.repeat ? ' <span class="tag">' + c.repeat + ' repeated question' + (c.repeat > 1 ? 's' : '') + '</span>' : '') + (c.passRepeat ? ' <span class="tag">story seen before</span>' : '')) + (c.missed && c.missed.length ? ' · review: ' + esc(c.missed.map(function (s) { var so = skillById(c.a, s); return so ? so.name : s; }).join(', ')) : '') + '</li>'; }).join('') + '</ul>';
    h += '</div><div class="card"><h2>Settings</h2>' + btn('editNameG', 'Change nickname (now: ' + esc(P.nick) + ')');
    if (view.confirmReset) h += '<div class="confirm" role="alertdialog" aria-label="Confirm reset"><p><b>Erase all progress on this device?</b> This cannot be undone.</p>' + btn('doReset', 'Yes, erase everything', null, 'danger') + ' ' + btn('cancelReset', 'Cancel') + '</div>';
    else h += ' ' + btn('askReset', 'Reset all progress', null, 'ghost');
    h += '</div>';
    return h;
  }


  /* ───────────── Verb Mastery Challenge (final assessment) ───────────── */
  function validMastery(m) { return !!(m && Array.isArray(m.order) && m.order.length === MASTERY_IDS.length && m.order.every(function (id) { return MASTERY_IDS.indexOf(id) >= 0; }) && typeof m.i === 'number' && m.ans && typeof m.ans === 'object'); }
  function mAnswered() { var m = P.mastery; if (!validMastery(m)) return 0; return m.order.filter(function (id) { var a = m.ans[id]; return a && a.sel && a.sel.length; }).length; }
  function startMastery(fresh) {
    if (fresh || !validMastery(P.mastery)) P.mastery = { order: shuffle(MASTERY_IDS), i: 0, ans: {}, started: new Date().toISOString(), prior: MASTERY_IDS.filter(function (id) { return expo('m')[id]; }).length };
    saveP(); openMasteryQ(P.mastery.i);
  }
  function openMasteryQ(i) {
    var m = P.mastery; m.i = Math.max(0, Math.min(i, m.order.length - 1)); saveP();
    var v = { v: 'mastery' }; v.qs = newQS(QBY[m.order[m.i]], 'test', m.ans[m.order[m.i]]); go(v);
  }
  function masteryMeets(score) { return score >= MASTERY_BENCHMARK; }
  function catTable(byCat) {
    if (!byCat) return '';
    return '<div class="tbl-wrap"><table class="tbl small"><thead><tr><th scope="col">Skill category</th><th scope="col">Correct</th></tr></thead><tbody>' +
      MASTERY_CATS.map(function (c) { var r = byCat[c.id] || { right: 0, total: c.count }; return '<tr><th scope="row">' + esc(c.name) + '</th><td>' + r.right + ' of ' + r.total + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function screenMasteryIntro() {
    var h = topNav([btn('area', '← Verbs', { attrs: 'data-a="verbs"' })]);
    h += '<h1 id="scr-title" tabindex="-1">Verb Mastery Challenge</h1>';
    h += '<div class="card"><p class="lead">' + MASTERY_IDS.length + ' brand-new sentences. In each one, tap EVERY verb word: main verbs and their helpers.</p>';
    h += '<ul class="rules"><li>One sentence at a time. Use Back and Next.</li><li>No hints and no answers until you turn it in.</li><li>Your answers save by themselves. Take a break after every 10.</li><li>You do NOT have to finish in one sitting.</li><li>Goal: ' + MASTERY_BENCHMARK + ' of ' + MASTERY_IDS.length + ' correct.</li></ul>';
    var notDone = LESSONS.verbs.filter(function (l) { return !lessonDone('verbs', l.id); });
    if (notDone.length) h += '<p class="msg info mastery-ready">Coach tip: before the challenge, finish ' + esc(notDone.map(function (l) { return 'Lesson ' + l.id + ' (' + l.title + ')'; }).join(', ')) + '. The challenge includes 12 three-word verb teams (Lesson E) and 8 sentences with words between verb words (Lesson G), so do Lessons E and G too.</p>';
    else h += '<p class="msg good mastery-ready">All verb lessons, A through H, are done. You are ready!</p>';
    h += '<div class="end-btns">';
    if (validMastery(P.mastery)) {
      h += btn('mStart', 'Continue at sentence ' + (P.mastery.i + 1) + ' ▶', null, 'primary big');
      h += '</div><p class="center">' + mAnswered() + ' of ' + MASTERY_IDS.length + ' answered so far.</p>';
      if (view.confirmRestart) h += '<div class="confirm" role="alertdialog" aria-label="Confirm start over"><p><b>Start over?</b> Your saved answers for this challenge will be erased.</p>' + btn('mRestart', 'Yes, start over', null, 'danger') + ' ' + btn('mRestartNo', 'Cancel') + '</div>';
      else h += '<div class="end-btns">' + btn('mRestartAsk', 'Start over', null, 'ghost') + '</div>';
    } else h += btn('mStart', 'Start the challenge ▶', null, 'primary big') + '</div>';
    h += '</div>';
    if (P.masteryResults.length) { var r = P.masteryResults[P.masteryResults.length - 1]; h += '<div class="card"><h2>Last time</h2><p><b>' + r.score + ' of ' + r.total + '</b> · ' + (r.met ? 'Benchmark met' : 'Benchmark not met yet') + '</p></div>'; }
    return h;
  }
  function screenMastery() {
    var m = P.mastery, n = m.order.length;
    var h = topNav([btn('mPause', '⏸ Save and take a break'), btn('masteryIntro', 'Challenge info')]);
    h += '<p class="crumb">Verb Mastery Challenge · no hints until you turn it in</p>';
    h += '<div class="mbar" aria-hidden="true"><span style="width:' + Math.round(100 * (m.i + 1) / n) + '%"></span></div>';
    h += '<p class="steps-text">Sentence ' + (m.i + 1) + ' of ' + n + ' · ' + mAnswered() + ' answered</p>';
    h += '<section class="card"><h1 id="scr-title" tabindex="-1" class="sr-only">Sentence ' + (m.i + 1) + ' of ' + n + '</h1>' + qWidget(view.qs) + '</section>';
    h += '<div class="lesson-foot">' + (m.i > 0 ? btn('mPrev', '← Back') : '<span></span>') + (m.i < n - 1 ? btn('mNext', 'Next →', null, 'primary big') : btn('mReview', 'Review my answers →', null, 'primary big')) + '</div>';
    return h;
  }
  function screenMasteryBreak() {
    var h = '<section class="card center"><h1 id="scr-title" tabindex="-1">Break time? <span aria-hidden="true">⭐</span></h1>';
    h += '<p class="lead">You finished sentences 1 to ' + view.done + '. Your answers are saved.</p><p>Stretch, get a drink of water, or keep going. You can stop now and come back later.</p>';
    h += '<div class="end-btns">' + btn('mResume', 'Keep going: sentence ' + (view.done + 1), null, 'primary big') + btn('mPause', 'Take a break (go Home)', null, 'big') + '</div></section>';
    return h;
  }
  function screenMasteryReview() {
    var m = P.mastery, missing = [];
    m.order.forEach(function (id, i) { var a = m.ans[id]; if (!(a && a.sel && a.sel.length)) missing.push(i); });
    var h = topNav([btn('mResume', '← Back to sentences'), btn('mPause', 'Save and take a break')]);
    h += '<section class="card"><h1 id="scr-title" tabindex="-1">Ready to turn it in?</h1>';
    if (missing.length) {
      h += '<p class="lead">You have <b>' + missing.length + '</b> unanswered sentence' + (missing.length > 1 ? 's' : '') + '. Tap a number to go there:</p><div class="jump-grid">';
      missing.forEach(function (i) { h += btn('mJump', String(i + 1), { attrs: 'data-i="' + i + '" aria-label="Go to sentence ' + (i + 1) + '"', key: 'r' + i }, 'small'); });
      h += '</div><p>Unanswered sentences count as not correct.</p>';
    } else h += '<p class="lead">All ' + m.order.length + ' sentences have an answer. Nice!</p>';
    h += '<div class="end-btns">' + btn('mSubmit', 'Turn it in', null, 'primary big') + btn('mResume', 'Keep checking', null, 'big') + '</div></section>';
    return h;
  }
  function verbDiagnosis(q, sel) {
    sel = sel || [];
    if (!sel.length) return ['No answer was given.'];
    var notes = [];
    var extra = sel.filter(function (i) { return q.ans.indexOf(i) < 0; }).map(function (i) { return q.toks[i].w; });
    q.teams.forEach(function (t) {
      var main = t[t.length - 1], helpers = t.slice(0, -1);
      var mh = helpers.filter(function (i) { return sel.indexOf(i) < 0; }).map(function (i) { return q.toks[i].w; });
      if (sel.indexOf(main) < 0) notes.push('Missed the main verb “' + q.toks[main].w + '”.');
      if (mh.length) notes.push('Missed the helper' + (mh.length > 1 ? 's' : '') + ' “' + mh.join('”, “') + '”.');
    });
    if (extra.length) notes.push('Extra word' + (extra.length > 1 ? 's' : '') + ' that ' + (extra.length > 1 ? 'are' : 'is') + ' not a verb here: “' + extra.join('”, “') + '”.');
    return notes;
  }
  function submitMastery() {
    var m = P.mastery, byCat = {};
    MASTERY_CATS.forEach(function (c) { byCat[c.id] = { right: 0, total: 0 }; });
    var items = MASTERY_IDS.map(function (id) { var q = QBY[id], g = m.ans[id] || null, ok = gradeOnly(q, g); byCat[q.cat].total++; if (ok) byCat[q.cat].right++; return { id: id, ok: ok, given: g }; });
    var score = items.filter(function (x) { return x.ok; }).length, met = masteryMeets(score), prior = m.prior || 0;
    P.masteryResults.push({ date: new Date().toISOString(), score: score, total: items.length, met: met, byCat: byCat, prior: prior, missed: items.filter(function (x) { return !x.ok; }).map(function (x) { return x.id; }) });
    if (P.masteryResults.length > 10) P.masteryResults = P.masteryResults.slice(-10);
    P.mastery = null; P.resume = null; saveP();
    go({ v: 'masteryResult', items: items, score: score, met: met, byCat: byCat, prior: prior });
  }
  function screenMasteryResult() {
    var n = view.items.length, need = MASTERY_BENCHMARK - view.score;
    var h = '<section class="card center"><h1 id="scr-title" tabindex="-1">Verb Mastery Challenge results</h1><p class="score">' + view.score + ' of ' + n + ' correct</p>';
    h += view.met ? '<p class="msg good mresult">Benchmark met: ' + MASTERY_BENCHMARK + ' or more of ' + n + ' with no help. <span aria-hidden="true">⭐</span></p>'
      : '<p class="msg fix mresult">Not yet. The goal is ' + MASTERY_BENCHMARK + ' of ' + n + '. ' + need + ' more correct sentence' + (need > 1 ? 's' : '') + ' will reach it. Practice the skills below, then try again.</p>';
    h += '<p class="muted small exposure">' + (view.prior ? 'For grown-ups: ' + view.prior + ' of ' + n + ' sentences were seen in an earlier attempt, so this is not a fully unseen result.' : 'For grown-ups: all ' + n + ' sentences were new on this attempt (unseen result).') + '</p>';
    h += '</section><div class="card"><h2>Results by skill</h2>' + catTable(view.byCat) + '</div>';
    var missed = view.items.filter(function (x) { return !x.ok; });
    if (missed.length) {
      var cats = []; missed.forEach(function (it) { var c = QBY[it.id].cat; if (cats.indexOf(c) < 0) cats.push(c); });
      h += '<div class="card"><h2>Recommended practice</h2><div class="end-btns">';
      MASTERY_CATS.filter(function (c) { return cats.indexOf(c.id) >= 0; }).forEach(function (c) {
        var l = lessonForSkill('verbs', c.skill);
        h += '<button type="button" class="btn big" data-act="lessonV" data-l="' + l.id + '" data-fkey="l' + c.id + '">Lesson ' + l.id + ': ' + esc(l.title) + '</button>';
        h += btn('practiceSkill', 'Guided practice: ' + esc(skillById('verbs', c.skill).name), { attrs: 'data-a="verbs" data-sk="' + c.skill + '" data-mode="guided"', key: 'p' + c.id }, 'big');
      });
      h += '</div></div><h2 class="section-h">Sentences to learn from (' + missed.length + ')</h2>';
      missed.forEach(function (it) {
        var q = QBY[it.id], sel = it.given && it.given.sel ? it.given.sel.slice().sort(function (x, y) { return x - y; }) : [];
        var cat = MASTERY_CATS.filter(function (c) { return c.id === q.cat; })[0], l = lessonForSkill('verbs', cat.skill);
        h += '<div class="card review missed-item"><p class="rq">' + esc(plainSentence(q)) + '</p>' + sentenceHTML(q, { show: true });
        h += '<p><b>Your selections:</b> <span class="your-sel">' + esc(sel.length ? sel.map(function (i) { return q.toks[i].w; }).join(', ') : '(none)') + '</span></p>';
        h += '<p><b>Correct verb words:</b> ' + esc(q.ans.map(function (i) { return q.toks[i].w; }).join(', ')) + '</p>';
        h += '<p class="msg fix">' + esc(verbDiagnosis(q, sel).join(' ')) + '</p><p class="msg info">' + esc(q.ex) + '</p>';
        h += '<p class="small"><b>Practice:</b> Lesson ' + l.id + ' – ' + esc(l.title) + ' (' + esc(cat.name) + ')</p></div>';
      });
    }
    h += '<div class="end-btns">' + btn('area', 'Back to Verbs', { attrs: 'data-a="verbs"' }, 'primary big') + btn('home', '⌂ Home', null, 'big') + '</div>';
    return h;
  }

  /* ───────────── render ───────────── */
  function screenHTML() {
    switch (view.v) {
      case 'home': return screenHome();
      case 'area': return screenArea();
      case 'learn': return screenLearn();
      case 'lesson': return screenLesson();
      case 'lessonEnd': return screenLessonEnd();
      case 'pick': return screenPick();
      case 'round': return screenRound();
      case 'roundEnd': return screenRoundEnd();
      case 'testSetup': return screenTestSetup();
      case 'test': return screenTest();
      case 'testReview': return screenTestReview();
      case 'testResult': return screenTestResult();
      case 'guides': return screenGuides();
      case 'sheet': return screenSheet();
      case 'grown': return screenGrown();
      case 'masteryIntro': return screenMasteryIntro();
      case 'mastery': return screenMastery();
      case 'masteryBreak': return screenMasteryBreak();
      case 'masteryReview': return screenMasteryReview();
      case 'masteryResult': return screenMasteryResult();
    }
    return screenHome();
  }
  function renderNotice() {
    var n = D.getElementById('notice');
    if (!n) return;
    if (storageNote && !noticeDismissed) { n.hidden = false; n.innerHTML = '<span>' + esc(storageNote) + '</span> <button type="button" class="btn small" data-act="dismissNotice">OK</button>'; }
    else { n.hidden = true; n.innerHTML = ''; }
  }
  function render(focusTitle) {
    var active = D.activeElement, fkey = active && active.getAttribute ? active.getAttribute('data-fkey') : null;
    markShown();
    app.innerHTML = screenHTML();
    D.body.setAttribute('data-view', view.v);
    renderNotice();
    drawLinks();
    if (focusTitle) {
      window.scrollTo(0, 0);
      var t = D.getElementById('scr-title'); if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
    } else if (fkey) {
      var el = app.querySelector('[data-fkey="' + fkey + '"]');
      if (!el || el.disabled) el = app.querySelector('[data-fkey="lnext"]') || app.querySelector('[data-fkey="nextQ"]') || app.querySelector('.fb');
      if (el) { if (!el.hasAttribute('tabindex') && el.classList.contains('fb')) el.setAttribute('tabindex', '-1'); try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    }
  }
  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(drawLinks, 120); });

  /* ───────────── events ───────────── */
  D.addEventListener('submit', function (e) {
    var f = e.target; if (!f.getAttribute('data-form')) return;
    e.preventDefault();
    var v = (f.querySelector('input').value || '').trim().slice(0, 20);
    P.nick = v || 'Player'; saveP(); view.editName = false; render(true);
  });
  D.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el || el.getAttribute('aria-disabled') === 'true' && el.getAttribute('data-act') !== 'check') return;
    var act = el.getAttribute('data-act');
    var A = function (n) { return el.getAttribute('data-' + n); };
    switch (act) {
      case 'home': return go({ v: 'home' });
      case 'say': return speak(A('text'));
      case 'dismissNotice': noticeDismissed = true; renderNotice(); return;
      case 'editName': view.editName = true; render(); var inp = D.getElementById('nick'); if (inp) inp.focus(); return;
      case 'editNameG': view = { v: 'home', editName: true }; render(true); var inp2 = D.getElementById('nick'); if (inp2) inp2.focus(); return;
      case 'cancelName': view.editName = false; return render(true);
      case 'resume': return doResume();
      case 'dayLesson': return startLesson(P.daily.a, lessonById(P.daily.a, skillById(P.daily.a, P.daily.sk).lesson).id, 0);
      case 'dayPractice': return startRound(P.daily.a, 'practice', P.daily.sk, null);
      case 'area': return go({ v: 'area', a: A('a') || view.a });
      case 'learn': return go({ v: 'learn', a: view.a });
      case 'lesson': return startLesson(view.a, A('l'), 0);
      case 'lessonV': return startLesson('verbs', A('l'), 0);
      case 'pick': return go({ v: 'pick', a: view.a, mode: A('mode') });
      case 'startRound': return startRound(view.a, view.mode, A('sk') || null, null);
      case 'startStory': return startRound('reading', view.mode, null, A('p'));
      case 'practiceSkill': return startRound(A('a'), A('mode') || 'practice', A('sk'), null);
      case 'testSetup': return go({ v: 'testSetup', a: view.a });
      case 'startTest': return startTest(view.a, parseInt(A('n'), 10));
      case 'guides': return go({ v: 'guides' });
      case 'grown': return go({ v: 'grown' });
      case 'sheet': return go({ v: 'sheet', k: A('k') });
      case 'print': return window.print();
      case 'pdfDownload': {
        try { var url = getPdfURL(), link = D.createElement('a'); link.href = url; link.download = 'Chris_II_Verb_Memory_Guide.pdf'; D.body.appendChild(link); link.click(); link.remove(); } catch (err) { alert('Sorry, the PDF could not be downloaded in this browser.'); }
        return;
      }
      case 'pdfOpen': { try { window.open(getPdfURL(), '_blank'); } catch (err2) { /* ignore */ } return; }
      case 'askReset': view.confirmReset = true; return render();
      case 'cancelReset': view.confirmReset = false; return render(true);
      case 'doReset': {
        P = defP(); saveP(); view.confirmReset = false; render(true); return;
      }
      // lessons
      case 'lnext': {
        var les = lessonById(view.a, view.l);
        if (view.step >= les.steps.length - 1) { P.lessons[view.a + ':' + view.l] = true; markDaily('lesson'); saveP(); return go({ v: 'lessonEnd', a: view.a, l: view.l }); }
        view.step++; setLessonQS(view); saveResume(); return render(true);
      }
      case 'lback': {
        if (view.step === 0) return go({ v: 'learn', a: view.a });
        view.step--; setLessonQS(view); saveResume(); return render(true);
      }
      case 'lrepeat': view.step = 0; view.cards = { f: 0, covered: false, revealed: false }; setLessonQS(view); saveResume(); return render(true);
      case 'fam': view.cards = { f: parseInt(A('i'), 10), covered: false, revealed: false }; return render();
      case 'cover': view.cards.covered = true; view.cards.revealed = false; render(); var rv = app.querySelector('[data-fkey="reveal"]'); if (rv) rv.focus(); return;
      case 'reveal': view.cards.covered = false; view.cards.revealed = true; render(); var cv = app.querySelector('[data-fkey="cover"]'); if (cv) cv.focus(); return;
      // practice rounds
      case 'nextQ': {
        if (view.i >= view.ids.length - 1) { markDaily('practice'); return go({ v: 'roundEnd', a: view.a, mode: view.mode, sk: view.sk, story: view.story, ids: view.ids, res: view.res }); }
        view.i++; view.qs = newQS(QBY[view.ids[view.i]], view.mode); flash = null; saveResume(); return render(true);
      }
      case 'quitRound': P.resume = null; saveP(); return go({ v: 'area', a: view.a });
      case 'again': {
        if (view.story) { var nx = storyOrder()[0]; return startRound('reading', view.mode, null, nx.id); }
        return startRound(view.a, view.mode, view.sk, null);
      }
      // tests
      case 'tnext': case 'tprev': case 'tjump': {
        view.ans[view.qs.q.id] = saveAnswer(view.qs);
        view.i = act === 'tnext' ? view.i + 1 : act === 'tprev' ? view.i - 1 : parseInt(A('i'), 10);
        view.v = 'test'; view.qs = newQS(QBY[view.ids[view.i]], 'test', view.ans[view.ids[view.i]]); saveResume(); return render(true);
      }
      case 'treview': view.ans[view.qs.q.id] = saveAnswer(view.qs); view.v = 'testReview'; saveResume(); return render(true);
      case 'tback': view.v = 'test'; view.qs = newQS(QBY[view.ids[view.i]], 'test', view.ans[view.ids[view.i]]); return render(true);
      case 'submitTest': return submitTest();
      case 'masteryIntro': return go({ v: 'masteryIntro' });
      case 'mStart': return startMastery(false);
      case 'mRestartAsk': view.confirmRestart = true; return render();
      case 'mRestartNo': view.confirmRestart = false; return render(true);
      case 'mRestart': return startMastery(true);
      case 'mPrev': case 'mNext': case 'mJump': {
        if (view.v === 'mastery') P.mastery.ans[view.qs.q.id] = saveAnswer(view.qs);
        var cur = P.mastery.i;
        if (act === 'mNext' && (cur + 1) % 10 === 0 && cur + 1 < MASTERY_IDS.length) { P.mastery.i = cur + 1; saveP(); return go({ v: 'masteryBreak', done: cur + 1 }); }
        return openMasteryQ(act === 'mNext' ? cur + 1 : act === 'mPrev' ? cur - 1 : parseInt(A('i'), 10));
      }
      case 'mResume': return openMasteryQ(P.mastery.i);
      case 'mPause': if (view.v === 'mastery') P.mastery.ans[view.qs.q.id] = saveAnswer(view.qs); saveP(); return go({ v: 'home' });
      case 'mReview': P.mastery.ans[view.qs.q.id] = saveAnswer(view.qs); saveP(); return go({ v: 'masteryReview' });
      case 'mSubmit': return submitMastery();
      case 'quitTest': P.resume = null; saveP(); return go({ v: 'area', a: view.a });
      // question actions
      case 'tok': case 'choice': case 'sort': case 'ev': case 'hint': case 'check': case 'showme':
        return qAct(act, el);
    }
  });

  /* Test hooks for automated checks (harmless in normal use) */
  window.__CLC = { QBY: QBY, AREA_Q: AREA_Q, gradeOnly: gradeOnly, evaluate: function (q, sel) { return evaluate({ q: q, sel: sel, phase: null }); }, lessonQ: lessonQ, P: function () { return P; }, view: function () { return view; }, CHECK_Q: CHECK_Q, MASTERY_Q: MASTERY_Q, masteryMeets: masteryMeets };

  render(true);
})();
