"""Worked example: Fadil's CV (v5, 6 pages) and portfolio (4 pages) as HTML for the TP Bennett
interview page. Text transcribed from the PDFs and checked with verify_text.py; phone number and
postcode deliberately left out. Writes out/cv.html and out/pf.html next to this file.

  python3 content.py            then   page_tools.py panel PAGE iv-<slug>-cv out/cv.html  (same for pf)

For a new interview with an updated CV or portfolio: copy this file, edit the content, and keep
the structure. Figures come from assets/portfolio/ (crops made with pdf_dump.py crop).
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'scripts'))
from docbuild import *
use_images(os.path.join(HERE, 'assets', 'portfolio'), 'assets/interviews/portfolio/')

GH_STUDIO = 'gherkin-studio.html'
GH = 'gherkin.html'

# ════════════════════════════ CV ════════════════════════════
cv = []
cv.append(HEAD(None, [
    ('fadilkarim@live.co.uk', 'mailto:fadilkarim@live.co.uk'),
    ('London', None),
    ('uk.linkedin.com/in/fadil-karim', 'https://uk.linkedin.com/in/fadil-karim'),
    ('github.com/OttomanLabsAI', 'https://github.com/OttomanLabsAI'),
    ('youtube.com/@OttomanLabsAI', 'https://www.youtube.com/@OttomanLabsAI'),
    ('basilicalabs.ai', '/'),
    ('visualneuroscience.ai', 'https://visualneuroscience.ai/'),
]))
cv.append(P("AI engineer with over a decade embedded inside enterprise engineering organisations — 17 of them, AECOM to Amazon — the first nine on the automation side, building tooling in automation software such as Dynamo and Grasshopper to cut delivery time, and since late 2024 building production software on their data, under their constraints. I think in systems: every tool I ship is designed as a whole — inputs and data formats, the engine, automated verification, release and distribution, and the operating rules the AI agent works under — so it keeps working after I leave. My speciality is making messy enterprise data computable: inconsistent CAD, IFC and LandXML from dozens of contractors, reconciled and mapped onto canonical, queryable models, with first outputs live in front of the people who act on them — often the same day. Current proof: a 44-tool, 40,000-line Revit automation suite shipped solo through Claude Code (220+ versioned releases) on a live hyperscale data centre programme; CAD data-extraction pipelines deployed inside Amazon; and BasilicaLabs.AI — an independent studio delivering client platforms end to end. Python-first, agents as daily leverage, automated verification, tight release cycles and git-based continuous delivery.", 'd-sum'))

work = [
ENTRY('AI Engineer', 'Contract', 'Glent Group', 'London', '03/2026 – Present', [
 "Built and shipped pyMEP (open-sourced at github.com/OttomanLabsAI/pyMEP), a production pyRevit extension automating civil and MEP infrastructure modelling — drainage networks, conduits, fencing, chambers, topography and annotation — for a multi-office engineering team on a live hyperscale data centre programme: 44 ribbon commands across 14 panels, ~40,000 lines of code, Revit 2022–2026, distributed to engineers in other cities through an in-app self-updater; 285 commits and 220+ tagged releases in 4.5 months, every push to main auto-tagged as a release.",
 "Sole designer, developer and release manager, embedded with the engineers who use it — the de facto forward-deployed engineer. I designed the delivery loop itself as one system: requirements arrived from working engineers as screenshots, IFC / LandXML files and one-line messages; Claude Code implemented them under a repo-level agent contract (CLAUDE.md plus reusable release and identity skills) so it behaved consistently across sessions; automated tests, CI tagging and the self-updater carried each change to site, most the same day; I supplied domain intent, field artefacts and acceptance judgement, triaged what the agent got wrong through diagnostics I had it build, and decided the trade-offs.",
 "Engineered the domain logic underneath: a Civil 3D → Revit pipeline that parses LandXML networks into auto-placed pipes and manholes, with survey-grid rotation measured empirically by probe point rather than trusted from the API; terrain-draped fencing with a spacing solver that never exceeds the design spacing, clears foundation clashes and auto-numbers marks from network topology (cycle detection / longest path); floor draping with a barycentric fallback when Revit’s ray-caster returns nothing; union-find detection of parallel pipe, conduit and duct banks for one-click annotation; and pipes → conduits conversion that extends conduit size standards programmatically.",
 "Architected it so the entire codebase could be developed and verified without Revit on the development machine: a pure-core / Revit-shell split with 431 automated tests run under CPython 3 against code that executes in IronPython 2.7, Revit-bound modules tested by AST-extracting functions into fakes, version shims absorbing API drift across Revit 2022–2026, runtime self-calibration where API semantics differ between builds, and guards for IronPython traps such as float(None) raising a CLR SystemError.",
 "Engineered the system around the tool, not just the commands: release-per-push with CI tagging and a version-carrying UI, atomic self-update with rollback, proxy-resilient release resolution (GitHub API with git smart-HTTP and codeload fallbacks), and stage-logged runs with first-error capture that turn “it does nothing” reports into one-round fixes.",
 "Also developing DataCentreForge (dcforge.basilicalabs.ai — early-stage, in active development) — a browser-based 2D CAD tool for data centre external containment: manhole chambers and the MV / LV / ELV / fibre / telecoms conduit routes between them. Specified and QA’d every feature against real detailing standards across 16 product versions and 14 verified releases: a constraint-based router (permitted fitting angles, minimum straights, an honest “no route” rather than unbuildable geometry), cost-scored optimisation over ~30k candidates so routes detail like a human, clearance / clash rules, ductbanks with shared centrelines and per-run Z-levels, to-scale cross-sections — ~2,000 lines of dependency-free geometry, Playwright regression suites, and a per-version audit trail of prompt, AI response and model kept in the repo.",
]),
ENTRY('AI Engineer', 'Independent studio — personal projects & client commissions', 'BasilicaLabs.AI', 'London', '06/2026 – Present', [
 "Design, build and operate production software end to end — product, code, infrastructure and content — across basilicalabs.ai (computational design for BIM and construction), visualneuroscience.ai (neuroanatomy) and commissioned client work; sole builder and operator, with Claude Code as the implementation engine under my specification, review and release control — one repeatable pipeline every time: discuss the geometry with the engineer, specify in plain English, working dashboard in hours, iterate with the user, export, generate the Revit add-in, hand over.",
 "**BasilicaLabs.AI** — 15 production pages, ~25,000 lines of framework-free HTML / JS / CSS (no build step) with bespoke geometry and 2D-canvas engines on nine pages, all built through Claude Code: parametric building dashboards for The Gherkin (spline profile → stacked levels → generated diagrid, plates and connections, with Revit-style schedules), Dymak HQ (parametric circular roof) and TopoForge (draw, build and sculpt a TIN terrain); a Computational AI Playground of 14 input-widget types; and pyBuffet, Buffett-style analysis over live SEC EDGAR XBRL data. Runs on Cloudflare Workers with Firebase Auth / Firestore cloud saves.",
 "Closed the browser-to-BIM loop: a purpose-built shared export module (no third-party libraries) emits OBJ+MTL, USD and DXF (TopoForge adds CSV point clouds and LandXML 1.2 TIN surfaces for Civil 3D → Revit), and two pyRevit extensions I built — pyGherkin and pyDymak — rebuild the dashboard geometry as native Revit elements with stable tracking IDs so changes round-trip in place: one ID-tracked model from concept to as-built (RIBA 2–6), collapsing a ~4-week manual modelling cycle for The Gherkin to a 3–4 hour build and ~10-minute design iterations.",
 "**VisualNeuroscience.AI** — an interactive neuroanatomy platform rendering real MRI atlases in WebGL2 (NiiVue), shipped from one no-build codebase to web, PWA, iOS / iPadOS, Mac, Android and Apple Vision Pro over 20+ releases, and live on the Apple App Store (apps.apple.com/gb/app/visualneuroscience/id6805618686): a Region Atlas (MNI152 + AAL-116 in four synchronised viewports), Brodmann Areas (41 areas searchable by function, a 3D border graph measured voxel-by-voxel, the classic cartoon reconstructed pixel-exactly), HCP1065 tractography (~1M streamlines), a six-state Network Atlas, a cited digital textbook with a live Hodgkin–Huxley integration, and a visionOS spatial console.",
 "Under the hood: cross-provider auth (Firebase; Google and Apple sign-in bridged from native sheets; LinkedIn via a Cloudflare Worker minting RS256 custom tokens with WebCrypto; account linking and in-app deletion to App Store 5.1.1(v)); an offline-first PWA with zero third-party requests and a documented privacy / store-compliance package; Python / numpy image pipelines with dependency-free PNG / NIfTI codecs (deterministic Catmull-Rom upscaling chosen over model-based upscaling to avoid hallucinated digits on an anatomical figure); every release verified by headless Playwright before push.",
 "**Jaded Rose AI customer service** — a GCP-native, multi-channel support platform for a UK occasionwear Shopify store, built in ~3 weeks (github.com/Jaded-Rose) and designed as a whole system rather than a chatbot: customers message over Telegram, WhatsApp, Gmail or an embeddable web widget; a GPT-4o supervisor classifies intent across eight categories behind a 0.7 confidence gate, routes to specialist FAQ, order, returns and product agents and hands off to a human — transcript to the support inbox — whenever confidence is low or an agent fails. Grounded RAG over Pinecone (answer only from retrieved context, otherwise offer handoff) fed by an idempotent, versioned knowledge-base pipeline built from the store’s real policies; Shopify Admin API order lookups with automatic carrier detection (Royal Mail, DHL, Evri, DPD); Redis conversation memory; HMAC-verified webhooks; FastAPI, SQLAlchemy 2.0 / Cloud SQL and a Pub/Sub task queue designed to grow to four agents — ~4.8k lines of Python, 34 pytest tests, Dockerised and documented for Cloud Run.",
 "**Client commissions** delivered end to end — brief in plain English, working link the same day, iterate in hours, then code, hosting and accounts handed over: Glent Group (AI infrastructure and technology build), MB Design Solutions (engineering reports via an agentic-AI pipeline), Tia Tandy Rugby (athlete site) and Jaded Rose (custom Shopify theme, plus the customer-service platform above). Systematised the service as four composable Claude Code Skills: a prospect’s URL becomes a verified three-tab pitch demo — faithful capture of their current site, a new build in the house style, and the offer — shipped as a one-repo-per-client Cloudflare deploy through hard verification gates (layout sweeps, asset-leak checks, screenshot QA), cutting client cost from agency thousands to hundreds of pounds, delivered in days; the method is written up as a 17-step prompt-by-prompt tutorial and the AI Strategy for Construction paper appended to this CV.",
], sub='Operated alongside principal engagements · basilicalabs.ai · visualneuroscience.ai'),
ENTRY('AI Engineer', 'Contract', 'Amazon', 'London', '10/2025 – 03/2026', [
 "Transformed unstructured 2D CAD drawings into structured data for Amazon's global warehouse database using Claude Code — drawings no two contractors produced alike, their conventions reconciled and mapped onto one canonical, queryable schema.",
 "Developed automated 3D modeling tools for site logistics planning, enabling automatic generation of staging lanes, vehicle circulation, and yard infrastructure from site parameters, replacing manual drafting.",
 "Designed the agentic development workflow end to end — behavior defined against real-world, imperfect drawing data, automated validation catching the errors manual checks missed — rather than a series of one-off prompts.",
]),
ENTRY('BIM Manager', 'Contract', 'EGIS Group', 'London', '12/2024 – 10/2025', [
 "Led BIM standards and delivery across a multi-project portfolio while building the team's automation layer in Python, Grasshopper and Dynamo — the point where personal time-saving scripts became shared, reusable software.",
 "Automated optimised warehouse design in Grasshopper and Dynamo — generative layouts driven directly from project parameters instead of manual drafting.",
 "Built Python pipelines that placed and sized columns and beams straight from engineers' raw Excel files, extended and aligned structural elements to topography, and generated hundreds of named, numbered sheets in seconds.",
 "Prototyped the first AI agents for the Revit API — 3D modelling and spatial analysis of CAD (.dwg) files from plain-text prompts — the work that led directly into the Amazon and Glent AI engineering roles.",
 "Owned BEPs and ISO 19650 information management, ran cross-discipline coordination and clash resolution across the portfolio.",
]),
ENTRY('Computational Designer — 3D Modelling & Automation', 'Permanent, then Contract',
 "Richmond & Wandsworth Councils · Green Structural Engineering · Robert Wynter & Partners · AECOM · Arcadis · BG&E · Robert Bird Group · 3DReid · GHD · Buro Happold · Eckersley O'Callaghan · ES Global · Whitfield Consulting · Pell Frischmann",
 'London & Surrey', '06/2015 – 12/2024', [
 "Nine years of production 3D modelling across structures, MEP and architecture — buildings, rail and water infrastructure — in Revit, MicroStation/AECOsim, Civil 3D and AutoCAD; progressed from early structural CAD and mechanical engineering contracts (2015) through BIM Technician (AECOM, 2016; Arcadis, 2018) and Senior BIM Technician (2019 onward) to BIM Manager (Whitfield Consulting, 2024).",
 "Modelled and coordinated structural packages to LOD 350, built federated multi-discipline models, ran clash detection in Navisworks, and produced construction drawings, schedules and specifications directly from the models (Buro Happold, Eckersley O'Callaghan, GHD, Robert Bird Group, Pell Frischmann, 2019–2024).",
 "Before moving into software, built tooling to cut delivery time — Dynamo and Grasshopper automation and, later, custom pyRevit scripts — adopted by entire teams: placing thousands of MEP elements — lights, manholes, pipes, concrete encasements for cable-duct runs — directly from clients' DWG data, populating tens of thousands of COBie parameters, and one-click pipe-slope annotation.",
 "As BIM Manager, established BEPs and ISO 19650-aligned standards, set up CDE workflows, mentored junior staff and championed automation adoption (Whitfield Consulting, 2024).",
]),
]
cv.append(SEC('Work experience', '<ol class="tl">%s</ol>' % ''.join(work)))

cv.append(SEC('Education', '<ol class="tl">%s</ol>' % ''.join([
 EDU('PGCert — Applied Neuroscience', "King's College London", 'London', '2021 – 2023',
     "Neural mechanisms and cognitive processes, applied as working domain knowledge at visualneuroscience.ai — an interactive brain-mapping platform I built and operate (MRI region atlas, tractography, receptor-density explorer)."),
 EDU('BEng — Civil Engineering', 'University of Birmingham', 'Birmingham', '2010 – 2014',
     "Core civil engineering principles and practices; group projects in structural analysis and design; dissertation on sustainable urban infrastructure development."),
])))

cv.append(SEC('Software skills', SKILLS([
 ('AI engineering & development', [('Claude Code', 'Expert', '1 yr'), ('Python', 'Expert', '6 yrs'), ('MCP Server', 'Expert', '1 yr'),
   ('GitHub', 'Advanced', '4 yrs'), ('Linux OS – Debian', 'Advanced', '5 yrs'), ('n8n AI Automation', 'Advanced', '2 yrs'), ('JavaScript', 'Advanced', '1 yr')]),
 ('3D BIM & computational design', [('Revit', 'Expert', '11 yrs'), ('AutoCAD', 'Expert', '11 yrs'), ('Civil 3D', 'Expert', '10 yrs'),
   ('OpenBuildings', 'Expert', '5 yrs'), ('pyRevit', 'Expert', '5 yrs'), ('Grasshopper', 'Expert', '4 yrs'), ('Dynamo', 'Expert', '4 yrs')]),
 ('Web platform', [('Cloudflare Workers', 'Advanced', '1 yr'), ('Firebase (Auth + Firestore)', 'Advanced', '1 yr'),
   ('FastAPI / PostgreSQL', 'Advanced', '1 yr'), ('three.js / WebGL', 'Advanced', '1 yr')]),
 ('Graphic design', [('Adobe Illustrator', 'Expert', '4 yrs'), ('Adobe Photoshop', 'Advanced', '4 yrs'), ('Adobe InDesign', 'Advanced', '2 yrs')]),
])))

cv.append(SEC('Domain & methods',
 '<h6 class="d-sk">BIM &amp; construction</h6>',
 CHIPS(['BIM Coordination', 'BIM Execution Plans', 'BS EN ISO 19650', 'UK BIM Standards', 'Clash Detection', 'Model Federation',
        'CDE Workflows', 'Data & Information Management', 'COBie', 'Parametric Revit Families', 'Civil 3D → Revit Pipelines',
        'AI Agents for Revit API', 'AI Agents for Spatial Analysis']),
 '<h6 class="d-sk">Software &amp; AI engineering</h6>',
 CHIPS(['Client-Embedded Delivery', 'Agentic Development (Claude Code)', 'Agent Instructions & Skills', 'Multi-Agent Orchestration',
        'Schema Discovery & Canonical Mapping', 'RAG & Vector Search', 'Intent Classification', 'Human-in-the-Loop Escalation',
        'LLM Evaluation & QA', 'AI Provenance & Auditability', 'Computational Geometry', 'REST & Webhook Integration',
        'Test Automation (pytest, Playwright)', 'CI/CD & Release Engineering', 'Cloudflare Workers & GCP']),
))

CMP = ('<div class="d-tblwrap"><table class="d-cmp"><thead><tr><td></td><th scope="col" class="acc">Claude Code studio</th>'
       '<th scope="col">Grasshopper</th><th scope="col">Dynamo</th></tr></thead><tbody>%s</tbody></table></div>') % ''.join(
    '<tr><th scope="row">%s</th><td class="acc">%s</td><td>%s</td><td>%s</td></tr>' % tuple(fmt(x) for x in r) for r in [
    ('Build time', 'Hours, in plain English', 'Days–weeks of canvas work', 'Days–weeks of canvas work'),
    ('Training', 'None — sliders & chat', 'Specialist skill', 'Specialist skill'),
    ('Licences', '£0 — runs in browser', 'Rhino seat per user', 'Revit seat per user'),
    ('Users', 'Anyone on the team', 'Script author', 'Script author'),
    ('Output', 'Tracked IDs, re-import diffs', 'Geometry, rebuilt each time', 'Geometry, rebuilt each time')])

cv.append(SEC('AI strategy for construction',
 P("Parametric design without Grasshopper or Dynamo — briefed in plain English, built with **Claude Code** in hours, and carried through **detailed design and beyond**. Live at **[[basilicalabs.ai|index.html]]**.", 'd-lead'),
 STEPS([('Scope', 'pick the win, agree the inputs'), ('Brief', 'plain-English spec, no code written'),
        ('Build', 'Claude Code builds the studio'), ('Iterate', 'change requests in conversation'),
        ('Export', 'CSV / JSON / OBJ, schema stable'), ('Place & track', 'pyRevit places, IDs persist')], on=6, loop='minutes per change'),
 H3('The Gherkin studio', 'a browser-based parametric studio, built in hours'),
 SPLIT(FIGS(FIG('studio', None, 'The Gherkin studio — the model in the middle, every parameter around it', GH_STUDIO)),
       NOTES([['**^^Hours,^^ not weeks**', 'Brief to working parametric studio in a working session — geometry, controls and live 3D view.'],
              ['**^^£0^^ licence cost**', 'Runs in the browser. No Grasshopper or Dynamo seat, no plugin install, nothing to license.'],
              ['**Anyone can ^^drive it^^**', 'Sliders and presets, not scripts — engineers and architects iterate without a specialist.']], 1), 'd-wide'),
 CHIPS(['Height **180 m**', '**24** levels', '**1,540** members', '**528** connections', '**43** plates'], 'd-chips d-up d-stat'),
 H3('Model hand-off', 'one click, Revit-native'),
 SPLIT(FIGS(FIG('exoskeleton', None, 'Exoskeleton', GH), FIG('plates', None, 'Floor plates, core and light-well wedges', GH),
            FIG('nodes', None, 'Connection nodes and ring beams', GH), rowh=380),
       FLOW(['Dashboard', 'pyRevit', 'Revit'], vertical=True, labels=['csv + json', 'place + track']), 'd-flowside'),
 CAP("Deterministic exports — Revit-ready CSVs with stable tracking IDs, plus OBJ / USD / DXF. The three views above were generated from that same export."),
 H3('vs Grasshopper & Dynamo', 'where the time and money go'),
 CMP,
 P("**The point isn't the tower — it's that ^^any parametric problem^^ can get a purpose-built tool in ^^hours^^, owned by the team that uses it.**", 'd-close'),
))

STATUS = ('<div class="d-status" role="img" aria-label="Stage status: concept design proven on live projects; spatial coordination and technical design have the mechanism working today; fabrication and construction are a straight extension; as-built is the next step">'
          '<span class="s-p"></span><span class="s-m"></span><span class="s-m"></span><span class="s-x"></span><span class="s-x"></span><span class="s-n"></span></div>'
          '<ul class="d-legend"><li><i class="s-p"></i>Proven — on live projects</li><li><i class="s-m"></i>Mechanism working today</li>'
          '<li><i class="s-x"></i>Straight extension</li><li><i class="s-n"></i>Next step</li></ul>')
SPINE = ('<div class="d-spine" role="img" aria-label="One model, one set of IDs: from the browser to handover, every stage adds data to the same spine — settings JSON, pyRevit placement, Revit-ready CSVs, re-import diff, OBJ / USD / DXF and the handover record">'
         '<i class="sp-line"></i><b class="sp-a">Browser</b><span class="sp-t1">Settings JSON</span><span class="sp-b1">pyRevit placement</span>'
         '<span class="sp-t2">Revit-ready CSVs</span><span class="sp-b2">Re-import diff</span><span class="sp-t3">OBJ / USD / DXF</span>'
         '<span class="sp-b3">Handover record</span><b class="sp-z">Handover</b></div>')

cv.append(SEC('Concept to as-built',
 P("In use on **live projects** at concept design today — and because every stage reads and writes the **same IDs and schema**, the workflow extends through **detailed design and beyond**.", 'd-lead'),
 STEPS([('Concept design', 'options explored live, in the meeting'), ('Spatial coordination', 'one click into Revit via pyRevit'),
        ('Technical design', 'detail extends the same CSV schema'), ('Fabrication', 'solid OBJ / USD, CAD-true DXF'),
        ('Construction', 're-import diffs against the same IDs'), ('As-built', 'site deltas reconciled to handover')], on=1,
       riba=['RIBA 2', 'RIBA 3', 'RIBA 4', 'RIBA 4–5', 'RIBA 5', 'RIBA 6']),
 STATUS,
 CAP("the strength today is concept design — every mechanism the later stages need is already running underneath it"),
 H3('One model, one set of IDs', 'every stage adds data to the same spine'),
 SPINE,
 CAP("stable tracking IDs, end to end — the concept model is already the delivery model"),
 H3('Proven today — concept design, on live projects'),
 NOTE1("**Not a demo — this workflow runs on ^^live projects^^ today.**",
       "Project setup is already faster because of it: geometry briefed and iterated in the meeting, placed into Revit the same day, with every element carrying a stable ID from its first appearance. Nothing shown here is speculative — the later stages reuse mechanisms that are already in production."),
 H3('Why it extends', 'the route forward is engineering, not research'),
 NOTES([['**^^Revit-native^^ placement**', 'pyRevit consumes the CSVs directly — no translation layer, no re-modelling, native families.'],
        ['**^^Schema,^^ not rebuild**', 'Detail design extends columns on the same rows; downstream tools keep reading without rework.'],
        ['**^^Change control^^ built in**', "Re-import diffs against the same IDs: what moved, what's new, what's gone — reviewable per element."],
        ['**^^ISO 19650-shaped^^ record**', 'Versioned settings + exports form a natural audit trail from first option to handover deliverable.']], 2),
 P("**Days → ^^Hours^^ to a working studio · Days → ^^Minutes^^ per design change · ^^£0^^ licence cost · ^^1 click^^ to Revit**", 'd-close'),
 CAP("the workflow is already live where it matters most — everything after concept is the same mechanism, pointed further down the programme"),
))

# ════════════════════════════ PORTFOLIO ════════════════════════════
pf = []
pf.append(HEAD('Portfolio — Design Systems Analyst, Specialist Modelling Group', [
    ('fadilkarim@live.co.uk', 'mailto:fadilkarim@live.co.uk'),
    ('basilicalabs.ai', '/'),
    ('github.com/OttomanLabsAI', 'https://github.com/OttomanLabsAI'),
    ('uk.linkedin.com/in/fadil-karim', 'https://uk.linkedin.com/in/fadil-karim'),
]))

pf.append(SEC('Selected work',
 P("I build the **control systems that drive geometry** — a profile curve, a routing rule, a site boundary — and carry them through **Revit, drawings and site**, so the teams who use them can run them without me. Thirteen years across architecture, structures, civil and MEP, from AECOM, Arcadis, Buro Happold and GHD to Amazon and a hyperscale data-centre programme. Everything here is live at **[[basilicalabs.ai|index.html]]**, built with Claude Code as the implementation engine under my specification and review.", 'd-lead'),
 H3('The Gherkin — a parametric study of 30 St Mary Axe', 'one profile curve drives the whole tower'),
 FIGS(FIG('studio', 'The studio — the model in the middle, every parameter around it. Members, nodes and plates regenerate as the profile, levels and diagrid change.', None, GH_STUDIO)),
 STEPS([('Profile', 'clamped B-spline, drawn in elevation'), ('Levels', 'sliced at level height, with top and bottom offsets'),
        ('Rings', '22 nodes per level, radius read off the profile'), ('Diagrid', 'braces cross to the next ring; ring beams close each one'),
        ('Plates', 'floors inside the shell, with a core and twisting wedges'), ('Hand-off', 'stable IDs to Revit; OBJ, USD and DXF out')], on=6),
 FIGS(FIG('profile', "Profile — drag the spline's control points", None, GH), FIG('polar', 'Polar — nodes around each ring', None, GH),
      FIG('plan', 'Plan — framing, top-down', None, GH), FIG('elevation', 'Elevation — framing, side-on', None, GH)),
 CHIPS(['Height 180 m', '24 levels', '22 nodes per ring', '1,540 members', '528 nodes', '24 plates'], 'd-chips d-up'),
))

pf.append(SEC('The Gherkin — from model to Revit and sheets',
 P("The same model writes everything downstream: **Revit-ready data with stable IDs**, schedules and A4 sheets, and OBJ / USD / DXF for everyone else. **pyGherkin**, a pyRevit add-in, rebuilds it as native Revit elements — levels, floor slabs, diagrid framing, connection nodes — and updates them in place when the design changes.", 'd-lead'),
 FIGS(FIG('exoskeleton', 'Exoskeleton', None, GH), FIG('plates', 'Floor plates, core and light-well wedges', None, GH),
      FIG('nodes', 'Connection nodes and ring beams', None, GH), FIG('sheet', 'A4 sheet drawn from the same model', None, GH), rowh=400),
 FLOW(['Studio', 'CSV + JSON, stable IDs', 'pyGherkin places and tracks', 'Revit']),
 P("**Weeks to hours.** A modelling cycle of about four weeks became a 3–4 hour build, and a design change now reaches the Revit model in about ten minutes. Re-running against a changed export updates elements by their IDs instead of duplicating them."),
 CHIPS(['Stable IDs', 'Re-import updates in place', 'Schedules and A4 sheets', 'OBJ / USD / DXF'], 'd-chips d-up'),
 NOTES(["**Not Gherkin-specific.** The generator drives any revolved profile with a diagrid; 30 St Mary Axe is one preset of it.",
        "**Grasshopper first.** First authored in Grasshopper for Revit, then rebuilt as a browser studio so anyone on a team can drive it with sliders and presets."], 2),
 H3('Dymak HQ, Odense — a second study', 'spiralling roof, central court, column and beam frame'),
 FIGS(FIG('dymak-plan', 'Plan — roof, court and column rings', None, 'dymak.html'), FIG('dymak-3d', 'The frame in 3D', None, 'dymak.html')),
 NOTES(["**A handful of inputs drive the frame** — roof radius, the court's size and its offset from the centre, columns per ring and secondary beams.",
        "One JSON carries the model and its column and beam data to the **pyDymak** add-in; OBJ, USD and DXF write the frame as a 3D model in metres, Z-up. The build is written up as a **[[prompt-by-prompt tutorial|dymak-tutorial.html]]**."], 2),
))

pf.append(SEC('Site and infrastructure geometry',
 P("The same approach on the ground: terrain that goes straight into **Civil 3D and Revit**, and conduit routing that only ever draws **buildable geometry**.", 'd-lead'),
 H3('TopoForge — terrain from a site boundary', 'spline extents, TIN, sculpt, export'),
 FIGS(FIG('topo-sculpt', '3D sculpt — pull, push, smooth and flatten with a brush', None, 'topoforge.html'),
      FIG('topo-wire', 'Live wireframe, contoured at 0.5 m', None, 'topoforge.html')),
 P("Draw the site boundary as a closed B-spline and TopoForge triangulates a TIN inside it, lets you sculpt it and contours it live. It exports the exact triangulation as a **LandXML 1.2 TIN** for Civil 3D, a 3DFACE DXF, CSV point clouds, OBJ and USD — and **pyTopography** brings it into Revit as a Toposolid."),
 CHIPS(['LandXML 1.2 TIN', 'DXF 3DFACE', 'CSV / OBJ / USD', 'Revit Toposolid'], 'd-chips d-up'),
 H3('DataCentreForge — conduit routing between chambers', 'dcforge.basilicalabs.ai', 'https://dcforge.basilicalabs.ai/'),
 FIGS(FIG('dcf-plan', 'Plan — runs routed face to face, around an obstacle', None, 'https://dcforge.basilicalabs.ai/'),
      FIG('dcf-3d', '3D — chambers, obstacle and conduit runs', None, 'https://dcforge.basilicalabs.ai/')),
 NOTES(["**Standard fittings first.** Runs bend only through the permitted fittings, with minimum straights between them. Where chambers sit at an angle no standard set can make, the run gets one custom bend sized to what is left — a chamber turned 32.9° gets a single 32.9° fitting.",
        "**Banks keep their order.** Runs sharing a chamber face hold their order and pitch on one grid; each bank's array is set on a picture of its section — 3 over 2, or 8, 8 and 8 — and drawn at true scale in elevation and 3D.",
        "**Obstacles in three dimensions.** Every obstacle has a top and a bottom; runs pass over, under or around it with clearance, and encased banks keep their neighbours clear of the encasement.",
        "**Live models in, IDs kept.** Reads Revit exports and IFC 2x3 — one site model brought in 105 manholes and 87 conduit banks — keyed on Revit element IDs, so a later export refreshes the drawing in place."], 2),
))

pf.append(SEC('Tools in daily use',
 P("A tool only counts if people keep using it. **pyMEP** has been in daily use on a live hyperscale data-centre programme since March 2026, **VisualNeuroscience.AI** is live on the App Store, and the methods behind all of it are published as tutorials and a hands-on playground.", 'd-lead'),
 H3('pyMEP — Revit automation for civil and MEP', 'github.com/OttomanLabsAI/pyMEP', 'https://github.com/OttomanLabsAI/pyMEP'),
 FIGS(FIG('pymep-ribbon', 'The pyMEP ribbon — 14 panels, from Civil 3D conversion and fencing to chambers, annotation and COBie.',
          'The pyMEP ribbon, 14 panels: Setup, Civil 3D conversion, Modelling, Networks, Fencing, Topography, Chambers, Parameters, Annotate, Data transfer, Pipe networks, Electrical, Manhole plan, COBie',
          'https://github.com/OttomanLabsAI/pyMEP')),
 NOTES(["**Embedded with the engineers who use it.** 44 commands for Revit 2022–2026 covering drainage, conduits, fencing, chambers, topography and annotation, used across several offices and updated from a button on the ribbon.",
        "**Civil 3D to Revit in minutes.** Reads the LandXML, reconciles survey-grid and Revit coordinates — a site datum counted twice, a rotation the API reported wrongly and measured with a probe point instead — then places every pipe and manhole as native elements, where the team used to trace hundreds by hand.",
        "**Fencing and terrain.** Fence runs drape to the topography, with panel spacing solved along each run and marks numbered automatically; floors and structures align to the Toposolid.",
        "**Chambers to sheets.** Chamber plans, sections and sheet sets generated from the model; parallel pipes, conduits and ducts annotated as banks in one click; COBie populated and checked.",
        "**Built to be trusted.** 431 automated tests run without Revit on the machine, and every push to main is a tagged release that reaches the team through the self-updater."], 2),
 CHIPS(['44 commands', '14 panels', 'Revit 2022–2026', '431 tests', 'Self-updating'], 'd-chips d-up'),
 H3('VisualNeuroscience.AI — visualisation at scale', 'visualneuroscience.ai', 'https://visualneuroscience.ai/'),
 SPLIT(FIGS(FIG('vns-tracts', 'Tractography — HCP1065 population average, direction-coloured streamlines', None, 'https://visualneuroscience.ai/')),
       NOTES(["**Real MRI data in WebGL2.** A region atlas in four synchronised planar and 3D viewports, ~1M-streamline tractography and a voxel-measured 3D border graph, rendered in the browser with NiiVue.",
              "**One codebase, six platforms.** Web, offline PWA, iOS / iPadOS, Mac, Android and Apple Vision Pro, shipped over 20+ releases and live on the Apple App Store since September 2026, with every release checked in headless Playwright before it ships."], 1)),
 H3('Teaching the method', 'tutorials, a playground and a course site'),
 SPLIT(FIGS(FIG('playground', 'The Computational AI Playground at basilicalabs.ai', None, 'playground.html')),
       NOTES(["**A playground, not a manual.** 2D line types, 3D solids built from profiles and paths, graphs and input widgets — every box can be taken away as a working HTML file, or as a prompt your own AI can rebuild it from.",
              "**Every build is reproducible.** Builds are written up as prompt-by-prompt tutorials; **[[pocketuniversity.ai|https://pocketuniversity.ai/]]** teaches applied AI; **[[@OttomanLabsAI|https://www.youtube.com/@OttomanLabsAI]]** on YouTube covers Revit, Grasshopper and AI.",
              "**How it is built.** Claude Code implements under my specification and review, and every DataCentreForge release commits the prompt that produced it, the reply that shipped it and the model that wrote it."], 1)),
))

CV_HTML = DOC('CV: Fadil Karim', cv)
PF_HTML = DOC('Portfolio: Fadil Karim', pf)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
open(os.path.join(HERE, 'out', 'cv.html'), 'w').write(CV_HTML)
open(os.path.join(HERE, 'out', 'pf.html'), 'w').write(PF_HTML)
print('out/cv.html', len(CV_HTML), '· out/pf.html', len(PF_HTML))
