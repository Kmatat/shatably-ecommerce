import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Phone,
  Mail,
  Shield,
  Bell,
  Globe,
  Camera,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Header, Footer, AddressModal } from '@/components';
import { useLanguageStore, useAuthStore, useUIStore } from '@/lib/store';
import { cn, formatPhone } from '@/lib/utils';
import { Address } from '@/types';

type TabType = 'profile' | 'addresses' | 'settings';

export default function AccountPage() {
  const { language } = useLanguageStore();
  const { user, isAuthenticated, logout, setUser, token } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const content = {
    ar: {
      title: 'حسابي',
      profile: 'الملف الشخصي',
      addresses: 'عناويني',
      settings: 'الإعدادات',
      orders: 'طلباتي',
      wishlist: 'المفضلة',
      logout: 'تسجيل الخروج',
      personalInfo: 'المعلومات الشخصية',
      name: 'الاسم',
      phone: 'رقم الموبايل',
      email: 'البريد الإلكتروني',
      accountType: 'نوع الحساب',
      homeowner: 'صاحب منزل',
      contractor: 'مقاول',
      designer: 'مصمم داخلي',
      edit: 'تعديل',
      save: 'حفظ',
      cancel: 'إلغاء',
      changePhoto: 'تغيير الصورة',
      memberSince: 'عضو منذ',
      savedAddresses: 'العناوين المحفوظة',
      addAddress: 'إضافة عنوان',
      noAddresses: 'لا توجد عناوين محفوظة',
      default: 'افتراضي',
      preferences: 'التفضيلات',
      language: 'اللغة',
      notifications: 'الإشعارات',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      smsNotifications: 'إشعارات SMS',
      pushNotifications: 'إشعارات التطبيق',
      security: 'الأمان',
      changePhone: 'تغيير رقم الموبايل',
      deleteAccount: 'حذف الحساب',
      loginRequired: 'يرجى تسجيل الدخول',
      login: 'تسجيل الدخول',
    },
    en: {
      title: 'My Account',
      profile: 'Profile',
      addresses: 'Addresses',
      settings: 'Settings',
      orders: 'My Orders',
      wishlist: 'Wishlist',
      logout: 'Logout',
      personalInfo: 'Personal Information',
      name: 'Name',
      phone: 'Phone Number',
      email: 'Email',
      accountType: 'Account Type',
      homeowner: 'Homeowner',
      contractor: 'Contractor',
      designer: 'Interior Designer',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      changePhoto: 'Change Photo',
      memberSince: 'Member since',
      savedAddresses: 'Saved Addresses',
      addAddress: 'Add Address',
      noAddresses: 'No saved addresses',
      default: 'Default',
      preferences: 'Preferences',
      language: 'Language',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      pushNotifications: 'Push Notifications',
      security: 'Security',
      changePhone: 'Change Phone Number',
      deleteAccount: 'Delete Account',
      loginRequired: 'Please login first',
      login: 'Login',
    },
  };

  const t = content[language];
  const Arrow = language === 'ar' ? ChevronLeft : ChevronRight;

  const userTypes = {
    homeowner: { ar: 'صاحب منزل', en: 'Homeowner', icon: '🏠' },
    contractor: { ar: 'مقاول', en: 'Contractor', icon: '👷' },
    designer: { ar: 'مصمم داخلي', en: 'Interior Designer', icon: '🎨' },
    worker: { ar: 'عامل', en: 'Worker', icon: '🔧' },
  };

  const handleSaveProfile = () => {
    if (user) {
      setUser({
        ...user,
        name: editedName || undefined,
        email: editedEmail || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Fetch addresses from API
  const fetchAddresses = async () => {
    if (!isAuthenticated || !token) return;

    setLoadingAddresses(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isAuthenticated, token]);

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleAddressSaved = (savedAddress: Address) => {
    // Refresh the addresses list
    fetchAddresses();
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>{t.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">{t.loginRequired}</p>
            <button onClick={() => openAuthModal('login')} className="btn-primary">
              {t.login}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {t.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* User info */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                    <button className="absolute bottom-0 end-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <h2 className="font-semibold text-gray-900 mt-3">
                    {user?.name || (language === 'ar' ? 'مستخدم' : 'User')}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.phone}</p>
                  {user?.type && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                      {userTypes[user.type].icon} {userTypes[user.type][language]}
                    </span>
                  )}
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {[
                    { id: 'profile', icon: User, label: t.profile },
                    { id: 'addresses', icon: MapPin, label: t.addresses },
                    { id: 'settings', icon: Settings, label: t.settings },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        activeTab === item.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-gray-50 text-gray-700'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}

                  <hr className="my-2" />

                  <Link
                    href="/orders"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5" />
                      <span className="font-medium">{t.orders}</span>
                    </div>
                    <Arrow className="w-5 h-5 text-gray-400" />
                  </Link>

                  <Link
                    href="/wishlist"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">{t.wishlist}</span>
                    </div>
                    <Arrow className="w-5 h-5 text-gray-400" />
                  </Link>

                  <hr className="my-2" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t.logout}</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{t.personalInfo}</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t.edit}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="btn-ghost text-sm">
                          {t.cancel}
                        </button>
                        <button onClick={handleSaveProfile} className="btn-primary text-sm">
                          {t.save}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          {t.name}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="input"
                            placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">
                            {user?.name || '-'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          {t.phone}
                        </label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium" dir="ltr">
                            {formatPhone(user?.phone || '')}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          {t.email}
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            className="input"
                            placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900 font-medium">
                              {user?.email || '-'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          {t.accountType}
                        </label>
                        <p className="text-gray-900 font-medium">
                          {user?.type && (
                            <span className="flex items-center gap-2">
                              {userTypes[user.type].icon} {userTypes[user.type][language]}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{t.savedAddresses}</h2>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="btn-primary text-sm flex items-center"
                    >
                      <MapPin className="w-4 h-4 me-2" />
                      {t.addAddress}
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border rounded-xl p-4 hover:border-primary-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-primary-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {address.label}
                                  </span>
                                  {address.isDefault && (
                                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                                      {t.default}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">{address.fullAddress}</p>
                                <p className="text-gray-500 text-sm mt-1">
                                  {address.contactName} • {address.contactPhone}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">{t.noAddresses}</p>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="btn-primary"
                      >
                        {t.addAddress}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Preferences */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6">{t.preferences}</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <span>{t.language}</span>
                        </div>
                        <select className="input w-32">
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      {t.notifications}
                    </h2>
                    
                    <div className="space-y-4">
                      {[
                        { id: 'email', label: t.emailNotifications },
                        { id: 'sms', label: t.smsNotifications },
                        { id: 'push', label: t.pushNotifications },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <span>{item.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {t.security}
                    </h2>
                    
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between py-3 border-b hover:text-primary-600">
                        <span>{t.changePhone}</span>
                        <Arrow className="w-5 h-5" />
                      </button>
                      <button className="w-full flex items-center justify-between py-3 text-red-600 hover:text-red-700">
                        <span>{t.deleteAccount}</span>
                        <Arrow className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={handleAddressModalClose}
        onSave={handleAddressSaved}
        editAddress={editingAddress}
      />
    </>
  );
}
