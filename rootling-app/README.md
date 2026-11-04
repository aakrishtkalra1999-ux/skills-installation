# Rootling: little roots, big words

The Rootling app: personalised lessons, stories and games that teach children aged 3–10 in Indian families abroad their family's regional language. It follows the Rootling landing page (claude.ai design canvas “Rootling Landing Page”).

| Language | Status | Content |
|---|---|---|
| Tamil (தமிழ்) | Launch language | 5 units, 8 lessons: family, breakfast, animals, colours, counting; 1 story |
| Punjabi (ਪੰਜਾਬੀ) | Preview | 3 units, 4 lessons; 1 story |
| Gujarati (ગુજરાતી) | Preview | 3 units, 4 lessons; 1 story |
| Malayalam (മലയാളം) | Preview | 3 units, 4 lessons; 1 story |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # content checks, lesson builder, personalisation, progress and milestones
npm run build    # static site in dist/, installable on phones as a PWA
```

## What's in it

- **Parent-led setup** (`src/components/Onboarding.tsx`): the parent agrees first, then picks the language and enters the child's first name and age. They also choose favourite things and the family member the child wants to talk to (Paati, Dadi, Nani, Baa, Ammamma…).
- **Personalised lessons** (`src/lib/lesson.ts`, `src/lib/personalise.ts`):
  - The child's name and chosen elder appear in scenes and lines.
  - Favourite topics move earlier on the path.
  - Under-6s only get picture and sound exercises; older children also read words and build sentences.
- **Play-first, no penalties**: there are no hearts or lives. A wrong picture fades away and the child tries again.
- **Tap and say it** (`Say` in `src/components/LessonPlayer.tsx`):
  - A video-call scene such as "Aarav, Paati is on a video call! Can you say hello?".
  - The microphone uses the browser's speech recognition and accepts any clear try, without grading pronunciation. Nothing is recorded.
  - There is an "I said it!" button for devices with no microphone support.
- **Rooty** (`src/components/Rooty.tsx`): an original sprout-in-a-pot character that grows a leaf for every word learned.
- **Bedtime stories** (`src/components/Stories.tsx`): short read-aloud stories starring the child and their elder.
- **Parents area** behind a grown-ups check (`src/components/Parents.tsx`):
  - words learned, minutes this week and day streak
  - milestones such as "Said hello to Paati" and "Said a first sentence to Paati"
  - words to practise at home
  - settings, and deleting the child's data
- **Privacy**: everything is stored on the device (`localStorage`). There are no ads and no accounts yet.

## Adding content

Add words to a course in `src/data/courses.ts` and list their ids in a lesson. Write `{gp}` (the chosen family member) and `{name}` (the child) in say-it lines and stories. `npm test` checks that every lesson builds for young and older children and that no placeholder is left unfilled.

**Every word and line needs review by a native speaker before launch.** Lines avoid gendered verb forms so they work for any child.

## Not built yet (from the landing page)

- **Personalised videos** need a video pipeline (e.g. templated animation with recorded native-speaker audio).
- **Recorded audio**: the app currently uses the device's text-to-speech, which is missing on some devices for these languages.
- **Weekly new content**, adaptive difficulty beyond the age switch, and accounts with cloud sync.
- **The $19/month Sprout plan**: needs a subscription flow (App Store / Play billing).
- **Store apps**: wrap with Capacitor for the Play Store and App Store.
