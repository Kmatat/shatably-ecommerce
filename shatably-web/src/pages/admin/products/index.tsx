import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore } from '@/lib/store';
import { products, categories } from '@/lib/data';
import { formatPrice, cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const { language } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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
    },
  };

  const t = content[language];

  const filteredProducts = products.filter((product) => {
    const name = language === 'ar' ? product.nameAr : product.nameEn;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    let matchesStock = true;
    if (stockFilter === 'in_stock') matchesStock = product.stock > 10;
    else if (stockFilter === 'low_stock') matchesStock = product.stock > 0 && product.stock <= 10;
    else if (stockFilter === 'out_of_stock') matchesStock = product.stock === 0;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t.outOfStock, color: 'bg-red-100 text-red-700' };
    if (stock <= 10) return { label: t.lowStock, color: 'bg-yellow-100 text-yellow-700' };
    return { label: t.inStock, color: 'bg-green-100 text-green-700' };
  };

  const getCategoryName = (categoryId: string) => {
    for (const cat of categories) {
      if (cat.id === categoryId) return language === 'ar' ? cat.nameAr : cat.nameEn;
      if (cat.children) {
        const child = cat.children.find(c => c.id === categoryId);
        if (child) return language === 'ar' ? child.nameAr : child.nameEn;
      }
    }
    return categoryId;
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Get all unique categories for filter
  const allCategories: { id: string; name: string }[] = [];
  categories.forEach((cat) => {
    allCategories.push({ id: cat.id, name: language === 'ar' ? cat.nameAr : cat.nameEn });
    cat.children?.forEach((child) => {
      allCategories.push({ id: child.id, name: language === 'ar' ? child.nameAr : child.nameEn });
    });
  });

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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full ps-10 pe-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none px-4 py-2.5 pe-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t.allCategories}</option>
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Stock filter */}
            <div className="relative">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
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
              <Link href="/admin/products/new" className="btn-primary">
                <Plus className="w-5 h-5 me-2" />
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      {t.noProducts}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const name = language === 'ar' ? product.nameAr : product.nameEn;
                    const stockStatus = getStockStatus(product.stock);
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
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{getCategoryName(product.categoryId)}</td>
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
                            <div className="absolute top-full end-0 mt-1 w-36 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="py-1">
                                <Link href={`/product/${product.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                  <Eye className="w-4 h-4" />
                                  {t.view}
                                </Link>
                                <Link href={`/admin/products/${product.id}`} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                  <Edit2 className="w-4 h-4" />
                                  {t.edit}
                                </Link>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                                  <Copy className="w-4 h-4" />
                                  {t.duplicate}
                                </button>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
        </div>
      </AdminLayout>
    </>
  );
}
