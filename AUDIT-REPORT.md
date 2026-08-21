# Add It! — Build 2 Audit Report

**Build number:** Build 2 (Addition Engine)
**Date:** August 21, 2026

## Files Changed

| File | Change |
|---|---|
| `index.html` | One wording correction only (Regrouping skill card subtitle) |
| `css/styles.css` | One terminology-only change: token comment renamed `--c-carry` → `--c-regroup` (token was unused; no visual change) |
| `js/app.js` | Complete Build 2 file: Build 1 shell/wizard preserved verbatim + new addition engine + upgraded audit hook |
| `AUDIT-REPORT.md` | This report |

Visually, the app is intentionally unchanged from Build 1 except the corrected subtitle and the badge reading **Add It! — Build 2**.

## Wording Correction

Regrouping skill card subtitle changed from "Practice carrying to the next place" to **"Regroup to the next place."** A repo-wide search confirms zero remaining uses of "carrying" / "carry the 1" in user-facing copy. (The engine's internal `carryIn`/`carryOut` field names follow the spec's problem model; instructional copy will say "regroup.")

## Engine Functions Created

- **`calculateAddition(topNumber, bottomNumber)`** — pure, DOM-free column engine. Validates inputs (rejects non-integers, negatives, NaN), processes columns right-to-left with `rawTotal = topDigit + bottomDigit + carryIn`, `answerDigit = rawTotal % 10`, `carryOut = floor(rawTotal / 10)`, and preserves the final carry (e.g. 9,999 + 9,999 → 1 into the ten-thousands, `finalCarryPlace: "ten-thousands"`).
- **`generateProblem({skill, size})`** — no-regroup problems are built constructively digit-by-digit (every column guaranteed `topDigit + bottomDigit < 10`, leading digits ≥ 1, then validated — never generate-and-hope); regroup problems use bounded retry (max 500) with a deterministic fallback so at least one column has `carryOut === 1`; mixed picks a subtype per problem.
- **`problemKey(problem)`** — commutative normalized key `min+max` so 459+287 and 287+459 dedupe as one pair.
- **`buildProblemSet({skill, size, length})`** — logic-only session builder for 10/25/50. Deliberate slot plan then shuffle: mixed skill deals exactly half regroup / half no-regroup (odd lengths favor regroup); mixed size deals 2/3/4-digit round-robin so every size appears in any 10+ set. Duplicate-free via key set; all loops bounded with a recorded safety valve (`meta.duplicateFallbacks`, observed 0 in every audit).
- **`validateProblem(problem, expectedSkill, expectedSize)`** — recomputes every field from scratch using arithmetic digit extraction (a different method than the generator's), checks answer, digit lengths, every column's carryIn/rawTotal/answerDigit/carryOut/regrouped, final carry and its place, answer-width growth, NaN/undefined guards, and skill/size compliance including that `skillType` truthfully reports the actual generated subtype.

## Problem Object Structure

Matches the specified model: `topNumber`, `bottomNumber`, `answer`, `digitLength`, `answerDigitLength`, `skillType` (actual), `requestedSkill`/`requestedSize` (wizard intent), `regroupCount`, `regroupPlaces`, `finalCarry`, `finalCarryPlace`, and a `columns` array where each column carries `indexFromRight`, `place`, `topDigit`, `bottomDigit`, `carryIn`, `rawTotal`, `answerDigit`, `carryOut`, `regrouped`, and `carryPlace` (where the regrouped value lands) — so Build 3+ can render "14 ones = 1 ten + 4 ones" without recalculating anything.

## Independent Recalculation (per spec §18)

Every audited problem was verified **twice by different implementations**: (1) in-browser `validateProblem`, and (2) a separate Python program that recomputed answers, all columns, carries, final carry, and skill/size compliance completely from scratch. A shared generation/validation bug cannot self-confirm under this design. Both agreed on every problem tested.

## Volume Tested

- **6,000 individually generated problems** (1,000 each: no-regroup × 2/3/4-digit, regroup × 2/3/4-digit) — all valid in both validators.
- **2,000 mixed-skill/mixed-size problems** — all valid; subtypes split ~50/50 (neither collapsed); all three sizes appeared in healthy proportions.
- **540 full sessions** (3 skills × 4 sizes × lengths 10/25/50 × 15 repetitions = 15,300 problems): exact length, zero duplicate keys, zero fallbacks, full skill/size compliance, mixed sets always contained all of 2/3/4-digit, mixed skill always exactly balanced.
- **Stress pass:** 300 further sessions (25 repetitions × all 12 combos × length 10 = 3,000 more problems) — zero defects.
- ~**20,000 additional generations** while searching distribution/edge behavior.
- Grand total: **30,000+ engine-validated problems** in this audit run.

## Regroup Distribution Findings (n = 3,000 per size)

Regrouping was observed in **every applicable place**, not just the ones column:
2-digit — ones 1,767 / tens 2,391 · 3-digit — ones 1,545 / tens 1,721 / hundreds 2,092 · 4-digit — ones 1,479 / tens 1,621 / hundreds 1,557 / thousands 1,932. The generator also produces the tens-regroup-without-ones-regroup case on demand.

## Edge Cases Tested (explicit, exact-value assertions)

10+10, 22+33 (no regroup, all carryIns 0) · 29+14, 47+35 (ones regroup) · tens-only regroup (found and validated) · 586+297, 589+476, 789+656 (multiple/consecutive) · 89+76 asserted column-by-column against the spec (ones 15→5 c1, tens 16→6 c1, final 1 hundred, answer 165) · 999+999, 9,999+9,999 = 19,998 with final carry into ten-thousands and 5-digit answer · internal zeroes 405+270 and 1,008+2,091 · the spec's 459+287 model reproduced exactly · 243+126 fully no-regroup. Boundaries: 10, 99, 100, 999, 1,000, 9,999 in low/high pairings, plus digit-boundary crossings 99+99, 999+999, 9,999+9,999.

## Duplicate Checks

Normalized commutative keys verified on all 840 audited sessions — zero duplicate pairs within any set, including reversed-order pairs.

## Errors Discovered / Corrected

No engine defects were found. One audit-script bug (an invalid size sentinel in the Python edge-case validator) was fixed and the affected audit re-run to completion.

## Build 1 Regression Results

The complete Build 1 automated audit was re-run against Build 2 and **passed in full**: all 60 wizard combinations, every Back transition, Test → Length routing with progress-pill behavior, Home reset, no stale-state leaks, placeholder chips, keyboard operation, skip link, touch targets, and the badge (now "Add It! — Build 2"). Responsive re-verified with zero horizontal scrolling at **320 / 375 / 390 / 430 / 768 / 1366 / 1440** (and 1920). The engine does not touch the DOM and did not affect the UI.

## Console Results

Zero console errors, zero missing-element errors, zero asset errors, zero NaN or undefined problem fields, and zero generation-loop overruns across 30,000+ generations (all loops bounded; safety valves never triggered).

## Audit Hook

`window.__addit` now exposes: `state`, `BUILD_NUMBER`, `calculateAddition`, `generateProblem`, `buildProblemSet`, `problemKey`, `validateProblem`, and `config` (SKILLS, SIZES, MODES, TEST_LENGTHS, PLACE_NAMES, ENGINE_SIZES).

## Explicitly Not Implemented (frozen for Build 3+)

Vertical addition board · regrouping boxes · interactive digit entry · Learn lesson · Practice · hints · Test math interface · scoring · Results · Practice My Misses · animations · regrouping visual movement.
