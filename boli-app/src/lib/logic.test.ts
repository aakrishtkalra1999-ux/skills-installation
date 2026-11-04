import { describe, expect, it } from 'vitest';
import { COURSES } from '../data/courses';
import { buildLesson, isBuildCorrect } from './lesson';
import {
  completeLesson,
  currentStreak,
  HEART_REFILL_MS,
  initialProgress,
  loseHeart,
  MAX_HEARTS,
  refillHearts,
  unlockedLessonIds,
} from './progress';

describe('course data', () => {
  for (const course of COURSES) {
    it(`${course.name}: every lesson builds, options are unique and include the answer`, () => {
      const ids = new Set(course.words.map((w) => w.id));
      expect(ids.size).toBe(course.words.length);
      for (const lesson of course.units.flatMap((u) => u.lessons)) {
        const exercises = buildLesson(course, lesson, { canListen: true });
        expect(exercises.length).toBeGreaterThanOrEqual(5);
        for (const ex of exercises) {
          if (ex.type === 'pick-meaning' || ex.type === 'pick-native' || ex.type === 'listen') {
            expect(ex.options).toContain(ex.word);
            expect(new Set(ex.options.map((o) => o.en)).size).toBe(ex.options.length);
          }
          if (ex.type === 'build') {
            const answer = ex.direction === 'to-en' ? ex.sentence.en : ex.sentence.native;
            for (const t of answer) expect(ex.bank).toContain(t);
            expect(isBuildCorrect(ex, answer)).toBe(true);
            expect(isBuildCorrect(ex, [...answer].reverse())).toBe(answer.length < 2);
          }
        }
      }
    });
  }
});

describe('progress', () => {
  const day = (s: string) => new Date(`${s}T12:00:00`);

  it('grows the streak on consecutive days and resets after a gap', () => {
    let p = completeLesson(initialProgress, 'a', 0, day('2026-11-01'));
    expect(p.streak).toBe(1);
    p = completeLesson(p, 'b', 1, day('2026-11-01'));
    expect(p.streak).toBe(1);
    p = completeLesson(p, 'c', 0, day('2026-11-02'));
    expect(p.streak).toBe(2);
    expect(currentStreak(p, day('2026-11-03'))).toBe(2);
    expect(currentStreak(p, day('2026-11-04'))).toBe(0);
    p = completeLesson(p, 'd', 0, day('2026-11-05'));
    expect(p.streak).toBe(1);
  });

  it('awards a bonus for a perfect lesson', () => {
    expect(completeLesson(initialProgress, 'a', 0, day('2026-11-01')).xp).toBe(15);
    expect(completeLesson(initialProgress, 'a', 2, day('2026-11-01')).xp).toBe(10);
  });

  it('loses and refills hearts over time', () => {
    let p = loseHeart(loseHeart(initialProgress, 0), 1000);
    expect(p.hearts).toBe(MAX_HEARTS - 2);
    p = refillHearts(p, HEART_REFILL_MS - 1);
    expect(p.hearts).toBe(MAX_HEARTS - 2);
    p = refillHearts(p, HEART_REFILL_MS * 2);
    expect(p.hearts).toBe(MAX_HEARTS);
    expect(p.heartsRefillAt).toBeNull();
  });

  it('unlocks lessons in order', () => {
    const p = completeLesson({ ...initialProgress, courseCode: 'hi' }, 'hi-u1-l1', 0, day('2026-11-01'));
    expect([...unlockedLessonIds(p, 'hi')]).toEqual(['hi-u1-l1', 'hi-u1-l2']);
  });
});
