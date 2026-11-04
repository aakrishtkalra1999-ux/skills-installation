import { useState, type FormEvent } from 'react';
import { COURSES } from '../data/courses';
import { joinWaitlist, WAITLIST_COUNTRIES, WAITLIST_LANGUAGES } from '../lib/waitlist';
import { Rooty } from './Rooty';

interface Props {
  /** Accounts are switched on (Supabase is configured). */
  accounts: boolean;
  onStart: () => void;
  onLogin: () => void;
  /** Shown to families who used Rootling on this device before accounts existed. */
  legacyName?: string | null;
}

const STEPS = [
  { emoji: '👪', title: 'A grown-up sets it up', body: 'Pick your family’s language, add your child’s first name and age, and who they want to talk to: Paati, Dadi, Ammamma…' },
  { emoji: '🌱', title: 'Five minutes of play', body: 'Pictures, sounds and little games. No reading needed for under-6s, and no hearts to lose. Every lesson ends in a win.' },
  { emoji: '📱', title: 'Say it to family', body: '“Tap and say it” moments practise the exact words for the next video call home. Rooty grows a leaf for every word.' },
];

const FAQ = [
  {
    q: 'What ages is Rootling for?',
    a: 'Children aged 3 to 10. Under-6s play with pictures and sounds only; older children also read words and build little sentences.',
  },
  {
    q: 'We don’t speak the language well ourselves. Does that matter?',
    a: 'Not at all. Every word has a picture, a sound and an English meaning, and the parents area lists the words your child is learning so you can practise together.',
  },
  {
    q: 'Which languages can my child learn?',
    a: 'Tamil is our launch language. Telugu, Punjabi, Gujarati and Malayalam are in early preview while native speakers review every line. Join the waitlist to tell us which language your family needs next.',
  },
  {
    q: 'What do you store about my child?',
    a: 'Only a first name, age, chosen language, family member and favourite topics, plus what they have learned. No surnames, photos, birthdays or locations. The microphone is used only when your child taps “Say it”, and nothing is recorded.',
  },
  {
    q: 'Are there ads?',
    a: 'Never. There are no ads and no third-party trackers anywhere children play. Rootling is paid for by families, not advertisers.',
  },
  {
    q: 'How does the free month work?',
    a: 'Every family can try the first unit of each language free, for as long as you like. The Sprout plan unlocks everything, with your first month free. Cancel any time from the parents area.',
  },
];

