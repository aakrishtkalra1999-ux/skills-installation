// Shared helpers for the server functions in api/. Files starting with "_" are
// not deployed as routes by Vercel. Secret keys are read here, on the server,
// and never reach the browser.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new HttpError(500, `The server is missing the ${name} setting. Add it in Vercel → Settings → Environment Variables, then redeploy.`);
  return value;
}

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

/** Turns thrown errors into JSON responses so the parents area can show a readable message. */
export function handle(fn: (request: Request) => Promise<Response>): (request: Request) => Promise<Response> {
  return async (request) => {
    try {
      return await fn(request);
    } catch (e) {
      if (e instanceof HttpError) return json(e.status, { error: e.message });
      console.error(e);
      return json(500, { error: 'Something went wrong on our side. Please try again.' });
    }
  };
}

/** Supabase with the service role key: bypasses Row Level Security, so only use it after checking who is asking. */
export function admin(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? env('VITE_SUPABASE_URL');
  return createClient(url, env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
}

export function stripe(): Stripe {
  return new Stripe(env('STRIPE_SECRET_KEY'));
}

export interface Parent {
  id: string;
  email: string | undefined;
}

/** The signed-in parent making this request, from the Supabase access token the app sends. */
export async function requireParent(request: Request, db: SupabaseClient = admin()): Promise<Parent> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Please log in again.');
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'Please log in again.');
  return { id: data.user.id, email: data.user.email };
}

/** The address the parent is using, so Stripe sends them back to the same site (live or preview). */
export function origin(request: Request): string {
  return new URL(request.url).origin;
}

const toIso = (seconds: number | null | undefined) => (seconds ? new Date(seconds * 1000).toISOString() : null);

/** The columns of our `subscriptions` table that mirror a Stripe subscription. */
export function subscriptionColumns(sub: Stripe.Subscription) {
  const periodEnds = sub.items.data.map((i) => i.current_period_end).filter((n): n is number => typeof n === 'number');
  return {
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    status: sub.status,
    trial_end: toIso(sub.trial_end),
    current_period_end: toIso(periodEnds.length ? Math.max(...periodEnds) : null),
    cancel_at_period_end: sub.cancel_at_period_end,
    had_trial: sub.trial_end !== null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Stripe Tax settings for Checkout. Turned on with STRIPE_AUTOMATIC_TAX=true, but only after
 * Stripe Tax is set up in the Dashboard (head office address, a default tax behaviour or a
 * tax_behavior on the price, and registrations for the places you collect in). Turning it on
 * before that makes Checkout fail.
 */
export function checkoutTaxOptions(enabled = process.env.STRIPE_AUTOMATIC_TAX === 'true') {
  if (!enabled) return {};
  return {
    automatic_tax: { enabled: true },
    // Tax depends on where the family lives, so save the address they enter onto the customer.
    customer_update: { address: 'auto', name: 'auto' },
  } as const;
}

/** True when Stripe says the object no longer exists, for example a customer deleted in the Dashboard. */
export function isMissingResource(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'resource_missing';
}

/** The free month is offered once per family, so cancelling and re-joining doesn't restart it. */
export const TRIAL_DAYS = 30;
