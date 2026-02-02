import Head from 'next/head';
import { RotateCcw, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

export default function ReturnsPage() {
  const { language } = useLanguageStore();

  const t = {
    ar: {
      title: 'سياسة الإرجاع والاستبدال',
      subtitle: 'نضمن لك تجربة شراء مريحة',
      returnPeriod: 'فترة الإرجاع',
      returnPeriodText: 'يمكنك إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام.',
      conditions: 'شروط الإرجاع',
      conditionsList: [
        'المنتج في حالته الأصلية بدون فتح أو استخدام',
        'العبوة الأصلية سليمة وغير تالفة',
        'وجود فاتورة الشراء أو رقم الطلب',
        'المنتج ليس من المنتجات المستثناة',
      ],
      excluded: 'منتجات مستثناة من الإرجاع',
      excludedList: [
        'المنتجات التي تم استخدامها أو تركيبها',
        'المنتجات المقطوعة أو المصنوعة حسب الطلب',
        'مواد البناء التي تم خلطها (مثل الدهانات المخلوطة)',
        'المنتجات التي تم تلفها بسبب سوء التخزين من قبل العميل',
      ],
      refund: 'استرداد المبلغ',
      refundText: 'يتم استرداد المبلغ خلال 7-14 يوم عمل بنفس طريقة الدفع الأصلية. للدفع عند الاستلام، يتم التحويل البنكي.',
      exchange: 'الاستبدال',
      exchangeText: 'يمكنك استبدال المنتج بمنتج آخر بنفس القيمة أو دفع الفرق إن وجد.',
      process: 'كيفية الإرجاع',
      processList: [
        'تواصل معنا عبر الخط الساخن أو من خلال حسابك',
        'أخبرنا بسبب الإرجاع ورقم الطلب',
        'سنقوم بترتيب استلام المنتج من موقعك',
        'بعد فحص المنتج، سيتم رد المبلغ',
      ],
      contact: 'للمزيد من المساعدة',
      contactText: 'تواصل مع خدمة العملاء على الخط الساخن 16XXX',
    },
    en: {
      title: 'Return & Exchange Policy',
      subtitle: 'We guarantee a comfortable shopping experience',
      returnPeriod: 'Return Period',
      returnPeriodText: 'You can return products within 7 days from the delivery date.',
      conditions: 'Return Conditions',
      conditionsList: [
        'Product in original condition, unopened and unused',
        'Original packaging intact and undamaged',
        'Purchase invoice or order number available',
        'Product is not from excluded items',
      ],
      excluded: 'Excluded Products',
      excludedList: [
        'Products that have been used or installed',
        'Cut or custom-made products',
        'Mixed building materials (such as mixed paints)',
        'Products damaged due to improper storage by customer',
      ],
      refund: 'Refund',
      refundText: 'Refunds are processed within 7-14 business days using the original payment method. For cash on delivery, bank transfer is used.',
      exchange: 'Exchange',
      exchangeText: 'You can exchange the product for another of equal value or pay the difference if applicable.',
      process: 'How to Return',
      processList: [
        'Contact us via hotline or through your account',
        'Tell us the reason for return and order number',
        'We will arrange to pick up the product from your location',
        'After product inspection, the refund will be processed',
      ],
      contact: 'Need More Help?',
      contactText: 'Contact customer service on hotline 16XXX',
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
              <RotateCcw className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
            <p className="text-lg text-gray-600">{content.subtitle}</p>
          </div>

          {/* Return Period */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">{content.returnPeriod}</h2>
            </div>
            <p className="text-gray-600">{content.returnPeriodText}</p>
          </div>

          {/* Conditions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.conditions}</h2>
            <ul className="space-y-3">
              {content.conditionsList.map((condition, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Excluded */}
          <div className="bg-red-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.excluded}</h2>
            <ul className="space-y-3">
              {content.excludedList.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Refund & Exchange */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.refund}</h2>
              <p className="text-gray-600">{content.refundText}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.exchange}</h2>
              <p className="text-gray-600">{content.exchangeText}</p>
            </div>
          </div>

          {/* Process */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.process}</h2>
            <ol className="space-y-4">
              {content.processList.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-primary-600 font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Contact */}
          <div className="bg-primary-50 rounded-xl p-6 text-center">
            <Phone className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{content.contact}</h2>
            <p className="text-gray-600">{content.contactText}</p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
