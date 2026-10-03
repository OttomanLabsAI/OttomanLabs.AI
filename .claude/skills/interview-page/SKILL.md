---
name: interview-page
description: Build an interview page on basilicalabs.ai for a job application - the job description, CV and portfolio side by side in tabs, every job-description point a dropdown that opens to the evidence from Fadil's work, and a logo box in an Interviews section at the bottom of the homepage that opens the page. Use whenever the owner says "add an interview page", "make an interview for <company>", "bring the interviews back", or hands over a job description, CV or portfolio PDF for an application.
---

# Interview pages

An interview page is a prep page for one job application. The first one (TP Bennett,
Computational Design Developer, Oct 2026) was built, then taken off the site on 2026-10-03;
the owner said interviews will be used again and to build the next one **the same way**.
Everything needed to rebuild it is in this folder - nothing in here is deployed
(`.claude` is in `.assetsignore`).

```
examples/tp-bennett/
  interviews.html          the finished page: shell, CSS, tab + dropdown JS, JD, CV, portfolio
  homepage-section.html    the homepage Interviews section + its CSS
  content.py               CV + portfolio content -> out/cv.html, out/pf.html
  evidence.py              EV: the evidence under each of the 36 JD points
  assets/                  tp-bennett.png (logo), og-interviews.png (share card), portfolio/*.jpg (18 crops)
scripts/
  docbuild.py   document helpers (HEAD, ENTRY, SKILLS, STEPS, FIGS, NOTES, CHIPS ...)
  pdf_dump.py   PDF -> text per page, page renders, bold/accent runs, image boxes; crop figures
  verify_text.py  generated HTML vs PDF text, whitespace- and case-blind
  page_tools.py   fill a tab panel with a fragment; turn JD points into evidence dropdowns
  pretty.py     indents generated HTML so the page source stays readable
  shoot.js      Playwright check of every tab: desktop / dark / tablet / phone
  ogcap.js      1200x630 @2x share card into assets/og/
```

In git history the commits are titled "TP Bennett: ..." and "Interviews moves to its own page"
(23400ac, 4f278b6, 61a08bc, b2b16d5, b9c9c9a at the time); `git log --all --grep "TP Bennett"`
finds them even if hashes change.

## What the owner asked for (keep all of it)

- **Homepage:** a section titled **Interviews**, last thing inside `<main>` (after Clients), a rail
  of logo boxes. Each box is just the company logo (inverted in dark mode) and **links to the
  interview page** - the interview is its own page, not inline on the homepage.
- **Page:** `interviews.html`, h1 "Interviews" with the sub "the role, the CV and the portfolio,
  side by side"; one `.box.iv` per company with the logo and three tabs:
  **Job description · CV · Portfolio**.
- **Job description as text, not a PDF** ("it will be interactive"): title, a facts grid
  (department, location, reporting to, to apply), then sections - purpose and examples of work,
  key responsibilities, essential, desirable - with every point an `<li id data-req>`.
- **Every JD point is a dropdown that expands downward** and explains, from the CV and known
  work, what Fadil has done that meets it. An **Expand all / Collapse all** button sits under the
  facts; a link like `interviews.html#ess-5` opens that point on arrival.
- **Burgundy** for an open point: its filled box, the bold lead words in the evidence and the
  dashed rule (`#800020`; dark mode `#E0899A` so it stays readable).
- **CV and Portfolio rebuilt as real HTML from the PDFs**, faithful to the text: work history as
  a timeline, skills as tables, process steps / RIBA stages / status bar / ID spine drawn in HTML
  and CSS, portfolio figures cropped from the PDF, each linking to the live tool it shows.
- **Leave out the phone number and postcode** (the page is public); email and links stay.
- For Google Cloud, cite the **Jaded Rose Telegram bot** (GCP-native: Cloud Run, Cloud SQL, Pub/Sub).
- Flag mismatches instead of silently fixing them (e.g. the portfolio subtitle named a different role).

## Build steps

1. **Start from the example.** `cp examples/tp-bennett/interviews.html interviews.html` (repo root).
   Change: `<title>`, meta description, canonical / og:url, og:title / og:image (+ twitter:*),
   the logo `<img class="iv-logo">`, the box id `iv-<slug>` and every `iv-tpb-` prefix
   (tabs, panels, `aria-controls`, `aria-labelledby`, the `.jd-all` button) to `iv-<slug>-`,
   and the aria labels. Logo goes in `assets/interviews/<slug>.png` (wide, transparent or white
   background - dark mode inverts it).
2. **Job description.** `python3 scripts/pdf_dump.py dump JD.pdf <scratch> jd`, then write the
   `article.jd` by hand from `jd-p*.txt`: keep the employer's wording; ids `ex-N`, `resp-N`,
   `ess-N`, `des-N` (prefix with the slug if two JDs ever share a page). Write the points as plain
   `<li id="x" data-req="x">text</li>` first.
