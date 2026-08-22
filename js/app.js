/* =========================================================
   Add It! — Build 4.2: Learn Mode
   Frozen: Build 1 shell/wizard, Build 2 engine, Build 3 board.
   New in Build 4 (SECTION D):
     - buildLessonSteps(problem, meta): pure lesson engine that
       derives every instructional state from problem.columns +
       finalCarry/finalCarryPlace (no hardcoded step counts)
     - renderBaseTenModel(container, state) + baseTenForColumn():
       reusable base-ten visual (Concrete) reusable by Practice
       hints later; consumes engine metadata only
     - Learn session UI: 4-example guided lesson with Back/Next,
       guided choices with supportive correction, progressive
       per-place answer reveal, synchronized board control
   Build 3 board gains two ADDITIVE options for §40 progressive
   reveal (documented in the audit report): revealAnswerPlaces
   and revealRegroupPlaces. Defaults keep Build 3 behavior
   byte-identical.
   Earlier build header (Build 3):
   Build 1 shell + wizard and the frozen Build 2 engine are
   preserved. New in Build 3:
     - renderAdditionBoard(container, problem, options):
       reusable place-value grid board. CONSUMES the Build 2
       problem object; contains NO second addition engine and
       never invents a digit.
     - getBoardColumns(container): audit helper reading the
       rendered tracks back out of the DOM.
     - Read-only Board Preview inside the Learn / Practice /
       Test placeholders with temporary inspection controls
       (New Preview Problem / Show Regrouping / Show Answer /
       Reset Board). Interactive work begins in a later build.
   ========================================================= */

