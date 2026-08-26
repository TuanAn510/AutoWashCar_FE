import { describe, expect, it } from 'vitest';

import {
  createDefaultValues,
  resolveAvailableScheduledTime,
  serializeScheduledAt,
} from '@/features/customers/appointments/components/CreateAppointmentModal';
import type { BookingAvailabilitySlot } from '@/types/appointment';

const slots: BookingAvailabilitySlot[] = [
  { startAt: '2099-08-20T09:00:00', endAt: '2099-08-20T09:30:00', available: true, reason: null },
  { startAt: '2099-08-20T09:30:00', endAt: '2099-08-20T10:00:00', available: false, reason: 'CAPACITY_FULL' },
];

describe('customer appointment time selection', () => {
  it('starts empty and never auto-selects the first available slot', () => {
    expect(createDefaultValues().scheduledTime).toBe('');
    expect(resolveAvailableScheduledTime('', slots)).toBe('');
  });

  it('retains only an explicitly selected available slot', () => {
    expect(resolveAvailableScheduledTime('09:00', slots)).toBe('09:00');
    expect(resolveAvailableScheduledTime('09:30', slots)).toBe('');
    expect(resolveAvailableScheduledTime('10:00', slots)).toBe('');
  });

  it('clears a selected time when refreshed availability invalidates it', () => {
    expect(resolveAvailableScheduledTime('09:00', [{ ...slots[0], available: false }])).toBe('');
  });

  it('keeps the backend timestamp serialization contract', () => {
    expect(serializeScheduledAt('2099-08-20', '09:05')).toBe('2099-08-20T09:05:00');
  });
});
