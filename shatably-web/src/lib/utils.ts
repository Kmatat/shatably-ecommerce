import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in Egyptian Pounds
export function formatPrice(price: number, locale: 'ar' | 'en' = 'ar'): string {
  const formatted = price.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return locale === 'ar' ? `${formatted} ج.م` : `EGP ${formatted}`;
}

// Format date
export function formatDate(date: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format phone number for display
export function formatPhone(phone: string): string {
  // Format: 01X XXXX XXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

// Validate Egyptian phone number
export function validateEgyptPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Egyptian mobile: 01[0-2,5] followed by 8 digits
  const regex = /^01[0125]\d{8}$/;
  return regex.test(cleaned);
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SH-${timestamp}-${random}`;
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Get product name based on locale
export function getLocalizedName(
  item: { nameAr: string; nameEn: string },
  locale: 'ar' | 'en'
): string {
  return locale === 'ar' ? item.nameAr : item.nameEn;
}

// Get product description based on locale
export function getLocalizedDescription(
  item: { descriptionAr: string; descriptionEn: string },
  locale: 'ar' | 'en'
): string {
  return locale === 'ar' ? item.descriptionAr : item.descriptionEn;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Storage helpers with SSR safety
export const storage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// Order status helpers
export const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  ready: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Unit labels
export const unitLabels = {
  ar: {
    piece: 'قطعة',
    bag: 'شيكارة',
    ton: 'طن',
    meter: 'متر',
    box: 'علبة',
    kg: 'كجم',
  },
  en: {
    piece: 'piece',
    bag: 'bag',
    ton: 'ton',
    meter: 'meter',
    box: 'box',
    kg: 'kg',
  },
};

// Get unit label
export function getUnitLabel(
  unit: 'piece' | 'bag' | 'ton' | 'meter' | 'box' | 'kg',
  locale: 'ar' | 'en'
): string {
  return unitLabels[locale][unit];
}
