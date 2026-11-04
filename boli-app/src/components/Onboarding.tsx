import { useState } from 'react';
import { COURSES } from '../data/courses';
import { Mascot } from './Mascot';

const GOALS = [
  { xp: 10, label: 'Casual', note: '5 min a day' },
  { xp: 20, label: 'Regular', note: '10 min a day' },
  { xp: 30, label: 'Serious', note: '15 min a day' },
  { xp: 50, label: 'Intense', note: '20 min a day' },
];

const REASONS = ['Talk with family', 'Connect with my culture', 'Travel to India', 'Raise bilingual kids', 'Just for fun'];

export function Onboarding({ onDone }: { onDone: (courseCode: string, dailyGoal: number) => void }) {
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState<string | null>(null);
  const [goal, setGoal] = useState(20);

  return (
    <div className="screen onboarding">
      <div className="speech">
        <Mascot size={88} mood="cheer" />
        <div className="bubble">
          {step === 0 && 'Namaste! Which language do you want to learn?'}
          {step === 1 && 'Why are you learning? (This helps me choose your lessons.)'}
          {step === 2 && 'Pick a daily goal. You can change it later.'}
        </div>
      </div>

      {step === 0 && (
        <div className="choice-list">
          {COURSES.map((c) => (
            <button
              key={c.code}
              className={`choice ${course === c.code ? 'selected' : ''}`}
              onClick={() => setCourse(c.code)}
            >
              <span className="choice-script">{c.nativeName}</span>
              <span>
                <strong>{c.name}</strong>
                <small>{c.speakers}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="choice-list">
          {REASONS.map((r) => (
            <button key={r} className="choice" onClick={() => setStep(2)}>
              {r}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="choice-list">
          {GOALS.map((g) => (
            <button key={g.xp} className={`choice ${goal === g.xp ? 'selected' : ''}`} onClick={() => setGoal(g.xp)}>
              <span>
                <strong>{g.label}</strong>
                <small>
                  {g.note} · {g.xp} XP
                </small>
              </span>
            </button>
          ))}
        </div>
      )}

      <footer className="footer">
        {step === 0 && (
          <button className="btn primary" disabled={!course} onClick={() => setStep(1)}>
            Continue
          </button>
        )}
        {step === 2 && course && (
          <button className="btn primary" onClick={() => onDone(course, goal)}>
            Start learning
          </button>
        )}
      </footer>
    </div>
  );
}