(function () {
  "use strict";

  const BUILD_NUMBER = "Build 4.2";

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
  function startLearn()    { stampChips("learn");    showScreen("learn");    startLearnSession(); }
  function startPractice() { stampChips("practice"); showScreen("practice"); newPreviewProblem(); renderPreview(); }
  function startTest()     { stampChips("test");     showScreen("test");     newPreviewProblem(); renderPreview(); }

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
     Pure function. Valid addends are POSITIVE WHOLE-NUMBER INTEGERS
     (>= 1). Number.isInteger rejects decimals, NaN, Infinity,
     strings, null, and undefined outright — nothing is coerced;
     invalid input throws. Processes columns right to left:
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
    if (topNumber <= 0 || bottomNumber <= 0) {
      throw new Error("calculateAddition: addends must be positive whole numbers (>= 1)");
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
  // Constructive by design — never generate-and-hope. (Audits verify
  // independently via validateProblem plus external recomputation.)
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

  // generateProblem({ skill, size })
  // Returns one fully calculated problem matching the selected constraints.
  // (Runtime code does not re-validate each problem; validateProblem exists
  // for audits and debugging via window.__addit.)
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
     - NO duplicate normalized keys, ever (reversed pairs count as
       duplicates; there is no duplicate-acceptance path)
     - deliberate distribution, then shuffle:
         mixed skill -> half no-regroup / half regroup (odd lengths
                        give the extra slot to regroup)
         mixed size  -> lengths dealt round-robin across 2/3/4 digits
                        so every size appears in any 10+ set
     - bounded failure behavior, documented phases:
         PHASE 1  primary generation attempts (length x 40 budget)
         PHASE 2  secondary fresh generation phase (new length x 40
                  budget for any slot Phase 1 could not fill)
         then     throw an explicit generation Error
       No path hangs and no path silently accepts a duplicate. */
  function buildProblemSet(opts) {
    opts = opts || {};
    const skill = opts.skill || "mixed";
    const size = opts.size || "mixed";
    const length = TEST_LENGTHS.indexOf(Number(opts.length)) !== -1 ? Number(opts.length) : 10;
    if (!SKILLS[skill]) throw new Error("buildProblemSet: unknown skill " + skill);
    if (!SIZES[size]) throw new Error("buildProblemSet: unknown size " + size);
    // Audit/debug-only seam: lets the automated audit shrink the unique
    // pool to prove the bounded failure path. Never used by the app.
    const gen = opts.auditGenerator || generateProblem;

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
    const phaseBudget = length * SET_MAX_ATTEMPTS_FACTOR;
    let attempts = 0;
    let phasesUsed = 1;

    function tryFillSlot(slot, budgetEnd) {
      while (attempts < budgetEnd) {
        attempts++;
        const p = gen({
          skill: skill, size: size,
          forceLength: slot.len,
          forceSkillType: slot.skillType
        });
        const key = problemKey(p);
        if (!used.has(key)) {
          used.add(key);
          return p;
        }
      }
      return null;
    }

    // PHASE 1 — primary generation attempts (shared bounded budget)
    const unfilled = [];
    for (let s = 0; s < slots.length; s++) {
      const p = tryFillSlot(slots[s], phaseBudget);
      if (p) problems.push(p);
      else unfilled.push(slots[s]);
    }

    // PHASE 2 — secondary fresh generation phase (fresh bounded budget)
    if (unfilled.length) {
      phasesUsed = 2;
      const secondaryEnd = attempts + phaseBudget;
      for (let s = 0; s < unfilled.length; s++) {
        const p = tryFillSlot(unfilled[s], secondaryEnd);
        if (p) problems.push(p);
        else {
          // Explicit controlled failure — never a silent duplicate.
          throw new Error(
            "buildProblemSet: could not generate " + length +
            " unique problems for skill=" + skill + " size=" + size +
            " within bounded attempts (" + attempts + "); unique pool too small"
          );
        }
      }
      shuffle(problems);   // re-shuffle so late fills aren't clustered at the end
    }

    problems.meta = {
      skill: skill, size: size, length: length,
      attempts: attempts, phasesUsed: phasesUsed
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
     SECTION B2 — VERTICAL ADDITION BOARD (Build 3)
     The renderer READS the frozen Build 2 problem object and
     renders it. It performs no arithmetic: every digit, carry
     value, place name, and the final carry come from engine
     metadata (columns[], carryPlace, finalCarry, answer).
     One CSS-grid component handles 2 through 5 tracks; every
     row shares the same tracks, so alignment is structural.
     ========================================================= */

  // Visual track count = addend columns plus the extra leading
  // answer track only when the engine reports a final carry.
  function boardTrackCount(problem) {
    return Math.max(problem.digitLength, problem.answerDigitLength);
  }

  function placeLabelText(placeName) {
    return String(placeName).replace(/-/g, " ").toUpperCase();
  }

  /* renderAdditionBoard(container, problem, options)
     options:
       showPlaceLabels      (true)  place-name header row
       showRegroupRow       (true)  empty regroup cells above columns
       showRegroupValues    (false) reveal interior regroup values over
                                    their DESTINATION place, looked up BY
                                    NAME from the engine's columns[].carryPlace
       showFinalRegroupValue(false) additionally reveal the engine's
                                    finalCarry in the regroup row at
                                    problem.finalCarryPlace — the
                                    instructional "11 tens = 1 hundred +
                                    1 ten" state Build 4 Learn will show
                                    BEFORE revealing the final answer
                                    digit. Works with the answer hidden.
       showAnswerValues     (false) reveal answer digits by place value
                                    (the final carry appears here as the
                                    leading answer digit)
       activePlace / highlightRegroupPlace / completedPlaces:
                                    state hooks for future builds
       interactive          (false) reserved for Build 4+
     The normal preview keeps showFinalRegroupValue false, so the final
     carry is never displayed twice by accident; showing both the final
     regroup and the final answer digit is an explicit developer choice.
     Cells carry data-row / data-place / data-track attributes (no IDs),
     so rerendering can never duplicate an ID and the cells can later
     become inputs without changing the layout. */
  function renderAdditionBoard(container, problem, options) {
    const opts = Object.assign({
      showPlaceLabels: true,
      showRegroupRow: true,
      showRegroupValues: false,
      showFinalRegroupValue: false,
      showAnswerValues: false,
      revealAnswerPlaces: [],    // ADDITIVE (Build 4): per-place answer reveal
      revealRegroupPlaces: [],   // ADDITIVE (Build 4): per-place interior regroup reveal
      activePlace: null,
      highlightRegroupPlace: null,
      completedPlaces: [],
      interactive: false
    }, options || {});

    const tracks = boardTrackCount(problem);
    const topStr = String(problem.topNumber);
    const botStr = String(problem.bottomNumber);

    // SOURCE OF TRUTH: destinations come from the frozen engine's
    // carryPlace / finalCarryPlace PLACE NAMES — never inferred from
    // index arithmetic. A carry whose destination is finalCarryPlace
    // is the final regroup (its own optional state); every other
    // carryPlace is an interior regroup destination.
    const regroupAtPlace = {};           // place name -> regroup value
    let finalRegroupValue = 0;
    problem.columns.forEach(function (c) {
      if (c.carryOut > 0) {
        if (problem.finalCarryPlace !== null && c.carryPlace === problem.finalCarryPlace) {
          finalRegroupValue = c.carryOut;
        } else {
          regroupAtPlace[c.carryPlace] = c.carryOut;
        }
      }
    });

    container.innerHTML = "";
    const board = document.createElement("div");
    board.className = "addition-board";
    board.setAttribute("role", "img");
    let label = "Vertical addition problem: " + problem.topNumber + " plus " + problem.bottomNumber + ".";
    if ((opts.showRegroupValues && problem.regroupCount > 0)
        || (opts.showFinalRegroupValue && finalRegroupValue > 0)) label += " Regrouping shown.";
    if (opts.showAnswerValues) label += " The answer is " + problem.answer + ".";
    board.setAttribute("aria-label", label);

    const grid = document.createElement("div");
    grid.className = "ab-grid ab-t" + tracks;
    grid.setAttribute("aria-hidden", "true");   // the role=img label carries meaning
    grid.style.setProperty("--tracks", tracks);

    function cell(row, gridRow, track, cls, text) {
      const div = document.createElement("div");
      div.className = "ab-cell " + cls;
      div.dataset.row = row;
      if (track !== null) {
        const idx = tracks - 1 - track;           // place index from right
        div.dataset.track = String(track);
        div.dataset.place = PLACE_NAMES[idx];
        div.style.gridColumn = String(track + 2); // col 1 is the plus/sign gutter
        if (opts.activePlace === PLACE_NAMES[idx]) div.classList.add("is-active");
        if (opts.highlightRegroupPlace === PLACE_NAMES[idx]) div.classList.add("is-highlighted");
        if (opts.completedPlaces.indexOf(PLACE_NAMES[idx]) !== -1) div.classList.add("is-completed");
      }
      div.style.gridRow = String(gridRow);
      if (text !== undefined && text !== "") div.textContent = text;
      grid.appendChild(div);
      return div;
    }

    for (let t = 0; t < tracks; t++) {
      const idx = tracks - 1 - t;
      const placeName = PLACE_NAMES[idx];   // resolved name; lookups below are by name

      if (opts.showPlaceLabels) {
        cell("label", 1, t, "ab-label", placeLabelText(placeName));
      }
      if (opts.showRegroupRow) {
        let regVal = "";
        if ((opts.showRegroupValues || opts.revealRegroupPlaces.indexOf(placeName) !== -1)
            && regroupAtPlace[placeName] !== undefined) {
          regVal = String(regroupAtPlace[placeName]);
        }
        if (opts.showFinalRegroupValue && finalRegroupValue > 0
            && placeName === problem.finalCarryPlace) {
          regVal = String(finalRegroupValue);
        }
        const has = regVal !== "";
        const c = cell("regroup", 2, t, "ab-regroup" + (has ? " is-shown" : " is-empty"), regVal);
        if (!has) c.classList.add("ab-blank-ok");
      }
      // Addend digits: string formatting only — never arithmetic.
      const topD = idx < topStr.length ? topStr[topStr.length - 1 - idx] : "";
      const botD = idx < botStr.length ? botStr[botStr.length - 1 - idx] : "";
      const topCell = cell("top", 3, t, "ab-digit ab-top", topD);
      const botCell = cell("bottom", 4, t, "ab-digit ab-bottom", botD);
      if (idx === 3 && topStr.length >= 4 && topD !== "") topCell.classList.add("cell-comma");
      if (idx === 3 && botStr.length >= 4 && botD !== "") botCell.classList.add("cell-comma");

      // Answer cells always exist as slots; digits appear only on reveal.
      let ansD = "";
      if (opts.showAnswerValues || opts.revealAnswerPlaces.indexOf(placeName) !== -1) {
        if (idx < problem.columns.length) ansD = String(problem.columns[idx].answerDigit);
        else if (problem.finalCarry > 0 && idx === problem.digitLength) ansD = String(problem.finalCarry);
      }
      const ansCell = cell("answer", 6, t, "ab-answer" + (ansD !== "" ? " is-shown" : ""), ansD);
      if (idx === 3 && opts.showAnswerValues && problem.answerDigitLength >= 4 && ansD !== "") {
        ansCell.classList.add("cell-comma");
      }
    }

    // Plus sign: a gutter cell, never a place-value track.
    const plus = document.createElement("div");
    plus.className = "ab-cell ab-plus";
    plus.dataset.row = "plus";
    plus.style.gridColumn = "1";
    plus.style.gridRow = "4";
    plus.textContent = "+";
    grid.appendChild(plus);

    // Addition rule spanning the workspace.
    const rule = document.createElement("div");
    rule.className = "ab-rule";
    rule.dataset.row = "rule";
    rule.style.gridColumn = "1 / -1";
    rule.style.gridRow = "5";
    grid.appendChild(rule);

    board.appendChild(grid);
    container.appendChild(board);
    return board;
  }

  // Audit helper: read the rendered board back out of the DOM.
  function getBoardColumns(container) {
    const grid = container.querySelector(".ab-grid");
    if (!grid) return null;
    const tracks = Number(grid.style.getPropertyValue("--tracks"));
    const out = [];
    for (let t = 0; t < tracks; t++) {
      const pick = row => {
        const n = grid.querySelector('[data-row="' + row + '"][data-track="' + t + '"]');
        return n ? n.textContent : null;
      };
      const anyCell = grid.querySelector('[data-track="' + t + '"]');
      out.push({
        track: t,
        place: anyCell ? anyCell.dataset.place : null,
        label: pick("label"),
        regroup: pick("regroup"),
        top: pick("top"),
        bottom: pick("bottom"),
        answer: pick("answer")
      });
    }
    return out;
  }

  /* ---------- Board Preview (temporary Build 3 inspection) ---------- */
  const preview = { problem: null, showRegroup: false, showAnswer: false };

  function activeModeScreen() {
    return ["learn", "practice", "test"].find(s => !el("screen-" + s).hidden) || null;
  }

  function newPreviewProblem() {
    preview.problem = generateProblem({
      skill: state.skill || "mixed",
      size: state.size || "mixed"
    });
    preview.showRegroup = false;
    preview.showAnswer = false;
  }

  function renderPreview() {
    const mode = activeModeScreen();
    if (!mode || !preview.problem) return;
    const screen = el("screen-" + mode);
    const host = screen.querySelector("[data-board-host]");
    renderAdditionBoard(host, preview.problem, {
      showRegroupValues: preview.showRegroup,
      showAnswerValues: preview.showAnswer
    });
    const status = screen.querySelector("[data-bp-status]");
    status.textContent = (preview.showRegroup && preview.problem.regroupCount === 0)
      ? "No regrouping needed for this problem."
      : "";
  }

  function handlePreviewAction(action) {
    if (action === "new") newPreviewProblem();
    else if (action === "regroup") preview.showRegroup = true;
    else if (action === "answer") preview.showAnswer = true;
    else if (action === "reset") { preview.showRegroup = false; preview.showAnswer = false; }
    renderPreview();
  }

  /* =========================================================
     SECTION D — LEARN MODE (Build 4.2)
     Concrete (base-ten blocks) -> Representational (place-value
     regrouping) -> Abstract (the written board). Every state is
     derived from the frozen Build 2 problem object; nothing here
     recalculates addition.
     ========================================================= */

  /* ---------- Wording helpers (formatting only) ---------- */
  const UNIT_WORDS = {
    "ones": ["one", "ones"], "tens": ["ten", "tens"],
    "hundreds": ["hundred", "hundreds"], "thousands": ["thousand", "thousands"],
    "ten-thousands": ["ten-thousand", "ten-thousands"]
  };
  function unitWord(place, n) { const w = UNIT_WORDS[place]; return n === 1 ? w[0] : w[1]; }
  function placeUpper(place) { return placeLabelText(place); }
  // "114 means 1 hundred, 1 ten, and 4 ones." — reads engine digits only.
  function decomposeByPlace(nStr) {
    const parts = [];
    for (let i = 0; i < nStr.length; i++) {
      const d = nStr.charCodeAt(i) - 48;
      const place = PLACE_NAMES[nStr.length - 1 - i];
      if (d > 0) parts.push(d + " " + unitWord(place, d));
    }
    if (parts.length === 0) return "0 ones";
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(", ") + (parts.length > 2 ? "," : "") + " and " + parts[parts.length - 1];
  }

  /* ---------- Base-Ten Visual (reusable; Practice hints later) ----------
     renderBaseTenModel(container, state)
     state = {
       place,                  // unit place of the blocks ("ones"...)
       rows: [{kind, label, count, operator}], // vertical addend/sum rows
       total,                  // engine rawTotal (caption/aria only)
       showExchange,           // false: groups view; true: 10-for-1 exchange
       exchange: { toPlace, toCount, remaining } | null,   // engine carry data
       caption, ariaText
     }
     Blocks are decorative (aria-hidden); the container carries one
     meaningful description — no "block block block" screen-reader noise. */
  function blockEl(place) {
    const b = document.createElement("span");
    b.className = "bt-block bt-" + place;
    if (place === "thousands") b.textContent = "1000";
    if (place === "ten-thousands") b.textContent = "10,000";
    return b;
  }
  function blockGroup(place, count, cls, label) {
    const g = document.createElement("span");
    g.className = "bt-group " + (cls || "");
    const blocks = document.createElement("span");
    blocks.className = "bt-blocks";
    for (let i = 0; i < count; i++) blocks.appendChild(blockEl(place));
    g.appendChild(blocks);
    if (label) {
      const cap = document.createElement("span");
      cap.className = "bt-group-label";
      cap.textContent = label;
      g.appendChild(cap);
    }
    return g;
  }
  function renderBaseTenModel(container, state) {
    container.innerHTML = "";
    if (!state) return;
    const wrap = document.createElement("div");
    wrap.className = "baseten";
    wrap.setAttribute("role", "img");
    wrap.setAttribute("aria-label", state.ariaText || state.caption || "");

    if (!state.showExchange) {
      // Mirror the paper algorithm vertically so the child does not have to
      // translate between a horizontal block equation and a vertical sum.
      const stack = document.createElement("div");
      stack.className = "bt-vertical-stack";
      stack.setAttribute("aria-hidden", "true");

      (state.rows || []).forEach(function (item) {
        const r = document.createElement("div");
        r.className = "bt-vrow bt-vrow-" + item.kind;

        const op = document.createElement("span");
        op.className = "bt-vop";
        op.textContent = item.operator || "";
        r.appendChild(op);

        const text = document.createElement("span");
        text.className = "bt-vlabel";
        const name = document.createElement("strong");
        name.textContent = item.label;
        const amount = document.createElement("span");
        amount.textContent = item.count + " " + unitWord(state.place, item.count);
        text.appendChild(name);
        text.appendChild(amount);
        r.appendChild(text);

        const visual = document.createElement("span");
        visual.className = "bt-vvisual";
        visual.appendChild(blockGroup(state.place, item.count,
          item.kind === "regrouped" ? "bt-carried" : "", ""));
        r.appendChild(visual);
        stack.appendChild(r);
      });
      wrap.appendChild(stack);
    } else {
      const ex = state.exchange;
      const exchange = document.createElement("div");
      exchange.className = "bt-exchange";
      exchange.setAttribute("aria-hidden", "true");

      const before = document.createElement("section");
      before.className = "bt-exchange-panel bt-before";
      const bh = document.createElement("h4");
      bh.textContent = "Before regrouping";
      before.appendChild(bh);
      const beforeLine = document.createElement("div");
      beforeLine.className = "bt-exchange-line";
      beforeLine.appendChild(blockGroup(state.place, 10, "bt-tengroup", "10 " + unitWord(state.place, 10)));
      if (ex.remaining > 0) {
        beforeLine.appendChild(blockGroup(state.place, ex.remaining, "", ex.remaining + " " + unitWord(state.place, ex.remaining)));
      }
      before.appendChild(beforeLine);
      exchange.appendChild(before);

      const arrow = document.createElement("div");
      arrow.className = "bt-arrow";
      arrow.textContent = "→";
      exchange.appendChild(arrow);

      const after = document.createElement("section");
      after.className = "bt-exchange-panel bt-after";
      const ah = document.createElement("h4");
      ah.textContent = "After regrouping";
      after.appendChild(ah);
      const afterLine = document.createElement("div");
      afterLine.className = "bt-exchange-line";
      afterLine.appendChild(blockGroup(ex.toPlace, ex.toCount, "bt-new", ex.toCount + " " + unitWord(ex.toPlace, ex.toCount)));
      if (ex.remaining > 0) {
        afterLine.appendChild(blockGroup(state.place, ex.remaining, "", ex.remaining + " " + unitWord(state.place, ex.remaining)));
      }
      after.appendChild(afterLine);
      exchange.appendChild(after);
      wrap.appendChild(exchange);
    }

    if (state.caption) {
      const cap = document.createElement("p");
      cap.className = "bt-caption";
      cap.textContent = state.caption;
      wrap.appendChild(cap);
    }
    container.appendChild(wrap);
    return wrap;
  }

  // Derive a base-ten state from engine column metadata (no arithmetic).
  function baseTenForColumn(problem, indexFromRight, view) {
    const c = problem.columns[indexFromRight];
    const u = n => unitWord(c.place, n);
    if (view === "exchange" && c.carryOut > 0) {
      return {
        place: c.place,
        groups: [], total: c.rawTotal, showExchange: true,
        exchange: { toPlace: c.carryPlace, toCount: c.carryOut, remaining: c.answerDigit },
        caption: c.rawTotal + " " + u(c.rawTotal) + " = " + c.carryOut + " " +
                 unitWord(c.carryPlace, c.carryOut) + (c.answerDigit > 0 ? " + " + c.answerDigit + " " + u(c.answerDigit) : ""),
        ariaText: c.rawTotal + " " + u(c.rawTotal) + ". Ten " + u(10) + " are regrouped as one " +
                  unitWord(c.carryPlace, 1) + (c.answerDigit > 0 ? ", leaving " + c.answerDigit + " " + u(c.answerDigit) : "") + "."
      };
    }
    const rows = [];
    if (c.carryIn > 0) {
      rows.push({ kind: "regrouped", label: "Regrouped amount", count: c.carryIn, operator: "" });
    }
    rows.push({ kind: "first-addend", label: "First number (addend)", count: c.topDigit, operator: "" });
    rows.push({ kind: "second-addend", label: "Second number (addend)", count: c.bottomDigit, operator: "+" });
    rows.push({ kind: "sum", label: "Sum", count: c.rawTotal, operator: "=" });
    const eq = (c.carryIn > 0 ? c.carryIn + " " + u(c.carryIn) + " + " : "") +
               c.topDigit + " " + u(c.topDigit) + " + " + c.bottomDigit + " " + u(c.bottomDigit) +
               " = " + c.rawTotal + " " + u(c.rawTotal);
    return {
      place: c.place, rows, total: c.rawTotal, showExchange: false, exchange: null,
      caption: eq, ariaText: eq + ". First number (addend): " + c.topDigit + " " + u(c.topDigit) +
        ". Second number (addend): " + c.bottomDigit + " " + u(c.bottomDigit) +
        ". Sum: " + c.rawTotal + " " + u(c.rawTotal) + "."
    };
  }

  /* ---------- Lesson step engine (pure) ----------
     buildLessonSteps(problem, meta) -> ordered array of declarative
     steps. Each step is a complete snapshot: instruction text, an
     optional guided interaction, an optional base-ten state, and
     the full board options. Back/Next just move an index, so a
     prior state is reproduced exactly and no problem is ever
     regenerated. Step count adapts to the problem's columns —
     nothing is hardcoded to "5 screens". */
  function buildLessonSteps(problem, meta) {
    meta = meta || {};
    const steps = [];
    const topStr = String(problem.topNumber);
    const botStr = String(problem.bottomNumber);
    // running reveal state (cloned into each step)
    let revealAnswers = [], revealRegroups = [], completed = [], finalShown = false;
    function board(active) {
      return {
        activePlace: active || null,
        revealAnswerPlaces: revealAnswers.slice(),
        revealRegroupPlaces: revealRegroups.slice(),
        showFinalRegroupValue: finalShown,
        completedPlaces: completed.slice()
      };
    }
    function push(step) { step.board = step.board || board(step.activePlace); steps.push(step); }

    // Intro: place value + vertical alignment (Objectives 1 & 2)
    push({
      phase: "intro", place: null,
      title: "Let\u2019s add " + problem.topNumber + " + " + problem.bottomNumber,
      body: problem.topNumber + " means " + decomposeByPlace(topStr) + ". " +
            problem.bottomNumber + " means " + decomposeByPlace(botStr) + ".",
      note: "Line up the digits by place value: ONES under ONES, TENS under TENS" +
            (problem.digitLength >= 3 ? ", HUNDREDS under HUNDREDS" : "") +
            (problem.digitLength >= 4 ? ", THOUSANDS under THOUSANDS" : "") + ".",
      board: board(null)
    });

    // Guided choice: where do we start? (Objective 3) — first example only
    if (meta.exampleNumber === 1) {
      const other = problem.columns[problem.columns.length - 1].place;
      push({
        phase: "start-choice", place: "ones",
        title: "Where do we start?",
        body: "In addition we always start on the right.",
        interaction: {
          question: "Which place do we start with?",
          choices: [{ label: "ONES", value: "ones" }, { label: placeUpper(other), value: other }],
          correct: "ones",
          correction: "Addition starts on the right. Let\u2019s begin with the ONES."
        },
        board: board(null)
      });
    }

    problem.columns.forEach(function (c, i) {
      const place = c.place, P = placeUpper(place);
      const u = n => unitWord(place, n);
      const isFinalRegroup = c.carryOut > 0 && c.carryPlace === problem.finalCarryPlace;
      const nextU = c.carryOut > 0 ? unitWord(c.carryPlace, 1) : null;

      // A. Identify the place (Objectives 3 & 4; carry-in reminder = Objective 12)
      push({
        phase: "focus", place,
        title: i === 0 ? "Start with the ONES" : "Move left to the " + P,
        body: (i === 0 ? "Addition starts on the right, in the ONES place. Work one place at a time."
                       : "Now move one place to the left.") +
              (c.carryIn > 0 ? " Don\u2019t forget the " + c.carryIn + " " + u(c.carryIn) + " we regrouped!" : ""),
        board: board(place)
      });

      // B. Add the values in that place (words + base-ten agree)
      const eq = (c.carryIn > 0 ? c.carryIn + " " + u(c.carryIn) + " + " : "") +
                 c.topDigit + " " + u(c.topDigit) + " + " + c.bottomDigit + " " + u(c.bottomDigit) +
                 " = " + c.rawTotal + " " + u(c.rawTotal);
      push({
        phase: "add", place,
        title: "Add the " + P,
        body: eq + ".",
        baseTen: baseTenForColumn(problem, i, "groups"),
        board: board(place)
      });

      // C. Decide whether regrouping is needed (guided choice on first column)
      if (i === 0) {
        push({
          phase: "decide", place,
          title: "Do we need to regroup?",
          body: "A place can only hold 0\u20139 in a written number.",
          interaction: {
            question: "Do we need to regroup " + c.rawTotal + " " + u(c.rawTotal) + "?",
            choices: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
            correct: c.carryOut > 0 ? "yes" : "no",
            correction: c.carryOut > 0
              ? c.rawTotal + " is 10 or more, so we do need to regroup."
              : c.rawTotal + " is less than 10, so no regrouping is needed."
          },
          baseTen: baseTenForColumn(problem, i, "groups"),
          board: board(place)
        });
      } else {
        push({
          phase: "decide", place,
          title: c.carryOut > 0 ? "Regroup!" : "No regrouping needed",
          body: c.carryOut > 0
            ? c.rawTotal + " " + u(c.rawTotal) + " is 10 or more, so we regroup."
            : c.rawTotal + " " + u(c.rawTotal) + " is less than 10, so it stays in the " + P + " place.",
          baseTen: baseTenForColumn(problem, i, "groups"),
          board: board(place)
        });
      }

      // D. Show the regrouping visually (Objectives 5, 8-10; "why" = Objective 42)
      if (c.carryOut > 0) {
        push({
          phase: "regroup", place,
          title: "Regroup 10 " + u(10) + " as 1 " + nextU,
          body: c.rawTotal + " " + u(c.rawTotal) + " = " + c.carryOut + " " + nextU +
                (c.answerDigit > 0 ? " + " + c.answerDigit + " " + u(c.answerDigit) : "") + "." +
                (isFinalRegroup ? " We made a new " + nextU + "!" : ""),
          why: "Why do we regroup? A place can only hold 0\u20139. When we make 10 " + u(10) +
               ", we trade them for 1 " + nextU + ".",
          baseTen: baseTenForColumn(problem, i, "exchange"),
          board: board(place)
        });
      }

      // E/F. Connect to the board and record the answer digit (Objective 11)
      revealAnswers.push(place);
      if (c.carryOut > 0) {
        if (isFinalRegroup) finalShown = true;
        else revealRegroups.push(c.carryPlace);
      }
      completed.push(place);
      push({
        phase: "record", place,
        title: "Write it down",
        body: "Write " + c.answerDigit + " in the " + P + " place." +
              (c.carryOut > 0 ? " Move the new " + nextU + " to the " + placeUpper(c.carryPlace) + " place." : ""),
        baseTen: c.carryOut > 0 ? baseTenForColumn(problem, i, "exchange") : null,
        board: board(c.carryOut > 0 ? c.carryPlace : place)
      });
    });

    // Final carry becomes the leading answer digit (Objective 14) — §39 transition
    if (problem.finalCarry > 0) {
      const fp = problem.finalCarryPlace, fU = unitWord(fp, 1);
      finalShown = false;
      revealAnswers.push(fp);
      completed.push(fp);
      push({
        phase: "final", place: fp,
        title: "The new " + fU,
        body: "The 1 " + fU + " we made becomes the first digit of the answer. That\u2019s why " +
              problem.answer + " has more digits than " + problem.topNumber + " or " + problem.bottomNumber + ".",
        board: board(fp)
      });
    }

    // Summary: read the answer by place value (Objectives 1 & 15)
    push({
      phase: "summary", place: null,
      title: problem.topNumber + " + " + problem.bottomNumber + " = " + problem.answer,
      body: problem.answer + " means " + decomposeByPlace(String(problem.answer)) + ".",
      note: "You started with the ONES and added one place at a time" +
            (problem.regroupCount > 0 ? ", regrouping when you made 10 or more." : ". No regrouping was needed."),
      board: {
        activePlace: null,
        revealAnswerPlaces: revealAnswers.slice(),
        revealRegroupPlaces: revealRegroups.slice(),
        showFinalRegroupValue: false,
        completedPlaces: completed.slice()
      }
    });

    steps.forEach(function (st, n) { st.index = n; st.total = steps.length; });
    return steps;
  }

  /* ---------- Learn example selection ----------
     Four-example progression (respects the wizard Skill + Size):
       1 no-regroup (place value / alignment / start right)  [skill!=regroup]
       2 single regroup (introduce the exchange)
       3 later-column and/or consecutive regroup
       4 final carry (a new leading place)
     For "no-regroup" skill all four stay no-regroup (never inject
     a regrouping problem); for "regroup" all four regroup. Bounded
     predicate search with safe fallback; commutative dedup. */
  function pickLearnProblem(skillWant, size, pred, usedKeys) {
    let fallback = null;
    for (let i = 0; i < 400; i++) {
      const p = generateProblem({ skill: skillWant, size: size });
      const key = problemKey(p);
      if (usedKeys.has(key)) continue;
      if (!fallback) fallback = p;
      if (!pred || pred(p)) { usedKeys.add(key); return p; }
    }
    usedKeys.add(problemKey(fallback));
    return fallback;
  }
  function hasConsecutiveRegroup(p) {
    for (let i = 0; i + 1 < p.columns.length; i++) {
      if (p.columns[i].regrouped && p.columns[i + 1].regrouped) return true;
    }
    return p.finalCarry > 0 && p.columns[p.columns.length - 1].regrouped;
  }
  function buildLearnExamples(skill, size) {
    const used = new Set();
    const sizeFor = i => size === "mixed" ? ["2", "3", "4", "mixed"][i] : size;
    if (skill === "no-regroup") {
      return [0, 1, 2, 3].map(i => pickLearnProblem("no-regroup", sizeFor(i), null, used));
    }
    const skills = skill === "mixed"
      ? ["no-regroup", "regroup", "regroup", "regroup"]
      : ["regroup", "regroup", "regroup", "regroup"];
    const preds = [
      skill === "mixed" ? null : (p => p.regroupCount === 1),
      p => p.regroupCount === 1 && p.finalCarry === 0,
      p => (p.regroupPlaces[0] !== "ones" || hasConsecutiveRegroup(p)),
      p => p.finalCarry > 0
    ];
    return [0, 1, 2, 3].map(i => pickLearnProblem(skills[i], sizeFor(i), preds[i], used));
  }

  /* ---------- Learn session (UI controller) ---------- */
  const learn = {
    active: false, examples: [], exampleIndex: 0,
    steps: [], stepIndex: 0, answered: {}, complete: false
  };
  function learnKey() { return learn.exampleIndex + ":" + learn.stepIndex; }

  function startLearnSession() {
    learn.examples = buildLearnExamples(state.skill || "mixed", state.size || "mixed");
    learn.exampleIndex = 0;
    learn.steps = buildLessonSteps(learn.examples[0], { exampleNumber: 1, totalExamples: 4 });
    learn.stepIndex = 0;
    learn.answered = {};
    learn.complete = false;
    learn.active = true;
    renderLearnStep();
  }

  function currentLearnStep() { return learn.steps[learn.stepIndex]; }

  function renderLearnStep() {
    const screen = el("screen-learn");
    const done = el("learn-complete");
    const lesson = el("learn-lesson");
    if (learn.complete) {
      lesson.hidden = true; done.hidden = false;
      el("learn-recap").textContent =
        "Start right. Add one place at a time. Regroup when you make 10 or more. Move left.";
      return;
    }
    lesson.hidden = false; done.hidden = true;
    const st = currentLearnStep();
    const p = learn.examples[learn.exampleIndex];

    el("learn-progress-example").textContent = "Example " + (learn.exampleIndex + 1) + " of 4";
    el("learn-progress-step").textContent = "Step " + (st.index + 1) + " of " + st.total;
    const placeChip = el("learn-progress-place");
    placeChip.textContent = st.place ? placeUpper(st.place) : "";
    placeChip.hidden = !st.place;

    el("learn-title").textContent = st.title;
    el("learn-body").textContent = st.body || "";
    const note = el("learn-note");
    note.textContent = st.note || ""; note.hidden = !st.note;
    const why = el("learn-why");
    why.textContent = st.why || ""; why.hidden = !st.why;

    // Guided interaction (supportive, never scored)
    const choices = el("learn-choices");
    const correction = el("learn-correction");
    choices.innerHTML = "";
    correction.hidden = true;
    correction.textContent = "";
    correction.classList.remove("is-correct", "is-corrective");
    const answeredValue = learn.answered[learnKey()];
    const answered = answeredValue !== undefined;
    if (st.interaction) {
      const q = document.createElement("p");
      q.className = "li-question";
      q.textContent = st.interaction.question;
      choices.appendChild(q);
      st.interaction.choices.forEach(function (ch) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "nav-btn li-choice";
        b.textContent = ch.label;
        b.dataset.value = ch.value;
        if (answered && ch.value === st.interaction.correct) b.classList.add("li-correct");
        if (answered && ch.value === answeredValue && answeredValue !== st.interaction.correct) b.classList.add("li-selected-wrong");
        b.addEventListener("click", function () { answerLearnChoice(ch.value); });
        choices.appendChild(b);
      });
      if (answered) {
        Array.from(choices.querySelectorAll(".li-choice")).forEach(b => b.disabled = true);
        if (answeredValue === st.interaction.correct) {
          correction.textContent = "That’s right! " + st.interaction.correction.replace(/^Addition starts/, "Addition always starts");
          correction.classList.add("is-correct");
        } else {
          correction.textContent = "Almost. " + st.interaction.correction;
          correction.classList.add("is-corrective");
        }
        correction.hidden = false;
      }
    }

    renderAdditionBoard(el("learn-board"), p, st.board);
    const workspace = el("learn-workspace");
    const hasBaseTen = !!st.baseTen;
    workspace.hidden = !hasBaseTen;
    if (hasBaseTen) {
      el("learn-workspace-title").textContent = placeUpper(st.baseTen.place) + " WORKSPACE";
      el("learn-workspace-subtitle").textContent = st.phase === "regroup" || st.phase === "record"
        ? "See how the base-ten blocks regroup."
        : "Look only at the " + placeUpper(st.baseTen.place) + " for this step.";
    }
    renderBaseTenModel(el("learn-baseten"), st.baseTen || null);

    el("learn-prev").disabled = (learn.exampleIndex === 0 && learn.stepIndex === 0);
    el("learn-next").disabled = !!(st.interaction && !answered);
    el("learn-next").textContent =
      (learn.stepIndex === learn.steps.length - 1)
        ? (learn.exampleIndex === 3 ? "Finish \u2192" : "Next Example \u2192")
        : "Next \u2192";
  }

  function answerLearnChoice(value) {
    const st = currentLearnStep();
    if (!st.interaction || learn.answered[learnKey()]) return;
    const correction = el("learn-correction");
    learn.answered[learnKey()] = value;
    correction.classList.remove("is-correct", "is-corrective");
    if (value === st.interaction.correct) {
      correction.textContent = "That’s right! " + st.interaction.correction.replace(/^Addition starts/, "Addition always starts");
      correction.classList.add("is-correct");
    } else {
      correction.textContent = "Almost. " + st.interaction.correction;
      correction.classList.add("is-corrective");
    }
    correction.hidden = false;
    // Lock choices. Green marks the correct answer; amber marks the child's incorrect selection.
    Array.from(el("learn-choices").querySelectorAll(".li-choice")).forEach(function (b) {
      b.disabled = true;
      if (b.dataset.value === st.interaction.correct) b.classList.add("li-correct");
      if (b.dataset.value === value && value !== st.interaction.correct) b.classList.add("li-selected-wrong");
    });
    el("learn-next").disabled = false;
  }

  function learnNext() {
    if (learn.complete) return;
    const st = currentLearnStep();
    if (st.interaction && !learn.answered[learnKey()]) return;
    if (learn.stepIndex < learn.steps.length - 1) {
      learn.stepIndex++;
    } else if (learn.exampleIndex < 3) {
      learn.exampleIndex++;
      learn.steps = buildLessonSteps(learn.examples[learn.exampleIndex],
        { exampleNumber: learn.exampleIndex + 1, totalExamples: 4 });
      learn.stepIndex = 0;
    } else {
      learn.complete = true;
    }
    renderLearnStep();
  }
  function learnPrev() {
    if (learn.complete) { learn.complete = false; renderLearnStep(); return; }
    if (learn.stepIndex > 0) {
      learn.stepIndex--;
    } else if (learn.exampleIndex > 0) {
      learn.exampleIndex--;
      learn.steps = buildLessonSteps(learn.examples[learn.exampleIndex],
        { exampleNumber: learn.exampleIndex + 1, totalExamples: 4 });
      learn.stepIndex = learn.steps.length - 1;
    }
    renderLearnStep();
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

    el("learn-prev").addEventListener("click", learnPrev);
    el("learn-next").addEventListener("click", learnNext);
    el("learn-again").addEventListener("click", startLearnSession);
    el("learn-done-home").addEventListener("click", startWizard);
    el("learn-done-mode").addEventListener("click", backToModeStep);

    // Board Preview controls: one delegated listener per control strip,
    // bound exactly once at init — rerenders never re-attach listeners.
    Array.from(document.querySelectorAll("[data-bp-controls]")).forEach(strip =>
      strip.addEventListener("click", e => {
        const btn = e.target.closest("[data-bp]");
        if (btn) handlePreviewAction(btn.dataset.bp);
      }));

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
    renderAdditionBoard,
    getBoardColumns,
    boardTrackCount,
    buildLessonSteps,
    buildLearnExamples,
    renderBaseTenModel,
    baseTenForColumn,
    learn,
    config: { SKILLS, SIZES, MODES, TEST_LENGTHS, PLACE_NAMES, ENGINE_SIZES }
  };
})();
