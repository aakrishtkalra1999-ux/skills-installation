import { EN_DISTRACTORS } from '../data/courses';
import type { Course, Lesson, Sentence, Word } from '../data/types';

export type Exercise =
  | { type: 'pick-meaning'; word: Word; options: Word[] }
  | { type: 'pick-native'; word: Word; options: Word[] }
  | { type: 'listen'; word: Word; options: Word[] }
  | { type: 'match'; pairs: Word[] }
  | { type: 'build'; sentence: Sentence; direction: 'to-en' | 'to-native'; bank: string[] };

export type Random = () => number;

export function shuffle<T>(items: T[], rand: Random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function wordsById(course: Course): Map<string, Word> {
  return new Map(course.words.map((w) => [w.id, w]));
}

/** Picks the correct word plus up to 3 wrong options of the same kind, preferring words from this lesson. */
function optionsFor(word: Word, lessonWords: Word[], course: Course, rand: Random): Word[] {
  const sameKind = (w: Word) => (w.kind ?? 'word') === (word.kind ?? 'word') && w.id !== word.id && w.en !== word.en;
  const nearby = shuffle(lessonWords.filter(sameKind), rand);
  const rest = shuffle(course.words.filter((w) => sameKind(w) && !nearby.includes(w)), rand);
  const wrong = [...nearby, ...rest].slice(0, 3);
  return shuffle([word, ...wrong], rand);
}

function bankFor(sentence: Sentence, direction: 'to-en' | 'to-native', course: Course, rand: Random): string[] {
  const answer = direction === 'to-en' ? sentence.en : sentence.native;
  const pool =
    direction === 'to-en'
      ? EN_DISTRACTORS
      : course.words.filter((w) => (w.kind ?? 'word') === 'word').map((w) => w.native);
  const extras = shuffle(pool.filter((t) => !answer.includes(t)), rand).slice(0, 3);
  return shuffle([...answer, ...extras], rand);
}

/**
 * Builds a lesson of roughly 8–10 exercises: every new word is introduced with a
 * picture card, then practised in the other directions, then a matching round and
 * the lesson's sentences.
 */
export function buildLesson(
  course: Course,
  lesson: Lesson,
  opts: { rand?: Random; canListen?: boolean } = {},
): Exercise[] {
  const rand = opts.rand ?? Math.random;
  const byId = wordsById(course);
  const words = lesson.words.map((id) => {
    const w = byId.get(id);
    if (!w) throw new Error(`Lesson ${lesson.id} references unknown word ${id}`);
    return w;
  });

  const intro: Exercise[] = words.map((word) => ({
    type: 'pick-meaning',
    word,
    options: optionsFor(word, words, course, rand),
  }));

  const practice: Exercise[] = shuffle(words, rand).map((word, i) => {
    const listen = opts.canListen && i % 2 === 0;
    return {
      type: listen ? 'listen' : 'pick-native',
      word,
      options: optionsFor(word, words, course, rand),
    };
  });

  const match: Exercise[] = words.length >= 3 ? [{ type: 'match', pairs: words.slice(0, 5) }] : [];

  const build: Exercise[] = lesson.sentences.map((sentence, i) => {
    const direction = i % 2 === 0 ? 'to-en' : 'to-native';
    return { type: 'build', sentence, direction, bank: bankFor(sentence, direction, course, rand) };
  });

  return [...intro, ...practice.slice(0, 3), ...match, ...build];
}

const normalise = (tiles: string[]) => tiles.join(' ').toLowerCase().trim();

export function isBuildCorrect(ex: Extract<Exercise, { type: 'build' }>, picked: string[]): boolean {
  const answer = ex.direction === 'to-en' ? ex.sentence.en : ex.sentence.native;
  return normalise(picked) === normalise(answer);
}
