import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight, Clock, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore, useAuthStore, useUIStore } from '@/lib/store';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

interface OrderItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  createdAt: string;
  deliveredAt?: string;
}

export default function OrdersPage() {
  const { language } = useLanguageStore();
  const { isAuthenticated, token } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    ar: {
      title: 'طلباتي',
      noOrders: 'لا يوجد طلبات',
      noOrdersDesc: 'لم تقم بأي طلبات بعد',
      startShopping: 'ابدأ التسوق',
      orderNumber: 'رقم الطلب',
      orderDate: 'تاريخ الطلب',
      status: 'الحالة',
      total: 'الإجمالي',
      items: 'منتجات',
      viewDetails: 'عرض التفاصيل',
      reorder: 'إعادة الطلب',
      loginRequired: 'يرجى تسجيل الدخول لعرض طلباتك',
      login: 'تسجيل الدخول',
      loading: 'جاري التحميل...',
      statuses: {
        pending: 'قيد الانتظار',
        confirmed: 'تم التأكيد',
        processing: 'جاري التجهيز',
        ready: 'جاهز للتوصيل',
        in_transit: 'في الطريق',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
      },
    },
    en: {
      title: 'My Orders',
      noOrders: 'No Orders',
      noOrdersDesc: "You haven't placed any orders yet",
      startShopping: 'Start Shopping',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      status: 'Status',
      total: 'Total',
      items: 'items',
      viewDetails: 'View Details',
      reorder: 'Reorder',
      loginRequired: 'Please login to view your orders',
      login: 'Login',
      loading: 'Loading...',
      statuses: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        ready: 'Ready for Delivery',
        in_transit: 'In Transit',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      },
    },
  };

  const t = content[language];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedOrders = (data.data || []).map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: Number(order.total),
            itemsCount: order.items?.length || order.itemsCount || 0,
            createdAt: order.createdAt,
            deliveredAt: order.deliveredAt,
          }));
          setOrders(fetchedOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'processing':
      case 'ready':
        return Clock;
      case 'in_transit':
        return Truck;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'in_transit':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Arrow = language === 'ar' ? ChevronLeft : ChevronRight;

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
              <Package className="w-10 h-10 text-gray-400" />
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="ms-2 text-gray-500">{t.loading}</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.noOrders}</h2>
              <p className="text-gray-500 mb-6">{t.noOrdersDesc}</p>
              <Link href="/categories" className="btn-primary">
                {t.startShopping}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Order info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-gray-900">
                              {t.orderNumber}: {order.orderNumber || order.id}
                            </span>
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(order.status)
                            )}>
                              <StatusIcon className="w-3 h-3" />
                              {t.statuses[order.status]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {t.orderDate}: {formatDate(order.createdAt, language)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.itemsCount} {t.items}
                          </p>
                        </div>
                      </div>

                      {/* Price and actions */}
                      <div className="flex items-center justify-between md:justify-end gap-6">
                        <div className="text-end">
                          <p className="text-sm text-gray-500">{t.total}</p>
                          <p className="text-lg font-bold text-primary-600">
                            {formatPrice(order.total, language)}
                          </p>
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {t.viewDetails}
                          <Arrow className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
