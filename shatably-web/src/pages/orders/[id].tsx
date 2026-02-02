import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { formatPrice, formatDate, cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  product?: {
    images?: { url: string }[];
  };
}

interface OrderAddress {
  label: string;
  fullAddress: string;
  contactName: string;
  contactPhone: string;
}

interface OrderDriver {
  name: string;
  phone: string;
  vehicle?: string;
  plateNumber?: string;
}

interface StatusHistoryItem {
  status: string;
  createdAt: string;
  note?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  statusHistory: StatusHistoryItem[];
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryType: string;
  scheduledDate?: string;
  scheduledTime?: string;
  paymentMethod: string;
  paymentStatus: string;
  address: OrderAddress;
  driver?: OrderDriver;
  createdAt: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { language } = useLanguageStore();
  const { token, isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const content = {
    ar: {
      orderDetails: 'تفاصيل الطلب',
      orderNumber: 'رقم الطلب',
      orderDate: 'تاريخ الطلب',
      trackOrder: 'تتبع الطلب',
      orderItems: 'منتجات الطلب',
      deliveryAddress: 'عنوان التوصيل',
      paymentMethod: 'طريقة الدفع',
      deliveryInfo: 'معلومات التوصيل',
      driverInfo: 'معلومات السائق',
      orderSummary: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      delivery: 'التوصيل',
      free: 'مجاني',
      discount: 'الخصم',
      total: 'الإجمالي',
      copyOrderNumber: 'نسخ رقم الطلب',
      copied: 'تم النسخ!',
      contactDriver: 'تواصل مع السائق',
      reorder: 'إعادة الطلب',
      back: 'رجوع',
      loading: 'جاري التحميل...',
      notFound: 'الطلب غير موجود',
      loginRequired: 'يرجى تسجيل الدخول لعرض الطلب',
      statuses: {
        pending: 'قيد الانتظار',
        confirmed: 'تم التأكيد',
        processing: 'جاري التجهيز',
        ready: 'جاهز للتوصيل',
        in_transit: 'في الطريق إليك',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
      },
      statusDescriptions: {
        pending: 'بانتظار تأكيد الطلب',
        confirmed: 'تم تأكيد طلبك بنجاح',
        processing: 'جاري تجهيز طلبك في المخزن',
        ready: 'طلبك جاهز وبانتظار السائق',
        in_transit: 'السائق في الطريق إليك',
        delivered: 'تم توصيل طلبك بنجاح',
        cancelled: 'تم إلغاء الطلب',
      },
      scheduledDelivery: 'التوصيل المجدول',
      expressDelivery: 'توصيل سريع',
      timeSlots: {
        morning: 'صباحاً (8-12)',
        afternoon: 'ظهراً (12-4)',
        evening: 'مساءً (4-8)',
      },
      paymentMethods: {
        cod: 'الدفع عند الاستلام',
        card: 'بطاقة ائتمان',
        fawry: 'فوري',
        wallet: 'محفظة إلكترونية',
      },
      quantity: 'الكمية',
    },
    en: {
      orderDetails: 'Order Details',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      trackOrder: 'Track Order',
      orderItems: 'Order Items',
      deliveryAddress: 'Delivery Address',
      paymentMethod: 'Payment Method',
      deliveryInfo: 'Delivery Information',
      driverInfo: 'Driver Information',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      free: 'Free',
      discount: 'Discount',
      total: 'Total',
      copyOrderNumber: 'Copy Order Number',
      copied: 'Copied!',
      contactDriver: 'Contact Driver',
      reorder: 'Reorder',
      back: 'Back',
      loading: 'Loading...',
      notFound: 'Order not found',
      loginRequired: 'Please login to view order',
      statuses: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        ready: 'Ready for Delivery',
        in_transit: 'On the Way',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      },
      statusDescriptions: {
        pending: 'Waiting for confirmation',
        confirmed: 'Your order has been confirmed',
        processing: 'Your order is being prepared',
        ready: 'Your order is ready for pickup',
        in_transit: 'Driver is on the way',
        delivered: 'Your order has been delivered',
        cancelled: 'Order has been cancelled',
      },
      scheduledDelivery: 'Scheduled Delivery',
      expressDelivery: 'Express Delivery',
      timeSlots: {
        morning: 'Morning (8-12)',
        afternoon: 'Afternoon (12-4)',
        evening: 'Evening (4-8)',
      },
      paymentMethods: {
        cod: 'Cash on Delivery',
        card: 'Credit Card',
        fawry: 'Fawry',
        wallet: 'Mobile Wallet',
      },
      quantity: 'Quantity',
    },
  };

