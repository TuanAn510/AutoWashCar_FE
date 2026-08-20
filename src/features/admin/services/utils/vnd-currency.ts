export const MAX_SERVICE_PRICE = 9_999_999_999;
export const SERVICE_REWARD_POINT_AMOUNT = 10_000;

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

export function calculateServiceRewardPoints(price: number | null | undefined) {
  if (price == null || !Number.isFinite(price)) return 0;
  return Math.floor(Math.max(0, price) / SERVICE_REWARD_POINT_AMOUNT);
}
