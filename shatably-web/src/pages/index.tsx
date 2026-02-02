import Head from 'next/head';
import { useLanguageStore } from '@/lib/store';
import {
  Header,
  Footer,
  BannerCarousel,
  CategorySection,
  FeaturedProducts,
  DealsSection,
  UploadListBanner,
} from '@/components';

export default function Home() {
  const { language } = useLanguageStore();

  const title = language === 'ar' 
    ? 'شطابلي | مواد البناء والتشطيب' 
    : 'Shatably | Building Materials';
  
  const description = language === 'ar'
    ? 'أكبر منصة لمواد البناء في مصر - أسمنت، حديد، بلاط، دهانات وأكثر مع توصيل سريع'
    : 'Egypt\'s largest building materials platform - cement, steel, tiles, paints and more with fast delivery';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Banner Carousel */}
          <BannerCarousel />
          
          {/* Categories */}
          <CategorySection />
          
          {/* Featured Products */}
          <FeaturedProducts />
          
          {/* Upload List Banner */}
          <UploadListBanner />
          
          {/* Deals Section */}
          <DealsSection />
          
          {/* Trust badges / Why Shatably */}
          <WhyShatably />
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Why Shatably Section
function WhyShatably() {
  const { language } = useLanguageStore();

  const features = [
    {
      icon: '🚚',
      titleAr: 'توصيل سريع',
      titleEn: 'Fast Delivery',
      descAr: 'توصيل خلال 3 ساعات للطلبات العاجلة أو اختر موعد يناسبك',
      descEn: '3-hour delivery for urgent orders or schedule at your convenience',
    },
    {
      icon: '💰',
      titleAr: 'أسعار تنافسية',
      titleEn: 'Competitive Prices',
      descAr: 'أفضل الأسعار مع عروض وخصومات مستمرة على جميع المنتجات',
      descEn: 'Best prices with ongoing offers and discounts on all products',
    },
    {
      icon: '✅',
      titleAr: 'جودة مضمونة',
      titleEn: 'Quality Guaranteed',
      descAr: 'جميع منتجاتنا أصلية ومطابقة للمواصفات القياسية',
      descEn: 'All our products are genuine and meet quality standards',
    },
    {
      icon: '📋',
      titleAr: 'خدمة قائمة المواد',
      titleEn: 'Material List Service',
      descAr: 'ارفع قائمة المواد وفريقنا يجهز طلبك بالكامل',
      descEn: 'Upload your material list and our team prepares your order',
    },
  ];

  return (
    <section className="section bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'ليه شطابلي؟' : 'Why Shatably?'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'ar'
              ? 'نوفر لك تجربة شراء مواد البناء الأسهل والأسرع في مصر'
              : 'We provide you with the easiest and fastest building materials shopping experience in Egypt'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'ar' ? feature.titleAr : feature.titleEn}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ar' ? feature.descAr : feature.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
