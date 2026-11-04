import { useMemo, useState, type ReactNode } from 'react';
import { COURSES, getCourse } from '../data/courses';
import { elderFor } from '../lib/personalise';
import { currentStreak, dayKey, MILESTONES, type Progress } from '../lib/progress';

/** A simple grown-ups-only check so young children don't wander into settings. */
export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [a, b] = useMemo(() => [6 + Math.floor(Math.random() * 4), 3 + Math.floor(Math.random() * 6)], []);
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(false);
  return (
    <div className="screen center">
      <h1>Grown-ups only</h1>
      <p className="muted">To continue, what is {a} × {b}?</p>
      <form
        className="gate"
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(answer) === a * b) onPass();
          else setWrong(true);
        }}
      >
        <label className="sr-only" htmlFor="gate">
          Answer
        </label>
        <input id="gate" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} autoFocus />
        <button className="btn primary" type="submit">
          Enter
        </button>
      </form>
      {wrong && <p className="error">That’s not right. Try again.</p>}
      <button className="btn ghost" onClick={onCancel}>
        Back
      </button>
    </div>
  );
}

interface DashboardProps {
  progress: Progress;
  onToggleRoman: () => void;
  onSwitchCourse: (code: string) => void;
  onSetElder: (courseCode: string, elderId: string) => void;
  onReset: () => void;
  /** Where the child's data is deleted from: just this device, or the family's account. */
  resetScope: 'device' | 'account';
  /** Family, plan and account sections, shown below this child's settings. */
  extra?: ReactNode;
}

export function ParentDashboard({ progress, onToggleRoman, onSwitchCourse, onSetElder, onReset, resetScope, extra }: DashboardProps) {
  const course = getCourse(progress.courseCode!);
  const child = progress.child!;
  const elder = elderFor(course, progress.elderByCourse[course.code]);
  const learned = progress.learned[course.code] ?? [];
  const words = course.words.filter((w) => learned.includes(w.id));
  const now = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const secs = progress.secondsByDay[dayKey(d)] ?? 0;
    return { label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), secs, mins: Math.round(secs / 60) };
  });
  const weekMins = Math.round(week.reduce((n, d) => n + d.secs, 0) / 60);
  const maxSecs = Math.max(600, ...week.map((d) => d.secs));
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="screen parents">
      <h1>{child.name}’s progress</h1>
      <p className="muted">
        {course.name} · age {child.age} · talking to {elder.roman}
      </p>

      <div className="stats">
        <div className="stat-card">
          <strong>{words.length}</strong>
          <small>words learned</small>
        </div>
        <div className="stat-card">
          <strong>{weekMins}</strong>
          <small>minutes this week</small>
        </div>
        <div className="stat-card">
          <strong>{currentStreak(progress, now)}</strong>
          <small>day streak</small>
        </div>
      </div>

      <section className="card">
        <h2>This week</h2>
        <div className="week" role="img" aria-label={`Minutes practised each day this week, ${weekMins} in total`}>
          {week.map((d, i) => (
            <div key={i} className="day">
              <div className="day-bar">
                <div className="day-fill" style={{ height: `${(d.secs / maxSecs) * 100}%` }} />
              </div>
              <small>{d.label}</small>
            </div>
          ))}
        </div>
        <p className="muted small">5–10 minutes a day is plenty. The goal is more conversation at home, not more screen time.</p>
      </section>

      <section className="card">
        <h2>Milestones</h2>
        <ul className="milestones">
          {MILESTONES.map((m) => {
            const at = progress.milestones[m.id];
            return (
              <li key={m.id} className={at ? 'got' : ''}>
                <span aria-hidden="true">{at ? '🌟' : '○'}</span>
                <span>{m.label.replaceAll('{gp}', elder.roman)}</span>
                {at && <small>{new Date(at).toLocaleDateString()}</small>}
              </li>
            );
          })}
        </ul>
      </section>

      {words.length > 0 && (
        <section className="card">
          <h2>Words to practise at home</h2>
          <div className="word-chips">
            {words.map((w) => (
              <span key={w.id} className="word-chip">
                {w.emoji} {w.native} <small>{w.roman} · {w.en}</small>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="card settings">
        <h2>Settings</h2>
        <label className="check">
          <input type="checkbox" checked={progress.showRoman} onChange={onToggleRoman} />
          Show English-letter spelling under words (e.g. “vanakkam”)
        </label>
        <label>
          Language
          <select value={course.code} onChange={(e) => onSwitchCourse(e.target.value)}>
            {COURSES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} {c.status === 'preview' ? '(preview)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Family member in lessons
          <select value={elder.id} onChange={(e) => onSetElder(course.code, e.target.value)}>
            {course.words
              .filter((w) => w.elder)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.roman} ({w.en})
                </option>
              ))}
          </select>
        </label>
        {confirmReset ? (
          <div className="row">
            <button className="btn danger" onClick={onReset}>
              Yes, delete {child.name}
            </button>
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn ghost" onClick={() => setConfirmReset(true)}>
            {resetScope === 'device' ? `Delete ${child.name}’s data from this device` : `Remove ${child.name} and all their progress`}
          </button>
        )}
      </section>
      {extra}
    </div>
  );
}
