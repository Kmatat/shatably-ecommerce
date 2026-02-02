import Head from 'next/head';
import { Truck, Clock, MapPin, Package, CheckCircle } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

export default function ShippingPage() {
  const { language } = useLanguageStore();

  const t = {
    ar: {
      title: 'سياسة الشحن والتوصيل',
      subtitle: 'نوصل مواد البناء إلى موقعك',
      expressTitle: 'التوصيل السريع',
      expressDesc: 'توصيل خلال 3 ساعات في القاهرة الكبرى',
      expressFee: 'رسوم التوصيل: 150 جنيه',
      scheduledTitle: 'التوصيل المجدول',
      scheduledDesc: 'اختر الموعد المناسب لك',
      scheduledFee: 'رسوم التوصيل: 100 جنيه',
      freeTitle: 'توصيل مجاني',
      freeDesc: 'للطلبات أكثر من 10,000 جنيه',
      freeCondition: 'على التوصيل المجدول فقط',
      areas: 'مناطق التوصيل',
      areasText: 'نوصل لجميع محافظات مصر. التوصيل السريع متاح في:',
      areasList: ['القاهرة', 'الجيزة', '6 أكتوبر', 'الشيخ زايد', 'التجمع الخامس', 'مدينة نصر', 'المعادي', 'حلوان'],
      otherAreas: 'للمحافظات الأخرى، يتم التوصيل خلال 2-5 أيام عمل.',
      tracking: 'تتبع الطلب',
      trackingText: 'يمكنك تتبع طلبك من خلال حسابك أو عبر رسائل SMS التي سنرسلها لك.',
      notes: 'ملاحظات مهمة',
      notesList: [
        'يتم التواصل معك قبل التوصيل لتأكيد الموعد',
        'يرجى التأكد من وجود شخص لاستلام الطلب',
        'للطلبات الكبيرة قد يتطلب الأمر أكثر من رحلة توصيل',
        'رسوم إضافية قد تطبق للأدوار العليا بدون مصعد',
      ],
    },
    en: {
      title: 'Shipping & Delivery Policy',
      subtitle: 'We deliver building materials to your location',
      expressTitle: 'Express Delivery',
      expressDesc: 'Delivery within 3 hours in Greater Cairo',
      expressFee: 'Delivery fee: 150 EGP',
      scheduledTitle: 'Scheduled Delivery',
      scheduledDesc: 'Choose a time that suits you',
      scheduledFee: 'Delivery fee: 100 EGP',
      freeTitle: 'Free Delivery',
      freeDesc: 'For orders over 10,000 EGP',
      freeCondition: 'On scheduled delivery only',
      areas: 'Delivery Areas',
      areasText: 'We deliver to all governorates in Egypt. Express delivery is available in:',
      areasList: ['Cairo', 'Giza', '6th of October', 'Sheikh Zayed', '5th Settlement', 'Nasr City', 'Maadi', 'Helwan'],
      otherAreas: 'For other governorates, delivery takes 2-5 business days.',
      tracking: 'Order Tracking',
      trackingText: 'You can track your order through your account or via SMS notifications we send you.',
      notes: 'Important Notes',
      notesList: [
        'We will contact you before delivery to confirm the time',
        'Please ensure someone is available to receive the order',
        'Large orders may require multiple delivery trips',
        'Additional fees may apply for upper floors without elevator',
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
            <p className="text-lg text-gray-600">{content.subtitle}</p>
          </div>

          {/* Delivery Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{content.expressTitle}</h3>
              <p className="text-sm text-gray-600 mb-3">{content.expressDesc}</p>
              <p className="text-sm font-medium text-primary-600">{content.expressFee}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{content.scheduledTitle}</h3>
              <p className="text-sm text-gray-600 mb-3">{content.scheduledDesc}</p>
              <p className="text-sm font-medium text-primary-600">{content.scheduledFee}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{content.freeTitle}</h3>
              <p className="text-sm text-gray-600 mb-3">{content.freeDesc}</p>
              <p className="text-sm text-gray-500">{content.freeCondition}</p>
            </div>
          </div>

          {/* Delivery Areas */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">{content.areas}</h2>
            </div>
            <p className="text-gray-600 mb-4">{content.areasText}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {content.areasList.map((area, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">{content.otherAreas}</p>
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.tracking}</h2>
            <p className="text-gray-600">{content.trackingText}</p>
          </div>

          {/* Notes */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.notes}</h2>
            <ul className="space-y-3">
              {content.notesList.map((note, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
