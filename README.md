# Skills installation

My Claude Code setup. Start a Claude Code cloud session on this repo and everything below loads automatically.

| What | Where | How it loads |
|---|---|---|
| Superpowers plugin (obra/superpowers) | `.claude/settings.json` | Plugin marketplace, enabled for this project |
| `setup-matt-pocock-skills` (mattpocock/skills) | `.claude/skills/` | Project skill, type `/setup-matt-pocock-skills` |
| Case competition kit | `.claude/skills/case-comp/` and `case-comp-kit/` | Project skill, type `/case-comp`; the startup hook runs `npm install` in `case-comp-kit/` |

New case folders are created in this repo's root. Commit and push them so they are kept.
