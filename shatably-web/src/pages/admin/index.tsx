import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  Clock,
  Truck,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';

interface DashboardData {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    totalCustomers: number;
    pendingLists: number;
    lowStockProducts: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const content = {
    ar: {
      title: 'لوحة التحكم',
      welcome: 'مرحباً بك في لوحة تحكم شطابلي',
      stats: {
        revenue: 'إيرادات اليوم',
        orders: 'طلبات اليوم',
        customers: 'إجمالي العملاء',
        avgOrder: 'متوسط الطلب',
      },
      today: 'اليوم',
      vsYesterday: 'مقارنة بالأمس',
      recentOrders: 'أحدث الطلبات',
      viewAll: 'عرض الكل',
      order: 'طلب',
      customer: 'العميل',
      total: 'الإجمالي',
      status: 'الحالة',
      time: 'الوقت',
      statuses: {
        pending: 'قيد الانتظار',
        confirmed: 'تم التأكيد',
        processing: 'جاري التجهيز',
        ready: 'جاهز',
        in_transit: 'في الطريق',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
      },
      quickActions: 'إجراءات سريعة',
      pendingMaterialLists: 'قوائم مواد بانتظار المراجعة',
      lowStockProducts: 'منتجات قاربت على النفاد',
      pendingDeliveries: 'طلبات جاهزة للتوصيل',
      review: 'مراجعة',
      noOrders: 'لا توجد طلبات حديثة',
      loading: 'جاري التحميل...',
      timeAgo: {
        minutes: 'دقيقة',
        hours: 'ساعة',
        days: 'يوم',
      },
    },
    en: {
      title: 'Dashboard',
      welcome: 'Welcome to Shatably Admin',
      stats: {
        revenue: "Today's Revenue",
        orders: "Today's Orders",
        customers: 'Total Customers',
        avgOrder: 'Avg. Order',
      },
      today: 'Today',
      vsYesterday: 'vs yesterday',
      recentOrders: 'Recent Orders',
      viewAll: 'View All',
      order: 'Order',
      customer: 'Customer',
      total: 'Total',
      status: 'Status',
      time: 'Time',
      statuses: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        ready: 'Ready',
        in_transit: 'In Transit',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      },
      quickActions: 'Quick Actions',
      pendingMaterialLists: 'Material lists pending review',
      lowStockProducts: 'Products low in stock',
      pendingDeliveries: 'Orders ready for delivery',
      review: 'Review',
      noOrders: 'No recent orders',
      loading: 'Loading...',
      timeAgo: {
        minutes: 'min',
        hours: 'hr',
        days: 'day',
      },
    },
  };

  const t = content[language];

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${t.timeAgo.minutes}`;
    if (diffHours < 24) return `${diffHours} ${t.timeAgo.hours}`;
    return `${diffDays} ${t.timeAgo.days}`;
  };

  const statColors = {
    revenue: 'bg-green-100 text-green-600',
    orders: 'bg-blue-100 text-blue-600',
    customers: 'bg-purple-100 text-purple-600',
    avgOrder: 'bg-orange-100 text-orange-600',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    ready: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <AdminLayout title={t.title}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="ms-2 text-gray-500">{t.loading}</span>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats;
  const avgOrder = stats && stats.todayOrders > 0 ? Math.round(stats.todayRevenue / stats.todayOrders) : 0;

  const statsData = [
    { id: 'revenue', value: stats?.todayRevenue || 0, icon: DollarSign, color: statColors.revenue },
    { id: 'orders', value: stats?.todayOrders || 0, icon: ShoppingCart, color: statColors.orders },
    { id: 'customers', value: stats?.totalCustomers || 0, icon: Users, color: statColors.customers },
    { id: 'avgOrder', value: avgOrder, icon: TrendingUp, color: statColors.avgOrder },
  ];

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}</title>
      </Head>

      <AdminLayout title={t.title}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.id === 'revenue' || stat.id === 'avgOrder'
                    ? formatPrice(stat.value, language)
                    : stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {t.stats[stat.id as keyof typeof t.stats]}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{t.recentOrders}</h2>
              <Link
                href="/admin/orders"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
              >
                {t.viewAll}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">{t.order}</th>
                      <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">{t.customer}</th>
                      <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">{t.total}</th>
                      <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">{t.status}</th>
                      <th className="text-start px-6 py-3 text-sm font-medium text-gray-500">{t.time}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 font-medium">{formatPrice(order.total, language)}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium',
                            statusColors[order.status] || 'bg-gray-100 text-gray-800'
                          )}>
                            {t.statuses[order.status as keyof typeof t.statuses] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getTimeAgo(order.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  {t.noOrders}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{t.quickActions}</h2>
            <div className="space-y-4">
              {/* Pending Material Lists */}
              <Link
                href="/admin/material-lists"
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stats?.pendingLists || 0}</p>
                    <p className="text-sm text-gray-600">{t.pendingMaterialLists}</p>
                  </div>
                </div>
                <span className="text-yellow-600 text-sm font-medium">{t.review}</span>
              </Link>

              {/* Low Stock */}
              <Link
                href="/admin/products?stock=low_stock"
                className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stats?.lowStockProducts || 0}</p>
                    <p className="text-sm text-gray-600">{t.lowStockProducts}</p>
                  </div>
                </div>
                <span className="text-red-600 text-sm font-medium">{t.review}</span>
              </Link>

              {/* Pending Deliveries */}
              <Link
                href="/admin/delivery"
                className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stats?.todayOrders || 0}</p>
                    <p className="text-sm text-gray-600">{t.pendingDeliveries}</p>
                  </div>
                </div>
                <span className="text-blue-600 text-sm font-medium">{t.review}</span>
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
