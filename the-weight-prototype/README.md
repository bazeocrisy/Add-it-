# The Weight: Action-First Prototype

A working prototype that shows how [theweightmen.com](https://theweightmen.com/) could move from "read and choose a door" to "**answer two questions, get one next step**", while keeping the owner's mission, words, brand, and verified resources.

> **Design prototype for the site owner only.** It is not the official site. It isn't deployed anywhere and is marked `noindex`. Don't publish it without the owner's permission.

## Run it

- **Easiest:** double-click `index.html`. It works from `file://` because there are no modules, build step, or server.
- **Local server:** `cd the-weight-prototype && python3 -m http.server 8000`, then open http://localhost:8000

## What's inside

```
index.html          Homepage = the wizard (Step 1 → Step 2 → Your next step)
resources.html      Every resource, grouped: emergency, crisis, counseling, practical, info
about.html          Mission, what we are/aren't, statistics, privacy, support, contact (expandable)
unload.html         Private writing (re-creation of the owner's Unload)
talk.html           Message builder (re-creation of the owner's Talk It Through)
presentation.html   Short walkthrough for the owner
assets/css/styles.css
assets/js/resources.js       ← THE ONLY FILE YOU NEED TO EDIT (resources, topics, results)
assets/js/common.js          icons and shared helpers
assets/js/app.js             wizard logic
assets/js/resources-page.js  renders resources.html
assets/js/unload.js, talk.js
assets/images/               owner's hero image (webp + jpg)
docs/                        audit, rationale, journeys, inventory, QA, screenshots, qa script
```

## Editing resources (for the owner)

Open `assets/js/resources.js`:

- **Change a phone number or link:** edit it in `TW.RESOURCES`. Every page updates.
- **Mark a suggested resource as checked:** change `verified: "prototype"` to `verified: "owner"` and add `lastVerified: "YYYY-MM-DD"`.
- **Remove a suggested resource:** delete it from `TW.RESOURCES` and from any `RESULTS` entry that uses it. The QA script flags any result that breaks.
- **Change where a topic leads:** edit `TW.RESULTS["topic:need"]`. Each has one `primary` and at most two `secondary` actions.
- The 988/911 bar and the urgent panel are plain HTML at the top and bottom of each page, so they work without JavaScript. Search for `tel:988` to change them.

## Deploying to GitHub Pages (only with the owner's authorization)

1. Put the contents of `the-weight-prototype/` at the root of a repository (or keep the folder and use its path in the URL).
2. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Pick the branch and `/ (root)`, then **Save**.
3. After about a minute the site is at `https://<user>.github.io/<repo>/` (add `the-weight-prototype/` if you kept the folder).
4. To share it privately, use a private repository with Pages restricted to collaborators (needs a paid plan), or share a zip instead.
5. Keep `<meta name="robots" content="noindex">` until the owner approves a public launch.

## Privacy

No cookies, storage, analytics, accounts, or form submissions. Wizard choices stay in page memory, never in the URL, and disappear on reload or Start over. Unload and Talk It Through never send what you type.

## Documentation

- [Original site audit](docs/ORIGINAL-SITE-AUDIT.md)
- [Design rationale](docs/DESIGN-RATIONALE.md)
- [Before and after journeys](docs/JOURNEY-COMPARISON.md)
- [Resource inventory](docs/RESOURCE-INVENTORY.md)
- [QA report](docs/QA-REPORT.md)
- [Screenshots](docs/screenshots/)
