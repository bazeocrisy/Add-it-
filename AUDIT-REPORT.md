# Add It! — Build 3 Audit Report (Vertical Addition Board + Independent Forensic Audit)

**Build number:** Build 3 · badge **Add It! — Build 3** · files audited: `index.html`, `css/styles.css`, `js/app.js`, `assets/images/favicon.png` (new), `assets/images/logo.png` (unchanged)
**Date:** August 21, 2026

## Renderer Architecture

`renderAdditionBoard(container, problem, options)` renders one CSS-grid component for every problem: grid column 1 is the plus-sign gutter; columns 2..N+1 are place-value tracks (`minmax(30px, 64px)` — tracks shrink together and **cannot wrap**). Six grid rows — place labels, regroup cells, top addend, bottom addend, rule, answer cells — share the same tracks, so alignment is structural, with no pixel offsets, no per-digit-count layouts, and no `left` positioning. Options: `showPlaceLabels`, `showRegroupRow`, `showRegroupValues`, `showAnswerValues`, plus `activePlace` / `highlightRegroupPlace` / `completedPlaces` / `interactive` state hooks reserved for Build 4+. Cells carry `data-row` / `data-place` / `data-track` (zero IDs), so rerenders can never duplicate an ID and cells can later become inputs without restructuring. `getBoardColumns(container)` reads the rendered board back for audits; both are on `window.__addit` alongside all Build 2 exports.

**Renderer independence (§4):** the board section contains no addition arithmetic — verified by source scan (`topDigit + bottomDigit`, `% 10`, `Math.floor(rawTotal…` absent). Digits come from string formatting of `topNumber`/`bottomNumber`; answer digits from `columns[].answerDigit`; the leading digit from `finalCarry`; regroup positions from `carryPlace`. The renderer never invents a digit (§33 verified per render in the stress run).

**Tracks supported:** 2–5. Track count = `max(digitLength, answerDigitLength)`, so the TEN THOUSANDS column exists only when a 4-digit addition's final carry requires it. Verified: 23+14→2, 59+55→3, 243+126→3, 589+476→4, 1008+2091→4, 9999+9999→5; no permanent empty tracks.

**Final carry / regroup destinations (§10–§12):** ordinary regroup placement is keyed **by place name** from `columns[].carryPlace` — the frozen engine metadata is the source of truth, with no `indexFromRight + 1` positional inference anywhere in the renderer (verified by source scan). A carry whose destination equals `problem.finalCarryPlace` is the final regroup: in the normal preview it is *not* shown in the regroup row (it is the leading answer digit, so the child never sees it twice), but the reusable board exposes it via a new explicit option, **`showFinalRegroupValue`** (default `false`), which places `problem.finalCarry` in the regroup row at `problem.finalCarryPlace` — the "11 tens = 1 hundred + 1 ten" instructional state Build 4 Learn will show before revealing the final answer digit. Verified: 59+55 normal preview shows regroup over TENS only with the HUNDREDS `1` appearing exactly once; with `showFinalRegroupValue:true` and the answer hidden, `1` appears over HUNDREDS (and the aria-label never leaks the hidden answer); showing final regroup and final answer together requires both flags explicitly. 589+476's rendered destinations exactly equal its engine carryPlace set, with the final regroup over THOUSANDS; 9999+9999's final regroup renders over TEN THOUSANDS from `finalCarryPlace` and fits at 320px; 182+190 shows only HUNDREDS and the option adds nothing when `finalCarry` is 0; 243+126 stays fully blank even with both flags on. All four transitions (ones→tens, tens→hundreds, hundreds→thousands, thousands→ten-thousands) exercised. No-regroup problems show fully blank regroup rows — zero fake `0` carries (§11).

**Comma handling (§15/§38):** commas are absolutely-positioned `::after` decorations on the thousands-place cells — programmatically confirmed they are not grid tracks (1,008 board = exactly 4 tracks; 19,998 = 5) and shift digit centers by ≤0.5px (measured 0.0).

