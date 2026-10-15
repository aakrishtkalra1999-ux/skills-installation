# Lessons from past case competitions

Read this before starting any new case. Add to it at the end of every competition.

## From Armageddon 2026 (IIM A, Ironbridge digital transformation)

### What judges reward
- **Consistency with the exhibits beats clever ideas.** The rubric said so explicitly. Every number should trace to an exhibit or a stated assumption.
- **Cash and solvency, not just profit.** A turnaround case with heavy debt is decided by liquidity. A plan that only shows EBITDA gets marked down on feasibility.
- **Rule on the management debate.** If the case gives four executives with four explanations, use the numbers to say who is right and by how much.
- **Honest phasing.** Showing the dip before the gains (costs first, savings later) is more credible than an instant win.
- **Define "turned around" on slide 1** with tests and show both "if nothing changes" and "our plan" against them.

### Traps we caught
- **Do not claim what happens anyway.** One-off costs that stop on their own are not the plan's impact.
- **Do not count savings twice.** Benefits already in the base year stay out; overlapping levers (procurement vs price pass-through, energy vs process control) need netting.
- **Compare like with like.** We nearly compared our EBITDA margin with published EBIT margins. Check what a benchmark measures before quoting it.
- **Lenders look at the last 12 months,** not the June exit run-rate. Show both.
- **Refinancing a distressed company costs more.** Add a premium to interest.
- **Pilot results tell you the realistic delivery rate.** Ours hit 48% to 60% of target, so a 75% base case was defensible and 100% was not.
- **A ratio that implies something impossible** (vision savings implying 63% of cost of sales on 8 lines) should be flagged, not extrapolated.
- **Selling a loss-making unit raises almost nothing,** and its shared costs stay behind. Check the stranded-cost effect before recommending an exit.

### Process lessons
- The LLM council was worth it: it turned a portfolio list into a solvency story. All 5 reviewers agreed on the strongest critique (the Contrarian's).
- Build numbers in a model first and generate the deck from the model's JSON, so slides and model never drift.
- Look at every slide as an image. Text extraction does not show overflow or overlapping labels.
- Write plainly from the start. The first version of the deck was too dense and full of jargon; the user asked for it to be humanised.
- Python is not installed on this PC. Use Node (exceljs, hyperformula) and Edge for PDFs. Git's `pdftotext` reads PDFs.
- Scratch files get deleted between sessions; keep anything worth keeping inside the case folder.
