// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { VndCurrencyInput } from '@/features/admin/services/components/VndCurrencyInput';

describe('VndCurrencyInput', () => {
  it('shows a formatted value and emits a numeric value when edited', () => {
    const onValueChange = vi.fn();

    render(
      <VndCurrencyInput aria-label="Giá dịch vụ" value={150_000} onValueChange={onValueChange} />
    );

    const input = screen.getByRole('textbox', { name: 'Giá dịch vụ' });
    expect((input as HTMLInputElement).value).toBe('150.000');

    fireEvent.change(input, { target: { value: '275.000' } });

    expect(onValueChange).toHaveBeenCalledWith(275_000);
  });
});
