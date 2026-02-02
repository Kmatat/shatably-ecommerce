import Head from 'next/head';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

export default function WishlistPage() {
  const { language } = useLanguageStore();

  const t = {
    ar: {
      title: 'قائمة الأمنيات',
      empty: 'قائمة الأمنيات فارغة',
      emptyDesc: 'أضف منتجاتك المفضلة لقائمة الأمنيات لتجدها بسهولة لاحقاً',
      continueShopping: 'تسوق الآن',
      comingSoon: 'ميزة قائمة الأمنيات قادمة قريباً!',
      comingSoonDesc: 'سيمكنك حفظ المنتجات المفضلة لديك ومتابعة أسعارها',
    },
    en: {
      title: 'Wishlist',
      empty: 'Your wishlist is empty',
      emptyDesc: 'Add your favorite products to wishlist to find them easily later',
      continueShopping: 'Shop Now',
      comingSoon: 'Wishlist feature coming soon!',
      comingSoonDesc: 'You will be able to save your favorite products and track their prices',
    },
  };

  const content = t[language];

  return (
    <>
      <Head>
        <title>{content.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{content.title}</h1>
          </div>

          {/* Empty State / Coming Soon */}
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{content.comingSoon}</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{content.comingSoonDesc}</p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {content.continueShopping}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
