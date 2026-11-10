# Shipyard submission: 02 The product spec

Copy each block into the matching box on lms.praxel.in/shipyard.
Upload the 6 images in `docs/submission/screens/` (in order, 01 to 06) under "Screen designs".

---

## Job spec

```
Who needs it
Parents in Indian families living abroad (US, UK, Canada, Australia, Singapore, the Gulf) whose children, aged 3 to 10, understand a little of the family's regional language (Tamil, Telugu, Punjabi, Gujarati or Malayalam) but answer in English. The parent is the customer and account owner. The child is the learner. The grandparents back in India are the people the child wants to talk to.

When they need it
In short moments at home: 5 to 10 minutes after school, before bed, or just before the weekly video call with Paati, Dadi or Ammamma. The parent needs it once at setup (a few minutes) and then for a quick look at progress each week. It must work on a phone or tablet, on patchy Wi-Fi, and without the parent sitting beside the child the whole time.

What they should be able to accomplish
- The child can say real words and simple sentences to their grandparents ("Vanakkam, Paati!", "I am well", "I like idli") instead of one-word replies, so family calls become real conversations.
- The child can learn before they can read: every word has a picture and a sound, and children under 6 only get picture-and-sound exercises.
- The child never "fails": there are no hearts or lives, a wrong answer fades away and every lesson ends in success, so they want to come back.
- The parent can set it up safely: the parent creates the account, gives consent first, and shares only a child's first name, age, language, interests and the family member they talk to. No ads, no trackers, no photos or birthdays.
- The parent can see what is working: words learned, minutes this week, streak, milestones such as "Said hello to Paati", and a list of words to practise at home, even if the parent is not fluent.
- The family can use it on several devices and for up to 4 children, with progress kept in sync.
- The parent can try it free (the first unit of every language), then start a $19/month plan with the first month free, and cancel any time.

How we know it works
The child greets their grandparent in the family language on the next call; parents see words learned and minutes practised rise week by week; families come back several times a week; and waitlist sign-ups per language tell us which language to build next.
```

---

## Feature list

```
- Landing page: explains Rootling to parents (how it works, Rooty, languages, pricing, privacy promise, FAQ) with a clear "Start free" button.
- Waitlist: parents leave their email, the language they want and their country, so the most-requested language is built next.
- Parent account: sign up with email confirmation, log in, log out and reset a forgotten password. Children never type an email or password.
- Parent consent first: the parent agrees to the privacy terms before any child details are entered, and the consent time is saved.
- Child setup: choose the family language, enter the child's first name and age, pick favourite topics, and choose the family member they talk to (Paati, Thaatha, Ammamma, Dadi, Nani, Baa...).
- Personalised lesson path: a winding path of short lessons; favourite topics move earlier, and the child's name and chosen grandparent appear in lessons.
- Age-aware lessons: under-6s get picture and sound exercises only (meet a word, find the picture, listen, match pairs); children 6+ also read words and build sentences.
- Play-first, no penalties: no hearts or lives; a wrong answer fades away and every lesson ends in a win.
- Tap and say it: a video-call scene ("Meera, Paati is on a video call! Can you say hello?"); the microphone accepts any clear try without recording anything, and an "I said it!" button works on every device.
- Rooty the mascot: a sprout in a pot that grows a new leaf for every word learned.
- Bedtime stories: short read-aloud stories that star the child and their grandparent, one per language.
- Audio: plays native-speaker recordings when they exist and falls back to the phone's built-in voice.
- 5 languages: Tamil (launch: 5 units, 8 lessons), plus Telugu, Punjabi, Gujarati and Malayalam in preview while native speakers review every line.
- Grown-ups check: a quick times-table sum keeps young children out of the parents area.
- Parents dashboard: words learned, minutes this week, day streak, milestones (e.g. "Said hello to Paati") and words to practise at home.
- Settings: show or hide English-letter spellings, switch language, change the family member used in lessons.
- Families: up to 4 children per account, a "Who's playing?" picker, and add or remove a child.
- Cloud sync and offline: progress saves on the device instantly, syncs to the account in the background, and merges across phones and tablets; the app keeps working offline.
- Free plan: the first unit of every language and all stories, free forever.
- Sprout plan: $19/month with the first month free (once per family) through secure Stripe checkout; unlocks every lesson for up to 4 children.
- Manage subscription: parents update their card or cancel any time from the parents area.
- Download and delete data: parents can download everything stored about their family, or delete the whole account (which also cancels billing immediately).
- Privacy by design: no ads, analytics or third-party trackers on any screen; each family's data is isolated so a parent can only ever see their own children.
- Installable app: works in any browser and can be added to the phone's home screen like an app.
```
