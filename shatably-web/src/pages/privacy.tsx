import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
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

export default function PrivacyPage() {
  const { language } = useLanguageStore();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: يناير 2025',
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2025',
    },
  };

  // Default sections
  const defaultSections: Section[] = [
    { key: 'privacy-1', sortOrder: 1, titleAr: 'مقدمة', titleEn: 'Introduction', contentAr: 'نحن في شطابلي نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.', contentEn: 'At Shatably, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information.' },
    { key: 'privacy-2', sortOrder: 2, titleAr: 'المعلومات التي نجمعها', titleEn: 'Information We Collect', contentAr: 'نجمع المعلومات التالية: الاسم، رقم الهاتف، البريد الإلكتروني، عنوان التوصيل، وتفاصيل الطلبات. قد نجمع أيضًا معلومات تقنية مثل عنوان IP ونوع المتصفح.', contentEn: 'We collect the following information: name, phone number, email, delivery address, and order details. We may also collect technical information such as IP address and browser type.' },
    { key: 'privacy-3', sortOrder: 3, titleAr: 'كيف نستخدم معلوماتك', titleEn: 'How We Use Your Information', contentAr: 'نستخدم معلوماتك لمعالجة الطلبات، التواصل معك بخصوص طلباتك، تحسين خدماتنا، إرسال عروض ترويجية (بموافقتك)، والامتثال للمتطلبات القانونية.', contentEn: 'We use your information to process orders, communicate with you about your orders, improve our services, send promotional offers (with your consent), and comply with legal requirements.' },
    { key: 'privacy-4', sortOrder: 4, titleAr: 'مشاركة المعلومات', titleEn: 'Information Sharing', contentAr: 'لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع شركات التوصيل ومزودي خدمات الدفع لتنفيذ طلباتك فقط.', contentEn: 'We do not sell your personal information to third parties. We may share your information with delivery companies and payment service providers only to fulfill your orders.' },
    { key: 'privacy-5', sortOrder: 5, titleAr: 'أمان البيانات', titleEn: 'Data Security', contentAr: 'نستخدم تدابير أمنية متقدمة لحماية معلوماتك، بما في ذلك التشفير SSL وأنظمة الحماية من الاختراق.', contentEn: 'We use advanced security measures to protect your information, including SSL encryption and intrusion prevention systems.' },
    { key: 'privacy-6', sortOrder: 6, titleAr: 'ملفات تعريف الارتباط (Cookies)', titleEn: 'Cookies', contentAr: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع وتذكر تفضيلاتك. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من متصفحك.', contentEn: 'We use cookies to improve your website experience and remember your preferences. You can control cookie settings from your browser.' },
    { key: 'privacy-7', sortOrder: 7, titleAr: 'حقوقك', titleEn: 'Your Rights', contentAr: 'لديك الحق في الوصول إلى بياناتك، تصحيحها، حذفها، أو الاعتراض على معالجتها. تواصل معنا لممارسة هذه الحقوق.', contentEn: 'You have the right to access, correct, delete, or object to the processing of your data. Contact us to exercise these rights.' },
    { key: 'privacy-8', sortOrder: 8, titleAr: 'التغييرات على السياسة', titleEn: 'Policy Changes', contentAr: 'قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.', contentEn: 'We may update this policy from time to time. We will notify you of any material changes via email or a notice on the website.' },
    { key: 'privacy-9', sortOrder: 9, titleAr: 'اتصل بنا', titleEn: 'Contact Us', contentAr: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا على support@shatably.com أو الخط الساخن 16XXX.', contentEn: 'If you have any questions about this privacy policy, please contact us at support@shatably.com or hotline 16XXX.' },
  ];

  const content = t[language];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content?type=privacy`);
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
        console.error('Failed to fetch privacy policy:', error);
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
              <Shield className="w-8 h-8 text-primary-600" />
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