## Deterministic Visual Cases (8)

A 23+14=37 · B 59+55=114 · C 243+126=369 · D 182+190=372 (regroup over HUNDREDS only, nothing over TENS) · E 589+476=1,065 (`1 0 6 5` aligned; regroups over TENS+HUNDREDS; final carry as thousands answer digit) · F 405+270=675 (zero visibly in TENS: top `4|0|5`) · G 1,008+2,091=3,099 (digit matrix `1008 / 2091 / 3099` intact — note: this is genuinely a **no-regroup** problem, 0+0=0 in hundreds) · H 9,999+9,999=19,998 (5 tracks, TEN THOUSANDS label, no wrap/clip/scroll). All rendered values matched engine metadata exactly.

## Responsive & Alignment Results

**735 per-cell alignment measurements**: 7 viewports (320/375/390/430/768/1366/1440, desktop at 1366×768) × 6 board shapes × every track × 5 rows. Every track's label/regroup/top/bottom/answer centers aligned within **2 CSS px** (grid guarantees it; measured anyway). Zero horizontal overflow anywhere; zero row wrapping (ONES never left its row); the 5-track board fits 320px with readable digits; TEN THOUSANDS wraps at its space as TEN / THOUSANDS while remaining one semantic label in one track, and does not oversize its column (§9 verified at all phone widths). Rule spans the workspace and resizes with board width (23+14 rule < 9999+9999 rule); exactly one plus sign, left of the second addend, in the gutter column, vertically aligned, never overlapping at 320px.

## Preview, Stress, and State Results

**Preview controls (§16–§18):** entry into Learn/Practice/Test auto-renders a fresh problem for the selected skill/size. Show Regrouping on a no-regroup problem shows "No regrouping needed for this problem." with zero fake values; Show Answer reveals the true engine sum; Reset returns the same problem to neutral and clears the message; New Preview Problem yields a fresh neutral board. **Skill/size compliance:** 360 preview generations (120 per skill across all 4 sizes) — 0 no-regroup problems regrouped, 100% of regroup problems regrouped, mixed produced both subtypes; all operands within 10–99 / 100–999 / 1,000–9,999; mixed sizes spanned 2–4 digits. **Long↔short transitions (§17):** 9999+9999 → 23+14 leaves one board, tracks {TENS, ONES} only, zero stale values; reverse renders the full 19,998 board. **Random stress (§24):** 1,050 rendered board states across all skill/size/reveal combinations — every digit, answer, and regroup position matched engine metadata; zero stale DOM, stale classes, wrong labels, or wrong track counts. **DOM/listeners (§25–§26):** zero duplicate IDs (board uses none); after 10 rerenders one click still produces exactly one new board — controls use a single delegated listener bound once at init.

## Regression Results

**Build 2 engine (§3/§23):** frozen-case columns re-verified exactly (59+55, 243+126, 182+190, 589+476, 1008+2091, 9999+9999 — including carryIn chaining), plus **3,000 generated problems (500 × 6 categories) recomputed field-by-field in Python** — zero defects. Build 3 touched no engine function. **Build 1 wizard (§22):** full 67-check suite green — all 60 route combinations, chips, Back/Home/Choose Another Mode, keyboard, badge. **Navigation from preview (§21):** Home → Step 1; Choose Another Mode → Step 3 keeping skill+size; Back chain Length→Mode→Size→Skill intact; changed selections drive correct preview subtype/size; no stale board DOM survives.

## Accessibility, Keyboard, Touch, Favicon, Console, Casing

