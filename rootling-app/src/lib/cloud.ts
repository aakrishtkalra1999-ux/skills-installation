import type { Topic } from '../data/types';
import type { ChildRecord } from './family';
import { initialProgress, type Progress } from './progress';
import { supabase } from './supabase';

/** A row of the `children` table: only what personalisation needs. */
export interface ChildRow {
  id: string;
  parent_id: string;
  first_name: string;
  age: number;
  favourites: Topic[];
  course_code: string;
  elder_by_course: Record<string, string>;
  show_roman: boolean;
  updated_at: string;
}

/** A row of the `progress` table: what the child has learned, never anything they said or typed. */
export interface ProgressRow {
  child_id: string;
  parent_id: string;
  data: Pick<Progress, 'learned' | 'completed' | 'storiesRead' | 'secondsByDay' | 'streak' | 'lastActiveDay' | 'milestones'>;
  updated_at: string;
}

export function toRows(parentId: string, c: ChildRecord): { child: ChildRow; progress: ProgressRow } {
  const p = c.progress;
  return {
    child: {
      id: c.id,
      parent_id: parentId,
      first_name: p.child!.name,
      age: p.child!.age,
      favourites: p.child!.favourites,
      course_code: p.courseCode!,
      elder_by_course: p.elderByCourse,
      show_roman: p.showRoman,
      updated_at: c.updatedAt,
    },
    progress: {
      child_id: c.id,
      parent_id: parentId,
      data: {
        learned: p.learned,
        completed: p.completed,
        storiesRead: p.storiesRead,
        secondsByDay: p.secondsByDay,
        streak: p.streak,
        lastActiveDay: p.lastActiveDay,
        milestones: p.milestones,
      },
      updated_at: c.updatedAt,
    },
  };
}

export function fromRows(child: ChildRow, progress: ProgressRow | undefined): ChildRecord {
  return {
    id: child.id,
    updatedAt: child.updated_at,
    synced: true,
    progress: {
      ...initialProgress,
      ...(progress?.data ?? {}),
      consent: true,
      courseCode: child.course_code,
      child: { name: child.first_name, age: child.age, favourites: child.favourites ?? [] },
      elderByCourse: child.elder_by_course ?? {},
      showRoman: child.show_roman,
    },
  };
}

function db() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

export async function pullChildren(): Promise<ChildRecord[]> {
  const [children, progress] = await Promise.all([
    db().from('children').select('*').order('created_at'),
    db().from('progress').select('*'),
  ]);
  if (children.error) throw children.error;
  if (progress.error) throw progress.error;
  const byChild = new Map((progress.data as ProgressRow[]).map((p) => [p.child_id, p]));
  return (children.data as ChildRow[]).map((c) => fromRows(c, byChild.get(c.id)));
}

export async function pushChild(parentId: string, c: ChildRecord): Promise<void> {
  const rows = toRows(parentId, c);
  const a = await db().from('children').upsert(rows.child);
  if (a.error) throw a.error;
  const b = await db().from('progress').upsert(rows.progress);
  if (b.error) throw b.error;
}

export async function deleteChildRemote(id: string): Promise<void> {
  // The progress row goes with it (on delete cascade).
  const { error } = await db().from('children').delete().eq('id', id);
  if (error) throw error;
}

export interface ParentProfile {
  id: string;
  consent_at: string | null;
}

export async function loadProfile(userId: string): Promise<ParentProfile | null> {
  const { data, error } = await db().from('profiles').select('id, consent_at').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as ParentProfile | null;
}

export async function recordConsent(userId: string): Promise<string> {
  const at = new Date().toISOString();
  const { error } = await db().from('profiles').upsert({ id: userId, consent_at: at });
  if (error) throw error;
  return at;
}

export type PlanStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled';

export interface Subscription {
  status: PlanStatus;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export async function loadSubscription(): Promise<Subscription | null> {
  const { data, error } = await db()
    .from('subscriptions')
    .select('status, trial_end, current_period_end, cancel_at_period_end')
    .maybeSingle();
  if (error) throw error;
  return data as Subscription | null;
}

/** Trial and paid families get every lesson; a failed payment keeps access while Stripe retries. */
export function hasFullAccess(sub: Subscription | null): boolean {
  return !!sub && (sub.status === 'trialing' || sub.status === 'active' || sub.status === 'past_due');
}

/** Everything Rootling stores about this family, as one JSON file the parent can keep. */
export async function exportFamilyData(userEmail: string | undefined): Promise<Blob> {
  const [profile, children, progress, subscription] = await Promise.all([
    db().from('profiles').select('*'),
    db().from('children').select('*'),
    db().from('progress').select('*'),
    db().from('subscriptions').select('status, trial_end, current_period_end, cancel_at_period_end, created_at, updated_at'),
  ]);
  for (const r of [profile, children, progress, subscription]) if (r.error) throw r.error;
  const payload = {
    exported_at: new Date().toISOString(),
    parent: { email: userEmail, profile: profile.data },
    children: children.data,
    progress: progress.data,
    subscription: subscription.data,
  };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}

/** Calls one of the app's server functions (api/ folder) as the signed-in parent. */
export async function callApi<T>(path: string, body: unknown = {}): Promise<T> {
  const { data } = await db().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please log in again.');
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `Something went wrong (${res.status}).`);
  return json;
}
