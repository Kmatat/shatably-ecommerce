import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore } from '@/lib/store';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, Download } from 'lucide-react';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  topProducts: Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    date: string;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
}

export default function ReportsPage() {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    topProducts: [],
    recentOrders: [],
    salesByCategory: [],
  });

  const t = {
    title: { ar: 'التقارير', en: 'Reports' },
    overview: { ar: 'نظرة عامة', en: 'Overview' },
    totalRevenue: { ar: 'إجمالي الإيرادات', en: 'Total Revenue' },
    totalOrders: { ar: 'إجمالي الطلبات', en: 'Total Orders' },
    totalCustomers: { ar: 'إجمالي العملاء', en: 'Total Customers' },
    totalProducts: { ar: 'إجمالي المنتجات', en: 'Total Products' },
    topProducts: { ar: 'أفضل المنتجات مبيعاً', en: 'Top Selling Products' },
    recentOrders: { ar: 'الطلبات الأخيرة', en: 'Recent Orders' },
    salesByCategory: { ar: 'المبيعات حسب الفئة', en: 'Sales by Category' },
    product: { ar: 'المنتج', en: 'Product' },
    sold: { ar: 'المباع', en: 'Sold' },
    revenue: { ar: 'الإيرادات', en: 'Revenue' },
    order: { ar: 'الطلب', en: 'Order' },
    customer: { ar: 'العميل', en: 'Customer' },
    total: { ar: 'المجموع', en: 'Total' },
    status: { ar: 'الحالة', en: 'Status' },
    date: { ar: 'التاريخ', en: 'Date' },
    category: { ar: 'الفئة', en: 'Category' },
    sales: { ar: 'المبيعات', en: 'Sales' },
    percentage: { ar: 'النسبة', en: 'Percentage' },
    today: { ar: 'اليوم', en: 'Today' },
    week: { ar: 'هذا الأسبوع', en: 'This Week' },
    month: { ar: 'هذا الشهر', en: 'This Month' },
    year: { ar: 'هذه السنة', en: 'This Year' },
    export: { ar: 'تصدير', en: 'Export' },
    currency: { ar: 'ج.م', en: 'EGP' },
    vsLastPeriod: { ar: 'مقارنة بالفترة السابقة', en: 'vs last period' },
    noData: { ar: 'لا توجد بيانات', en: 'No data available' },
    pending: { ar: 'معلق', en: 'Pending' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    processing: { ar: 'قيد التجهيز', en: 'Processing' },
    shipped: { ar: 'تم الشحن', en: 'Shipped' },
    delivered: { ar: 'تم التوصيل', en: 'Delivered' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data.data || reportData);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${t.currency[language]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, { ar: string; en: string }> = {
      pending: t.pending,
      confirmed: t.confirmed,
      processing: t.processing,
      shipped: t.shipped,
      delivered: t.delivered,
      cancelled: t.cancelled,
    };
    return statuses[status]?.[language] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleExport = () => {
    // Export functionality placeholder
    alert(language === 'ar' ? 'جاري التصدير...' : 'Exporting...');
  };

  return (
    <AdminLayout title={t.title[language]}>
      <div className="space-y-6">
        {/* Header with Date Range and Export */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="today">{t.today[language]}</option>
                <option value="week">{t.week[language]}</option>
                <option value="month">{t.month[language]}</option>
                <option value="year">{t.year[language]}</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Download className="w-5 h-5" />
              {t.export[language]}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
                <div className="text-sm text-gray-500">{t.totalRevenue[language]}</div>
                {reportData.revenueChange !== 0 && (
                  <div className={`flex items-center gap-1 text-xs ${reportData.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.revenueChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(reportData.revenueChange)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{reportData.totalOrders}</div>
                <div className="text-sm text-gray-500">{t.totalOrders[language]}</div>
                {reportData.ordersChange !== 0 && (
                  <div className={`flex items-center gap-1 text-xs ${reportData.ordersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.ordersChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(reportData.ordersChange)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{reportData.totalCustomers}</div>
                <div className="text-sm text-gray-500">{t.totalCustomers[language]}</div>
                {reportData.customersChange !== 0 && (
                  <div className={`flex items-center gap-1 text-xs ${reportData.customersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.customersChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(reportData.customersChange)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{reportData.totalProducts}</div>
                <div className="text-sm text-gray-500">{t.totalProducts[language]}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                {t.topProducts[language]}
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : reportData.topProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">{t.noData[language]}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.product[language]}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.sold[language]}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.revenue[language]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reportData.topProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{product.sold}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sales by Category */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                {t.salesByCategory[language]}
              </h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : reportData.salesByCategory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">{t.noData[language]}</div>
            ) : (
              <div className="p-4 space-y-4">
                {reportData.salesByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(item.sales)} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary-500" />
              {t.recentOrders[language]}
            </h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : reportData.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noData[language]}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.order[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.customer[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.total[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.status[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.date[language]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#{order.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(order.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
