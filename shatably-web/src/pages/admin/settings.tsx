import Head from 'next/head';
import { useState } from 'react';
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Bell,
  Globe,
  Save,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'delivery' | 'payment' | 'notifications';

export default function AdminSettingsPage() {
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    general: {
      storeName: 'شطابلي',
      storeNameEn: 'Shatably',
      phone: '16XXX',
      email: 'support@shatably.com',
      currency: 'EGP',
      defaultLanguage: 'ar',
    },
    delivery: {
      expressEnabled: true,
      expressBaseFee: 150,
      expressRatePerKm: 5,
      scheduledBaseFee: 100,
      scheduledRatePerKm: 3,
      freeDeliveryThreshold: 5000,
      operatingHoursStart: '08:00',
      operatingHoursEnd: '20:00',
    },
    payment: {
      codEnabled: true,
      cardEnabled: true,
      fawryEnabled: true,
      walletEnabled: true,
      minOrderAmount: 100,
    },
    notifications: {
      orderConfirmation: true,
      orderShipped: true,
      orderDelivered: true,
      materialListReady: true,
      promotions: false,
    },
  });

  const content = {
    ar: {
      title: 'الإعدادات',
      tabs: {
        general: 'عام',
        delivery: 'التوصيل',
        payment: 'الدفع',
        notifications: 'الإشعارات',
      },
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      general: {
        title: 'الإعدادات العامة',
        storeName: 'اسم المتجر (عربي)',
        storeNameEn: 'اسم المتجر (إنجليزي)',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        currency: 'العملة',
        defaultLanguage: 'اللغة الافتراضية',
      },
      delivery: {
        title: 'إعدادات التوصيل',
        expressEnabled: 'تفعيل التوصيل السريع',
        expressBaseFee: 'رسوم التوصيل السريع الأساسية',
        expressRatePerKm: 'سعر الكيلومتر (سريع)',
        scheduledBaseFee: 'رسوم التوصيل المجدول الأساسية',
        scheduledRatePerKm: 'سعر الكيلومتر (مجدول)',
        freeDeliveryThreshold: 'حد التوصيل المجاني',
        operatingHours: 'ساعات العمل',
        from: 'من',
        to: 'إلى',
      },
      payment: {
        title: 'طرق الدفع',
        codEnabled: 'الدفع عند الاستلام',
        cardEnabled: 'بطاقات الائتمان',
        fawryEnabled: 'فوري',
        walletEnabled: 'المحافظ الإلكترونية',
        minOrderAmount: 'الحد الأدنى للطلب',
      },
      notifications: {
        title: 'إشعارات العملاء',
        orderConfirmation: 'تأكيد الطلب',
        orderShipped: 'شحن الطلب',
        orderDelivered: 'توصيل الطلب',
        materialListReady: 'جاهزية قائمة المواد',
        promotions: 'العروض والتخفيضات',
      },
      egp: 'جنيه مصري',
      arabic: 'العربية',
      english: 'English',
    },
    en: {
      title: 'Settings',
      tabs: {
        general: 'General',
        delivery: 'Delivery',
        payment: 'Payment',
        notifications: 'Notifications',
      },
      save: 'Save Changes',
      saving: 'Saving...',
      general: {
        title: 'General Settings',
        storeName: 'Store Name (Arabic)',
        storeNameEn: 'Store Name (English)',
        phone: 'Phone Number',
        email: 'Email',
        currency: 'Currency',
        defaultLanguage: 'Default Language',
      },
      delivery: {
        title: 'Delivery Settings',
        expressEnabled: 'Enable Express Delivery',
        expressBaseFee: 'Express Base Fee',
        expressRatePerKm: 'Express Rate per KM',
        scheduledBaseFee: 'Scheduled Base Fee',
        scheduledRatePerKm: 'Scheduled Rate per KM',
        freeDeliveryThreshold: 'Free Delivery Threshold',
        operatingHours: 'Operating Hours',
        from: 'From',
        to: 'To',
      },
      payment: {
        title: 'Payment Methods',
        codEnabled: 'Cash on Delivery',
        cardEnabled: 'Credit Cards',
        fawryEnabled: 'Fawry',
        walletEnabled: 'Mobile Wallets',
        minOrderAmount: 'Minimum Order Amount',
      },
      notifications: {
        title: 'Customer Notifications',
        orderConfirmation: 'Order Confirmation',
        orderShipped: 'Order Shipped',
        orderDelivered: 'Order Delivered',
        materialListReady: 'Material List Ready',
        promotions: 'Promotions & Offers',
      },
      egp: 'Egyptian Pound',
      arabic: 'العربية',
      english: 'English',
    },
  };

  const t = content[language];

  const tabs = [
    { id: 'general', label: t.tabs.general, icon: Store },
    { id: 'delivery', label: t.tabs.delivery, icon: Truck },
    { id: 'payment', label: t.tabs.payment, icon: CreditCard },
    { id: 'notifications', label: t.tabs.notifications, icon: Bell },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}</title>
      </Head>

      <AdminLayout title={t.title}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-lg font-semibold mb-6">{t.general.title}</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.storeName}</label>
                        <input
                          type="text"
                          value={settings.general.storeName}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, storeName: e.target.value } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.storeNameEn}</label>
                        <input
                          type="text"
                          value={settings.general.storeNameEn}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, storeNameEn: e.target.value } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.phone}</label>
                        <input
                          type="text"
                          value={settings.general.phone}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, phone: e.target.value } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.email}</label>
                        <input
                          type="email"
                          value={settings.general.email}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, email: e.target.value } })}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Settings */}
              {activeTab === 'delivery' && (
                <div>
                  <h2 className="text-lg font-semibold mb-6">{t.delivery.title}</h2>
                  <div className="space-y-6">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t.delivery.expressEnabled}</span>
                      <input
                        type="checkbox"
                        checked={settings.delivery.expressEnabled}
                        onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, expressEnabled: e.target.checked } })}
                        className="w-5 h-5 rounded text-primary-600"
                      />
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.expressBaseFee}</label>
                        <input type="number" value={settings.delivery.expressBaseFee} onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, expressBaseFee: Number(e.target.value) } })} className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.expressRatePerKm}</label>
                        <input type="number" value={settings.delivery.expressRatePerKm} onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, expressRatePerKm: Number(e.target.value) } })} className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.scheduledBaseFee}</label>
                        <input type="number" value={settings.delivery.scheduledBaseFee} onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, scheduledBaseFee: Number(e.target.value) } })} className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.scheduledRatePerKm}</label>
                        <input type="number" value={settings.delivery.scheduledRatePerKm} onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, scheduledRatePerKm: Number(e.target.value) } })} className="input" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.freeDeliveryThreshold}</label>
                        <input type="number" value={settings.delivery.freeDeliveryThreshold} onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, freeDeliveryThreshold: Number(e.target.value) } })} className="input" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.delivery.operatingHours}</label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t.delivery.from}</span>
                          <input type="time" value={settings.delivery.operatingHoursStart} onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, operatingHoursStart: e.target.value } })} className="input w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t.delivery.to}</span>
                          <input type="time" value={settings.delivery.operatingHoursEnd} onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, operatingHoursEnd: e.target.value } })} className="input w-32" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div>
                  <h2 className="text-lg font-semibold mb-6">{t.payment.title}</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'codEnabled', label: t.payment.codEnabled },
                      { key: 'cardEnabled', label: t.payment.cardEnabled },
                      { key: 'fawryEnabled', label: t.payment.fawryEnabled },
                      { key: 'walletEnabled', label: t.payment.walletEnabled },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={settings.payment[item.key as keyof typeof settings.payment] as boolean}
                          onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, [item.key]: e.target.checked } })}
                          className="w-5 h-5 rounded text-primary-600"
                        />
                      </label>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.payment.minOrderAmount}</label>
                      <input type="number" value={settings.payment.minOrderAmount} onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, minOrderAmount: Number(e.target.value) } })} className="input w-48" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-semibold mb-6">{t.notifications.title}</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'orderConfirmation', label: t.notifications.orderConfirmation },
                      { key: 'orderShipped', label: t.notifications.orderShipped },
                      { key: 'orderDelivered', label: t.notifications.orderDelivered },
                      { key: 'materialListReady', label: t.notifications.materialListReady },
                      { key: 'promotions', label: t.notifications.promotions },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                          onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, [item.key]: e.target.checked } })}
                          className="w-5 h-5 rounded text-primary-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                  {isSaving ? (
                    <><RefreshCw className="w-5 h-5 animate-spin me-2" />{t.saving}</>
                  ) : (
                    <><Save className="w-5 h-5 me-2" />{t.save}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
