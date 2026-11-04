# Language roadmap

> Placeholder: replace this file with the full language prioritisation research from your Claude chat (SETUP_AND_DEPLOY_GUIDE.md Part 3). The order below is the one that research recommended.

| Order | Language | Status in the app | What moves it forward |
|---|---|---|---|
| 1 | Tamil | **Launch**: 5 units, 8 lessons, 1 story | Native-speaker review signed off, all audio recorded |
| 1 | Telugu | Preview: 5 units, 8 lessons, 1 story (Phase 4) | Native-speaker review, then recordings, then mark `launch` |
| 2 | Gujarati | Preview: 3 units, 4 lessons | Waitlist demand, more units, review and recordings |
| 2 | Punjabi | Preview: 3 units, 4 lessons | Waitlist demand, more units, review and recordings |
| 3 | Malayalam | Preview: 3 units, 4 lessons | Waitlist demand |
| 3 | Bengali | Not started (on the waitlist form) | Waitlist demand |

**How to decide what's next:** in Supabase → SQL Editor, run

```sql
select language, count(*) from waitlist group by language order by count(*) desc;
```

and build the most-requested language first.
