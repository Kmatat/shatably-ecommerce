import Head from 'next/head';
import { FileText } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

export default function TermsPage() {
  const { language } = useLanguageStore();

  const t = {
    ar: {
      title: 'الشروط والأحكام',
      lastUpdated: 'آخر تحديث: يناير 2025',
      sections: [
        {
          title: 'مقدمة',
          content: 'باستخدامك لموقع شطابلي، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الموقع.',
        },
        {
          title: 'استخدام الموقع',
          content: 'يجب أن يكون عمرك 18 عامًا على الأقل لاستخدام خدماتنا. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.',
        },
        {
          title: 'المنتجات والأسعار',
          content: 'نحن نبذل قصارى جهدنا لعرض معلومات دقيقة عن المنتجات والأسعار. ومع ذلك، قد تحدث أخطاء. نحتفظ بالحق في تصحيح أي أخطاء وتحديث المعلومات في أي وقت.',
        },
        {
          title: 'الطلبات والدفع',
          content: 'جميع الطلبات تخضع للتوافر والتأكيد. نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب. الأسعار المعروضة بالجنيه المصري وتشمل ضريبة القيمة المضافة.',
        },
        {
          title: 'التوصيل',
          content: 'نسعى لتوصيل الطلبات في الوقت المحدد، لكن قد تحدث تأخيرات خارجة عن إرادتنا. لن نكون مسؤولين عن أي تأخير في التوصيل.',
        },
        {
          title: 'الإرجاع والاستبدال',
          content: 'تخضع عمليات الإرجاع والاستبدال لسياسة الإرجاع الخاصة بنا. يرجى مراجعة صفحة سياسة الإرجاع للتفاصيل.',
        },
        {
          title: 'الملكية الفكرية',
          content: 'جميع المحتويات الموجودة على الموقع، بما في ذلك النصوص والصور والشعارات، هي ملك لشطابلي ومحمية بموجب قوانين الملكية الفكرية.',
        },
        {
          title: 'تحديد المسؤولية',
          content: 'لن تكون شطابلي مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة ناتجة عن استخدام خدماتنا.',
        },
        {
          title: 'التعديلات',
          content: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التعديلات على هذه الصفحة مع تحديث التاريخ.',
        },
        {
          title: 'القانون الحاكم',
          content: 'تخضع هذه الشروط للقانون المصري. أي نزاعات يتم حلها في المحاكم المصرية المختصة.',
        },
      ],
    },
    en: {
      title: 'Terms & Conditions',
      lastUpdated: 'Last updated: January 2025',
      sections: [
        {
          title: 'Introduction',
          content: 'By using the Shatably website, you agree to these terms and conditions. If you do not agree to any part of these terms, please do not use the website.',
        },
        {
          title: 'Website Use',
          content: 'You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account information and password.',
        },
        {
          title: 'Products and Prices',
          content: 'We make every effort to display accurate product information and prices. However, errors may occur. We reserve the right to correct any errors and update information at any time.',
        },
        {
          title: 'Orders and Payment',
          content: 'All orders are subject to availability and confirmation. We reserve the right to refuse or cancel any order for any reason. Prices shown are in Egyptian Pounds and include VAT.',
        },
        {
          title: 'Delivery',
          content: 'We strive to deliver orders on time, but delays may occur beyond our control. We will not be liable for any delays in delivery.',
        },
        {
          title: 'Returns and Exchanges',
          content: 'Returns and exchanges are subject to our return policy. Please review the return policy page for details.',
        },
        {
          title: 'Intellectual Property',
          content: 'All content on the website, including text, images, and logos, is the property of Shatably and is protected by intellectual property laws.',
        },
        {
          title: 'Limitation of Liability',
          content: 'Shatably will not be liable for any indirect, incidental, or special damages resulting from the use of our services.',
        },
        {
          title: 'Modifications',
          content: 'We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date.',
        },
        {
          title: 'Governing Law',
          content: 'These terms are governed by Egyptian law. Any disputes will be resolved in the competent Egyptian courts.',
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
              <FileText className="w-8 h-8 text-primary-600" />
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
