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
