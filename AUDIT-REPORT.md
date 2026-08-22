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
