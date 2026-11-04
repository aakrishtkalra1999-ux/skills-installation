import { getCourse } from '../data/courses';
import type { Lesson } from '../data/types';
import { elderFor, orderedUnits } from '../lib/personalise';
import { currentStreak, unlockedLessonIds, type Progress } from '../lib/progress';
import { Rooty } from './Rooty';

/** Horizontal offsets that make the lesson path wind like a vine. */
const WIGGLE = [0, 46, 70, 46, 0, -46, -70, -46];

export function Home({ progress, onStart }: { progress: Progress; onStart: (lesson: Lesson) => void }) {
  const course = getCourse(progress.courseCode!);
  const child = progress.child!;
  const elder = elderFor(course, progress.elderByCourse[course.code]);
  const units = orderedUnits(course, child.favourites);
  const lessonIds = units.flatMap((u) => u.lessons.map((l) => l.id));
  const unlocked = unlockedLessonIds(progress, lessonIds);
  const nextId = lessonIds.find((id) => unlocked.has(id) && !progress.completed[id]);
  const leaves = (progress.learned[course.code] ?? []).length;
  const streak = currentStreak(progress, new Date());

  let index = 0;
  return (
    <div className="screen home">
      <header className="hero">
        <Rooty size={92} leaves={leaves} />
        <div>
          <h1>Hi {child.name}!</h1>
          <p>
            Rooty has <strong>{leaves}</strong> {leaves === 1 ? 'leaf' : 'leaves'}. Learn a word to grow another!
          </p>
          <div className="chips">
            <span className="chip">{course.nativeName}</span>
            {streak > 0 && <span className="chip sun">☀️ {streak} day{streak === 1 ? '' : 's'}</span>}
            <span className="chip">
              {elder.emoji} {elder.roman}
            </span>
          </div>
        </div>
      </header>

      {units.map((unit, u) => (
        <section key={unit.id} className={`unit tone-${u % 4}`}>
          <div className="unit-banner">
            <small>Unit {u + 1}</small>
            <h2>{unit.title.replaceAll('{gp}', elder.roman)}</h2>
            <p>{unit.description}</p>
          </div>
          <div className="path">
            {unit.lessons.map((lesson) => {
              const offset = WIGGLE[index++ % WIGGLE.length];
              const open = unlocked.has(lesson.id);
              const done = !!progress.completed[lesson.id];
              const current = lesson.id === nextId;
              return (
                <div key={lesson.id} className="node-wrap" style={{ transform: `translateX(${offset}px)` }}>
                  {current && <div className="start-tag">Play</div>}
                  <button
                    className={`node ${done ? 'done' : ''} ${open ? 'open' : 'locked'} ${current ? 'current' : ''}`}
                    disabled={!open}
                    onClick={() => onStart(lesson)}
                    aria-label={`${lesson.title}${done ? ' (done)' : open ? '' : ' (locked)'}`}
                  >
                    {done ? '🌿' : open ? '🌱' : '🔒'}
                  </button>
                  <div className="node-label">{lesson.title}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="path-end">
        <Rooty size={64} leaves={leaves} mood="think" />
        <p>New lessons are on their way!</p>
      </div>
    </div>
  );
}
