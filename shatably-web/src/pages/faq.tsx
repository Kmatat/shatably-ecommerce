import Head from 'next/head';
import { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface FAQ {
  key: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
}

export default function FAQPage() {
  const { language } = useLanguageStore();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const t = {
    ar: {
      title: 'الأسئلة الشائعة',
      subtitle: 'إجابات على أكثر الأسئلة شيوعاً',
      noFaqs: 'لا توجد أسئلة متاحة حالياً',
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to the most common questions',
      noFaqs: 'No FAQs available at the moment',
    },
  };

  const content = t[language];

  // Default FAQs if API fails
  const defaultFaqs: FAQ[] = [
    {
      key: 'delivery',
      titleAr: 'ما هي مناطق التوصيل؟',
      titleEn: 'What are the delivery areas?',
      contentAr: 'نوصل لجميع محافظات مصر. التوصيل السريع متاح في القاهرة الكبرى خلال 3 ساعات.',
      contentEn: 'We deliver to all governorates in Egypt. Express delivery is available in Greater Cairo within 3 hours.',
    },
    {
      key: 'payment',
      titleAr: 'ما هي طرق الدفع المتاحة؟',
      titleEn: 'What payment methods are available?',
      contentAr: 'نقبل الدفع نقداً عند الاستلام، بطاقات الائتمان (فيزا/ماستركارد)، فوري، والمحافظ الإلكترونية.',
      contentEn: 'We accept cash on delivery, credit cards (Visa/Mastercard), Fawry, and mobile wallets.',
    },
    {
      key: 'returns',
      titleAr: 'ما هي سياسة الإرجاع؟',
      titleEn: 'What is the return policy?',
      contentAr: 'يمكنك إرجاع المنتجات خلال 7 أيام من الاستلام بشرط أن تكون في حالتها الأصلية وبدون فتح.',
      contentEn: 'You can return products within 7 days of delivery, provided they are in original condition and unopened.',
    },
    {
      key: 'bulk',
      titleAr: 'هل يوجد خصم على الكميات الكبيرة؟',
      titleEn: 'Is there a discount for bulk orders?',
      contentAr: 'نعم، نقدم أسعار خاصة للكميات الكبيرة والمقاولين. تواصل معنا للحصول على عرض سعر.',
      contentEn: 'Yes, we offer special prices for bulk orders and contractors. Contact us for a quote.',
    },
    {
      key: 'warranty',
      titleAr: 'هل المنتجات عليها ضمان؟',
      titleEn: 'Do products have a warranty?',
      contentAr: 'نعم، جميع منتجاتنا أصلية ومضمونة. فترة الضمان تختلف حسب المنتج والعلامة التجارية.',
      contentEn: 'Yes, all our products are genuine and guaranteed. Warranty period varies by product and brand.',
    },
    {
      key: 'material-list',
      titleAr: 'كيف يعمل نظام رفع قائمة المواد؟',
      titleEn: 'How does the material list upload system work?',
      contentAr: 'يمكنك رفع قائمة المواد الخاصة بك (صورة أو PDF) وسيقوم فريقنا بتجهيز طلبك وإضافته للسلة.',
      contentEn: 'You can upload your material list (image or PDF) and our team will prepare your order and add it to your cart.',
    },
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content?type=faq`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setFaqs(data.data);
          } else {
            setFaqs(defaultFaqs);
          }
        } else {
          setFaqs(defaultFaqs);
        }
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        setFaqs(defaultFaqs);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <>
      <Head>
        <title>{content.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
            <p className="text-lg text-gray-600">{content.subtitle}</p>
          </div>

          {/* FAQs */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">{content.noFaqs}</div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={faq.key} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-start"
                  >
                    <span className="font-medium text-gray-900">
                      {language === 'ar' ? faq.titleAr : faq.titleEn}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-gray-500 transition-transform',
                        openIndex === index && 'rotate-180'
                      )}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 text-gray-600">
                      {language === 'ar' ? faq.contentAr : faq.contentEn}
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
