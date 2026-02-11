import Head from 'next/head';
import { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Bell,
  Globe,
  Save,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'delivery' | 'payment' | 'notifications';

export default function AdminSettingsPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState({
    general: {
      storeNameAr: 'شطابلي',
      storeNameEn: 'Shatably',
      phone: '16XXX',
      email: 'support@shatably.com',
      currency: 'EGP',
      defaultLanguage: 'ar',
      addressAr: '',
      addressEn: '',
      workingHoursAr: '',
      workingHoursEn: '',
    },
    delivery: {
      expressEnabled: true,
      expressBaseFee: 150,
      scheduledBaseFee: 100,
      freeDeliveryThreshold: 10000,
      itemCountThreshold: 10,
      itemCountDiscount: 20,
      highValueThreshold: 15000,
      highValueDeliveryFee: 50,
      operatingHoursStart: '08:00',
      operatingHoursEnd: '20:00',
    },
    payment: {
      codEnabled: true,
      cardEnabled: false,
      fawryEnabled: false,
      walletEnabled: false,
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

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setSettings((prev) => ({
              general: { ...prev.general, ...data.data.general },
              delivery: { ...prev.delivery, ...data.data.delivery },
              payment: { ...prev.payment, ...data.data.payment },
              notifications: { ...prev.notifications, ...data.data.notifications },
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

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
      saved: 'تم الحفظ بنجاح',
      error: 'فشل في الحفظ',
      loading: 'جاري التحميل...',
      general: {
        title: 'الإعدادات العامة',
        storeName: 'اسم المتجر (عربي)',
        storeNameEn: 'اسم المتجر (إنجليزي)',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        currency: 'العملة',
        defaultLanguage: 'اللغة الافتراضية',
        addressAr: 'العنوان (عربي)',
        addressEn: 'العنوان (إنجليزي)',
        workingHoursAr: 'ساعات العمل (عربي)',
        workingHoursEn: 'ساعات العمل (إنجليزي)',
      },
      delivery: {
        title: 'إعدادات التوصيل',
        expressEnabled: 'تفعيل التوصيل السريع',
        expressBaseFee: 'رسوم التوصيل السريع',
        scheduledBaseFee: 'رسوم التوصيل المجدول',
        freeDeliveryThreshold: 'حد التوصيل المجاني',
        itemCountThreshold: 'عدد المنتجات للخصم',
        itemCountDiscount: 'نسبة خصم التوصيل (%)',
        highValueThreshold: 'حد الطلبات الكبيرة',
        highValueDeliveryFee: 'رسوم الطلبات الكبيرة',
        operatingHours: 'ساعات العمل',
        from: 'من',
        to: 'إلى',
        rulesNote: 'قواعد التوصيل: توصيل مجاني للطلبات فوق حد معين، خصم على التوصيل عند شراء عدد كبير من المنتجات',
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
      saved: 'Saved successfully',
      error: 'Failed to save',
      loading: 'Loading...',
      general: {
        title: 'General Settings',
        storeName: 'Store Name (Arabic)',
        storeNameEn: 'Store Name (English)',
        phone: 'Phone Number',
        email: 'Email',
        currency: 'Currency',
        defaultLanguage: 'Default Language',
        addressAr: 'Address (Arabic)',
        addressEn: 'Address (English)',
        workingHoursAr: 'Working Hours (Arabic)',
        workingHoursEn: 'Working Hours (English)',
      },
      delivery: {
        title: 'Delivery Settings',
        expressEnabled: 'Enable Express Delivery',
        expressBaseFee: 'Express Delivery Fee',
        scheduledBaseFee: 'Scheduled Delivery Fee',
        freeDeliveryThreshold: 'Free Delivery Threshold',
        itemCountThreshold: 'Item Count for Discount',
        itemCountDiscount: 'Delivery Discount (%)',
        highValueThreshold: 'High Value Order Threshold',
        highValueDeliveryFee: 'High Value Order Fee',
        operatingHours: 'Operating Hours',
        from: 'From',
        to: 'To',
        rulesNote: 'Delivery rules: Free delivery above threshold, discount on delivery for bulk orders',
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
    if (!token) {
      setSaveMessage({ type: 'error', text: t.error });
      return;
    }
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          general: settings.general,
          delivery: settings.delivery,
          payment: settings.payment,
          notifications: settings.notifications,
        }),
      });
      if (response.ok) {
        setSaveMessage({ type: 'success', text: t.saved });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage({ type: 'error', text: t.error });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title={t.title}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="ms-2 text-gray-500">{t.loading}</span>
        </div>
      </AdminLayout>
    );
  }

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
                          value={settings.general.storeNameAr}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, storeNameAr: e.target.value } })}
                          className="input"
                          dir="rtl"
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.addressAr}</label>
                        <input
                          type="text"
                          value={settings.general.addressAr}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, addressAr: e.target.value } })}
                          className="input"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.addressEn}</label>
                        <input
                          type="text"
                          value={settings.general.addressEn}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, addressEn: e.target.value } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.workingHoursAr}</label>
                        <input
                          type="text"
                          value={settings.general.workingHoursAr}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, workingHoursAr: e.target.value } })}
                          className="input"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.general.workingHoursEn}</label>
                        <input
                          type="text"
                          value={settings.general.workingHoursEn}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, workingHoursEn: e.target.value } })}
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
                    <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {t.delivery.rulesNote}
                    </div>

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
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.expressBaseFee} (EGP)</label>
                        <input
                          type="number"
                          value={settings.delivery.expressBaseFee}
                          onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, expressBaseFee: Number(e.target.value) } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.scheduledBaseFee} (EGP)</label>
                        <input
                          type="number"
                          value={settings.delivery.scheduledBaseFee}
                          onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, scheduledBaseFee: Number(e.target.value) } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.freeDeliveryThreshold} (EGP)</label>
                        <input
                          type="number"
                          value={settings.delivery.freeDeliveryThreshold}
                          onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, freeDeliveryThreshold: Number(e.target.value) } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.itemCountThreshold}</label>
                        <input
                          type="number"
                          value={settings.delivery.itemCountThreshold}
                          onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, itemCountThreshold: Number(e.target.value) } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.itemCountDiscount}</label>
                        <input
                          type="number"
                          value={settings.delivery.itemCountDiscount}
                          onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, itemCountDiscount: Number(e.target.value) } })}
                          className="input"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.highValueThreshold} (EGP)</label>
                        <input
                          type="number"
                          value={settings.delivery.highValueThreshold}
                          onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, highValueThreshold: Number(e.target.value) } })}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.delivery.highValueDeliveryFee} (EGP)</label>
                        <input
                          type="number"
                          value={settings.delivery.highValueDeliveryFee}
                          onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, highValueDeliveryFee: Number(e.target.value) } })}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.delivery.operatingHours}</label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t.delivery.from}</span>
                          <input
                            type="time"
                            value={settings.delivery.operatingHoursStart}
                            onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, operatingHoursStart: e.target.value } })}
                            className="input w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t.delivery.to}</span>
                          <input
                            type="time"
                            value={settings.delivery.operatingHoursEnd}
                            onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, operatingHoursEnd: e.target.value } })}
                            className="input w-32"
                          />
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.payment.minOrderAmount} (EGP)</label>
                      <input
                        type="number"
                        value={settings.payment.minOrderAmount}
                        onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, minOrderAmount: Number(e.target.value) } })}
                        className="input w-48"
                      />
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
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                {saveMessage && (
                  <span className={cn(
                    'text-sm font-medium',
                    saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {saveMessage.text}
                  </span>
                )}
                <div className="ms-auto">
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
        </div>
      </AdminLayout>
    </>
  );
}
