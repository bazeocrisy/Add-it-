# Add It! — Build 4.3 Audit Report

## Release Status

**BUILD 4.3 — READY FOR MANUAL VISUAL ACCEPTANCE TESTING**

Build 4.3 is an audit-correction release for Learn Mode. It is **not frozen yet**. Freeze requires the user's real-device acceptance check after deployment.

## Build 4.3 Scope

This release consolidates the changes identified during the Build 4.2 forensic review:

1. Preserve the vertical Base-Ten workspace and the vocabulary:
   - **First number (addend)**
   - **Second number (addend)**
   - **Sum**
2. Keep the frozen addition mathematics and carry metadata unchanged.
3. Use a true responsive Learn composition:
   - larger screens: addition board and active-place workspace share a horizontal teaching region;
   - smaller screens: board and workspace stack intentionally.
4. Reduce unnecessary mobile vertical spacing without shrinking the instructional math into unreadable content.
5. Present all relevant place-value choices in the opening guided question for the selected digit length.
6. Keep wrong/corrective feedback visually distinct from success feedback.
7. Advance the visible runtime badge to **Add It! — Build 4.3**.

## Static Package Audit

### PASS — Build identity
- Runtime `BUILD_NUMBER` is `Build 4.3`.
- The bottom-right badge is populated from the runtime build number.

### PASS — JavaScript parse
- `js/app.js` passes JavaScript syntax validation.

### PASS — GitHub Pages asset casing
- Logo path is lowercase: `assets/images/logo.png`.
- Favicon path is lowercase: `assets/images/favicon.png`.
- No legacy `Assets/Logo.png` path is required.

### PASS — Responsive structure
- Learn Mode contains a responsive teaching wrapper.
- The addition board and active-place workspace are separately addressable within that wrapper.
- Large-screen rules provide a two-column teaching composition.
- Phone rules intentionally return the lesson to a stacked composition.

### PASS — Instructional vocabulary
- Base-Ten rows use `First number (addend)` and `Second number (addend)`.
- Sum remains explicitly labeled.
- Zero quantities are represented as zero blocks rather than invented manipulatives.

### PASS — Guided place-value choices
- The lesson's starting-place question is derived from the problem's place-value range rather than presenting only an arbitrary distractor.

## Frozen-System Protection

Build 4.3 is intended as a Learn Mode layout/instructional correction. It does not intentionally redesign:
- Build 1 wizard flow;
- Build 2 arithmetic engine;
- Build 3 column/carry metadata contract.

Those systems still require regression verification whenever a final freeze is declared.

## Historical Build 4.2 Findings

Build 4.2 was **not frozen**. Real-device review found:
- unnecessary desktop vertical scrolling;
- failure to use available horizontal space for board + workspace;
- excessive mobile lesson height;
- incomplete guided place-value choices in at least one lesson state.

Build 4.3 exists specifically to address those findings.

## Manual Acceptance Tests Required Before Freeze

After deployment, verify at minimum:

1. **Desktop/laptop Learn step with Base-Ten workspace**
   - board and workspace appear side-by-side when enough width is available;
   - the child can connect the active board column to the workspace without scrolling between them.

2. **Phone Learn step with Base-Ten workspace**
   - board and workspace stack cleanly;
   - no horizontal scrolling;
   - blocks and labels remain readable;
   - lesson height is improved and navigation remains easy to reach.

3. **Regrouping exchange**
   - 10 units visibly exchange into 1 unit of the next place;
   - the regrouped value lands in the correct destination place on the board;
   - corrective feedback is not styled as success.

4. **Representative device matrix**
   - 320–390px phone;
   - tablet portrait;
   - tablet landscape;
   - 1366×768 laptop;
   - 1920×1080 desktop;
   - large classroom display/projector when available.

## Freeze Decision

**DO NOT LABEL BUILD 4.3 FROZEN UNTIL THE REAL-DEVICE ACCEPTANCE TESTS ABOVE PASS.**

If those checks pass without new instructional or responsive defects, Build 4.3 can become the final Build 4 Learn release before Build 5.0 Practice Mode.

## Build 5 — Practice Mode (rebased on owner's Build 4.3)

