import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  FileText,
  User,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { formatDate, formatPrice, cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface MaterialList {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  notes: string | null;
  status: string;
  assignedTo: string | null;
  processedAt: string | null;
  cartSnapshot: any;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
  };
}

interface Product {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  price: number;
  stock: number;
  unit: string;
  image: string | null;
}

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export default function MaterialListDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { language } = useLanguageStore();
  const { token } = useAuthStore();

  const [materialList, setMaterialList] = useState<MaterialList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Product search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  // Cart items to add
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const content = {
    ar: {
      title: 'مراجعة قائمة المواد',
      backToList: 'العودة للقوائم',
      customer: 'العميل',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      uploadedFile: 'الملف المرفق',
      notes: 'ملاحظات العميل',
      noNotes: 'لا توجد ملاحظات',
      uploadedAt: 'تاريخ الرفع',
      status: 'الحالة',
      searchProducts: 'ابحث عن منتجات لإضافتها...',
      productsToAdd: 'المنتجات المختارة',
      noProductsSelected: 'لم يتم اختيار منتجات بعد',
      addToCart: 'أضف إلى سلة العميل',
      adding: 'جاري الإضافة...',
      addSuccess: 'تم إضافة المنتجات بنجاح!',
      price: 'السعر',
      quantity: 'الكمية',
      total: 'الإجمالي',
      remove: 'حذف',
      viewFile: 'عرض الملف',
      downloadFile: 'تحميل الملف',
      stock: 'المتوفر',
      outOfStock: 'غير متوفر',
      statuses: {
        pending: 'بانتظار المراجعة',
        processing: 'جاري المراجعة',
        ready: 'جاهز',
        completed: 'مكتمل',
        cancelled: 'ملغي',
      },
      notFound: 'قائمة المواد غير موجودة',
      loadError: 'حدث خطأ أثناء تحميل البيانات',
    },
    en: {
      title: 'Review Material List',
      backToList: 'Back to Lists',
      customer: 'Customer',
      phone: 'Phone',
      email: 'Email',
      uploadedFile: 'Uploaded File',
      notes: 'Customer Notes',
      noNotes: 'No notes',
      uploadedAt: 'Uploaded At',
      status: 'Status',
      searchProducts: 'Search products to add...',
      productsToAdd: 'Selected Products',
      noProductsSelected: 'No products selected yet',
      addToCart: 'Add to Customer Cart',
      adding: 'Adding...',
      addSuccess: 'Products added successfully!',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      remove: 'Remove',
      viewFile: 'View File',
      downloadFile: 'Download File',
      stock: 'In Stock',
      outOfStock: 'Out of Stock',
      statuses: {
        pending: 'Pending Review',
        processing: 'Processing',
        ready: 'Ready',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      notFound: 'Material list not found',
      loadError: 'Error loading data',
    },
  };

  const t = content[language];
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  // Fetch material list details
  useEffect(() => {
    if (!id || !token) return;

    const fetchMaterialList = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/admin/material-lists/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch material list');
        const data = await response.json();
        setMaterialList(data.data);
      } catch (err) {
        setError(t.loadError);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialList();
  }, [id, token]);

  // Search products
  useEffect(() => {
    if (!searchQuery.trim() || !token) {
      setSearchResults([]);
      return;
    }

    const searchProducts = async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `${API_URL}/products?search=${encodeURIComponent(searchQuery)}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          const products = Array.isArray(data.data) ? data.data : [];
          setSearchResults(
            products.map((p: any) => ({
              id: p.id,
              sku: p.sku,
              nameAr: p.nameAr,
              nameEn: p.nameEn,
              price: p.price,
              stock: p.stock,
              unit: p.unit,
              image: p.images?.[0]?.url || p.image || null,
            }))
          );
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  const addProduct = (product: Product) => {
    const existing = cartItems.find((item) => item.productId === product.id);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { productId: product.id, product, quantity: 1 }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeProduct = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const handleSubmit = async () => {
    if (!materialList || cartItems.length === 0 || !token) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/material-lists/${materialList.id}/add-to-cart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            products: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to add products');

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/admin/material-lists');
      }, 2000);
    } catch (err) {
      setError('Failed to add products to cart');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <AdminLayout title={t.title}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </AdminLayout>
    );
  }

  if (!materialList) {
    return (
      <AdminLayout title={t.title}>
        <div className="text-center py-20">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t.notFound}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>
          {t.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}
        </title>
      </Head>

      <AdminLayout title={t.title}>
        {/* Back button */}
        <button
          onClick={() => router.push('/admin/material-lists')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <BackArrow className="w-5 h-5" />
          {t.backToList}
        </button>

        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-medium">{t.addSuccess}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Material List Details */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">{t.customer}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>{materialList.user?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span dir="ltr">{materialList.user?.phone || '-'}</span>
                </div>
                {materialList.user?.email && (
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 text-gray-400">@</span>
                    <span>{materialList.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* File Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">{t.uploadedFile}</h3>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary-500" />
                    <div>
                      <p className="font-medium">{materialList.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(materialList.createdAt, language)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      statusColors[materialList.status]
                    )}
                  >
                    {t.statuses[materialList.status as keyof typeof t.statuses]}
                  </span>
                </div>

                {/* File preview based on type */}
                {materialList.fileType.startsWith('image') ? (
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={materialList.fileUrl}
                      alt={materialList.fileName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="flex gap-2">
                  <a
                    href={materialList.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-outline flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t.viewFile}
                  </a>
                  <a
                    href={materialList.fileUrl}
                    download
                    className="flex-1 btn-outline flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadFile}
                  </a>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">{t.notes}</h4>
                <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                  {materialList.notes || (
                    <span className="text-gray-400 italic">{t.noNotes}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Product Selection */}
          <div className="space-y-6">
            {/* Product Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">{t.searchProducts}</h3>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchProducts}
                  className="w-full ps-10 pe-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searching && (
                  <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {language === 'ar' ? product.nameAr : product.nameEn}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.sku} • {formatPrice(product.price, language)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addProduct(product)}
                        disabled={product.stock < 1}
                        className={cn(
                          'p-2 rounded-lg',
                          product.stock > 0
                            ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">{t.productsToAdd}</h3>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t.noProductsSelected}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 border rounded-lg p-3"
                    >
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt=""
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {language === 'ar'
                            ? item.product.nameAr
                            : item.product.nameEn}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.product.price, language)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeProduct(item.productId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>{t.total}</span>
                      <span className="text-primary-600">
                        {formatPrice(calculateTotal(), language)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || submitSuccess}
                    className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.adding}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        {t.addToCart}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
