"""Helpers that turn CV / portfolio content into the document HTML used in an interview page's
CV and Portfolio tabs (the .doc / d- components styled in the page's <style> block).

Mini-markup inside any text: **bold**, ^^accent^^ (bronze), [[text|href]] (link; .html stays in tab).
Call use_images() before FIG() so figure sizes can be read from the cropped JPEGs.
"""
import re, html, os
from PIL import Image

OWNER = 'FADIL KARIM'
def fmt(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'\^\^(.+?)\^\^', r'<span class="acc">\1</span>', s)
    s = re.sub(r'\[\[(.+?)\|(.+?)\]\]', lambda m: '<a href="%s"%s>%s</a>' % (m.group(2), '' if m.group(2).endswith('.html') else ' target="_blank" rel="noopener"', m.group(1)), s)
    return s
def P(s, cls=None): return '<p%s>%s</p>' % (' class="%s"' % cls if cls else '', fmt(s))
def H2(t): return '<h4 class="d-h2">%s</h4>' % fmt(t)
def H3(t, note=None, href=None):
    n = ''
    if note:
        n = ('<a class="d-note" href="%s" target="_blank" rel="noopener">%s</a>' % (href, fmt(note))) if href else '<span class="d-note">%s</span>' % fmt(note)
    return '<h5 class="d-h3"><span>%s</span>%s</h5>' % (fmt(t), n)
def CHIPS(items, cls='d-chips'): return '<ul class="%s">%s</ul>' % (cls, ''.join('<li>%s</li>' % fmt(i) for i in items))
def NOTES(items, cols=2): return '<div class="d-notes" style="--cols:%d">%s</div>' % (cols, ''.join('<div class="d-nb">%s</div>' % ''.join(P(x) for x in (i if isinstance(i, list) else [i])) for i in items))
IMG = 'assets/interviews/portfolio/'   # URL prefix written into <img src>
DIMS = {}
def use_images(folder, url_prefix=IMG):
    """folder: where the cropped JPEGs are on disk; url_prefix: where the page will load them from."""
    global IMG
    IMG = url_prefix
    for f in sorted(os.listdir(folder)):
        if f.endswith('.jpg'): DIMS[f[:-4]] = Image.open(os.path.join(folder, f)).size
def FIG(name, cap, alt=None, href=None):
    w, h = DIMS[name]
    img = '<img src="%s%s.jpg" alt="%s" width="%d" height="%d" loading="lazy">' % (IMG, name, html.escape(alt or cap), w, h)
    if href: img = '<a href="%s" target="_blank" rel="noopener">%s</a>' % (href, img)
    return ('<figure class="d-fig" style="--ar:%.3f">%s%s</figure>' % (w / h, img,
            ('<figcaption>%s</figcaption>' % fmt(cap)) if cap else ''))
def FIGS(*figs, rowh=None):
    # Phones: if one row would be too short, regroup into justified rows (each row's aspect sum <= 2.4)
    ars = [float(re.search(r'--ar:([\d.]+)', f).group(1)) for f in figs]
    cls, figs = 'd-figs', list(figs)
    rows, cur = [], []
    for i, a in enumerate(ars):
        nxt = cur + [i]; tot = sum(ars[j] for j in nxt)
        if cur and (tot > 2.4 or min(ars[j] for j in nxt) / tot < .28): rows.append(cur); cur = [i]
        else: cur = nxt
    rows.append(cur)
    if len(rows) > 1:
        cls += ' mwrap'
        for r in rows:
            tot = sum(ars[j] for j in r)
            for j in r:
                f = ars[j] / tot
                figs[j] = figs[j].replace('style="--ar:', 'style="--mf:%.4f;--mg:%.4f;--ar:' % (f, f * (len(r) - 1)), 1)
    return '<div class="%s"%s>%s</div>' % (cls, (' style="--rowh:%dpx"' % rowh) if rowh else '', ''.join(figs))
def SPLIT(a, b, cls=''): return '<div class="%s"><div>%s</div><div>%s</div></div>' % (('d-split ' + cls).strip(), a, b)
def STEPS(items, on, riba=None, loop=None):
    out = ''
    if loop: out += '<div class="d-loop"><span>%s</span></div>' % fmt(loop)
    out += '<ol class="d-steps">'
    for i, (name, sub) in enumerate(items):
        out += '<li%s><span class="d-n">%d</span>%s<b>%s</b><i>%s</i></li>' % (
            ' class="on"' if i + 1 == on else '', i + 1,
            ('<em class="d-riba">%s</em>' % fmt(riba[i])) if riba else '', fmt(name), fmt(sub))
    return out + '</ol>'
def FLOW(items, vertical=False, labels=None):
    out = '<div class="d-flow%s">' % (' v' if vertical else '')
    for i, it in enumerate(items):
        if i: out += '<span class="d-arrow">%s</span>' % (('<em>%s</em>' % fmt(labels[i-1])) if labels else '')
        out += '<span class="d-step%s">%s</span>' % (' on' if i == len(items) - 1 else '', fmt(it))
    return out + '</div>'
def HEAD(sub, links):
    return ('<header class="d-head"><div><h3 class="d-name">%s</h3>%s</div><ul class="d-contacts">%s</ul></header>'
            % (OWNER, ('<p class="d-role">%s</p>' % fmt(sub)) if sub else '',
               ''.join('<li><a href="%s"%s>%s</a></li>' % (u, '' if u.startswith(('mailto', '/')) else ' target="_blank" rel="noopener"', html.escape(t)) if u else '<li>%s</li>' % html.escape(t) for t, u in links)))
def ENTRY(role, kind, org, where, when, paras, sub=None):
    return ('<li class="tl-item"><div class="tl-head"><b>%s</b> <span class="tl-kind">· %s</span></div>'
            '<div class="tl-org">%s</div>%s<div class="tl-meta"><span>%s</span><span>%s</span></div>'
            '<div class="tl-body">%s</div></li>' % (fmt(role), fmt(kind), fmt(org),
            ('<div class="tl-sub">%s</div>' % fmt(sub)) if sub else '', fmt(where), fmt(when), ''.join(P(x) for x in paras)))
def EDU(role, org, where, when, para):
    return ('<li class="tl-item"><div class="tl-head"><b>%s</b></div><div class="tl-org">%s</div>'
            '<div class="tl-meta"><span>%s</span><span>%s</span></div><div class="tl-body">%s</div></li>'
            % (fmt(role), fmt(org), fmt(where), fmt(when), P(para)))
def SKILLS(groups):
    out = '<div class="d-skills">'
    for g, rows in groups:
        out += '<div><h6 class="d-sk">%s</h6><table class="d-sktbl">%s</table></div>' % (fmt(g), ''.join(
            '<tr><th scope="row">%s</th><td>%s</td><td>%s</td></tr>' % (fmt(a), fmt(b), fmt(c)) for a, b, c in rows))
    return out + '</div>'
def SEC(title, *parts, cls=''):
    return '<section class="%s">%s%s</section>' % (('d-sec ' + cls).strip(), H2(title), ''.join(parts))
def NOTE1(*paras): return NOTES([list(paras)], 1)
def CAP(s): return '<p class="d-cap">%s</p>' % fmt(s)
def DOC(label, parts): return '<article class="doc" aria-label="%s">%s</article>' % (html.escape(label), ''.join(parts))
