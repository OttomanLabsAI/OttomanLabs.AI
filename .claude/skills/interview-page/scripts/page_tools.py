#!/usr/bin/env python3
"""Edit an interview page in place.

  page_tools.py panel PAGE.html PANEL_ID FRAGMENT.html
      replace everything inside <div ... id="PANEL_ID"> with the fragment, pretty-printed
      (use for the CV and Portfolio tabs: iv-<slug>-cv / iv-<slug>-pf)

  page_tools.py evidence PAGE.html EVIDENCE.py
      turn each plain job-description point  <li id="X" data-req="X">text</li>
      into a dropdown whose body is EV["X"] from EVIDENCE.py (see examples/*/evidence.py);
      points that are already dropdowns get their evidence replaced. Every id must have evidence.
"""
import os, re, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pretty import pretty


def panel(page, pid, frag):
    s = open(page).read()
    m = re.search(r'<div\b[^>]*\bid="%s"[^>]*>' % re.escape(pid), s)
    assert m, 'no panel ' + pid
    depth, i = 1, m.end()
    for t in re.finditer(r'<(/?)div\b', s[i:]):
        depth += -1 if t.group(1) else 1
        if not depth: end = i + t.start(); break
    ind = re.search(r'([ \t]*)$', s[:m.start()]).group(1)
    body = pretty(open(frag).read(), len(ind) // 2 + 1)
    s = s[:m.end()] + '\n' + body + '\n' + ind + s[end:]
    open(page, 'w').write(s)
    print('filled', pid)


def evfmt(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    return re.sub(r'\[\[(.+?)\|(.+?)\]\]', r'<a href="\2" target="_blank" rel="noopener">\1</a>', t)


def evidence(page, evpath):
    ns = {}; exec(open(evpath).read(), ns); EV = ns['EV']
    s = open(page).read(); seen = []
    def li(ind, rid, text):
        assert rid in EV, 'no evidence for ' + rid
        seen.append(rid)
        paras = ''.join('\n%s      <p>%s</p>' % (ind, evfmt(p)) for p in EV[rid])
        return ('%s<li id="%s" data-req="%s">\n%s  <details>\n%s    <summary>%s</summary>\n%s    <div class="jd-ev">%s\n%s    </div>\n%s  </details>\n%s</li>'
                % (ind, rid, rid, ind, ind, text, ind, paras, ind, ind, ind))
    s = re.sub(r'^( *)<li id="([\w-]+)" data-req="\2">(?!\s*$)(.*?)</li>$', lambda m: li(*m.groups()), s, flags=re.M)
    s = re.sub(r'^( *)<li id="([\w-]+)" data-req="\2">\s*<details>\s*<summary>(.*?)</summary>.*?</details>\s*</li>',
               lambda m: li(*m.groups()), s, flags=re.M | re.S)
    missing = set(EV) - set(seen)
    open(page, 'w').write(s)
    print('dropdowns', len(seen), '· evidence without a point:', sorted(missing) or 'none')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['panel'] and len(a) == 4: panel(*a[1:])
    elif a[:1] == ['evidence'] and len(a) == 3: evidence(*a[1:])
    else: sys.exit(__doc__)