**Build number:** Build 5 · badge **Add It! — Build 5**. Base: the owner's Build 4.3 tree (Learn responsive composition, vertical base-ten rows with First/Second addend + Sum labels, Before/After exchange panels) — preserved unchanged and verified by the full Build 4 Learn audit re-run against it. Files changed: `index.html` (Practice screen becomes interactive; Test keeps the Build 3 preview), `css/styles.css` (7d Practice section appended), `js/app.js` (SECTION E + additive board entry options), this report.

**What Practice does.** The child works the real algorithm on the real board, column by column: a pulsing prompt cell marks the active place, a 10-key number pad (all keys ≥44px; physical keyboard digits also accepted; input is inherently single-digit 0–9 — invalid values like 12, −1, 3.5, NaN are ignored without consuming attempts) enters the answer digit, and when a column regroups the pad disables and the empty regroup boxes become pulsing tap targets — the child must tap where the regrouped value goes. Correctness is decided **only** by engine metadata (`answerDigit`, `carryPlace`, `finalCarry`/`finalCarryPlace`); the controller performs no arithmetic, proven by mutation test: a clone with a falsified `answerDigit` made Practice accept the falsified digit and reject the mathematically correct one. The §39 final-carry transition is preserved — the tapped-in final regroup value is hidden once the child writes the leading answer digit, and no completion board ever shows it twice.

**Support system.** Wrong attempts climb a 3-level ladder: L1 gentle place cue (plus "Did you include the 1 ten we regrouped?" when carryIn exists) → L2 conceptual (the column equation + the owner's vertical addend/Sum block composition) → L3 procedural (Before/After exchange panels + "write the digit, move the 1 left") → after a 4th wrong attempt, guided reveal fills the correct move with a warm explanation and continues, so no child is ever stuck; guided problems reset the streak but still celebrate. Misconception-targeted messages fire on engine-derived signatures (message choice only, never correctness): forgot-the-regrouped-value and entered-the-regrouped-part-instead both verified. Wrong regroup taps teach the one-place-LEFT rule before revealing. Celebration states the full equation ("You did it! 59 + 55 = 114.") with streak encouragement — never scores, points, or timers.

**Board extension (additive, documented):** `answerEntries`, `regroupEntries`, `tapRegroups`, `promptCell` render student-entered values and affordances through the same frozen component; defaults keep Build 4.3 rendering byte-identical (all Build 3/4 suites re-ran green).

**Audit results.** Deterministic scripted solves of 23+14, 243+126, 59+55, 182+190, 589+476, 1,008+2,091, 9,999+9,999: prompts always start with ONES, exactly the engine's number of carry taps required, entries spell the engine answer, celebrations correct, no duplicate final carry on any completion board. Order enforcement verified (entries land only in the active column). Full hint-ladder walk on 59+55 verified at every level including the Sum-row block count and the exchange ten-group. Guided reveal, streak reset, and both misconception messages verified. **300 randomized scripted solves** across all skill/size combinations (including 32 injected wrong answers): entries always spelled the engine answer, all 264 regroups recorded, nobody stuck. **30-problem session:** zero duplicate problems. Navigation: Home and Choose Another Mode deactivate practice and re-entry starts a fresh Problem 1. Responsive: clean at all 7 widths mid-solve on the 5-track carry state with pad and tap targets present. A11y: aria-live prompt panel, native labeled pad buttons. **Regressions all green:** Build 1 wizard suite, Build 2 engine (3,000 problems Python-recomputed), Build 3 board suites (deterministic + 735-measurement alignment + mutation forensics), Build 4 Learn suite (~31,000 lesson states re-traversed against the owner's 4.3 composition, with harness expectations updated to the vertical rows model). Console: zero errors everywhere.

**Defects.** Application: none found in this audit (the two instructional fixes from Build 4 remain in place). Audit-harness (documented): the Build 3-era preview suites still drove the Practice screen's retired preview controls — migrated to the Test screen's preview, including a keyboard path that had silently stranded the run; stale badge expectations updated; scope-creep token lists refined after every flagged match was confirmed to be a comment ("never scores/points", "marks the child's incorrect selection") or a legitimately shipped feature (`hintLevel`, `streak` per the Build 5 spec); one vacuous-pass risk from an earlier empty source-slice remains re-anchored and re-proven.

