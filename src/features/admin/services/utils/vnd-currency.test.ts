import { describe, expect, it } from 'vitest';

import { formatVndInput, parseVndInput } from '@/features/admin/services/utils/vnd-currency';

describe('VND service price formatting', () => {
  it('formats integer prices with Vietnamese thousands separators', () => {
    expect(formatVndInput(150_000)).toBe('150.000');
    expect(formatVndInput(1_250_000)).toBe('1.250.000');
  });

  it('parses formatted or pasted VND values back to an API-safe number', () => {
    expect(parseVndInput('1.250.000 VND')).toBe(1_250_000);
    expect(parseVndInput('')).toBe(0);
  });
});
