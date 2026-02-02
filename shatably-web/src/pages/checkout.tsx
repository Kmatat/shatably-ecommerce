import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MapPin,
  Plus,
  Truck,
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  ChevronDown,
  Check,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Header, Footer, AddressModal } from '@/components';
import { useCartStore, useLanguageStore, useAuthStore } from '@/lib/store';
import { formatPrice, cn, generateOrderNumber } from '@/lib/utils';
import type { Address } from '@/types';

type DeliveryType = 'express' | 'scheduled';
type PaymentMethod = 'card' | 'fawry' | 'cod' | 'wallet';
type TimeSlot = 'morning' | 'afternoon' | 'evening';

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('scheduled');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<TimeSlot>('morning');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Fetch addresses from API
  const fetchAddresses = async () => {
    if (!isAuthenticated || !token) {
      setLoadingAddresses(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedAddresses = data.data || [];
        setAddresses(fetchedAddresses);
        // Auto-select default or first address
        const defaultAddr = fetchedAddresses.find((a: Address) => a.isDefault);
        setSelectedAddressId(defaultAddr?.id || fetchedAddresses[0]?.id || null);
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

  const handleAddressSaved = (savedAddress: Address) => {
    fetchAddresses();
    setShowAddressModal(false);
  };

  const subtotal = getSubtotal();
  const expressDeliveryFee = 150;
  const scheduledDeliveryFee = subtotal > 5000 ? 0 : 100;
  const deliveryFee = deliveryType === 'express' ? expressDeliveryFee : scheduledDeliveryFee;
  const total = subtotal + deliveryFee;

  // Generate next 7 days for scheduling
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  const content = {
    ar: {
      checkout: 'إتمام الطلب',
      step1: 'عنوان التوصيل',
      step2: 'طريقة التوصيل',
      step3: 'الدفع',
      selectAddress: 'اختر عنوان التوصيل',
      addNewAddress: 'إضافة عنوان جديد',
      noAddresses: 'لا توجد عناوين محفوظة',
      deliveryOptions: 'اختر طريقة التوصيل',
      express: 'توصيل سريع',
      expressDesc: 'خلال 3 ساعات',
      scheduled: 'توصيل مجدول',
      scheduledDesc: 'اختر الموعد المناسب',
      selectDate: 'اختر التاريخ',
      selectTime: 'اختر الوقت',
      morning: 'صباحاً (8-12)',
      afternoon: 'ظهراً (12-4)',
      evening: 'مساءً (4-8)',
      paymentMethod: 'اختر طريقة الدفع',
      card: 'بطاقة ائتمان',
      fawry: 'فوري',
      cod: 'الدفع عند الاستلام',
      wallet: 'محفظة إلكترونية',
      orderSummary: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      delivery: 'التوصيل',
      free: 'مجاني',
      total: 'الإجمالي',
      next: 'التالي',
      back: 'رجوع',
      placeOrder: 'تأكيد الطلب',
      processing: 'جاري التأكيد...',
      orderSuccess: 'تم الطلب بنجاح!',
      orderNumber: 'رقم الطلب',
      thankYou: 'شكراً لك! سنتواصل معك قريباً.',
      trackOrder: 'تتبع الطلب',
      continueShopping: 'تابع التسوق',
      loginRequired: 'يرجى تسجيل الدخول أولاً',
    },
    en: {
      checkout: 'Checkout',
      step1: 'Delivery Address',
      step2: 'Delivery Method',
      step3: 'Payment',
      selectAddress: 'Select Delivery Address',
      addNewAddress: 'Add New Address',
      noAddresses: 'No saved addresses',
      deliveryOptions: 'Select Delivery Method',
      express: 'Express Delivery',
      expressDesc: 'Within 3 hours',
      scheduled: 'Scheduled Delivery',
      scheduledDesc: 'Choose your preferred time',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      morning: 'Morning (8-12)',
      afternoon: 'Afternoon (12-4)',
      evening: 'Evening (4-8)',
      paymentMethod: 'Select Payment Method',
      card: 'Credit Card',
      fawry: 'Fawry',
      cod: 'Cash on Delivery',
      wallet: 'Mobile Wallet',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      free: 'Free',
      total: 'Total',
      next: 'Next',
      back: 'Back',
      placeOrder: 'Place Order',
      processing: 'Processing...',
      orderSuccess: 'Order Placed Successfully!',
      orderNumber: 'Order Number',
      thankYou: 'Thank you! We will contact you soon.',
      trackOrder: 'Track Order',
      continueShopping: 'Continue Shopping',
      loginRequired: 'Please login first',
    },
  };

  const t = content[language];

  const paymentMethods = [
    { id: 'card', icon: CreditCard, label: t.card },
    { id: 'fawry', icon: Smartphone, label: t.fawry },
    { id: 'cod', icon: Banknote, label: t.cod },
    { id: 'wallet', icon: Smartphone, label: t.wallet },
  ];

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !token) return;

    setIsLoading(true);

    try {
      // Build order items from cart
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const orderData = {
        addressId: selectedAddressId,
        deliveryType,
        scheduledDate: deliveryType === 'scheduled' ? selectedDate : undefined,
        scheduledTime: deliveryType === 'scheduled' ? selectedTime : undefined,
        paymentMethod,
        items: orderItems,
        notes: '',
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (response.ok && data.data) {
        setOrderNumber(data.data.orderNumber);
        setOrderComplete(true);
        clearCart();
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      alert(language === 'ar' ? 'فشل في إرسال الطلب' : 'Failed to submit order');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <>
        <Header />
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}
          </h1>
          <Link href="/categories" className="btn-primary">
            {t.continueShopping}
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (orderComplete) {
    return (
      <>
        <Header />
        <div className="container-custom py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.orderSuccess}</h1>
            <p className="text-gray-500 mb-6">{t.thankYou}</p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">{t.orderNumber}</p>
              <p className="text-xl font-bold text-primary-600">{orderNumber}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/orders/${orderNumber}`} className="btn-primary flex-1">
                {t.trackOrder}
              </Link>
              <Link href="/categories" className="btn-outline flex-1">
                {t.continueShopping}
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t.checkout} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {t.checkout}
          </h1>

          {/* Steps indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors',
                    step >= s
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <span className={cn(
                  'hidden sm:block mx-2 font-medium',
                  step >= s ? 'text-primary-600' : 'text-gray-500'
                )}>
                  {s === 1 ? t.step1 : s === 2 ? t.step2 : t.step3}
                </span>
                {s < 3 && (
                  <div className={cn(
                    'w-12 sm:w-20 h-1 mx-2',
                    step > s ? 'bg-primary-500' : 'bg-gray-200'
                  )} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Step 1: Address */}
                {step === 1 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6">{t.selectAddress}</h2>

                    {loadingAddresses ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                      </div>
                    ) : addresses.length > 0 ? (
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <label
                            key={address.id}
                            className={cn(
                              'block p-4 border-2 rounded-xl cursor-pointer transition-colors',
                              selectedAddressId === address.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="address"
                                checked={selectedAddressId === address.id}
                                onChange={() => setSelectedAddressId(address.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-4 h-4 text-primary-600" />
                                  <span className="font-medium">{address.label}</span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                                      {language === 'ar' ? 'افتراضي' : 'Default'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">{address.fullAddress}</p>
                                <p className="text-gray-500 text-sm">
                                  {address.contactName} - {address.contactPhone}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">{t.noAddresses}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      {t.addNewAddress}
                    </button>
                  </div>
                )}

                {/* Step 2: Delivery */}
                {step === 2 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6">{t.deliveryOptions}</h2>
                    
                    <div className="space-y-3 mb-6">
                      <label
                        className={cn(
                          'block p-4 border-2 rounded-xl cursor-pointer transition-colors',
                          deliveryType === 'express'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryType === 'express'}
                            onChange={() => setDeliveryType('express')}
                          />
                          <Truck className="w-6 h-6 text-primary-600" />
                          <div className="flex-1">
                            <p className="font-medium">{t.express}</p>
                            <p className="text-sm text-gray-500">{t.expressDesc}</p>
                          </div>
                          <span className="font-semibold text-primary-600">
                            {formatPrice(expressDeliveryFee, language)}
                          </span>
                        </div>
                      </label>

                      <label
                        className={cn(
                          'block p-4 border-2 rounded-xl cursor-pointer transition-colors',
                          deliveryType === 'scheduled'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryType === 'scheduled'}
                            onChange={() => setDeliveryType('scheduled')}
                          />
                          <Clock className="w-6 h-6 text-primary-600" />
                          <div className="flex-1">
                            <p className="font-medium">{t.scheduled}</p>
                            <p className="text-sm text-gray-500">{t.scheduledDesc}</p>
                          </div>
                          <span className={cn(
                            'font-semibold',
                            scheduledDeliveryFee === 0 ? 'text-green-600' : 'text-primary-600'
                          )}>
                            {scheduledDeliveryFee === 0 ? t.free : formatPrice(scheduledDeliveryFee, language)}
                          </span>
                        </div>
                      </label>
                    </div>

                    {deliveryType === 'scheduled' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.selectDate}
                          </label>
                          <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input"
                          >
                            <option value="">{t.selectDate}</option>
                            {availableDates.map((date) => (
                              <option key={date} value={date}>
                                {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-EG', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.selectTime}
                          </label>
                          <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value as TimeSlot)}
                            className="input"
                          >
                            <option value="morning">{t.morning}</option>
                            <option value="afternoon">{t.afternoon}</option>
                            <option value="evening">{t.evening}</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6">{t.paymentMethod}</h2>
                    
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={cn(
                            'block p-4 border-2 rounded-xl cursor-pointer transition-colors',
                            paymentMethod === method.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment"
                              checked={paymentMethod === method.id}
                              onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                            />
                            <method.icon className="w-6 h-6 text-primary-600" />
                            <span className="font-medium">{method.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="btn-outline"
                    >
                      {t.back}
                    </button>
                  ) : (
                    <div />
                  )}
                  
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={step === 1 && !selectedAddressId}
                      className="btn-primary"
                    >
                      {t.next}
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin me-2" />
                          {t.processing}
                        </>
                      ) : (
                        t.placeOrder
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-6">{t.orderSummary}</h2>

                {/* Items preview */}
                <div className="space-y-3 mb-6">
                  {items.slice(0, 3).map((item) => {
                    const name = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                    return (
                      <div key={item.productId} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={name}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <span className="absolute -top-2 -end-2 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{name}</p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.unitPrice * item.quantity, language)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {items.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{items.length - 3} {language === 'ar' ? 'منتجات أخرى' : 'more items'}
                    </p>
                  )}
                </div>

                <hr className="my-4" />

                {/* Totals */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.subtotal}</span>
                    <span className="font-medium">{formatPrice(subtotal, language)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.delivery}</span>
                    <span className={cn('font-medium', deliveryFee === 0 && 'text-green-600')}>
                      {deliveryFee === 0 ? t.free : formatPrice(deliveryFee, language)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">{t.total}</span>
                    <span className="font-bold text-primary-600">
                      {formatPrice(total, language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSaved}
        editAddress={null}
      />
    </>
  );
}
