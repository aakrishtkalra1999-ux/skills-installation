# Rootling: little roots, big words

Personalised lessons, stories and games that teach children aged 3–10 in Indian families abroad their family's regional language. Accounts belong to parents; children just play.

| Language | Status | Content |
|---|---|---|
| Tamil (தமிழ்) | Launch language | 5 units, 8 lessons, 1 story |
| Telugu (తెలుగు) | Preview (awaiting native-speaker review) | 5 units, 8 lessons, 1 story |
| Punjabi (ਪੰਜਾਬੀ) | Preview | 3 units, 4 lessons, 1 story |
| Gujarati (ગુજરાતી) | Preview | 3 units, 4 lessons, 1 story |
| Malayalam (മലയാളം) | Preview | 3 units, 4 lessons, 1 story |

Step-by-step setup for non-coders: **[SETUP_AND_DEPLOY_GUIDE.md](SETUP_AND_DEPLOY_GUIDE.md)**. Product spec: [PRD.md](PRD.md). Rules for Claude Code: [CLAUDE.md](CLAUDE.md).

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add Supabase keys to switch on accounts
npm run dev                  # http://localhost:5173
npm test                     # content, lessons, family sync, review sheet, Stripe mapping
npm run build                # type-checks app + api/, builds the static site into dist/
```

### Two modes

- **Device mode (no keys in `.env.local`):** landing page → set up a child → play. Everything is unlocked and saved on the device. The waitlist says it isn't open yet.
- **Account mode (Supabase keys set):** landing page with waitlist → parent sign-up (email confirmed) → consent → add up to 4 children → play. Progress syncs to Supabase and works offline. The free plan opens the first unit of each language; the Sprout plan (Stripe) opens everything.

The Stripe functions in `api/` run on Vercel. To try them locally, install the Vercel CLI and run `vercel dev` instead of `npm run dev`.

## Environment variables

| Name | Where | What |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` + Vercel | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Supabase anon / publishable key (public; RLS protects data) |
| `VITE_SITE_URL` | `.env.local` + Vercel | Your site address |
| `STRIPE_SECRET_KEY` | Vercel (server only) | `sk_test_…` / `sk_live_…` |
| `STRIPE_PRICE_ID` | Vercel (server only) | The $19/month Sprout price, `price_…` |
| `STRIPE_WEBHOOK_SECRET` | Vercel (server only) | `whsec_…` from the webhook endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server only) | For the webhook and account deletion. Never in browser code |

## Where things are

| Path | What |
|---|---|
| `src/components/Landing.tsx` | Landing page: hero, how it works, Rooty, languages, pricing, promise, FAQ, waitlist |
| `src/components/Auth.tsx` | Parent sign-up, login, forgot and reset password |
| `src/components/Family.tsx` | Parent consent, "Who's playing?", import of pre-account progress |
| `src/components/Account.tsx` | Parents area: family, plan (checkout / portal), export data, delete account, log out |
| `src/components/Legal.tsx` | Privacy policy and terms (drafts, lawyer to review), 404, offline banner |
| `src/components/LessonPlayer.tsx`, `Home.tsx`, `Stories.tsx`, `Parents.tsx`, `Rooty.tsx` | The child's app |
| `src/data/courses.ts` | All course content |
| `src/lib/family.ts` | Up to 4 children per family, offline-first storage, merging two devices' progress |
| `src/lib/cloud.ts` | Supabase reads and writes, plan status, data export |
| `src/lib/clips.ts`, `src/lib/speech.ts` | Recorded audio with device-voice fallback; the review sheet |
| `api/` | Vercel functions: Stripe Checkout, Customer Portal, webhook, account deletion |
| `supabase/schema.sql` | Tables and Row Level Security. Paste into Supabase → SQL Editor → Run |
| `content/review.csv` | Every word and line for native-speaker review and recording (`npm run content:export`) |
| `content/RECORDING_GUIDE.md` | Instructions for voice artists |
| `public/audio/<course>/<id>.mp3` | Native-speaker recordings (picked up automatically) |
| `vercel.json` | SPA routing and security headers (strict Content-Security-Policy) |

## Content rules

Add words in `src/data/courses.ts` and list their ids in a lesson. Use `{gp}` (the chosen family member) and `{name}` (the child) in say-it lines and stories. After editing, run `npm run content:export`. **Every word and line needs native-speaker review before a course is marked `launch`.** Lines avoid gendered verb forms so they work for any child.

## Privacy by design

- Per child, only a first name, age, language, family member, favourites and progress are stored.
- No ads, analytics or third-party requests on any screen; fonts are bundled. Verified in a headless browser: 0 external requests.
- The microphone is only used while the child taps "Say it", and nothing is recorded.
- Parents can download all their family's data and delete everything from the parents area.

## Not built yet

- **Personalised videos** (needs its own planning session).
- **Store apps:** wrap with Capacitor; check App Store / Play rules for in-app subscriptions.
- **Analytics for parent screens** (guide Part 10.3) and "Continue with Google" (Part 10.1).
