import { describe, expect, it } from 'vitest';

import type { Promotion } from '@/services/promotionService';

import { calculatePromotionDiscount } from './appointment-pricing';

const services = [
  { _id: 'service-a', price: 100_000 },
  { _id: 'service-b', price: 200_000 },
];

const promotion = (overrides: Partial<Promotion>): Promotion => ({
  _id: 'promotion-1',
  title: 'Promotion',
  code: 'PROMO',
  type: 'percentage',
  discountValue: 20,
  targetType: 'service',
  serviceId: 'service-a',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
  isActive: true,
  ...overrides,
});

describe('calculatePromotionDiscount', () => {
  it('calculates a percentage from only the target service', () => {
    expect(calculatePromotionDiscount(promotion({}), 300_000, services)).toBe(20_000);
  });

  it('uses the target service price after its membership discount', () => {
    expect(calculatePromotionDiscount(promotion({}), 270_000, services, 10)).toBe(18_000);
  });

  it('does not let fixed or free-service promotions spill into another service', () => {
    expect(
      calculatePromotionDiscount(
        promotion({ type: 'fixed_amount', discountValue: 150_000 }),
        270_000,
        services,
        10
      )
    ).toBe(90_000);
    expect(
      calculatePromotionDiscount(
        promotion({ type: 'free_service', discountValue: 0 }),
        270_000,
        services,
        10
      )
    ).toBe(90_000);
  });

  it('preserves invoice-wide promotions and maximum discount caps', () => {
    expect(
      calculatePromotionDiscount(
        promotion({ targetType: 'all', serviceId: null }),
        300_000,
        services
      )
    ).toBe(60_000);
    expect(
      calculatePromotionDiscount(promotion({ maxDiscountAmount: 15_000 }), 300_000, services)
    ).toBe(15_000);
  });

  it('returns zero for a missing or zero-priced target service', () => {
    expect(
      calculatePromotionDiscount(promotion({ serviceId: 'missing-service' }), 300_000, services)
    ).toBe(0);
    expect(
      calculatePromotionDiscount(promotion({ serviceId: 'free-service' }), 300_000, [
        { _id: 'free-service', price: 0 },
      ])
    ).toBe(0);
  });

  it('rounds percentage discounts to the nearest currency unit', () => {
    expect(
      calculatePromotionDiscount(
        promotion({ targetType: 'all', serviceId: null, discountValue: 10 }),
        105,
        services
      )
    ).toBe(11);
  });
});
