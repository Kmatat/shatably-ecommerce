import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ChevronDown,
  Filter,
  Grid,
  List,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Header, Footer, ProductCard } from '@/components';
import { useLanguageStore } from '@/lib/store';
import { categories, products, brands, getCategoryById, getProductsByCategory } from '@/lib/data';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'popular' | 'rating';
type ViewMode = 'grid' | 'list';

export default function CategoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { language } = useLanguageStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const category = getCategoryById(id as string);
  const categoryName = category ? (language === 'ar' ? category.nameAr : category.nameEn) : '';

  // Get products for this category
  const categoryProducts = useMemo(() => {
    if (!id) return products;
    
    // Get products from this category and all subcategories
    const categoryIds = [id as string];
    const cat = categories.find((c) => c.id === id);
    if (cat?.children) {
      categoryIds.push(...cat.children.map((c) => c.id));
    }
    
    return products.filter((p) => categoryIds.includes(p.categoryId));
  }, [id]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => p.brandId && selectedBrands.includes(p.brandId));
    }

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  }, [categoryProducts, priceRange, selectedBrands, inStockOnly, sortBy]);

  const content = {
    ar: {
      allProducts: 'جميع المنتجات',
      filters: 'التصفية',
      sortBy: 'ترتيب حسب',
      sortOptions: {
        newest: 'الأحدث',
        price_low: 'السعر: من الأقل',
        price_high: 'السعر: من الأعلى',
        popular: 'الأكثر مبيعاً',
        rating: 'التقييم',
      },
      priceRange: 'نطاق السعر',
      brand: 'العلامة التجارية',
      availability: 'التوفر',
      inStockOnly: 'المتوفر فقط',
      clearAll: 'مسح الكل',
      results: 'نتيجة',
      noResults: 'لا توجد منتجات',
      noResultsDesc: 'جرب تغيير معايير البحث',
    },
    en: {
      allProducts: 'All Products',
      filters: 'Filters',
      sortBy: 'Sort By',
      sortOptions: {
        newest: 'Newest',
        price_low: 'Price: Low to High',
        price_high: 'Price: High to Low',
        popular: 'Most Popular',
        rating: 'Rating',
      },
      priceRange: 'Price Range',
      brand: 'Brand',
      availability: 'Availability',
      inStockOnly: 'In Stock Only',
      clearAll: 'Clear All',
      results: 'results',
      noResults: 'No products found',
      noResultsDesc: 'Try changing your search criteria',
    },
  };

  const t = content[language];
  const pageTitle = categoryName || t.allProducts;

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((b) => b !== brandId)
        : [...prev, brandId]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 50000]);
    setSelectedBrands([]);
    setInStockOnly(false);
  };

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 50000 || selectedBrands.length > 0 || inStockOnly;

  return (
    <>
      <Head>
        <title>{pageTitle} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container-custom py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary-600">
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{pageTitle}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b">
          <div className="container-custom py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {pageTitle}
            </h1>
            <p className="text-gray-500">
              {filteredProducts.length} {t.results}
            </p>

            {/* Subcategories */}
            {category?.children && category.children.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {category.children.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.id}`}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-primary-100 hover:text-primary-600 transition-colors"
                  >
                    {language === 'ar' ? sub.nameAr : sub.nameEn}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="container-custom py-6">
          <div className="flex gap-6">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">{t.filters}</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {t.clearAll}
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t.priceRange}</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="0"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="50000"
                    />
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t.brand}</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => toggleBrand(brand.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm">
                          {language === 'ar' ? brand.nameAr : brand.nameEn}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-medium mb-3">{t.availability}</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{t.inStockOnly}</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    {t.filters}
                    {hasActiveFilters && (
                      <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>

                  {/* Sort dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none px-4 py-2 pe-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      {Object.entries(t.sortOptions).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* View mode */}
                <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2',
                      viewMode === 'grid' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100'
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2',
                      viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100'
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Products */}
              {filteredProducts.length > 0 ? (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-4'
                  )}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noResults}</h3>
                  <p className="text-gray-500 mb-4">{t.noResultsDesc}</p>
                  <button onClick={clearFilters} className="btn-primary">
                    {t.clearAll}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className={cn(
              'absolute top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto',
              language === 'ar' ? 'right-0' : 'left-0'
            )}>
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h3 className="font-semibold text-lg">{t.filters}</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">{t.priceRange}</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="font-medium mb-3">{t.brand}</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => toggleBrand(brand.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        />
                        <span className="text-sm">
                          {language === 'ar' ? brand.nameAr : brand.nameEn}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-medium mb-3">{t.availability}</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600"
                    />
                    <span className="text-sm">{t.inStockOnly}</span>
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                <button onClick={clearFilters} className="flex-1 btn-outline">
                  {t.clearAll}
                </button>
                <button onClick={() => setShowFilters(false)} className="flex-1 btn-primary">
                  {language === 'ar' ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
