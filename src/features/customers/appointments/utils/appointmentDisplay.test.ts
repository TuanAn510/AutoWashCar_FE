import { describe, expect, it } from 'vitest';

import { canCustomerPayAppointment } from '@/features/customers/appointments/utils/appointmentDisplay';

describe('customer payment eligibility', () => {
  it.each(['unpaid', 'cancelled'] as const)(
    'allows retryable %s payment on a confirmed booking',
    (paymentStatus) => expect(canCustomerPayAppointment('confirmed', paymentStatus)).toBe(true)
  );

  it.each(['pending', 'in_queue', 'in_progress', 'completed', 'cancelled'] as const)(
    'blocks payment for %s appointments',
    (status) => expect(canCustomerPayAppointment(status, 'unpaid')).toBe(false)
  );

  it('blocks duplicate or in-flight payment for confirmed appointments', () => {
    expect(canCustomerPayAppointment('confirmed', 'paid')).toBe(false);
    expect(canCustomerPayAppointment('confirmed', 'pending')).toBe(false);
  });
});