**Not implemented (Build 6+):** Test entry/scoring · Results · Practice My Misses.

## Build 5 — PASS (superseded by Build 5.1 below; see Build 5.1 status)

## BUILD 5.1 — LEARN REAL-DEVICE REFINEMENT + BUILD 5 REGRESSION AUDIT

**Base:** Build 5 (Practice Mode preserved in full — not rewritten, not reverted to 4.3). **Runtime/badge:** Add It! — Build 5.1. **Files changed:** `index.html`, `css/styles.css`, `js/app.js`, `AUDIT-REPORT.md`. Engine, board renderer, wizard, branding, logo and favicon untouched.

**Baseline audit performed before editing.** Confirmed runtime `Build 5`; confirmed Practice Mode present (SECTION E: session, number pad, regroup tap targets, 3-level hint ladder, misconception feedback, guided reveal, celebration). Identified shared components: `calculateAddition`/`generateProblem` (engine), `renderAdditionBoard` (board), and `renderBaseTenModel`/`baseTenForColumn`/`blockGroup`/`unitWord` — the base-ten renderer is consumed by Learn (6 call sites) **and** by Practice's hint ladder (4 call sites), so every base-ten change below was explicitly regression-tested inside Practice.

**Owner findings resolved.** (1) *Yes/No scattered on phone* — the choice container now uses a resilient grid (`li-choices-2` / `li-choices-3`, no absolute positioning); measured side-by-side with ≥48px height and ≥15.7px text at 320/360/390/430 and every larger width. (2) *Wordy opening box* — the alignment sentence is now "Line up digits with the same place value."; the number decomposition above it is retained. (3) *"Where do we start?" box* — retitled to one idea: title "Where do we start?", support "Start on the right.", question "Which place do we add first?", with all applicable place choices (ONES/TENS/HUNDREDS for 3-digit). Correct feedback stays green; corrective feedback amber. (4) *Regroup decision skipped after ONES* — root cause: `buildLessonSteps` gated the interactive decision on `i === 0`, so later columns were told rather than asked. Now **every** column asks "Do we need to regroup N?" with the correct key taken from `carryOut`; verified across 600 generated lessons in ONES, TENS, HUNDREDS and THOUSANDS, with the decision always preceding the regroup demo and no prompts invented where the total is under 10. Additionally the decide box no longer repeated its own title as the question ("Check the TENS" + "Do we need to regroup 16 tens?").

