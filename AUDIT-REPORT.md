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

## PASS — Freeze Build 5
