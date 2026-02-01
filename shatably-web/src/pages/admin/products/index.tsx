import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  ChevronDown,
  Package,
  MoreVertical,
  Eye,
  Copy,
  EyeOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';

interface Product {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  unit: string;
  category: { id: string; nameAr: string; nameEn: string } | null;
  brand: { id: string; nameAr: string; nameEn: string } | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  parentId: string | null;
}

export default function AdminProductsPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const content = {
    ar: {
      title: 'إدارة المنتجات',
      search: 'بحث بالاسم أو الكود...',
      addProduct: 'إضافة منتج',
      import: 'استيراد',
      export: 'تصدير',
      allCategories: 'جميع الفئات',
      allStock: 'جميع المخزون',
      inStock: 'متوفر',
      lowStock: 'قارب على النفاد',
      outOfStock: 'غير متوفر',
      product: 'المنتج',
      sku: 'الكود',
      category: 'الفئة',
      price: 'السعر',
      stock: 'المخزون',
      status: 'الحالة',
      actions: 'إجراءات',
      edit: 'تعديل',
      duplicate: 'نسخ',
      delete: 'حذف',
      view: 'عرض',
      noProducts: 'لا توجد منتجات',
      selected: 'محدد',
      active: 'نشط',
      inactive: 'غير نشط',
      confirmDelete: 'هل أنت متأكد من حذف هذا المنتج؟',
      loading: 'جاري التحميل...',
      of: 'من',
      products: 'منتج',
    },
    en: {
      title: 'Products Management',
      search: 'Search by name or SKU...',
      addProduct: 'Add Product',
      import: 'Import',
      export: 'Export',
      allCategories: 'All Categories',
      allStock: 'All Stock',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      product: 'Product',
      sku: 'SKU',
      category: 'Category',
      price: 'Price',
      stock: 'Stock',
      status: 'Status',
      actions: 'Actions',
      edit: 'Edit',
      duplicate: 'Duplicate',
      delete: 'Delete',
      view: 'View',
      noProducts: 'No products found',
      selected: 'selected',
      active: 'Active',
      inactive: 'Inactive',
      confirmDelete: 'Are you sure you want to delete this product?',
      loading: 'Loading...',
      of: 'of',
      products: 'products',
    },
  };

  const t = content[language];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, categoryFilter, stockFilter]);

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('categoryId', categoryFilter);
      if (stockFilter !== 'all') params.append('stock', stockFilter);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to toggle product:', error);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t.outOfStock, color: 'bg-red-100 text-red-700' };
    if (stock <= 10) return { label: t.lowStock, color: 'bg-yellow-100 text-yellow-700' };
    return { label: t.inStock, color: 'bg-green-100 text-green-700' };
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}</title>
      </Head>

      <AdminLayout title={t.title}>
        {/* Actions bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder={t.search}
                className="w-full ps-10 pe-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="appearance-none px-4 py-2.5 pe-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{language === 'ar' ? cat.nameAr : cat.nameEn}</option>
                ))}
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Stock filter */}
            <div className="relative">
              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value as typeof stockFilter); setPage(1); }}
                className="appearance-none px-4 py-2.5 pe-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t.allStock}</option>
                <option value="in_stock">{t.inStock}</option>
                <option value="low_stock">{t.lowStock}</option>
                <option value="out_of_stock">{t.outOfStock}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50">
                <Upload className="w-5 h-5" />
                {t.import}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50">
                <Download className="w-5 h-5" />
                {t.export}
              </button>
              <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                <Plus className="w-5 h-5" />
                {t.addProduct}
              </Link>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center gap-4">
              <span className="text-sm text-gray-600">{selectedProducts.length} {t.selected}</span>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">{t.delete}</button>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
              <p className="mt-2 text-gray-500">{t.loading}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        />
                      </th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.product}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.sku}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.category}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.price}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.stock}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.status}</th>
                      <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          {t.noProducts}
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => {
                        const name = language === 'ar' ? product.nameAr : product.nameEn;
                        const stockStatus = getStockStatus(product.stock);
                        const categoryName = product.category ? (language === 'ar' ? product.category.nameAr : product.category.nameEn) : '-';
                        return (
                          <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleSelectProduct(product.id)}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                  {product.images && product.images[0] ? (
                                    <Image
                                      src={product.images[0]}
                                      alt={name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 m-3 text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate max-w-[200px]">{name}</p>
                                  {!product.isActive && (
                                    <span className="text-xs text-gray-400">{t.inactive}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{categoryName}</td>
                            <td className="px-4 py-4 font-medium">{formatPrice(product.price, language)}</td>
                            <td className="px-4 py-4 text-gray-600">{product.stock}</td>
                            <td className="px-4 py-4">
                              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', stockStatus.color)}>
                                {stockStatus.label}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="relative group">
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>
                                <div className="absolute top-full end-0 mt-1 w-40 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                  <div className="py-1">
                                    <Link href={`/product/${product.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                      <Eye className="w-4 h-4" />
                                      {t.view}
                                    </Link>
                                    <Link href={`/admin/products/${product.id}`} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                      <Edit2 className="w-4 h-4" />
                                      {t.edit}
                                    </Link>
                                    <button
                                      onClick={() => handleToggleActive(product.id)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                    >
                                      {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      {product.isActive ? t.inactive : t.active}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(product.id)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      {t.delete}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {total} {t.products}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    <span className="text-sm text-gray-600">
                      {page} {t.of} {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