  const t = content[language];
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id || !isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrder(data.data);
        } else if (response.status === 404) {
          setError(t.notFound);
        } else {
          setError('Failed to load order');
        }
      } catch (err) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isAuthenticated, token]);

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (status === 'delivered') return CheckCircle;
    if (status === 'in_transit') return Truck;
    return isCompleted ? CheckCircle : Clock;
  };

  const handleCopyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusHistory = () => {
    if (!order) return [];

    const allStatuses = [
      'pending',
      'confirmed',
      'processing',
      'ready',
      'in_transit',
      'delivered',
    ];

    const historyMap = new Map(
      order.statusHistory?.map((h) => [h.status, h.createdAt]) || []
    );

    const currentIndex = allStatuses.indexOf(order.status);

    return allStatuses.map((status, index) => ({
      status,
      date: historyMap.get(status) || null,
      completed: index <= currentIndex,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
            <p className="mt-2 text-gray-600">{t.loading}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.loginRequired}</p>
            <Link href="/orders" className="btn-primary mt-4 inline-block">
              {t.back}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error or not found
  if (error || !order) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{error || t.notFound}</p>
            <Link href="/orders" className="btn-primary mt-4 inline-block">
              {t.back}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusHistory = getStatusHistory();

  return (
    <>
      <Head>
        <title>
          {t.orderDetails} #{order.orderNumber} |{' '}
          {language === 'ar' ? 'شطابلي' : 'Shatably'}
        </title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Back button and header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <BackArrow className="w-5 h-5" />
              {t.back}
            </Link>
            <button
              onClick={handleCopyOrderNumber}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <Copy className="w-4 h-4" />
              {copied ? t.copied : t.copyOrderNumber}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t.orderNumber}: {order.orderNumber}
                </h1>
                <p className="text-gray-500">
                  {t.orderDate}: {formatDate(order.createdAt, language)}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn-outline flex items-center">
                  <RefreshCw className="w-4 h-4 me-2" />
                  {t.reorder}
                </button>
              </div>
            </div>

            {/* Order Tracking */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-6">{t.trackOrder}</h2>

              {/* Current Status */}
              <div className="bg-primary-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-900">
                      {t.statuses[order.status as keyof typeof t.statuses] ||
                        order.status}
                    </p>
                    <p className="text-primary-700 text-sm">
                      {t.statusDescriptions[
                        order.status as keyof typeof t.statusDescriptions
                      ] || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {statusHistory.map((step, index) => {
                  const StatusIcon = getStatusIcon(step.status, step.completed);
                  const isLast = index === statusHistory.length - 1;

                  return (
                    <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                            step.completed
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          )}
                        >
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        {!isLast && (
                          <div
                            className={cn(
                              'w-0.5 flex-1 mt-2',
                              step.completed ? 'bg-primary-500' : 'bg-gray-200'
                            )}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pb-2">
                        <p
                          className={cn(
                            'font-medium',
                            step.completed ? 'text-gray-900' : 'text-gray-400'
                          )}
                        >
                          {t.statuses[step.status as keyof typeof t.statuses]}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">
                            {new Date(step.date).toLocaleString(
                              language === 'ar' ? 'ar-EG' : 'en-EG',
                              { dateStyle: 'medium', timeStyle: 'short' }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Driver Info */}
            {order.status === 'in_transit' && order.driver && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-3">{t.driverInfo}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.driver.name}
                      </p>
                      {order.driver.vehicle && (
                        <p className="text-sm text-gray-500">
                          {order.driver.vehicle}
                          {order.driver.plateNumber &&
                            ` • ${order.driver.plateNumber}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={`tel:${order.driver.phone}`}
                    className="btn-primary flex items-center"
                  >
                    <Phone className="w-4 h-4 me-2" />
                    {t.contactDriver}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t.orderItems}</h2>
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const name =
                      language === 'ar' ? item.nameAr : item.nameEn;
                    const imageUrl =
                      item.product?.images?.[0]?.url ||
                      'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image';

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-4 border-b last:border-0"
                      >
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.productId}`}
                            className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                          >
                            {name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {t.quantity}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.total, language)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price, language)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  {t.deliveryAddress}
                </h3>
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.address.label}
                  </p>
                  <p>{order.address.fullAddress}</p>
                  <p className="mt-2">
                    {order.address.contactName} • {order.address.contactPhone}
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  {t.deliveryInfo}
                </h3>
                <div className="text-gray-600">
                  <p>
                    {order.deliveryType === 'express'
                      ? t.expressDelivery
                      : t.scheduledDelivery}
                  </p>
                  {order.scheduledDate && (
                    <>
                      <p className="font-medium text-gray-900">
                        {formatDate(order.scheduledDate, language)}
                      </p>
                      {order.scheduledTime && (
                        <p>
                          {t.timeSlots[
                            order.scheduledTime as keyof typeof t.timeSlots
                          ] || order.scheduledTime}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  {t.paymentMethod}
                </h3>
                <p className="text-gray-600">
                  {t.paymentMethods[
                    order.paymentMethod as keyof typeof t.paymentMethods
                  ] || order.paymentMethod}
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">{t.orderSummary}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.subtotal}</span>
                    <span>{formatPrice(order.subtotal, language)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.delivery}</span>
                    <span className={order.deliveryFee === 0 ? 'text-green-600' : ''}>
                      {order.deliveryFee === 0
                        ? t.free
                        : formatPrice(order.deliveryFee, language)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t.discount}</span>
                      <span>-{formatPrice(order.discount, language)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t.total}</span>
                    <span className="text-primary-600">
                      {formatPrice(order.total, language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
