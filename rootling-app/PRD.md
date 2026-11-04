# Rootling: product requirements

*Little roots, big words.* Draft for the founder to review and correct.

## 1. Goal

Help children aged 3–10 in Indian families abroad speak their family's regional language, so that calls with grandparents become real conversations. Success means children saying real words and sentences to family, not more screen time (5–10 minutes a day).

## 2. Users

- **Parents (the customer and account owner):** first- or second-generation Indian families in the US, UK, Canada, Australia, Singapore and the Gulf. Often not fluent themselves. They sign up, give consent, add children, see progress and pay.
- **Children aged 3–10 (the learner):** under-6s can't read, so everything must work with pictures and sound. They never log in.
- **Grandparents and family (the audience):** the people children practise for. They are part of the content (Paati, Dadi, Ammamma…), not users.

## 3. What exists today

| Area | Status |
|---|---|
| Landing page with waitlist (email, language, country) | Built (Phase 1) |
| Courses | Tamil (launch), Telugu, Punjabi, Gujarati, Malayalam (preview) |
| Lessons | Picture, sound, match, read-the-word (6+), sentence building (6+) and "Tap and say it" with speech recognition |
| Personalisation | Child's name, chosen family member, favourite topics first, age-based exercises |
| Rooty | Grows a leaf per word learned |
| Bedtime stories | One per language, starring the child and their elder |
| Recorded audio | Plays `public/audio/<course>/<id>.mp3` when it exists, otherwise the device voice (Phase 2) |
| Native-speaker review sheet | `content/review.csv` (Phase 2) |
| Parent accounts | Sign-up with email confirmation, login, logout, password reset (Phase 3) |
| Families | Up to 4 children per parent, "Who's playing?" picker, cloud sync with offline support, import of pre-account progress (Phase 3) |
| Sprout plan | Stripe Checkout, $19/month, 30-day free trial once per family, Customer Portal, webhook (Phase 5) |
| Free plan | First unit of every language, all stories |
| Privacy and safety | Privacy policy and terms drafts, export and delete all data, self-hosted fonts, CSP, accessibility pass, 404 page, offline banner and service worker (Phase 6) |

Without Supabase keys the app runs in **device mode**: landing page, everything unlocked, progress saved on the device only, waitlist closed.

## 4. Data we store

| Table | Contents | Who can read it |
|---|---|---|
| `waitlist` | email, language, country, date | Nobody from the browser; dashboard only |
| `profiles` | parent id, consent date | That parent |
| `children` | first name, age, favourites, language, family member per language, romanised-text setting | That parent |
| `progress` | words learned, lessons and stories finished, seconds per day, streak, milestones | That parent |
| `subscriptions` | Stripe customer and subscription ids, status, trial and period end | That parent (read only); the server writes it |

Not stored: surnames, photos, birthdays, locations, voice, card details (Stripe holds those).

## 5. Privacy rules

1. Parent account and consent before any child details.
2. Data minimisation as above; the parent can export everything as JSON and delete everything (account deletion cancels Stripe immediately and removes their waitlist rows).
3. No ads, analytics or third-party requests on child screens. Analytics, if added, go on parent screens only, cookieless, with no child identifiers.
4. Legal review for COPPA (US) and the ICO Children's Code (UK) before real families sign up. Items marked "Lawyer to review" in the privacy policy and terms are not final.

## 6. Build phases

Matching `SETUP_AND_DEPLOY_GUIDE.md` Part 7:

- **Phase 0:** run locally, `.env.example`, README. ✅
- **Phase 1:** landing page and waitlist. ✅
- **Phase 2:** review sheet, recorded audio support, recording guide. ✅ (code) · ⏳ reviews and recordings
- **Phase 3:** parent accounts and cloud progress. ✅ (code) · ⏳ needs Supabase keys to test
- **Phase 4:** Telugu course (preview). ✅ (content) · ⏳ native-speaker review
- **Phase 5:** Stripe subscriptions. ✅ (code) · ⏳ needs Stripe test keys and a deployed URL for the webhook
- **Phase 6:** hardening and child safety. ✅ (code) · ⏳ legal review
- **Later:** personalised videos, Gujarati/Punjabi to launch quality, Malayalam/Bengali by waitlist demand, store apps via Capacitor.

## 7. Launch checklist

| Item | Status |
|---|---|
| Parent account and consent come before child details | ✅ automated (flow) |
| Only first name, age, language, family member and interests stored per child | ✅ schema |
| RLS on every table; parents see only their own family | ✅ tested against Postgres 16 with a Supabase-style auth shim. Re-check in your real project |
| Parents can export and delete all data | ✅ built · ⏳ test on your project |
| No third-party scripts, fonts or trackers on child screens | ✅ test + CSP + browser check (0 external requests) |
| No secret keys in the browser | ✅ only `VITE_` public keys are bundled |
| Privacy policy and consent reviewed by a lawyer (COPPA, Children's Code) | ⏳ manual |
| Every word, line and story reviewed by a native speaker per launch language | ⏳ manual (`content/review.csv`) |
| Recorded audio for all Tamil content (and Telugu before launch) | ⏳ manual (`content/RECORDING_GUIDE.md`) |
| Tested on Android Chrome, iPhone/iPad Safari, with a 4- and an 8-year-old profile | ⏳ manual |
| Full test: waitlist → sign up → add child → lesson → free trial → cancel in portal | ⏳ manual, needs keys |
| Domain on HTTPS, Stripe live mode, Vercel Pro and paid Supabase before charging | ⏳ manual |
