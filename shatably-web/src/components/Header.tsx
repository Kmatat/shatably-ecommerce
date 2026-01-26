'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Globe,
  Upload,
  Heart,
  Package,
} from 'lucide-react';
import { useCartStore, useAuthStore, useUIStore, useLanguageStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  children?: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
  }[];
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

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
      }
    };
    fetchCategories();
  }, []);
  
  const { getItemCount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { toggleMobileMenu, toggleCart, openAuthModal, isMobileMenuOpen } = useUIStore();
  const { language, setLanguage } = useLanguageStore();

  const itemCount = getItemCount();

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const getLocalizedName = (item: { nameAr: string; nameEn: string }) => {
    return language === 'ar' ? item.nameAr : item.nameEn;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-primary-600 text-white text-sm py-2">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>📞 16XXX</span>
            <span className="hidden sm:inline">
              {language === 'ar' ? 'توصيل سريع خلال 3 ساعات' : 'Express delivery within 3 hours'}
            </span>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 hover:text-primary-200 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom py-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ش</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary-600">
                {language === 'ar' ? 'شطابلي' : 'Shatably'}
              </h1>
              <p className="text-xs text-gray-500">
                {language === 'ar' ? 'مواد البناء' : 'Building Materials'}
              </p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div
              className={cn(
                'relative flex items-center border-2 rounded-lg transition-all duration-200',
                isSearchFocused ? 'border-primary-500 shadow-sm' : 'border-gray-200'
              )}
            >
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none"
              />
              <button className="px-4 py-2.5 bg-primary-500 text-white rounded-e-lg hover:bg-primary-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Upload list button */}
            <Link
              href="/upload-list"
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">
                {language === 'ar' ? 'ارفع قائمة' : 'Upload List'}
              </span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6 text-gray-600" />
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                  <User className="w-6 h-6 text-gray-600" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {user?.name || (language === 'ar' ? 'حسابي' : 'Account')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {/* Dropdown */}
                <div className="absolute top-full end-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-2">
                    <Link href="/account" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{t('common.myAccount')}</span>
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span>{t('common.orders')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <User className="w-6 h-6 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium">{t('common.login')}</span>
              </button>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 w-5 h-5 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="hidden sm:inline text-sm font-medium">{t('common.cart')}</span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-4 md:hidden">
          <div className="relative flex items-center border-2 border-gray-200 rounded-lg focus-within:border-primary-500">
            <input
              type="text"
              placeholder={t('common.searchPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none"
            />
            <button className="px-4 py-2.5 bg-primary-500 text-white rounded-e-lg">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories navigation */}
      <nav className="hidden lg:block border-t bg-gray-50">
        <div className="container-custom">
          <ul className="flex items-center gap-1">
            <li>
              <Link
                href="/categories"
                className="flex items-center gap-2 px-4 py-3 font-medium text-primary-600 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
                <span>{t('common.categories')}</span>
              </Link>
            </li>
            {categories.slice(0, 6).map((category) => (
              <li key={category.id} className="relative group">
                <Link
                  href={`/category/${category.slug || category.id}`}
                  className="flex items-center gap-1 px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                >
                  <span>{getLocalizedName(category)}</span>
                  {category.children && category.children.length > 0 && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Link>
                {category.children && category.children.length > 0 && (
                  <div className="absolute top-full start-0 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                    <div className="py-2">
                      {category.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug || sub.id}`}
                          className="block px-4 py-2 hover:bg-gray-50 hover:text-primary-600"
                        >
                          {getLocalizedName(sub)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/deals"
                className="flex items-center gap-1 px-4 py-3 text-secondary-600 font-medium hover:bg-gray-100"
              >
                🔥 {t('common.deals')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
