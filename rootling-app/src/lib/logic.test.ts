import { describe, expect, it } from 'vitest';
import { COURSES, getCourse } from '../data/courses';
import { buildLesson, isBuildCorrect } from './lesson';
import { elderFor, orderedUnits, personaliseLine } from './personalise';
import { completeLesson, completeStory, currentStreak, initialProgress, unlockedLessonIds, type LessonResult } from './progress';

const PLACEHOLDER = /\{(name|gp)\}/;

describe('course data', () => {
  for (const course of COURSES) {
    it(`${course.name}: ids are unique, elders exist, stories and say-lines are well formed`, () => {
      expect(new Set(course.words.map((w) => w.id)).size).toBe(course.words.length);
      expect(new Set(course.units.flatMap((u) => u.lessons.map((l) => l.id))).size).toBe(
        course.units.flatMap((u) => u.lessons).length,
      );
      expect(course.words.some((w) => w.elder)).toBe(true);
      expect(course.stories.length).toBeGreaterThan(0);
      const elder = elderFor(course, undefined);
      for (const page of course.stories.flatMap((s) => s.pages)) {
        const line = personaliseLine(page.line, 'Aarav', elder);
        expect(line.native + line.roman + line.en).not.toMatch(PLACEHOLDER);
      }
    });

    for (const age of [4, 8]) {
      it(`${course.name}, age ${age}: every lesson builds with valid options`, () => {
        const elder = elderFor(course, undefined);
        for (const lesson of course.units.flatMap((u) => u.lessons)) {
          const steps = buildLesson(course, lesson, { age, childName: 'Aarav', elder, canListen: true });
          expect(steps.length).toBeGreaterThanOrEqual(lesson.words.length * 2);
          for (const ex of steps) {
            if (ex.type === 'pick-picture' || ex.type === 'listen' || ex.type === 'pick-word') {
              expect(ex.options).toContain(ex.word);
              expect(ex.options).toHaveLength(3);
              expect(new Set(ex.options.map((o) => o.emoji)).size).toBe(3);
            }
            if (ex.type === 'build') {
              for (const t of ex.sentence.en) expect(ex.bank).toContain(t);
              expect(isBuildCorrect(ex, ex.sentence.en)).toBe(true);
            }
            if (ex.type === 'say') {
              expect(ex.scene + ex.line.native + ex.line.roman + ex.line.en).not.toMatch(PLACEHOLDER);
            }
          }
          // Under-6s never get exercises that need reading.
          if (age < 6) expect(steps.some((s) => s.type === 'pick-word' || s.type === 'build')).toBe(false);
        }
      });
    }
  }
});

describe('personalisation', () => {
  const tamil = getCourse('ta');

  it('puts the chosen elder in script in the native line and romanised elsewhere', () => {
    const thaatha = elderFor(tamil, 'thaatha');
    const line = personaliseLine({ native: 'வணக்கம், {gp}!', roman: 'Vanakkam, {gp}!', en: 'Hello, {gp}!' }, 'Meera', thaatha);
    expect(line).toEqual({ native: 'வணக்கம், தாத்தா!', roman: 'Vanakkam, Thaatha!', en: 'Hello, Thaatha!' });
  });

  it('keeps the first unit first and brings favourite topics forward', () => {
    expect(orderedUnits(tamil, ['numbers']).map((u) => u.topic)).toEqual(['family', 'numbers', 'food', 'animals', 'colours']);
  });
});

describe('progress', () => {
  const day = (s: string) => new Date(`${s}T12:00:00`);
  const lesson = (id: string, wordIds: string[] = ['vanakkam'], said: LessonResult['said'] = []): LessonResult => ({
    courseCode: 'ta',
    lessonId: id,
    wordIds,
    said,
    seconds: 300,
  });

  it('grows the streak on consecutive days and resets after a missed day', () => {
    let p = completeLesson(initialProgress, lesson('a'), day('2026-11-01')).progress;
    expect(p.streak).toBe(1);
    p = completeLesson(p, lesson('b'), day('2026-11-01')).progress;
    expect(p.streak).toBe(1);
    p = completeLesson(p, lesson('c'), day('2026-11-02')).progress;
    expect(p.streak).toBe(2);
    expect(currentStreak(p, day('2026-11-03'))).toBe(2);
    expect(currentStreak(p, day('2026-11-04'))).toBe(0);
    expect(completeLesson(p, lesson('d'), day('2026-11-05')).progress.streak).toBe(1);
  });

  it('counts each word once as a new leaf', () => {
    const first = completeLesson(initialProgress, lesson('a', ['vanakkam', 'nandri']), day('2026-11-01'));
    expect(first.newWords).toEqual(['vanakkam', 'nandri']);
    const again = completeLesson(first.progress, lesson('a', ['vanakkam', 'nandri', 'aam']), day('2026-11-01'));
    expect(again.newWords).toEqual(['aam']);
    expect(again.progress.learned.ta).toHaveLength(3);
  });

  it('awards each milestone once', () => {
    const r1 = completeLesson(initialProgress, lesson('a', ['vanakkam'], ['hello']), day('2026-11-01'));
    expect(r1.earned).toEqual(['first-lesson', 'hello']);
    const r2 = completeLesson(r1.progress, lesson('b', ['nandri'], ['hello', 'sentence']), day('2026-11-02'));
    expect(r2.earned).toEqual(['sentence']);
    const story = completeStory(r2.progress, 'ta-s1', 120, day('2026-11-03'));
    expect(story.earned).toEqual(['first-story', 'streak-3']);
  });

  it('unlocks lessons in path order', () => {
    const p = completeLesson(initialProgress, lesson('x1'), day('2026-11-01')).progress;
    expect([...unlockedLessonIds(p, ['x1', 'x2', 'x3'])]).toEqual(['x1', 'x2']);
  });
});
