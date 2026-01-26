import Head from 'next/head';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';
import { categories } from '@/lib/data';

export default function CategoriesPage() {
  const { language } = useLanguageStore();

  const title = language === 'ar' ? 'جميع الفئات' : 'All Categories';

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Category header */}
                <Link
                  href={`/category/${category.id}`}
                  className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {language === 'ar' ? category.nameAr : category.nameEn}
                    </h2>
                    {category.children && (
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
                          href={`/category/${sub.id}`}
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
        </div>
      </main>

      <Footer />
    </>
  );
}
