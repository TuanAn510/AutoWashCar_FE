export const SERVICE_REWARD_POINT_AMOUNT = 10_000;
export const DEFAULT_SERVICE_REWARD_MULTIPLIER = 1;
export const MAX_SERVICE_REWARD_MULTIPLIER = 5;
export const SERVICE_REWARD_MULTIPLIER_OPTIONS = Array.from(
  { length: MAX_SERVICE_REWARD_MULTIPLIER - DEFAULT_SERVICE_REWARD_MULTIPLIER + 1 },
  (_, index) => DEFAULT_SERVICE_REWARD_MULTIPLIER + index
);

export function calculateBaseServiceRewardPoints(price: number | null | undefined) {
  if (price == null || !Number.isFinite(price)) return 0;
  return Math.floor(Math.max(0, price) / SERVICE_REWARD_POINT_AMOUNT);
}

export function calculateServiceRewardPoints(
  price: number | null | undefined,
  multiplier = DEFAULT_SERVICE_REWARD_MULTIPLIER
) {
  const safeMultiplier = Number.isFinite(multiplier)
    ? Math.min(
        MAX_SERVICE_REWARD_MULTIPLIER,
        Math.max(DEFAULT_SERVICE_REWARD_MULTIPLIER, multiplier)
      )
    : DEFAULT_SERVICE_REWARD_MULTIPLIER;

  return Math.floor(calculateBaseServiceRewardPoints(price) * safeMultiplier);
}

export function formatServiceRewardMultiplier(multiplier: number | null | undefined) {
  const value = multiplier ?? DEFAULT_SERVICE_REWARD_MULTIPLIER;
  return `×${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value)}`;
}
