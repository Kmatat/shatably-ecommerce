'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';
import { getFeaturedProducts, getOnSaleProducts } from '@/lib/data';
import ProductCard from './ProductCard';

interface ProductSectionProps {
  title: { ar: string; en: string };
  products: ReturnType<typeof getFeaturedProducts>;
  viewAllLink: string;
}

function ProductSection({ title, products, viewAllLink }: ProductSectionProps) {
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
        <div className="product-grid">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const products = getFeaturedProducts();
  
  return (
    <ProductSection
      title={{ ar: 'منتجات مميزة', en: 'Featured Products' }}
      products={products}
      viewAllLink="/products?featured=true"
    />
  );
}

export function DealsSection() {
  const products = getOnSaleProducts();
  
  return (
    <section className="section bg-gradient-to-r from-secondary-500 to-secondary-600">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {useLanguageStore.getState().language === 'ar' ? 'عروض اليوم' : "Today's Deals"}
            </h2>
          </div>
          <Link
            href="/deals"
            className="flex items-center gap-1 text-white hover:text-secondary-100 font-medium"
          >
            {useLanguageStore.getState().language === 'ar' ? 'عرض الكل' : 'View All'}
            {useLanguageStore.getState().language === 'ar' ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Link>
        </div>

        {/* Products grid */}
        <div className="product-grid">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
