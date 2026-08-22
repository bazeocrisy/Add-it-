# Add It! — Build 2 Audit Report (Hardening Revision)

**Build number:** Build 2 — hardening pass; badge remains **Add It! — Build 2** (not incremented)
**Date:** August 21, 2026

## Fixes Made

**1. Positive-integer validation consistency.** `calculateAddition()` previously checked `< 0`, silently permitting `0` while the error contract and `validateProblem()` described addends as positive. The check is now `Number.isInteger(...)` plus `<= 0`, with the error message updated to "positive whole numbers (>= 1)". `Number.isInteger` rejects decimals, NaN, Infinity, strings, null, and undefined outright — nothing is coerced; every invalid input throws.

**2. Duplicate-acceptance fallback removed.** `buildProblemSet()` previously contained a bounded safety valve that could knowingly push a duplicate after exhausted attempts (tracked as `duplicateFallbacks`). That counter, comment, and behavior are gone. There is now **no code path that accepts a duplicate**, including reversed pairs (459+287 vs 287+459 share one normalized `min+max` key).

**3. Bounded failure behavior.** Generation follows documented phases: **Phase 1** primary generation attempts (length × 40 budget) → **Phase 2** secondary fresh generation phase (new length × 40 budget for unfilled slots) → **explicit `Error`** ("could not generate N unique problems … unique pool too small"). No path can hang; the failure path is proven by test (below). `meta` now reports `attempts` and `phasesUsed`.

**4. Misleading comments corrected.** `generateProblem()` no longer claims to return a "validated" problem — it "returns one fully calculated problem matching the selected constraints," with a note that `validateProblem` exists for audits/debugging. The no-regroup generator comment ("constructive, then validated") was likewise corrected. No unnecessary runtime validation was added.

Everything else — shell, wizard, state, problem model, generators' math, key strategy, validator, hook, responsive CSS — is preserved unchanged per the no-refactor rule. The problem-object contract (§6) is untouched.

## Engine Audit

**Invalid input tests (all throw; none coerce, none produce NaN/Infinity/broken columns):** `(0,25)`, `(25,0)`, `(-1,25)`, `(25,-1)`, `(2.5,10)`, `(10,2.5)`, `(NaN,10)`, `(Infinity,10)`, `("25",10)`, `(null,10)`, `(undefined,10)` — 11/11 rejected with controlled Errors; `calculateAddition(25, 1) = 26` confirmed working immediately after.

**Deterministic arithmetic cases (exact-value assertions, each also recomputed in Python):** 22+33=55 and 243+126=369 (no regroup, all carryIns 0) · 29+14=43 (ones 9+4=13 → digit 3, regroup 1 ten, `carryPlace:"tens"`) · **182+190=372** (explicit tens-regroup-without-ones: ones 2+0=2 no regroup, tens 8+9=17 regroups; `regroupPlaces` reports exactly `["tens"]`) · 589+476=1,065 verified column-by-column (15→5c1, 16→6c1, 10→0c1, final carry to thousands) · 89+76=165, 999+999=1,998, 9,999+9,999=19,998 (final carry preserved; ten-thousands place; 5-digit answer) · internal zeroes 405+270=675 and 1,008+2,091=3,099 (column indexing and place names intact).

**Generation counts:** 1,000 × no-regroup × {2,3,4}-digit and 1,000 × regroup × {2,3,4}-digit = **6,000 individually generated problems**, each passed both JS `validateProblem` and the Python recomputation; no-regroup batches additionally verified for zero carryOut, zero carryIn, `regrouped:false` everywhere, and no final carry; all normalized keys well-formed.

**Regroup distribution (n = 3,000 per size):** 2-digit — ones 1,790 / tens 2,358 · 3-digit — ones 1,564 / tens 1,716 / hundreds 2,113 · 4-digit — ones 1,484 / tens 1,628 / hundreds 1,573 / thousands 1,931. Regrouping appears in every applicable place; no suspicious ones-only limitation.

**Session combinations:** all **36 configurations** (3 skills × 4 sizes × 3 lengths) × 15 repetitions = **540 sessions / 15,300 problems**: exact length every time; skill and size compliance; mixed skill exactly ⌈length/2⌉ regroup (confirmed policy: deliberate slot plan, then shuffle); mixed size always contained all of 2/3/4-digit — by round-robin design, not luck; `phasesUsed` ∈ {1, 2}; zero thrown errors; no `duplicateFallbacks` field remains in meta. A further stress pass ran 300 more sessions (3,000 problems) — zero defects.

