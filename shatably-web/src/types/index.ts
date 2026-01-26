// Product Types
export interface Product {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  categoryId: string;
  brandId?: string;
  stock: number;
  unit: 'piece' | 'bag' | 'ton' | 'meter' | 'box' | 'kg';
  specifications?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isOnSale?: boolean;
  createdAt: string;
}

// Category Types
export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  parentId?: string;
  image: string;
  icon?: string;
  sortOrder: number;
  children?: Category[];
}

// User Types
export type UserType = 'homeowner' | 'contractor' | 'designer';

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  type: UserType;
  languagePreference: 'ar' | 'en';
  createdAt: string;
}

// Address Types
export interface Address {
  id: string;
  userId: string;
  label: string;
  fullAddress: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  contactName: string;
  contactPhone: string;
  isDefault: boolean;
}

// Cart Types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
}

// Order Types
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'ready' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled';

export type PaymentMethod = 
  | 'credit_card' 
  | 'fawry' 
  | 'cash_on_delivery' 
  | 'mobile_wallet'
  | 'credit_on_delivery';

export type DeliveryType = 'express' | 'scheduled';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  address: Address;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  scheduledDate?: string;
  scheduledTimeSlot?: 'morning' | 'afternoon' | 'evening';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Material List Request Types
export type MaterialListStatus = 'pending' | 'processing' | 'ready' | 'completed';

export interface MaterialListRequest {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  notes?: string;
  status: MaterialListStatus;
  assignedAgentId?: string;
  processedAt?: string;
  createdAt: string;
}

// Employee Types
export type EmployeeRole = 'admin' | 'purchase_agent' | 'preparation' | 'delivery_agent';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'popular' | 'rating';
}

// Delivery Configuration
export interface DeliveryConfig {
  baseFee: number;
  expressRatePerKm: number;
  scheduledRatePerKm: number;
  freeDeliveryThreshold: number;
  expressAvailable: boolean;
  operatingHoursStart: string;
  operatingHoursEnd: string;
}

// Payment Configuration
export interface PaymentConfig {
  creditCardEnabled: boolean;
  fawryEnabled: boolean;
  codEnabled: boolean;
  mobileWalletEnabled: boolean;
  creditOnDeliveryEnabled: boolean;
  minOrderAmount: number;
}
