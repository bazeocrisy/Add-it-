# Chris's Learning Club

The app is the single file `../chriss-learning-club.html`. Open it in any browser (works offline) or host it on GitHub Pages.

This folder holds the editable sources:

- `content.js`: every lesson, question, hint, explanation, and reading passage
- `app.js`, `app.css`, `template.html`: app logic, styles, page shell
- `verb-guide.pdf`: the Verb Memory Guide, embedded byte-for-byte in the HTML

Rebuild after editing: `python3 learning-club/build.py`

Checks (need Node + Playwright):
- `node learning-club/test-data.js`: answer keys, 59 verb sentences, partial verb teams fail, etc.
- `node learning-club/test-ui.js`: clicks through every lesson, practice, checks, guides, storage failure, mobile layout
- `node learning-club/test-mastery.js`: 59-sentence Verb Mastery Challenge (counts, no reuse, no leaks, save/resume, 53 vs 54 benchmark), Lesson H, bank separation
- `node learning-club/test-checks.js`: Check My Skills banks are separate from lessons/practice/mastery, leak-free before submission, and logged correctly
- `node learning-club/test-final.js`: all 7 images in their intended places, daily plan, Lessons E/G recommended before mastery, no duplicate navigation
- `node learning-club/test-g3.js`: grade-3 corrections: every skill taught before practice/check, all lessons playable, exact grading of new response types, Ready Check skip, history migration, hint rules
- `node learning-club/test-money.js [shotDir]`: Money with independent expectations. Reads money.js directly and recomputes every key with its own coin table (U.S. Mint values and diameters) and brute-force coin combinations: totals, all valid make-an-amount combinations, true fewest-coin minimum (with ties), stated restrictions, comparisons, change, coin-choice parsing, normalized overlap keys (check vs lessons, worked examples and practice), Hint 2 never giving the answer, diagnoses, retry vs help vs shown outcomes, hidden check feedback, review, resume, exposure, shorter checks, v2 to v3 migration, blocked/corrupt storage, 320/360/768/1280 px layouts with true coin size ratios, keyboard, labels, contrast, reduced motion, printable key, offline
- Money area sources: `learning-club/money.js` (lessons A–H foundation, I–J application, practice, checks) and `learning-club/images/coin-*.webp` (8 images, 320 px, circular mask with a 6 px margin, made from the supplied PNGs)
- Build id: `build.py` hashes every source file (template, CSS, JS, content, money, PDF, images) and shows the first 12 hex digits in the grown-up view under "About this copy". The same sources always give the same id, for both the offline file and the hosted copy.
