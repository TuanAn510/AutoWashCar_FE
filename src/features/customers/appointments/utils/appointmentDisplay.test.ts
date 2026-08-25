import { describe, expect, it } from 'vitest';

import { canCustomerPayAppointment } from '@/features/customers/appointments/utils/appointmentDisplay';

describe('customer payment eligibility', () => {
  it.each(['unpaid', 'pending', 'cancelled'] as const)(
    'allows retryable %s payment on a valid booking',
    (paymentStatus) => expect(canCustomerPayAppointment('pending', paymentStatus)).toBe(true)
  );

  it('blocks duplicate payment and actual booking cancellation', () => {
    expect(canCustomerPayAppointment('pending', 'paid')).toBe(false);
    expect(canCustomerPayAppointment('cancelled', 'unpaid')).toBe(false);
    expect(canCustomerPayAppointment('cancelled', 'cancelled')).toBe(false);
  });
});
