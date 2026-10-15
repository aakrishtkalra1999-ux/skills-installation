# The casebook library

Four 2025-26 consulting casebooks, kept here as personal study copies. Each says it may not be reproduced or redistributed without permission, so they stay on this PC. Don't share them, and don't copy their content into decks or anything you submit. Use them to learn approaches, then write in your own words.

| Book | File | Pages | Strongest for |
|---|---|---|---|
| IIM Ahmedabad Consult Prep Book (12th ed., Sep 2025) | `casebooks/IIMA-2025-26.pdf` | 389 | 108 cases with approach sheets, 25 guesstimates, 27 two-page industry reports, datasheets |
| IIM Calcutta Casebook (6th ed., Sep 2025) | `casebooks/IIMC-2025-26.pdf` | 457 | 87 cases with full interview transcripts, 15 guesstimates, framework pages per case type |
| FMS Delhi Casebook (Issue 6, Aug 2025) | `casebooks/FMS-2025-26.pdf` | 325 | 76 cases tagged by firm, business basics (economics, accounting, finance, valuation), 20 sector pages |
| ISB Consulting Prep Casebook (Oct 2025) | `casebooks/ISB-2025-26.pdf` | 183 | Problem-to-framework maps, scoping, abstract and public-policy cases, tech and cloud cases, 20 sector primers |

Each book also has a `.txt` (full text) and a `-pages.md` (first lines of every page) beside it.

## Where the frameworks are (PDF pages)
- **IIMA:** interview structure p11; frameworks p14 to 31 (profitability, market entry, pricing, growth, M&A, due diligence, SWOT, PESTEL, Porter, BCG and Ansoff matrices and more); preamble with an intro case p32; unconventional-case tips p215; guesstimate tips p297.
- **IIM Calcutta:** case process p10 to 18; general frameworks, Porter, matrices and case themes p34 to 41; profitability p42 to 47 (customer journey, cost reduction, declining revenue); market entry p156; pricing p231; growth p263 (international expansion p264); M&A p336; unconventional (increasing capacity) p368; guesstimates p433.
- **FMS** (its printed page numbers are one lower than the PDF's): business basics p14 to 37 (BCG matrix, value chain, Ansoff, 7S, PESTEL, economics, accounting, marketing, finance, ROIC tree, valuation); MECE and guesstimate method p38 to 52; case frameworks p53 to 63 (profitability, market entry, growth, pricing, GTM, M&A, "when nothing works", 5 senses, VRIO); tech insights p87 to 90.
- **ISB:** strategy vs tactics p30; types of cases p32; scoping (3CPOR) p33; problem-to-framework maps with questions to ask p34 to 48 (profitability, pricing, GTM, market entry, growth, M&A, PE/VC); abstract cases and the 4W scope p49; sales effectiveness p50; governance trees p51 to 52; MECE tips and VRIO p53; typical case flow p54; candidate evaluation template p55; feedback p56.

## How to use them in a new case competition
1. **Find similar cases:** `reference/CASE-INDEX.md`, or `node tools/search-casebooks.js "<sector or problem words>"`.
2. **Get sector context fast:** `reference/INDUSTRY-PRIMERS.md`.
3. **Pick a structure:** `FRAMEWORKS.md` in the kit root, then the book pages above for detail.
4. **Size things:** the guesstimate sections and cheat sheets, then verify any number before it goes on a slide.
5. **Practise the Q&A:** the IIM Calcutta transcripts show how interviewers push back; use them to rehearse judges' questions.

## Adding more books
Drop the PDF in `reference/casebooks/` with a short name, run `pdftotext -layout -enc UTF-8 <book>.pdf <book>.txt` (Git's copy at `C:\Program Files\Git\mingw64\bin\pdftotext.exe`), then `node tools/search-casebooks.js --pagemap`, and add its cases to `CASE-INDEX.md`.
