'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Truck, BadgePercent, Shield, Upload } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';

interface Banner {
  id: string;
  key: string;
  titleAr: string | null;
  titleEn: string | null;
  contentAr: string | null;
  contentEn: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
}

// Default banner content (current hero section content)
const defaultBanner = {
  id: 'default',
  key: 'hero-main',
  titleAr: 'كل ما تحتاجه للبناء والتشطيب',
  titleEn: 'Everything You Need for Building & Finishing',
  contentAr: 'أكبر تشكيلة من مواد البناء بأفضل الأسعار مع توصيل سريع لباب بيتك',
  contentEn: 'Largest selection of building materials at the best prices with fast delivery to your doorstep',
  imageUrl: null,
  linkUrl: '/categories',
  sortOrder: 0,
};

export default function BannerCarousel() {
  const { language } = useLanguageStore();
  const [banners, setBanners] = useState<Banner[]>([defaultBanner]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const t = {
    ar: {
      cta: 'تسوق الآن',
      uploadCta: 'ارفع قائمة المواد',
      badge: 'نوصل لكل أنحاء القاهرة الكبرى',
      features: [
        { icon: Truck, text: 'توصيل خلال 3 ساعات' },
        { icon: BadgePercent, text: 'أفضل الأسعار' },
        { icon: Shield, text: 'جودة مضمونة' },
      ],
    },
    en: {
      cta: 'Shop Now',
      uploadCta: 'Upload Material List',
      badge: 'Delivering across Greater Cairo',
      features: [
        { icon: Truck, text: '3-Hour Delivery' },
        { icon: BadgePercent, text: 'Best Prices' },
        { icon: Shield, text: 'Quality Guaranteed' },
      ],
    },
  };

  const content = t[language];

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content?type=banner`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            // Sort by sortOrder and put default first if needed
            const apiBanners = data.data.sort((a: Banner, b: Banner) => a.sortOrder - b.sortOrder);
            setBanners([defaultBanner, ...apiBanners]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBanners();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [banners.length]);

  const currentBanner = banners[currentIndex];
  const title = language === 'ar' ? currentBanner.titleAr : currentBanner.titleEn;
  const subtitle = language === 'ar' ? currentBanner.contentAr : currentBanner.contentEn;
  const isDefaultBanner = currentBanner.id === 'default';

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Background image if banner has one */}
      {currentBanner.imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-primary-900/70" />
        </div>
      )}

      <div className="container-custom relative py-16 md:py-24">
        <div className="max-w-3xl">
          {/* Badge - only show on default banner */}
          {isDefaultBanner && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              {content.badge}
            </div>
          )}

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight transition-all duration-500">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl transition-all duration-500">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href={currentBanner.linkUrl || '/categories'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
            >
              {content.cta}
            </Link>
            {isDefaultBanner && (
              <Link
                href="/upload-list"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary-500 text-white rounded-xl font-bold text-lg hover:bg-secondary-600 transition-colors shadow-lg"
              >
                <Upload className="w-5 h-5" />
                {content.uploadCta}
              </Link>
            )}
          </div>

          {/* Features - only show on default banner */}
          {isDefaultBanner && (
            <div className="flex flex-wrap gap-6">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Arrows - only show if more than one banner */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute start-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </button>
            <button
              onClick={goToNext}
              className="absolute end-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 rtl:rotate-180" />
            </button>
          </>
        )}

        {/* Dots Indicator - only show if more than one banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 start-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
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
