import { COURSES } from '../data/courses';
import type { Topic } from '../data/types';
import type { ChildProfile } from './personalise';

export interface Progress {
  /** A parent agreed before any child details were entered. Everything stays on this device. */
  consent: boolean;
  courseCode: string | null;
  child: ChildProfile | null;
  /** The family member the child talks to, per course (a word id). */
  elderByCourse: Record<string, string>;
  showRoman: boolean;
  /** Word ids the child has finished a lesson with, per course. Each is a leaf on Rooty. */
  learned: Record<string, string[]>;
  completed: Record<string, number>;
  storiesRead: Record<string, number>;
  secondsByDay: Record<string, number>;
  streak: number;
  lastActiveDay: string | null;
  /** Milestone id → ISO time it was reached. */
  milestones: Record<string, string>;
}

export const initialProgress: Progress = {
  consent: false,
  courseCode: null,
  child: null,
  elderByCourse: {},
  showRoman: true,
  learned: {},
  completed: {},
  storiesRead: {},
  secondsByDay: {},
  streak: 0,
  lastActiveDay: null,
  milestones: {},
};

export const MILESTONES = [
  { id: 'first-lesson', label: 'Finished a first lesson' },
  { id: 'hello', label: 'Said hello to {gp}' },
  { id: 'sentence', label: 'Said a first sentence to {gp}' },
  { id: 'words-10', label: 'Learned 10 words' },
  { id: 'words-25', label: 'Learned 25 words' },
  { id: 'first-story', label: 'Read a first bedtime story' },
  { id: 'streak-3', label: 'Practised 3 days in a row' },
  { id: 'streak-7', label: 'Practised 7 days in a row' },
] as const;

export type MilestoneId = (typeof MILESTONES)[number]['id'];

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const utc = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}

/** The streak as shown today: missing a whole day resets it. */
export function currentStreak(p: Progress, now: Date): number {
  if (!p.lastActiveDay) return 0;
  return daysBetween(p.lastActiveDay, dayKey(now)) <= 1 ? p.streak : 0;
}

function markActive(p: Progress, now: Date, seconds: number): Progress {
  const today = dayKey(now);
  let streak = p.streak;
  if (p.lastActiveDay !== today) streak = p.lastActiveDay && daysBetween(p.lastActiveDay, today) === 1 ? p.streak + 1 : 1;
  return {
    ...p,
    streak,
    lastActiveDay: today,
    secondsByDay: { ...p.secondsByDay, [today]: (p.secondsByDay[today] ?? 0) + Math.round(seconds) },
  };
}

function award(p: Progress, ids: MilestoneId[], now: Date): { progress: Progress; earned: MilestoneId[] } {
  const earned = ids.filter((id) => !p.milestones[id]);
  if (earned.length === 0) return { progress: p, earned };
  const milestones = { ...p.milestones };
  for (const id of earned) milestones[id] = now.toISOString();
  return { progress: { ...p, milestones }, earned };
}

function totalWords(p: Progress): number {
  return Object.values(p.learned).reduce((n, ids) => n + ids.length, 0);
}

function streakMilestones(p: Progress): MilestoneId[] {
  const out: MilestoneId[] = [];
  if (p.streak >= 3) out.push('streak-3');
  if (p.streak >= 7) out.push('streak-7');
  return out;
}

export interface LessonResult {
  courseCode: string;
  lessonId: string;
  wordIds: string[];
  said: ('hello' | 'sentence')[];
  seconds: number;
}

export function completeLesson(p: Progress, r: LessonResult, now: Date) {
  let next = markActive(p, now, r.seconds);
  const before = new Set(next.learned[r.courseCode] ?? []);
  const newWords = r.wordIds.filter((id) => !before.has(id));
  next = {
    ...next,
    learned: { ...next.learned, [r.courseCode]: [...before, ...newWords] },
    completed: { ...next.completed, [r.lessonId]: (next.completed[r.lessonId] ?? 0) + 1 },
  };
  const ids: MilestoneId[] = ['first-lesson', ...r.said, ...streakMilestones(next)];
  if (totalWords(next) >= 10) ids.push('words-10');
  if (totalWords(next) >= 25) ids.push('words-25');
  const { progress, earned } = award(next, ids, now);
  return { progress, newWords, earned };
}

export function completeStory(p: Progress, storyId: string, seconds: number, now: Date) {
  const next = markActive({ ...p, storiesRead: { ...p.storiesRead, [storyId]: (p.storiesRead[storyId] ?? 0) + 1 } }, now, seconds);
  return award(next, ['first-story', ...streakMilestones(next)], now);
}

/** Lessons unlock in path order: one is open once the one before it is finished. */
export function unlockedLessonIds(p: Progress, lessonIds: string[]): Set<string> {
  const open = new Set<string>();
  for (let i = 0; i < lessonIds.length; i++) {
    if (i === 0 || p.completed[lessonIds[i - 1]]) open.add(lessonIds[i]);
    else break;
  }
  return open;
}

export function setFavourites(p: Progress, favourites: Topic[]): Progress {
  return p.child ? { ...p, child: { ...p.child, favourites } } : p;
}

const STORAGE_KEY = 'rootling-progress-v1';

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

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
}
