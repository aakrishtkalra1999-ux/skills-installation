import { useState } from 'react';
import { COURSES, getCourse } from '../data/courses';
import type { Lesson } from '../data/types';
import { currentStreak, dayKey, HEART_REFILL_MS, MAX_HEARTS, unlockedLessonIds, type Progress } from '../lib/progress';
import { Mascot } from './Mascot';

interface Props {
  progress: Progress;
  onStart: (lesson: Lesson) => void;
  onSwitchCourse: (code: string) => void;
  onToggleRoman: () => void;
}

/** Horizontal offsets that make the lesson path wind left and right. */
const WIGGLE = [0, 44, 66, 44, 0, -44, -66, -44];

export function Home({ progress, onStart, onSwitchCourse, onToggleRoman }: Props) {
  const course = getCourse(progress.courseCode!);
  const unlocked = unlockedLessonIds(progress, course.code);
  const now = new Date();
  const todayXp = progress.xpByDay[dayKey(now)] ?? 0;
  const streak = currentStreak(progress, now);
  const [menu, setMenu] = useState(false);
  const nextLessonId = [...unlocked].find((id) => !progress.completed[id]);
  const heartMins =
    progress.heartsRefillAt && progress.hearts < MAX_HEARTS
      ? Math.max(1, Math.ceil((progress.heartsRefillAt - Date.now()) / 60000))
      : null;

  let index = 0;
  return (
    <div className="screen home">
      <header className="topbar">
        <button className="stat course-btn" onClick={() => setMenu((m) => !m)} aria-label="Change language">
          {course.nativeName} ▾
        </button>
        <span className="stat streak" title="Day streak">🔥 {streak}</span>
        <span className="stat xp" title="Total XP">⚡ {progress.xp}</span>
        <span className="stat hearts" title={heartMins ? `Next heart in ${heartMins} min` : 'Hearts'}>
          ❤️ {progress.hearts}
        </span>
      </header>

      {menu && (
        <div className="menu">
          {COURSES.map((c) => (
            <button
              key={c.code}
              className={`choice ${c.code === course.code ? 'selected' : ''}`}
              onClick={() => {
                onSwitchCourse(c.code);
                setMenu(false);
              }}
            >
              <span className="choice-script">{c.nativeName}</span>
              <strong>{c.name}</strong>
            </button>
          ))}
          <label className="toggle">
            <input type="checkbox" checked={progress.showRoman} onChange={onToggleRoman} />
            Show romanised spelling (e.g. “namaste”)
          </label>
        </div>
      )}

      <div className="goal">
        <div className="goal-text">
          Daily goal <strong>{Math.min(todayXp, progress.dailyGoal)}</strong> / {progress.dailyGoal} XP
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${Math.min(100, (todayXp / progress.dailyGoal) * 100)}%` }} />
        </div>
      </div>

      {course.units.map((unit, u) => (
        <section key={unit.id} className={`unit unit-${u % 3}`}>
          <div className="unit-banner">
            <small>Unit {u + 1}</small>
            <h2>{unit.title}</h2>
            <p>{unit.description}</p>
          </div>
          <div className="path">
            {unit.lessons.map((lesson) => {
              const offset = WIGGLE[index++ % WIGGLE.length];
              const open = unlocked.has(lesson.id);
              const done = !!progress.completed[lesson.id];
              const current = lesson.id === nextLessonId;
              return (
                <div key={lesson.id} className="node-wrap" style={{ transform: `translateX(${offset}px)` }}>
                  {current && <div className="start-tag">Start</div>}
                  <button
                    className={`node ${done ? 'done' : ''} ${open ? 'open' : 'locked'} ${current ? 'current' : ''}`}
                    disabled={!open}
                    onClick={() => onStart(lesson)}
                    aria-label={`${lesson.title}${done ? ' (completed)' : open ? '' : ' (locked)'}`}
                  >
                    {done ? '✓' : open ? '★' : '🔒'}
                  </button>
                  <div className="node-label">{lesson.title}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="path-end">
        <Mascot size={72} />
        <p>More units coming soon!</p>
      </div>

      {progress.hearts === 0 && (
        <div className="toast">
          Out of hearts — one refills every {HEART_REFILL_MS / 60000} minutes
          {heartMins ? ` (next in ${heartMins} min)` : ''}.
        </div>
      )}
    </div>
  );
}