**Duplicate audit:** across all 840 audited sessions, `uniqueKeys.size === problems.length` held every time. **Duplicates: 0. Reversed duplicates: 0** (checked by an explicit ordered-pair scan in addition to the normalized-key Set). **Bounded generation failures in real configurations: 0.**

**Unique-pool exhaustion stress (§14):** using the audit-only `auditGenerator` seam, the pool was artificially restricted. A pool of 5 pairs for a 10-problem request produced an **explicit generation Error in 0.01s** — bounded, no hang, no silent duplicates. A pool of exactly 10 pairs succeeded with 10 unique problems. This proves the failure path, not just the happy path.

**Total independently checked problem instances this audit: ~33,000+** (6,000 generation + 9,000 distribution + 15,300 sessions + 3,000 stress + deterministic/edge cases), of which **6,130 problem objects were fully recomputed field-by-field in Python**.

## Independent Verification Method

Arithmetic was never self-confirmed. Two separate implementations checked every audited problem: (1) in-browser `validateProblem`, which re-derives digits arithmetically (`floor(n / 10^i) % 10`) rather than reusing the engine's string-based extraction, and independently rebuilds every carryIn/rawTotal/answerDigit/carryOut plus final carry; and (2) an external **Python** harness that extracts digits, walks right-to-left, recomputes carries, reconstructs the expected answer, and compares all engine metadata. At no point was `calculateAddition()` called twice and compared with itself.

## Regression

**Build 1 wizard:** the full automated Build 1 audit re-ran green (67/67 checks) — all skill/size/mode/length cards, all 60 wizard routes, Back at every step, Home reset, Choose Another Mode, placeholder screens and chips, keyboard operation, corrected "Regroup to the next place" wording, and the Build 2 badge. **Responsive:** zero horizontal scrolling and no layout regressions at 320 / 375 / 390 / 430 / 768 / 1366 / 1440 (and 1920); logo contained; badge in flow on phones; touch targets ≥ ~44px. **Console:** 0 JavaScript errors, 0 missing-element errors, 0 broken asset requests, 0 unhandled rejections (explicitly monitored). **Asset paths:** all references remain lowercase `assets/images/logo.png`; project-wide search found zero occurrences of `Assets/` or `Logo.png` in delivered files — the GitHub Pages casing bug is not reintroduced. Dead/contradictory-logic search (duplicate fallback, `duplicateFallback`, "accept duplicate", `< 0` positivity check, "validated problem" claims, stale Build 1 badge string, "carrying to the next place", Round It!/rounding terms): zero matches.

## Defects Discovered During This Hardening Audit

**Defect 1** — `calculateAddition(0, n)` accepted zero. *Cause:* positivity check used `< 0` instead of `<= 0`, contradicting the stated contract and the validator. *Fix:* check changed to `<= 0`; message updated. *Retest:* full invalid-input battery (11 cases) plus all 30,000+ generation/session tests re-run. *Final result:* pass.

**Defect 2** — `buildProblemSet()` could knowingly accept a duplicate via its safety valve. *Cause:* bounded-loop fallback prioritized set completion over uniqueness. *Fix:* fallback removed entirely; replaced with the two-phase bounded strategy ending in an explicit Error. *Retest:* 840 sessions with zero duplicates/reversed duplicates, plus the deliberate pool-exhaustion test proving the error path fires bounded. *Final result:* pass.

**Defect 3** — comments overstated runtime validation ("fully calculated, validated problem"; "constructive, then validated"). *Cause:* documentation drift. *Fix:* comments corrected to describe actual behavior. *Retest:* codebase search confirms no remaining "validated problem" claims. *Final result:* pass.

No mathematical flaw was found in the column engine; the problem-object contract required no changes (§26 stop condition not triggered).

## Feature Freeze Confirmation

**Completed:** Build 1 shell and wizard · Add It! branding · regrouping terminology correction · positive-integer input validation · addition column engine · no-regroup / regroup / mixed-skill generation · 2/3/4-digit and mixed-size generation · unique session generation with reversed-pair protection · explicit bounded failure behavior · independent problem validation · final carry support · `carryPlace` metadata · audit hook (`state`, `BUILD_NUMBER`, `calculateAddition`, `generateProblem`, `buildProblemSet`, `problemKey`, `validateProblem`, `config`).

**Still not implemented (Build 3+):** vertical addition board · regrouping boxes · interactive carry entry · Learn lesson · Practice math · hints · Test math UI · scoring · Results · Practice My Misses · Build 3 visual components.
