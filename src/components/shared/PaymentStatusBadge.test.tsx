// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';

describe('PaymentStatusBadge', () => {
  it('keeps a cancelled payment attempt visibly unpaid and retryable', () => {
    render(<PaymentStatusBadge status="cancelled" />);
    expect(screen.getByText('Chưa thanh toán')).toBeTruthy();
    expect(screen.queryByText('Thanh toán chưa hoàn tất')).toBeNull();
    expect(screen.queryByText('Đã hủy thanh toán')).toBeNull();
  });
});
