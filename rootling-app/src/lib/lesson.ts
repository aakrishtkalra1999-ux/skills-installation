import { EN_DISTRACTORS } from '../data/courses';
import type { Course, Lesson, Line, Sentence, Word } from '../data/types';
import { lineClip, sayId, sentenceId, type Clip } from './clips';
import { personaliseLine, READING_AGE } from './personalise';

export type Exercise =
  | { type: 'intro'; word: Word }
  | { type: 'pick-picture'; word: Word; options: Word[] }
  | { type: 'listen'; word: Word; options: Word[] }
  | { type: 'pick-word'; word: Word; options: Word[] }
  | { type: 'match'; pairs: Word[] }
  | { type: 'say'; scene: string; line: Line; clip: Clip; milestone?: 'hello' | 'sentence' }
  | { type: 'build'; sentence: Sentence; bank: string[]; clip: Clip };

export type Random = () => number;

export function shuffle<T>(items: T[], rand: Random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The right word plus 2 wrong ones (3 cards suit small hands), with distinct pictures and meanings. */
function optionsFor(word: Word, lessonWords: Word[], course: Course, rand: Random): Word[] {
  const ok = (w: Word) => w.id !== word.id && w.emoji !== word.emoji && w.en !== word.en;
  const pool = [...shuffle(lessonWords.filter(ok), rand), ...shuffle(course.words.filter((w) => ok(w) && !lessonWords.includes(w)), rand)];
  const wrong: Word[] = [];
  for (const w of pool) {
    if (wrong.length === 2) break;
    if (wrong.every((x) => x.emoji !== w.emoji && x.en !== w.en)) wrong.push(w);
  }
  return shuffle([word, ...wrong], rand);
}

export interface BuildOptions {
  age: number;
  childName: string;
  elder: Word;
  canListen?: boolean;
  rand?: Random;
}

/**
 * A lesson of about 8–14 short steps: meet each new word, find it by picture and
 * by sound, match pairs, then say a personalised line out loud. Children who can
 * read also pick written words and build sentences.
 */
export function buildLesson(course: Course, lesson: Lesson, opts: BuildOptions): Exercise[] {
  const rand = opts.rand ?? Math.random;
  const reader = opts.age >= READING_AGE;
  const byId = new Map(course.words.map((w) => [w.id, w]));
  const words = lesson.words.map((id) => {
    const w = byId.get(id);
    if (!w) throw new Error(`Lesson ${lesson.id} references unknown word ${id}`);
    return w;
  });

  const steps: Exercise[] = [];
  for (const word of words) {
    steps.push({ type: 'intro', word });
    steps.push({ type: 'pick-picture', word, options: optionsFor(word, words, course, rand) });
  }
  shuffle(words, rand)
    .slice(0, 3)
    .forEach((word, i) => {
      if (opts.canListen && i % 2 === 0) steps.push({ type: 'listen', word, options: optionsFor(word, words, course, rand) });
      else if (reader) steps.push({ type: 'pick-word', word, options: optionsFor(word, words, course, rand) });
    });
  if (words.length >= 3) steps.push({ type: 'match', pairs: words.slice(0, 4) });
  if (reader) {
    (lesson.sentences ?? []).forEach((sentence, n) => {
      const extras = shuffle(EN_DISTRACTORS.filter((t) => !sentence.en.includes(t)), rand).slice(0, 2);
      const native = sentence.native.join(' ');
      const clip = lineClip(course, sentenceId(lesson.id, n + 1), { native, roman: sentence.roman, en: '' }, opts.elder, native);
      steps.push({ type: 'build', sentence, bank: shuffle([...sentence.en, ...extras], rand), clip });
    });
  }
  (lesson.say ?? []).forEach((say, n) => {
    const line = personaliseLine(say.line, opts.childName, opts.elder);
    steps.push({
      type: 'say',
      scene: say.scene.replaceAll('{name}', opts.childName).replaceAll('{gp}', opts.elder.roman),
      line,
      clip: lineClip(course, sayId(lesson.id, n + 1), say.line, opts.elder, line.native),
      milestone: say.milestone,
    });
  });
  return steps;
}

export function isBuildCorrect(ex: Extract<Exercise, { type: 'build' }>, picked: string[]): boolean {
  const norm = (t: string[]) => t.join(' ').toLowerCase().trim();
  return norm(picked) === norm(ex.sentence.en);
}
