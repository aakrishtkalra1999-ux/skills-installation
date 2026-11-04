import { useEffect, useMemo, useRef, useState } from 'react';
import type { Course, Lesson, Word } from '../data/types';
import { buildLesson, isBuildCorrect, shuffle, type Exercise } from '../lib/lesson';
import { elderFor } from '../lib/personalise';
import type { LessonResult } from '../lib/progress';
import { canListenToChild, canSpeak, listenOnce, speak } from '../lib/speech';
import { Rooty } from './Rooty';

interface Props {
  course: Course;
  lesson: Lesson;
  childName: string;
  age: number;
  elderId: string | undefined;
  showRoman: boolean;
  onFinish: (result: LessonResult) => void;
  onQuit: () => void;
}

const CHEERS = ['Yay!', 'Super!', 'Well done!', 'Brilliant!', 'You got it!'];

/**
 * Plays a lesson. There are no hearts or penalties: a wrong pick fades away and
 * the child tries again, so every lesson ends in success.
 */
export function LessonPlayer({ course, lesson, childName, age, elderId, showRoman, onFinish, onQuit }: Props) {
  const elder = elderFor(course, elderId);
  const steps = useMemo(
    () => buildLesson(course, lesson, { age, childName, elder, canListen: canSpeak(course.ttsLang) }),
    [course, lesson, age, childName, elder],
  );
  const [i, setI] = useState(0);
  // A new-word card needs no answer, so it starts out solved.
  const [solved, setSolved] = useState(steps[0]?.type === 'intro');
  const [said, setSaid] = useState<('hello' | 'sentence')[]>([]);
  const started = useRef(Date.now());
  const ex = steps[i];

  function next() {
    if (i + 1 >= steps.length) {
      onFinish({
        courseCode: course.code,
        lessonId: lesson.id,
        wordIds: lesson.words,
        said,
        seconds: (Date.now() - started.current) / 1000,
      });
      return;
    }
    setI(i + 1);
    setSolved(steps[i + 1].type === 'intro');
  }

  const solve = () => setSolved(true);

  return (
    <div className="screen lesson">
      <header className="lesson-top">
        <button className="icon-btn" onClick={onQuit} aria-label="Leave lesson">
          ✕
        </button>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={i}>
          <div className="bar-fill" style={{ width: `${(i / steps.length) * 100}%` }} />
        </div>
      </header>

      <main className="exercise" key={i}>
        {ex.type === 'intro' && <Intro word={ex.word} course={course} showRoman={showRoman} />}
        {(ex.type === 'pick-picture' || ex.type === 'listen' || ex.type === 'pick-word') && (
          <Pick ex={ex} course={course} showRoman={showRoman} onSolved={solve} />
        )}
        {ex.type === 'match' && <Match pairs={ex.pairs} course={course} onSolved={solve} />}
        {ex.type === 'build' && <Build ex={ex} course={course} showRoman={showRoman} onSolved={solve} />}
        {ex.type === 'say' && (
          <Say
            ex={ex}
            course={course}
            showRoman={showRoman}
            onSolved={() => {
              if (ex.milestone) setSaid((s) => [...s, ex.milestone!]);
              solve();
            }}
          />
        )}
      </main>

      <footer className={`footer ${solved && ex.type !== 'intro' ? 'cheer' : ''}`}>
        {solved && ex.type !== 'intro' && <div className="feedback-text">🌟 {CHEERS[i % CHEERS.length]}</div>}
        <button className="btn primary" disabled={!solved} onClick={next}>
          {i + 1 >= steps.length && solved ? 'Finish' : 'Next'}
        </button>
      </footer>
    </div>
  );
}

function SpeakButton({ text, lang, big, label = 'Play sound' }: { text: string; lang: string; big?: boolean; label?: string }) {
  if (!canSpeak(lang)) return null;
  return (
    <button className={`speak ${big ? 'big' : ''}`} onClick={() => speak(text, lang)} aria-label={label}>
      🔊
    </button>
  );
}