3. **Evidence.** Copy `examples/tp-bennett/evidence.py`, write one entry per point, then
   `python3 scripts/page_tools.py evidence interviews.html evidence.py` (it builds the
   `<details><summary>` markup and re-runs cleanly). Rules: only facts from the CV, the portfolio
   and work done with the owner; first person; strongest proof first with a bold lead; links
   (open in a new tab) to the live tools - pyMEP on GitHub, dcforge.basilicalabs.ai,
   gherkin-studio.html, strategy.html, dymak-tutorial.html, playground.html, visualneuroscience.ai.
   Where there is no evidence, say so plainly and give the nearest real work - never invent
   experience. Tell the owner which points are thin so they can supply facts.
4. **CV and portfolio.** If the PDFs are the same versions (CV v5, portfolio "compressed"), reuse:
   `python3 examples/tp-bennett/content.py` and copy `examples/tp-bennett/assets/portfolio/` to
   `assets/interviews/portfolio/`. If they changed: `pdf_dump.py dump` each PDF; read
   `*-runs.txt` for what is bold (`**`) or bronze (`^^`); copy `content.py` and transcribe;
   crop figures with `pdf_dump.py crop` using `*-boxes.json` (scale 3, max 1400 px, q85);
   map U+FFFE back to "-"; rejoin paragraphs the PDF split across columns or pages. Then
   `python3 scripts/verify_text.py out/cv.html <scratch>/cv-p*.txt` (same for pf) - remaining
   MISSes should only be the known ones (steps listed column-wise, split paragraphs, omitted
   phone / postcode, page footers). Fill the tabs:
   `page_tools.py panel interviews.html iv-<slug>-cv out/cv.html` (and `-pf`).
5. **Homepage.** Paste `examples/tp-bennett/homepage-section.html` (CSS into `index.html`'s own
   `<style>`, markup after the Clients section), pointing at the new logo; add more boxes to the
   same rail for later interviews.
6. **Site plumbing.** Share card: `node scripts/ogcap.js interviews` -> `assets/og/og-interviews.png`.
   Sitemap: add `interviews.html` (it was priority 0.5, monthly) - or ask the owner whether the
   page should be indexed at all (it holds CV detail and candid gap notes).
7. **Check.** `node --check` every inline script; `node scripts/shoot.js $PWD/interviews.html <scratch>`
   (needs `NODE_PATH=/opt/node22/lib/node_modules`): no sideways scroll at any width, every tab
   shows, arrow keys move between tabs, Expand all opens every point, no page errors. Look at the
   screenshots in light and dark.
8. **Ship** per the owner's standing rules (git-identity and git-release-workflow skills): author
   Fid, no AI trailers, push to `main`, hand back the next vMAJOR.MINOR tag text.

## Design rules learned the hard way

- New classes use the `d-` (documents) and `jd-` / `iv-` prefixes. Never reuse a site class:
  band box brand btn btn-solid btns caps caps-tight card chip credits display estab foot-* ital
  list-lines masthead muted nav-row newsform nl-* num ok-msg orn plot-wrap rail row site-footer
  skip stat stats tab tabs theme-toggle toggle toggles view view-cap views wrap (`.btn`, `.tabs`,
  `.tab` and `.box` are reused on purpose).
- House type: Flux caps for labels, Newsreader body, Prata for names and titles. CV / portfolio
  accent is the PDFs' bronze, darkened for contrast (`#8A6A53`, dark `#CDAA90`); JD dropdowns use
  burgundy. Dark mode is `:root[data-theme="dark"]`, set from `localStorage['ol-theme']`.
- Don't give `.iv-panel` a `display` rule that outranks `.iv-panel[hidden]{display:none}` - a
  `:has()` rule once showed every tab at once.
- A wide table goes in `.d-tblwrap{overflow-x:auto; width:0; min-width:100%}` - `width:0` keeps
  it out of the grid's min-content, otherwise the whole page scrolls sideways on phones.
- `.doc{overflow-wrap:break-word}` - long URLs in the CV otherwise push past phone width.
- An absolutely positioned child of a flex box shrinks to nothing if it inherits
  `align-self:flex-start`; the spine's vertical line needs `align-self:stretch`.
- Figure rows are justified (`flex: var(--ar)`), capped with `--rowh` for tall images; FIGS()
  pre-computes phone rows (`--mf` / `--mg`) so wide pairs wrap instead of shrinking to slivers.
- `<details>` opens smoothly via `::details-content` + `interpolate-size` where supported, and
  instantly elsewhere; `prefers-reduced-motion` turns the animation off.
- Sandbox: Chromium can't reach most sites - route-abort everything except file:, data: and
  Google Fonts; fonts may fall back, which is fine for layout checks.
