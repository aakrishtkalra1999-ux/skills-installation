# Boli: learn Indian languages

A bite-sized language-learning app for the Indian diaspora: kids and adults who grew up outside India and want to talk with family, read the script and stay connected to their culture.

Courses: **Hindi**, **Punjabi (Gurmukhi)** and **Tamil**. Each has greetings, family, food and a script-reading unit.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # lesson engine, progress logic and course-data checks
npm run build    # static site in dist/, installable as a PWA on phones
```

## How it works

| Feature | Where |
|---|---|
| Onboarding: pick language, reason, daily goal | `src/components/Onboarding.tsx` |
| Winding lesson path with units, locked/unlocked/done nodes | `src/components/Home.tsx` |
| Exercises: picture choice, reverse choice, listening, match pairs, sentence tiles | `src/components/LessonPlayer.tsx` |
| Lesson generator (missed questions come back at the end) | `src/lib/lesson.ts` |
| XP, daily goal, streaks, 5 hearts that refill every 20 min | `src/lib/progress.ts` |
| Audio via the device's text-to-speech (hi-IN, pa-IN, ta-IN voices) | `src/lib/speech.ts` |
| Course content | `src/data/courses.ts` |
| Mascot "Mor" the peacock (original artwork) | `src/components/Mascot.tsx` |

Diaspora touches: a romanised-spelling toggle (“namaste”) for heritage speakers who understand but can't read yet, family-first vocabulary (daadi vs naani), and dedicated script units.

## Adding a language or lessons

Add words to a course's `words` list and reference their ids from a lesson. Exercises are generated automatically. `npm test` checks every lesson builds with valid options. Have a native speaker review new content.

## Next steps

- Recorded native-speaker audio (TTS voices are missing on some devices)
- Accounts and cloud sync (progress is currently saved in the browser)
- Leagues/leaderboards, more languages (Gujarati, Bengali, Telugu, Malayalam, Marathi)
- Wrap as Android/iOS apps with Capacitor, or port the screens to React Native
