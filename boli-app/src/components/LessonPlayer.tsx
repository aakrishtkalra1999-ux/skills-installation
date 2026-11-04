import { useEffect, useMemo, useState } from 'react';
import type { Course, Lesson, Word } from '../data/types';
import { buildLesson, isBuildCorrect, shuffle, type Exercise } from '../lib/lesson';
import { canSpeak, speak } from '../lib/speech';
import { Mascot } from './Mascot';

interface Props {
  course: Course;
  lesson: Lesson;
  showRoman: boolean;
  hearts: number;
  onWrong: () => void;
  onFinish: (mistakes: number) => void;
  onQuit: () => void;
}

type Status = 'answering' | 'correct' | 'wrong';

const PRAISE = ['Great job!', 'Shabaash!', 'Nicely done!', 'Bahut badhiya!', 'Correct!'];

export function LessonPlayer({ course, lesson, showRoman, hearts, onWrong, onFinish, onQuit }: Props) {
  const initial = useMemo(() => buildLesson(course, lesson, { canListen: canSpeak(course.ttsLang) }), [course, lesson]);
  const [queue, setQueue] = useState<Exercise[]>(initial);
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<Status>('answering');
  const [answer, setAnswer] = useState<unknown>(null);
  const [round, setRound] = useState(0);

  const ex = queue[0];
  const total = done + queue.length;

  function check() {
    if (!ex) return;
    const ok =
      ex.type === 'build'
        ? isBuildCorrect(ex, (answer as string[]) ?? [])
        : ex.type === 'match'
          ? true
          : (answer as Word | null)?.id === ex.word.id;
    if (ok) {
      setStatus('correct');
    } else {
      setStatus('wrong');
      setMistakes((m) => m + 1);
      onWrong();
    }
  }

  function next() {
    const [current, ...rest] = queue;
    // A missed exercise comes back at the end of the lesson, like spaced review.
    const nextQueue = status === 'wrong' ? [...rest, current] : rest;
    if (status === 'correct') setDone((d) => d + 1);
    setStatus('answering');
    setAnswer(null);
    setRound((r) => r + 1);
    if (nextQueue.length === 0) onFinish(mistakes);
    else setQueue(nextQueue);
  }

  if (hearts === 0 && status !== 'wrong') {
    return (
      <div className="screen center">
        <Mascot size={120} mood="sad" />
        <h2>You ran out of hearts</h2>
        <p className="muted">Hearts refill over time. Come back soon to finish “{lesson.title}”.</p>
        <button className="btn primary" onClick={onQuit}>
          Back to path
        </button>
      </div>
    );
  }

  if (!ex) return null;

  const correctText = describeAnswer(ex, showRoman);

  return (
    <div className="screen lesson">
      <header className="lesson-top">
        <button className="icon-btn" onClick={onQuit} aria-label="Quit lesson">
          ✕
        </button>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="stat hearts">❤️ {hearts}</span>
      </header>

      <main className="exercise" key={round}>
        {(ex.type === 'pick-meaning' || ex.type === 'pick-native' || ex.type === 'listen') && (
          <PickExercise ex={ex} course={course} showRoman={showRoman} value={answer as Word | null} onChange={setAnswer} locked={status !== 'answering'} />
        )}
        {ex.type === 'match' && (
          <MatchExercise
            pairs={ex.pairs}
            course={course}
            onComplete={() => {
              setAnswer(true);
              setStatus('correct');
            }}
          />
        )}
        {ex.type === 'build' && (
          <BuildExercise ex={ex} course={course} showRoman={showRoman} value={(answer as string[]) ?? []} onChange={setAnswer} locked={status !== 'answering'} />
        )}
      </main>

      <footer className={`footer feedback ${status}`}>
        {status === 'answering' && ex.type !== 'match' && (
          <button
            className="btn primary"
            disabled={answer === null || (Array.isArray(answer) && answer.length === 0)}
            onClick={check}
          >
            Check
          </button>
        )}
        {status === 'correct' && (
          <>
            <div className="feedback-text">✅ {PRAISE[round % PRAISE.length]}</div>
            <button className="btn primary" onClick={next} autoFocus>
              Continue
            </button>
          </>
        )}
        {status === 'wrong' && (
          <>
            <div className="feedback-text">
              ❌ Correct answer: <strong>{correctText}</strong>
            </div>
            <button className="btn danger" onClick={next} autoFocus>
              Got it
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

function describeAnswer(ex: Exercise, showRoman: boolean): string {
  if (ex.type === 'build') return (ex.direction === 'to-en' ? ex.sentence.en : ex.sentence.native).join(' ');
  if (ex.type === 'match') return '';
  if (ex.type === 'pick-meaning') return ex.word.en;
  return showRoman ? `${ex.word.native} (${ex.word.roman})` : ex.word.native;
}

function SpeakButton({ text, lang, big }: { text: string; lang: string; big?: boolean }) {
  if (!canSpeak(lang)) return null;
  return (
    <button className={`speak ${big ? 'big' : ''}`} onClick={() => speak(text, lang)} aria-label="Play audio">
      🔊
    </button>
  );
}

function PickExercise({
  ex,
  course,
  showRoman,
  value,
  onChange,
  locked,
}: {
  ex: Extract<Exercise, { type: 'pick-meaning' | 'pick-native' | 'listen' }>;
  course: Course;
  showRoman: boolean;
  value: Word | null;
  onChange: (w: Word) => void;
  locked: boolean;
}) {
  const { word } = ex;
  const isLetter = word.kind === 'letter';

  useEffect(() => {
    if (ex.type !== 'pick-native') speak(word.native, course.ttsLang);
  }, [ex, word, course.ttsLang]);

  const title =
    ex.type === 'listen'
      ? 'What do you hear?'
      : ex.type === 'pick-meaning'
        ? isLetter
          ? 'What sound does this letter make?'
          : 'What does this mean?'
        : isLetter
          ? `Which letter makes the sound “${word.en}”?`
          : `Which one means “${word.en}”?`;

  return (
    <>
      <h1 className="prompt-title">{title}</h1>
      {ex.type === 'pick-meaning' && (
        <div className="prompt-card">
          <SpeakButton text={word.native} lang={course.ttsLang} />
          <span className={`native ${isLetter ? 'letter' : ''}`}>{word.native}</span>
          {showRoman && !isLetter && <span className="roman">{word.roman}</span>}
        </div>
      )}
      {ex.type === 'listen' && (
        <div className="prompt-card">
          <SpeakButton text={word.native} lang={course.ttsLang} big />
        </div>
      )}
      <div className={`options ${ex.type === 'pick-meaning' && !isLetter ? 'grid' : ''}`}>
        {ex.options.map((opt) => (
          <button
            key={opt.id}
            className={`option ${value?.id === opt.id ? 'selected' : ''}`}
            disabled={locked}
            onClick={() => {
              onChange(opt);
              if (ex.type !== 'pick-meaning') speak(opt.native, course.ttsLang);
            }}
          >
            {ex.type === 'pick-meaning' ? (
              <>
                {opt.emoji && <span className="emoji">{opt.emoji}</span>}
                <span>{opt.en}</span>
              </>
            ) : (
              <>
                <span className="native-sm">{opt.native}</span>
                {showRoman && ex.type !== 'listen' && opt.kind !== 'letter' && <small className="roman">{opt.roman}</small>}
              </>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function MatchExercise({ pairs, course, onComplete }: { pairs: Word[]; course: Course; onComplete: () => void }) {
  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);
  const [picked, setPicked] = useState<{ side: 'l' | 'r'; id: string } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [miss, setMiss] = useState<string | null>(null);

  function tap(side: 'l' | 'r', w: Word) {
    if (matched.has(w.id)) return;
    if (side === 'l') speak(w.native, course.ttsLang);
    if (!picked || picked.side === side) {
      setPicked({ side, id: w.id });
      return;
    }
    if (picked.id === w.id) {
      const nextMatched = new Set(matched).add(w.id);
      setMatched(nextMatched);
      setPicked(null);
      if (nextMatched.size === pairs.length) onComplete();
    } else {
      setMiss(`${side}-${w.id}`);
      setPicked(null);
      setTimeout(() => setMiss(null), 500);
    }
  }

  const cls = (side: 'l' | 'r', w: Word) =>
    `option tile ${matched.has(w.id) ? 'matched' : ''} ${picked?.side === side && picked.id === w.id ? 'selected' : ''} ${
      miss === `${side}-${w.id}` ? 'miss' : ''
    }`;

  return (
    <>
      <h1 className="prompt-title">Tap the matching pairs</h1>
      <div className="match">
        <div className="col">
          {left.map((w) => (
            <button key={w.id} className={cls('l', w)} onClick={() => tap('l', w)}>
              <span className="native-sm">{w.native}</span>
            </button>
          ))}
        </div>
        <div className="col">
          {right.map((w) => (
            <button key={w.id} className={cls('r', w)} onClick={() => tap('r', w)}>
              {w.en}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function BuildExercise({
  ex,
  course,
  showRoman,
  value,
  onChange,
  locked,
}: {
  ex: Extract<Exercise, { type: 'build' }>;
  course: Course;
  showRoman: boolean;
  value: string[];
  onChange: (tiles: string[]) => void;
  locked: boolean;
}) {
  // Track bank positions rather than strings so repeated tiles behave correctly.
  const [used, setUsed] = useState<number[]>([]);
  const toEn = ex.direction === 'to-en';
  const promptText = toEn ? ex.sentence.native.join(' ') : ex.sentence.en.join(' ');

  useEffect(() => {
    if (toEn) speak(promptText, course.ttsLang);
  }, [toEn, promptText, course.ttsLang]);

  function add(i: number) {
    if (locked) return;
    const next = [...used, i];
    setUsed(next);
    onChange(next.map((j) => ex.bank[j]));
  }
  function remove(pos: number) {
    if (locked) return;
    const next = used.filter((_, k) => k !== pos);
    setUsed(next);
    onChange(next.map((j) => ex.bank[j]));
  }

  return (
    <>
      <h1 className="prompt-title">{toEn ? 'Translate this sentence' : `Write this in ${course.name}`}</h1>
      <div className="sentence-prompt">
        <Mascot size={64} />
        <div className="bubble">
          {toEn && <SpeakButton text={promptText} lang={course.ttsLang} />}
          <span className={toEn ? 'native-sm' : ''}>{promptText}</span>
          {toEn && showRoman && <small className="roman">{ex.sentence.roman}</small>}
        </div>
      </div>
      <div className="answer-line">
        {used.map((j, pos) => (
          <button key={`${j}-${pos}`} className="option tile" onClick={() => remove(pos)}>
            {ex.bank[j]}
          </button>
        ))}
      </div>
      <div className="bank">
        {ex.bank.map((t, i) => (
          <button key={i} className={`option tile ${used.includes(i) ? 'ghost' : ''}`} disabled={used.includes(i) || locked} onClick={() => add(i)}>
            {t}
          </button>
        ))}
      </div>
      {value.length === 0 && <p className="muted hint">Tap the words in order</p>}
    </>
  );
}
