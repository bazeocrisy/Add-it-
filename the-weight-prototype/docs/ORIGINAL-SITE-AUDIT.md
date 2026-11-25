# Original Site Audit: theweightmen.com

**Audited:** 2026-11-25
**Pages reviewed:** index, resources, unload, talk, veterans, essentials, work, door (4 "coming soon" doors), about, support, privacy, contact, plus every data and config file the pages load (`js/config/site.js`, `js/data/doors.js`, `js/data/resources.js`, `js/data/stats.js`).
**Method:** I downloaded the live pages and scripts. I measured layout in headless Chromium at 375×667 (phone) and 1280×800 (desktop), and counted words from the rendered text.

> This audit describes how the site works today. It does not criticise the owner's intent. The site is already careful and honest: it verifies resources, dates them, refuses to invent services, and says plainly what it is not. The prototype keeps all of that.

---

## 1. Mission and vision (owner's own words)

- **Name:** The Weight
- **Tagline:** "You don't have to carry it by yourself."
- **Hero lead:** "A place for men dealing with stress, grief, divorce, fatherhood, money worries, loneliness, or a life that suddenly looks different. Come as you are. Take what helps."
- **Mission (site.js):** "The Weight is a welcoming, practical place for adult men to set down some of what they're carrying: veterans and service members, men without stable housing, divorced dads, caregivers, and men facing work, money, housing, or relationship problems."
- **About page:** "A lot of men were taught to handle it alone. We think it's easier to carry when you don't have to."
- **What it is:** "A starting point: plain-language guidance, a private place to write things out, and links to organizations we've checked."
- **What it is not:** "We aren't a therapy provider, doctors, or an emergency service, and nobody monitors this site."
- **Values visible in the code:** resources are listed only after verification and carry a `lastVerified` date. Sponsored items can never appear under Crisis. Stale listings are flagged. Statistics carry year and source and must never be rounded or relabelled. Peer replies won't launch until moderation, reporting, and privacy safeguards exist.

## 2. Existing support categories ("doors")

| # | Door | Status | Destination |
|---|------|--------|-------------|
| 01 | Unload | Built | Private writing page. Nothing is sent or stored. |
| 02 | Talk It Through | Built | Message builder. The visitor copies the message and sends it from their own phone. |
| 03 | Veterans & Service Members | Built | Four-choice "What kind of help do you want right now?" plus VA contacts |
| 04 | I Need a Hand | Built | Searchable resource finder |
| 05 | Housing, Food & Essentials | Built | 211, homeless veterans line, tips, finder |
| 06 | Work & Next Steps | Built | American Job Centers, side-income ideas, FTC scam checks |
| 07 | Divorce & Starting Again | **Coming soon** | Topic list, then links to Unload and the "family" resource category |
| 08 | Fatherhood & Caregiving | **Coming soon** | Same as 07 |
| 09 | Relationships | **Coming soon** | Topic list, then the "counseling" category |
| 10 | Stepping Into Adulthood | **Coming soon** | Topic list, then the "career" category |

Resource-finder categories: Crisis support · Safety (trafficking, abuse, and assault) · Veteran housing · Shelters · Food · Hiring events · Career training · Counseling and peer support · Divorce, co-parenting, fatherhood, and caregiving · Financial help, transportation, and basic needs.

## 3. Existing resource destinations (verified by the owner)

988 Lifeline (call, text, chat) · Veterans Crisis Line (988 then press 1, text 838255, chat) · National Call Center for Homeless Veterans 1-877-424-3838 · 211 · Feeding America food-bank finder · American Job Centers / CareerOneStop 1-877-872-5627 · National Human Trafficking Hotline · National Domestic Violence Hotline · RAINN · VA.gov · FTC Job Scams · ReportFraud.ftc.gov · 911.

The full list, with how each link checked out, is in [RESOURCE-INVENTORY.md](RESOURCE-INVENTORY.md).

## 4. Primary calls to action

- Header: **"988 Support"**. This opens 988lifeline.org in a new tab. It does not dial.
- Hero: **"Choose a door"** (scrolls to the doors) and **"Find support"** (resources page)
- Ten door cards
- Bottom of homepage: "Need urgent support?" panel with **Call 988 / Text 988**

## 5. Clicks and distance to meaningful support (phone, 375×667)

