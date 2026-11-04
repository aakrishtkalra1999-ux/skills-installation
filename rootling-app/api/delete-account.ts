// POST /api/delete-account: deletes the parent's account and everything stored about the family.
import { admin, handle, json, requireParent, stripe } from './_lib.js';

export const POST = handle(async (request) => {
  const db = admin();
  const parent = await requireParent(request, db);

  // Stop billing first so a family is never charged after deleting their account.
  const { data: sub } = await db.from('subscriptions').select('stripe_customer_id').eq('parent_id', parent.id).maybeSingle();
  if (sub?.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
    // Deleting the Stripe customer also cancels their subscriptions immediately.
    await stripe().customers.del(sub.stripe_customer_id);
  }
  if (parent.email) {
    // Escape LIKE wildcards so only this exact address (in any letter case) matches.
    const exact = parent.email.replace(/[\\%_]/g, (c) => `\\${c}`);
    await db.from('waitlist').delete().ilike('email', exact);
  }

  // Profiles, children, progress and subscriptions all delete with the user (on delete cascade).
  const { error } = await db.auth.admin.deleteUser(parent.id);
  if (error) throw error;
  return json(200, { deleted: true });
});
