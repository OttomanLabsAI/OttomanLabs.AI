"""Worked example: the evidence under each TP Bennett job-description point (36 points).
EV maps a point's id (ex-, resp-, ess-, des-) to paragraphs. Mini-markup: **bold** (shown in
burgundy), [[text|href]] (opens in a new tab). Applied with:  page_tools.py evidence PAGE.html evidence.py

Rules followed: draw only on the CV and work Fadil has actually done; first person; lead with the
strongest proof; where the CV has nothing, say so plainly and give the nearest real work
(APS, C#, React, WPF / MVVM, custom Grasshopper components were the gaps here). The owner asked
for Google Cloud to point at the Jaded Rose Telegram bot.
"""

PYMEP = '[[pyMEP|https://github.com/OttomanLabsAI/pyMEP]]'
DCF = '[[DataCentreForge|https://dcforge.basilicalabs.ai/]]'
VNS = '[[VisualNeuroscience.AI|https://visualneuroscience.ai/]]'
GHS = '[[Gherkin studio|gherkin-studio.html]]'
PAPER = '[[AI Strategy for Construction|strategy.html]]'

EV = {
# ── examples of current and planned work ──
'ex-1': [
 "**The Gherkin.** First authored in Grasshopper for Revit, then rebuilt as a browser " + GHS + ": one profile curve drives levels, rings, diagrid, plates and connections. Options are explored live in the meeting at concept stage, then go to Revit with stable IDs for technical design.",
 "**EGIS.** Automated optimised warehouse design in Grasshopper and Dynamo — generative layouts driven straight from project parameters instead of manual drafting.",
 "**Rationalising.** " + DCF + " only draws buildable runs — permitted fittings first, minimum straights, and one custom bend where no standard set fits. pyMEP's fence solver never exceeds the design spacing and clears foundation clashes.",
],
'ex-2': [
 "**Sheets and issue sets from the model.** At EGIS my Python pipelines generated hundreds of named, numbered sheets in seconds. pyMEP generates chamber plans, sections and sheet sets, and the Gherkin studio draws its own A4 sheets.",
 "**Document control.** As BIM Manager I set up CDE workflows and owned ISO 19650 information management, so I know the issue process this automation has to respect.",
 "**Event-driven plumbing.** The Jaded Rose platform runs on HMAC-verified webhooks and a Pub/Sub task queue — the same pattern APS webhooks use to start work when a new version lands. APS itself would be new to me; the workflow and the plumbing are not.",
],
'ex-3': [
 "**" + DCF + "** — 2D CAD in the browser for conduit routing. It reads Revit exports and IFC 2x3 (one site model brought in 105 manholes and 87 conduit banks) and keys everything on Revit element IDs.",
 "**The " + GHS + "** — sliders and presets instead of scripts, so engineers and architects drive a parametric model without opening Revit or Rhino.",
 "**Amazon** — turned unstructured 2D CAD drawings into structured data for Amazon's global warehouse database, mapped onto one canonical, queryable schema.",
],
'ex-4': [
 "**" + PYMEP + "** — 44 Revit commands across 14 panels, in daily use on a live hyperscale data-centre programme since March 2026 and used across several offices.",
 "**Before that** — Dynamo and Grasshopper automation and custom pyRevit scripts adopted by entire teams: thousands of MEP elements placed from clients' DWG data, tens of thousands of COBie parameters populated, and one-click pipe-slope annotation.",
],
'ex-5': [
 "**Jaded Rose AI customer service** — grounded RAG over Pinecone. Answers come only from context retrieved from the store's real policies; when nothing relevant comes back, the agent offers a human handoff instead of guessing.",
 "The knowledge base is built by an idempotent, versioned pipeline, so the source set behind every answer is known.",
],
# ── key responsibilities ──
'resp-1': [
 "**Desktop:** " + PYMEP + ", plus the pyGherkin, pyDymak and pyTopography add-ins that rebuild browser models as native Revit elements.",
 "**Web:** BasilicaLabs.AI (15 production pages, ~25,000 lines), " + DCF + ", and " + VNS + ", shipped from one codebase to web, iOS / iPadOS, Mac, Android and Apple Vision Pro.",
 "I maintain all of them myself — pyMEP alone has 220+ tagged releases.",
],
'resp-2': [
 "On pyMEP, requirements arrive from working engineers as screenshots, IFC / LandXML files and one-line messages. I turn them into a spec, decide the trade-offs and give the acceptance judgement.",
 "Every studio build starts the same way — pick the win, agree the inputs — and client commissions start from a plain-English brief agreed before anything is built.",
],
'resp-3': [
 "**pyMEP:** a pure-core / Revit-shell split with 431 automated tests that run without Revit, a repo-level agent contract (CLAUDE.md plus reusable skills), and every push to main auto-tagged as a release.",
 "**Elsewhere:** Jaded Rose has 34 pytest tests and is documented for Cloud Run; DataCentreForge keeps Playwright regression suites and a per-version audit trail in the repo.",
],
'resp-4': [
 "pyMEP supports a live hyperscale data-centre programme. Most changes reach site the same day through the self-updater, which updates atomically and can roll back.",
 "Runs are stage-logged with first-error capture, so an “it does nothing” report becomes a one-round fix.",
],
'resp-5': [
 "As BIM Manager at Whitfield Consulting I mentored junior staff and championed automation adoption.",
 "I write builds up as prompt-by-prompt tutorials (a 17-step tutorial and the [[Dymak HQ tutorial|dymak-tutorial.html]]), run the [[Computational AI Playground|playground.html]], and cover Revit, Grasshopper and AI on YouTube ([[@OttomanLabsAI|https://www.youtube.com/@OttomanLabsAI]]).",
 "pyMEP updates from a button on the ribbon, so staying current costs the user nothing.",
],
'resp-6': [
 "**pyMEP distribution.** I built an in-app self-updater with atomic update and rollback, and release resolution that works behind corporate proxies (GitHub API, with git smart-HTTP and codeload fallbacks). It reaches engineers in other cities on Revit 2022–2026.",
 "**Store releases.** " + VNS + " is packaged for and live on the Apple App Store, with a documented privacy and store-compliance package.",
 "Installer packaging and device-management roll-out would be done with IT; the distribution, versioning and update side is work I already own.",
],
'resp-7': [
 "As BIM Manager (EGIS, Whitfield Consulting) I owned BEPs and ISO 19650 information management, set up CDE workflows and ran cross-discipline coordination across the portfolio.",
 "On the software side, " + VNS + " has in-app account deletion and a documented privacy package, and its offline PWA makes zero third-party requests — the data-protection habits UK GDPR asks for.",
],
'resp-8': [
 "**Feasibility first:** DataCentreForge returns an honest “no route” rather than unbuildable geometry, and scores ~30k candidates so routes detail like a human would draw them.",
 "**Reliability:** pyMEP falls back to barycentric draping when Revit's ray-caster returns nothing, and self-calibrates where API behaviour differs between Revit builds.",
 "**Scale:** VisualNeuroscience.AI renders ~1M tractography streamlines in the browser.",
],
'resp-9': [
 "At Amazon and Glent I built production software on their data, under their constraints.",
 "Jaded Rose verifies every incoming webhook with HMAC and answers only from retrieved context. VisualNeuroscience.AI runs with zero third-party requests.",
 "Where an AI agent writes the code, it works under a repo-level contract (CLAUDE.md plus skills), so its behaviour stays the same from one session to the next.",
],
'resp-10': [
 "I wrote the " + PAPER + " paper: purpose-built parametric tools in hours, carried from concept to as-built on one set of IDs, and compared with Grasshopper and Dynamo on build time, training, licences and output.",
 "At EGIS I prototyped the first AI agents for the Revit API — the work that set the direction for the Amazon and Glent roles.",
],
'resp-11': [
 "Nine years of production modelling across structures, MEP and architecture — buildings, rail and water — then BIM Manager running coordination and clash resolution across a multi-project portfolio.",
 "On pyMEP I work embedded with the engineers who use it, not apart from them.",
],
'resp-12': [
 "I compared Claude Code-built studios with Grasshopper and Dynamo on build time, training, licences, users and output, and published the result in the " + PAPER + " paper.",
 "For an anatomical figure I chose deterministic Catmull-Rom upscaling over model-based upscaling, to avoid hallucinated digits.",
 "Every DataCentreForge release commits the prompt, the reply and the model that produced it, so tools and models can be compared version by version.",
],
# ── essential ──
'ess-1': [
 "**Python** — six years. pyMEP is ~40,000 lines, alongside FastAPI services and numpy image pipelines.",
 "**JavaScript** — BasilicaLabs.AI (~25,000 lines, framework-free), DataCentreForge's ~2,000-line geometry core and VisualNeuroscience.AI's WebGL2 front end.",
 "**C#** — my Revit work calls the same .NET Revit API that C# add-ins use, from IronPython 2.7, so moving to C# means new syntax on an API I already know.",
],
'ess-2': [
 "My development runs on Linux (Debian, five years) with Git and Claude Code. pyMEP is set up to be developed and tested without Revit on the machine: 431 tests run under CPython 3 against code that executes in IronPython 2.7.",
],
'ess-3': [
 "Grasshopper expert, four years. At EGIS I built generative warehouse layouts in Grasshopper and Dynamo, driven straight from project parameters.",
 "The Gherkin study was first authored in Grasshopper for Revit before it became a browser studio.",
],
'ess-4': [
 "**" + PYMEP + "** is a pyRevit extension I wrote, packaged and shipped: 44 commands, Revit 2022–2026 through version shims, distributed to engineers in other cities by an in-app self-updater — 220+ tagged releases in 4.5 months.",
 "pyGherkin, pyDymak and pyTopography are further add-ins that rebuild browser models as native Revit elements.",
],
'ess-5': [
 "APS itself would be new to me. The closest work so far:",
 "**Document control** — ISO 19650 CDE workflows as BIM Manager. **IDs as the key** — DataCentreForge keys on Revit element IDs, and pyGherkin updates elements in place by stable tracking ID. **Attributes at scale** — tens of thousands of COBie parameters populated. **Webhooks** — HMAC-verified webhooks and a Pub/Sub queue on the Jaded Rose platform.",
],
'ess-6': [
 "**Full stack, shipped:** Jaded Rose (FastAPI, SQLAlchemy 2.0 / Cloud SQL, Redis, Pub/Sub and an embeddable web widget); " + VNS + " (responsive web and PWA, Firebase auth, a Cloudflare Worker minting RS256 tokens); BasilicaLabs.AI (Cloudflare Workers, Firebase Auth / Firestore cloud saves).",
 "The front ends are framework-free (no build step) rather than React.",
],
'ess-7': [
 "Git and GitHub for four years. pyMEP had 285 commits and 220+ tagged releases in 4.5 months, with every push to main auto-tagged.",
 "The work runs in short loops — request, build, review, release — usually inside a day.",
],
'ess-8': [
 "**" + PYMEP + "** — in daily use on a live hyperscale data-centre programme since March 2026, across several offices, kept current through the self-updater.",
 "**Earlier tools** — Dynamo, Grasshopper and pyRevit tooling adopted by entire teams.",
 "**" + VNS + "** — live on the Apple App Store since September 2026, after 20+ releases.",
],
'ess-9': [
 "BEng Civil Engineering, University of Birmingham (2010–2014). PGCert Applied Neuroscience, King's College London (2021–2023).",
],
'ess-10': [
 "Over a decade in AEC: computational design and BIM from 2015 (AECOM, Arcadis, Buro Happold, GHD and others), then BIM Manager at EGIS. Since late 2024, AI engineering at Amazon and Glent, building production software on their data.",
],
'ess-11': [
 "**Engineering problems turned into software:** survey-grid rotation measured with a probe point rather than trusted from the API; union-find detection of parallel pipe, conduit and duct banks; cycle detection and longest path to number fence marks.",
 "**Explained to non-developers:** client commissions briefed and handed over in plain English, and the client pages on basilicalabs.ai written for owners with no technical background.",
],
'ess-12': [
 "I work embedded with the engineers who use my tools. As BIM Manager I coordinated across disciplines and offices, and I've worked inside 17 enterprise engineering organisations, AECOM to Amazon. I also teach the method in public through tutorials and YouTube.",
],
# ── desirable ──
'des-1': [
 "pyMEP is Revit API work end to end, across Revit 2022–2026: LandXML networks into placed pipes and manholes, fencing and floors draped to the Toposolid, conduit size standards extended programmatically.",
 "Dynamo for four years, including automation adopted across teams and warehouse design at EGIS, where I also prototyped the first AI agents for the Revit API.",
],
'des-2': [
 "**Jaded Rose:** an idempotent, versioned knowledge-base pipeline built from the store's real policies, embedded into Pinecone and searched by vector at question time. Answers are grounded in what was retrieved, with a handoff when nothing fits.",
],
'des-3': [
 "Jaded Rose runs GPT-4o in production. A supervisor classifies each message into one of eight intents with a confidence score; the code gates on 0.7 and routes to specialist FAQ, order, returns and product agents, or hands off to a person.",
 "Commercial APIs alongside it: Shopify Admin (order lookups with carrier detection), SEC EDGAR XBRL for pyBuffet, GitHub, and Firebase.",
],
'des-4': [
 "Model output is checked, not trusted. The Jaded Rose classifier sits behind a 0.7 confidence gate with human handoff below it, and has 34 pytest tests.",
 "Every AI-written DataCentreForge release passes Playwright regression suites and is recorded with its prompt, reply and model.",
 "On pyMEP I triage what the agent gets wrong through diagnostics I had it build, and sign off each change before release.",
],
'des-5': [
 "**Designed:** FastAPI services for Jaded Rose. **Consumed:** the Shopify Admin, SEC EDGAR XBRL, GitHub and Firebase APIs.",
 "**SQL:** PostgreSQL / Cloud SQL through SQLAlchemy 2.0. **NoSQL:** Firestore cloud saves, Redis conversation memory and Pinecone vectors.",
],
'des-6': [
 "My closest work is pyMEP, built on the Revit .NET API from IronPython 2.7, with version shims across Revit 2022–2026. WPF and MVVM in C# aren't in my portfolio yet.",
],
'des-7': [
 "**Google Cloud — the Jaded Rose Telegram bot.** The support platform customers reach over Telegram (and WhatsApp, Gmail and a web widget) is GCP-native: Dockerised for Cloud Run, with Cloud SQL and a Pub/Sub task queue.",
 "**CI/CD:** pyMEP's CI tags every push to main as a release; BasilicaLabs.AI deploys from Git to Cloudflare Workers.",
],
}

