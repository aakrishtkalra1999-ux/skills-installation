# Deck build plan (Superpowers writing-plans, adapted for a deck)

**Goal:** `final/TeamName_BusinessTangent2026.pptx` and `.pdf` from one generator, every number read from `deck/model_data.json`.
**Approach:** pptxgenjs structured deck (theme, layouts, sections) in `deck/build_pptx.js`; the PDF is LibreOffice's conversion of that same .pptx, so the two can't differ.
**Spec:** `DECK-DESIGN.md` (approved, option A) and Part D of `final/Working_Draft_and_Final.md`.

## Global constraints
- 6 main slides; cover, thank you and appendix extra. Team details on the cover from `deck/team.json`.
- Zero em or en dashes. Plain Indian English. Abbreviations defined at first use and in the glossary.
- Safe fonts only (Arial). No accent lines under titles, no decorative stripes (pptx skill).
- Palette for the topic: forest green ink, maize gold for maize, leaf green for vegetables.

## Review focus (what could go wrong that the build alone won't show)
1. A slide number that differs from the model.
2. Text overflowing a box once LibreOffice renders it.
3. Team placeholders left in the final file.
4. A chart that PowerPoint refuses (validate.py catches it).
5. Maize vs vegetable colours used inconsistently.

## Tasks
- [x] 1. `deck/build_pptx.js`: theme, layouts, cover, slides 1 to 6, thank you, appendix A1 to A6. Writes the .pptx.
- [x] 2. `deck/verify_deck.js`: reads slide text via `slide_text.py`, checks key figures against the model and scans for dashes. Must print 0 mismatches.
- [x] 3. `validate.py` on the .pptx: must pass.
- [x] 4. Convert to PDF, render every slide to an image, inspect each, fix overflow and overlaps, rebuild.
- [ ] 5. Run `CHECKLIST.md` items that apply; commit and push.