Board exposes `role="img"` with "Vertical addition problem: X plus Y." — the answer is announced only when revealed and never leaks through DOM or aria-label while hidden (§35 verified); the digit grid is `aria-hidden` so plus/rule create no noise. All preview controls are native buttons, fully keyboard operable (§28 verified end-to-end), ≥40px tall with ≥4px spacing at phone widths (§29). **Favicon:** new brand-matched `assets/images/favicon.png` (lowercase), linked in HTML, fetches HTTP 200, zero favicon 404s. **Asset casing:** zero `Assets/` or `Logo.png` occurrences. **Console:** 0 errors, 0 page errors, 0 unhandled rejections, 0 app 404s across every run including two clean-load §45 forensic passes (desktop and 320px) through the full journey. **Scope creep (§42):** none — no scoring, hints, lesson steps, or submission logic exists.

## Required Audit Counts

Deterministic board cases: **8** · responsive widths: **7** · alignment measurements: **735** · engine regression problems: **3,000** (Python-recomputed) · random board render states: **1,050** · preview skill/size combinations: **all 12** (360 problems) · wizard routes: **full Build 1 suite (60 combinations, 67 checks)**.

**Final hardening pass (pre-freeze):** the regroup-destination map was converted from index arithmetic (`indexFromRight + 1`) to place-name lookup on `carryPlace`/`finalCarryPlace`, and `showFinalRegroupValue` was added. Retested: the 15-check hardening suite above, the full forensic parts 1 and 2 (including the 735-measurement alignment sweep), the Build 1 wizard suite, and a 7-viewport sweep of the 9999+9999 board in both normal and final-regroup states (no wrap, no overflow, no label overlap, track widths unchanged within 2px, answer verified hidden in the instructional state). The engine's known objects were reconfirmed unchanged. All green; the normal preview is visually identical to the previously audited Build 3.

## Defects Found and Fixed

**Defect 1 (app, visual):** place label rendered "HUNDRE DS", broken mid-word. *Cause:* `overflow-wrap:break-word` on labels splits single words. *Fix:* `overflow-wrap:normal; word-break:keep-all` — only TEN THOUSANDS wraps, at its space. *Retest:* deterministic cases + all-viewport alignment. *Result:* PASS.

**Defect 2 (app, visual):** at 320px (5-track) and — under fallback fonts — at 768–1440px (4/5-track), labels THOUSANDS/HUNDREDS overflowed their 64px tracks and overlapped neighbors ("THOUSANDS" measured 80px wide before Baloo 2 loads). *Cause:* label font sized without accounting for track width under the widest fallback font. *Fix:* label size scales with track width (`clamp(.4rem, 1.05vw, .52rem)`) plus `.ab-t4`/`.ab-t5` phone reductions; renderer tags the grid with its track count. *Retest:* a new range-based label-overlap detector was **added to the audit** (this defect class is now permanently caught) and the full 7-viewport × 6-shape sweep re-ran. *Result:* PASS — zero overlaps at every width, fallback fonts included.

**Defects 3–5 (audit harness, not the app):** (3) test data wrongly expected a hundreds regroup in 1008+2091 — the engine's no-regroup result is mathematically correct (0+0=0); (4) row-wrap and (5) plus-sign checks compared against *empty* leading-carry cells whose zero-height text rects faked failures. *Fixes:* corrected expected values; wrap detection uses the always-rendered answer boxes; plus check uses the first non-empty digit. All re-run to full pass. Recorded per instructions: intermediate failures are evidence, not embarrassment.

## Remaining Intentionally Unimplemented (Build 4+)

Learn teaching sequence · interactive regroup/answer entry · Practice workflow · hints · scoring · Test answer entry · Results · Practice My Misses.

---

## PASS — Freeze Build 3

Arithmetic representation, alignment (735 measurements ≤2px), regroup destination placement, final-carry handling (never duplicated), stale-state hygiene, 320px no-wrap behavior, the frozen Build 2 engine (3,000-problem Python recheck), the full Build 1 wizard suite, and the console are all verified clean from fresh browser loads. Any valid Build 2 problem can be placed in this component and every digit, regroup value, place label, and answer position can be trusted at 320px exactly as at desktop. Build 3 is ready to carry Build 4.
