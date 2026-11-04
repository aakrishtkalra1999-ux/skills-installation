import { COURSES, getCourse } from '../data/courses';

export const MAX_HEARTS = 5;
export const HEART_REFILL_MS = 20 * 60 * 1000;
export const XP_PER_LESSON = 10;
export const PERFECT_BONUS = 5;

export interface Progress {
  courseCode: string | null;
  dailyGoal: number;
  showRoman: boolean;
  xp: number;
  /** XP earned per day, keyed by YYYY-MM-DD in the learner's local time. */
  xpByDay: Record<string, number>;
  streak: number;
  lastActiveDay: string | null;
  hearts: number;
  /** When the next heart is due, if hearts are below the maximum. */
  heartsRefillAt: number | null;
  /** Times each lesson has been finished. */
  completed: Record<string, number>;
}

export const initialProgress: Progress = {
  courseCode: null,
  dailyGoal: 20,
  showRoman: true,
  xp: 0,
  xpByDay: {},
  streak: 0,
  lastActiveDay: null,
  hearts: MAX_HEARTS,
  heartsRefillAt: null,
  completed: {},
};

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const toUtc = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

/** The streak as it should be shown today: a missed day resets it to 0. */
export function currentStreak(p: Progress, now: Date): number {
  if (!p.lastActiveDay) return 0;
  return daysBetween(p.lastActiveDay, dayKey(now)) <= 1 ? p.streak : 0;
}

/** Adds any hearts that have refilled since the last check. */
export function refillHearts(p: Progress, now: number): Progress {
  if (p.hearts >= MAX_HEARTS || p.heartsRefillAt === null) return { ...p, heartsRefillAt: null };
  let hearts = p.hearts;
  let heartsRefillAt: number | null = p.heartsRefillAt;
  while (hearts < MAX_HEARTS && heartsRefillAt !== null && now >= heartsRefillAt) {
    hearts += 1;
    heartsRefillAt = hearts < MAX_HEARTS ? heartsRefillAt + HEART_REFILL_MS : null;
  }
  return { ...p, hearts, heartsRefillAt };
}

export function loseHeart(p: Progress, now: number): Progress {
  const hearts = Math.max(0, p.hearts - 1);
  return { ...p, hearts, heartsRefillAt: p.heartsRefillAt ?? now + HEART_REFILL_MS };
}

export function completeLesson(p: Progress, lessonId: string, mistakes: number, now: Date): Progress {
  const today = dayKey(now);
  const earned = XP_PER_LESSON + (mistakes === 0 ? PERFECT_BONUS : 0);
  let streak = p.streak;
  if (p.lastActiveDay !== today) {
    streak = p.lastActiveDay && daysBetween(p.lastActiveDay, today) === 1 ? p.streak + 1 : 1;
  }
  return {
    ...p,
    xp: p.xp + earned,
    xpByDay: { ...p.xpByDay, [today]: (p.xpByDay[today] ?? 0) + earned },
    streak,
    lastActiveDay: today,
    completed: { ...p.completed, [lessonId]: (p.completed[lessonId] ?? 0) + 1 },
  };
}

/** Lessons unlock in order: a lesson is open once the one before it has been finished. */
export function unlockedLessonIds(p: Progress, courseCode: string): Set<string> {
  const ids = getCourse(courseCode).units.flatMap((u) => u.lessons.map((l) => l.id));
  const open = new Set<string>();
  for (let i = 0; i < ids.length; i++) {
    if (i === 0 || p.completed[ids[i - 1]]) open.add(ids[i]);
    else break;
  }
  return open;
}

const STORAGE_KEY = 'boli-progress-v1';

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const saved = { ...initialProgress, ...JSON.parse(raw) } as Progress;
    if (saved.courseCode && !COURSES.some((c) => c.code === saved.courseCode)) saved.courseCode = null;
    return saved;
  } catch {
    return initialProgress;
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Storage can be unavailable (private mode); progress then lasts for this visit only.
  }
}
