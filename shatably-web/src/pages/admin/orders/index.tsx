import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  MoreVertical,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore } from '@/lib/store';
import { formatPrice, formatDate, cn } from '@/lib/utils';

// Mock orders data
const mockOrders = [
  {
    id: 'SH-XYZ789',
    customer: { name: 'محمد أحمد', phone: '01012345678' },
    total: 4500,
    itemsCount: 5,
    status: 'pending',
    paymentMethod: 'cod',
    deliveryType: 'scheduled',
    createdAt: '2024-01-25T10:30:00',
  },
  {
    id: 'SH-ABC123',
    customer: { name: 'أحمد علي', phone: '01098765432' },
    total: 12300,
    itemsCount: 12,
    status: 'processing',
    paymentMethod: 'card',
    deliveryType: 'express',
    createdAt: '2024-01-25T09:15:00',
  },
  {
    id: 'SH-DEF456',
    customer: { name: 'سارة محمود', phone: '01112223334' },
    total: 8750,
    itemsCount: 8,
    status: 'in_transit',
    paymentMethod: 'fawry',
    deliveryType: 'scheduled',
    createdAt: '2024-01-24T16:45:00',
  },
  {
    id: 'SH-GHI012',
    customer: { name: 'عمر حسن', phone: '01556667778' },
    total: 3200,
    itemsCount: 3,
    status: 'delivered',
    paymentMethod: 'cod',
    deliveryType: 'scheduled',
    createdAt: '2024-01-24T14:20:00',
  },
  {
    id: 'SH-JKL345',
    customer: { name: 'فاطمة علي', phone: '01223334445' },
    total: 6800,
    itemsCount: 6,
    status: 'cancelled',
    paymentMethod: 'wallet',
    deliveryType: 'express',
    createdAt: '2024-01-24T11:00:00',
  },
];

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'processing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';

export default function AdminOrdersPage() {
  const { language } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const content = {
    ar: {
      title: 'إدارة الطلبات',
      search: 'بحث برقم الطلب أو اسم العميل...',
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
    },
    en: {
      title: 'Orders Management',
      search: 'Search by order number or customer name...',
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
    },
  };

  const t = content[language];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    ready: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full ps-10 pe-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
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
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.date}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      {t.noOrders}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
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
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer.name}</p>
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
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          statusColors[order.status]
                        )}>
                          {t.statuses[order.status as keyof typeof t.statuses]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {t.paymentMethods[order.paymentMethod as keyof typeof t.paymentMethods]}
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          order.deliveryType === 'express' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        )}>
                          {t.deliveryTypes[order.deliveryType as keyof typeof t.deliveryTypes]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(order.createdAt, language)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          <div className="absolute top-full end-0 mt-1 w-40 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                                {t.viewDetails}
                              </Link>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                <Package className="w-4 h-4" />
                                {t.updateStatus}
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
        </div>
      </AdminLayout>
    </>
  );
}
