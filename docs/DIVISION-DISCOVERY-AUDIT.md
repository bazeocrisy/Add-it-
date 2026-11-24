# Assignment 002A — Division Discovery and Technical Audit

**Date:** 2026-11-24
**Developer:** Claude Code
**Audited repository:** `bazeocrisy/study-scoop-ai-tutor` (all branches)
**Audited commit:** `e2b0360` on `feature/lesson-6-1-prototype`
**Report location:** this file is in `bazeocrisy/Add-it-` because this session can only write to that repository. `study-scoop-ai-tutor` was cloned **read-only**. Nothing in it was modified, committed or pushed. After the tests ran, `git status` there was clean.

**Scope compliance:** no application source code was changed. Nothing was merged or deployed. No paid API calls were made, and no Cloudflare, Anthropic or speech-vendor service was contacted. No physical device or live voice testing was performed.

Each finding is labelled with one of these tags:

- **[VERIFIED]** I observed it directly in source code, test output or a headless browser run in this session.
- **[ASSUMPTION]** It comes from general platform knowledge or the repository's own claims, and I did not reproduce it here. It needs confirmation.

---

## 1. Repository and branch status

| Item | Finding |
|---|---|
| Branches | `main` and `feature/lesson-6-1-prototype` exist. No other remote branches. **[VERIFIED]** |
| `main` | Has one commit (`6915d21`, which only adds the README). **[VERIFIED]** |
| `feature/lesson-6-1-prototype` | 15 commits ahead of `main`, linear history. The last commit is `e2b0360` (2026-10-30), "Record executed QA and complete session restart recovery". It has not been merged. **[VERIFIED]** |
| Diff from `main` | 27 files changed, about 2,580 lines added. This includes `package-lock.json` (1,543 lines) and a 2.17 MB portrait PNG. **[VERIFIED]** |
| Visibility | The repository is public: an anonymous git clone succeeded. **[VERIFIED]** |
| Pull requests and issues | Not inspected, because the GitHub API cannot reach this repository from this session. **[UNVERIFIED]** |
| Prior audit and QA documents | `docs/AUDIT-001.md` and `docs/PROTOTYPE-QA.md` were both reviewed. Their test counts match what I reproduced. **[VERIFIED]** |
| Size | About 1,000 lines of application and engine JavaScript, written in a dense, minified-like style with very long lines. **[VERIFIED]** |

**Related repository (context only):** `bazeocrisy/Add-it-` holds two separate apps. The first is "Add It!", a base-ten addition app. The second is "Chris's Learning Club", a grammar and money app that is offline-first and single-file. The Learning Club already has versioned `localStorage` progress with migration and corrupt-storage handling, a Playwright test suite, and a simple `speechSynthesis` read-aloud feature. These are useful reference patterns (see §3). This audit made no changes to either app.

---

## 2. Existing architecture (verified)

```
index.html / styles.css           Static page shell (CSP: self-only scripts and images)
app.js                            Browser UI: rendering, square-grid diagrams, TTS, speech recognition, retry
engine/controller.js              PURE lesson state machine: transition(state, input, lesson) -> {state, output}
engine/voice-turn.js              Collects spoken phrases until the child says "I'm finished"
engine/coach.js                   Optional Anthropic call that CHOOSES between two reviewed explanations (off by default)
curriculum/6-1.json               Area lesson data: 9 concepts and 8 assessment items
cloudflare/tutor-worker/worker.js Optional authoritative backend: HMAC session tokens, Durable Object state, quotas
server/index.js                   Local static file server (development only)
scripts/issue-session.js          Parent-side token issuer
tests/*.test.js                   33 node:test checks
integration/runtime-check.mjs     5 workerd/Miniflare Durable Object checks
```

**Data flow:** the UI sends `{action, message, revision, cells, filled, requestId}`. That goes to `transition()`, which runs either in the browser (local demo) or inside the Worker's Durable Object (protected mode). The result is a `view` object (`phase`, `title`, `speech`, `question`, `options`, `visual`, `progress`, `summary`). The UI renders the view and then speaks `speech` as **one utterance**.

