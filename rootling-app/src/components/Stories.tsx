import { useRef, useState } from 'react';
import type { Course, Story } from '../data/types';
import { elderFor, fillText, personaliseLine } from '../lib/personalise';
import type { Progress } from '../lib/progress';
import { canSpeak, speak } from '../lib/speech';
import { Rooty } from './Rooty';

export function StoryList({ course, progress, onOpen }: { course: Course; progress: Progress; onOpen: (s: Story) => void }) {
  const elder = elderFor(course, progress.elderByCourse[course.code]);
  return (
    <div className="screen stories">
      <h1>Bedtime stories</h1>
      <p className="muted">Little stories starring {progress.child!.name} and {elder.roman}, read aloud.</p>
      <div className="story-grid">
        {course.stories.map((s) => (
          <button key={s.id} className="story-card" onClick={() => onOpen(s)}>
            <span className="cover" aria-hidden="true">
              {s.cover}
            </span>
            <strong>{fillText(s.title, progress.child!.name, elder.roman)}</strong>
            <small>{progress.storiesRead[s.id] ? `Read ${progress.storiesRead[s.id]}×` : 'New'}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StoryReader({
  course,
  story,
  progress,
  onDone,
  onClose,
}: {
  course: Course;
  story: Story;
  progress: Progress;
  onDone: (seconds: number) => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const started = useRef(Date.now());
  const name = progress.child!.name;
  const elder = elderFor(course, progress.elderByCourse[course.code]);
  const p = story.pages[page];
  const line = personaliseLine(p.line, name, elder);
  const last = page === story.pages.length - 1;

  return (
    <div className="screen story">
      <header className="lesson-top">
        <button className="icon-btn" onClick={onClose} aria-label="Close story">
          ✕
        </button>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${((page + 1) / story.pages.length) * 100}%` }} />
        </div>
      </header>
      <h1 className="prompt-title">{fillText(story.title, name, elder.roman)}</h1>
      <div className={`story-page ${p.speaker}`} key={page}>
        <span className="story-art" aria-hidden="true">
          {p.emoji}
        </span>
        <div className="speaker">{p.speaker === 'gp' ? `${elder.emoji} ${elder.roman}` : `🧒 ${name}`}</div>
        <span className="native">{line.native}</span>
        {progress.showRoman && <span className="roman">{line.roman}</span>}
        <span className="meaning">{line.en}</span>
        {canSpeak(course.ttsLang) && (
          <button className="speak big" onClick={() => speak(line.native, course.ttsLang)} aria-label="Read it to me">
            🔊
          </button>
        )}
      </div>
      <footer className="footer">
        <div className="row">
          <button className="btn ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Back
          </button>
          <button
            className="btn primary"
            onClick={() => (last ? onDone((Date.now() - started.current) / 1000) : setPage(page + 1))}
          >
            {last ? 'The end' : 'Next page'}
          </button>
        </div>
      </footer>
      {last && (
        <div className="story-end" aria-hidden="true">
          <Rooty size={56} leaves={4} mood="cheer" />
        </div>
      )}
    </div>
  );
}