function Intro({ word, course, showRoman }: { word: Word; course: Course; showRoman: boolean }) {
  useEffect(() => speak(word.native, course.ttsLang), [word, course.ttsLang]);
  return (
    <>
      <h1 className="prompt-title">New word!</h1>
      <div className="intro-card">
        <span className="hero-emoji" aria-hidden="true">
          {word.emoji}
        </span>
        <span className="native">{word.native}</span>
        {showRoman && <span className="roman">{word.roman}</span>}
        <span className="meaning">{word.en}</span>
        <SpeakButton text={word.native} lang={course.ttsLang} big />
      </div>
    </>
  );
}

function Pick({
  ex,
  course,
  showRoman,
  onSolved,
}: {
  ex: Extract<Exercise, { type: 'pick-picture' | 'listen' | 'pick-word' }>;
  course: Course;
  showRoman: boolean;
  onSolved: () => void;
}) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const { word } = ex;

  useEffect(() => {
    if (ex.type !== 'pick-word') speak(word.native, course.ttsLang);
  }, [ex.type, word, course.ttsLang]);

  function choose(opt: Word) {
    if (right) return;
    speak(opt.native, course.ttsLang);
    if (opt.id === word.id) {
      setRight(true);
      onSolved();
    } else {
      setWrong((w) => [...w, opt.id]);
    }
  }

  const title =
    ex.type === 'listen' ? 'Listen! Which one is it?' : ex.type === 'pick-picture' ? 'Find the picture!' : `Which word is ${word.emoji}?`;

  return (
    <>
      <h1 className="prompt-title">{title}</h1>
      {ex.type === 'pick-picture' && (
        <div className="prompt-card">
          <SpeakButton text={word.native} lang={course.ttsLang} />
          <span className="native">{word.native}</span>
          {showRoman && <span className="roman">{word.roman}</span>}
        </div>
      )}
      {ex.type === 'listen' && (
        <div className="prompt-card">
          <SpeakButton text={word.native} lang={course.ttsLang} big />
        </div>
      )}
      {ex.type === 'pick-word' && (
        <div className="prompt-card">
          <span className="hero-emoji" aria-hidden="true">
            {word.emoji}
          </span>
        </div>
      )}
      <div className={`options ${ex.type === 'pick-word' ? '' : 'pictures'}`}>
        {ex.options.map((opt) => {
          const isWrong = wrong.includes(opt.id);
          const isRight = right && opt.id === word.id;
          return (
            <button
              key={opt.id}
              className={`option ${isWrong ? 'faded' : ''} ${isRight ? 'right' : ''}`}
              disabled={isWrong}
              onClick={() => choose(opt)}
              aria-label={ex.type === 'pick-word' ? opt.native : opt.en}
            >
              {ex.type === 'pick-word' ? (
                <>
                  <span className="native-sm">{opt.native}</span>
                  {showRoman && <small className="roman">{opt.roman}</small>}
                </>
              ) : (
                <>
                  <span className="emoji" aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <small>{opt.en}</small>
                </>
              )}
            </button>
          );
        })}
      </div>
      {wrong.length > 0 && !right && <p className="muted hint">Almost! Try another one.</p>}
    </>
  );
}

