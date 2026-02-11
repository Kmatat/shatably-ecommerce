import { apiCall } from '../api';
import type { Product, Category } from '@/types';

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
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

export const productService = {
  // Get all products with filters
  async getProducts(filters: ProductFilters = {}) {
    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return apiCall<PaginatedResponse<Product>>(`/products?${queryParams.toString()}`);
  },

  // Get featured products
  async getFeaturedProducts() {
    return apiCall<Product[]>('/products/featured');
  },

  // Get deals
  async getDeals() {
    return apiCall<Product[]>('/products/deals');
  },

  // Get single product
  async getProduct(id: string) {
    return apiCall<Product>(`/products/${id}`);
  },

  // Search products
  async searchProducts(query: string) {
    return apiCall<Product[]>(`/products/search/${encodeURIComponent(query)}`);
  },

  // Get brands
  async getBrands() {
    return apiCall<any[]>('/products/brands');
  },
  
  // Get categories
  // Note: Assuming there is a category endpoint based on routes folder
  async getCategories() {
    return apiCall<Category[]>('/categories'); 
  }
};
