import { describe, expect, it } from 'vitest';

import { canCustomerPayAppointment } from '@/features/customers/appointments/utils/appointmentDisplay';

describe('customer payment eligibility', () => {
  it.each(['unpaid', 'pending', 'cancelled'] as const)(
    'allows retryable %s payment on a completed booking',
    (paymentStatus) => expect(canCustomerPayAppointment('completed', paymentStatus)).toBe(true)
  );

  it.each(['pending', 'confirmed', 'in_queue', 'in_progress', 'cancelled'] as const)(
    'blocks payment for %s appointments',
    (status) => expect(canCustomerPayAppointment(status, 'unpaid')).toBe(false)
  );

  it('blocks duplicate payment for completed appointments', () => {
    expect(canCustomerPayAppointment('completed', 'paid')).toBe(false);
  });
});
