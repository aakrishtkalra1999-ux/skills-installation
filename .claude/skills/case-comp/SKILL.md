---
name: case-comp
description: Start or work on a case competition (B-school strategy case, consulting case, IIM/ISB-style case comp) using the user's case-comp kit of resources, skills, model and deck builders. Use when the user says /case-comp, "use my case-comp kit", "new case comp", "case competition", or shares a case study PDF to solve.
---

# Case competition kit

The kit lives at `C:\Users\aryan\claude code\case-comp-kit\` on the Windows PC, and at `case-comp-kit/` in the root of the skills-installation repo in Claude Code cloud sessions (`$CLAUDE_PROJECT_DIR/case-comp-kit/`) (use whichever exists; on Linux use `/usr/bin/pdftotext` and Chromium at `/opt/pw-browsers/chromium`). It holds every resource used in past competitions and is meant for NEW cases.

## On start
1. Read `case-comp-kit/README.md`, `PLAYBOOK.md`, `SKILLS.md`, `LESSONS.md` and `FRAMEWORKS.md`. For similar cases, sector context or frameworks, use `reference/CASE-INDEX.md`, `reference/INDUSTRY-PRIMERS.md`, `reference/CASEBOOKS.md` and `node tools/search-casebooks.js "<words>"`. Read only the casebook pages you need (the Read tool with `pages`, or the `.txt` files).
2. Ask for the new case PDF and its rules if not given (slide limit, anonymity, file name, deadline, judging weights).
3. Show the "What you can pick" menu from the README and let the user choose. Do not run stages they did not pick. They can pick more items at any time.
4. For setup, run `node "<kit>/tools/new-case.js" <folder-name> <case.pdf>` and log rules and decisions in that folder's `DECISIONS.md` as they happen.

## Rules
- Follow the user's CLAUDE.md: plain Indian English, zero em or en dashes, explain simply, show proof (screenshots of slides, model checks).
- Build the model with `lib/model-kit.js` and the deck with `lib/deck-kit.js` (no Python on this PC). Start from `templates/`.
- Verify every benchmark on its original page before using it; reuse `BENCHMARKS.md` where it fits.
- Say the cost before running the LLM council or other multi-agent steps.
- The casebooks in `reference/casebooks/` are copyrighted personal study copies: learn approaches from them, never reproduce their text or share the files; verify any casebook number before it goes in a deliverable.
- Use `past-cases/` only as worked examples to copy patterns from; never mix their numbers into the new case.
- At the end, add the case to `past-cases/` and update `LESSONS.md` and `BENCHMARKS.md`.
