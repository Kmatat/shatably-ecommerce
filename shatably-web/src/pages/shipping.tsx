import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Truck, Clock, MapPin, Package, CheckCircle, Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore } from '@/lib/store';

interface ShippingContent {
  expressDelivery?: any;
  scheduledDelivery?: any;
  freeDelivery?: any;
  areas?: any;
  tracking?: any;
  notes?: any;
}

export default function ShippingPage() {
  const { language } = useLanguageStore();
  const [content, setContent] = useState<ShippingContent | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'سياسة الشحن والتوصيل',
      subtitle: 'نوصل مواد البناء إلى موقعك',
    },
    en: {
      title: 'Shipping & Delivery Policy',
      subtitle: 'We deliver building materials to your location',
    },
  };

  // Default content
  const defaults = {
    ar: {
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

  const pageText = t[language];
  const defaultContent = defaults[language];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content?type=shipping`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const organized: ShippingContent = {};
            data.data.forEach((item: any) => {
              if (item.key === 'shipping-express') organized.expressDelivery = item;
              else if (item.key === 'shipping-scheduled') organized.scheduledDelivery = item;
              else if (item.key === 'shipping-free') organized.freeDelivery = item;
              else if (item.key === 'shipping-areas') organized.areas = item;
              else if (item.key === 'shipping-tracking') organized.tracking = item;
              else if (item.key === 'shipping-notes') organized.notes = item;
            });
            setContent(organized);
          }
        }
      } catch (error) {
        console.error('Failed to fetch shipping content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Get values with fallback
  const expressTitle = content?.expressDelivery
    ? (language === 'ar' ? content.expressDelivery.titleAr : content.expressDelivery.titleEn)
    : defaultContent.expressTitle;
  const expressDesc = content?.expressDelivery
    ? (language === 'ar' ? content.expressDelivery.contentAr : content.expressDelivery.contentEn)
    : defaultContent.expressDesc;
  const expressFee = content?.expressDelivery?.metadata?.fee || defaultContent.expressFee;

  const scheduledTitle = content?.scheduledDelivery
    ? (language === 'ar' ? content.scheduledDelivery.titleAr : content.scheduledDelivery.titleEn)
    : defaultContent.scheduledTitle;
  const scheduledDesc = content?.scheduledDelivery
    ? (language === 'ar' ? content.scheduledDelivery.contentAr : content.scheduledDelivery.contentEn)
    : defaultContent.scheduledDesc;
  const scheduledFee = content?.scheduledDelivery?.metadata?.fee || defaultContent.scheduledFee;

  const freeTitle = content?.freeDelivery
    ? (language === 'ar' ? content.freeDelivery.titleAr : content.freeDelivery.titleEn)
    : defaultContent.freeTitle;
  const freeDesc = content?.freeDelivery
    ? (language === 'ar' ? content.freeDelivery.contentAr : content.freeDelivery.contentEn)
    : defaultContent.freeDesc;
  const freeCondition = content?.freeDelivery?.metadata?.condition || defaultContent.freeCondition;

  const areasTitle = content?.areas
    ? (language === 'ar' ? content.areas.titleAr : content.areas.titleEn)
    : defaultContent.areas;
  const areasText = content?.areas
    ? (language === 'ar' ? content.areas.contentAr : content.areas.contentEn)
    : defaultContent.areasText;
  const areasList = content?.areas?.metadata?.areas || defaultContent.areasList;
  const otherAreas = content?.areas?.metadata?.otherAreas || defaultContent.otherAreas;

  const trackingTitle = content?.tracking
    ? (language === 'ar' ? content.tracking.titleAr : content.tracking.titleEn)
    : defaultContent.tracking;
  const trackingText = content?.tracking
    ? (language === 'ar' ? content.tracking.contentAr : content.tracking.contentEn)
    : defaultContent.trackingText;

  const notesTitle = content?.notes
    ? (language === 'ar' ? content.notes.titleAr : content.notes.titleEn)
    : defaultContent.notes;
  const notesList = content?.notes?.metadata?.notes || defaultContent.notesList;

  return (
    <>
      <Head>
        <title>{pageText.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{pageText.title}</h1>
            <p className="text-lg text-gray-600">{pageText.subtitle}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* Delivery Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{expressTitle}</h3>
                  <p className="text-sm text-gray-600 mb-3">{expressDesc}</p>
                  <p className="text-sm font-medium text-primary-600">{expressFee}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{scheduledTitle}</h3>
                  <p className="text-sm text-gray-600 mb-3">{scheduledDesc}</p>
                  <p className="text-sm font-medium text-primary-600">{scheduledFee}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{freeTitle}</h3>
                  <p className="text-sm text-gray-600 mb-3">{freeDesc}</p>
                  <p className="text-sm text-gray-500">{freeCondition}</p>
                </div>
              </div>

              {/* Delivery Areas */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{areasTitle}</h2>
                </div>
                <p className="text-gray-600 mb-4">{areasText}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {areasList.map((area: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">{otherAreas}</p>
              </div>

              {/* Tracking */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{trackingTitle}</h2>
                <p className="text-gray-600">{trackingText}</p>
              </div>

              {/* Notes */}
              <div className="bg-yellow-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{notesTitle}</h2>
                <ul className="space-y-3">
                  {notesList.map((note: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
