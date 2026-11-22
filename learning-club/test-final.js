// Verifies image placement, the daily plan, the E/G mastery recommendation, and de-duplicated navigation.
const { chromium } = require('playwright'); const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../chriss-learning-club.html');
const R = []; const ok = (n, c, i) => R.push((c ? 'PASS ' : 'FAIL ') + n + (i !== undefined ? '  (' + i + ')' : ''));
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(FILE);
  const shown = async () => p.evaluate(() => [...document.querySelectorAll('img.pic')].map(i => Object.keys(IMAGES).find(k => IMAGES[k] === i.getAttribute('src'))));
  const used = new Set();
  const expect = async (label, key) => { const s = await shown(); s.forEach(k => used.add(k)); ok('image: ' + label + ' shows "' + key + '"', s.includes(key), s.join(',')); };
  ok('7 images embedded', await p.evaluate(() => Object.keys(IMAGES).length === 7), await p.evaluate(() => Object.keys(IMAGES).join(',')));
  await expect('home welcome', 'home');
  ok('home does NOT use the swinging image', !(await shown()).includes('verbs'));
  for (const [area, key] of [['verbs', 'verbs'], ['nouns', 'nouns'], ['adjectives', 'adjectives'], ['adverbs', 'adverbs'], ['vowels', 'vowels'], ['reading', 'reading']]) {
    await p.click('[data-act="home"] >> nth=0'); await p.click(`[data-act="area"][data-a="${area}"]`); await expect(area + ' screen', key);
  }
  const lessonImg = async (area, l, steps, key, label) => { await p.click('[data-act="home"] >> nth=0'); await p.click(`[data-act="area"][data-a="${area}"]`); await p.click('[data-act="learn"]'); await p.click(`[data-act="lesson"][data-l="${l}"]`); for (let i = 0; i < steps; i++) await p.click('[data-act="lnext"]'); await expect(label, key); };
  await lessonImg('verbs', 'A', 1, 'verbs', '"Chris swings the bat" worked example');
  ok('swing example uses swing image, not mascot', !(await shown()).includes('home') && /Chris\s*swings\s*the\s*bat/.test((await p.textContent('.worked')).replace(/verb/g, '')));
  await lessonImg('nouns', 'E', 2, 'nouns', '"The coach stood on the field"');
  await lessonImg('adjectives', 'A', 1, 'adjectives', '"The red ball rolled"');
  await lessonImg('adverbs', 'A', 1, 'adverbs', '"Chris runs quickly"');
  await lessonImg('vowels', 'D', 1, 'vowels', 'silent e cap -> cape');
  await lessonImg('reading', 'A', 0, 'reading', 'reading introduction (Lesson A)');
  await p.click('[data-act="home"] >> nth=0'); await p.click('[data-act="area"][data-a="reading"]'); await p.click('[data-act="pick"][data-mode="practice"]'); await p.click('[data-act="startStory"][data-p="p1"]'); await expect('teamwork story', 'reading');
  ok('all 7 images are actually displayed somewhere', used.size === 7, [...used].join(','));

  // navigation: no duplicate Home buttons in screen controls; lessons have one Back (bottom)
  await p.click('[data-act="home"] >> nth=0'); await p.click('[data-act="area"][data-a="verbs"]'); await p.click('[data-act="learn"]'); await p.click('[data-act="lesson"][data-l="B"]'); await p.click('[data-act="lnext"]');
  ok('lesson: one Back button, no duplicate Home in screen controls', (await p.locator('[data-act="lback"]').count()) === 1 && (await p.locator('.subnav [data-act="home"]').count()) === 0);
  for (const [area, act] of [['nouns', 'testSetup'], ['adverbs', 'pick']]) { await p.click('[data-act="home"] >> nth=0'); await p.click(`[data-act="area"][data-a="${area}"]`); await p.click(`[data-act="${act}"] >> nth=0`); ok(area + ' ' + act + ': header Home only', (await p.locator('.subnav [data-act="home"]').count()) === 0 && (await p.locator('header [data-act="home"]').count()) >= 1); }

  // mastery recommendation includes E and G
  await p.click('[data-act="home"] >> nth=0'); await p.click('[data-act="area"][data-a="verbs"]'); await p.click('[data-act="masteryIntro"]');
  const tip = await p.textContent('.mastery-ready');
  ok('mastery intro recommends Lessons E and G', /Lesson E/.test(tip) && /Lesson G/.test(tip) && /do Lessons E and G too/.test(tip), tip.slice(0, 160));
  // after core lessons, area suggests E then G
  await p.evaluate(() => { const P = window.__CLC.P(); ['A', 'B', 'C', 'D', 'F', 'H', 'I', 'J', 'K'].forEach(l => P.lessons['verbs:' + l] = true); });
  await p.click('[data-act="area"][data-a="verbs"]');
  ok('verbs screen suggests Lesson E for the challenge', /Lesson E: Longer Verb Teams.*Benchmark tests it/.test(await p.textContent('.lead')));

  // daily plan: one lesson + five practice questions, checks off
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } }); const q = await ctx2.newPage(); q.on('pageerror', e => errs.push(e.message)); await q.goto(FILE);
  const plan = await q.textContent('.daily');
  ok('home shows daily plan: 1 lesson + 5 practice questions', /1 lesson:/.test(plan) && /5 practice questions:/.test(plan), plan.replace(/\s+/g, ' ').slice(0, 160));
  await q.click('[data-act="dayLesson"]');
  for (let n = 0; n < 30 && (await q.evaluate(() => window.__CLC.view().v)) === 'lesson'; n++) {
    if (await q.evaluate(() => { const v = window.__CLC.view(); return v.qs && !v.qs.done; })) { if (!(await q.locator('[data-act="showme"]').count())) await q.click('[data-act="hint"]'); await q.click('[data-act="showme"]'); }
    await q.click('[data-act="lnext"]');
  }
  await q.click('[data-act="home"] >> nth=0');
  ok('lesson step checked off', (await q.locator('.daily-steps li.done').count()) === 1);
  await q.click('[data-act="dayPractice"]');
  ok('practice round has 5 questions', (await q.evaluate(() => window.__CLC.view().ids.length)) === 5);
  for (let k = 0; k < 5; k++) { if (!(await q.locator('[data-act="showme"]').count())) await q.click('[data-act="hint"]'); await q.click('[data-act="showme"]'); await q.click('[data-act="nextQ"]'); }
  await q.click('[data-act="home"] >> nth=0');
  ok('both steps checked off + done message', (await q.locator('.daily-steps li.done').count()) === 2 && /plan is done/.test(await q.textContent('.daily')));
  await q.reload(); ok('daily plan persists after reload', (await q.locator('.daily-steps li.done').count()) === 2);
  ok('no horizontal scroll on home with plan', await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await q.screenshot({ path: process.argv[2] || '/tmp/daily.png' });
  ok('no JS errors', errs.length === 0, errs.join('|'));
  await b.close(); console.log(R.join('\n')); const f = R.filter(x => x.startsWith('FAIL')).length; console.log(`\n${R.length - f} passed, ${f} failed`); process.exit(f ? 1 : 0);
})().catch(e => { console.error(e); console.log(R.join('\n')); process.exit(1); });
