"""Builds ../chriss-learning-club.html: one self-contained file (CSS, JS, content, PDF bytes)."""
import base64, hashlib, pathlib
here = pathlib.Path(__file__).resolve().parent
t = (here / 'template.html').read_text()
pdf = (here / 'verb-guide.pdf').read_bytes()
b64 = base64.b64encode(pdf).decode()
b64 = '\n'.join(b64[i:i+120] for i in range(0, len(b64), 120))
for key, val in [('/*CSS*/', (here/'app.css').read_text()), ('/*CONTENT*/', (here/'content.js').read_text()),
                 ('/*APP*/', (here/'app.js').read_text()), ('/*PDF*/', b64)]:
    assert t.count(key) == 1, key
    assert '</script' not in val.lower() or key == '/*CSS*/', key
    t = t.replace(key, val)
out = here.parent / 'chriss-learning-club.html'
out.write_text(t)
print(out, len(t.encode()), 'bytes; pdf sha256', hashlib.sha256(pdf).hexdigest()[:16])

# Hosted (claude.ai artifact) build: page fragment, no PDF bytes, print/download replaced by a note.
import sys
if len(sys.argv) > 1:
    body = t.split('<body>', 1)[1].split('</body>', 1)[0]
    body = body.split('<noscript>')[0] + '<script>window.__CLC_HOSTED = true;</script>\n<script>\n' + (here/'content.js').read_text() + '\n</script>\n<script>\n' + (here/'app.js').read_text() + '\n</script>\n'
    frag = "<title>Chris's Learning Club</title>\n<style>\n" + (here/'app.css').read_text() + '\n</style>\n' + body
    pathlib.Path(sys.argv[1]).write_text(frag)
    print('hosted build', sys.argv[1], len(frag.encode()), 'bytes')