| Visitor need | Path today | Taps to an action | Notes |
|---|---|---|---|
| Crisis, wants to dial | Header "988 Support" → 988lifeline.org → find call button | 2+ and leaves the site | The homepage "Call 988" button is **8,315 px down (about 12 screens)** |
| Divorce | Choose a door → scroll → Door 07 → "Coming soon" page → "Look for support" → family category | 4+ | **Dead end:** family category shows "Coming soon", then "Dialing 211 can often point you to local help" |
| Fatherhood / caregiving | Same as divorce | 4+ | Same dead end |
| Lost job | Choose a door → Door 06 → "Find a center" | 3 | Good content, but ~450 words on the page |
| Veteran | Choose a door → Door 03 → pick 1 of 4 → action | 3–4 | Strongest existing flow; the prototype copies its pattern |
| Loneliness | No door. Closest is Relationships (coming soon) or Talk It Through | 3–4 | Mentioned in the hero, but no matching door |
| Grief | No door, no resource | n/a | Named in the hero and meta description, but nothing behind it |
| "Not sure" | Unload, or read all 10 door descriptions | 2+ | No "I'm not sure" path |

## 6. Reading load

- Homepage: **~837 words** rendered (hero, welcome paragraph, two door-group intros, 10 door descriptions, statistics, crisis panel). The page is **9,166 px tall** on a phone.
- The first door card starts **1,768 px down**, about 2.6 screens.
- The statistics section (suicide deaths, rates, an age-band table) sits between the doors and the urgent-support panel. It is honest and well-sourced, but a struggling visitor has to scroll past it to reach the Call button.
- Inner pages run 100–450 words. Work & Next Steps is the longest (~450).

## 7. Navigation friction

- On phones the main nav is behind a "Menu" button. Doors are not in the nav, apart from Unload and Veterans.
- Ten doors in two groups means a visitor reads ten titles and ten descriptions before choosing.
- Four of the ten doors lead to "Coming soon" pages. Those pages also contain advice (~150 words), which is easy to read as a dead end.
- Visitors choose a door by topic, but what they need (talk, practical help, act now) is only asked on the Veterans page.

## 8. Mobile usability

- Viewport meta is correct, and there is **no horizontal scroll** at 375 px. ✔
- Large buttons and good tap targets. ✔
- The header "988 Support" button is always visible. ✔ But on a phone it opens a web page instead of dialing.
- There is a lot of scrolling before the first decision and before the dial button.

## 9. Accessibility (observed)

Strengths: skip link · semantic headings · `aria-expanded` menu with Escape to close · all images have alt text · `prefers-reduced-motion` respected · amber text colour darkened for AA on cream · visible focus outline · "(opens in a new tab)" screen-reader hints.

Concerns:
- Every page builds its header, footer, doors, and resource lists with JavaScript ES modules. **With JavaScript off, or if a module fails, the doors and Call buttons don't render.** Only a single `<noscript>` 988 line remains. ES modules also don't run from `file://`, so the site can't be previewed by double-clicking.
- Inner pages show the crisis line as plain text in a top bar, not as a tap-to-call link (except Veterans and Essentials).
- The door cards use a whole-card link with `aria-describedby`. That is fine, but screen-reader users hear ten long descriptions in a row.

## 10. Content consistency (for the owner)

- The About page says "we don't accept donations right now". The Support page HTML says "Coming soon". But `site.js` is set to `mode: "pay-what-you-can"` with a live payment link, so the Support page renders a payment button. Worth aligning.
- The **FTC Job Scams** link (`consumer.ftc.gov/articles/job-scams`) returned 403/404 to automated checks from both curl and a headless browser. It may be bot protection. Please confirm it by hand.

## 11. Opportunities

1. Put the **first question on the homepage**, above the fold, with no "Choose a door" step.
2. Ask **topic, then need** (the Veterans page pattern), and return **one** primary action.
3. Give **grief, loneliness, and "I'm not sure"** a real path, using the owner's existing tools (Unload, Talk It Through, 988) instead of new services.
4. Replace "Coming soon" dead ends with an action that works today (211, Talk It Through, 988), and clearly flag suggested resources for the owner to verify.
5. Make the persistent support control **dial directly** (`tel:988`, `sms:988`) on every page, and build it in plain HTML so it works without JavaScript.
6. Move statistics, privacy details, contact, and support into **expandable sections** on the About page.
7. Keep one config file for every destination, as the owner already does.