**Lesson model:** a fixed, linear sequence of `teach` (concept by concept) → `assess` (item by item) → `review`. The teaching phase uses each concept's `teach`, `check`, `alternative`, `example` and `followUp` fields. Every concept has exactly one alternative explanation and one alternative example.

---

## 3. Reusable components

| Component | Reuse value | Notes |
|---|---|---|
| `transition()` pure state-machine pattern (`engine/controller.js`) | **High** | The browser and the server share it, and it is easy to test deterministically. It has revision numbers for stale-turn rejection, and the `teach → assess → review` phases already match the target flow. The pattern should be kept. Its contents need to be generalised (§4). |
| No-Next-button progression | **High** | A correct answer advances automatically and speaks the next concept. A wrong answer re-teaches. There is no Next button. **[VERIFIED]** in the browser run. |
| Independent-assessment discipline | **High** | No hints or correctness feedback appear during assessment. Answers are locked on first submission. Reasoning answers are kept unscored for a parent to review. The summary states that one session is limited evidence. **[VERIFIED]** by tests. |
| `voice-turn.js` explicit end-of-turn | **High** | A browser "silence" event is never treated as an answer, and multi-phrase answers are accumulated. This is lesson-agnostic. **[VERIFIED]** |
| `command()` / `numeric()` input parsing | Medium | Lesson-agnostic in principle, but too narrow (§8, §4). |
| Worker security scaffolding (HMAC tokens, bounded JSON, origin checks, idempotent `requestId` replay, quotas, expiry alarm) | Medium–High | Good if a backend is ever needed. Not required for an offline-first division MVP. |
| `coach.js` "LLM selects, never generates" pattern | Medium | A safe pattern for optional AI with schema validation and fallback. Disabled by default. |
| Curriculum-as-JSON plus a structural validator | High (concept) | The schema itself is area-specific. |
| Learning Club (`Add-it-`) `localStorage` persistence | High | Versioned, with migration and handling for blocked or corrupt storage. Directly fills Study Scoop's persistence gap (§10). |
| Add It! base-ten visuals | Low–Medium | Place-value blocks could support later division-with-remainder or regrouping work. They are not needed for grade-3 facts within 100. |

---

## 4. Multi-subject / multi-lesson support: **No, not currently** [VERIFIED]

The engine pattern can be generalised, but every layer is currently bound to one lesson.

### Hardcoded area-specific logic (complete list found)

| Location | Hardcoded item |
|---|---|
| `app.js` (last block) | `fetch('./curriculum/6-1.json')`. There is no lesson registry or lesson picker. |
| `app.js` `tiles()` | The only visual renderer, a square-cell grid with modes `tiles`, `unit`, `partial`, `build`, `gaps` and `circles`. ARIA labels say "square unit". |
| `app.js` `review()` | Rebuilds the child's drawing as a fixed **3×4** grid (`length:3`, `length:4`). |
| `app.js` submit handler | Empty submission becomes `'My figure is ready'`, which only makes sense for build tasks. |
| `engine/controller.js` `connected()` | Neighbour maths assumes grid **width 4** (`i-4`, `i+4`, `i%4`). |
| `engine/controller.js` `grade()` | Build cells must be `< 12` (a 3×4 canvas). |
| `engine/controller.js` `transition()` | The teaching build check calls `grade({kind:'build',answer:8}, …)`. **The answer 8 is hardcoded** instead of being read from the concept. |
| `engine/controller.js` `numeric()` | Strips "the area is" and "square units". Number words only cover zero to twenty. |
| `engine/controller.js` `view()`/`summary()` | Assume the `concepts[]` and `assessment[]` shapes and the 6-1 field names. |
| `engine/coach.js` | System prompt says "third-grade area lesson". |
| `cloudflare/tutor-worker/worker.js` | Statically imports `6-1.json`. The token must have `lesson==='6-1'`. The Durable Object name is `'lesson-6-1-budget'`. `/health` reports `lesson:'6-1'`. |
| `scripts/issue-session.js` | Writes `lesson:'6-1'` into tokens. |
| `scripts/build-curriculum.py` | Asserts exactly 9 concepts and 8 assessment items. |
| `index.html` | Page title, "Chapter 6 / Lesson 1", the "6–1 Understand Area" stamp, `aria-label="Area lesson"`, and the parent text about pages 213–216. |
| `tests/*`, `integration/runtime-check.mjs` | Every test imports `6-1.json`. |

