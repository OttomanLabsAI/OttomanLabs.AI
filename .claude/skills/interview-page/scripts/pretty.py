"""Pretty-print generated HTML so the page source stays readable.
pretty(html, depth) -> indented lines; containers open/close on their own lines, leaf blocks stay on one line."""
from html.parser import HTMLParser
VOID = {'img', 'br'}
BLOCK = {'article','header','section','div','ol','ul','li','p','h3','h4','h5','h6','figure','figcaption','table','thead','tbody','tr','th','td'}
class N:
    def __init__(s, tag, start): s.tag, s.start, s.kids = tag, start, []
class T(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=False); s.root = N(None, ''); s.st = [s.root]
    def handle_starttag(s, t, a):
        n = N(t, s.get_starttag_text()); s.st[-1].kids.append(n)
        if t not in VOID: s.st.append(n)
    def handle_endtag(s, t):
        assert s.st[-1].tag == t, (t, s.st[-1].tag); s.st.pop()
    def handle_data(s, d): s.st[-1].kids.append(d)
    def handle_entityref(s, name): s.st[-1].kids.append('&%s;' % name)
    def handle_charref(s, name): s.st[-1].kids.append('&#%s;' % name)
def flat(n):
    if isinstance(n, str): return n
    if n.tag in VOID: return n.start
    return n.start + ''.join(flat(k) for k in n.kids) + '</%s>' % n.tag
def container(n):
    return not isinstance(n, str) and n.tag not in VOID and any(not isinstance(k, str) and k.tag in BLOCK for k in n.kids)
def out(n, d, lines):
    pad = '  ' * d
    if container(n) and n.tag not in ('tr',):
        lines.append(pad + n.start)
        for k in n.kids:
            if isinstance(k, str):
                if k.strip(): lines.append('  ' * (d + 1) + k.strip())
            else: out(k, d + 1, lines)
        lines.append(pad + '</%s>' % n.tag)
    else:
        lines.append(pad + flat(n))
def pretty(html, d):
    t = T(); t.feed(html); lines = []
    for k in t.root.kids: out(k, d, lines)
    return '\n'.join(lines)
