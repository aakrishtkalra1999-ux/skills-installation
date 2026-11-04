import type Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { checkoutTaxOptions, isMissingResource, subscriptionColumns } from './_lib';

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

describe('Stripe Tax', () => {
  it('leaves Checkout unchanged until automatic tax is switched on', () => {
    expect(checkoutTaxOptions(false)).toEqual({});
  });
  it('turns on automatic tax and saves the address the family enters', () => {
    expect(checkoutTaxOptions(true)).toEqual({
      automatic_tax: { enabled: true },
      customer_update: { address: 'auto', name: 'auto' },
    });
  });
});

describe('Stripe errors', () => {
  it('recognises a customer that no longer exists', () => {
    expect(isMissingResource({ code: 'resource_missing' })).toBe(true);
    expect(isMissingResource(new Error('network'))).toBe(false);
    expect(isMissingResource(null)).toBe(false);
  });
});