**Conclusion:** adding division as a second JSON file would not work. The engine needs a lesson registry, pluggable visual renderers, and pluggable graders, and the area lesson must be moved onto them unchanged (see §13, Phase 1).

---

## 5. Speech synthesis and recognition

**Verified behaviour:**

- **TTS:** uses browser `speechSynthesis` at rate 0.9 with `en-US`. No voice is selected, so the browser or OS default is used. Each turn is spoken as one concatenated utterance (teaching text plus question).
- **STT:** uses `SpeechRecognition`/`webkitSpeechRecognition` with `continuous=true` and `interimResults=true`. It needs a parent consent checkbox. Auto-listen after the tutor speaks is a second, separate opt-in, works only in the teaching phase, and is off by default.
- **Headless Chromium in this container:** `speechSynthesis` exists but has **0 voices**. The UI correctly fell back to "Audio unavailable · read the question". The `webkitSpeechRecognition` constructor exists. No audio was produced or captured, which means **no live voice test was possible here**.
- Speaking and listening never overlap: the microphone starts 350 ms after TTS `onend`. There is no barge-in.
- `visibilitychange` and `pagehide` stop all audio.

**Limitations. These are [ASSUMPTION]s from platform knowledge and must be confirmed on devices:**

1. Chrome's Web Speech recognition (including on ChromeOS) sends audio to Google servers and needs network access. Safari/iPadOS recognition routes through Apple. It is not on-device by default, which matters for privacy.
2. Firefox does not support `SpeechRecognition`. Typed and touch input remain the fallback, which is already implemented.
3. Recognition sessions end on their own (silence or service timeouts). The app handles this by keeping the draft, but the child must tap the microphone again. That is friction for a child working on their own.
4. iOS/iPadOS Safari usually blocks `speechSynthesis.speak()` unless it is called inside a user gesture. The first utterance runs after an `await`, which may be blocked on iPad, especially in protected (network) mode.
5. Some Chrome versions cut off long utterances (the commonly reported range is about 15 seconds or more). One-paragraph-per-turn speech is at risk.
6. Default system voices differ widely in quality and accent between Chromebook, iPad and Windows. A consistent "teacher voice" is not guaranteed.
7. Recognition of short numeric answers ("six", "sixty") and child speech is unreliable. Words like "for/four" and "to/two/too" are common errors. `numeric()` handles digit transcripts, but number words above twenty fail (§8).

---

## 6. Narration and visual synchronisation: **not present** [VERIFIED]

The diagram renders completely and immediately, and then the entire turn's speech plays as one utterance. The code has no step timeline, does not use `onboundary`/`onmark`, and has no highlight or animation cues. Nothing is animated: the CSS only applies static tile states. For division, the teacher must say "watch me share 12 counters into 3 groups" while the counters move one at a time, so this is the **largest functional gap**.

---

## 7. Automatic lesson progression: **partial** [VERIFIED]

- Progression is good: there is no Next button, a correct answer advances, and the move into the assessment is spoken.
- What is missing:
  - The teaching unit is a single paragraph. There are no multi-step demonstrations ("I do → we do → you do").
  - Auto-listening is off by default, so a non-reading child must tap the microphone or option buttons every turn.
  - The teaching phase has **no exit after repeated failure**. I verified that six wrong answers leave the child on concept 1 with `attempts: 6`, hearing the same alternative text each time with only a different opening sentence.

---

## 8. Questions, interruptions, pause, repeat and help [VERIFIED]

