# Skills and tools used for case competitions

All of these are already installed on this PC. Ask for any of them by name in a new chat.

| Stage | Skill or tool | What it does | Notes |
|---|---|---|---|
| Find more skills | `find-skills` | Searches the skills.sh registry | Searches run with `npx skills find <words>` |
| Read the case | `anthropic-skills:case-study-analysis` | Objectives, facts, stakeholders, economics, options, trade-offs | Used for Armageddon |
| Similar cases and sector context | `reference/` casebook library + `tools/search-casebooks.js` | Over 300 solved cases, about 80 guesstimates, 35 sector primers, framework pages from IIMA, IIM Calcutta, FMS and ISB | Personal study copies: never share them or copy their content into submissions |
| Structure | `consulting-analysis` | Consulting framework, chapter skeleton, data needs | Not used yet; good for market or consumer cases |
| Market sizing | `market-sizing-analysis` | TAM, SAM, SOM top-down and bottom-up | Not used yet; good for growth or entry cases |
| Research | Web search + built-in browser | Benchmarks and sources | McKinsey pages: read in the browser, not by fetching |
| Deep research | `anthropic-skills:deep-research` | Multi-source research report via sub-agents | Costs several agent runs |
| Model | `anthropic-skills:xlsx` + `lib/model-kit.js` | Formula-driven Excel model | Python is not installed, so the kit uses Node |
| Charts | `dataviz` | Chart rules and a colour-blind palette checker | `node <dataviz>/scripts/validate_palette.js "#hex,#hex" --mode light` |
| Stress test | `anthropic-skills:llm-council` | 5 advisors, 5 peer reviews, 1 chairman | About 11 agent runs; say the cost first |
| Decide | `flow` | Your standard build workflow (brief, brainstorm, reality check, plan, review, build, humanise, learn) | Use for the whole competition as an M or L run |
| Design pick | `~/.claude/design-systems/` | 74 design notes; shortlist and wait for "approved" | Armageddon used a plain consulting style instead |
| Deck themes | `theme-factory` | 10 preset themes for slides or docs | Installed, not used yet |
| Deck as PDF | `lib/deck-kit.js` + Edge | HTML slides printed to PDF, per-slide PNG previews | Used for Armageddon |
| Deck as PowerPoint | `anthropic-skills:pptx` | Editable .pptx | Use if the team wants to edit slides by hand |
| Slides artifact | Artifact tool, Slides type | Shareable deck that downloads as .pptx or PDF | Not used yet |
| Fill a template | `pitch-deck` | Fills an existing PowerPoint template from data | Only useful if organisers give a template |
| Deck QC | `ib-check-deck` | Number consistency, story vs data, language, formatting | Its Python script will not run here; check numbers from the model JSON instead |
| Writing | `humaniser` | Plain, human Indian English with zero dashes | Final pass on everything a person reads |
| Explain | `wtf` | Re-explains the last message simply | Type /wtf |
| Hand over | `handoff` | Saves state so a fresh chat can continue | Use before stopping mid-way |
| PDF reading | Git's `pdftotext` (`C:\Program Files\Git\mingw64\bin\pdftotext.exe`) | Case PDF to text | Use `-raw` for tables |
| PDF work | `anthropic-skills:pdf` | Merge, split, extract | Needs Python for some steps |
| Word | `anthropic-skills:docx` | Word documents | For written-report rounds |
