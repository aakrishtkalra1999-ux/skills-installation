# Rootling: Step-by-Step Build & Launch Guide (for first-time builders)

This guide takes you from "Rootling prototype in GitHub" to "live app on my own domain, with a waitlist, parent accounts and paid plans". No coding knowledge needed: Claude Code writes the code, you follow the clicks.

**Where you are today:** the Rootling app already exists in `rootling-app/` (Tamil launch course, Punjabi/Gujarati/Malayalam previews, Rooty, stories, parents area). It saves progress only on the device and has no logins or payments yet.

**Time needed:** about half a day for the first deploy (Parts 1–4 and 8), then 1–2 evenings per build phase.
**Cost:** ₹0 / $0 to start on the free tiers of GitHub, Vercel and Supabase. You also need a paid Claude plan for Claude Code, and a domain. Payments (Stripe) cost nothing until you take money; Stripe then charges a fee per transaction.

---

## The big picture (read once)

```
 You ──► Claude Code ──writes code──► rootling-app (project folder)
                                          │  push (GitHub Desktop, or Claude Code on the web)
                                          ▼
                                       GitHub (stores code)
                                          │  auto-deploy on every push
                                          ▼
                                        Vercel (runs the app) ──► yourdomain.com
                                          │
                  ┌───────────────────────┼────────────────────────┐
                  ▼                       ▼                        ▼
   Supabase (parent logins,       Audio files (native-       Stripe ($19/month
   waitlist, child progress)      speaker recordings)        Sprout plan)
```

- **GitHub** stores your code and its history.
- **Vercel** puts the app online. Every time you push to GitHub, it updates the live site in about a minute.
- **Supabase** handles parent sign-up and login, the waitlist, and saving each child's progress so it works across phones and tablets.
- **Audio files** are recordings of native speakers saying each word and line. They replace the phone's built-in voices, which are missing for Tamil, Telugu, Gujarati or Malayalam on many devices.
- **Stripe** takes the monthly subscription payments.
- **Environment variables (env vars)** are secret settings, such as API keys, kept *outside* the code. You put them in a file called `.env.local` on your computer and in Vercel's settings online.

### What is different from a normal app: Rootling is for children

Rootling's users are children aged 3–10, so a few rules apply from day one:

- **Accounts belong to parents, never children.** A child never types an email or password. The parent signs up, then adds a child profile (first name, age, family member, favourites).
- **Collect only what personalisation needs:** a first name, age, language and interests. No surnames, photos, birthdays or locations.
- **US law (COPPA)** requires verifiable parental consent before collecting personal information from children under 13. **UK law (the ICO's Children's Code)** sets similar design standards. Before you take real families' data, have a lawyer or a COPPA-compliance service review your consent flow and privacy policy. This guide gets you technically ready; it is not legal advice.
- **No ads and no third-party trackers in the child's part of the app.** That is also a promise on your landing page.

---

## Part 0: If someone else is helping you build this

These accounts should all belong to **you, the owner**. A helper should never need your passwords.

