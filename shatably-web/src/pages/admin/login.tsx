'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { validateEgyptPhone } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { token, setToken, setUser, user } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in as admin
  useEffect(() => {
    if (token && user && (user.role === 'admin' || user.role === 'super_admin')) {
      router.replace('/admin');
    }
  }, [token, user, router]);

  const content = {
    ar: {
      title: 'تسجيل دخول الإدارة',
      subtitle: 'لوحة تحكم شطابلي',
      phoneLabel: 'رقم الموبايل',
      phonePlaceholder: '01XXXXXXXXX',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      loginButton: 'تسجيل الدخول',
      backToStore: 'العودة للمتجر',
      invalidPhone: 'رقم الموبايل غير صحيح',
      invalidCredentials: 'رقم الموبايل أو كلمة المرور غير صحيحة',
      notAdmin: 'هذا الحساب ليس لديه صلاحيات الإدارة',
      networkError: 'خطأ في الاتصال. حاول مرة أخرى.',
    },
    en: {
      title: 'Admin Login',
      subtitle: 'Shatably Control Panel',
      phoneLabel: 'Mobile Number',
      phonePlaceholder: '01XXXXXXXXX',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      loginButton: 'Login',
      backToStore: 'Back to Store',
      invalidPhone: 'Invalid phone number',
      invalidCredentials: 'Invalid phone number or password',
      notAdmin: 'This account does not have admin privileges',
      networkError: 'Network error. Please try again.',
    },
  };

  const t = content[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEgyptPhone(phone)) {
      setError(t.invalidPhone);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.invalidCredentials);
      }

      const { token: authToken, user: userData } = data.data;

      // Check if user has admin role
      if (userData.role !== 'admin' && userData.role !== 'super_admin' && userData.role !== 'employee') {
        throw new Error(t.notAdmin);
      }

      setToken(authToken);
      setUser(userData);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
              <span className="text-white text-3xl font-bold">ش</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{t.title}</h1>
            <p className="text-gray-400 mt-1">{t.subtitle}</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.phonePlaceholder}
                    className="w-full ps-10 pe-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    style={{ direction: 'ltr' }}
                    maxLength={11}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full ps-10 pe-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t.loginButton
                )}
              </button>
            </form>

            {/* Back to Store */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.backToStore}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
