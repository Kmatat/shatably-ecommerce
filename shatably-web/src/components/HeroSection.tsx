'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, BadgePercent, Shield, Upload } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';

export default function HeroSection() {
  const { language } = useLanguageStore();

  const content = {
    ar: {
      title: 'كل ما تحتاجه للبناء والتشطيب',
      subtitle: 'أكبر تشكيلة من مواد البناء بأفضل الأسعار مع توصيل سريع لباب بيتك',
      cta: 'تسوق الآن',
      uploadCta: 'ارفع قائمة المواد',
      features: [
        { icon: Truck, text: 'توصيل خلال 3 ساعات' },
        { icon: BadgePercent, text: 'أفضل الأسعار' },
        { icon: Shield, text: 'جودة مضمونة' },
      ],
    },
    en: {
      title: 'Everything You Need for Building & Finishing',
      subtitle: 'Largest selection of building materials at the best prices with fast delivery to your doorstep',
      cta: 'Shop Now',
      uploadCta: 'Upload Material List',
      features: [
        { icon: Truck, text: '3-Hour Delivery' },
        { icon: BadgePercent, text: 'Best Prices' },
        { icon: Shield, text: 'Quality Guaranteed' },
      ],
    },
  };

  const t = content[language];

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-custom relative py-16 md:py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            {language === 'ar' ? 'نوصل لكل أنحاء القاهرة الكبرى' : 'Delivering across Greater Cairo'}
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
            >
              {t.cta}
            </Link>
            <Link
              href="/upload-list"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary-500 text-white rounded-xl font-bold text-lg hover:bg-secondary-600 transition-colors shadow-lg"
            >
              <Upload className="w-5 h-5" />
              {t.uploadCta}
            </Link>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-6">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 end-0 w-1/3 h-full opacity-20 hidden lg:block">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </section>
  );
}