export function Landing({ accounts, onStart, onLogin, legacyName }: Props) {
  return (
    <div className="landing">
      <header className="site-nav">
        <a className="brand" href="/" aria-label="Rootling home">
          <Rooty size={36} leaves={3} />
          <span>Rootling</span>
        </a>
        <nav aria-label="Main">
          <a href="#how">How it works</a>
          <a href="#languages">Languages</a>
          <a href="#pricing">Pricing</a>
          {accounts && (
            <button className="btn ghost small" onClick={onLogin}>
              Log in
            </button>
          )}
        </nav>
      </header>

      <main>
        <section className="l-hero">
          <div className="l-hero-copy">
            <p className="eyebrow">For Indian families abroad · ages 3–10</p>
            <h1>
              Little roots,
              <br />
              big words.
            </h1>
            <p className="lede">
              Personalised lessons, stories and games that help your child speak your family’s language, so the next call with Paati or
              Nani is a real conversation.
            </p>
            {legacyName && (
              <p className="note">
                🌿 Welcome back! {accounts ? `Create a parent account and we’ll bring ${legacyName}’s progress with you.` : `${legacyName}’s lessons are waiting.`}
              </p>
            )}
            <div className="row">
              <button className="btn primary big" onClick={onStart}>
                {accounts ? 'Start free' : 'Try it now'}
              </button>
              <a className="btn ghost big" href="#waitlist">
                Join the waitlist
              </a>
            </div>
            <p className="muted small">No ads. No trackers. First unit of every language free.</p>
          </div>
          <div className="l-hero-art" aria-hidden="true">
            <div className="hero-bubble">வணக்கம், பாட்டி!</div>
            <Rooty size={220} leaves={9} mood="cheer" />
          </div>
        </section>

        <section id="how" className="l-section">
          <h2>How it works</h2>
          <div className="l-steps">
            {STEPS.map((s, i) => (
              <article key={s.title} className="l-card">
                <span className="l-step-num">{i + 1}</span>
                <span className="big-emoji" aria-hidden="true">
                  {s.emoji}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="l-section l-rooty">
          <Rooty size={140} leaves={6} mood="think" />
          <div>
            <h2>Meet Rooty</h2>
            <p>
              Rooty is a little sprout in a pot who grows a new leaf for every word your child learns. Children see their language
              growing, and parents see exactly which words to use at home.
            </p>
          </div>
        </section>

        <section id="languages" className="l-section">
          <h2>Languages</h2>
          <div className="l-langs">
            {COURSES.map((c) => (
              <article key={c.code} className={`l-lang ${c.status}`}>
                <span className="choice-script">{c.nativeName}</span>
                <strong>{c.name}</strong>
                <small>{c.status === 'launch' ? 'Launching first' : 'Early preview'}</small>
              </article>
            ))}
            <article className="l-lang soon">
              <span className="choice-script">বাংলা</span>
              <strong>Bengali</strong>
              <small>Vote on the waitlist</small>
            </article>
          </div>
          <p className="muted">Every word and line is checked by native speakers before a language leaves preview.</p>
        </section>

        <section id="pricing" className="l-section">
          <h2>Pricing</h2>
          <div className="l-prices">
            <article className="l-card">
              <h3>Seedling</h3>
              <p className="price">Free</p>
              <ul>
                <li>First unit of every language</li>
                <li>A bedtime story in each language</li>
                <li>Parents area with progress and milestones</li>
              </ul>
            </article>
            <article className="l-card featured">
              <h3>Sprout</h3>
              <p className="price">
                $19<small>/month</small>
              </p>
              <ul>
                <li>
                  <strong>First month free</strong>
                </li>
                <li>Every lesson in every language</li>
                <li>Up to 4 children, progress synced across devices</li>
                <li>Cancel any time</li>
              </ul>
              <button className="btn primary" onClick={onStart}>
                Start your free month
              </button>
            </article>
          </div>
        </section>

        <section className="l-section l-promise">
          <h2>Our promise to parents</h2>
          <ul>
            <li>🔒 Accounts belong to parents. Children never type an email or password.</li>
            <li>🙅 No ads and no third-party trackers where children play.</li>
            <li>🌱 We keep only a first name, age, language and interests, and you can export or delete it all any time.</li>
            <li>🎤 The microphone listens only when your child taps “Say it”, and nothing is recorded.</li>
          </ul>
        </section>

        <section className="l-section">
          <h2>Questions parents ask</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Waitlist />
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Rootling</span>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </footer>
    </div>
  );
}

function Waitlist() {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('Tamil');
  const [country, setCountry] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('sending');
    setError(null);
    const result = await joinWaitlist({ email, language, country });
    if (result.ok) setState('done');
    else {
      setState('idle');
      setError(result.message);
    }
  }

  return (
    <section id="waitlist" className="l-section l-waitlist">
      <h2>Join the waitlist</h2>
      {state === 'done' ? (
        <p className="big-line" role="status">
          🌱 Thank you! We’ll email you when {language} is ready.
        </p>
      ) : (
        <>
          <p>Tell us which language your family speaks. We build the most-requested languages first.</p>
          <form className="card form waitlist-form" onSubmit={submit}>
            <label>
              Parent’s email
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Language you want
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {WAITLIST_LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Country you live in
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Choose…</option>
                {WAITLIST_COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <button className="btn primary" type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Joining…' : 'Join the waitlist'}
            </button>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <p className="muted small">For parents only. We’ll only email you about Rootling. See our <a href="/privacy">privacy policy</a>.</p>
          </form>
        </>
      )}
    </section>
  );
}
