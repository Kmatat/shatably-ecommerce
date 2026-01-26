'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';
import { categories } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function CategorySection() {
  const { language } = useLanguageStore();

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group"
            >
              <div className="card p-4 text-center hover:shadow-lg hover:border-primary-200 transition-all">
                {/* Icon/Image */}
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <span className="text-3xl">{category.icon}</span>
                </div>
                
                {/* Name */}
                <h3 className="font-semibold text-gray-900 mb-1">
                  {language === 'ar' ? category.nameAr : category.nameEn}
                </h3>
                
                {/* Subcategories count */}
                {category.children && (
                  <p className="text-sm text-gray-500">
                    {category.children.length}{' '}
                    {language === 'ar' ? 'فئة فرعية' : 'subcategories'}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
