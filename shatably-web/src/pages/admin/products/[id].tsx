import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Package,
  X,
  Plus,
  Image as ImageIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  parentId: string | null;
}

interface Brand {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ProductForm {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  stock: number;
  minOrderQty: number;
  maxOrderQty: number | null;
  weight: number | null;
  categoryId: string;
  brandId: string;
  images: ProductImage[];
  isActive: boolean;
  isFeatured: boolean;
  specifications: Record<string, string>;
}

const UNITS = [
  { value: 'piece', ar: 'قطعة', en: 'Piece' },
  { value: 'bag', ar: 'كيس', en: 'Bag' },
  { value: 'ton', ar: 'طن', en: 'Ton' },
  { value: 'meter', ar: 'متر', en: 'Meter' },
  { value: 'sqmeter', ar: 'متر مربع', en: 'Sq. Meter' },
  { value: 'cubicmeter', ar: 'متر مكعب', en: 'Cubic Meter' },
  { value: 'kg', ar: 'كيلو', en: 'Kg' },
  { value: 'liter', ar: 'لتر', en: 'Liter' },
  { value: 'box', ar: 'صندوق', en: 'Box' },
  { value: 'roll', ar: 'رول', en: 'Roll' },
];

export default function ProductEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === 'new';
  const { language } = useLanguageStore();
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductForm>({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: 0,
    originalPrice: null,
    unit: 'piece',
    stock: 0,
    minOrderQty: 1,
    maxOrderQty: null,
    weight: null,
    categoryId: '',
    brandId: '',
    images: [],
    isActive: true,
    isFeatured: false,
    specifications: {},
  });

