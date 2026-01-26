'use client';

import React from 'react';
import Link from 'next/link';
import { Upload, FileText, Clock, CheckCircle } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';

export default function UploadListBanner() {
  const { language } = useLanguageStore();

  const content = {
    ar: {
      title: 'عندك قائمة مواد؟',
      subtitle: 'ارفع قائمة المواد المطلوبة وسيقوم فريقنا بإضافتها لسلتك',
      cta: 'ارفع القائمة الآن',
      steps: [
        { icon: Upload, text: 'ارفع الملف' },
        { icon: FileText, text: 'فريقنا يراجع' },
        { icon: Clock, text: '2-4 ساعات' },
        { icon: CheckCircle, text: 'سلتك جاهزة' },
      ],
    },
    en: {
      title: 'Have a Material List?',
      subtitle: 'Upload your material list and our team will add items to your cart',
      cta: 'Upload List Now',
      steps: [
        { icon: Upload, text: 'Upload File' },
        { icon: FileText, text: 'We Review' },
        { icon: Clock, text: '2-4 Hours' },
        { icon: CheckCircle, text: 'Cart Ready' },
      ],
    },
  };

  const t = content[language];

  return (
    <section className="section">
      <div className="container-custom">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 end-0 w-1/3 h-full opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <pattern id="upload-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="white"/>
                </pattern>
              </defs>
              <rect fill="url(#upload-pattern)" width="100%" height="100%"/>
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Content */}
              <div className="text-center lg:text-start">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t.title}
                </h2>
                <p className="text-lg text-primary-100 mb-6 max-w-xl">
                  {t.subtitle}
                </p>
                <Link
                  href="/upload-list"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  {t.cta}
                </Link>
              </div>

              {/* Steps */}
              <div className="flex items-center gap-4 md:gap-8">
                {t.steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                        <step.icon className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {step.text}
                      </span>
                    </div>
                    {index < t.steps.length - 1 && (
                      <div className="hidden md:block w-8 h-0.5 bg-white/30" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
