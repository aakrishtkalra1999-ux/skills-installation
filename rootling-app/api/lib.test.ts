import type Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { subscriptionColumns } from './_lib';

describe('Stripe webhook', () => {
  it('maps a Stripe subscription to our subscriptions row', () => {
    const sub = {
      id: 'sub_1',
      customer: 'cus_1',
      status: 'trialing',
      trial_end: 1_800_000_000,
      cancel_at_period_end: false,
      items: { data: [{ current_period_end: 1_800_000_000 }] },
    } as unknown as Stripe.Subscription;
    const row = subscriptionColumns(sub);
    expect(row).toMatchObject({
      stripe_subscription_id: 'sub_1',
      stripe_customer_id: 'cus_1',
      status: 'trialing',
      trial_end: new Date(1_800_000_000_000).toISOString(),
      current_period_end: new Date(1_800_000_000_000).toISOString(),
      had_trial: true,
    });
  });
});
