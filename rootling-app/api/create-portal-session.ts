// POST /api/create-portal-session: opens the Stripe Customer Portal, where parents cancel or update their card.
import { admin, handle, HttpError, json, origin, requireParent, stripe } from './_lib.js';

export const POST = handle(async (request) => {
  const db = admin();
  const parent = await requireParent(request, db);
  const { data, error } = await db.from('subscriptions').select('stripe_customer_id').eq('parent_id', parent.id).maybeSingle();
  if (error) throw error;
  if (!data?.stripe_customer_id) throw new HttpError(404, 'There is no subscription to manage yet.');
  const session = await stripe().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${origin(request)}/` });
  return json(200, { url: session.url });
});
