import { describe, expect, it } from 'vitest';

import { formatTime } from './utils';

describe('formatTime', () => {
  it.each([
    [0, '0 phút'],
    [1, '1 phút'],
    [60, '1 giờ'],
    [90, '1 giờ 30 phút'],
    [1440, '1 ngày'],
    [1500, '1 ngày 1 giờ'],
    [1530, '1 ngày 1 giờ 30 phút'],
    [10080, '7 ngày'],
  ])('formats %i minutes as %s', (minutes, expected) => {
    expect(formatTime(minutes)).toBe(expected);
  });
});
