import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { FolderTree, Plus, Edit2, Trash2, X, Save, ChevronRight, Package, Eye, EyeOff, GripVertical } from 'lucide-react';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  parent: { id: string; nameAr: string; nameEn: string } | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  childrenCount: number;
  createdAt: string;
}

export default function CategoriesPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    icon: '',
    image: '',
    parentId: '',
    sortOrder: 0,
  });

  const t = {
    title: { ar: 'إدارة الفئات', en: 'Categories Management' },
    addCategory: { ar: 'إضافة فئة', en: 'Add Category' },
    editCategory: { ar: 'تعديل الفئة', en: 'Edit Category' },
    category: { ar: 'الفئة', en: 'Category' },
    nameAr: { ar: 'الاسم (عربي)', en: 'Name (Arabic)' },
    nameEn: { ar: 'الاسم (إنجليزي)', en: 'Name (English)' },
    icon: { ar: 'الأيقونة', en: 'Icon' },
    image: { ar: 'الصورة', en: 'Image' },
    parent: { ar: 'الفئة الرئيسية', en: 'Parent Category' },
    noParent: { ar: 'بدون فئة رئيسية', en: 'No Parent' },
    sortOrder: { ar: 'الترتيب', en: 'Sort Order' },
    products: { ar: 'المنتجات', en: 'Products' },
    subcategories: { ar: 'الفئات الفرعية', en: 'Subcategories' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    delete: { ar: 'حذف', en: 'Delete' },
    noCategories: { ar: 'لا توجد فئات', en: 'No categories found' },
    confirmDelete: { ar: 'هل أنت متأكد من الحذف؟', en: 'Are you sure you want to delete?' },
    mainCategories: { ar: 'الفئات الرئيسية', en: 'Main Categories' },
    allCategories: { ar: 'جميع الفئات', en: 'All Categories' },
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        icon: category.icon || '',
        image: category.image || '',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        nameAr: '',
        nameEn: '',
        icon: '',
        image: '',
        parentId: '',
        sortOrder: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
          icon: formData.icon || null,
          image: formData.image || null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete[language])) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const mainCategories = categories.filter((c) => !c.parentId);
  const getSubcategories = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  return (
    <AdminLayout title={t.title[language]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold">{t.allCategories[language]}</h2>
              <p className="text-sm text-gray-500">{categories.length} {t.category[language]}</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="w-5 h-5" />
            {t.addCategory[language]}
          </button>
        </div>

        {/* Categories Tree */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noCategories[language]}</div>
          ) : (
            <div className="divide-y">
              {mainCategories.map((category) => {
                const subcategories = getSubcategories(category.id);
                return (
                  <div key={category.id}>
                    {/* Main Category */}
                    <div className="p-4 hover:bg-gray-50 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <GripVertical className="w-4 h-4" />
                        {subcategories.length > 0 && <ChevronRight className="w-4 h-4" />}
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {category.image ? (
                          <img src={category.image} alt="" className="w-full h-full object-cover" />
                        ) : category.icon ? (
                          <span className="text-2xl">{category.icon}</span>
                        ) : (
                          <FolderTree className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{language === 'ar' ? category.nameAr : category.nameEn}</div>
                        <div className="text-sm text-gray-500">{category.slug}</div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>{category.productCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FolderTree className="w-4 h-4" />
                          <span>{category.childrenCount}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {category.isActive ? t.active[language] : t.inactive[language]}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                      <div className="bg-gray-50 border-t">
                        {subcategories.map((sub) => (
                          <div key={sub.id} className="p-4 ps-16 hover:bg-gray-100 flex items-center gap-4 border-b last:border-b-0">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
                              {sub.image ? (
                                <img src={sub.image} alt="" className="w-full h-full object-cover" />
                              ) : sub.icon ? (
                                <span className="text-xl">{sub.icon}</span>
                              ) : (
                                <FolderTree className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{language === 'ar' ? sub.nameAr : sub.nameEn}</div>
                              <div className="text-xs text-gray-500">{sub.slug}</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span>{sub.productCount}</span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {sub.isActive ? t.active[language] : t.inactive[language]}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenModal(sub)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingCategory ? t.editCategory[language] : t.addCategory[language]}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameAr[language]}</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    dir="rtl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameEn[language]}</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.parent[language]}</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">{t.noParent[language]}</option>
                  {mainCategories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.icon[language]}</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. 🏠"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sortOrder[language]}</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.image[language]}</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://..."
                />
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
