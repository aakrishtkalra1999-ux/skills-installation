// POST /api/stripe-webhook: Stripe tells us when a subscription starts, changes or ends.
// Add this URL in Stripe → Developers → Webhooks, with these events:
//   checkout.session.completed
//   customer.subscription.created
//   customer.subscription.updated
//   customer.subscription.deleted
import type Stripe from 'stripe';
import { admin, env, handle, HttpError, json, stripe, subscriptionColumns } from './_lib.js';

export const POST = handle(async (request) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) throw new HttpError(400, 'Missing Stripe signature');
  const s = stripe();
  let event: Stripe.Event;
  try {
    // The raw body is needed to check the signature, so read it as text before parsing.
    event = await s.webhooks.constructEventAsync(await request.text(), signature, env('STRIPE_WEBHOOK_SECRET'));
  } catch {
    throw new HttpError(400, 'Invalid Stripe signature');
  }

  const db = admin();
  let subscriptionId: string | null = null;
  let parentId: string | null = null;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    parentId = session.client_reference_id;
    subscriptionId = typeof session.subscription === 'string' ? session.subscription : (session.subscription?.id ?? null);
  } else if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    subscriptionId = event.data.object.id;
    parentId = event.data.object.metadata?.parent_id ?? null;
  } else {
    return json(200, { received: true, ignored: event.type });
  }
  if (!subscriptionId) return json(200, { received: true });

  // Always re-read the subscription so events arriving out of order still leave the latest state.
  const sub = await s.subscriptions.retrieve(subscriptionId);
  const columns = subscriptionColumns(sub);
  parentId ??= sub.metadata?.parent_id ?? null;
  if (!parentId) {
    const { data } = await db.from('subscriptions').select('parent_id').eq('stripe_customer_id', columns.stripe_customer_id).maybeSingle();
    parentId = (data?.parent_id as string | undefined) ?? null;
  }
  if (!parentId) {
    console.warn(`No Rootling parent for Stripe subscription ${subscriptionId}`);
    return json(200, { received: true });
  }

  const { data: before } = await db.from('subscriptions').select('had_trial').eq('parent_id', parentId).maybeSingle();
  const { error } = await db.from('subscriptions').upsert({
    parent_id: parentId,
    ...columns,
    had_trial: columns.had_trial || !!before?.had_trial,
  });
  if (error) throw error;
  return json(200, { received: true });
});
