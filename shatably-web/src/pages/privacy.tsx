import Head from 'next/head';
import { Shield } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

export default function PrivacyPage() {
  const { language } = useLanguageStore();

  const t = {
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: يناير 2025',
      sections: [
        {
          title: 'مقدمة',
          content: 'نحن في شطابلي نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.',
        },
        {
          title: 'المعلومات التي نجمعها',
          content: 'نجمع المعلومات التالية: الاسم، رقم الهاتف، البريد الإلكتروني، عنوان التوصيل، وتفاصيل الطلبات. قد نجمع أيضًا معلومات تقنية مثل عنوان IP ونوع المتصفح.',
        },
        {
          title: 'كيف نستخدم معلوماتك',
          content: 'نستخدم معلوماتك لمعالجة الطلبات، التواصل معك بخصوص طلباتك، تحسين خدماتنا، إرسال عروض ترويجية (بموافقتك)، والامتثال للمتطلبات القانونية.',
        },
        {
          title: 'مشاركة المعلومات',
          content: 'لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع شركات التوصيل ومزودي خدمات الدفع لتنفيذ طلباتك فقط.',
        },
        {
          title: 'أمان البيانات',
          content: 'نستخدم تدابير أمنية متقدمة لحماية معلوماتك، بما في ذلك التشفير SSL وأنظمة الحماية من الاختراق.',
        },
        {
          title: 'ملفات تعريف الارتباط (Cookies)',
          content: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع وتذكر تفضيلاتك. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من متصفحك.',
        },
        {
          title: 'حقوقك',
          content: 'لديك الحق في الوصول إلى بياناتك، تصحيحها، حذفها، أو الاعتراض على معالجتها. تواصل معنا لممارسة هذه الحقوق.',
        },
        {
          title: 'التغييرات على السياسة',
          content: 'قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.',
        },
        {
          title: 'اتصل بنا',
          content: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا على support@shatably.com أو الخط الساخن 16XXX.',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2025',
      sections: [
        {
          title: 'Introduction',
          content: 'At Shatably, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information.',
        },
        {
          title: 'Information We Collect',
          content: 'We collect the following information: name, phone number, email, delivery address, and order details. We may also collect technical information such as IP address and browser type.',
        },
        {
          title: 'How We Use Your Information',
          content: 'We use your information to process orders, communicate with you about your orders, improve our services, send promotional offers (with your consent), and comply with legal requirements.',
        },
        {
          title: 'Information Sharing',
          content: 'We do not sell your personal information to third parties. We may share your information with delivery companies and payment service providers only to fulfill your orders.',
        },
        {
          title: 'Data Security',
          content: 'We use advanced security measures to protect your information, including SSL encryption and intrusion prevention systems.',
        },
        {
          title: 'Cookies',
          content: 'We use cookies to improve your website experience and remember your preferences. You can control cookie settings from your browser.',
        },
        {
          title: 'Your Rights',
          content: 'You have the right to access, correct, delete, or object to the processing of your data. Contact us to exercise these rights.',
        },
        {
          title: 'Policy Changes',
          content: 'We may update this policy from time to time. We will notify you of any material changes via email or a notice on the website.',
        },
        {
          title: 'Contact Us',
          content: 'If you have any questions about this privacy policy, please contact us at support@shatably.com or hotline 16XXX.',
        },
      ],
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
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="space-y-8">
              {content.sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