**Learn state changes / step count.** The former separate `focus` state was merged into `add` (naming the place and adding it is one idea), which pays for the new decision now asked at every column. For 184 + 583 the lesson went **16 → 13 steps** while decision points went **1 → 3**. Per-column shape is now `add → decide → [regroup] → record`, and every non-final record ends with a "Then move left." cue, so ADD → CHECK → REGROUP → RECORD → MOVE LEFT is literally the state sequence. Per-example closure added: the summary state is now a celebration ("Great work!", the solved equation, and a one-line process reinforcement with the place-value read-back) with a small star and green panel — no points, timers, or confetti storms. Final completion strengthened: "You did it! / You finished the regrouping lesson.", a five-point checklist, and explicit next actions — **Practice This Skill** (hands off to the real Build 5 Practice session, only on the child's tap), Learn Again, Choose Another Mode, Home; the stale step counter is hidden on that screen.

**Defects found and fixed.** *Application:* (1) 12 hundreds-flats overflowed the workspace panel at 320–360px — root cause: `.bt-blocks` used a fixed 5-column grid while 4.3 sizes flats at 44px/36px; fixed with place-aware wrapping (`bt-blocks-hundreds` 3-across, 2-across ≤360px with 28px flats; thousands 2-across) plus `max-width:100%`; retested at 320/360/390/430/768/1366 with 11 ones, 16 tens, 12 hundreds and 3 thousands all contained, correctly counted and ≥6px. (2) The completion screen kept showing the mid-lesson step counter — hidden on completion. *Audit-harness (separate):* the §18 regroup-title check compared against the plural place name when the title correctly uses the singular unit ("1 hundred"); the §16 geometry check measured a hidden container; and the Learn suite's expectations still encoded the pre-5.1 phase list, the pre-5.1 add-step wording, and the old summary layout. All corrected and re-run.

**Mathematical forensics.** 12 deterministic problems including the owner's samples (236+582, 184+583, 504+287, 356+171) plus 23+14, 59+55, 182+190, 589+476, 1,008+2,091, 9,999+9,999, 405+270, 999+999: every column's rawTotal/answerDigit/carryOut, the final carry, the rendered board output and each Learn decision key were checked against an **independent Python recomputation** — all matched. Randomized: 600 lessons for decision placement, 200 for state-machine integrity, ~24,800 Learn states traversed in the full Learn suite, 3,000 engine problems recomputed, 300 scripted Practice solves.

**State machine.** Every state reachable and correctly indexed; no skipped or duplicated place; final-carry state present exactly when `finalCarry > 0`; deterministic rebuild; Next gated until a decision is answered; a wrong choice gives amber corrective feedback, marks the correct option and never dead-ends; Back/Next reproduce identical text, board and base-ten.

**Responsive results.** Full lesson walks at **320, 360, 390, 430, 768, 1024, 1366, 1920, 2560**: zero horizontal overflow, choices never split rows, touch targets ≥44px, text ≥13px, and no board/workspace collision at any width. *Phone* — vertical composition retained, decision pair on one row, blocks contained. *Tablet* — 768/1024 hold the same guarantees; landscape widths get the side-by-side composition. *Laptop/desktop* — 1366×768 and 1920 keep board and workspace side-by-side per 4.3. *Large display* — 2560 stays centered within the max content width with no absurd stretching. Mobile Safari: no new fixed-position controls (the build badge still moves into normal flow on phones).

**Practice regression (explicit, after the shared base-ten change).** Full Practice suite re-run: problem generation, engine-derived correctness, active-place highlighting, number-pad and physical-keyboard entry, rejection of wrong digits, advancement, regroup placement requirement and destination, the 3-level hint ladder, the shared vertical base-ten composition (3 rows, 14 Sum blocks at hint L2) and Before/After panels (hint L3), misconception-specific feedback, duplicate prevention across a 30-problem session, completion and celebration without points or timers — all pass, plus a full 59+55 solve ending at 114.

**Frozen-build regression.** Build 1 wizard suite, Build 3 board suites (deterministic cases, 735-measurement alignment sweep ≤2px, carryPlace/finalCarryPlace mutation forensics), and the Build 4 Learn suite all pass. Console clean throughout; assets verified.

**Known issues.** None found by automated testing. Not yet verified: real iPhone Safari rendering (dynamic toolbar behavior, true touch ergonomics, font rendering) — that is what owner acceptance testing will confirm.

**BUILD 5.1 · CODE COMPLETE · AUTOMATED AUDIT PASS · READY FOR OWNER ACCEPTANCE TESTING · NOT FROZEN**

---

# BUILD 5.2 — RESPONSIVE + INSTRUCTIONAL REMEDIATION

**A. Build.** Build 5.2. Badge: `Add It! — Build 5.2`. Not Build 6; Test Mode remains unbuilt.

**B. Baseline confirmation.** Verified before any edit: runtime read `Build 5.1`; Learn, Practice, engine, shared board and base-ten renderer all present; all seven harnesses passed on the untouched tree; `B51_BASELINE` snapshot + md5 hashes recorded. Final diff vs that baseline: `index.html` 35 lines, `css/styles.css` 187 lines, `js/app.js` 168 lines — all traceable to the changes below.

**C. Files changed.** `index.html`, `css/styles.css`, `js/app.js`, `AUDIT-REPORT.md`. Engine, problem generation, correctness metadata, board semantics, hint ladder, misconception signatures, logo, branding, colour identity, wizard and Home behaviour untouched.

**D. Owner findings resolved.**

| Finding | Resolution | Evidence |
|---|---|---|
| **A** place labels too small | Solved by *wrapping, not shrinking*: long names carry a soft-hyphen break opportunity (`HUN­DREDS`, `THOU­SANDS`) with `hyphens:manual`; size scales by track count; colour darkened to `#3B5C8A` | 6.1px → **11.8px** typical, 9.6px worst case (5-track phone), 18.4px on TV; contrast **4.34 → 6.27**; zero overlap/clipping/overflow at 320–2560 |
| **B** Next hard to reach | Height-aware tiers at `max-height` 720/620/560 plus a landscape rule; reclaimed padding, gaps and the redundant skill/size chips in the progress row — no instructional text shrunk | iPhone SE intro **+159px → +63px**; landscape **+221px → +123px**; mini / 14/15 / 15PM / iPad / laptop / desktop **0px** |
| **C** phone regroup co-visibility | Before/After panels stay a two-panel row on phones; landscape gets a board-beside-workspace grid | Board + blocks now co-visible at the regroup state on mini, 14/15, 15PM, iPad P/L, laptop, desktop, TV **and landscape**; iPhone SE still cannot fit both (see P) |
| **D** classroom display | Deliberate `min-width:1800px` treatment placed last in the cascade; content column grows to 1720px, instructional type scales, lesson vertically centred | Content **46% → 67%** of 2560px; digits **32 → 54.4px** (~2.7 m), labels **8.3 → 18.4px**, title 38.4px, choices 24px/72px |
| **E** endless Practice | 10-problem session, "Problem 3 of 10", completion panel (Practice Again / Choose Another Mode / Home), **no auto-restart** | T11/T11b transition tests pass; practice suite updated and green |
| **F** Test honesty | Developer preview removed application-wide; "Test Mode — Coming soon!" with routes to Practice or Learn | `document.querySelectorAll('[data-bp]').length === 0`; no Show Answer reachable by a child |
| **§4** decomposition lines | One line per addend, zeros included ("807 means 8 hundreds, 0 tens, and 7 ones"); no arrows added | Verified in the opening-screen evidence shot |

Two further defects were found *by* this work and fixed: lesson controls measured 42px (now **46px**), and keyboard focus was lost on every step advance (now moves to the next actionable control, using `preventScroll` — see O).

**E. Device-state matrix (240 probes, 10 device profiles, width × height).**

| Metric | 5.1 | 5.2 |
|---|---|---|
| Horizontal overflow | 0 | **0** |
| Panel overlap | 0 | **0** |
| Base-ten blocks escaping | 0 | **0** |
| Yes/No row splits | 0 | **0** |
| Smallest place label | 6.4px | **11.2px** |
| Smallest text anywhere | 6.4px | **8.3px** |
| Worst scroll ratio | 3.55× | **3.04×** |

**F. Instructional-objective matrix.** All 15 objectives remain taught, and the 5.1 sequence is preserved: per column `add → decide → [regroup] → record`, with "Then move left." on every non-final record. The regroup decision is still asked at **every** applicable column (600-lesson probe: one Yes/No per column, key from `carryOut`, decision always precedes the demo, no prompts where the total is under 10). The opening screen now teaches place value with zeros included.

**G. Accessibility.** Contrast now passes AA everywhere sampled: place labels 6.27, note text 5.85 (both previously failing at 4.34/4.38), step counter 4.71, body 12.39. Touch targets at 390px: choices 48px, controls 46px. Native buttons throughout; `:focus-visible` ring intact; focus now follows the lesson without hijacking scroll; reduced motion honoured. **Still open:** gated Next has no `aria-disabled`/reason, progress row is not a `role="status"`, and there is no `h1` (all S3, carried forward).

**H. Cognitive load.** Screen load unchanged and healthy: 9–38 words per state, median 24, **0 of 54** states above 45 words. Session load unchanged: 33–65 steps across the twelve skill×size families — the 4-digit tracks remain long (D-05 in the 5.1 register, deliberately not addressed here).

**I. Transitions / state leakage.** 13 tests, **zero leakage**, zero page errors: Learn→Home→Learn full reset; Learn completion→Practice handoff; Practice→Mode→Learn; Test→Practice with no stale board; `testLength` never leaks into other modes; Back over an answered choice restores lock/mark/correction; double-tap and pad-spam guarded; **new:** T11 session boundary stops at exactly 10 with no auto-restart, T11b Practice Again resets to "Problem 1 of 10" with clean entries.

**J. Mathematical forensics.** 13 problems (no regroup, ones regroup, tens-only regroup, multiple/chain regroup, zeros in an addend, 3-digit, 4-digit, boundary 9,999+9,999) × engine columns + carries + final carry + board output + Learn decision keys + base-ten exchange equivalence + Practice input acceptance and full solve — **every value matched independent Python recomputation. Zero defects.**

**K. Practice regression.** Full suite green: generation, engine-derived correctness, active place, pad and physical keyboard, wrong-digit rejection, regroup placement and destination, 3-level hint ladder, shared vertical base-ten rows and Before/After panels, misconception feedback, duplicate prevention, completion and celebration without scoring — plus the new session boundary.

**L. Responsive width/height.** 320 / 360 / 390 / 430 / landscape 844×390 / 768 / 1024 / 1366×768 / 1920×1080 / 2560×1440. Zero horizontal overflow at every width and state.

**M. Classroom display.** 1920 and 2560 verified: no overflow, no scrolling (ratio 1.0), board and workspace co-visible, content centred at 1720px. Estimated legibility (~20 CSS-px per metre): digits ~2.7 m, place labels ~0.9 m, title ~1.9 m, block captions ~1.1 m.

**N. Defect register (this build).**

| ID | Mode | State | Device | W×H | Sev | Expected | Actual | Root cause | Fix | Regression risk | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 52-01 | Learn/Practice | all board states | all | all | S2 | place labels legible | 6.1–8.3px, contrast 4.34 | Build 3 overlap fix shrank labels | soft-hyphen wrap + scale + darker colour | board shared by all modes | 11.8px / 6.27 measured | **FIXED** |
| 52-02 | Learn | intro, decide | SE, landscape, iPad, laptop | short heights | S2 | Next discoverable | up to +295px below fold | no height-aware rules | 3 `max-height` tiers + landscape grid | Learn + Practice controls | +63px / +123px worst | **FIXED** |
| 52-03 | Learn/Practice | regroup, hint L2/L3 | phones | ≤430w | S2 | board + blocks compared together | vertically separated | tall stacked exchange panels | compact two-panel row | shared with Practice hints | co-visible on all but SE | **FIXED** |
| 52-04 | all | all | TV/projector | ≥1800w | S1 | classroom-legible | 46% width, 8.3px labels | no large-display scale step | dedicated `min-width:1800px` composition | cascade order/specificity | 67% / 54.4px digits | **FIXED** |
| 52-05 | Practice | session | all | all | S2 | a finish line | endless stream | session framing deferred in B5 | 10-problem session + completion | dedupe pool | T11 pass | **FIXED** |
| 52-06 | Test | preview | all | all | S2 | honest unavailability | Show Answer offered to a child | B3 scaffolding never revisited | Coming Soon + routes | two harnesses re-pointed | 0 `[data-bp]` | **FIXED** |
| 52-07 | Learn | controls | phones | 375w | S3 | ~44px targets | 42px | button padding | min-height 46px | none | measured 46px | **FIXED** |
| 52-08 | Learn | every advance | all | all | S3 | keyboard focus follows | focus dropped to body | no focus management | `focus({preventScroll:true})` | scroll position (see O) | verified | **FIXED** |

**O. Harness false positives / simulation limitations (kept separate from product defects).**
1. `forensic4` mutation tests and `board_audit2` §16/§26/§28/§29/§45 drove the **removed** Test preview — harness defect from an intentional feature removal; re-pointed to the Learn board or retired with a note.
2. Practice "acceptance" failure across all 13 forensic cases: the harness drove Practice **from the Learn screen** with no active session, so input was correctly ignored. App verified correct; harness fixed.
3. Six "overlap" hits on SE/landscape Practice hints: probe captured the panel **mid-`rise` animation**; after settling, the gap is 8px. Simulation artifact — added an animation settle to the probe.
4. Below-fold counts in the matrix are **scroll-position dependent** (the probe measures wherever the walk left the page). The deterministic first-screen measurements in D are the meaningful figures.
5. `focus()` initially *caused* a real regression (scrolling Next below the fold) — caught by the matrix, root-caused, fixed with `preventScroll`. Recorded because it was a genuine intermediate failure.
6. T7 rapid-tap remains a known false positive: taps 2–3 land on a correctly gated decision.

**P. Known limitations (not fixed, stated plainly).**
- **iPhone SE (320×568) regroup state:** board and blocks still cannot both fit one viewport (page ≈1.96× viewport). Improved but not solved; a child must scroll once to compare them.
- **iPhone SE / landscape intro:** Next remains ~63px / ~123px below the fold — one short flick.
- **Session length:** 4-digit tracks still run to ~65 steps (5.1 register D-05, deliberately deferred).
- **No resume:** reload or Safari tab eviction loses lesson progress (5.1 register D-11, deferred — needs its own build).
- **Carried-forward S3s:** gated-Next has no accessible reason; progress row not a live region; no `h1`; Practice hint L1 is generic when a column has no carry-in; No-Regrouping sessions ask about regrouping without ever teaching it.

**Q. Owner acceptance tests required — see the checklist below.**

**R. Final status.** Code complete; automated audit pass; **not frozen**.

---

# BUILD 5.2 — PRACTICE PRE-DEPLOYMENT CORRECTION

*(Build 5.2 was never pushed; this corrects the unpublished package. Version stays 5.2.)*

**1. Baseline confirmation.** Runtime read `Build 5.2`; all prior 5.2 work verified present (label sizing, height-aware tiers, phone regroup compaction, classroom mode, Learn decomposition lines, 10-problem sessions, Test Coming Soon, touch/focus fixes). `B52_BASELINE` snapshot taken. Final diff: `index.html` 3 lines, `css/styles.css` 5 lines, `js/app.js` 149 lines.

**2. Owner findings (both reproduced in code before editing).**
- **#1 Regroup auto-fill.** `practiceHandleRegroupTap()` executed `regroupEntries[c.carryPlace] = String(c.carryOut)` the moment the child tapped the correct box. The child supplied the *location*; the **application supplied the value** — an essential mathematical action Practice should develop.
- **#2 No student-controlled Hint.** `hintLevel` was only ever set from `practice.attempts`. `grep -c "Hint" index.html` returned **0**. A child had to fail on purpose to receive help.

**3. Root causes.** Build 5's carry interaction modelled regrouping as a single "where does it go?" gesture and treated the value as a consequence of a correct tap. The hint ladder was built as an *error-escalation* mechanism only, never surfaced as a child-facing affordance.

**4. Child vs app responsibility (after correction).**

| Action | Child | App |
|---|---|---|
| Determine the column answer | **YES** | validate against `answerDigit` |
| Enter the answer digit | **YES** | validate |
| Recognise regrouping is needed | understands it | knows it (`carryOut`) |
| Choose the regroup destination | **YES** | validate against `carryPlace` |
| **Enter the regroup value** | **YES (new)** | validate against `carryOut` |
| Enter the final leading digit | **YES** | validate against `finalCarry` |
| Advance to the next place | — | only after both validations |
| Request a hint | **YES (new)** | provide, contextual |
| Compute any digit for the child | **NO** | **NO** (except guided reveal after repeated difficulty) |

**5. Files changed.** `index.html`, `css/styles.css`, `js/app.js`, `AUDIT-REPORT.md`.

**6. Practice state machine — before / after.**
- *Before:* `digit → carry (tap = value auto-written) → [next column] → final → complete`
- *After:* `digit → carry-dest (child picks destination) → carry-value (pad re-enables; child types the value) → [next column] → final → complete`
Only after the child's regroup value validates does Practice advance. `pendingCarryPlace` holds the chosen destination between the two steps and is cleared on every advance.

**7. Regroup entry implementation.** Tapping the correct box now sets `pendingCarryPlace` and moves to `carry-value` — it writes nothing. The pad re-enables, the target regroup cell carries the `is-prompt` marker, and the typed digit is compared to `practiceCol().carryOut`. Wrong values do not advance and do not overwrite the child's attempt: a generic miss gets "Check what 14 ones becomes when you regroup"; typing the answer digit instead gets "That digit stays in the ONES place. What moves to the TENS?" Wrong destinations get "Regroup one place to the LEFT" and stay put. **No arithmetic is performed in the Practice controller** — `carryOut`, `carryPlace`, `finalCarry`, `finalCarryPlace` remain the only sources of truth.

**8. Hint implementation.** A visible `💡 Hint` button (semantic `<button>`, 46px, contextual `aria-label`) sits above the number pad in every working state. Requests walk the existing ladder — L1 gentle cue → L2 conceptual with the vertical Base-10 addend/Sum rows → L3 Before/After exchange — and are **contextual to the phase**: answering a column, choosing a destination, or entering the regroup value each get their own wording. A 4th request offers the guided reveal so nobody is stuck. Requested hints (`hintRequests`) are tracked separately from wrong-answer escalation (`attempts`), and both reset on every advance — verified no stale hint leaks forward.

**9. Back button.** Not added, per owner decision.

**10. Practice session.** Unchanged: 10 problems, "Problem X of 10", completion panel, no auto-restart. Verified the counter does **not** advance on answer-digit or regroup-value entry — only on full problem completion.

**11. Mathematical forensics.** 8 problems (23+14, 59+55, 182+190, 589+476, 405+270, 999+999, 1,008+2,091, 9,999+9,999 — covering no regroup, ones/tens/hundreds regroup, chain regroup, zero-containing addends, final carry) driven entirely through the **new** interaction: every answer digit, destination pick and child-entered regroup value matched independent Python recomputation, and the destination/value step counts equalled the engine's carry count exactly. **Zero defects.**

**12. Mutation test.** (a) `carryOut` falsified 1→7 on an audit-only clone: Practice **rejected the arithmetically correct 1** and **accepted the falsified 7**. (b) `carryPlace` falsified tens→hundreds: TENS was rejected, HUNDREDS accepted. This proves the new regroup validation reads engine metadata rather than recomputing `floor(rawTotal/10)`. Production data never mutated; genuine object restored after.

**13. Adversarial results.** Typing before choosing a destination is ignored (10 digits, no state change); repeated wrong destinations never advance; double-tapping the destination does not skip the value step or write a value; spamming wrong values escalates support rather than passing; repeated hint requests always reach a resolution; hint state resets on advance.

**14. Responsive.** All 15 required Practice states × 10 device profiles (320×568 → 2560×1440 incl. 844×390 landscape) = **150 probes: zero horizontal overflow, zero overlap, zero block escapes, and the pad/Hint never below the fold on any device.** Whole-app total 320 probes with the same clean result; place labels 11.2–18.4px; smallest text in Practice 10.6px; worst scroll ratio 2.92 (iPhone SE).

**15. Accessibility.** Hint is a semantic ≥44px button with a phase-specific `aria-label`; the prompt cell is marked with a class (not colour alone); instruction panel remains `aria-live="polite"` so wrong-answer and wrong-regroup feedback are announced; pad keys ≥44px; keyboard verified for **both** entry types — a digit typed before destination selection is correctly ignored, and the regroup value is accepted only after a valid destination.

**16. State leakage.** Problem→problem carries nothing forward: answer entries, regroup entries, hint level, hint requests, pending destination, attempts, feedback text and the hint panel all reset. Full transition suite re-run (13 tests) with zero leakage and zero page errors.

**17. Regression.** All seven suites pass: wizard, engine, board (both parts + mutation forensics), Learn, Practice, and the 5.1/5.2 audits.

**18. Defects found during correction.** One application defect introduced and fixed mid-work: the board click listener and pad-enable check still referenced the retired `"carry"` phase name, so destination taps silently did nothing — caught by smoke test, fixed, re-verified.

**19. Harness defects (kept separate).** (a) `practice_audit`, `b51_audit` and the matrix harness all drove the retired `carry` phase — expected behaviour change, updated to the two-step model. (b) A hint-reset assertion wrongly expected a *newly requested* hint on the next column to leave the counter at zero; the app was verified correct and the test corrected. (c) Matrix navigation assumed a home button that isn't present on the Learn completion screen.

**20. Remaining known issues (unchanged from 5.2).** iPhone SE cannot fit board + blocks in one viewport at the regroup state; SE/landscape intro leaves Next slightly below the fold; 4-digit Learn sessions run ~65 steps; no resume after reload; carried-forward S3s (gated-Next has no accessible reason, progress row is not a live region, no `h1`, generic hint L1 without carry-in, No-Regrouping sessions ask about regrouping without teaching it).

**Status: pre-deployment correction complete; automated audit pass; NOT frozen.**
