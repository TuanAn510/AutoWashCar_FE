import type { Promotion } from '@/services/promotionService';

interface PricedService {
  _id: string;
  price: number;
}

const toNonNegativeNumber = (value: number | null | undefined) => Math.max(0, Number(value ?? 0));

export const getPromotionReferenceId = (reference: Promotion['serviceId']) =>
  typeof reference === 'string' ? reference : reference?._id;

export const calculatePriceAfterPercentageDiscount = (price: number, discountPercent: number) => {
  const normalizedPrice = toNonNegativeNumber(price);
  const discountAmount = Math.round((normalizedPrice * toNonNegativeNumber(discountPercent)) / 100);

  return Math.max(0, normalizedPrice - Math.min(normalizedPrice, discountAmount));
};

export const calculatePromotionDiscount = (
  promotion: Promotion,
  invoiceDiscountBase: number,
  selectedServices: PricedService[],
  membershipDiscountPercent = 0
) => {
  let discountBase = toNonNegativeNumber(invoiceDiscountBase);

  if (promotion.targetType === 'service') {
    const targetService = selectedServices.find(
      (service) => service._id === getPromotionReferenceId(promotion.serviceId)
    );
    if (!targetService) return 0;

    discountBase = calculatePriceAfterPercentageDiscount(
      targetService.price,
      membershipDiscountPercent
    );
  }

  let calculatedAmount = 0;
  if (promotion.type === 'percentage') {
    calculatedAmount = Math.round(
      (discountBase * toNonNegativeNumber(promotion.discountValue)) / 100
    );
  } else if (promotion.type === 'fixed_amount') {
    calculatedAmount = Math.round(toNonNegativeNumber(promotion.discountValue));
  } else if (promotion.type === 'free_service') {
    calculatedAmount = Math.round(discountBase);
  }

  const cappedAmount =
    promotion.maxDiscountAmount == null
      ? calculatedAmount
      : Math.min(calculatedAmount, toNonNegativeNumber(promotion.maxDiscountAmount));

  return Math.min(discountBase, Math.max(0, cappedAmount));
};
