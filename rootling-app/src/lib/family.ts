import type { Subscription } from './cloud';
import { initialProgress, loadLegacyProgress, type Progress } from './progress';
import type { ChildProfile } from './personalise';

/** Up to four children per parent account, as the Sprout plan promises. */
export const MAX_CHILDREN = 4;

export interface ChildRecord {
  id: string;
  /** When anything about this child last changed on this device (ISO time). */
  updatedAt: string;
  /** Saved to the cloud at least once, so a missing cloud copy means it was deleted on another device. */
  synced: boolean;
  progress: Progress;
}

/** Everything the app keeps on this device for one parent account (or for this device, without accounts). */
export interface Family {
  /** When the parent agreed. With accounts this mirrors the parent's profile, cached for offline use. */
  consentAt: string | null;
  activeChildId: string | null;
  children: ChildRecord[];
  /** Child ids changed since the last successful sync. */
  pending: string[];
  /** Child ids deleted on this device but not yet in the cloud. */
  deleted: string[];
  /** The last subscription status seen, so a paying family keeps every lesson while offline. */
  plan: Subscription | null;
}

export const emptyFamily: Family = { consentAt: null, activeChildId: null, children: [], pending: [], deleted: [], plan: null };

export function newChildId(): string {
  return crypto.randomUUID();
}

export interface NewChild {
  courseCode: string;
  child: ChildProfile;
  elderId: string;
}

export function addChild(f: Family, c: NewChild, now: Date, id = newChildId()): Family {
  if (f.children.length >= MAX_CHILDREN) return f;
  const progress: Progress = {
    ...initialProgress,
    consent: true,
    courseCode: c.courseCode,
    child: c.child,
    elderByCourse: { [c.courseCode]: c.elderId },
  };
  const record: ChildRecord = { id, updatedAt: now.toISOString(), synced: false, progress };
  return { ...f, children: [...f.children, record], activeChildId: id, pending: [...new Set([...f.pending, id])] };
}

export function activeChild(f: Family): ChildRecord | null {
  return f.children.find((c) => c.id === f.activeChildId) ?? null;
}

export function updateChild(f: Family, id: string, progress: Progress, now: Date): Family {
  return {
    ...f,
    children: f.children.map((c) => (c.id === id ? { ...c, progress, updatedAt: now.toISOString() } : c)),
    pending: [...new Set([...f.pending, id])],
  };
}

export function removeChild(f: Family, id: string): Family {
  const child = f.children.find((c) => c.id === id);
  return {
    ...f,
    children: f.children.filter((c) => c.id !== id),
    activeChildId: f.activeChildId === id ? null : f.activeChildId,
    pending: f.pending.filter((p) => p !== id),
    deleted: child?.synced ? [...new Set([...f.deleted, id])] : f.deleted,
  };
}

function maxMap(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}

/**
 * Combines learning from two copies of the same child (e.g. a tablet and a phone)
 * so nothing a child did on either device is lost. Settings and the child's
 * profile come from `primary`, the copy that changed most recently.
 */
export function mergeProgress(primary: Progress, other: Progress): Progress {
  const learned: Record<string, string[]> = {};
  for (const code of new Set([...Object.keys(primary.learned), ...Object.keys(other.learned)])) {
    learned[code] = [...new Set([...(primary.learned[code] ?? []), ...(other.learned[code] ?? [])])];
  }
  const milestones = { ...other.milestones };
  for (const [id, at] of Object.entries(primary.milestones)) if (!milestones[id] || at < milestones[id]) milestones[id] = at;

  const a = primary.lastActiveDay ?? '';
  const b = other.lastActiveDay ?? '';
  const streak = a === b ? Math.max(primary.streak, other.streak) : a > b ? primary.streak : other.streak;

  return {
    ...primary,
    elderByCourse: { ...other.elderByCourse, ...primary.elderByCourse },
    learned,
    // Counts and minutes take the larger value rather than the sum, so syncing the same session twice never double-counts.
    completed: maxMap(primary.completed, other.completed),
    storiesRead: maxMap(primary.storiesRead, other.storiesRead),
    secondsByDay: maxMap(primary.secondsByDay, other.secondsByDay),
    streak,
    lastActiveDay: a >= b ? primary.lastActiveDay : other.lastActiveDay,
    milestones,
  };
}

export function mergeChild(local: ChildRecord, remote: ChildRecord): ChildRecord {
  const localNewer = local.updatedAt >= remote.updatedAt;
  const progress = localNewer ? mergeProgress(local.progress, remote.progress) : mergeProgress(remote.progress, local.progress);
  return { id: local.id, synced: true, updatedAt: localNewer ? local.updatedAt : remote.updatedAt, progress };
}

/**
 * Brings this device's copy of a family together with the cloud copy.
 * Returns the merged family and which children must be uploaded.
 */
export function reconcile(local: Family, remote: ChildRecord[]): { family: Family; push: string[] } {
  const byId = new Map(local.children.map((c) => [c.id, c]));
  const deleted = new Set(local.deleted);
  const children: ChildRecord[] = [];
  const push = new Set<string>();

  for (const r of remote) {
    if (deleted.has(r.id)) continue;
    const l = byId.get(r.id);
    if (!l) {
      children.push(r);
      continue;
    }
    const merged = mergeChild(l, r);
    children.push(merged);
    if (JSON.stringify(merged.progress) !== JSON.stringify(r.progress)) push.add(r.id);
  }
  const remoteIds = new Set(remote.map((r) => r.id));
  for (const l of local.children) {
    if (remoteIds.has(l.id)) continue;
    // Previously synced but gone from the cloud: a parent deleted this child on another device.
    if (l.synced && !local.pending.includes(l.id)) continue;
    children.push(l);
    push.add(l.id);
  }
  const activeChildId = children.some((c) => c.id === local.activeChildId) ? local.activeChildId : null;
  return { family: { ...local, children, activeChildId, pending: [...push] }, push: [...push] };
}

const KEY_PREFIX = 'rootling-family-v2';

/** One saved family per parent account, plus one for using the app without an account. */
export function storageKey(userId: string | null): string {
  return userId ? `${KEY_PREFIX}:${userId}` : `${KEY_PREFIX}:device`;
}

export function loadFamily(key: string): Family {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const f = { ...emptyFamily, ...JSON.parse(raw) } as Family;
      f.children = f.children.map((c) => ({ ...c, progress: { ...initialProgress, ...c.progress } }));
      return f;
    }
  } catch {
    // Fall through to an empty family.
  }
  return emptyFamily;
}

export function saveFamily(key: string, f: Family): void {
  try {
    localStorage.setItem(key, JSON.stringify(f));
  } catch {
    // Storage can be unavailable (private mode); the family then lasts for this visit only.
  }
}

export function clearFamily(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing stored.
  }
}

/** A child set up before Rootling had families (one child per device), if there is one. */
export function legacyChild(): (NewChild & { progress: Progress }) | null {
  const p = loadLegacyProgress();
  if (!p || !p.child || !p.courseCode) return null;
  return { courseCode: p.courseCode, child: p.child, elderId: p.elderByCourse[p.courseCode] ?? '', progress: { ...p, consent: true } };
}

/** Adds the pre-accounts child to a family, keeping everything they learned. */
export function importLegacy(f: Family, now: Date): Family {
  const legacy = legacyChild();
  if (!legacy || f.children.length >= MAX_CHILDREN) return f;
  const withChild = addChild(f, legacy, now);
  const id = withChild.activeChildId!;
  return updateChild(withChild, id, legacy.progress, now);
}
