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
