# Design Rationale

**Goal:** the visitor understands the site in 5 seconds and reaches a meaningful action within 30 seconds. We change how the owner's vision is delivered, not the vision itself.

## What stayed exactly the same

| Owner's element | In the prototype |
|---|---|
| Name and H1: "You don't have to carry it by yourself." | Same, as the homepage H1 |
| Palette: navy `#101a2e`, cream `#f6f1e7`, amber `#e0a24c`, amber-ink `#8a5712` | Same tokens, same contrast choices |
| Serif headings and system sans body, no web fonts | Same |
| Door-shaped logo mark | Same CSS mark |
| Hero photograph (five men of different ages and backgrounds, including Black men) | Same image, owner's file |
| "Wherever you are, you're welcome here." | Kept, shortened |
| Unload and Talk It Through, with the owner's privacy wording and the exact "ask" sentences | Re-created faithfully |
| Veterans page pattern: "What kind of help do you want right now?" | Becomes Step 2 for every topic |
| Verify-and-date every resource; never mix sponsorship with crisis | Kept. Every resource shows its verification status. |
| "Not a therapy provider, medical care, or an emergency service" | On every result and in the urgent panel |
| Statistics with year, source, and age-band caveat | Moved to an expandable section on About |

## What changed and why

1. **The first question is the homepage.** There is no "Choose a door" button and no scrolling past 10 descriptions. The nine Step 1 cards begin right under the H1 (447 px from the top on a 375 px phone; visible on the first screen of a 320×568 phone).
2. **Topic first, then need.** Ten doors became nine plain topics, grouped from the owner's doors and hero text. "I'm not sure" is added for visitors who can't name the problem. Step 2 asks what would help right now, with 3–4 options, the same pattern as the owner's Veterans page.
3. **One primary action.** Each result shows one "Do this first" card with tap-to-call or tap-to-text buttons, no more than two alternatives, and a 1–3 line "What happens next". Results run about 200 words.
4. **Step 2 is skipped where it adds nothing.** "Housing, food, or basics" goes straight to 211, with the homeless veterans line and the food-bank finder as alternatives. This is the owner's own "Fastest first step: dial 211".
5. **No dead ends.** The four "coming soon" doors now lead to actions that work today. Grief, loneliness, and "not sure" get real paths built from the owner's own tools (Unload, Talk It Through) and 988, which states that "People do not have to be suicidal to call."
6. **Help is always one tap away, with no wizard and no JavaScript.** A sticky top bar on every page has Call 988, Text 988, and More help. The bar is plain HTML. The urgent panel separates three tiers visually: **Emergency (911)**, **Crisis lines (988, Veterans Crisis Line)**, and safety hotlines, which sit in an expandable section.
7. **Longer content is optional.** Mission, what we are and aren't, statistics, privacy, support, and contact moved to About, mostly inside `<details>`.
8. **Plain scripts instead of ES modules.** The prototype runs by double-clicking `index.html` (`file://`) and on GitHub Pages. The crisis bar, urgent panel, Unload text, and nav all work without JavaScript.

## Distinguishing types of help

| Tier | Shown as | Examples |
|---|---|---|
| Emergency | Red-bordered card, "Emergency" label | 911 |
| Crisis line | "Crisis line · free · 24/7" | 988, Veterans Crisis Line, DV, RAINN, trafficking |
| Professional | "Counseling and treatment referrals" group | SAMHSA Helpline, FindTreatment.gov, Military OneSource |
| Practical / community | "Practical help" group | 211, NCHV, food banks, job centers, legal info |
| The Weight's tools | "Do it yourself, right now" | Unload, Talk It Through. Labelled as private self-help, not a service. |

## Privacy decisions

- No cookies, `localStorage`, `sessionStorage`, analytics, forms that submit, or network calls of our own.
- Wizard selections live in a JavaScript variable only. `history.pushState` stores only a step counter, so the phone's Back button works, but the topic is never written to the URL or history. A reload starts fresh.
- `<meta name="robots" content="noindex">` keeps the prototype out of search engines, and the footer says it is a design prototype, not the official site.

## Accessibility decisions (WCAG 2.2 AA)

- Each choice is a real `<button>` with its label inside it. Choosing one moves focus to the next step's heading, and a polite live region announces "Step 2 of 2…" or "Your next step is ready."
- The progress bar uses `aria-current="step"`. On narrow screens it shows the text "Step 1 of 2".
- Tap targets are at least 40 px (the top bar) and 48 px (main buttons), above the 24 px minimum in WCAG 2.2.
- Focus outline: 3 px amber-bronze (`#b5730f`, 3.4:1 on cream, which meets the 3:1 rule for non-text indicators); lighter amber on navy.
- Text contrast: navy on cream 15.4:1, charcoal-soft on cream 7.5:1, amber-ink on cream 5.4:1, navy-900 on amber 8.3:1, white on the emergency red 7.2:1. axe-core found 0 contrast issues.
- `prefers-reduced-motion` turns off transitions. There are no animations, pop-ups, or carousels.
- The sticky bar stops sticking on screens under 480 px tall, so it never covers content in landscape on older phones.

## Icons and photography

The icons are hand-drawn inline SVG line icons, decorative (`aria-hidden`). No icon library is used. The only photograph is the owner's existing hero image, reused so the brand stays recognisable. The image appears to be AI-generated. If the owner wants fully authentic photography, see the recommendation in the QA report's remaining limitations.
