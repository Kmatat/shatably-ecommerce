import crypto from 'crypto';

/**
 * Generate a random OTP code
 */
export const generateOtp = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

/**
 * Generate order number
 * Format: SH-{timestamp}-{random}
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SH-${timestamp}-${random}`;
};

/**
 * Generate SKU
 * Format: {category}-{random}
 */
export const generateSku = (categoryPrefix: string): string => {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${categoryPrefix.toUpperCase()}-${random}`;
};

/**
 * Validate Egyptian phone number
 */
export const validateEgyptPhone = (phone: string): boolean => {
  // Egyptian mobile: 01[0125][0-9]{8}
  const egyptPhoneRegex = /^01[0125][0-9]{8}$/;
  return egyptPhoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Delivery settings interface
 */
export interface DeliveryFeeSettings {
  expressBaseFee: number;
  scheduledBaseFee: number;
  freeDeliveryThreshold: number;
  itemCountThreshold: number;
  itemCountDiscount: number;
  highValueThreshold: number;
  highValueDeliveryFee: number;
}

/**
 * Calculate delivery fee with dynamic settings
 */
export const calculateDeliveryFee = (
  subtotal: number,
  deliveryType: 'express' | 'scheduled',
  itemCount: number,
  settings: DeliveryFeeSettings
): number => {
  // Free delivery for scheduled orders above threshold
  if (deliveryType === 'scheduled' && subtotal >= settings.freeDeliveryThreshold) {
    return 0;
  }

  // High value orders get reduced fee
  if (subtotal >= settings.highValueThreshold) {
    return settings.highValueDeliveryFee;
  }

  // Base fee based on delivery type
  let fee = deliveryType === 'express'
    ? settings.expressBaseFee
    : settings.scheduledBaseFee;

  // Apply item count discount if threshold is met
  if (itemCount >= settings.itemCountThreshold && settings.itemCountDiscount > 0) {
    fee = fee * (1 - settings.itemCountDiscount / 100);
  }

  return Math.round(fee);
};

/**
 * Calculate promo discount
 */
export const calculateDiscount = (
  subtotal: number,
  promo: {
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount?: number | null;
    maxDiscount?: number | null;
  }
): number => {
  // Check minimum order amount
  if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
    return 0;
  }

  let discount: number;

  if (promo.type === 'percentage') {
    discount = (subtotal * Number(promo.value)) / 100;
  } else {
    discount = Number(promo.value);
  }

  // Apply max discount cap
  if (promo.maxDiscount) {
    discount = Math.min(discount, Number(promo.maxDiscount));
  }

  return Math.round(discount * 100) / 100;
};

/**
 * Slugify text
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Pagination helper
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const paginate = (params: PaginationParams) => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
