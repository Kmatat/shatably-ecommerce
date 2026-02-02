import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  MoreVertical,
  Loader2,
  User,
  X,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { formatPrice, formatDate, cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; phone: string };
  total: number;
  itemsCount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryType: string;
  driverId: string | null;
  driver: { id: string; name: string; phone: string } | null;
  createdAt: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'processing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';

export default function AdminOrdersPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [assigning, setAssigning] = useState(false);

  const content = {
    ar: {
      title: 'إدارة الطلبات',
      search: 'بحث برقم الطلب أو رقم العميل...',
      filter: 'تصفية',
      export: 'تصدير',
      allStatuses: 'جميع الحالات',
      orderNumber: 'رقم الطلب',
      customer: 'العميل',
      total: 'الإجمالي',
      items: 'المنتجات',
      status: 'الحالة',
      payment: 'الدفع',
      delivery: 'التوصيل',
      date: 'التاريخ',
      actions: 'إجراءات',
      viewDetails: 'عرض التفاصيل',
      updateStatus: 'تحديث الحالة',
      printInvoice: 'طباعة الفاتورة',
      statuses: {
        pending: 'قيد الانتظار',
        confirmed: 'تم التأكيد',
        processing: 'جاري التجهيز',
        ready: 'جاهز',
        in_transit: 'في الطريق',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
      },
      paymentMethods: {
        cod: 'عند الاستلام',
        card: 'بطاقة',
        fawry: 'فوري',
        wallet: 'محفظة',
      },
      deliveryTypes: {
        express: 'سريع',
        scheduled: 'مجدول',
      },
      noOrders: 'لا توجد طلبات',
      selected: 'محدد',
      loading: 'جاري التحميل...',
      of: 'من',
      orders: 'طلب',
      driver: 'السائق',
      assignDriver: 'تعيين سائق',
      noDriver: 'بدون سائق',
      selectDriver: 'اختر سائق',
      assign: 'تعيين',
      cancel: 'إلغاء',
    },
    en: {
      title: 'Orders Management',
      search: 'Search by order number or customer phone...',
      filter: 'Filter',
      export: 'Export',
      allStatuses: 'All Statuses',
      orderNumber: 'Order #',
      customer: 'Customer',
      total: 'Total',
      items: 'Items',
      status: 'Status',
      payment: 'Payment',
      delivery: 'Delivery',
      date: 'Date',
      actions: 'Actions',
      viewDetails: 'View Details',
      updateStatus: 'Update Status',
      printInvoice: 'Print Invoice',
      statuses: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        ready: 'Ready',
        in_transit: 'In Transit',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      },
      paymentMethods: {
        cod: 'COD',
        card: 'Card',
        fawry: 'Fawry',
        wallet: 'Wallet',
      },
      deliveryTypes: {
        express: 'Express',
        scheduled: 'Scheduled',
      },
      noOrders: 'No orders found',
      selected: 'selected',
      loading: 'Loading...',
      of: 'of',
      orders: 'orders',
      driver: 'Driver',
      assignDriver: 'Assign Driver',
      noDriver: 'No Driver',
      selectDriver: 'Select Driver',
      assign: 'Assign',
      cancel: 'Cancel',
    },
  };

  const t = content[language];

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [page, searchQuery, statusFilter]);

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDrivers((data.data || []).filter((d: Driver) => d.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    if (!assigningOrder) return;
    setAssigning(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${assigningOrder.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverId }),
        }
      );
      if (response.ok) {
        fetchOrders();
        setAssigningOrder(null);
      }
    } catch (error) {
      console.error('Failed to assign driver:', error);
    } finally {
      setAssigning(false);
    }
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

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}</title>
      </Head>

      <AdminLayout title={t.title}>
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder={t.search}
                className="w-full ps-10 pe-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as OrderStatus); setPage(1); }}
                className="appearance-none px-4 py-2.5 pe-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t.allStatuses}</option>
                {Object.entries(t.statuses).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Export */}
            <button className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50">
              <Download className="w-5 h-5" />
              {t.export}
            </button>
          </div>

          {/* Bulk actions */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedOrders.length} {t.selected}
              </span>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {t.updateStatus}
              </button>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {t.printInvoice}
              </button>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
              <p className="mt-2 text-gray-500">{t.loading}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        />
                      </th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.orderNumber}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.customer}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.total}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.items}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.status}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.payment}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.delivery}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.driver}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.date}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          {t.noOrders}
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => toggleSelectOrder(order.id)}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-medium text-primary-600 hover:text-primary-700"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.customer.name || '-'}</p>
                              <p className="text-sm text-gray-500">{order.customer.phone}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium">
                            {formatPrice(order.total, language)}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {order.itemsCount}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={cn(
                                'px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer',
                                statusColors[order.status] || 'bg-gray-100 text-gray-800'
                              )}
                            >
                              {Object.entries(t.statuses).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {t.paymentMethods[order.paymentMethod as keyof typeof t.paymentMethods] || order.paymentMethod}
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              order.deliveryType === 'express' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                            )}>
                              {t.deliveryTypes[order.deliveryType as keyof typeof t.deliveryTypes] || order.deliveryType}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {order.driver ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Truck className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{order.driver.name}</p>
                                  <p className="text-xs text-gray-500">{order.driver.phone}</p>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAssigningOrder(order)}
                                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                              >
                                <User className="w-4 h-4" />
                                {t.assignDriver}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(order.createdAt, language)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="relative group">
                              <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                              <div className="absolute top-full end-0 mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <div className="py-1">
                                  <Link
                                    href={`/admin/orders/${order.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                  >
                                    <Eye className="w-4 h-4" />
                                    {t.viewDetails}
                                  </Link>
                                  <button
                                    onClick={() => setAssigningOrder(order)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full"
                                  >
                                    <Truck className="w-4 h-4" />
                                    {t.assignDriver}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {total} {t.orders}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    <span className="text-sm text-gray-600">
                      {page} {t.of} {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>

      {/* Driver Assignment Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t.assignDriver}</h3>
              <button
                onClick={() => setAssigningOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{t.orderNumber}: <span className="font-medium">{assigningOrder.orderNumber}</span></p>
              <p className="text-sm text-gray-600">{t.customer}: <span className="font-medium">{assigningOrder.customer.name || assigningOrder.customer.phone}</span></p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {drivers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t.noOrders}</p>
              ) : (
                drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleAssignDriver(driver.id)}
                    disabled={assigning}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors',
                      assigningOrder.driverId === driver.id && 'border-primary-500 bg-primary-50'
                    )}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-start flex-1">
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-gray-500">{driver.phone}</p>
                    </div>
                    {assigning && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    )}
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setAssigningOrder(null)}
              className="mt-4 w-full py-2 border rounded-lg hover:bg-gray-50"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
