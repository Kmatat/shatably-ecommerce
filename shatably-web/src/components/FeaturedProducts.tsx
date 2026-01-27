'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ApiProduct {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  stock: number;
  images: string[];
  categoryId?: string;
  isFeatured?: boolean;
}

function transformProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    sku: p.sku,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    descriptionAr: '',
    descriptionEn: '',
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    images: p.images && p.images.length > 0 ? p.images : ['/placeholder-product.jpg'],
    categoryId: p.categoryId || '',
    stock: p.stock,
    unit: p.unit as any,
    isFeatured: p.isFeatured,
    createdAt: new Date().toISOString(),
  };
}

interface ProductSectionProps {
  title: { ar: string; en: string };
  products: Product[];
  viewAllLink: string;
  loading?: boolean;
}

function ProductSection({ title, products, viewAllLink, loading }: ProductSectionProps) {
  const { language } = useLanguageStore();

  return (
    <section className="section">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {language === 'ar' ? title.ar : title.en}
          </h2>
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
          >
            {language === 'ar' ? 'عرض الكل' : 'View All'}
            {language === 'ar' ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Link>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'لا توجد منتجات' : 'No products available'}
          </div>
        )}
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/featured`);
        if (response.ok) {
          const data = await response.json();
          setProducts((data.data || []).map(transformProduct));
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductSection
      title={{ ar: 'منتجات مميزة', en: 'Featured Products' }}
      products={products}
      viewAllLink="/products?featured=true"
      loading={loading}
    />
  );
}

export function DealsSection() {
  const { language } = useLanguageStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/deals`);
        if (response.ok) {
          const data = await response.json();
          setProducts((data.data || []).map(transformProduct));
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <section className="section bg-gradient-to-r from-secondary-500 to-secondary-600">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {language === 'ar' ? 'عروض اليوم' : "Today's Deals"}
            </h2>
          </div>
          <Link
            href="/deals"
            className="flex items-center gap-1 text-white hover:text-secondary-100 font-medium"
          >
            {language === 'ar' ? 'عرض الكل' : 'View All'}
            {language === 'ar' ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Link>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/80">
            {language === 'ar' ? 'لا توجد عروض حالياً' : 'No deals available'}
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