| Capability | Status |
|---|---|
| Pause / Resume | Works. `synth.cancel()` stops speech, and Resume replays the whole turn from the start. A pause queued while a request is in flight is handled. |
| Repeat | Replays the whole turn's speech. There is no "repeat just the question". |
| Help | Gives the concept's single alternative explanation and example. In assessment, help is refused (correct). |
| Stop | Same as pause. |
| Voice commands | `command()` only accepts **exact whole phrases**. I verified that `"can you help me"`, `"I need help"`, `"hold on"` and `"say it again please"` all return `null`. |
| **Defect: unrecognised help request during assessment** | In the assessment phase, saying "I need help" is **recorded as the child's answer, graded incorrect, and moves on to the next problem**. This was reproduced against `transition()`. |
| Free-form student questions | Only teaching-phase messages beginning "why / how / what does / can you explain" are treated as questions. They get the same alternative text as Help. With AI enabled, the model may only choose between two pre-written texts. **The tutor cannot answer an actual question.** |
| Barge-in (interrupting by voice while the tutor talks) | Not supported. Only the on-screen buttons can interrupt. |
| Number words | `numeric()` only understands zero to twenty. `"twenty four"` and `"eighty-one"` return `NaN` (verified). Grade-3 division uses dividends up to 100. |

---

## 9. Incorrect answers and alternative teaching [VERIFIED]

- A wrong answer is a binary judgement. There is **no misconception diagnosis**: the app does not tell apart "multiplied instead of divided", "subtracted", "off by one group" or "counted the groups instead of the items per group".
- There is **one** alternative explanation per concept. The 2nd through nth failures repeat it.
- There is no escalation ladder (hint → different model → worked demonstration → guided completion → flag and move on).
- Reasoning answers are kept for parent review, and a multiple-choice follow-up checks the concept. This is honest, and the approach is worth keeping.

---

## 10. Independent assessment, mastery tracking, persistence and resume [VERIFIED]

- **Assessment:** 8 fixed items in a fixed order, no hints, first answer locked. Answer keys are readable in the client in local mode, which the project documents openly.
- **Mastery:** none. The summary counts "x of y correct" for a single session. There is no per-skill evidence across sessions, no threshold, no spaced re-check, and no item variation, so a retake shows the same 8 items.
- **Persistence:**
  - Local mode stores nothing. A reload or restart **loses all progress**, as documented.
  - Worker mode keeps state in a Durable Object only until the one-hour token expires, then deletes it.
  - There is no `localStorage` and no parent history.
- **Resume:** works only within one live Worker session (reconnect with `start`).

---

## 11. Tablet and Chromebook compatibility

**[VERIFIED] in headless Chromium only:** at viewport widths of 360, 768, 1024 and 1366 px, there was no horizontal overflow and no console errors. Start, wrong answer, alternative example, and correct answer then advancing all worked at every width. Tap targets are standard buttons.

**Not verified (no physical device used):**

- Real Chromebook (ChromeOS Chrome) and iPad (Safari/WebKit) behaviour.
- Touch-only operation, on-screen keyboard overlap, and microphone permission prompts.
- Voice availability on those devices and audio routing.

**Risks:**

- The portrait is a **2.17 MB PNG**, slow on school or low-end hardware. It should be WebP at about 100 KB.
- iPad TTS gesture rules (§5.4).
- Text input invites the keyboard, but a number pad would suit division better.

---

## 12. Child privacy, security and external dependencies

**Verified strengths:**

- The CSP allows scripts and images from `self` only, `connect-src https:`, and the `no-referrer` policy.
- There are no analytics, no fonts or CDNs from outside the site, and no `localStorage`.
- No student name is requested.
- Tokens are kept only in memory. The signing secret stays server-side.
- `.gitignore` excludes `.env*` and `.dev.vars`.
- `grep` found no API keys in the repository.

**Concerns:**

