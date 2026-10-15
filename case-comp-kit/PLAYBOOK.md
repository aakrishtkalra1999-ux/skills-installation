# Case competition playbook

This is the full method used for Armageddon 2026, written so any new case can follow it. Every stage is optional: pick the ones you want from the menu in `README.md`.

## Stage 1. Read the case properly
- Extract the PDF text twice with Git's `pdftotext` (it ships with Git for Windows): `-layout` keeps the page look, `-raw` keeps tables in reading order. Tables extracted with `-layout` come out scrambled; always check numbers against `-raw`.
- Note the deliverable rules first: slide limit (does the cover count?), anonymity, file name, deadline, judging weights. Put them in the case's `DECISIONS.md` straight away.
- Skill: `anthropic-skills:case-study-analysis`.
- Find similar solved cases and the sector primer: `reference/CASE-INDEX.md`, `reference/INDUSTRY-PRIMERS.md`, or `node tools/search-casebooks.js "<sector or problem words>"`. Pick the structure from `FRAMEWORKS.md`.

## Stage 2. Diagnosis
- Rebuild the exhibits in the model and make every subtotal reconcile (balance sheet balances, cash flow closes, segments add to the group). This catches typos and earns "rigour" marks.
- Build the bridge of the headline metric (for example EBITDA from the first year to the last) and use it to **rule on each executive's view**. Cases usually give conflicting management opinions on purpose.
- Separate what happens automatically from what the plan does (Armageddon: 23 of one-off costs rolled off anyway; claiming it would be double counting).
- Look for inconsistencies in the exhibits and say so (Armageddon: the vision pilot's ratio implied 63% of cost of sales on 8 lines).

## Stage 3. Options and recommendation
- Lay out 2 or 3 real options and say why the losers lose.
- Give the strategy a short name with three verbs (Fix, Focus, Fund).
- Answer every part of the problem statement explicitly. Armageddon asked for growth and differentiation as well as fixes; a purely defensive plan loses marks.
- Different businesses need different plays: show what is Group-wide and what is business-specific.

## Stage 4. Model
- `lib/model-kit.js`: formulas, cached values, colour conventions, integrity checks, JSON export for the deck.
- Size every lever from an exhibit number times a stated assumption. Put every assumption in its own cell with a reason and a source code.
- Benchmarks: verify each one on the original page before using it (McKinsey pages block plain fetching, so open them in the built-in browser and read the text). Size well below the published range.
- Phase the 18 months (or whatever the mandate is): benefits ramp slowly, set-up costs come first. Show the dip honestly.
- Show cash, not just profit: interest, capex, working capital, debt, and a sources and uses table.
- Add a lender view: last-12-months numbers, not just the exit run-rate.

## Stage 5. Stress test
- Skill: `anthropic-skills:llm-council` (5 advisors, 5 anonymous peer reviews, 1 chairman). Costs about 11 agent runs; say so before starting.
- Give the advisors the full numbers. Then give the chairman any facts the reviewers got wrong.
- Typical fixes it produced: a delivery haircut (75% base case), netting overlapping savings, a funding bridge, a "turned around" test on slide 1, fewer initiatives grouped into workstreams, checkpoints with numbers.

## Stage 6. Define the win
- Put a scorecard on slide 1: 3 to 5 tests a board or lender would actually use, with a target, the "if nothing changes" result and the plan result. Set the targets before looking at whether the plan clears them.

## Stage 7. Deck
- Design: follow the CLAUDE.md design-reference rule (shortlist, recommend, wait for "approved"), unless you already know you want the consulting style used for Armageddon.
- `lib/deck-kit.js`: slide chrome, waterfall, bubble matrix, gated Gantt, tables, PDF and per-slide PNG previews via Edge.
- Structure that worked for 5 main + 2 appendix: Answer, Diagnosis, Choices, Impact, Roadmap; Appendix 1 financial workings, Appendix 2 assumptions and sources.
- Every headline is a full sentence stating the takeaway. Every slide has a source line with units.
- Look at every slide preview yourself: overflow, label collisions, empty space.

## Stage 8. Quality check
- Skill: `ib-check-deck` (its Python script will not run on this PC; do the cross-slide number check by hand from the model JSON).
- Check: every repeated number matches, totals add up, claims match charts, every abbreviation is defined, units on every slide.

## Stage 9. Humanise
- Skill: `humaniser`. Plain Indian English, short sentences, zero em or en dashes (write "2022 to 2025", "67% to 81%"). No niche jargon: "if nothing changes" not "momentum", "checkpoint" not "gate".
- Scan the final PDF text for dashes with `pdftotext`.

## Stage 10. Submit
- Run `CHECKLIST.md`.

## Stage 11. Judges' Q&A prep (not yet done for Armageddon)
- List the 10 toughest questions from the council record and the sensitivity table, with a one-line answer and the number behind it.
- The IIM Calcutta casebook's interview transcripts show how examiners push back; use them to rehearse.
