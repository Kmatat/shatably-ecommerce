'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, Loader2, Lock, Eye, EyeOff, Mail, User } from 'lucide-react';
import { useAuthStore, useUIStore, useLanguageStore } from '@/lib/store';
import { cn, validateEgyptPhone } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AuthModal() {
  const { language } = useLanguageStore();
  const { setUser, setToken } = useAuthStore();
  const { isAuthModalOpen, authModalTab, closeAuthModal } = useUIStore();

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'homeowner' | 'contractor' | 'designer' | 'worker'>('homeowner');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (!isAuthModalOpen) {
      // Reset state when modal closes
      setIsLogin(authModalTab === 'login');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setEmail('');
      setError('');
      setSuccess('');
      setShowForgotPassword(false);
      setForgotEmail('');
    } else {
      setIsLogin(authModalTab === 'login');
    }
  }, [isAuthModalOpen, authModalTab]);

  const content = {
    ar: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب جديد',
      phoneLabel: 'رقم الموبايل',
      phonePlaceholder: '01XXXXXXXXX',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
      nameLabel: 'الاسم',
      namePlaceholder: 'أدخل اسمك',
      emailLabel: 'البريد الإلكتروني (اختياري)',
      emailPlaceholder: 'example@email.com',
      userTypeLabel: 'نوع الحساب',
      homeowner: 'صاحب منزل',
      contractor: 'مقاول',
      designer: 'مصمم داخلي',
      worker: 'عامل',
      loginButton: 'دخول',
      registerButton: 'إنشاء حساب',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      createAccount: 'إنشاء حساب',
      loginNow: 'تسجيل الدخول',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      sendResetLink: 'إرسال رابط الإعادة',
      backToLogin: 'العودة لتسجيل الدخول',
      resetEmailSent: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      invalidPhone: 'رقم الموبايل غير صحيح',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      passwordMismatch: 'كلمتا المرور غير متطابقتين',
      passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      networkError: 'خطأ في الاتصال. حاول مرة أخرى.',
      phoneRequired: 'رقم الموبايل مطلوب',
      passwordRequired: 'كلمة المرور مطلوبة',
    },
    en: {
      login: 'Login',
      register: 'Create Account',
      phoneLabel: 'Mobile Number',
      phonePlaceholder: '01XXXXXXXXX',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter password',
      nameLabel: 'Name',
      namePlaceholder: 'Enter your name',
      emailLabel: 'Email (Optional)',
      emailPlaceholder: 'example@email.com',
      userTypeLabel: 'Account Type',
      homeowner: 'Homeowner',
      contractor: 'Contractor',
      designer: 'Interior Designer',
      worker: 'Worker',
      loginButton: 'Login',
      registerButton: 'Create Account',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create Account',
      loginNow: 'Login',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Login',
      resetEmailSent: 'Password reset link sent to your email',
      invalidPhone: 'Invalid phone number',
      invalidEmail: 'Invalid email address',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      networkError: 'Network error. Please try again.',
      phoneRequired: 'Phone number is required',
      passwordRequired: 'Password is required',
    },
  };

  const t = content[language];

  const handleLogin = async () => {
    setError('');

    if (!phone) {
      setError(t.phoneRequired);
      return;
    }
    if (!validateEgyptPhone(phone)) {
      setError(t.invalidPhone);
      return;
    }
    if (!password) {
      setError(t.passwordRequired);
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
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.data.token);
      setUser(data.data.user);
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!phone) {
      setError(t.phoneRequired);
      return;
    }
    if (!validateEgyptPhone(phone)) {
      setError(t.invalidPhone);
      return;
    }
    if (!password || password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (email && !email.includes('@')) {
      setError(t.invalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password,
          name: name || undefined,
          email: email || undefined,
          type: userType,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.data.token);
      setUser(data.data.user);
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError(t.invalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(t.resetEmailSent);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={closeAuthModal} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">
            {showForgotPassword ? t.resetPassword : (isLogin ? t.login : t.register)}
          </h2>
          <button onClick={closeAuthModal} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Forgot Password View */}
          {showForgotPassword ? (
            <div>
              <p className="text-gray-600 text-sm mb-4">
                {language === 'ar'
                  ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور'
                  : 'Enter your email and we will send you a password reset link'}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="input ps-10"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="btn-primary w-full mb-4"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.sendResetLink}
              </button>

              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-sm text-primary-600 hover:text-primary-700"
              >
                {t.backToLogin}
              </button>
            </div>
          ) : (
            <>
              {/* Phone Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.phoneLabel}</label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.phonePlaceholder}
                    className="input ps-10"
                    style={{ direction: 'ltr' }}
                    maxLength={11}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="input ps-10 pe-10"
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

              {/* Registration fields */}
              {!isLogin && (
                <>
                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPasswordLabel}</label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t.confirmPasswordPlaceholder}
                        className="input ps-10"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.nameLabel}</label>
                    <div className="relative">
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.namePlaceholder}
                        className="input ps-10"
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailLabel}</label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="input ps-10"
                      />
                    </div>
                  </div>

                  {/* User Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.userTypeLabel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'homeowner', label: t.homeowner, icon: '🏠' },
                        { id: 'contractor', label: t.contractor, icon: '👷' },
                        { id: 'designer', label: t.designer, icon: '🎨' },
                        { id: 'worker', label: t.worker, icon: '🔧' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setUserType(type.id as typeof userType)}
                          className={cn(
                            'p-3 border-2 rounded-lg text-center transition-colors',
                            userType === type.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <span className="text-2xl block mb-1">{type.icon}</span>
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Error message */}
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

              {/* Submit button */}
              <button
                onClick={isLogin ? handleLogin : handleRegister}
                disabled={isLoading}
                className="btn-primary w-full mb-4"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? t.loginButton : t.registerButton
                )}
              </button>

              {/* Forgot password (login only) */}
              {isLogin && (
                <button
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                  }}
                  className="w-full text-sm text-primary-600 hover:text-primary-700 mb-4"
                >
                  {t.forgotPassword}
                </button>
              )}

              {/* Toggle login/register */}
              <div className="text-center text-sm text-gray-600">
                {isLogin ? t.noAccount : t.hasAccount}{' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isLogin ? t.createAccount : t.loginNow}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
