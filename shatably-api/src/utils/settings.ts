import prisma from '../config/database';

// Default delivery settings
export interface DeliverySettings {
  expressBaseFee: number;
  scheduledBaseFee: number;
  freeDeliveryThreshold: number;
  itemCountThreshold: number;
  itemCountDiscount: number;
  highValueThreshold: number;
  highValueDeliveryFee: number;
}

const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  expressBaseFee: 150,
  scheduledBaseFee: 100,
  freeDeliveryThreshold: 10000,
  itemCountThreshold: 10,
  itemCountDiscount: 20,
  highValueThreshold: 15000,
  highValueDeliveryFee: 50,
};

/**
 * Get a setting by key with a default fallback
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (setting?.value !== undefined && setting?.value !== null) {
      return setting.value as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Get delivery settings from database with defaults
 */
export async function getDeliverySettings(): Promise<DeliverySettings> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'delivery' },
    });

    if (setting && typeof setting.value === 'object') {
      return { ...DEFAULT_DELIVERY_SETTINGS, ...(setting.value as object) };
    }

    return DEFAULT_DELIVERY_SETTINGS;
  } catch {
    return DEFAULT_DELIVERY_SETTINGS;
  }
}

/**
 * Get general store settings
 */
export async function getGeneralSettings() {
  return getSetting('general', {
    storeNameAr: 'شطابلي',
    storeNameEn: 'Shatably',
    phone: '',
    email: '',
    currency: 'EGP',
    defaultLanguage: 'ar',
  });
}

/**
 * Get payment settings
 */
export async function getPaymentSettings() {
  return getSetting('payment', {
    enableCod: true,
    enableCard: false,
    enableFawry: false,
    enableWallet: false,
    minOrderAmount: 100,
  });
}

/**
 * Get notification settings
 */
export async function getNotificationSettings() {
  return getSetting('notifications', {
    orderConfirmation: true,
    orderShipment: true,
    orderDelivered: true,
    materialListReady: true,
  });
}
