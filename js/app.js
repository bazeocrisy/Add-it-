/* =========================================================
   Add It! — Build 1: Shell + Wizard
   Wizard: Skill -> Number Size -> Mode -> (Test Length)
   -> Learn / Practice / Test placeholder screens.
   ONE centralized state object drives everything.
   Screens switch with the reliable [hidden] approach
   (guarded by [hidden]{display:none!important} in CSS).
   The addition engine, regrouping logic, sessions, scoring,
   hints, and results arrive in later builds.
   ========================================================= */

(function () {
  "use strict";

  const BUILD_NUMBER = "Build 1";

  /* ---------- Config ---------- */
  // Stable internal skill values with display names for chips.
  const SKILLS = {
    "no-regroup": { displayName: "No Regrouping" },
    "regroup":    { displayName: "Regrouping" },
    "mixed":      { displayName: "Mixed" }
  };
  // Stable internal size values with display names for chips.
  const SIZES = {
    "2":     { displayName: "2 Digits" },
    "3":     { displayName: "3 Digits" },
    "4":     { displayName: "4 Digits" },
    "mixed": { displayName: "Mixed Sizes" }
  };
  const MODES = ["learn", "practice", "test"];
  const TEST_LENGTHS = [10, 25, 50];

  /* ---------- State ---------- */
  // Centralized state, designed to grow in later builds
  // (problem/session fields will be added when the engine arrives).
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
    // Full reset so no stale selections leak into a new session.
    state.skill = null;
    state.size = null;
    state.mode = null;
    state.testLength = 10;
    setWizardStep(1);
    showScreen("wizard");
  }

  function setWizardStep(step) {
    ["1", "2", "3", "4"].forEach(s => { el("wiz-step-" + s).hidden = (s !== String(step)); });

    // The Length step only exists for Test; show it in the progress bar on step 4.
    const showLen = (step === 4);
    Array.from(el("wiz-progress").querySelectorAll(".wp-len")).forEach(n => { n.hidden = !showLen; });

    Array.from(el("wiz-progress").querySelectorAll("[data-wstep]")).forEach(li => {
      const s = Number(li.dataset.wstep);
      li.classList.toggle("done", s < step);
      li.classList.toggle("current", s === step);
    });

    // Step 1 IS home — no redundant Back/Home controls there.
    el("wiz-back").hidden = (step === 1);
    el("wiz-home").hidden = (step === 1);

    state.wizardStep = step;
    reflectSelections(step);
  }

  // Keep aria-checked in sync with state on each step's radio cards.
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
    state.size = null;                  // clear downstream selection
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
    else setWizardStep(4);              // Test asks "How many questions?" first
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
    // Header chips
    if (el(prefix + "-skill-chip")) el(prefix + "-skill-chip").textContent = skillChipText();
    if (el(prefix + "-size-chip"))  el(prefix + "-size-chip").textContent  = sizeChipText();
    if (el(prefix + "-length-chip")) el(prefix + "-length-chip").textContent = state.testLength + " Questions";
    // Placeholder-stage chips
    if (el(prefix + "-ph-skill")) el(prefix + "-ph-skill").textContent = skillChipText();
    if (el(prefix + "-ph-size"))  el(prefix + "-ph-size").textContent  = sizeChipText();
    if (el(prefix + "-ph-length")) el(prefix + "-ph-length").textContent = state.testLength + " Questions";
  }

  /* ---------- Placeholder destinations (Build 1) ---------- */
  function startLearn() {
    stampChips("learn");
    showScreen("learn");
  }
  function startPractice() {
    stampChips("practice");
    showScreen("practice");
  }
  function startTest() {
    stampChips("test");
    showScreen("test");
  }

  // "Choose Another Mode" returns to the Mode step with earlier choices intact.
  function backToModeStep() {
    state.mode = null;
    setWizardStep(3);
    showScreen("wizard");
  }

  /* ---------- Build badge ---------- */
  function renderBuildBadge() {
    el("build-badge").textContent = "Add It! \u2014 " + BUILD_NUMBER;
  }

  /* ---------- Wire up ---------- */
  function init() {
    // Skill cards
    Array.from(document.querySelectorAll(".skill-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseSkill(c.dataset.skill)));

    // Size cards
    Array.from(document.querySelectorAll(".size-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseSize(c.dataset.size)));

    // Mode cards
    Array.from(document.querySelectorAll(".mode-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseMode(c.dataset.mode)));

    // Length cards
    Array.from(document.querySelectorAll(".length-grid .pick-card")).forEach(c =>
      c.addEventListener("click", () => chooseLength(c.dataset.length)));

    // Wizard nav
    el("wiz-back").addEventListener("click", wizardBack);
    el("wiz-home").addEventListener("click", startWizard);

    // Placeholder nav
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
    config: { SKILLS, SIZES, MODES, TEST_LENGTHS }
  };
})();
