import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Building2, Truck, Shield, Users, Target, Heart, Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

interface AboutContent {
  intro?: { contentAr: string; contentEn: string };
  mission?: { titleAr: string; titleEn: string; contentAr: string; contentEn: string };
  vision?: { titleAr: string; titleEn: string; contentAr: string; contentEn: string };
  features?: Array<{ titleAr: string; titleEn: string; contentAr: string; contentEn: string }>;
  stats?: { metadata: any };
}

export default function AboutPage() {
  const { language } = useLanguageStore();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'من نحن',
      subtitle: 'شريكك الموثوق في مواد البناء',
      whyUs: 'لماذا شطابلي؟',
    },
    en: {
      title: 'About Us',
      subtitle: 'Your Trusted Partner in Building Materials',
      whyUs: 'Why Shatably?',
    },
  };

  // Default content
  const defaults = {
    ar: {
      intro: 'شطابلي هي منصة إلكترونية رائدة في مجال مواد البناء في مصر. نهدف إلى تسهيل عملية شراء مواد البناء للجميع، من أصحاب المنازل إلى المقاولين والمصممين.',
      mission: 'مهمتنا',
      missionText: 'توفير مواد البناء عالية الجودة بأسعار تنافسية مع خدمة توصيل سريعة وموثوقة.',
      vision: 'رؤيتنا',
      visionText: 'أن نكون المنصة الأولى والأكثر ثقة لشراء مواد البناء في مصر والمنطقة العربية.',
      features: [
        { title: 'منتجات أصلية', desc: 'جميع منتجاتنا أصلية 100% ومضمونة من أفضل العلامات التجارية' },
        { title: 'توصيل سريع', desc: 'توصيل خلال 3 ساعات في القاهرة الكبرى' },
        { title: 'أسعار تنافسية', desc: 'أسعار الجملة متاحة للجميع' },
        { title: 'دعم متخصص', desc: 'فريق خدمة عملاء متخصص لمساعدتك في اختيار المنتجات المناسبة' },
      ],
      stats: [
        { value: '10,000+', label: 'عميل سعيد' },
        { value: '50,000+', label: 'طلب مكتمل' },
        { value: '280+', label: 'منتج متاح' },
        { value: '40+', label: 'علامة تجارية' },
      ],
    },
    en: {
      intro: 'Shatably is a leading e-commerce platform for building materials in Egypt. We aim to simplify the process of buying building materials for everyone, from homeowners to contractors and designers.',
      mission: 'Our Mission',
      missionText: 'To provide high-quality building materials at competitive prices with fast and reliable delivery service.',
      vision: 'Our Vision',
      visionText: 'To be the first and most trusted platform for buying building materials in Egypt and the Arab region.',
      features: [
        { title: 'Genuine Products', desc: '100% original products guaranteed from top brands' },
        { title: 'Fast Delivery', desc: 'Delivery within 3 hours in Greater Cairo' },
        { title: 'Competitive Prices', desc: 'Wholesale prices available for everyone' },
        { title: 'Expert Support', desc: 'Specialized customer service team to help you choose the right products' },
      ],
      stats: [
        { value: '10,000+', label: 'Happy Customers' },
        { value: '50,000+', label: 'Orders Completed' },
        { value: '280+', label: 'Products Available' },
        { value: '40+', label: 'Brands' },
      ],
    },
  };

  const icons = [Building2, Truck, Shield, Users];
  const pageText = t[language];
  const defaultContent = defaults[language];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content?type=about`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            // Organize content by key
            const organized: AboutContent = {};
            data.data.forEach((item: any) => {
              if (item.key === 'about-intro') organized.intro = item;
              else if (item.key === 'about-mission') organized.mission = item;
              else if (item.key === 'about-vision') organized.vision = item;
              else if (item.key === 'about-stats') organized.stats = item;
              else if (item.key.startsWith('about-feature-')) {
                if (!organized.features) organized.features = [];
                organized.features.push(item);
              }
            });
            setContent(organized);
          }
        }
      } catch (error) {
        console.error('Failed to fetch about content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Get values with fallback
  const intro = content?.intro
    ? (language === 'ar' ? content.intro.contentAr : content.intro.contentEn)
    : defaultContent.intro;
  const mission = content?.mission
    ? (language === 'ar' ? content.mission.titleAr : content.mission.titleEn)
    : defaultContent.mission;
  const missionText = content?.mission
    ? (language === 'ar' ? content.mission.contentAr : content.mission.contentEn)
    : defaultContent.missionText;
  const vision = content?.vision
    ? (language === 'ar' ? content.vision.titleAr : content.vision.titleEn)
    : defaultContent.vision;
  const visionText = content?.vision
    ? (language === 'ar' ? content.vision.contentAr : content.vision.contentEn)
    : defaultContent.visionText;
  const features = content?.features?.length
    ? content.features.map((f) => ({
        title: language === 'ar' ? f.titleAr : f.titleEn,
        desc: language === 'ar' ? f.contentAr : f.contentEn,
      }))
    : defaultContent.features;
  const stats = content?.stats?.metadata?.stats || defaultContent.stats;

  return (
    <>
      <Head>
        <title>{pageText.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-primary-600 text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageText.title}</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">{pageText.subtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Intro */}
            <div className="container-custom py-12">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-lg text-gray-600 leading-relaxed">{intro}</p>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="container-custom py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{mission}</h2>
                  <p className="text-gray-600">{missionText}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{vision}</h2>
                  <p className="text-gray-600">{visionText}</p>
                </div>
              </div>
            </div>

            {/* Why Us */}
            <div className="bg-white py-12">
              <div className="container-custom">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">{pageText.whyUs}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => {
                    const Icon = icons[index % icons.length];
                    return (
                      <div key={index} className="text-center">
                        <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-7 h-7 text-primary-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-primary-600 py-12">
              <div className="container-custom">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {stats.map((stat: any, index: number) => (
                    <div key={index} className="text-center text-white">
                      <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                      <div className="text-primary-200">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
