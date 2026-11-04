import { useEffect, useState } from 'react';
import { Home } from './components/Home';
import { LessonPlayer } from './components/LessonPlayer';
import { Onboarding } from './components/Onboarding';
import { ParentDashboard, ParentGate } from './components/Parents';
import { Rooty } from './components/Rooty';
import { StoryList, StoryReader } from './components/Stories';
import { getCourse } from './data/courses';
import type { Lesson, Story } from './data/types';
import { elderFor } from './lib/personalise';
import {
  clearProgress,
  completeLesson,
  completeStory,
  initialProgress,
  loadProgress,
  MILESTONES,
  saveProgress,
  type MilestoneId,
  type Progress,
} from './lib/progress';
import { onVoicesReady } from './lib/speech';

type Tab = 'learn' | 'stories' | 'parents';
type View =
  | { name: 'tabs' }
  | { name: 'lesson'; lesson: Lesson }
  | { name: 'story'; story: Story }
  | { name: 'reward'; newWords: string[]; earned: MilestoneId[]; leaves: number; title: string };

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [tab, setTab] = useState<Tab>('learn');
  const [view, setView] = useState<View>({ name: 'tabs' });
  const [parentOk, setParentOk] = useState(false);
  const [, rerender] = useState(0);

  useEffect(() => saveProgress(progress), [progress]);
  // Re-render once TTS voices load so speaker buttons and listening games appear.
  useEffect(() => onVoicesReady(() => rerender((n) => n + 1)), []);

  if (!progress.consent || !progress.child || !progress.courseCode) {
    return (
      <Onboarding
        onDone={({ courseCode, child, elderId }) =>
          setProgress({ ...progress, consent: true, courseCode, child, elderByCourse: { ...progress.elderByCourse, [courseCode]: elderId } })
        }
      />
    );
  }

  const course = getCourse(progress.courseCode);
  const child = progress.child;
  const elder = elderFor(course, progress.elderByCourse[course.code]);

  if (view.name === 'lesson') {
    return (
      <LessonPlayer
        key={view.lesson.id}
        course={course}
        lesson={view.lesson}
        childName={child.name}
        age={child.age}
        elderId={progress.elderByCourse[course.code]}
        showRoman={progress.showRoman}
        onQuit={() => setView({ name: 'tabs' })}
        onFinish={(result) => {
          const { progress: next, newWords, earned } = completeLesson(progress, result, new Date());
          setProgress(next);
          setView({ name: 'reward', newWords, earned, leaves: (next.learned[course.code] ?? []).length, title: 'Lesson done!' });
        }}
      />
    );
  }

  if (view.name === 'story') {
    return (
      <StoryReader
        course={course}
        story={view.story}
        progress={progress}
        onClose={() => setView({ name: 'tabs' })}
        onDone={(seconds) => {
          const { progress: next, earned } = completeStory(progress, view.story.id, seconds, new Date());
          setProgress(next);
          setView({ name: 'reward', newWords: [], earned, leaves: (next.learned[course.code] ?? []).length, title: 'The end!' });
        }}
      />
    );
  }

  if (view.name === 'reward') {
    const grown = view.newWords.length;
    return (
      <div className="screen center reward">
        <Rooty size={150} leaves={view.leaves} mood="cheer" />
        <h1>{view.title}</h1>
        {grown > 0 ? (
          <p className="big-line">
            Rooty grew <strong>{grown}</strong> new {grown === 1 ? 'leaf' : 'leaves'}!
          </p>
        ) : (
          <p className="big-line">Well done, {child.name}!</p>
        )}
        {view.earned.length > 0 && (
          <ul className="earned">
            {view.earned.map((id) => (
              <li key={id}>🌟 {MILESTONES.find((m) => m.id === id)!.label.replaceAll('{gp}', elder.roman)}</li>
            ))}
          </ul>
        )}
        <button className="btn primary" onClick={() => setView({ name: 'tabs' })}>
          Keep going
        </button>
      </div>
    );
  }

  return (
    <>
      {tab === 'learn' && <Home progress={progress} onStart={(lesson) => setView({ name: 'lesson', lesson })} />}
      {tab === 'stories' && <StoryList course={course} progress={progress} onOpen={(story) => setView({ name: 'story', story })} />}
      {tab === 'parents' &&
        (parentOk ? (
          <ParentDashboard
            progress={progress}
            onToggleRoman={() => setProgress({ ...progress, showRoman: !progress.showRoman })}
            onSwitchCourse={(code) => setProgress({ ...progress, courseCode: code })}
            onSetElder={(code, id) => setProgress({ ...progress, elderByCourse: { ...progress.elderByCourse, [code]: id } })}
            onReset={() => {
              clearProgress();
              setProgress(initialProgress);
              setParentOk(false);
              setTab('learn');
            }}
          />
        ) : (
          <ParentGate onPass={() => setParentOk(true)} onCancel={() => setTab('learn')} />
        ))}
      <nav className="tabbar" aria-label="Sections">
        {(
          [
            ['learn', '🌱', 'Learn'],
            ['stories', '📖', 'Stories'],
            ['parents', '👪', 'Parents'],
          ] as const
        ).map(([id, icon, label]) => (
          <button
            key={id}
            className={tab === id ? 'active' : ''}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => {
              setTab(id);
              if (id !== 'parents') setParentOk(false);
            }}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
