import axios from 'axios';

export type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'timeout'
  | 'offline'
  | 'network'
  | 'cancelled'
  | 'server'
  | 'unknown';

export interface ValidationIssue {
  field?: string;
  message: string;
}

interface ErrorPayload {
  message?: string;
  code?: string;
  errors?: ValidationIssue[] | Record<string, string | string[]>;
}

const normalizeValidationIssues = (errors: ErrorPayload['errors']): ValidationIssue[] => {
  if (!errors) return [];
  if (Array.isArray(errors)) return errors;

  return Object.entries(errors).flatMap(([field, messages]) =>
    (Array.isArray(messages) ? messages : [messages]).map((message) => ({ field, message }))
  );
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly validationIssues: ValidationIssue[];
  readonly retryable: boolean;

  constructor(options: {
    message: string;
    kind?: ApiErrorKind;
    status?: number;
    code?: string;
    validationIssues?: ValidationIssue[];
    retryable?: boolean;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.kind = options.kind ?? 'unknown';
    this.status = options.status;
    this.code = options.code;
    this.validationIssues = options.validationIssues ?? [];
    this.retryable = options.retryable ?? false;
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (!axios.isAxiosError<ErrorPayload>(error)) {
    return new ApiError({
      message: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.',
    });
  }

  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
    return new ApiError({ message: 'Yêu cầu đã bị hủy.', kind: 'cancelled', code: error.code });
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError({
      message: 'Yêu cầu đã hết thời gian chờ.',
      kind: 'timeout',
      code: error.code,
      retryable: true,
    });
  }

  if (!error.response) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return new ApiError({
      message: offline
        ? 'Thiết bị đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng.'
        : 'Không thể kết nối đến máy chủ.',
      kind: offline ? 'offline' : 'network',
      code: error.code,
      retryable: !offline,
    });
  }

  const status = error.response.status;
  const payload = error.response.data;
  const validationIssues = normalizeValidationIssues(payload?.errors);
  const kind: ApiErrorKind =
    status === 400 || status === 422
      ? 'validation'
      : status === 401
        ? 'unauthorized'
        : status === 403
          ? 'forbidden'
          : status === 404
            ? 'not_found'
            : status >= 500
              ? 'server'
              : 'unknown';

  return new ApiError({
    message: payload?.message || error.message || 'Yêu cầu không thành công.',
    kind,
    status,
    code: payload?.code || error.code,
    validationIssues,
    retryable: status === 408 || status === 429 || status >= 500,
  });
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = toApiError(error);
  return apiError.message || fallback;
};