1. **[ASSUMPTION]** Browser speech recognition sends the child's voice to Google or Apple. This is the main privacy exposure and is outside the app's control. The parent consent text says so, which is good. Collecting data from a child under 13 through a third-party service has COPPA implications that the owner should review.
2. **[VERIFIED]** Worker mode stores the child's free-text responses in Cloudflare until the token expires, plus up to about one minute for cleanup.
3. **[VERIFIED]** With AI enabled, the child's message goes to Anthropic. It is disabled now.
4. **[VERIFIED]** `connect-src https:` allows any HTTPS origin. It could be narrowed to the approved Worker origin.
5. **[VERIFIED]** The Worker uses one global Durable Object (`idFromName('lesson-6-1-budget')`) for every session. That is acceptable for a pilot, but every family would share one serialised object.
6. **[VERIFIED, development only]** Wrangler prints that it collects anonymous telemetry. Set `WRANGLER_SEND_METRICS=false` for development.

**External dependencies:**

- Runtime: browser speech services (implicit).
- Optional: Cloudflare Workers with Durable Objects, and the Anthropic API.
- Development: `wrangler@4.156.0`, `miniflare` (beta tag), Node.
- The README requires Node 24 or later, but the tests passed on Node **22.23.5** in this session.

---

## 13. Proposed division architecture (for review — not implemented)

### Design principles

- **Offline-first and free by default:** a static site plus browser speech, so there is no required backend.
- **Deterministic and reviewed:** all teaching text and grading are reviewed content plus deterministic code. AI stays optional and off.
- **One generic engine, many lessons:** the area lesson must run unchanged on the new engine, proven by snapshot tests.

### Components

1. **Lesson registry** (`curriculum/index.json`). Lists lessons with subject, grade, standard and schema version, and drives a simple lesson picker. Area 6-1 becomes the first entry.
2. **Teaching script timeline.** Each concept becomes a list of **steps**, `{say, show: {visual action}, await?: check}`. The runner speaks one short utterance per step and applies the visual action on that utterance's `onstart`/`onend`. This gives step-level synchronisation that works without `onboundary`, and the short utterances avoid the long-utterance cut-off risk.
3. **Visual renderer plug-ins** (SVG and CSS animation, no images needed):
   - `equalGroups`: share N counters into k groups, animated one at a time.
   - `array`: rows × columns.
   - `numberLine`: repeated-subtraction jumps.
   - `factFamily`: triangle.
   - `tiles`: the existing area renderer, unchanged.
   - Interactive variants, for example "drag or tap counters into groups".
4. **Grader plug-ins:** `number`, `choice`, `exact`, `build` (area), `groups` (counters per group), `factFamily`. Each lesson declares its grader. `numeric()` is extended to number words up to 100.
5. **Misconception-aware remediation ladder** for each check. `diagnoses` rules map wrong answers to targeted re-teaching. Examples for 12 ÷ 3:
   - answer 36 → "you multiplied"
   - answer 9 → "you subtracted"
   - answer 3 → "that's the number of groups"
   - answer off by one → "recount a group"

   The ladder runs: diagnose → alternative model (switch from groups to array or number line) → worked demonstration → the child completes the last step → after N tries, mark "needs re-teach" and **move on**. This fixes the unbounded loop.
6. **Item generator:** seeded, deterministic division facts within 100 and word problems. The key is computed, never written by hand. Each assessment draws fresh items, and the reviewed templates come from the curriculum researcher.
7. **Mastery model:** per-skill evidence across sessions. A skill is mastered only when it reaches a threshold on independent items across at least 2 separate days. The thresholds are to be set by the architect.
8. **Persistence:** on-device `localStorage` with a schema version and migration, adapted from the Learning Club. It is pseudonymous (no name) and stores progress only (no audio or transcripts by default). A parent can export or delete it.
9. **Voice adapter interface** with `Speaker` and `Listener` parts, implemented by Web Speech now:
   - It allows a later swap to pre-recorded audio or another engine without touching lessons.
   - A conversation loop (`SPEAKING → LISTENING → PROCESSING`) with auto-listen on by default once a parent has consented.
   - Fuzzy command intents: "I need help", "say it again", "hold on".
   - In assessment, help-like phrases must **never** be recorded as answers.
   - A large on-screen number pad as the default input for numeric answers.
