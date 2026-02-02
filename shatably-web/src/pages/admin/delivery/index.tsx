import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { Truck, Plus, Search, Phone, MapPin, Package, Edit, Trash2, X, Check, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  isActive: boolean;
  isAvailable: boolean;
  activeOrders: number;
  completedOrders: number;
  ordersCount: number;
  createdAt: string;
}

export default function DeliveryPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: '',
    plateNumber: '',
  });
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const t = {
    title: { ar: 'إدارة التوصيل', en: 'Delivery Management' },
    drivers: { ar: 'السائقين', en: 'Drivers' },
    addDriver: { ar: 'إضافة سائق', en: 'Add Driver' },
    editDriver: { ar: 'تعديل سائق', en: 'Edit Driver' },
    search: { ar: 'بحث بالاسم أو رقم الهاتف...', en: 'Search by name or phone...' },
    name: { ar: 'الاسم', en: 'Name' },
    phone: { ar: 'الهاتف', en: 'Phone' },
    vehicle: { ar: 'المركبة', en: 'Vehicle' },
    plateNumber: { ar: 'رقم اللوحة', en: 'Plate Number' },
    status: { ar: 'الحالة', en: 'Status' },
    activeOrders: { ar: 'طلبات نشطة', en: 'Active Orders' },
    completedOrders: { ar: 'طلبات مكتملة', en: 'Completed' },
    available: { ar: 'متاح', en: 'Available' },
    busy: { ar: 'مشغول', en: 'Busy' },
    actions: { ar: 'إجراءات', en: 'Actions' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    delete: { ar: 'حذف', en: 'Delete' },
    noDrivers: { ar: 'لا يوجد سائقين', en: 'No drivers found' },
    confirmDelete: { ar: 'هل تريد حذف هذا السائق؟', en: 'Delete this driver?' },
    toggleStatus: { ar: 'تغيير الحالة', en: 'Toggle Status' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    stats: {
      totalDrivers: { ar: 'إجمالي السائقين', en: 'Total Drivers' },
      availableNow: { ar: 'متاحين الآن', en: 'Available Now' },
      activeDeliveries: { ar: 'توصيلات نشطة', en: 'Active Deliveries' },
      todayCompleted: { ar: 'مكتمل اليوم', en: 'Completed Today' },
    },
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/drivers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDriver
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/drivers/${editingDriver.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/drivers`;
      const method = editingDriver ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchDrivers();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save driver:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete[language])) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchDrivers();
    } catch (error) {
      console.error('Failed to delete driver:', error);
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    setTogglingStatus(driver.id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/drivers/${driver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !driver.isActive }),
      });
      if (response.ok) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driver.id ? { ...d, isActive: !driver.isActive } : d))
        );
      }
    } catch (error) {
      console.error('Failed to toggle driver status:', error);
    } finally {
      setTogglingStatus(null);
    }
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicle,
      plateNumber: driver.plateNumber,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingDriver(null);
    setFormData({ name: '', phone: '', vehicle: '', plateNumber: '' });
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone.includes(searchQuery)
  );

  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.isAvailable).length,
    activeDeliveries: drivers.reduce((sum, d) => sum + d.activeOrders, 0),
    completed: drivers.reduce((sum, d) => sum + d.completedOrders, 0),
  };

  return (
    <AdminLayout title={t.title[language]}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-500">{t.stats.totalDrivers[language]}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.available}</div>
                <div className="text-sm text-gray-500">{t.stats.availableNow[language]}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
                <div className="text-sm text-gray-500">{t.stats.activeDeliveries[language]}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm text-gray-500">{t.stats.todayCompleted[language]}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
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
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-5 h-5" />
              {t.addDriver[language]}
            </button>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredDrivers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noDrivers[language]}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.name[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.phone[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.vehicle[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.status[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.activeOrders[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.completedOrders[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.actions[language]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{driver.name}</td>
                      <td className="px-4 py-3 text-gray-600">{driver.phone}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{driver.vehicle}</div>
                        <div className="text-sm text-gray-400">{driver.plateNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                            driver.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {driver.isActive ? t.active[language] : t.inactive[language]}
                          </span>
                          {driver.isActive && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                              driver.isAvailable
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {driver.isAvailable ? t.available[language] : t.busy[language]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{driver.activeOrders}</td>
                      <td className="px-4 py-3 text-gray-600">{driver.completedOrders}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(driver)}
                            disabled={togglingStatus === driver.id}
                            className={`p-2 rounded-lg ${
                              driver.isActive
                                ? 'hover:bg-red-50 text-red-600'
                                : 'hover:bg-green-50 text-green-600'
                            }`}
                            title={t.toggleStatus[language]}
                          >
                            {togglingStatus === driver.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : driver.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(driver)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(driver.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingDriver ? t.editDriver[language] : t.addDriver[language]}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name[language]}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone[language]}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.vehicle[language]}</label>
                  <input
                    type="text"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.plateNumber[language]}</label>
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {t.cancel[language]}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    {t.save[language]}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