| Service | How a helper gets access safely |
|---|---|
| GitHub | Repo → **Settings → Collaborators → Add people** → enter the helper's GitHub username |
| Vercel | The free Hobby plan is for one person. Easiest: **you** click through Part 8 while the helper guides you on a screen-share |
| Supabase | Organization → **Team → Invite** (the helper's email), or you do the steps on a screen-share |
| Stripe | **Settings → Team → Invite member** with a limited role (e.g. Developer). Never share your login |
| Domain registrar | You log in and add the DNS records from Part 9; the helper reads them out to you |
| Native-speaker reviewers | Share audio scripts and content as a Google Sheet or doc, not repo access |

If a key is ever pasted into a chat or committed to GitHub, delete it and create a new one (Part 10 shows how).

---

## Part 1: Create accounts (20 min)

Use the **same email** everywhere to keep things simple.

1. **GitHub**: https://github.com/signup (you already have one: `aakrishtkalra1999-ux`).
2. **Vercel**: https://vercel.com/signup → **Continue with GitHub** → pick the **Hobby** plan for now.
3. **Supabase**: https://supabase.com → **Start your project** → **Continue with GitHub**.
4. **Stripe**: https://dashboard.stripe.com/register. You can build and test everything in **test mode** before the business details are complete.
5. **Claude**: a paid plan (Pro or Max) is needed for Claude Code. https://claude.com/pricing
6. **Domain registrar**: make sure you can log in to wherever you bought (or will buy) your Rootling domain.

---

## Part 2: Install the tools (20 min)

Install these on your computer, in this order:

1. **Node.js (LTS version)**: https://nodejs.org → download the **LTS** button → install with defaults. Rootling uses Vite, which needs a recent Node; the LTS download covers that.
2. **Git**: https://git-scm.com/downloads → install with defaults (Windows: keep "Git from the command line and also from 3rd-party software" ticked).
3. **GitHub Desktop**: https://desktop.github.com → install → sign in with your GitHub account. This gives you a "Push" button so you never need git commands.
4. **Claude desktop app**: https://claude.ai/download → install → sign in → click the **Code** tab.
5. **VS Code** (optional, to peek at files): https://code.visualstudio.com

**Check it worked:** open Terminal (Mac: Spotlight → "Terminal"; Windows: Start → "PowerShell") and paste:
```bash
node -v
git --version
```
You should see version numbers (e.g. `v22.x.x`). If you see "command not found", restart the computer and try again.

> **No-install alternative (what you have been using so far):** Claude Code also runs in the browser at https://claude.ai/code, working directly on your GitHub repo. You skip local testing and check each change on Vercel preview links instead. The desktop route is easier to learn on because you can see the app on your own machine instantly.

---

## Part 3: Gather your Rootling design and content (15 min)

Unlike a brand-new project, Rootling already has a design and working code. Collect what Claude Code should treat as the source of truth:

1. **Landing page design**: your "Rootling Landing Page" canvas on claude.ai. Take a full-page screenshot and save it as `01-landing.png`. If the canvas's **Share** menu offers an export, download that too.
2. **App screenshots**: run the app (Part 7, Phase 0) and screenshot onboarding, the lesson path, a lesson, "Tap and say it", a story and the parents area. Name them `02-onboarding.png`, `03-path.png`, and so on.
3. **Language research**: save the language prioritisation and roadmap from your Claude chat as `docs/LANGUAGE_ROADMAP.md`. The recommended order is Tamil + Telugu, then Gujarati + Punjabi, then Malayalam and/or Bengali, decided by waitlist data.
4. **Brand basics** (already in the app; keep them consistent):
   - Colours: cream `#FBF6EC`, forest green `#1F3D2B` / `#3F7A45`, leaf `#5E9C5A`, terracotta `#B8492F`, mustard `#F2B441`.
   - Fonts: **Fraunces** for headings, **DM Sans** for body text.
   - Mascot: **Rooty**, the sprout in a pot that grows a leaf per word.

---

## Part 4: Set up the project folder & GitHub repository (15 min)

Rootling's code currently lives inside your `skills-installation` repo, in the `rootling-app/` folder. You have two options:

- **Option A (recommended): give Rootling its own repository.** It is cleaner for Vercel, collaborators and investors. Ask Claude Code: *"Move rootling-app into a new private GitHub repository called rootling, keeping its files, and tell me what to click."*
- **Option B: leave it where it is.** Vercel can deploy a sub-folder: in Part 8 you set **Root Directory** to `rootling-app`.

Then add the planning files Claude Code reads before every phase:

```
rootling/
├─ PRD.md                      ← what Rootling must do (ask Claude Code to draft it, see below)
├─ CLAUDE.md                   ← rules for Claude Code (child safety, brand, content review)
├─ SETUP_AND_DEPLOY_GUIDE.md   ← this file
├─ docs/LANGUAGE_ROADMAP.md    ← from Part 3
└─ design/                     ← screenshots from Part 3
```

To create the two planning files, send Claude Code:
```
Draft PRD.md for Rootling from the landing page screenshot in design/, the
existing app in this repo and docs/LANGUAGE_ROADMAP.md: goals, users (parents
and children 3–10), features, data we store, privacy rules, and build phases
matching SETUP_AND_DEPLOY_GUIDE.md Part 7. Also draft CLAUDE.md with rules:
parents own accounts, never store more child data than needed, no ads or
trackers in child screens, every word and line needs native-speaker review,
keep the Rootling palette and fonts. Show me both before saving.
```

Read both files, correct anything that is wrong, then commit and push in **GitHub Desktop**.

---

## Part 5: Set up Supabase (parent logins, waitlist, progress) (25 min)

### 5.1 Create the project
1. https://supabase.com/dashboard → **New project**.
2. Name: `rootling`. Database password: click **Generate** and save it in a password manager.
3. Region: closest to your first families. For a **US-first launch**, pick a US region (e.g. East US). If you launch in the UK first, pick a UK or EU region. → **Create new project**. Wait about 2 minutes.

### 5.2 Create the tables
You will not write SQL yourself. In Phase 1 (Part 7) Claude Code writes it into `supabase/schema.sql`. Then:
1. Left menu → **SQL Editor** → **New query**.
2. Paste the contents of `supabase/schema.sql` → **Run**. You should see "Success. No rows returned".
3. Left menu → **Table Editor**: you should see tables such as `waitlist`, `profiles` (parents), `children` and `progress`.

Every table must have **Row Level Security (RLS) switched on**, so a parent can only ever see their own children. Ask Claude Code to confirm this after each schema change.

### 5.3 Copy your keys
Left menu → **Project Settings** (gear) → **API** (or **API Keys** / **Data API**):
- **Project URL**: this is `VITE_SUPABASE_URL`.
- **anon / publishable key**: this is `VITE_SUPABASE_ANON_KEY`. It is public by design; RLS protects the data.
- **service_role / secret key**: needed **only** for the payment webhook in Phase 5. It goes in Vercel's settings as `SUPABASE_SERVICE_ROLE_KEY`, never in browser code and never in `.env.local` until that phase.

### 5.4 Auth settings
1. Left menu → **Authentication → Sign In / Providers** → make sure **Email** is enabled.
2. Keep **"Confirm email" ON** for Rootling. Confirming the parent's email is part of proving that a real adult created the account. Supabase's built-in sender only allows a few emails per hour, so for testing use a few test inboxes, and before launch connect a proper email sender (e.g. Resend) via **Authentication → SMTP Settings**.
3. **Authentication → URL Configuration:**
   - Site URL: `http://localhost:5173` (you'll change this to your domain in Part 9)
   - Redirect URLs → **Add URL**:
     ```
     http://localhost:5173/**
     ```
     (You'll add the Vercel and domain URLs later.)

---

## Part 6: Set up Stripe for the Sprout plan (15 min, can wait until Phase 5)

1. Stripe dashboard → make sure **Test mode** is switched on (top right).
2. **Product catalogue → Add product** → Name: `Rootling Sprout` → **Recurring**, **$19.00 USD / month** → Save. Copy the **Price ID** (starts with `price_…`). This is `STRIPE_PRICE_ID`.
3. Your landing page promises a **free first month**: Claude Code adds this as a 30-day trial in the checkout code. You don't need to set it on the product.
4. **Developers → API keys**: copy the **Secret key** (`sk_test_…`). This is `STRIPE_SECRET_KEY`. It goes in `.env.local` and Vercel only, never in browser code.
5. The webhook secret (`STRIPE_WEBHOOK_SECRET`) comes later, in Part 8 step 7, once the app has a live URL.

> **Selling inside the App Store or Google Play later?** Apple and Google have their own rules for digital subscriptions bought inside apps. Stripe on the website is the simplest start; check the store rules before you wrap Rootling as a store app.

---

## Part 7: Build with Claude Code, phase by phase

### 7.1 Open the project
1. Claude desktop app → **Code** tab → open your Rootling folder (or open the repo at https://claude.ai/code).
2. First message (copy-paste):
   ```
   Read CLAUDE.md, PRD.md, docs/LANGUAGE_ROADMAP.md and README.md fully, look
   at every file in design/, and skim the code in src/. Then summarise in 10
   bullets what already exists and what we're going to build, list any
   questions or contradictions between the PRD, the landing page and the app,
   and wait for my go-ahead before writing any code.
   ```
3. Answer its questions. Then run the phases below, **one per session**.

### 7.2 Create your `.env.local` (secret settings file)
Before Phase 1, send this to Claude Code:
```
Create a .env.local file in the project root with these variables and empty
values, confirm .env.local is in .gitignore, then tell me how to open it so I
can paste my keys in myself:
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SITE_URL=http://localhost:5173
```
Open the file (in VS Code or any text editor) and paste your values after the `=` signs, with no quotes and no spaces:
```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx
VITE_SITE_URL=http://localhost:5173
```
Save the file. **Paste keys yourself; don't paste them into the Claude chat.**

> Anything starting with `VITE_` is visible in the browser, which is fine for these three. Secret keys (Stripe, Supabase service role) **never** get the `VITE_` prefix; they are added in Phase 5 for server code only.

### 7.3 Phase prompts (copy-paste one at a time)

**Phase 0: Run what you have**
```
Do Phase 0: install dependencies for the existing Rootling app, run the tests
and the build, start the dev server and tell me the exact address to open.
Don't change any features. Add a .env.example and make sure README.md
explains how to run it.
```
✅ Check: open http://localhost:5173 → set up a test child → finish the first Tamil lesson, a story and the parents area.
💾 Then in **GitHub Desktop**: write a summary like "Phase 0: running locally" → **Commit** → **Push origin**.
🚀 Optional but motivating: do **Part 8** now, so you have a live link to show people.

**Phase 1: Landing page + waitlist**
```
Do Phase 1: build the Rootling landing page as the app's home for visitors
who aren't signed in, matching design/01-landing.png (hero, how it works,
Rooty, languages, pricing, FAQ). Make the waitlist form save email,
language wanted and country to a Supabase "waitlist" table. Write the SQL in
supabase/schema.sql with RLS so anyone can add themselves but nobody can read
the list from the browser. Add Telugu to the language options. Then tell me
how to run the SQL and where to see new sign-ups in Supabase.
```
✅ Join the waitlist with a test email → check **Supabase → Table Editor → waitlist**. Commit + push.
📊 From now on, waitlist counts per language are your best evidence for which language to build next.

**Phase 2: Native-speaker content & recorded audio**
```
Do Phase 2: export every word, say-it line and story line for all courses
into content/review.csv (language, id, script, romanised, English, where
used) so native speakers can review it. Add support for recorded audio:
the app should play public/audio/<language>/<id>.mp3 when the file exists
and fall back to the device voice when it doesn't. Write
content/RECORDING_GUIDE.md telling a voice artist exactly which files to
record and how to name them.
```
✅ Send `review.csv` to a native-speaker reviewer for each language. Ask Claude Code to apply their corrections. Record Tamil first. Commit + push.

**Phase 3: Parent accounts & cloud progress**
```
Do Phase 3: add parent sign-up (with email confirmation), login, logout and
forgot-password using Supabase Auth. Move the consent step so a parent
account is created before any child details are entered. Let a parent add
up to 4 child profiles and pick which child is playing. Save each child's
progress to Supabase (with RLS so parents only see their own children) and
keep the app working offline, syncing when back online. Keep the existing
on-device progress for anyone who already used the app by offering to
import it after sign-up. Tell me exactly how to test it on two devices.
```
✅ Sign up → add two children → play a lesson on your laptop → log in on your phone → progress is there. Commit + push.

**Phase 4: Telugu course**
```
Do Phase 4: add a Telugu course following the existing Tamil structure:
family (with the elders Telugu families use), food, animals, colours,
numbers, say-it lines and one bedtime story, with romanised spellings and
English meanings. Mark it "preview" until native-speaker review is done,
add its rows to content/review.csv, and make sure all tests pass.
```
✅ A Telugu-speaking reviewer checks every line before you mark it "launch". Commit + push.

**Phase 5: Subscriptions (Stripe)**
```
Do Phase 5: add the Rootling Sprout plan with Stripe Checkout using
STRIPE_SECRET_KEY and STRIPE_PRICE_ID, a 30-day free trial, and the Stripe
Customer Portal for cancelling. Server code must run in Vercel functions
(api/ folder), never in the browser. Add a Stripe webhook handler that
records each parent's subscription status in Supabase using
SUPABASE_SERVICE_ROLE_KEY. Free accounts keep the first unit of each
language; the rest needs an active trial or subscription. Then walk me
through a full test with Stripe's test card.
```
Add the new keys to `.env.local` yourself (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `SUPABASE_SERVICE_ROLE_KEY`, and later `STRIPE_WEBHOOK_SECRET`).
✅ Test card `4242 4242 4242 4242`, any future date, any CVC → the account shows as on trial in the parents area. Commit + push.

**Phase 6: Hardening & child safety**
```
Do Phase 6: a privacy policy and terms page written for parents (mark
anything needing a lawyer's review), a way for parents to export and delete
all their family's data, a check that no third-party scripts load on child
screens, accessibility pass (screen readers, big touch targets, reduced
motion), page titles and meta tags, favicon, app icon, a 404 page and an
offline message. Then go through PRD.md's launch checklist and tell me
which items pass and which I must check manually.
```

After every phase: **test → commit → push**. Small, frequent pushes make mistakes easy to undo.

**Later phases** (once the above is live and families are using it):
- **Personalised videos**: the landing page's biggest promise. Needs its own planning session (templated animation plus recorded native audio). Ask Claude Code for options and costs before building.
- **Gujarati and Punjabi to "launch" quality**, then Malayalam and/or Bengali, in the order your waitlist data supports.
- **Store apps**: wrap the web app with Capacitor for Google Play and the App Store (see the note in Part 6 about in-app payments).

---

## Part 8: Deploy to Vercel (15 min)

1. https://vercel.com/new → under **Import Git Repository**, find your Rootling repo → **Import**.
   (If you don't see it: **Adjust GitHub App Permissions** → allow access to the repo.)
2. Framework Preset should auto-detect **Vite**. Leave the Build and Output settings as default.
   **If you chose Option B in Part 4**, set **Root Directory** to `rootling-app`.
3. Open **Environment Variables** and add each one (Name + Value), the same as your `.env.local`, **except**:
   - `VITE_SITE_URL` = `https://yourdomain.com` (your real domain)
   - From Phase 5 on, also add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_WEBHOOK_SECRET`.
4. Click **Deploy**. Wait 1–3 minutes → you get a URL like `https://rootling-xyz.vercel.app`.
5. **Tell Supabase about the new URLs:** Supabase → **Authentication → URL Configuration → Redirect URLs** → add:
   ```
   https://rootling-xyz.vercel.app/**
   https://*-YOUR-VERCEL-TEAM-SLUG.vercel.app/**
   ```
   (The second line lets preview deployments log in. Your team slug is in your Vercel URL, e.g. `vercel.com/YOUR-SLUG`.)
6. Open the `.vercel.app` URL on your phone, set up a child and play a lesson. If it works, you're live (on a temporary address).
7. **Stripe webhook (from Phase 5):** Stripe → **Developers → Webhooks → Add endpoint** → URL `https://yourdomain.com/api/stripe-webhook` (Claude Code will confirm the exact path) → select the subscription and checkout events Claude Code lists → copy the **Signing secret** (`whsec_…`) into Vercel as `STRIPE_WEBHOOK_SECRET` → Redeploy.

**Important:** if you change an env var in Vercel later, go to **Deployments → ⋯ on the latest → Redeploy** for the change to take effect.

From now on, **every push to `main` auto-deploys.** Pushes to other branches create preview links, so you can test before going live.

**Before you charge money:** Vercel's free Hobby plan is for personal, non-commercial projects. Switch the Rootling project to **Vercel Pro** before you turn on live payments.

---

## Part 9: Connect your domain (15 min + waiting)

### 9.1 Add the domain in Vercel
1. Vercel → your Rootling project → **Settings → Domains** → **Add Domain**.
2. Type `yourdomain.com` → **Add**. When asked, choose the recommended option: add `www.yourdomain.com` too, and **redirect** one to the other. Either direction is fine; just be consistent.
3. Vercel now shows "Invalid Configuration" with the **exact DNS records** to add. Keep this tab open.

### 9.2 Add DNS records at your registrar
Log in to your registrar → find **DNS / Manage DNS / DNS Zone** for the domain. Add:

| Type | Name / Host | Value / Points to | TTL |
|---|---|---|---|
| **A** | `@` | The IP shown on your Vercel domain card | Default / 1 hour |
| **CNAME** | `www` | The target shown on your Vercel domain card | Default |

**Always copy the values from your own Vercel screen.** Vercel checks for the exact values it displays.

**Before saving, delete conflicting records:**
- Any other **A** record for `@` (e.g. a "Parked" record).
- Any **AAAA** record for `@`.
- Any existing **CNAME** for `www` pointing elsewhere.
- Leave **MX** (email) and **TXT** records alone. You will want email at your domain (e.g. hello@yourdomain.com) for parents to contact you.

Registrar tips:
- **GoDaddy:** Domain → **DNS** → edit the existing `@` A record instead of adding a second one.
- **Hostinger:** Domains → Manage → **DNS / Nameservers** → delete the default A/CNAME records first.
- **Namecheap:** Domain List → Manage → **Advanced DNS**; use `@` for the root and `www` for the CNAME.
- **Cloudflare:** set the records to **DNS only** (grey cloud), not proxied.

### 9.3 Wait and verify
- DNS usually updates in 5–60 minutes (occasionally up to 48 hours). The Vercel Domains page turns **green ✓ Valid Configuration**, and the **SSL certificate (padlock) is created automatically**.
- If it stays stuck after you're sure the records match, remove the domain from Vercel and add it again.
- Check propagation at https://dnschecker.org → enter your domain → type A.

### 9.4 Final settings for the domain
1. **Supabase → Authentication → URL Configuration:**
   - Site URL: `https://www.yourdomain.com`
   - Redirect URLs: add `https://yourdomain.com/**` and `https://www.yourdomain.com/**`
2. **Vercel → Settings → Environment Variables:** confirm `VITE_SITE_URL` = `https://www.yourdomain.com` → Redeploy.
3. **Stripe:** update the webhook URL to your real domain (Part 8 step 7).
4. Open `https://yourdomain.com` → it should redirect to `https://www.yourdomain.com` with a padlock. Do a full test: join waitlist → sign up → add a child → play a lesson → start the free trial.

---

## Part 10: Optional extras

### 10.1 "Continue with Google" sign-in for parents
Ask Claude Code:
```
Add "Continue with Google" for parents via Supabase Auth on login and signup,
with the /auth/callback route. Then give me numbered steps for Google Cloud
Console (OAuth consent screen, OAuth client ID, authorised redirect URI) and
Supabase (Authentication → Providers → Google) using my Supabase project URL.
```
The redirect URI to paste in Google Cloud is `https://YOUR-PROJECT.supabase.co/auth/v1/callback`. Children never see this screen; it is only for the parent.

### 10.2 Rotate a leaked key
- **Stripe secret key:** Stripe → **Developers → API keys** → roll the key → update `.env.local` and Vercel → Redeploy.
- **Supabase anon key** is public by design; RLS protects the data. If you ever leak the **service_role / secret key**, regenerate it in Supabase settings at once and update Vercel.

### 10.3 Analytics (parents' screens only)
Measure the things that matter (waitlist sign-ups per language, trial starts, lessons finished per week) without tracking children. Ask Claude Code:
```
Add privacy-friendly analytics that counts page views and these events:
waitlist_joined (language), signup, child_added, lesson_completed,
trial_started. No cookies, no personal data, and nothing that identifies a
child. Recommend a tool that suits a children's app and explain why.
```

### 10.4 Install on phones today (no app store needed)
Rootling is already a web app that can be installed. On Android (Chrome): open the site → **⋮ → Add to Home screen**. On iPhone (Safari): **Share → Add to Home Screen**. It then opens full-screen like an app.

---

## Part 11: Troubleshooting

| Problem | Fix |
|---|---|
| `npm: command not found` | Node.js isn't installed, or the terminal was open before you installed it. Restart the computer. |
| Site works locally but not on Vercel | An env var is missing or misspelled in Vercel, or Root Directory isn't set (Option B). Check names match exactly → Redeploy. |
| Vercel build fails | Vercel → Deployments → click the failed one → **Build Logs** → copy the red error → paste it to Claude Code: "Vercel build failed with this error: …" |
| Login works locally, fails on the live site | Add the live URL to Supabase **Redirect URLs** (Part 8.5 / 9.4). |
| Parent never gets the confirmation email | Supabase's built-in sender is rate-limited. Wait, check spam, or connect a proper sender (Part 5.4). |
| No sound for words | The device has no voice for that language and no recording exists yet. Record audio (Phase 2). |
| "Say it" mic button missing | The browser has no speech recognition (common on iPhone and Firefox). Children can still tap "I said it!". |
| Payment succeeds but the account isn't upgraded | The Stripe webhook isn't reaching the app: check the webhook URL, `STRIPE_WEBHOOK_SECRET` in Vercel, then Redeploy. Stripe → Webhooks shows each attempt and its error. |
| Supabase app suddenly not loading data | Free projects pause after a period of inactivity: Supabase dashboard → **Restore project**. Upgrade before launch. |
| Claude Code made a change you don't like | Tell it "undo the last change", or in GitHub Desktop → **History** → right-click the commit → **Revert**. |

---

## Part 12: Launch checklist

**Product**
- [ ] Phases 0–6 done and pushed
- [ ] Every word, line and story reviewed by a native speaker for each "launch" language
- [ ] Recorded audio for every Tamil word, line and story (and Telugu before it leaves preview)
- [ ] Tested on a phone and a tablet (Chrome on Android, Safari on iPhone/iPad), with a 4-year-old and an 8-year-old profile

**Child safety & privacy**
- [ ] Parent account and consent come before any child details
- [ ] Only first name, age, language, family member and interests are stored per child
- [ ] Parents can export and delete all their data
- [ ] Privacy policy and consent flow reviewed by a lawyer for COPPA (US) and the Children's Code (UK)
- [ ] No ads and no third-party trackers on child screens
- [ ] No secret keys visible in browser DevTools

**Business**
- [ ] `https://yourdomain.com` and `https://www.yourdomain.com` both load with a padlock
- [ ] Full test passes: waitlist → sign up → add child → lesson → free trial → cancel in the Customer Portal
- [ ] Stripe switched from test mode to live mode, with business details complete
- [ ] Vercel project on **Pro** and Supabase on a paid plan (no pausing) before taking money
- [ ] Shared with 10 founding families and collected feedback

**Plan limits to know:** Vercel Hobby is for non-commercial use, so move to Pro before charging. Supabase's free tier pauses inactive projects and has small limits; it is fine for testing, but upgrade before launch. Stripe has no monthly fee, only a fee per payment.
