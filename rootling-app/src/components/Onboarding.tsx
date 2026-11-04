import { useState } from 'react';
import { COURSES, getCourse } from '../data/courses';
import type { Topic } from '../data/types';
import type { ChildProfile } from '../lib/personalise';
import { Rooty } from './Rooty';

const FAVOURITES: { topic: Topic; label: string; emoji: string }[] = [
  { topic: 'animals', label: 'Animals', emoji: '🐘' },
  { topic: 'food', label: 'Food', emoji: '🍚' },
  { topic: 'colours', label: 'Colours', emoji: '🎨' },
  { topic: 'numbers', label: 'Counting', emoji: '🔢' },
];

const AGES = [3, 4, 5, 6, 7, 8, 9, 10];

export interface OnboardingResult {
  courseCode: string;
  child: ChildProfile;
  elderId: string;
}

/** Parent-led setup, in the order the landing page promises: consent, language, the child, their family. */
export function Onboarding({ onDone }: { onDone: (r: OnboardingResult) => void }) {
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [courseCode, setCourseCode] = useState('ta');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [favourites, setFavourites] = useState<Topic[]>([]);
  const [elderId, setElderId] = useState<string | null>(null);

  const course = getCourse(courseCode);
  const elders = course.words.filter((w) => w.elder);
  const childName = name.trim();

  const bubble = [
    'Hi! I’m Rooty. I help children learn their family’s language. A grown-up should set me up.',
    'Which language does your family speak?',
    'Tell me about your child.',
    `What does ${childName || 'your child'} love?`,
    `Who does ${childName || 'your child'} want to talk to?`,
  ][step];

  return (
    <div className="screen onboarding">
      <div className="speech">
        <Rooty size={84} leaves={step + 1} mood="cheer" />
        <div className="bubble">{bubble}</div>
      </div>

      {step === 0 && (
        <div className="card consent">
          <h2>For parents</h2>
          <ul>
            <li>Rootling asks for your child’s first name, age and interests to personalise lessons.</li>
            <li>Everything stays on this device. No ads, and we never sell data.</li>
            <li>The microphone is only used when your child taps “Say it”, and is never recorded.</li>
          </ul>
          <label className="check">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I’m the parent or guardian and I agree.
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="choice-list">
          {COURSES.map((c) => (
            <button
              key={c.code}
              className={`choice ${courseCode === c.code ? 'selected' : ''}`}
              onClick={() => {
                setCourseCode(c.code);
                setElderId(null);
              }}
            >
              <span className="choice-script">{c.nativeName}</span>
              <span>
                <strong>{c.name}</strong>
                <small>{c.status === 'launch' ? 'Launching first · full course' : 'Early preview'}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="card form">
          <label>
            Child’s first name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav" maxLength={20} autoFocus />
          </label>
          <span className="label">Age</span>
          <div className="ages">
            {AGES.map((a) => (
              <button key={a} className={`age ${age === a ? 'selected' : ''}`} onClick={() => setAge(a)}>
                {a}
              </button>
            ))}
          </div>
          <p className="muted">Under 6? Lessons use pictures and sounds only, no reading.</p>
        </div>
      )}

      {step === 3 && (
        <div className="choice-grid">
          {FAVOURITES.map((f) => {
            const on = favourites.includes(f.topic);
            return (
              <button
                key={f.topic}
                className={`choice tall ${on ? 'selected' : ''}`}
                aria-pressed={on}
                onClick={() => setFavourites(on ? favourites.filter((t) => t !== f.topic) : [...favourites, f.topic])}
              >
                <span className="big-emoji">{f.emoji}</span>
                <strong>{f.label}</strong>
              </button>
            );
          })}
        </div>
      )}

      {step === 4 && (
        <div className="choice-list">
          {elders.map((e) => (
            <button key={e.id} className={`choice ${elderId === e.id ? 'selected' : ''}`} onClick={() => setElderId(e.id)}>
              <span className="big-emoji">{e.emoji}</span>
              <span>
                <strong>
                  {e.roman} · {e.native}
                </strong>
                <small>{e.en}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <footer className="footer">
        {step > 0 && (
          <button className="btn ghost" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            className="btn primary"
            disabled={(step === 0 && !consent) || (step === 2 && (!childName || age === null))}
            onClick={() => setStep(step + 1)}
          >
            {step === 3 && favourites.length === 0 ? 'Skip' : 'Continue'}
          </button>
        ) : (
          <button
            className="btn primary"
            disabled={!elderId}
            onClick={() => onDone({ courseCode, elderId: elderId!, child: { name: childName, age: age!, favourites } })}
          >
            Start learning
          </button>
        )}
      </footer>
    </div>
  );
}
