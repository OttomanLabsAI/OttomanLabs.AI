#!/usr/bin/env python3
"""Read a CV / portfolio / job-description PDF for an interview page.

  pdf_dump.py dump FILE.pdf OUTDIR STEM
      writes STEM-pN.txt (text per page), STEM-pN.png (page render, ~775 px wide),
      STEM-runs.txt (bold and coloured runs: what to mark **bold** / ^^accent^^),
      STEM-boxes.json (image boxes per page, PDF points, top-left origin: [x0, y0, x1, y1])

  pdf_dump.py crop FILE.pdf PAGE x0 y0 x1 y1 OUT.jpg [SCALE] [MAXW]
      crops one figure (PAGE is 1-based, box in PDF points, top-left origin, as in boxes.json),
      rendered at SCALE (default 3), shrunk to MAXW px wide (default 1400), JPEG quality 85

Needs pypdfium2 and Pillow (pip install pypdfium2 pillow). Use pypdfium2, not pdfplumber:
pdfplumber fails on this container's cryptography build. U+FFFE in the text is a hyphen
that fell at a line break - write it back as "-".
"""
import ctypes, json, os, sys
import pypdfium2 as pdfium
import pypdfium2.raw as raw

BODY = ('4f4f4f', '3d3d3d', '1c1c1c', '000000', '4a4a4a', '3a3a3a', '333333', '555555')


def runs(page):
    """Group characters into runs of the same weight/italic/colour; keep the ones worth marking up."""
    tp = page.get_textpage()
    out, cur, key = [], '', None
    for i in range(tp.count_chars()):
        c = chr(raw.FPDFText_GetUnicode(tp.raw, i))
        buf, flags = ctypes.create_string_buffer(256), ctypes.c_int()
        raw.FPDFText_GetFontInfo(tp.raw, i, buf, 256, ctypes.byref(flags))
        name = buf.value.decode(errors='ignore')
        col = [ctypes.c_uint() for _ in range(4)]
        raw.FPDFText_GetFillColor(tp.raw, i, *[ctypes.byref(x) for x in col])
        rgb = '%02x%02x%02x' % (col[0].value, col[1].value, col[2].value)
        k = ('B' if raw.FPDFText_GetFontWeight(tp.raw, i) >= 600 or 'Bold' in name else '') + \
            ('I' if 'Italic' in name or 'Oblique' in name else '') + ':' + rgb
        if c in '\r\n': c = ' '
        if c.isspace() and key is not None: k = key
        if k != key:
            if cur.strip(): out.append((key, cur.strip()))
            cur, key = '', k
        cur += c
    if cur.strip(): out.append((key, cur.strip()))
    return [(k, t) for k, t in out if k.startswith('B') or k.split(':')[1] not in BODY]


def dump(pdf, outdir, stem):
    os.makedirs(outdir, exist_ok=True)
    doc = pdfium.PdfDocument(pdf)
    boxes, rl = {}, []
    for n in range(len(doc)):
        page = doc[n]
        W, H = page.get_size()
        open(os.path.join(outdir, '%s-p%d.txt' % (stem, n + 1)), 'w').write(page.get_textpage().get_text_range())
        page.render(scale=775 / W).to_pil().save(os.path.join(outdir, '%s-p%d.png' % (stem, n + 1)))
        imgs = []
        for obj in page.get_objects(filter=[raw.FPDF_PAGEOBJ_IMAGE]):
            l, b, r, t = obj.get_bounds()
            imgs.append([round(l), round(H - t), round(r), round(H - b)])
        boxes['%s-p%d' % (stem, n + 1)] = {'W': W, 'H': H, 'imgs': imgs}
        rl.append('===== page %d' % (n + 1))
        rl += ['%-10s %s' % (k, t[:200]) for k, t in runs(page)]
    json.dump(boxes, open(os.path.join(outdir, stem + '-boxes.json'), 'w'))
    open(os.path.join(outdir, stem + '-runs.txt'), 'w').write('\n'.join(rl) + '\n')
    print('pages:', len(doc), '-> ' + outdir)


def crop(pdf, pageno, x0, y0, x1, y1, out, scale=3.0, maxw=1400):
    page = pdfium.PdfDocument(pdf)[pageno - 1]
    im = page.render(scale=scale).to_pil().convert('RGB')
    im = im.crop((round(x0 * scale), round(y0 * scale), round(x1 * scale), round(y1 * scale)))
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)))
    im.save(out, quality=85)
    print(out, im.size)


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['dump'] and len(a) == 4: dump(a[1], a[2], a[3])
    elif a[:1] == ['crop'] and len(a) in (8, 9, 10):
        crop(a[1], int(a[2]), *map(float, a[3:7]), a[7], *(float(x) for x in a[8:9]), *(int(x) for x in a[9:10]))
    else: sys.exit(__doc__)