10. **Student questions:** a reviewed per-concept FAQ ("Why do we divide?", "What's a remainder?") matched by keywords. Anything unmatched gets an honest "Let's ask your grown-up later" and is logged for the parent. AI-generated answers stay out of scope unless separately authorised.

**Curriculum scope (for the architect to confirm):** Common Core grade-3 division standards 3.OA.2 (equal shares and number of groups), 3.OA.3 (word problems), 3.OA.4 (unknown number), 3.OA.6 (division as an unknown-factor problem) and 3.OA.7 (fluency within 100). Remainders are normally grade 4 (4.NBT.6), so I recommend excluding them.

---

## 14. Estimated operating costs

| Item | Needed? | Estimated cost | Status |
|---|---|---|---|
| Static hosting on GitHub Pages (public repository) | Yes | $0 | **[ASSUMPTION]** Pages on a *private* repository needs a paid GitHub plan. |
| Browser TTS and STT (Web Speech) | Yes | $0 | Cost is free. Privacy cost is in §12. |
| Cloudflare Worker and Durable Object | **No** for the offline MVP | $0 on the free tier at pilot scale. Workers Paid is about $5 per month if limits are exceeded. | **[ASSUMPTION]** Check current Cloudflare pricing and free-tier Durable Object (SQLite) limits. |
| Anthropic API, current `coach.js` design (≤100 output tokens, ≤12 calls per day) | No (off) | Claude Haiku 5.5 is listed at $0.10 per million input tokens and $0.50 per million output tokens. At about 300 input and 100 output tokens per call, that is about $0.00008 per call, so under **$0.05 per month** at the 12-call daily cap. | Pricing from a list cached 2026-11-03. **[ASSUMPTION]** Not verified against a live request. |
| Anthropic API, hypothetical fully conversational tutor | Not proposed | Assuming about 60 turns × (3k input + 200 output) tokens per lesson: about $0.02 per lesson on Haiku 5.5, and about $1 per lesson on Opus 5.5 ($4/$20). | Rough estimate only. Needs separate authorisation. |
| Premium neural TTS (pre-rendered lesson audio) | Optional | Usually charged per character. If generated **once** at build time, it is a one-time cost, not a recurring one. | **[ASSUMPTION]** Vendor not chosen. Needs authorisation. |
| Custom domain | Optional | About $10–15 per year | **[ASSUMPTION]** |

**Recommended MVP recurring cost: $0.**

---

## 15. Actual test results (executed in this session)

Environment: Linux container, Node **v22.23.5**, npm 10.9.9.

| Command | Result |
|---|---|
| `npm test` (`node --test`) | **33 passed, 0 failed**, 0 skipped (about 169 ms). |
| `npm run check` (syntax checks of 5 files) | **Passed** (exit 0). |
| `python3 scripts/build-curriculum.py` | **Passed**: "Reviewed curriculum structure validated; no files overwritten." |
| `npm ci` | Passed, "found 0 vulnerabilities". |
| `npm run test:runtime` | **Passed.** The Wrangler 4.156.0 dry-run bundle built (32.81 KiB, 9.03 KiB gzipped). The Miniflare check printed "PASS: … (5 checks)". Nothing was deployed. |
| Headless Chromium smoke test (Playwright; my own script in the session scratchpad, not added to the repository) | At 360, 768, 1024 and 1366 px: no overflow and no console errors. Start → wrong answer (stayed on 1 of 9, example shown) → correct answer (advanced to 2 of 9). TTS had no voices, so the fallback status was shown. |
| Direct probes of `transition()` (not in the repository) | Confirmed these defects: "I need help" in assessment is recorded as a wrong answer; number words above twenty are not parsed; natural help phrases are not recognised; the teaching retry loop is unbounded. |

