'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Truck,
  BarChart3,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Globe,
  FolderTree,
  Pencil,
  Shield,
} from 'lucide-react';
import { useLanguageStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: { ar: 'لوحة التحكم', en: 'Dashboard' }, href: '/admin', icon: LayoutDashboard },
    { name: { ar: 'الطلبات', en: 'Orders' }, href: '/admin/orders', icon: ShoppingCart },
    { name: { ar: 'المنتجات', en: 'Products' }, href: '/admin/products', icon: Package },
    { name: { ar: 'الفئات', en: 'Categories' }, href: '/admin/categories', icon: FolderTree },
    { name: { ar: 'قوائم المواد', en: 'Material Lists' }, href: '/admin/material-lists', icon: FileText },
    { name: { ar: 'العملاء', en: 'Customers' }, href: '/admin/customers', icon: Users },
    { name: { ar: 'التوصيل', en: 'Delivery' }, href: '/admin/delivery', icon: Truck },
    { name: { ar: 'المحتوى', en: 'Content' }, href: '/admin/content', icon: Pencil },
    { name: { ar: 'المستخدمين', en: 'Admin Users' }, href: '/admin/users', icon: Shield },
    { name: { ar: 'التقارير', en: 'Reports' }, href: '/admin/reports', icon: BarChart3 },
    { name: { ar: 'الإعدادات', en: 'Settings' }, href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return router.pathname === '/admin';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 lg:translate-x-0',
          language === 'ar' ? 'right-0' : 'left-0',
          sidebarOpen
            ? 'translate-x-0'
            : language === 'ar'
            ? 'translate-x-full'
            : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">ش</span>
            </div>
            <span className="text-white font-bold text-lg">
              {language === 'ar' ? 'شطابلي' : 'Shatably'}
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name[language]}</span>
            </Link>
          ))}
        </nav>

        {/* Back to store */}
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('lg:ps-64', language === 'ar' ? 'lg:pr-64 lg:pl-0' : '')}>
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  className="w-64 ps-10 pe-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 end-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">أ</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <div className="absolute top-full end-0 mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <LogOut className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
