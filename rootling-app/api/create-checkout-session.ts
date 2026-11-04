// POST /api/create-checkout-session: starts Stripe Checkout for the Sprout plan.
import { admin, env, handle, json, origin, requireParent, stripe, TRIAL_DAYS } from './_lib.js';

export const POST = handle(async (request) => {
  const db = admin();
  const parent = await requireParent(request, db);
  const s = stripe();

  const { data: existing, error } = await db
    .from('subscriptions')
    .select('stripe_customer_id, status, had_trial')
    .eq('parent_id', parent.id)
    .maybeSingle();
  if (error) throw error;
  if (existing && ['trialing', 'active', 'past_due'].includes(existing.status)) {
    return json(409, { error: 'Your family already has the Sprout plan. Use “Manage subscription” to change it.' });
  }

  let customerId = existing?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await s.customers.create({ email: parent.email, metadata: { parent_id: parent.id } });
    customerId = customer.id;
    const { error: saveError } = await db
      .from('subscriptions')
      .upsert({ parent_id: parent.id, stripe_customer_id: customerId, updated_at: new Date().toISOString() });
    if (saveError) throw saveError;
  }

  const site = origin(request);
  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: parent.id,
    line_items: [{ price: env('STRIPE_PRICE_ID'), quantity: 1 }],
    subscription_data: {
      metadata: { parent_id: parent.id },
      ...(existing?.had_trial ? {} : { trial_period_days: TRIAL_DAYS }),
    },
    // Card details are collected up front, but nothing is charged until the free month ends.
    payment_method_collection: 'always',
    allow_promotion_codes: true,
    success_url: `${site}/?checkout=success`,
    cancel_url: `${site}/?checkout=cancelled`,
  });
  return json(200, { url: session.url });
});
