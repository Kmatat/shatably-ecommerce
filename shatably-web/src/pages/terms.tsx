import Head from 'next/head';
import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

interface Section {
  key: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  sortOrder: number;
}

export default function TermsPage() {
  const { language } = useLanguageStore();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'الشروط والأحكام',
      lastUpdated: 'آخر تحديث: يناير 2025',
    },
    en: {
      title: 'Terms & Conditions',
      lastUpdated: 'Last updated: January 2025',
    },
  };

  // Default sections
  const defaultSections: Section[] = [
    { key: 'terms-1', sortOrder: 1, titleAr: 'مقدمة', titleEn: 'Introduction', contentAr: 'باستخدامك لموقع شطابلي، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الموقع.', contentEn: 'By using the Shatably website, you agree to these terms and conditions. If you do not agree to any part of these terms, please do not use the website.' },
    { key: 'terms-2', sortOrder: 2, titleAr: 'استخدام الموقع', titleEn: 'Website Use', contentAr: 'يجب أن يكون عمرك 18 عامًا على الأقل لاستخدام خدماتنا. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.', contentEn: 'You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account information and password.' },
    { key: 'terms-3', sortOrder: 3, titleAr: 'المنتجات والأسعار', titleEn: 'Products and Prices', contentAr: 'نحن نبذل قصارى جهدنا لعرض معلومات دقيقة عن المنتجات والأسعار. ومع ذلك، قد تحدث أخطاء. نحتفظ بالحق في تصحيح أي أخطاء وتحديث المعلومات في أي وقت.', contentEn: 'We make every effort to display accurate product information and prices. However, errors may occur. We reserve the right to correct any errors and update information at any time.' },
    { key: 'terms-4', sortOrder: 4, titleAr: 'الطلبات والدفع', titleEn: 'Orders and Payment', contentAr: 'جميع الطلبات تخضع للتوافر والتأكيد. نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب. الأسعار المعروضة بالجنيه المصري وتشمل ضريبة القيمة المضافة.', contentEn: 'All orders are subject to availability and confirmation. We reserve the right to refuse or cancel any order for any reason. Prices shown are in Egyptian Pounds and include VAT.' },
    { key: 'terms-5', sortOrder: 5, titleAr: 'التوصيل', titleEn: 'Delivery', contentAr: 'نسعى لتوصيل الطلبات في الوقت المحدد، لكن قد تحدث تأخيرات خارجة عن إرادتنا. لن نكون مسؤولين عن أي تأخير في التوصيل.', contentEn: 'We strive to deliver orders on time, but delays may occur beyond our control. We will not be liable for any delays in delivery.' },
    { key: 'terms-6', sortOrder: 6, titleAr: 'الإرجاع والاستبدال', titleEn: 'Returns and Exchanges', contentAr: 'تخضع عمليات الإرجاع والاستبدال لسياسة الإرجاع الخاصة بنا. يرجى مراجعة صفحة سياسة الإرجاع للتفاصيل.', contentEn: 'Returns and exchanges are subject to our return policy. Please review the return policy page for details.' },
    { key: 'terms-7', sortOrder: 7, titleAr: 'الملكية الفكرية', titleEn: 'Intellectual Property', contentAr: 'جميع المحتويات الموجودة على الموقع، بما في ذلك النصوص والصور والشعارات، هي ملك لشطابلي ومحمية بموجب قوانين الملكية الفكرية.', contentEn: 'All content on the website, including text, images, and logos, is the property of Shatably and is protected by intellectual property laws.' },
    { key: 'terms-8', sortOrder: 8, titleAr: 'تحديد المسؤولية', titleEn: 'Limitation of Liability', contentAr: 'لن تكون شطابلي مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة ناتجة عن استخدام خدماتنا.', contentEn: 'Shatably will not be liable for any indirect, incidental, or special damages resulting from the use of our services.' },
    { key: 'terms-9', sortOrder: 9, titleAr: 'التعديلات', titleEn: 'Modifications', contentAr: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التعديلات على هذه الصفحة مع تحديث التاريخ.', contentEn: 'We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date.' },
    { key: 'terms-10', sortOrder: 10, titleAr: 'القانون الحاكم', titleEn: 'Governing Law', contentAr: 'تخضع هذه الشروط للقانون المصري. أي نزاعات يتم حلها في المحاكم المصرية المختصة.', contentEn: 'These terms are governed by Egyptian law. Any disputes will be resolved in the competent Egyptian courts.' },
  ];

  const content = t[language];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content?type=terms`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setSections(data.data.sort((a: Section, b: Section) => a.sortOrder - b.sortOrder));
          } else {
            setSections(defaultSections);
          }
        } else {
          setSections(defaultSections);
        }
      } catch (error) {
        console.error('Failed to fetch terms:', error);
        setSections(defaultSections);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      <Head>
        <title>{content.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
            <p className="text-gray-500">{content.lastUpdated}</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div key={section.key}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      {index + 1}. {language === 'ar' ? section.titleAr : section.titleEn}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {language === 'ar' ? section.contentAr : section.contentEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
