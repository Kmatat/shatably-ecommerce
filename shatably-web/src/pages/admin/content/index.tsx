import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { FileText, Image, Megaphone, HelpCircle, Info, FileCheck, Shield, Plus, Edit2, Trash2, X, Save, Eye, EyeOff, Truck, RotateCcw, Phone } from 'lucide-react';

interface Content {
  id: string;
  type: string;
  key: string;
  titleAr: string | null;
  titleEn: string | null;
  contentAr: string | null;
  contentEn: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

const contentTypes = [
  { value: 'banner', icon: Image, color: 'bg-blue-100 text-blue-600' },
  { value: 'page', icon: FileText, color: 'bg-green-100 text-green-600' },
  { value: 'announcement', icon: Megaphone, color: 'bg-yellow-100 text-yellow-600' },
  { value: 'faq', icon: HelpCircle, color: 'bg-purple-100 text-purple-600' },
  { value: 'about', icon: Info, color: 'bg-cyan-100 text-cyan-600' },
  { value: 'terms', icon: FileCheck, color: 'bg-orange-100 text-orange-600' },
  { value: 'privacy', icon: Shield, color: 'bg-red-100 text-red-600' },
  { value: 'shipping', icon: Truck, color: 'bg-indigo-100 text-indigo-600' },
  { value: 'returns', icon: RotateCcw, color: 'bg-pink-100 text-pink-600' },
  { value: 'contact', icon: Phone, color: 'bg-teal-100 text-teal-600' },
];

export default function ContentManagementPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({
    type: 'banner',
    key: '',
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const t = {
    title: { ar: 'إدارة المحتوى', en: 'Content Management' },
    addContent: { ar: 'إضافة محتوى', en: 'Add Content' },
    editContent: { ar: 'تعديل المحتوى', en: 'Edit Content' },
    all: { ar: 'الكل', en: 'All' },
    banner: { ar: 'بانر', en: 'Banner' },
    page: { ar: 'صفحة', en: 'Page' },
    announcement: { ar: 'إعلان', en: 'Announcement' },
    faq: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
    about: { ar: 'من نحن', en: 'About' },
    terms: { ar: 'الشروط والأحكام', en: 'Terms' },
    privacy: { ar: 'سياسة الخصوصية', en: 'Privacy' },
    shipping: { ar: 'الشحن والتوصيل', en: 'Shipping' },
    returns: { ar: 'الإرجاع', en: 'Returns' },
    contact: { ar: 'التواصل', en: 'Contact' },
    type: { ar: 'النوع', en: 'Type' },
    key: { ar: 'المفتاح', en: 'Key' },
    titleAr: { ar: 'العنوان (عربي)', en: 'Title (Arabic)' },
    titleEn: { ar: 'العنوان (إنجليزي)', en: 'Title (English)' },
    contentAr: { ar: 'المحتوى (عربي)', en: 'Content (Arabic)' },
    contentEn: { ar: 'المحتوى (إنجليزي)', en: 'Content (English)' },
    imageUrl: { ar: 'رابط الصورة', en: 'Image URL' },
    linkUrl: { ar: 'رابط الانتقال', en: 'Link URL' },
    sortOrder: { ar: 'الترتيب', en: 'Sort Order' },
    startDate: { ar: 'تاريخ البداية', en: 'Start Date' },
    endDate: { ar: 'تاريخ النهاية', en: 'End Date' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    save: { ar: 'حفظ', en: 'Save' },
    cancel: { ar: 'إلغاء', en: 'Cancel' },
    delete: { ar: 'حذف', en: 'Delete' },
    noContent: { ar: 'لا يوجد محتوى', en: 'No content found' },
    confirmDelete: { ar: 'هل أنت متأكد من الحذف؟', en: 'Are you sure you want to delete?' },
  };

  const typeLabels: Record<string, { ar: string; en: string }> = {
    banner: t.banner,
    page: t.page,
    announcement: t.announcement,
    faq: t.faq,
    about: t.about,
    terms: t.terms,
    privacy: t.privacy,
    shipping: t.shipping,
    returns: t.returns,
    contact: t.contact,
  };

  useEffect(() => {
    fetchContents();
  }, [selectedType]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/content?type=${selectedType}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setContents(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (content?: Content) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        type: content.type,
        key: content.key,
        titleAr: content.titleAr || '',
        titleEn: content.titleEn || '',
        contentAr: content.contentAr || '',
        contentEn: content.contentEn || '',
        imageUrl: content.imageUrl || '',
        linkUrl: content.linkUrl || '',
        sortOrder: content.sortOrder,
        isActive: content.isActive,
        startDate: content.startDate ? content.startDate.split('T')[0] : '',
        endDate: content.endDate ? content.endDate.split('T')[0] : '',
      });
    } else {
      setEditingContent(null);
      setFormData({
        type: 'banner',
        key: '',
        titleAr: '',
        titleEn: '',
        contentAr: '',
        contentEn: '',
        imageUrl: '',
        linkUrl: '',
        sortOrder: 0,
        isActive: true,
        startDate: '',
        endDate: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingContent
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/content/${editingContent.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/content`;

      const response = await fetch(url, {
        method: editingContent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          imageUrl: formData.imageUrl || null,
          linkUrl: formData.linkUrl || null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        fetchContents();
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete[language])) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/content/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchContents();
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const handleToggleActive = async (content: Content) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/content/${content.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !content.isActive }),
      });
      fetchContents();
    } catch (error) {
      console.error('Failed to toggle content:', error);
    }
  };

  const getTypeInfo = (type: string) => {
    return contentTypes.find((t) => t.value === type) || contentTypes[0];
  };

  return (
    <AdminLayout title={t.title[language]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {t.all[language]}
              </button>
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedType === type.value ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {typeLabels[type.value][language]}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-5 h-5" />
              {t.addContent[language]}
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : contents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noContent[language]}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.type[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.key[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.titleEn[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.sortOrder[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600">{t.active[language]}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contents.map((content) => {
                    const typeInfo = getTypeInfo(content.type);
                    const TypeIcon = typeInfo.icon;
                    return (
                      <tr key={content.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${typeInfo.color}`}>
                            <TypeIcon className="w-4 h-4" />
                            <span className="text-sm">{typeLabels[content.type]?.[language] || content.type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{content.key}</td>
                        <td className="px-4 py-3">{content.titleEn || content.titleAr || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{content.sortOrder}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(content)}
                            className={`p-1.5 rounded-lg ${content.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                          >
                            {content.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(content)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(content.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-lg">
                {editingContent ? t.editContent[language] : t.addContent[language]}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.type[language]}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    disabled={!!editingContent}
                  >
                    {contentTypes.map((type) => (
                      <option key={type.value} value={type.value}>{typeLabels[type.value][language]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.key[language]}</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                    disabled={!!editingContent}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.titleAr[language]}</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.titleEn[language]}</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contentAr[language]}</label>
                <textarea
                  value={formData.contentAr}
                  onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contentEn[language]}</label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageUrl[language]}</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.linkUrl[language]}</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sortOrder[language]}</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.startDate[language]}</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.endDate[language]}</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
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
