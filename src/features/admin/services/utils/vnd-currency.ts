export const MAX_SERVICE_PRICE = 9_999_999_999;

const vndNumberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

export function formatVndInput(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '';
  return vndNumberFormatter.format(Math.max(0, Math.trunc(value)));
}

export function parseVndInput(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}
