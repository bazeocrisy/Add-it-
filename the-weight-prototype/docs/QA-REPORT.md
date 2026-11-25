# QA Report

**Date:** 2026-11-25 · **Build:** `the-weight-prototype/`
**Tools:** Playwright and Chromium (headless), axe-core 4.10.2 (WCAG 2.0/2.1/2.2 A and AA rules), curl. Tests ran against `python3 -m http.server`, and the wizard was also checked over `file://`.

## Summary

| Check | Result |
|---|---|
| Console errors (6 pages × 4 widths) | **0** |
| Horizontal overflow at 320 / 375 / 768 / 1280 px | **None** |
| axe-core violations, 6 pages at 375 and 1280 px | **0** |
| Topic × need combinations producing a result | **31 / 31**, each with exactly 1 primary action and ≤ 2 secondary |
| Broken internal links or missing anchors | **0** |
| Dead buttons (`href="#"` or empty) | **0** |
| `localStorage` / `sessionStorage` / cookies after a full run | **0 / 0 / empty** |
| Selection written to the URL | **No** (URL stays `index.html` throughout) |
| Works over `file://` | **Yes** |
| Works with JavaScript off | Crisis bar, urgent panel (4 `tel:988` links), nav, and a `<noscript>` fallback list. The wizard itself needs JS. |

## Scenario testing

"Taps" counts every tap from homepage load to performing the action (dial, text, or open the site).

| # | Visitor | Path | Taps to action | Reading on result | Knows what to do next? | Links work? | Barriers left |
|---|---|---|---|---|---|---|---|
| 1 | Father, divorce | Divorce or relationships → Practical help → **LawHelp.org** (+ Fatherhood Clearinghouse, 211) | 3 | ~200 words; action is first | Yes: "Pick your state…" | 200 ✔ | The primary is a *suggested* resource the owner hasn't verified. The owner has no verified divorce resource yet. |
| 2 | Lost job | Money or work → Finding work → **American Job Centers**: Call 1-877-872-5627 / Website | 3 | ~210 | Yes: "Enter your ZIP…" | Phone from owner. Site is bot-protected (403 challenge to automation). | None |
| 3 | Veteran, transition | Military or veteran life → Housing, benefits, or work → **VA homeless call center** (+ VA.gov, Military OneSource) | 3 | ~200 | Yes | 200 ✔ | If housing isn't the issue, VA.gov (secondary) is the better first step. The owner may want to split this into two options. |
| 4 | Loneliness | Feeling alone → Reach out to someone I know → **Talk It Through** (+ 988, Unload) | 3 (+ copy/send) | ~200 | Yes: 3 numbered steps | Internal ✔ | Still requires him to pick a person. That's intentional (no peer board exists). |
| 5 | Grief | Grief or loss → Someone to talk to now → **988**: Call / Text / Chat | 3 | ~200 | Yes: "A trained counselor answers…" | 200 ✔ (chat is bot-protected) | No grief-specific organization. Not invented; owner may add one. |
| 6 | Overwhelmed, can't name it | I'm not sure → Someone to talk to now → **988** | 3 | ~200 | Yes. The copy says "I don't know, it's just heavy" is a fine start. | ✔ | None |
| 7 | Crisis now | Sticky bar **Call 988** (or Text 988), on every page | **1** | 0 | Yes | `tel:988`, `sms:988` | Desktop browsers without a phone app can't dial. The number is still visible as text. |
| 8 | Older phone (320×568) | First topic card at 447 px, inside the first screen. Help bar is one row, 51 px. Smallest target is 40 px. Housing → 211 in 1 tap. | 2 | n/a | Yes | ✔ | Sticky bar turns off below 480 px of height (landscape) so it doesn't cover content. |

## Keyboard

- Tab order: skip link → Call 988 → Text 988 → More help → brand → Resources → About → first topic card (8 stops).
- Enter on a card moves focus to the "What would help right now?" heading. Tab plus Enter on a need moves focus to "Your next step: …". A polite live region announces each step.
- Back and Start over are real buttons. The browser/phone Back button steps back through the wizard too. Escape isn't needed, because there are no overlays.
- The focus ring is visible on every interactive element (3 px, 3.4:1 against cream).

## Colour contrast (computed)

Navy on cream 15.4:1 · body grey on cream 7.5:1 · amber-ink on cream 5.4:1 (4.8:1 on cream-2) · navy on amber 8.3:1 · light text on navy 10.7–13.6:1 · white on emergency red 7.2:1. All pass AA, and axe found no contrast issues.

## External link check

See [RESOURCE-INVENTORY.md](RESOURCE-INVENTORY.md). 17 return 200 or redirect correctly. 4 are behind bot protection (988 chat, RAINN, CareerOneStop, FTC Job Scams), so automation can't confirm them; they need a manual check. The CDC source on About wasn't reachable from this sandbox. Phone numbers for the suggested additions (SAMHSA 1-800-662-4357, Military OneSource 800-342-9647, Eldercare 1-800-677-1116) were confirmed on each organization's official page. The 988 claim "People do not have to be suicidal to call" was confirmed on 988lifeline.org/get-help.

## Issues found and fixed during testing

| Issue | Fix |
|---|---|
| On a 320×568 phone the support bar wrapped to 131 px and pushed the first card below the fold | Compact one-row bar under 560 px (51 px tall); progress shown as "Step 1 of 2" text |
| Brand name wrapped onto two lines at 320 px | `white-space: nowrap`; nav label shortened to "Resources" |
| "THE WEIGHT" eyebrow repeated the brand right under the header | Removed on the homepage |
| Popstate handling for Start over relied on listener ordering | Replaced with one listener and an ignore flag; re-tested Back, browser Back, and Start over |
| Unload "prompt" was going to be passed in the URL, which would reveal the topic | Removed; Unload offers its own prompt buttons |

## Remaining limitations

1. **Suggested resources need the owner's verification** (6 items, labelled in the UI).
2. **Bot-protected links** (4) and the FTC link need a manual click-through.
3. **No real-device testing.** Testing was in emulated Chromium only; iOS Safari and Android Chrome weren't run on hardware. `sms:?&body=` behaves slightly differently across platforms.
4. **No screen-reader session** (NVDA, VoiceOver). The structure and ARIA were checked with axe and by hand.
5. **Photography:** the owner's hero image appears to be AI-generated. Real photos of men from the community would better meet the "authentic photography" goal. Swap `assets/images/the-weight-hero*`.
6. **U.S.-only crisis numbers**, matching the original site.
7. **The wizard needs JavaScript.** Without it, visitors get the crisis bar, the urgent panel, and links to Resources and Unload, but not the two questions.

## Re-running the tests

```bash
cd the-weight-prototype && python3 -m http.server 8765
# in another terminal, from the-weight-prototype/:
npm i --no-save axe-core@4.10.2 playwright   # once
node docs/qa/qa.js http://localhost:8765/
```
