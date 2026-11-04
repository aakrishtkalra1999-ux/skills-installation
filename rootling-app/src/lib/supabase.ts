import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The Supabase client, or null when the keys aren't set. Without keys the app
 * still works: progress stays on this device and the waitlist form explains
 * that sign-ups aren't open yet.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export const cloudEnabled = supabase !== null;

/** Where email links (confirm sign-up, reset password) send parents back to. */
export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  // Preview deployments have their own address, so prefer where the app is actually running.
  if (typeof window !== 'undefined' && window.location.origin.startsWith('http')) return window.location.origin;
  return configured ?? 'http://localhost:5173';
}
