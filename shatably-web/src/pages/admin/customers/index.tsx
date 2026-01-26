import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore } from '@/lib/store';
import { Search, Filter, Eye, Phone, Mail, MapPin, ShoppingBag, Calendar } from 'lucide-react';

interface Customer {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  type: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt: string | null;
}

export default function CustomersPage() {
  const { language } = useLanguageStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const t = {
    title: { ar: 'العملاء', en: 'Customers' },
    search: { ar: 'بحث بالاسم أو رقم الهاتف...', en: 'Search by name or phone...' },
    allTypes: { ar: 'جميع الأنواع', en: 'All Types' },
    homeowner: { ar: 'صاحب منزل', en: 'Homeowner' },
    contractor: { ar: 'مقاول', en: 'Contractor' },
    designer: { ar: 'مصمم داخلي', en: 'Designer' },
    name: { ar: 'الاسم', en: 'Name' },
    phone: { ar: 'الهاتف', en: 'Phone' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    type: { ar: 'النوع', en: 'Type' },
    orders: { ar: 'الطلبات', en: 'Orders' },
    totalSpent: { ar: 'إجمالي المشتريات', en: 'Total Spent' },
    joined: { ar: 'تاريخ الانضمام', en: 'Joined' },
    lastOrder: { ar: 'آخر طلب', en: 'Last Order' },
    viewDetails: { ar: 'عرض التفاصيل', en: 'View Details' },
    noCustomers: { ar: 'لا يوجد عملاء', en: 'No customers found' },
    customerDetails: { ar: 'تفاصيل العميل', en: 'Customer Details' },
    close: { ar: 'إغلاق', en: 'Close' },
    currency: { ar: 'ج.م', en: 'EGP' },
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
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

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' ||
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesType = filterType === 'all' || customer.type === filterType;
    return matchesSearch && matchesType;
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
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noCustomers[language]}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.name[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.phone[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.type[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.orders[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.totalSpent[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.joined[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600"></th>
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
                      <td className="px-4 py-3 text-gray-600">{customer.ordersCount}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(customer.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title={t.viewDetails[language]}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">{t.customerDetails[language]}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {selectedCustomer.name?.[0] || selectedCustomer.phone[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{selectedCustomer.name || t.noCustomers[language]}</div>
                    <div className="text-sm text-gray-500">{getTypeLabel(selectedCustomer.type)}</div>
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
                    <span>{selectedCustomer.ordersCount} {t.orders[language]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-500">{t.totalSpent[language]}</div>
                  <div className="text-2xl font-bold text-primary-600">{formatCurrency(selectedCustomer.totalSpent)}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="mt-6 w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {t.close[language]}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
