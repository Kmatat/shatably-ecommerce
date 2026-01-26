'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore, useUIStore, useLanguageStore } from '@/lib/store';
import { cn, validateEgyptPhone } from '@/lib/utils';

export default function AuthModal() {
  const { language } = useLanguageStore();
  const { setUser } = useAuthStore();
  const { isAuthModalOpen, authModalTab, closeAuthModal } = useUIStore();

  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'homeowner' | 'contractor' | 'designer'>('homeowner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('phone');
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setName('');
      setError('');
    }
  }, [isAuthModalOpen]);

  const content = {
    ar: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب جديد',
      phoneLabel: 'رقم الموبايل',
      phonePlaceholder: '01XXXXXXXXX',
      sendOtp: 'إرسال كود التحقق',
      enterOtp: 'أدخل كود التحقق',
      otpSent: 'تم إرسال الكود إلى',
      resendOtp: 'إعادة إرسال الكود',
      resendIn: 'إعادة الإرسال خلال',
      seconds: 'ثانية',
      verify: 'تحقق',
      completeProfile: 'أكمل بياناتك',
      nameLabel: 'الاسم',
      namePlaceholder: 'أدخل اسمك',
      userTypeLabel: 'نوع الحساب',
      homeowner: 'صاحب منزل',
      contractor: 'مقاول',
      designer: 'مصمم داخلي',
      continue: 'متابعة',
      skip: 'تخطي',
      invalidPhone: 'رقم الموبايل غير صحيح',
      invalidOtp: 'الكود غير صحيح',
      orLoginWith: 'أو سجل دخول بواسطة',
    },
    en: {
      login: 'Login',
      register: 'Create Account',
      phoneLabel: 'Mobile Number',
      phonePlaceholder: '01XXXXXXXXX',
      sendOtp: 'Send Verification Code',
      enterOtp: 'Enter Verification Code',
      otpSent: 'Code sent to',
      resendOtp: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      verify: 'Verify',
      completeProfile: 'Complete Your Profile',
      nameLabel: 'Name',
      namePlaceholder: 'Enter your name',
      userTypeLabel: 'Account Type',
      homeowner: 'Homeowner',
      contractor: 'Contractor',
      designer: 'Interior Designer',
      continue: 'Continue',
      skip: 'Skip',
      invalidPhone: 'Invalid phone number',
      invalidOtp: 'Invalid verification code',
      orLoginWith: 'Or login with',
    },
  };

  const t = content[language];
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  const handleSendOtp = async () => {
    setError('');
    if (!validateEgyptPhone(phone)) {
      setError(t.invalidPhone);
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('otp');
    setCountdown(60);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(t.invalidOtp);
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    if (authModalTab === 'register') {
      setStep('profile');
    } else {
      setUser({
        id: 'user-1',
        phone,
        type: 'homeowner',
        languagePreference: language,
        createdAt: new Date().toISOString(),
      });
      closeAuthModal();
    }
  };

  const handleCompleteProfile = () => {
    setUser({
      id: 'user-1',
      phone,
      name: name || undefined,
      type: userType,
      languagePreference: language,
      createdAt: new Date().toISOString(),
    });
    closeAuthModal();
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={closeAuthModal} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {step !== 'phone' && (
              <button onClick={() => setStep(step === 'profile' ? 'otp' : 'phone')} className="p-1 hover:bg-gray-100 rounded">
                <BackArrow className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">{authModalTab === 'login' ? t.login : t.register}</h2>
          </div>
          <button onClick={closeAuthModal} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'phone' && (
            <div>
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
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <button onClick={handleSendOtp} disabled={isLoading || phone.length < 11} className="btn-primary w-full mt-4">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.sendOtp}
              </button>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{t.orLoginWith}</span></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <button className="flex items-center justify-center p-3 border rounded-lg hover:bg-gray-50">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </button>
                  <button className="flex items-center justify-center p-3 border rounded-lg hover:bg-gray-50">
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </button>
                  <button className="flex items-center justify-center p-3 border rounded-lg hover:bg-gray-50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <p className="text-center text-gray-600 mb-6">{t.otpSent} <span className="font-medium" dir="ltr">{phone}</span></p>
              <div className="flex justify-center gap-2 mb-4" dir="ltr">
                {otp.map((digit, index) => (
                  <input key={index} id={`otp-${index}`} type="text" inputMode="numeric" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-primary-500 focus:outline-none" maxLength={1} />
                ))}
              </div>
              {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
              <button onClick={handleVerifyOtp} disabled={isLoading || otp.join('').length !== 6} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.verify}
              </button>
              <div className="mt-4 text-center">
                {countdown > 0 ? (
                  <p className="text-gray-500 text-sm">{t.resendIn} {countdown} {t.seconds}</p>
                ) : (
                  <button onClick={() => setCountdown(60)} className="text-primary-600 hover:text-primary-700 text-sm font-medium">{t.resendOtp}</button>
                )}
              </div>
            </div>
          )}

          {step === 'profile' && (
            <div>
              <h3 className="text-lg font-medium text-center mb-6">{t.completeProfile}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.nameLabel}</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.userTypeLabel}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: 'homeowner', label: t.homeowner, icon: '🏠' }, { id: 'contractor', label: t.contractor, icon: '👷' }, { id: 'designer', label: t.designer, icon: '🎨' }].map((type) => (
                      <button key={type.id} onClick={() => setUserType(type.id as typeof userType)} className={cn('p-3 border-2 rounded-lg text-center transition-colors', userType === type.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300')}>
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleCompleteProfile} className="btn-outline flex-1">{t.skip}</button>
                <button onClick={handleCompleteProfile} className="btn-primary flex-1">{t.continue}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
