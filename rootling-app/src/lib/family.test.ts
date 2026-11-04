import { describe, expect, it } from 'vitest';
import { addChild, emptyFamily, MAX_CHILDREN, mergeProgress, reconcile, removeChild, updateChild, type ChildRecord } from './family';
import { fromRows, hasFullAccess, toRows } from './cloud';
import { completeLesson, initialProgress, type Progress } from './progress';

const aarav = { courseCode: 'ta', child: { name: 'Aarav', age: 5, favourites: [] }, elderId: 'paati' };
const meera = { courseCode: 'te', child: { name: 'Meera', age: 8, favourites: ['animals' as const] }, elderId: 'ammamma' };
const t0 = new Date('2026-11-01T10:00:00Z');
const t1 = new Date('2026-11-02T10:00:00Z');

function lesson(p: Progress, lessonId: string, words: string[], at: Date) {
  return completeLesson(p, { courseCode: p.courseCode!, lessonId, wordIds: words, said: [], seconds: 120 }, at).progress;
}

describe('families', () => {
  it('adds up to four children, each with their own progress, and marks them for upload', () => {
    let f = emptyFamily;
    for (let i = 0; i < 6; i++) f = addChild(f, { ...aarav, child: { ...aarav.child, name: `Child ${i}` } }, t0);
    expect(f.children).toHaveLength(MAX_CHILDREN);
    expect(f.pending).toHaveLength(MAX_CHILDREN);
    expect(f.activeChildId).toBe(f.children[3].id);
    expect(f.children[0].progress.elderByCourse).toEqual({ ta: 'paati' });
  });

  it('remembers deletions of synced children so the cloud copy is removed too', () => {
    let f = addChild(emptyFamily, aarav, t0, 'a');
    f = { ...f, children: f.children.map((c) => ({ ...c, synced: true })), pending: [] };
    f = removeChild(f, 'a');
    expect(f.children).toHaveLength(0);
    expect(f.deleted).toEqual(['a']);
    expect(f.activeChildId).toBeNull();
    // A child never uploaded needs no cloud deletion.
    expect(removeChild(addChild(emptyFamily, aarav, t0, 'b'), 'b').deleted).toEqual([]);
  });
});

describe('syncing two devices', () => {
  const base = addChild(emptyFamily, aarav, t0, 'kid').children[0];

  it('keeps everything a child learned on either device', () => {
    const laptop = lesson(base.progress, 'ta-u1-l1', ['vanakkam', 'nandri'], t0);
    const phone = lesson(base.progress, 'ta-u2-l1', ['paal', 'idli'], t1);
    const merged = mergeProgress(phone, laptop);
    expect(new Set(merged.learned.ta)).toEqual(new Set(['vanakkam', 'nandri', 'paal', 'idli']));
    expect(merged.completed).toEqual({ 'ta-u1-l1': 1, 'ta-u2-l1': 1 });
    expect(merged.lastActiveDay).toBe('2026-11-02');
    expect(merged.milestones['first-lesson']).toBe(t0.toISOString());
  });

  it('never double-counts minutes when the same copy is merged twice', () => {
    const p = lesson(base.progress, 'ta-u1-l1', ['vanakkam'], t0);
    expect(mergeProgress(p, p).secondsByDay).toEqual(p.secondsByDay);
  });

  it('downloads children added on another device and uploads ones only on this device', () => {
    const remote: ChildRecord = { ...addChild(emptyFamily, meera, t0, 'remote').children[0], synced: true };
    const local = addChild(emptyFamily, aarav, t0, 'local');
    const { family, push } = reconcile(local, [remote]);
    expect(family.children.map((c) => c.id).sort()).toEqual(['local', 'remote']);
    expect(push).toEqual(['local']);
  });

  it('drops a child that was deleted on another device', () => {
    const local = { ...addChild(emptyFamily, aarav, t0, 'gone'), pending: [] };
    local.children = local.children.map((c) => ({ ...c, synced: true }));
    expect(reconcile(local, []).family.children).toHaveLength(0);
  });

  it('uploads the merge when this device has progress the cloud lacks', () => {
    const cloud: ChildRecord = { ...base, synced: true };
    const local = updateChild({ ...emptyFamily, children: [cloud] }, 'kid', lesson(base.progress, 'ta-u1-l1', ['vanakkam'], t1), t1);
    const { family, push } = reconcile(local, [cloud]);
    expect(push).toEqual(['kid']);
    expect(family.children[0].progress.learned.ta).toEqual(['vanakkam']);
  });

  it('round-trips a child through the database rows', () => {
    const p = lesson({ ...base.progress, showRoman: false }, 'ta-u1-l1', ['vanakkam'], t0);
    const record: ChildRecord = { ...base, progress: p, synced: true };
    const rows = toRows('parent', record);
    expect(rows.child.first_name).toBe('Aarav');
    expect(Object.keys(rows.progress.data)).not.toContain('child');
    expect(fromRows(rows.child, rows.progress)).toEqual(record);
  });
});

describe('plans', () => {
  it('opens every lesson for trial, paid and retrying payments only', () => {
    const sub = (status: 'free' | 'trialing' | 'active' | 'past_due' | 'canceled') => ({
      status,
      trial_end: null,
      current_period_end: null,
      cancel_at_period_end: false,
    });
    expect(hasFullAccess(null)).toBe(false);
    expect(hasFullAccess(sub('free'))).toBe(false);
    expect(hasFullAccess(sub('canceled'))).toBe(false);
    expect(hasFullAccess(sub('trialing'))).toBe(true);
    expect(hasFullAccess(sub('active'))).toBe(true);
    expect(hasFullAccess(sub('past_due'))).toBe(true);
  });

  it('keeps initial progress free of any child details', () => {
    expect(initialProgress.child).toBeNull();
  });
});
