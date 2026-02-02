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

interface Attribute {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  type: string;
  unit: string | null;
  options: AttributeOption[];
}

interface AttributeOption {
  id: string;
  valueAr: string;
  valueEn: string;
  colorCode: string | null;
}

interface ProductVariation {
  id: string;
  sku: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  options: { option: AttributeOption & { attribute: Attribute } }[];
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
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [variationForm, setVariationForm] = useState({ price: 0, originalPrice: null as number | null, stock: 0, imageUrl: '', optionIds: [] as string[] });
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
    attributes: language === 'ar' ? 'الخصائص والمواصفات' : 'Attributes & Options',
    selectOptions: language === 'ar' ? 'اختر الخيارات المتاحة' : 'Select available options',
    variations: language === 'ar' ? 'المتغيرات' : 'Variations',
    addVariation: language === 'ar' ? 'إضافة متغير' : 'Add Variation',
    editVariation: language === 'ar' ? 'تعديل المتغير' : 'Edit Variation',
    noVariations: language === 'ar' ? 'لا توجد متغيرات' : 'No variations added',
    variationOptions: language === 'ar' ? 'خيارات المتغير' : 'Variation Options',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchAttributes();
    if (!isNew && id) {
      fetchProduct();
      fetchVariations();
      fetchProductAttributes();
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

  const fetchAttributes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attributes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAttributes(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
    }
  };