The repository's own test suite has no browser or UI tests. Its claim of manually testing the full lesson in a browser predates this audit and I did not re-run it in full. My run covered only the first two concepts.

---

## 16. Recommended implementation sequence (each phase gated by review)

0. **Decisions** (§17), and the architect supplies the division curriculum specification.
1. **Engine generalisation with no behaviour change:**
   - Add the lesson registry, renderer and grader plug-ins.
   - Remove the hardcoded 3×4 grid, the answer 8 and the 6-1 constants.
   - Add **golden transcript tests** proving that area 6-1 behaves identically.
   - All 33 existing tests and the 5 runtime checks must still pass.
2. **Defect fixes:**
   - Help-like phrases during assessment must never be recorded as answers.
   - Fuzzy commands.
   - Number words to 100.
   - A cap on teaching retries.
3. **Speech layer:** voice adapter, step timeline with per-step utterances, auto-listen by default after consent, number pad.
4. **Persistence:** versioned `localStorage` progress and resume.
5. **Division visuals:** equal groups, arrays, number line, fact family, with animation.
6. **Division lessons:** reviewed content, a seeded item generator, and diagnoses for each check.
7. **Remediation ladder and mastery model.**
8. **Owner device acceptance:** Chromebook and iPad, real voice, a child-led session.
9. **Optional, only with authorisation:** pre-rendered voice, Worker sync, AI question answering.

---

## 17. Risks and unresolved questions

**Risks**

- Browser speech recognition quality with a child's voice is unknown and is the biggest risk to the "independent" goal. Touch and number-pad input must stay first-class.
- Children's audio going to Google or Apple through browser speech recognition, and the related privacy and legal review.
- iPad Safari audio gesture restrictions.
- Generalising the engine could regress the area lesson. Golden tests reduce this risk.
- The current single-paragraph-per-turn design and the dense code style slow down safe changes.

**Questions for the product owner and architect**

1. **Which repository should hold the division work?** Study Scoop (`feature/lesson-6-1-prototype`) is the stated base, but this session can only push to `bazeocrisy/Add-it-`. The Study Scoop repository would need to be attached with push access, or the work would need to be relocated.
2. **Target devices:** which exact Chromebook model, and is an iPad in scope?
3. **Persistence:** on-device only (`localStorage`), or sync across devices (which needs a backend and accounts)?
4. **Source material:** is there a textbook chapter or page range for division, like pages 213–216 for area, that the curriculum must align with?
5. Should remainders be excluded (they are normally grade 4)?
6. **Mastery thresholds:** what score, how many items, and over how many days?
7. Is browser cloud speech recognition acceptable for the child, or does the owner require on-device or no voice input?
8. **Teacher voice:** browser default voices, or authorise a one-time pre-rendered voice?
9. Should the area lesson stay on the Worker path, or should the MVP be offline-only, with the Worker kept as an option?
10. Does "interruptions" require true voice barge-in? Web Speech cannot reliably listen while speaking. **[ASSUMPTION]**

---

## 18. Verified findings vs assumptions — summary

**Verified:**

- Branch and commit state.
- The architecture and every hardcoded item in §4.
- The test results in §15.
- Headless layout and flow at four widths.
- TTS fallback when no voices are available.
- The defects in §7–§9 (assessment "I need help" recorded as an answer, number words above twenty, exact-match commands, unbounded retry loop, single alternative explanation).
- No persistence or mastery tracking.
- The privacy configuration (CSP, no analytics, no keys in the repository).

**Assumptions (need confirmation):**

- Speech vendor data handling.
- iPad and Chromebook behaviour.
- Long-utterance cut-off.
- Recognition accuracy.
- All prices: Cloudflare, GitHub Pages, TTS vendors, and Anthropic (from a list cached 2026-11-03).
- That `coach.js` still works with current models. It sends `max_tokens: 100` with no `thinking` setting. If the chosen model thinks by default, it may hit the limit, and `coach.js` would then always fall back. This needs a live test, which requires authorisation.

**Audit complete. Awaiting architectural review and approval before any implementation.**
