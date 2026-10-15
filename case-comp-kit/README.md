# Case competition kit

Every resource, skill and tool for working on a **new** case competition, in a new chat.

## How to start
Open a new chat and say **"use my case-comp kit"** (or type `/case-comp`), then share the new case PDF and its rules. Claude reads this kit and asks which parts you want. Pick any of them, in any order, whenever you want.

## What you can pick

| Pick | What you get |
|---|---|
| Full run | Every stage of `PLAYBOOK.md`, from reading the case to the final PDF, stopping for your approval between stages |
| Set up | A new case folder with the case text extracted, starter model and deck, and a decisions log |
| Diagnosis | Rules noted, exhibits rebuilt and reconciled, the key bridge, a verdict on each stakeholder's view |
| Recommendation | 2 or 3 real options, why the losers lose, a short strategy name |
| Financial model | Formula-driven Excel model with checks, phasing, cash and a lender view |
| Benchmarks | Verified outside figures for assumptions |
| Similar cases | Matching cases from four 2025-26 casebooks (IIMA, IIM Calcutta, FMS, ISB), with page numbers |
| Sector primer | Market size, players, value chain and trends for the case's industry from the casebooks |
| Framework pick | The right structure for the problem type, from `FRAMEWORKS.md` |
| Market sizing | Size of the market, top-down and bottom-up |
| Stress test | LLM council: 5 advisors, 5 reviews, 1 verdict (cost confirmed first) |
| Win condition | A slide-1 scorecard of tests the plan must pass |
| Deck | Consulting-style PDF, a design from your shortlist, or PowerPoint |
| Quality check | Numbers match across slides, story matches data, nothing overflows |
| Humanise | Plain Indian English, zero dashes, no jargon |
| Judges' Q&A | The toughest questions with short answers |
| Submission check | `CHECKLIST.md` |

## What is in the kit

| File or folder | What it is |
|---|---|
| `PLAYBOOK.md` | The full method, stage by stage, with the skill for each |
| `FRAMEWORKS.md` | Every case-type structure in plain words, and how to turn it into a written competition answer |
| `reference/` | The casebook library: four casebooks with full text, `CASE-INDEX.md` (over 300 cases by type, plus about 80 guesstimates), `INDUSTRY-PRIMERS.md` (35 sectors), `CASEBOOKS.md` (what is where) |
| `tools/search-casebooks.js` | `node tools/search-casebooks.js "<words>"` finds every casebook page mentioning them |
| `SKILLS.md` | Every installed skill and tool, and when to use it |
| `LESSONS.md` | What judges reward and traps to avoid |
| `BENCHMARKS.md` | Verified sources with exact wording and links |
| `CHECKLIST.md` | Submission checklist |
| `lib/model-kit.js` | Excel model builder |
| `lib/deck-kit.js` | Slide builder: bridge charts, priority matrix, roadmap, tables, PDF export |
| `templates/` | Starter model and deck files |
| `tools/new-case.js` | `node case-comp-kit/tools/new-case.js <folder-name> <case.pdf>` creates the case folder |
| `past-cases/` | Finished competitions, kept only as worked examples to copy from |

## Machine notes
- No Python or LibreOffice on this PC. Everything runs on Node (libraries installed here) and Edge for PDFs.
- PDFs are read with `C:\Program Files\Git\mingw64\bin\pdftotext.exe` (use `-raw` for tables).
- New case folders go next to this kit in `C:\Users\aryan\claude code\`.

## After each competition
Copy it into `past-cases/`, and add what you learned to `LESSONS.md` and `BENCHMARKS.md`.
