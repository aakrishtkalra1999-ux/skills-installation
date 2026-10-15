# Armageddon 2026: decisions log

Case: Ironbridge Industrial Group (fictional), IIM Ahmedabad strategy case competition. Digital transformation strategy for a new CEO with an 18-month mandate (January 2026 to June 2027) or a forced sale of the Auto business.
Team Name: AJA. No Team ID was issued. Submitted file: `final/AJA_Armageddon2026.pdf`. Results were due 3 October 2026.

Dates are when the decision was made. "User" means you; everything else was Claude's call, explained at the time.

## 29 September 2026

1. **Skills set up.** Installed `ib-check-deck`, `pitch-deck` and `theme-factory` (all official Anthropic). `pitch-deck` turned out to only fill existing PowerPoint templates, so it went unused.
2. **Design system vs consulting style.** Your account's "Design System" was empty, so it gave no look at all. Recommended a classic consulting style instead.

## 30 September 2026

3. **Diagnosis.** Cash crisis first, margin second. EBITDA 122 to 25; net debt 30x EBITDA; interest cover 0.6x; cash 30 against 180 of short-term debt. Of the 97 lost, about 70 was core-business erosion and about 27 was self-inflicted by the digital programme (48 of running cost for 13 of savings).
4. **Pilot verdicts.** Predictive maintenance and vision inspection pay their running costs, so fix them and then scale. The AI-agent supply-chain planner lost money and made inventory worse (90 to 94 days), so switch off the agent layer and fix master data first.
5. **Strategy name.** "Fix, Focus, Fund", chosen over scaling everything (burns cash) and shutting the programme down (strands assets).
6. **Model build.** Python and LibreOffice are not on this PC, so the Excel model is built in Node (exceljs plus hyperformula to calculate every formula). All benchmarks were checked against the original source pages in the browser before use.
7. **User asked:** what the 40 was (net finance costs) and how benefit was calculated (taken from Exhibit 5, not calculated). Flagged that the vision pilot's ratio implies an impossible 63% of cost of sales, so it is not extrapolated.
8. **User asked** for the reasoning behind three findings (the dip before gains, the cash gap, SMC staying negative). While explaining, Claude corrected its own error: Auto's 5.9% was EBITDA margin, but the supplier benchmarks quoted were EBIT. The claim was withdrawn.
9. **User said "add the lever":** added 1% price recovery for SMC to the pricing initiative.
10. **User said "go ahead":** ran the LLM council (5 advisors, 5 peer reviewers, 1 chairman). All 5 reviewers picked the Contrarian as strongest. Full record in `COUNCIL.md`.
11. **User said "continue":** model v2 applied the council's changes:
    - base case at 75% of planned benefits arriving (100% stretch, 50% downside)
    - overlaps netted (procurement savings and productivity given back to car makers)
    - +3% refinancing premium on the 180 and new money (half-year in 2026)
    - lender view on the last 12 months next to the run-rate
    - sources and uses of cash with a funding bridge (licence sales 20, sale-and-leaseback 40, receivables finance 25)
    - inventory release only after the master-data fix (100 to 90 days)
    - new lever for back-office and customer-support automation (4% of 153), backed by McKinsey's 30% to 45% figure for GenAI in customer care
    - SMC fix-or-exit checkpoint moved to month 6; vision traceability cut to 3 lines and 4 of capex
    - seven workstreams for the deck
12. **Win condition.** Four tests that a board and lenders would use, set independently and not tuned to the result: liquidity (no new money beyond rolling over the 180), solvency (exit interest cover of at least 1.0x even at 50% delivery), Auto pays its way (Auto EBITDA of at least 20.5, its share of maintenance capex), digital pays for itself. All four met; "if nothing changes" fails all four.
13. **User chose:** "use the consulting style deck", not the design-system shortlist (IBM Carbon, Stripe, Airtable).
14. **Deck built** as HTML slides printed to PDF with Edge. QC with `ib-check-deck` found no number mismatches. Fixes made: the energy-capex overclaim, units on every footer, the funding and Auto-test assumptions shown in Appendix 2, and undefined abbreviations.
15. **User asked to humanise:** plain English everywhere, zero em or en dashes, and "momentum" replaced with "if nothing changes" / "No change". Jargon swapped: checkpoint for gate, last 12 months for LTM, "a rate 3% higher" for +300bp.
16. **User gave the Team Name** as AJA (no Team ID). It was first added to the slide headers, then **user said** drop it from the headers and keep it only in the file name. Slides and PDF metadata are fully anonymous.

## Final numbers (base case, June 2027)

| | If nothing changes | Our plan |
|---|---|---|
| Annual (run-rate) EBITDA | 48 | 69 (+21) |
| 18-month free cash flow | −142 | −74 |
| Net debt | 897 | 829 (755 today) |
| Interest cover, last 12 months / run-rate | 0.9x / 0.8x | 1.0x / 1.3x |
| New money needed | 57 | none (11 spare) |
| Auto EBITDA | 20.3 | 28.7 (5.0% margin, from 0.9%) |
| Net digital contribution | −12 | +9 |
