# Recording guide for voice artists

Rootling plays a native speaker's recording for every word and line when one exists, and falls back to the device's voice otherwise. This guide tells you exactly what to record.

## What to record

Open **`content/review.csv`** (Google Sheets or Excel). Each row is one recording:

| Column | Meaning |
|---|---|
| `language` | The course, e.g. Tamil |
| `script` | **Say exactly this.** It is written in the language's own script |
| `romanised` | The same line in English letters, to help you |
| `english` | What it means |
| `where_used` | Where a child hears it: a word card, "Tap and say it", a sentence, a story page |
| `audio_file` | **The file name to save it as**, e.g. `audio/ta/vanakkam.mp3` |

Rows whose `audio_file` says *not recorded* include the child's own name, so they are read by the device. Skip them.

Lines that mention a family member (Paati, Thaatha, Ammamma…) appear once per family member, with a different file name each time (e.g. `ta-u1-l1-say1-paati.mp3` and `ta-u1-l1-say1-thaatha.mp3`). Record each one.

**Record only after the native-speaker review has signed off the `script` column**, so nothing needs re-recording.

## How to record

- **Voice:** warm, clear and a little slower than normal conversation, the way you'd talk to a 4-year-old. Not baby talk.
- **Story pages:** if `where_used` says *family member speaks*, use a grandparent's warm voice; if it says *child speaks*, use a light, friendly voice.
- **One line per file**, with about 0.2 s of silence before and after. No music or effects.
- **Room:** quiet, no echo (a wardrobe full of clothes works well). Phone 20–30 cm from your mouth.
- **Format:** MP3, mono, 44.1 kHz, 128 kbps (any free app such as Audacity can export this). Keep each file under about 100 KB.
- **Names:** exactly as in `audio_file`, all lower case, ending in `.mp3`.

## Delivering the files

Put the files in the folder matching the path, for example `public/audio/ta/vanakkam.mp3`, and commit them, or send a zip to the Rootling team. The app finds new recordings on its next build: nothing else needs changing. Record **Tamil first**, then Telugu.

## Checking a recording in the app

Run `npm run dev`, open a lesson that uses the word, and tap 🔊. You should hear the recording rather than the device voice.
