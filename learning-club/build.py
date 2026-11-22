"""Builds ../chriss-learning-club.html: one self-contained file (CSS, JS, content, PDF bytes)."""
import base64, hashlib, pathlib
here = pathlib.Path(__file__).resolve().parent
t = (here / 'template.html').read_text()
# Illustrations: learning-club/images/*.webp embedded as data URIs (works offline)
imgs = sorted((here / 'images').glob('*.webp'))
images_js = 'var IMAGES = {\n' + ',\n'.join("  '%s': 'data:image/webp;base64,%s'" % (p.stem, base64.b64encode(p.read_bytes()).decode()) for p in imgs) + '\n};\n'
content_js = images_js + (here / 'content.js').read_text() + '\n' + (here / 'money.js').read_text()
# Build id: a hash of every source file (not of the output), so the offline file and the hosted copy built
# from the same sources carry the same id, and rebuilding unchanged sources gives the same id.
srcs = ['template.html', 'app.css', 'app.js', 'content.js', 'money.js', 'verb-guide.pdf'] + ['images/' + p.name for p in imgs]
hsh = hashlib.sha256()
for name in srcs:
    hsh.update(name.encode()); hsh.update(b'\0'); hsh.update((here / name).read_bytes()); hsh.update(b'\0')
BUILD = hsh.hexdigest()[:12]
content_js = "window.__CLC_BUILD = '%s';\n" % BUILD + content_js
pdf = (here / 'verb-guide.pdf').read_bytes()
b64 = base64.b64encode(pdf).decode()
b64 = '\n'.join(b64[i:i+120] for i in range(0, len(b64), 120))
for key, val in [('/*CSS*/', (here/'app.css').read_text()), ('/*CONTENT*/', content_js),
                 ('/*APP*/', (here/'app.js').read_text()), ('/*PDF*/', b64)]:
    assert t.count(key) == 1, key
    assert '</script' not in val.lower() or key == '/*CSS*/', key
    t = t.replace(key, val)
out = here.parent / 'chriss-learning-club.html'
out.write_text(t)
print(out, len(t.encode()), 'bytes; build', BUILD, '; pdf sha256', hashlib.sha256(pdf).hexdigest()[:16])

# Hosted (claude.ai artifact) build: page fragment, no PDF bytes, print/download replaced by a note.
import sys
if len(sys.argv) > 1:
    body = t.split('<body>', 1)[1].split('</body>', 1)[0]
    body = body.split('<noscript>')[0] + '<script>window.__CLC_HOSTED = true;</script>\n<script>\n' + content_js + '\n</script>\n<script>\n' + (here/'app.js').read_text() + '\n</script>\n'
    frag = "<title>Chris's Learning Club</title>\n<style>\n" + (here/'app.css').read_text() + '\n</style>\n' + body
    pathlib.Path(sys.argv[1]).write_text(frag)
    print('hosted build', sys.argv[1], len(frag.encode()), 'bytes')
