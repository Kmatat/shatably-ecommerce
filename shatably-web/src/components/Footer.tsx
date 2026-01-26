'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useLanguageStore } from '@/lib/store';

export default function Footer() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ش</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {language === 'ar' ? 'شطابلي' : 'Shatably'}
              </h3>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              {t('footer.aboutDesc')}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/categories" className="hover:text-primary-400 transition-colors">
                  {t('common.categories')}
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-primary-400 transition-colors">
                  {t('common.deals')}
                </Link>
              </li>
              <li>
                <Link href="/upload-list" className="hover:text-primary-400 transition-colors">
                  {t('materialList.title')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  {t('common.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              {t('footer.customerService')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  {t('footer.contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary-400 transition-colors">
                  {t('footer.shippingPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary-400 transition-colors">
                  {t('footer.returnPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">
                  {t('footer.termsConditions')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              {t('footer.contactUs')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">16XXX</p>
                  <p className="text-sm">
                    {language === 'ar' ? 'الخط الساخن' : 'Hotline'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">support@shatably.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm">
                    {language === 'ar'
                      ? 'القاهرة، مصر'
                      : 'Cairo, Egypt'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm">{t('footer.everyday')}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-xl mx-auto text-center">
            <h4 className="text-lg font-semibold text-white mb-2">
              {t('footer.newsletter')}
            </h4>
            <p className="text-sm mb-4">{t('footer.newsletterDesc')}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500 text-white"
              />
              <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {currentYear} {language === 'ar' ? 'شطابلي' : 'Shatably'}. {t('footer.allRightsReserved')}.
          </p>
          {/* Payment methods */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {language === 'ar' ? 'طرق الدفع:' : 'Payment methods:'}
            </span>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-gray-800 rounded text-xs font-medium">Visa</div>
              <div className="px-2 py-1 bg-gray-800 rounded text-xs font-medium">Mastercard</div>
              <div className="px-2 py-1 bg-gray-800 rounded text-xs font-medium">Fawry</div>
              <div className="px-2 py-1 bg-gray-800 rounded text-xs font-medium">
                {language === 'ar' ? 'كاش' : 'Cash'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
