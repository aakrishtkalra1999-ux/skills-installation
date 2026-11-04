# Rules for working on Rootling

Rootling teaches children aged 3–10 in Indian families abroad their family's language. Read `PRD.md` and `SETUP_AND_DEPLOY_GUIDE.md` before starting a phase.

## Child safety and privacy (never break these)

- **Accounts belong to parents, never children.** Children never type an email or password. Parent consent (stored as `profiles.consent_at`) comes before any child details are entered.
- **Store only what personalisation needs:** first name, age, language, family member, favourite topics and learning progress. Never add surnames, photos, birthdays, locations, voice recordings or free text from children.
- **No ads, analytics or third-party scripts, styles or fonts on child screens.** Fonts are bundled via `@fontsource`. `vercel.json` sets a Content-Security-Policy; keep it strict. A test checks `index.html` for external URLs.
- **The microphone** is used only while the child taps "Say it". Nothing is recorded or sent anywhere by Rootling.
- **Every table has Row Level Security.** After any change to `supabase/schema.sql`, confirm a parent can only read and write their own family.
- **Secrets stay on the server.** Only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_SITE_URL` may use the `VITE_` prefix. Stripe keys and the Supabase service role key are used only in `api/`.
- **Payments are for parents only:** checkout and portal buttons live behind the grown-ups check, never on child screens.

## Content

- **Every word and line needs native-speaker review** before a course is marked `launch`. New courses start as `preview`.
- Lines avoid gendered verb forms so they work for any child. Use `{name}` (the child) and `{gp}` (the chosen family member) for personalisation.
- After editing `src/data/courses.ts`, run `npm run content:export` to refresh `content/review.csv` (a test fails if it is stale).
- Recordings go in `public/audio/<course>/<id>.mp3`; file names come from `content/review.csv`.

## Brand

- Colours: cream `#FBF6EC`, forest green `#1F3D2B` / `#3F7A45`, leaf `#5E9C5A`, terracotta `#B8492F`, mustard `#F2B441` (CSS variables in `src/styles.css`).
- Fonts: **Fraunces** for headings, **DM Sans** for body text, Noto Sans for each Indian script.
- Mascot: **Rooty**, the sprout in a pot who grows a leaf per word (`src/components/Rooty.tsx`).
- Play first, no penalties: no hearts or lives, and every lesson ends in success.
- Big touch targets (at least 44 px), works with screen readers, respects reduced motion.

## Checks before every commit

```bash
npm test          # content, lessons, personalisation, family sync, review sheet, Stripe mapping
npm run build     # type-checks the app and api/, then builds
```
