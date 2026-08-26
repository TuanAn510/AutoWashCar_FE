import { describe, expect, it } from 'vitest';

import { canCustomerPayAppointment } from '@/features/customers/appointments/utils/appointmentDisplay';

describe('customer payment eligibility', () => {
  it.each(['confirmed', 'in_queue', 'in_progress', 'completed'] as const)(
    'allows payment for %s appointments when not paid',
    (status) => {
      expect(canCustomerPayAppointment(status, 'unpaid')).toBe(true);
      expect(canCustomerPayAppointment(status, 'pending')).toBe(true);
      expect(canCustomerPayAppointment(status, 'cancelled')).toBe(true);
    }
  );

  it.each(['pending', 'cancelled'] as const)('blocks payment for %s appointments', (status) =>
    expect(canCustomerPayAppointment(status, 'unpaid')).toBe(false)
  );

  it('blocks duplicate payment for confirmed appointments', () => {
    expect(canCustomerPayAppointment('confirmed', 'paid')).toBe(false);
  });
});
