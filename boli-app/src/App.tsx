import { useEffect, useReducer, useState } from 'react';
import { Home } from './components/Home';
import { LessonPlayer } from './components/LessonPlayer';
import { Mascot } from './components/Mascot';
import { Onboarding } from './components/Onboarding';
import { getCourse } from './data/courses';
import type { Lesson } from './data/types';
import {
  completeLesson,
  currentStreak,
  dayKey,
  loadProgress,
  loseHeart,
  PERFECT_BONUS,
  refillHearts,
  saveProgress,
  XP_PER_LESSON,
  type Progress,
} from './lib/progress';
import { onVoicesReady } from './lib/speech';

type Action =
  | { type: 'start'; courseCode: string; dailyGoal: number }
  | { type: 'switch-course'; courseCode: string }
  | { type: 'toggle-roman' }
  | { type: 'wrong' }
  | { type: 'complete'; lessonId: string; mistakes: number }
  | { type: 'tick' };

function reducer(p: Progress, a: Action): Progress {
  switch (a.type) {
    case 'start':
      return { ...p, courseCode: a.courseCode, dailyGoal: a.dailyGoal };
    case 'switch-course':
      return { ...p, courseCode: a.courseCode };
    case 'toggle-roman':
      return { ...p, showRoman: !p.showRoman };
    case 'wrong':
      return loseHeart(p, Date.now());
    case 'complete':
      return completeLesson(p, a.lessonId, a.mistakes, new Date());
    case 'tick':
      return refillHearts(p, Date.now());
  }
}

type View = { name: 'home' } | { name: 'lesson'; lesson: Lesson } | { name: 'done'; mistakes: number; goalHit: boolean };

export default function App() {
  const [progress, dispatch] = useReducer(reducer, undefined, () => refillHearts(loadProgress(), Date.now()));
  const [view, setView] = useState<View>({ name: 'home' });
  const [, rerender] = useState(0);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick' }), 30_000);
    return () => clearInterval(id);
  }, []);
  // Re-render once TTS voices load so listening exercises and speaker buttons appear.
  useEffect(() => onVoicesReady(() => rerender((n) => n + 1)), []);

  if (!progress.courseCode) {
    return <Onboarding onDone={(courseCode, dailyGoal) => dispatch({ type: 'start', courseCode, dailyGoal })} />;
  }
  const course = getCourse(progress.courseCode);

  if (view.name === 'lesson') {
    return (
      <LessonPlayer
        key={view.lesson.id}
        course={course}
        lesson={view.lesson}
        showRoman={progress.showRoman}
        hearts={progress.hearts}
        onWrong={() => dispatch({ type: 'wrong' })}
        onQuit={() => setView({ name: 'home' })}
        onFinish={(mistakes) => {
          const today = dayKey(new Date());
          const before = progress.xpByDay[today] ?? 0;
          const earned = XP_PER_LESSON + (mistakes === 0 ? PERFECT_BONUS : 0);
          dispatch({ type: 'complete', lessonId: view.lesson.id, mistakes });
          setView({
            name: 'done',
            mistakes,
            goalHit: before < progress.dailyGoal && before + earned >= progress.dailyGoal,
          });
        }}
      />
    );
  }

  if (view.name === 'done') {
    const earned = XP_PER_LESSON + (view.mistakes === 0 ? PERFECT_BONUS : 0);
    return (
      <div className="screen center done">
        <Mascot size={140} mood="cheer" />
        <h1>Lesson complete!</h1>
        <div className="results">
          <div className="result xp">
            <small>XP earned</small>
            <strong>⚡ {earned}</strong>
          </div>
          <div className="result streak">
            <small>Streak</small>
            <strong>🔥 {currentStreak(progress, new Date())}</strong>
          </div>
          <div className="result acc">
            <small>Mistakes</small>
            <strong>{view.mistakes === 0 ? 'Perfect!' : view.mistakes}</strong>
          </div>
        </div>
        {view.goalHit && <p className="goal-hit">🎯 You hit your daily goal!</p>}
        <button className="btn primary" onClick={() => setView({ name: 'home' })}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <Home
      progress={progress}
      onStart={(lesson) => {
        if (progress.hearts > 0) setView({ name: 'lesson', lesson });
      }}
      onSwitchCourse={(courseCode) => dispatch({ type: 'switch-course', courseCode })}
      onToggleRoman={() => dispatch({ type: 'toggle-roman' })}
    />
  );
}
