import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import {
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  ShoppingBag,
  Calendar,
  UserX,
  UserCheck,
  ExternalLink,
  MoreVertical,
  Loader2,
} from 'lucide-react';

interface Customer {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  type: string;
  isActive: boolean;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt: string | null;
}

export default function CustomersPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const t = {
    title: { ar: 'العملاء', en: 'Customers' },
    search: { ar: 'بحث بالاسم أو رقم الهاتف...', en: 'Search by name or phone...' },
    allTypes: { ar: 'جميع الأنواع', en: 'All Types' },
    allStatus: { ar: 'جميع الحالات', en: 'All Status' },
    active: { ar: 'نشط', en: 'Active' },
    suspended: { ar: 'معلق', en: 'Suspended' },
    homeowner: { ar: 'صاحب منزل', en: 'Homeowner' },
    contractor: { ar: 'مقاول', en: 'Contractor' },
    designer: { ar: 'مصمم داخلي', en: 'Designer' },
    worker: { ar: 'عامل', en: 'Worker' },
    name: { ar: 'الاسم', en: 'Name' },
    phone: { ar: 'الهاتف', en: 'Phone' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    type: { ar: 'النوع', en: 'Type' },
    status: { ar: 'الحالة', en: 'Status' },
    orders: { ar: 'الطلبات', en: 'Orders' },
    totalSpent: { ar: 'إجمالي المشتريات', en: 'Total Spent' },
    joined: { ar: 'تاريخ الانضمام', en: 'Joined' },
    lastOrder: { ar: 'آخر طلب', en: 'Last Order' },
    viewDetails: { ar: 'عرض التفاصيل', en: 'View Details' },
    viewOrders: { ar: 'عرض الطلبات', en: 'View Orders' },
    suspend: { ar: 'تعليق الحساب', en: 'Suspend Account' },
    activate: { ar: 'تفعيل الحساب', en: 'Activate Account' },
    noCustomers: { ar: 'لا يوجد عملاء', en: 'No customers found' },
    customerDetails: { ar: 'تفاصيل العميل', en: 'Customer Details' },
    close: { ar: 'إغلاق', en: 'Close' },
    currency: { ar: 'ج.م', en: 'EGP' },
    actions: { ar: 'إجراءات', en: 'Actions' },
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    setUpdating(customerId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/customers/${customerId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );
      if (response.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? { ...c, isActive: !currentStatus } : c))
        );
      }
    } catch (error) {
      console.error('Failed to update customer status:', error);
    } finally {
      setUpdating(null);
      setActionMenuId(null);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === '' ||
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesType = filterType === 'all' || customer.type === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && customer.isActive) ||
      (filterStatus === 'suspended' && !customer.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${t.currency[language]}`;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, { ar: string; en: string }> = {
      homeowner: t.homeowner,
      contractor: t.contractor,
      designer: t.designer,
      worker: t.worker,
    };
    return types[type]?.[language] || type;
  };

  return (
    <AdminLayout title={t.title[language]}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.search[language]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t.allTypes[language]}</option>
                <option value="homeowner">{t.homeowner[language]}</option>
                <option value="contractor">{t.contractor[language]}</option>
                <option value="designer">{t.designer[language]}</option>
                <option value="worker">{t.worker[language]}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t.allStatus[language]}</option>
                <option value="active">{t.active[language]}</option>
                <option value="suspended">{t.suspended[language]}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noCustomers[language]}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.name[language]}
                    </th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.phone[language]}
                    </th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.type[language]}
                    </th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.status[language]}
                    </th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.orders[language]}
                    </th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.totalSpent[language]}
                    </th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.joined[language]}
                    </th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">
                      {t.actions[language]}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{customer.name || '-'}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {getTypeLabel(customer.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            customer.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {customer.isActive ? t.active[language] : t.suspended[language]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{customer.ordersCount}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(customer.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActionMenuId(actionMenuId === customer.id ? null : customer.id)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {actionMenuId === customer.id && (
                            <div className="absolute end-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                              <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                                {t.viewDetails[language]}
                              </button>
                              <Link
                                href={`/admin/orders?customerId=${customer.id}`}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {t.viewOrders[language]}
                              </Link>
                              <button
                                onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                                disabled={updating === customer.id}
                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 ${
                                  customer.isActive ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {updating === customer.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : customer.isActive ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                                {customer.isActive ? t.suspend[language] : t.activate[language]}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSelectedCustomer(null)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-lg mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">{t.customerDetails[language]}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedCustomer.isActive ? 'bg-primary-100' : 'bg-red-100'
                    }`}
                  >
                    <span
                      className={`font-bold text-lg ${
                        selectedCustomer.isActive ? 'text-primary-600' : 'text-red-600'
                      }`}
                    >
                      {selectedCustomer.name?.[0] || selectedCustomer.phone[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{selectedCustomer.name || '-'}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      {getTypeLabel(selectedCustomer.type)}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          selectedCustomer.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedCustomer.isActive ? t.active[language] : t.suspended[language]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {selectedCustomer.ordersCount} {t.orders[language]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-500">{t.totalSpent[language]}</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/admin/orders?customerId=${selectedCustomer.id}`}
                  className="flex-1 py-2 bg-primary-500 text-white text-center rounded-lg hover:bg-primary-600"
                >
                  {t.viewOrders[language]}
                </Link>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {t.close[language]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close menu on outside click */}
      {actionMenuId && (
        <div className="fixed inset-0 z-0" onClick={() => setActionMenuId(null)} />
      )}
    </AdminLayout>
  );
}
