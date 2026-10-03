#!/usr/bin/env python3
"""Check generated HTML against the PDF text it came from, ignoring whitespace and case.

  verify_text.py FRAGMENT.html PAGE1.txt [PAGE2.txt ...]

Prints every block of the HTML that is not found in the PDF (MISS) and every run of PDF text
that no block covered (UNCOVERED). Expected differences: phone and postcode (left out on
purpose), "https://" prefixes, page footers, process steps (the PDF lists them column by
column), text split across pages, and short words repeated elsewhere.
"""
import html, re, sys
from html.parser import HTMLParser

LEAF = ('p', 'li', 'figcaption', 'td', 'th', 'h3', 'h4', 'h5', 'h6', 'summary')


def norm(s):
    return re.sub(r'\s+', '', s.replace('￾', '-')).casefold()


class Blocks(HTMLParser):
    def __init__(self):
        super().__init__(); self.blocks, self.stack = [], []
    def handle_starttag(self, t, a):
        if t != 'img': self.stack.append([t, ''])
    def handle_endtag(self, t):
        while self.stack:
            tag, txt = self.stack.pop()
            if self.stack: self.stack[-1][1] += txt
            if tag == t:
                if t in LEAF or (t == 'span' and txt.strip()): self.blocks.append((t, txt))
                break
    def handle_data(self, d):
        if self.stack: self.stack[-1][1] += d


def main(frag, pages):
    P = norm(''.join(open(p).read() for p in pages)); cov = [0] * len(P)
    x = Blocks(); x.feed(open(frag).read())
    miss = []
    for t, txt in x.blocks:
        txt = html.unescape(txt)
        for part in ([txt] if norm(txt) in P else re.split(r'(?<=[;:.—,])\s', txt)):
            n = norm(part)
            if not n: continue
            i = P.find(n)
            if i < 0: miss.append((t, n[:120])); continue
            for k in range(i, i + len(n)): cov[k] = 1
    print('blocks', len(x.blocks), '· missing', len(miss))
    for m in miss: print('  MISS', *m)
    i = 0
    while i < len(P):
        if cov[i]: i += 1; continue
        j = i
        while j < len(P) and not cov[j]: j += 1
        if j - i > 2: print('  UNCOVERED', P[i:j][:150])
        i = j


if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2:])
