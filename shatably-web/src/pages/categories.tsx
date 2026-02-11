import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  image: string | null;
  productCount: number;
  children: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    icon: string | null;
    productCount: number;
  }[];
}

export default function CategoriesPage() {
  const { language } = useLanguageStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const title = language === 'ar' ? 'جميع الفئات' : 'All Categories';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
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
    fetchCategories();
  }, []);

  return (
    <>
      <Head>
        <title>{title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {title}
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {language === 'ar' ? 'لا توجد فئات' : 'No categories available'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Category header */}
                  <Link
                    href={`/category/${category.slug || category.id}`}
                    className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">{category.icon || '📦'}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {language === 'ar' ? category.nameAr : category.nameEn}
                      </h2>
                      {category.children && category.children.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {category.children.length}{' '}
                          {language === 'ar' ? 'فئة فرعية' : 'subcategories'}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="border-t px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {category.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/category/${sub.slug || sub.id}`}
                            className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-primary-100 hover:text-primary-600 transition-colors"
                          >
                            {language === 'ar' ? sub.nameAr : sub.nameEn}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
