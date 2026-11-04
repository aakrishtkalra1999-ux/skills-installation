import { supabase } from './supabase';

/** Languages families can ask for: the ones Rootling teaches, plus the next ones on the roadmap. */
export const WAITLIST_LANGUAGES = ['Tamil', 'Telugu', 'Punjabi', 'Gujarati', 'Malayalam', 'Bengali', 'Hindi', 'Kannada', 'Marathi', 'Other'];

export const WAITLIST_COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'United Arab Emirates', 'New Zealand', 'Other'];

export interface WaitlistEntry {
  email: string;
  language: string;
  country: string;
}

export type WaitlistResult = { ok: true } | { ok: false; message: string };

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function joinWaitlist(entry: WaitlistEntry): Promise<WaitlistResult> {
  if (!validEmail(entry.email)) return { ok: false, message: 'Please check your email address.' };
  if (!supabase) return { ok: false, message: 'The waitlist isn’t open yet. Please check back soon!' };
  const { error } = await supabase.from('waitlist').insert({
    email: entry.email.trim().toLowerCase(),
    language: entry.language,
    country: entry.country || null,
  });
  // 23505 = already on the list for this language, which is fine.
  if (error && error.code !== '23505') return { ok: false, message: 'Sorry, that didn’t work. Please try again in a moment.' };
  return { ok: true };
}