function Match({ pairs, course, onSolved }: { pairs: Word[]; course: Course; onSolved: () => void }) {
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
      const done = new Set(matched).add(w.id);
      setMatched(done);
      setPicked(null);
      if (done.size === pairs.length) onSolved();
    } else {
      setMiss(`${side}-${w.id}`);
      setPicked(null);
      setTimeout(() => setMiss(null), 450);
    }
  }

  const cls = (side: 'l' | 'r', w: Word) =>
    `option tile ${matched.has(w.id) ? 'matched' : ''} ${picked?.side === side && picked.id === w.id ? 'selected' : ''} ${
      miss === `${side}-${w.id}` ? 'miss' : ''
    }`;

  return (
    <>
      <h1 className="prompt-title">Match the pairs!</h1>
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
            <button key={w.id} className={cls('r', w)} onClick={() => tap('r', w)} aria-label={w.en}>
              <span className="emoji-sm" aria-hidden="true">
                {w.emoji}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Build({
  ex,
  course,
  showRoman,
  onSolved,
}: {
  ex: Extract<Exercise, { type: 'build' }>;
  course: Course;
  showRoman: boolean;
  onSolved: () => void;
}) {
  const [used, setUsed] = useState<number[]>([]);
  const [state, setState] = useState<'building' | 'right' | 'wrong'>('building');
  const prompt = ex.sentence.native.join(' ');

  useEffect(() => speak(prompt, course.ttsLang), [prompt, course.ttsLang]);

  function update(next: number[]) {
    setUsed(next);
    setState('building');
    if (next.length === ex.sentence.en.length) {
      const ok = isBuildCorrect(ex, next.map((j) => ex.bank[j]));
      setState(ok ? 'right' : 'wrong');
      if (ok) onSolved();
    }
  }

  return (
    <>
      <h1 className="prompt-title">What does it mean?</h1>
      <div className="sentence-prompt">
        <Rooty size={56} leaves={3} />
        <div className="bubble">
          <SpeakButton text={prompt} lang={course.ttsLang} />
          <span className="native-sm">{prompt}</span>
          {showRoman && <small className="roman">{ex.sentence.roman}</small>}
        </div>
      </div>
      <div className={`answer-line ${state}`}>
        {used.map((j, pos) => (
          <button
            key={`${j}-${pos}`}
            className="option tile"
            disabled={state === 'right'}
            onClick={() => update(used.filter((_, k) => k !== pos))}
          >
            {ex.bank[j]}
          </button>
        ))}
      </div>
      <div className="bank">
        {ex.bank.map((t, j) => (
          <button
            key={j}
            className={`option tile ${used.includes(j) ? 'ghost' : ''}`}
            disabled={used.includes(j) || state === 'right'}
            onClick={() => update([...used, j])}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="muted hint">{state === 'wrong' ? 'Not quite. Tap a word to take it back.' : 'Tap the words in order'}</p>
    </>
  );
}

function Say({
  ex,
  course,
  showRoman,
  onSolved,
}: {
  ex: Extract<Exercise, { type: 'say' }>;
  course: Course;
  showRoman: boolean;
  onSolved: () => void;
}) {
  const [state, setState] = useState<'ready' | 'listening' | 'heard' | 'retry'>('ready');
  const mic = canListenToChild();

  useEffect(() => speak(ex.line.native, course.ttsLang), [ex.line.native, course.ttsLang]);

  async function listen() {
    setState('listening');
    const heard = await listenOnce(course.ttsLang);
    // Any speech counts: the goal is a confident try, not perfect pronunciation.
    if (heard) {
      setState('heard');
      onSolved();
    } else {
      setState('retry');
    }
  }

  function selfReport() {
    setState('heard');
    onSolved();
  }

  return (
    <>
      <h1 className="prompt-title">Tap and say it!</h1>
      <div className="scene">
        <div className="call">
          <span className="call-face" aria-hidden="true">
            📱
          </span>
          <p>{ex.scene}</p>
        </div>
        <div className="say-line">
          <SpeakButton text={ex.line.native} lang={course.ttsLang} label="Hear it first" />
          <span className="native">{ex.line.native}</span>
          {showRoman && <span className="roman">{ex.line.roman}</span>}
          <span className="meaning">{ex.line.en}</span>
        </div>
      </div>
      {state === 'heard' ? (
        <p className="said">🎉 Great talking!</p>
      ) : (
        <div className="say-actions">
          {mic && (
            <button className={`mic ${state === 'listening' ? 'on' : ''}`} onClick={listen} disabled={state === 'listening'}>
              {state === 'listening' ? '👂 Listening…' : '🎤 Say it'}
            </button>
          )}
          <button className="btn ghost" onClick={selfReport}>
            I said it!
          </button>
          {state === 'retry' && <p className="muted hint">I didn’t catch that. Try again a little louder!</p>}
        </div>
      )}
    </>
  );
}
