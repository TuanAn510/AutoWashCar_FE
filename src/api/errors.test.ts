import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { ApiError, toApiError } from '@/api/errors';

const axiosError = (status: number, data: object, code?: string) =>
  new AxiosError('Request failed', code, { headers: new AxiosHeaders() }, undefined, {
    data,
    status,
    statusText: 'Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  });

describe('toApiError', () => {
  it('maps validation responses and field issues', () => {
    const error = toApiError(
      axiosError(422, { message: 'Invalid payload', errors: { phone: ['Required'] } })
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe('validation');
    expect(error.validationIssues).toEqual([{ field: 'phone', message: 'Required' }]);
  });

  it('marks server failures as retryable', () => {
    const error = toApiError(axiosError(503, { message: 'Unavailable' }));
    expect(error.kind).toBe('server');
    expect(error.retryable).toBe(true);
  });

  it('maps cancellation without allowing a retry', () => {
    const error = toApiError(new AxiosError('cancelled', 'ERR_CANCELED'));
    expect(error.kind).toBe('cancelled');
    expect(error.retryable).toBe(false);
  });

  it('maps timeouts as retryable transport failures', () => {
    const error = toApiError(new AxiosError('timeout', 'ECONNABORTED'));
    expect(error.kind).toBe('timeout');
    expect(error.retryable).toBe(true);
  });

  it('maps response-less failures as network errors', () => {
    const error = toApiError(new AxiosError('network', 'ERR_NETWORK'));
    expect(error.kind).toBe('network');
    expect(error.retryable).toBe(true);
  });
});