  const t = {
    title: isNew ? (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product') : (language === 'ar' ? 'تعديل المنتج' : 'Edit Product'),
    back: language === 'ar' ? 'رجوع' : 'Back',
    save: language === 'ar' ? 'حفظ' : 'Save',
    saving: language === 'ar' ? 'جاري الحفظ...' : 'Saving...',
    loading: language === 'ar' ? 'جاري التحميل...' : 'Loading...',
    basicInfo: language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information',
    nameAr: language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)',
    nameEn: language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)',
    descriptionAr: language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)',
    descriptionEn: language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)',
    pricing: language === 'ar' ? 'التسعير والمخزون' : 'Pricing & Inventory',
    price: language === 'ar' ? 'السعر' : 'Price',
    originalPrice: language === 'ar' ? 'السعر قبل الخصم' : 'Original Price',
    unit: language === 'ar' ? 'الوحدة' : 'Unit',
    stock: language === 'ar' ? 'المخزون' : 'Stock',
    minOrder: language === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order Qty',
    maxOrder: language === 'ar' ? 'الحد الأقصى للطلب' : 'Max Order Qty',
    weight: language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)',
    category: language === 'ar' ? 'الفئة' : 'Category',
    brand: language === 'ar' ? 'العلامة التجارية' : 'Brand',
    selectCategory: language === 'ar' ? 'اختر الفئة' : 'Select Category',
    selectBrand: language === 'ar' ? 'اختر العلامة التجارية' : 'Select Brand',
    noBrand: language === 'ar' ? 'بدون علامة تجارية' : 'No Brand',
    images: language === 'ar' ? 'الصور' : 'Images',
    addImage: language === 'ar' ? 'إضافة صورة' : 'Add Image',
    imageUrl: language === 'ar' ? 'رابط الصورة' : 'Image URL',
    uploadImage: language === 'ar' ? 'رفع صورة' : 'Upload Image',
    uploading: language === 'ar' ? 'جاري الرفع...' : 'Uploading...',
    orUpload: language === 'ar' ? 'أو ارفع من جهازك' : 'or upload from device',
    settings: language === 'ar' ? 'الإعدادات' : 'Settings',
    active: language === 'ar' ? 'نشط' : 'Active',
    featured: language === 'ar' ? 'مميز' : 'Featured',
    specifications: language === 'ar' ? 'المواصفات' : 'Specifications',
    specKey: language === 'ar' ? 'اسم المواصفة' : 'Spec Name',
    specValue: language === 'ar' ? 'القيمة' : 'Value',
    addSpec: language === 'ar' ? 'إضافة' : 'Add',
    required: language === 'ar' ? 'مطلوب' : 'Required',
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (!isNew && id) {
      fetchProduct();
    }
  }, [id, isNew]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBrands(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const product = data.data;
        setForm({
          nameAr: product.nameAr || '',
          nameEn: product.nameEn || '',
          descriptionAr: product.descriptionAr || '',
          descriptionEn: product.descriptionEn || '',
          price: product.price || 0,
          originalPrice: product.originalPrice,
          unit: product.unit || 'piece',
          stock: product.stock || 0,
          minOrderQty: product.minOrderQty || 1,
          maxOrderQty: product.maxOrderQty,
          weight: product.weight,
          categoryId: product.categoryId || '',
          brandId: product.brandId || '',
          images: product.images || [],
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
          specifications: product.specifications || {},
        });
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`;

      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        minOrderQty: Number(form.minOrderQty),
        maxOrderQty: form.maxOrderQty ? Number(form.maxOrderQty) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        brandId: form.brandId || undefined,
        images: form.images.map((img, i) => ({ url: img.url, alt: img.alt || '', isPrimary: i === 0 })),
      };

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setForm({ ...form, images: [...form.images, { url: newImageUrl.trim() }] });
      setNewImageUrl('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          // Construct full URL for the uploaded image
          const imageUrl = data.data.url.startsWith('http')
            ? data.data.url
            : `${process.env.NEXT_PUBLIC_API_URL}${data.data.url}`;
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, { url: imageUrl }],
          }));
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setForm({ ...form, specifications: { ...form.specifications, [specKey.trim()]: specValue.trim() } });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...form.specifications };
    delete newSpecs[key];
    setForm({ ...form, specifications: newSpecs });
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

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}</title>
      </Head>

      <AdminLayout title={t.title}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {t.back}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? t.saving : t.save}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">{t.basicInfo}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.nameAr} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.nameAr}
                        onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                        dir="rtl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.nameEn} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.nameEn}
                        onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.descriptionAr}</label>
                    <textarea
                      value={form.descriptionAr}
                      onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 h-24"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.descriptionEn}</label>
                    <textarea
                      value={form.descriptionEn}
                      onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 h-24"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">{t.pricing}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.price} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.originalPrice}</label>
                    <input
                      type="number"
                      value={form.originalPrice || ''}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : null })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.unit} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                      required
                    >
                      {UNITS.map((u) => (
                        <option key={u.value} value={u.value}>{language === 'ar' ? u.ar : u.en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.stock} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.minOrder}</label>
                    <input
                      type="number"
                      value={form.minOrderQty}
                      onChange={(e) => setForm({ ...form, minOrderQty: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.maxOrder}</label>
                    <input
                      type="number"
                      value={form.maxOrderQty || ''}
                      onChange={(e) => setForm({ ...form, maxOrderQty: e.target.value ? Number(e.target.value) : null })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.weight}</label>
                    <input
                      type="number"
                      value={form.weight || ''}
                      onChange={(e) => setForm({ ...form, weight: e.target.value ? Number(e.target.value) : null })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">{t.images}</h2>
                <div className="space-y-4">
                  {/* File Upload Button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-2" />
                          <span className="text-gray-600">{t.uploading}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-primary-600 font-medium">{t.uploadImage}</span>
                          <span className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{t.orUpload}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder={t.imageUrl}
                      className="flex-1 border rounded-lg px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {form.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 end-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 start-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded">
                            {language === 'ar' ? 'الرئيسية' : 'Primary'}
                          </span>
                        )}
                      </div>
                    ))}
                    {form.images.length === 0 && (
                      <div className="col-span-4 py-8 text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>{language === 'ar' ? 'لا توجد صور' : 'No images added'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">{t.specifications}</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      placeholder={t.specKey}
                      className="flex-1 border rounded-lg px-4 py-2"
                    />
                    <input
                      type="text"
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      placeholder={t.specValue}
                      className="flex-1 border rounded-lg px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      {t.addSpec}
                    </button>
                  </div>
                  {Object.entries(form.specifications).length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {Object.entries(form.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between px-4 py-2">
                          <span className="font-medium">{key}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">{value}</span>
                            <button
                              type="button"
                              onClick={() => removeSpecification(key)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">
                      {language === 'ar' ? 'لا توجد مواصفات' : 'No specifications added'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category & Brand */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">{t.category}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.category} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                      required
                    >
                      <option value="">{t.selectCategory}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.brand}</label>
                    <select
                      value={form.brandId}
                      onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      <option value="">{t.noBrand}</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {language === 'ar' ? brand.nameAr : brand.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">{t.settings}</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600"
                    />
                    <span>{t.active}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600"
                    />
                    <span>{t.featured}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
