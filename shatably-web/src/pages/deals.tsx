import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Loader2, Tag } from 'lucide-react';
import { Header, Footer, ProductCard } from '@/components';
import { useLanguageStore } from '@/lib/store';
import type { Product } from '@/types';

interface ApiProduct {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  stock: number;
  images: string[];
  categoryId?: string;
  isFeatured?: boolean;
}

function transformProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    sku: p.sku,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    descriptionAr: '',
    descriptionEn: '',
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    images: p.images && p.images.length > 0 ? p.images : [],
    categoryId: p.categoryId || '',
    stock: p.stock,
    unit: p.unit as any,
    isFeatured: p.isFeatured,
    createdAt: new Date().toISOString(),
  };
}

export default function DealsPage() {
  const { language } = useLanguageStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'عروض اليوم',
      subtitle: 'وفر أكثر مع أفضل العروض على مواد البناء',
      noDeals: 'لا توجد عروض متاحة حالياً',
      checkBack: 'تابعنا للحصول على أحدث العروض',
    },
    en: {
      title: "Today's Deals",
      subtitle: 'Save more with the best deals on building materials',
      noDeals: 'No deals available at the moment',
      checkBack: 'Check back for the latest offers',
    },
  };

  const content = t[language];

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/deals`);
        if (response.ok) {
          const data = await response.json();
          setProducts((data.data || []).map(transformProduct));
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <>
      <Head>
        <title>{content.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-12">
          <div className="container-custom text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">🔥</span>
              <h1 className="text-3xl md:text-4xl font-bold">{content.title}</h1>
            </div>
            <p className="text-lg text-secondary-100 max-w-2xl mx-auto">{content.subtitle}</p>
          </div>
        </div>

        {/* Products */}
        <div className="container-custom py-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{content.noDeals}</h2>
              <p className="text-gray-500">{content.checkBack}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