  const fetchVariations = async () => {
    if (!id || isNew) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}/variations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVariations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch variations:', error);
    }
  };

  const fetchProductAttributes = async () => {
    if (!id || isNew) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}/attributes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Group by attribute
        const grouped: Record<string, string[]> = {};
        (data.data || []).forEach((val: any) => {
          if (val.optionId) {
            if (!grouped[val.attributeId]) grouped[val.attributeId] = [];
            grouped[val.attributeId].push(val.optionId);
          }
        });
        setSelectedAttributes(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch product attributes:', error);
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
        const data = await response.json();
        const productId = data.data?.id || id;
        // Save attributes
        if (productId) {
          await saveProductAttributes(productId);
        }
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

  const toggleAttributeOption = (attributeId: string, optionId: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[attributeId] || [];
      const isSelected = current.includes(optionId);
      return {
        ...prev,
        [attributeId]: isSelected ? current.filter((id) => id !== optionId) : [...current, optionId],
      };
    });
  };

  const saveProductAttributes = async (productId: string) => {
    const attributesPayload = Object.entries(selectedAttributes)
      .filter(([_, optionIds]) => optionIds.length > 0)
      .map(([attributeId, optionIds]) => ({ attributeId, optionIds }));

    if (attributesPayload.length === 0) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}/attributes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ attributes: attributesPayload }),
    });
  };

  const openVariationModal = (variation?: ProductVariation) => {
    if (variation) {
      setEditingVariation(variation);
      setVariationForm({
        price: variation.price,
        originalPrice: variation.originalPrice,
        stock: variation.stock,
        imageUrl: variation.imageUrl || '',
        optionIds: variation.options.map((o) => o.option.id),
      });
    } else {
      setEditingVariation(null);
      setVariationForm({ price: form.price, originalPrice: form.originalPrice, stock: 0, imageUrl: '', optionIds: [] });
    }
    setShowVariationModal(true);
  };

  const saveVariation = async () => {
    if (!id || isNew) return;
    try {
      const url = editingVariation
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}/variations/${editingVariation.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}/variations`;

      await fetch(url, {
        method: editingVariation ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(variationForm),
      });

      setShowVariationModal(false);
      fetchVariations();
    } catch (error) {
      console.error('Failed to save variation:', error);
    }
  };

  const deleteVariation = async (variationId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}/variations/${variationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVariations();
    } catch (error) {
      console.error('Failed to delete variation:', error);
    }
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

              {/* Attributes */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">{t.attributes}</h2>
                <p className="text-sm text-gray-500 mb-4">{t.selectOptions}</p>
                <div className="space-y-4">
                  {attributes.map((attr) => (
                    <div key={attr.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        {language === 'ar' ? attr.nameAr : attr.nameEn}
                        {attr.unit && <span className="text-xs text-gray-400">({attr.unit})</span>}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {attr.options.map((opt) => {
                          const isSelected = (selectedAttributes[attr.id] || []).includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleAttributeOption(attr.id, opt.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border text-sm transition-colors flex items-center gap-2',
                                isSelected ? 'bg-primary-500 text-white border-primary-500' : 'bg-white hover:bg-gray-50'
                              )}
                            >
                              {opt.colorCode && (
                                <span
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: opt.colorCode }}
                                />
                              )}
                              {language === 'ar' ? opt.valueAr : opt.valueEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {attributes.length === 0 && (
                    <p className="text-center text-gray-400 py-4">
                      {language === 'ar' ? 'لا توجد خصائص متاحة' : 'No attributes available'}
                    </p>
                  )}
                </div>
              </div>

              {/* Variations (only show for existing products) */}
              {!isNew && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">{t.variations}</h2>
                    <button
                      type="button"
                      onClick={() => openVariationModal()}
                      className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="w-4 h-4" />
                      {t.addVariation}
                    </button>
                  </div>
                  {variations.length > 0 ? (
                    <div className="space-y-3">
                      {variations.map((variation) => (
                        <div key={variation.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-gray-500">{variation.sku}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openVariationModal(variation)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Package className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteVariation(variation.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {variation.options.map((vo) => (
                              <span key={vo.option.id} className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                                {language === 'ar' ? vo.option.valueAr : vo.option.valueEn}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium">{variation.price} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                            <span className="text-gray-500">{language === 'ar' ? 'المخزون:' : 'Stock:'} {variation.stock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">{t.noVariations}</p>
                  )}
                </div>
              )}
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

        {/* Variation Modal */}
        {showVariationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
                <h3 className="font-semibold text-lg">
                  {editingVariation ? t.editVariation : t.addVariation}
                </h3>
                <button onClick={() => setShowVariationModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Variation Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.variationOptions}</label>
                  <div className="space-y-3">
                    {attributes.map((attr) => {
                      const selectedOpts = selectedAttributes[attr.id] || [];
                      if (selectedOpts.length === 0) return null;
                      return (
                        <div key={attr.id}>
                          <span className="text-sm text-gray-500">{language === 'ar' ? attr.nameAr : attr.nameEn}</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {attr.options.filter((o) => selectedOpts.includes(o.id)).map((opt) => {
                              const isSelected = variationForm.optionIds.includes(opt.id);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setVariationForm((prev) => ({
                                    ...prev,
                                    optionIds: isSelected
                                      ? prev.optionIds.filter((id) => id !== opt.id)
                                      : [...prev.optionIds.filter((id) => !attr.options.some((o) => o.id === id)), opt.id]
                                  }))}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                                    isSelected ? 'bg-primary-500 text-white border-primary-500' : 'bg-white hover:bg-gray-50'
                                  )}
                                >
                                  {language === 'ar' ? opt.valueAr : opt.valueEn}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.price}</label>
                    <input
                      type="number"
                      value={variationForm.price}
                      onChange={(e) => setVariationForm({ ...variationForm, price: Number(e.target.value) })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.originalPrice}</label>
                    <input
                      type="number"
                      value={variationForm.originalPrice || ''}
                      onChange={(e) => setVariationForm({ ...variationForm, originalPrice: e.target.value ? Number(e.target.value) : null })}
                      className="w-full border rounded-lg px-4 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.stock}</label>
                  <input
                    type="number"
                    value={variationForm.stock}
                    onChange={(e) => setVariationForm({ ...variationForm, stock: Number(e.target.value) })}
                    className="w-full border rounded-lg px-4 py-2"
                    min="0"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.imageUrl}</label>
                  <input
                    type="url"
                    value={variationForm.imageUrl}
                    onChange={(e) => setVariationForm({ ...variationForm, imageUrl: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="p-4 border-t flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowVariationModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={saveVariation}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
