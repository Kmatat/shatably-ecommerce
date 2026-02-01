import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { Users, Shield, UserCog, Crown, Plus, Edit2, Trash2, X, Save, Check, UserCheck, UserX } from 'lucide-react';

interface AdminUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const allPermissions = [
  { key: 'manage_products', icon: '📦' },
  { key: 'manage_categories', icon: '📁' },
  { key: 'manage_orders', icon: '🛒' },
  { key: 'manage_customers', icon: '👥' },
  { key: 'manage_content', icon: '📝' },
  { key: 'manage_drivers', icon: '🚚' },
  { key: 'manage_promos', icon: '🎟️' },
  { key: 'manage_settings', icon: '⚙️' },
  { key: 'manage_admins', icon: '👑' },
  { key: 'view_reports', icon: '📊' },
];

const roles = [
  { value: 'super_admin', icon: Crown, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'admin', icon: Shield, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'employee', icon: UserCog, color: 'bg-green-100 text-green-700 border-green-200' },
];

export default function AdminUsersPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    role: 'employee',
    permissions: [] as string[],
    isActive: true,
  });

  const t = {
    title: { ar: 'إدارة المستخدمين', en: 'Admin Users Management' },
    addUser: { ar: 'إضافة مستخدم', en: 'Add User' },
    editUser: { ar: 'تعديل المستخدم', en: 'Edit User' },
    all: { ar: 'الكل', en: 'All' },
    super_admin: { ar: 'مدير عام', en: 'Super Admin' },
    admin: { ar: 'مدير', en: 'Admin' },
    employee: { ar: 'موظف', en: 'Employee' },
    phone: { ar: 'رقم الهاتف', en: 'Phone' },
    name: { ar: 'الاسم', en: 'Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    role: { ar: 'الدور', en: 'Role' },
    permissions: { ar: 'الصلاحيات', en: 'Permissions' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    delete: { ar: 'حذف', en: 'Delete' },
    noUsers: { ar: 'لا يوجد مستخدمين', en: 'No users found' },
    confirmDelete: { ar: 'هل أنت متأكد من الحذف؟', en: 'Are you sure you want to delete?' },
    selectAll: { ar: 'تحديد الكل', en: 'Select All' },
    deselectAll: { ar: 'إلغاء التحديد', en: 'Deselect All' },
    manage_products: { ar: 'إدارة المنتجات', en: 'Manage Products' },
    manage_categories: { ar: 'إدارة الفئات', en: 'Manage Categories' },
    manage_orders: { ar: 'إدارة الطلبات', en: 'Manage Orders' },
    manage_customers: { ar: 'إدارة العملاء', en: 'Manage Customers' },
    manage_content: { ar: 'إدارة المحتوى', en: 'Manage Content' },
    manage_drivers: { ar: 'إدارة السائقين', en: 'Manage Drivers' },
    manage_promos: { ar: 'إدارة العروض', en: 'Manage Promos' },
    manage_settings: { ar: 'إدارة الإعدادات', en: 'Manage Settings' },
    manage_admins: { ar: 'إدارة المديرين', en: 'Manage Admins' },
    view_reports: { ar: 'عرض التقارير', en: 'View Reports' },
    superAdminNote: { ar: 'المدير العام لديه جميع الصلاحيات', en: 'Super Admin has all permissions' },
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?role=${selectedRole}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        phone: user.phone,
        name: user.name || '',
        email: user.email || '',
        role: user.role,
        permissions: user.permissions || [],
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        phone: '',
        name: '',
        email: '',
        role: 'employee',
        permissions: [],
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editingUser.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/users`;

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || undefined,
          permissions: formData.role === 'super_admin' ? allPermissions.map((p) => p.key) : formData.permissions,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete[language])) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const selectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: allPermissions.map((p) => p.key),
    }));
  };

  const deselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const getRoleInfo = (role: string) => {
    return roles.find((r) => r.value === role) || roles[2];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <AdminLayout title={t.title[language]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRole('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedRole === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {t.all[language]}
              </button>
              {roles.map((role) => {
                const RoleIcon = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedRole === role.value ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <RoleIcon className="w-4 h-4" />
                    {t[role.value as keyof typeof t][language]}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-5 h-5" />
              {t.addUser[language]}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {roles.map((role) => {
            const RoleIcon = role.icon;
            const count = users.filter((u) => u.role === role.value).length;
            return (
              <div key={role.value} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color}`}>
                    <RoleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-500">{t[role.value as keyof typeof t][language]}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noUsers[language]}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.name[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.phone[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.role[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.permissions[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.active[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const RoleIcon = roleInfo.icon;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{user.name || '-'}</div>
                          {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.phone}</td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg border ${roleInfo.color}`}>
                            <RoleIcon className="w-4 h-4" />
                            <span className="text-sm">{t[user.role as keyof typeof t]?.[language] || user.role}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {user.role === 'super_admin' ? (
                            <span className="text-sm text-yellow-600">{t.superAdminNote[language]}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {user.permissions?.slice(0, 3).map((perm) => (
                                <span key={perm} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                  {allPermissions.find((p) => p.key === perm)?.icon}
                                </span>
                              ))}
                              {(user.permissions?.length || 0) > 3 && (
                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                  +{(user.permissions?.length || 0) - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {user.isActive ? t.active[language] : t.inactive[language]}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {user.role !== 'super_admin' && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-lg">
                {editingUser ? t.editUser[language] : t.addUser[language]}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone[language]}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="01xxxxxxxxx"
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name[language]}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email[language]}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.role[language]}</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((role) => {
                    const RoleIcon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                          formData.role === role.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <RoleIcon className={`w-6 h-6 ${formData.role === role.value ? 'text-primary-500' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{t[role.value as keyof typeof t][language]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.role !== 'super_admin' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">{t.permissions[language]}</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        {t.selectAll[language]}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={deselectAllPermissions}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        {t.deselectAll[language]}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {allPermissions.map((perm) => (
                      <button
                        key={perm.key}
                        type="button"
                        onClick={() => togglePermission(perm.key)}
                        className={`p-2 rounded-lg border flex items-center gap-2 text-sm transition-colors ${
                          formData.permissions.includes(perm.key)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span>{perm.icon}</span>
                        <span className="flex-1 text-start">{t[perm.key as keyof typeof t]?.[language] || perm.key}</span>
                        {formData.permissions.includes(perm.key) && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.role === 'super_admin' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  {t.superAdminNote[language]}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">{t.active[language]}</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t.cancel[language]}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {t.save[language]}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
