/**
 * Guard tests: confirm that real Northstar resource IDs are wired up and
 * no placeholder strings can ship to production.
 *
 * If any assertion here fails it means seed.ts or resources.ts still has
 * a placeholder that would result in broken checkout links in the browser.
 */
import { describe, it, expect } from 'vitest';
import { NORTHSTAR_RESOURCES } from '#/lib/resources';
import { seedProducts } from '#/lib/seed';

// ── resources.ts sanity ────────────────────────────────────────────────────────

describe('NORTHSTAR_RESOURCES', () => {
  it('businessId is the real Northstar business', () => {
    expect(NORTHSTAR_RESOURCES.businessId).toBe('biz_MIbRyC2ejVkuzs');
  });

  it('appId is the real hosted-app ID', () => {
    expect(NORTHSTAR_RESOURCES.appId).toBe('app_wJzJqgIuWNnbPd');
  });

  it('liveUrl matches the Whop-hosted site (no stale kernelpanic)', () => {
    expect(NORTHSTAR_RESOURCES.liveUrl).toBe('https://northstar-method-fde.whop.site');
    expect(NORTHSTAR_RESOURCES.liveUrl).not.toContain('kernelpanic');
  });

  it('all plan IDs start with plan_ and are not placeholders', () => {
    for (const [key, id] of Object.entries(NORTHSTAR_RESOURCES.plans)) {
      expect(id, `plans.${key}`).toMatch(/^plan_[A-Za-z0-9]{10,}$/);
      expect(id, `plans.${key} must not be placeholder`).not.toContain('REPLACE');
    }
  });

  it('productId is the real product', () => {
    expect(NORTHSTAR_RESOURCES.productId).toBe('prod_TR58zZsbQFwJu');
  });

  it('promo code is correct', () => {
    expect(NORTHSTAR_RESOURCES.promo.code).toBe('NORTHSTAR20');
    expect(NORTHSTAR_RESOURCES.promo.id).toBe('promo_9X6Rs6QzxDFI');
  });
});

// ── seed.ts guard ─────────────────────────────────────────────────────────────

describe('seedProducts', () => {
  it('all seed plan IDs are real (no REPLACE placeholders)', () => {
    for (const product of seedProducts) {
      expect(product.planId, `${product.handle} planId must not be placeholder`)
        .not.toContain('REPLACE');
      expect(product.planId, `${product.handle} planId must start with plan_`)
        .toMatch(/^plan_[A-Za-z0-9]{10,}$/);
    }
  });

  it('12-week seed uses the real plan ID', () => {
    const p = seedProducts.find((s) => s.handle === 'northstar-12wk');
    expect(p?.planId).toBe(NORTHSTAR_RESOURCES.plans.twelveWeek);
  });

  it('monthly seed uses the real plan ID', () => {
    const p = seedProducts.find((s) => s.handle === 'northstar-monthly');
    expect(p?.planId).toBe(NORTHSTAR_RESOURCES.plans.monthly);
  });

  it('yearly seed uses the real plan ID', () => {
    const p = seedProducts.find((s) => s.handle === 'northstar-yearly');
    expect(p?.planId).toBe(NORTHSTAR_RESOURCES.plans.yearly);
  });

  it('seed prices match the known plan prices', () => {
    const twk = seedProducts.find((s) => s.handle === 'northstar-12wk');
    const mo = seedProducts.find((s) => s.handle === 'northstar-monthly');
    const yr = seedProducts.find((s) => s.handle === 'northstar-yearly');
    expect(twk?.price).toBe(297);
    expect(mo?.price).toBe(49);
    expect(yr?.price).toBe(399);
  });
});
