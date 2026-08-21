/* =========================================================
   Add It! — Build 2: Addition Engine
   Build 1 shell + wizard preserved unchanged.
   New in Build 2 (logic only, no student-facing UI change):
     - calculateAddition(top, bottom): pure column-by-column
       engine producing a complete problem object
     - generateProblem({skill, size}): guaranteed-valid
       no-regroup / regroup / mixed generation for 2/3/4/mixed
     - problemKey(problem): normalized commutative dedup key
     - buildProblemSet({skill, size, length}): balanced,
       duplicate-free 10/25/50 sets (logic only)
     - validateProblem(problem, skill, size): independent
       recalculation used by the automated audit
   Terminology: the app teaches REGROUPING (10 ones -> 1 ten).
   Internal fields keep the conventional carryIn/carryOut names
   for the math model; instructional copy says "regroup".
   ========================================================= */

(function () {
  "use strict";

  const BUILD_NUMBER = "Build 2";

  /* =========================================================
     SECTION A — SHELL + WIZARD (Build 1, preserved)
     ========================================================= */

  /* ---------- Config ---------- */
  const SKILLS = {
    "no-regroup": { displayName: "No Regrouping" },
    "regroup":    { displayName: "Regrouping" },
    "mixed":      { displayName: "Mixed" }
  };
  const SIZES = {
    "2":     { displayName: "2 Digits" },
    "3":     { displayName: "3 Digits" },
    "4":     { displayName: "4 Digits" },
    "mixed": { displayName: "Mixed Sizes" }
  };
  const MODES = ["learn", "practice", "test"];
  const TEST_LENGTHS = [10, 25, 50];

  /* ---------- State ---------- */
  const state = {
    skill: null,        // "no-regroup" | "regroup" | "mixed"
    size: null,         // "2" | "3" | "4" | "mixed"
    mode: null,         // "learn" | "practice" | "test"
    testLength: 10,     // 10 | 25 | 50
    wizardStep: 1       // 1..4
  };

  const el = id => document.getElementById(id);

  /* ---------- Screens ---------- */
  const SCREENS = ["wizard", "learn", "practice", "test"];
  function showScreen(name) {
    SCREENS.forEach(s => { const n = el("screen-" + s); if (n) n.hidden = (s !== name); });
    window.scrollTo(0, 0);
  }

  /* ---------- Wizard ---------- */
  function startWizard() {
    state.skill = null;
    state.size = null;
    state.mode = null;
    state.testLength = 10;
    setWizardStep(1);
    showScreen("wizard");
  }

  function setWizardStep(step) {
    ["1", "2", "3", "4"].forEach(s => { el("wiz-step-" + s).hidden = (s !== String(step)); });

    const showLen = (step === 4);
    Array.from(el("wiz-progress").querySelectorAll(".wp-len")).forEach(n => { n.hidden = !showLen; });

    Array.from(el("wiz-progress").querySelectorAll("[data-wstep]")).forEach(li => {
      const s = Number(li.dataset.wstep);
      li.classList.toggle("done", s < step);
      li.classList.toggle("current", s === step);
    });

    el("wiz-back").hidden = (step === 1);
    el("wiz-home").hidden = (step === 1);

    state.wizardStep = step;
    reflectSelections(step);
  }

  function reflectSelections(step) {
    if (step === 1) {
      Array.from(document.querySelectorAll(".skill-grid .pick-card")).forEach(c =>
        c.setAttribute("aria-checked", String(c.dataset.skill === state.skill)));
    }
    if (step === 2) {
      Array.from(document.querySelectorAll(".size-grid .pick-card")).forEach(c =>
        c.setAttribute("aria-checked", String(c.dataset.size === state.size)));
    }
    if (step === 4) {
      Array.from(document.querySelectorAll(".length-grid .pick-card")).forEach(c =>
        c.setAttribute("aria-checked", String(Number(c.dataset.length) === state.testLength)));
    }
  }

  function chooseSkill(skill) {
    if (!SKILLS[skill]) return;
    state.skill = skill;
    state.size = null;
    el("size-context").textContent = "For " + SKILLS[skill].displayName + ", pick how big the numbers should be.";
    setWizardStep(2);
  }

  function chooseSize(size) {
    if (!SIZES[size]) return;
    state.size = size;
    setWizardStep(3);
  }

  function chooseMode(mode) {
    if (MODES.indexOf(mode) === -1) return;
    state.mode = mode;
    if (mode === "learn") startLearn();
    else if (mode === "practice") startPractice();
    else setWizardStep(4);
  }

  function chooseLength(n) {
    n = Number(n);
    if (TEST_LENGTHS.indexOf(n) === -1) n = 10;
    state.testLength = n;
    startTest();
  }

  function wizardBack() {
    if (state.wizardStep === 4) setWizardStep(3);
    else if (state.wizardStep === 3) setWizardStep(2);
    else if (state.wizardStep === 2) setWizardStep(1);
  }

  /* ---------- Selected-value chips ---------- */
  function skillChipText() { return state.skill ? SKILLS[state.skill].displayName : ""; }
  function sizeChipText()  { return state.size ? SIZES[state.size].displayName : ""; }

  function stampChips(prefix) {
    if (el(prefix + "-skill-chip")) el(prefix + "-skill-chip").textContent = skillChipText();
    if (el(prefix + "-size-chip"))  el(prefix + "-size-chip").textContent  = sizeChipText();
    if (el(prefix + "-length-chip")) el(prefix + "-length-chip").textContent = state.testLength + " Questions";
    if (el(prefix + "-ph-skill")) el(prefix + "-ph-skill").textContent = skillChipText();
    if (el(prefix + "-ph-size"))  el(prefix + "-ph-size").textContent  = sizeChipText();
    if (el(prefix + "-ph-length")) el(prefix + "-ph-length").textContent = state.testLength + " Questions";
  }

  /* ---------- Placeholder destinations ---------- */
  function startLearn()    { stampChips("learn");    showScreen("learn"); }
  function startPractice() { stampChips("practice"); showScreen("practice"); }
  function startTest()     { stampChips("test");     showScreen("test"); }

  function backToModeStep() {
    state.mode = null;
    setWizardStep(3);
    showScreen("wizard");
  }

  /* ---------- Build badge ---------- */
  function renderBuildBadge() {
    el("build-badge").textContent = "Add It! \u2014 " + BUILD_NUMBER;
  }

  /* =========================================================
     SECTION B — ADDITION ENGINE (Build 2)
     Pure logic. No DOM dependencies. Independently testable.
     ========================================================= */

  /* ---------- Engine config ---------- */
  const PLACE_NAMES = [
    "ones",
    "tens",
    "hundreds",
    "thousands",
    "ten-thousands"   // reachable only via the final regroup of 4-digit addends
  ];
  const ENGINE_SIZES = [2, 3, 4];          // digit lengths generated in Build 2
  const GEN_MAX_ATTEMPTS = 500;            // per-problem bounded generation loop
  const SET_MAX_ATTEMPTS_FACTOR = 40;      // per-set bounded dedup loop

  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const digitCount = n => String(n).length;

  /* ---------- Core column engine ----------
     calculateAddition(topNumber, bottomNumber)
     Pure function. Processes columns right to left:
       rawTotal    = topDigit + bottomDigit + carryIn
       answerDigit = rawTotal % 10
       carryOut    = Math.floor(rawTotal / 10)
     Preserves the final carry (e.g. 9,999 + 9,999 = 19,998)
     and records, per column, everything Build 3+ needs to
     render and teach WITHOUT recalculating any math:
       "rawTotal ones = carryOut ten(s) + answerDigit one(s)". */
  function calculateAddition(topNumber, bottomNumber) {
    if (!Number.isInteger(topNumber) || !Number.isInteger(bottomNumber)) {
      throw new Error("calculateAddition: addends must be integers");
    }
    if (topNumber < 0 || bottomNumber < 0) {
      throw new Error("calculateAddition: addends must be positive whole numbers");
    }

    const topStr = String(topNumber);
    const botStr = String(bottomNumber);
    const width = Math.max(topStr.length, botStr.length);
    const digitAt = (str, indexFromRight) => {
      const i = str.length - 1 - indexFromRight;
      return i >= 0 ? str.charCodeAt(i) - 48 : 0;
    };

    const columns = [];
    let carry = 0;
    for (let i = 0; i < width; i++) {
      const topDigit = digitAt(topStr, i);
      const bottomDigit = digitAt(botStr, i);
      const carryIn = carry;
      const rawTotal = topDigit + bottomDigit + carryIn;
      const answerDigit = rawTotal % 10;
      const carryOut = Math.floor(rawTotal / 10);
      columns.push({
        indexFromRight: i,
        place: PLACE_NAMES[i],
        topDigit: topDigit,
        bottomDigit: bottomDigit,
        carryIn: carryIn,
        rawTotal: rawTotal,
        answerDigit: answerDigit,
        carryOut: carryOut,
        regrouped: carryOut > 0,
        // Where the regrouped value lands (e.g. ones -> tens),
        // so Learn can say "14 ones = 1 ten + 4 ones" directly.
        carryPlace: PLACE_NAMES[i + 1]
      });
      carry = carryOut;
    }

    const finalCarry = carry;                       // 0 or 1 for two addends
    const answer = topNumber + bottomNumber;
    const anyRegroup = columns.some(c => c.regrouped);

    return {
      topNumber: topNumber,
      bottomNumber: bottomNumber,
      answer: answer,
      digitLength: width,                            // width of the addend columns
      answerDigitLength: digitCount(answer),
      skillType: anyRegroup ? "regroup" : "no-regroup",
      regroupCount: columns.filter(c => c.regrouped).length,
      regroupPlaces: columns.filter(c => c.regrouped).map(c => c.place),
      finalCarry: finalCarry,
      finalCarryPlace: finalCarry ? PLACE_NAMES[width] : null,
      columns: columns
    };
  }

  /* ---------- Generators ---------- */

  // "no-regroup": build digits directly so that EVERY column obeys
  // topDigit + bottomDigit < 10 (carry-in therefore always 0).
  // Leading digits are both >= 1 and still sum below 10.
  // Constructive, then validated — never generate-and-hope.
  function generateNoRegroupAddends(len) {
    let top = "", bottom = "";
    for (let i = 0; i < len; i++) {
      const leading = (i === 0);
      let a, b;
      if (leading) {
        a = randInt(1, 8);            // leave room for b >= 1 with a + b <= 9
        b = randInt(1, 9 - a);
      } else {
        a = randInt(0, 9);
        b = randInt(0, 9 - a);
      }
      // Randomly swap so the larger digit isn't biased to the top row.
      if (Math.random() < 0.5) { const t = a; a = b; b = t; }
      if (leading && a === 0) { const t = a; a = b; b = t; }   // no leading zero on top
      if (leading && b === 0) { b = 1; if (a + b > 9) a = randInt(1, 8), b = randInt(1, 9 - a); }
      top += String(a);
      bottom += String(b);
    }
    return [parseInt(top, 10), parseInt(bottom, 10)];
  }

  // "regroup": random addends of the requested length, retried (bounded)
  // until at least one column regroups. Random pairs regroup often, so this
  // converges almost immediately while producing natural variety in WHICH
  // columns regroup (ones / tens / hundreds / thousands, single / multiple /
  // consecutive). A constructive fallback guarantees termination.
  function generateRegroupAddends(len) {
    const lo = Math.pow(10, len - 1);
    const hi = Math.pow(10, len) - 1;
    for (let i = 0; i < GEN_MAX_ATTEMPTS; i++) {
      const a = randInt(lo, hi);
      const b = randInt(lo, hi);
      if (calculateAddition(a, b).skillType === "regroup") return [a, b];
    }
    // Deterministic fallback: force a ones-column regroup.
    const a = lo + randInt(0, hi - lo - 9);
    const aOnes = a % 10;
    const b = lo + (9 - (lo % 10)) + Math.max(0, 10 - aOnes - (9 - (lo % 10)));
    return [a, Math.min(b, hi)];
  }

  function pickSizeLength(size) {
    if (size === "mixed") return ENGINE_SIZES[randInt(0, ENGINE_SIZES.length - 1)];
    return parseInt(size, 10);
  }

  function pickSkillType(skill) {
    if (skill === "mixed") return Math.random() < 0.5 ? "no-regroup" : "regroup";
    return skill;
  }

  // generateProblem({ skill, size }) -> one fully calculated, validated problem.
  // skill: "no-regroup" | "regroup" | "mixed"
  // size:  "2" | "3" | "4" | "mixed"
  function generateProblem(opts) {
    opts = opts || {};
    const skill = opts.skill || state.skill || "mixed";
    const size = opts.size || state.size || "mixed";
    if (!SKILLS[skill]) throw new Error("generateProblem: unknown skill " + skill);
    if (!SIZES[size]) throw new Error("generateProblem: unknown size " + size);

    // opts.forceLength / opts.forceSkillType let buildProblemSet control
    // deliberate distributions; single-problem callers never need them.
    const len = opts.forceLength || pickSizeLength(size);
    const subtype = opts.forceSkillType || pickSkillType(skill);

    const pair = subtype === "no-regroup"
      ? generateNoRegroupAddends(len)
      : generateRegroupAddends(len);

    const problem = calculateAddition(pair[0], pair[1]);
    problem.requestedSkill = skill;      // what the wizard asked for
    problem.requestedSize = size;        // (skillType reports what was built)
    return problem;
  }

  /* ---------- Duplicate prevention ----------
     Addition is commutative: 459+287 and 287+459 are the same
     pair to a student, so the key is order-normalized. */
  function problemKey(problem) {
    const a = problem.topNumber, b = problem.bottomNumber;
    return [Math.min(a, b), Math.max(a, b)].join("+");
  }

  /* ---------- Problem set generator (logic only in Build 2) ----------
     buildProblemSet({ skill, size, length }) -> array of problems.
     - exact requested length (10 / 25 / 50)
     - no duplicate normalized keys
     - deliberate distribution, then shuffle:
         mixed skill -> half no-regroup / half regroup (odd lengths
                        give the extra slot to regroup)
         mixed size  -> lengths dealt round-robin across 2/3/4 digits
                        so every size appears in any 10+ set
     - bounded loops; falls back to accepting a rare duplicate rather
       than ever risking an infinite loop (flagged via meta). */
  function buildProblemSet(opts) {
    opts = opts || {};
    const skill = opts.skill || "mixed";
    const size = opts.size || "mixed";
    const length = TEST_LENGTHS.indexOf(Number(opts.length)) !== -1 ? Number(opts.length) : 10;
    if (!SKILLS[skill]) throw new Error("buildProblemSet: unknown skill " + skill);
    if (!SIZES[size]) throw new Error("buildProblemSet: unknown size " + size);

    // Deliberate slot plan (then shuffled) instead of raw randomness.
    const slots = [];
    for (let i = 0; i < length; i++) {
      const slotSkill = skill === "mixed"
        ? (i % 2 === 0 ? "regroup" : "no-regroup")
        : skill;
      const slotLen = size === "mixed"
        ? ENGINE_SIZES[i % ENGINE_SIZES.length]
        : parseInt(size, 10);
      slots.push({ skillType: slotSkill, len: slotLen });
    }
    shuffle(slots);

    const used = new Set();
    const problems = [];
    let duplicateFallbacks = 0;
    const maxAttempts = length * SET_MAX_ATTEMPTS_FACTOR;
    let attempts = 0;

    for (let s = 0; s < slots.length; s++) {
      let placed = false;
      while (!placed && attempts < maxAttempts) {
        attempts++;
        const p = generateProblem({
          skill: skill, size: size,
          forceLength: slots[s].len,
          forceSkillType: slots[s].skillType
        });
        const key = problemKey(p);
        if (!used.has(key)) {
          used.add(key);
          problems.push(p);
          placed = true;
        }
      }
      if (!placed) {
        // Bounded-loop safety valve (practically unreachable given the
        // problem space; recorded so audits would surface it).
        duplicateFallbacks++;
        problems.push(generateProblem({
          skill: skill, size: size,
          forceLength: slots[s].len,
          forceSkillType: slots[s].skillType
        }));
      }
    }

    problems.meta = {
      skill: skill, size: size, length: length,
      attempts: attempts, duplicateFallbacks: duplicateFallbacks
    };
    return problems;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ---------- Validation ----------
     validateProblem(problem, expectedSkill, expectedSize)
     Recomputes EVERYTHING independently of calculateAddition
     (digit extraction via arithmetic, not string slicing; column
     math re-derived from scratch) so a shared bug can't hide.
     Returns { ok: true } or { ok: false, errors: [...] }. */
  function validateProblem(problem, expectedSkill, expectedSize) {
    const errors = [];
    const fail = msg => errors.push(msg);

    if (!problem || typeof problem !== "object") return { ok: false, errors: ["not an object"] };

    // Structural + numeric sanity
    if (!Number.isInteger(problem.topNumber)) fail("topNumber not an integer");
    if (!Number.isInteger(problem.bottomNumber)) fail("bottomNumber not an integer");
    if (problem.topNumber <= 0 || problem.bottomNumber <= 0) fail("addends must be positive");
    if (!Number.isInteger(problem.answer)) fail("answer not an integer");
    if (!Array.isArray(problem.columns) || problem.columns.length === 0) fail("columns missing");
    if (errors.length) return { ok: false, errors: errors };

    // Independent answer check
    if (problem.answer !== problem.topNumber + problem.bottomNumber) {
      fail("answer " + problem.answer + " !== " + problem.topNumber + " + " + problem.bottomNumber);
    }

    // Independent digit-length checks (arithmetic, not the stored field)
    const lenOf = n => Math.floor(Math.log10(n)) + 1;
    const topLen = lenOf(problem.topNumber);
    const botLen = lenOf(problem.bottomNumber);
    const width = Math.max(topLen, botLen);
    if (problem.digitLength !== width) fail("digitLength mismatch");
    if (problem.columns.length !== width) fail("columns length !== digit width");

    if (expectedSize && expectedSize !== "mixed") {
      const want = parseInt(expectedSize, 10);
      if (topLen !== want) fail("topNumber is " + topLen + "-digit, expected " + want);
      if (botLen !== want) fail("bottomNumber is " + botLen + "-digit, expected " + want);
    }
    if (expectedSize === "mixed") {
      if (ENGINE_SIZES.indexOf(topLen) === -1) fail("mixed size produced " + topLen + "-digit top");
      if (ENGINE_SIZES.indexOf(botLen) === -1) fail("mixed size produced " + botLen + "-digit bottom");
    }

    // Independent column-by-column recomputation (pure arithmetic)
    let carry = 0;
    let sawRegroup = false;
    for (let i = 0; i < width; i++) {
      const c = problem.columns[i];
      const expTop = Math.floor(problem.topNumber / Math.pow(10, i)) % 10;
      const expBot = Math.floor(problem.bottomNumber / Math.pow(10, i)) % 10;
      const expRaw = expTop + expBot + carry;
      const expDigit = expRaw % 10;
      const expCarryOut = (expRaw - expDigit) / 10;

      if (!c || c.indexFromRight !== i) fail("column " + i + ": bad indexFromRight");
      if (!c || c.place !== PLACE_NAMES[i]) fail("column " + i + ": bad place name");
      if (c.topDigit !== expTop) fail("column " + i + ": topDigit " + c.topDigit + " != " + expTop);
      if (c.bottomDigit !== expBot) fail("column " + i + ": bottomDigit " + c.bottomDigit + " != " + expBot);
      if (c.carryIn !== carry) fail("column " + i + ": carryIn " + c.carryIn + " != " + carry);
      if (c.rawTotal !== expRaw) fail("column " + i + ": rawTotal " + c.rawTotal + " != " + expRaw);
      if (c.answerDigit !== expDigit) fail("column " + i + ": answerDigit " + c.answerDigit + " != " + expDigit);
      if (c.carryOut !== expCarryOut) fail("column " + i + ": carryOut " + c.carryOut + " != " + expCarryOut);
      if (c.carryOut !== 0 && c.carryOut !== 1) fail("column " + i + ": carryOut out of range");
      if (c.regrouped !== (expCarryOut > 0)) fail("column " + i + ": regrouped flag wrong");
      // Answer digit must match the real sum's digit at this position
      const sumDigit = Math.floor((problem.topNumber + problem.bottomNumber) / Math.pow(10, i)) % 10;
      if (c.answerDigit !== sumDigit) fail("column " + i + ": answerDigit doesn't match true sum digit");
      // NaN / undefined guard
      ["topDigit", "bottomDigit", "carryIn", "rawTotal", "answerDigit", "carryOut"].forEach(k => {
        if (typeof c[k] !== "number" || isNaN(c[k])) fail("column " + i + ": " + k + " is NaN/undefined");
      });
      if (expCarryOut > 0) sawRegroup = true;
      carry = expCarryOut;
    }

    // Final carry (e.g. 9,999 + 9,999 -> 1 into the ten-thousands)
    if (problem.finalCarry !== carry) fail("finalCarry " + problem.finalCarry + " != " + carry);
    const expAnswerLen = lenOf(problem.topNumber + problem.bottomNumber);
    if (problem.answerDigitLength !== expAnswerLen) fail("answerDigitLength mismatch");
    if (carry === 1 && expAnswerLen !== width + 1) fail("final carry but answer didn't grow a digit");
    if (carry === 0 && expAnswerLen !== width) fail("no final carry but answer grew a digit");
    if (carry === 1 && problem.finalCarryPlace !== PLACE_NAMES[width]) fail("finalCarryPlace wrong");
    if (carry === 0 && problem.finalCarryPlace !== null) fail("finalCarryPlace should be null");

    // Skill compliance
    if (problem.skillType !== (sawRegroup ? "regroup" : "no-regroup")) fail("skillType misreports actual columns");
    if (expectedSkill === "no-regroup" && sawRegroup) fail("no-regroup problem regroups");
    if (expectedSkill === "regroup" && !sawRegroup) fail("regroup problem has zero regrouping columns");
    // (expectedSkill "mixed": either subtype is valid; skillType must
    //  simply report the truth, which is checked above.)

    return errors.length ? { ok: false, errors: errors } : { ok: true };
  }

  /* =========================================================
     SECTION C — WIRE-UP
     ========================================================= */
  function init() {
    Array.from(document.querySelectorAll(".skill-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseSkill(c.dataset.skill)));
    Array.from(document.querySelectorAll(".size-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseSize(c.dataset.size)));
    Array.from(document.querySelectorAll(".mode-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseMode(c.dataset.mode)));
    Array.from(document.querySelectorAll(".length-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseLength(c.dataset.length)));

    el("wiz-back").addEventListener("click", wizardBack);
    el("wiz-home").addEventListener("click", startWizard);

    el("learn-back").addEventListener("click", backToModeStep);
    el("practice-back").addEventListener("click", backToModeStep);
    el("test-back").addEventListener("click", backToModeStep);
    el("learn-home").addEventListener("click", startWizard);
    el("practice-home").addEventListener("click", startWizard);
    el("test-home").addEventListener("click", startWizard);

    renderBuildBadge();
    startWizard();
  }

  document.addEventListener("DOMContentLoaded", init);

  /* ---------- Audit hook (development) ---------- */
  window.__addit = {
    state,
    BUILD_NUMBER,
    calculateAddition,
    generateProblem,
    buildProblemSet,
    problemKey,
    validateProblem,
    config: { SKILLS, SIZES, MODES, TEST_LENGTHS, PLACE_NAMES, ENGINE_SIZES }
  };
})();
