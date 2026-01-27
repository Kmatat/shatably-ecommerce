'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  image: string | null;
  productCount: number;
  children: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    icon: string | null;
    productCount: number;
  }[];
}

export default function CategorySection() {
  const { language } = useLanguageStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const title = language === 'ar' ? 'تصفح حسب الفئة' : 'Browse by Category';

  return (
    <section className="section bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <Link
            href="/categories"
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

        {/* Category grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug || category.id}`}
                className="group"
              >
                <div className="card p-4 text-center hover:shadow-lg hover:border-primary-200 transition-all">
                  {/* Icon/Image */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition-colors overflow-hidden">
                    {category.icon ? (
                      <span className="text-3xl">{category.icon}</span>
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {language === 'ar' ? category.nameAr : category.nameEn}
                  </h3>

                  {/* Product count - includes category's own products plus all children's products */}
                  <p className="text-sm text-gray-500">
                    {(category.productCount || 0) +
                      (category.children?.reduce((sum, c) => sum + (c.productCount || 0), 0) || 0)}{' '}
                    {language === 'ar' ? 'منتج' : 'products'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'لا توجد فئات' : 'No categories available'}
          </div>
        )}
      </div>
    </section>
  );
}
