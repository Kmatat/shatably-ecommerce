import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Clock,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { Header, Footer } from '@/components';
import { useLanguageStore, useAuthStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type UploadStatus = 'idle' | 'uploading' | 'submitted';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function UploadListPage() {
  const { language } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const content = {
    ar: {
      title: 'رفع قائمة المواد',
      subtitle: 'ارفع قائمة المواد المطلوبة وسيقوم فريقنا بإضافتها لسلتك خلال 2-4 ساعات',
      uploadTitle: 'ارفع ملف القائمة',
      uploadDesc: 'PDF, Excel, Word أو صورة',
      dragDrop: 'اسحب الملف هنا أو',
      browse: 'اختر من جهازك',
      maxSize: 'الحد الأقصى: 10 ميجابايت',
      notesLabel: 'ملاحظات إضافية (اختياري)',
      notesPlaceholder: 'أي تفاصيل أو توضيحات تساعدنا في فهم طلبك بشكل أفضل...',
      submit: 'إرسال القائمة',
      submitting: 'جاري الإرسال...',
      loginRequired: 'يرجى تسجيل الدخول أولاً',
      login: 'تسجيل الدخول',
      successTitle: 'تم إرسال القائمة بنجاح!',
      successDesc: 'سيقوم فريقنا بمراجعة قائمتك وإضافة المنتجات لسلتك. ستصلك رسالة عند جاهزية السلة.',
      estimatedTime: 'الوقت المتوقع',
      hours: '2-4 ساعات',
      trackStatus: 'تتبع حالة الطلب',
      uploadAnother: 'رفع قائمة أخرى',
      howItWorks: 'كيف تعمل الخدمة؟',
      step1Title: 'ارفع القائمة',
      step1Desc: 'ارفع صورة أو ملف لقائمة المواد المطلوبة',
      step2Title: 'نراجع ونجهز',
      step2Desc: 'فريقنا يراجع القائمة ويضيف المنتجات لسلتك',
      step3Title: 'تراجع وتطلب',
      step3Desc: 'راجع السلة، عدّل إذا لزم، وأكمل الطلب',
      acceptedFormats: 'الصيغ المقبولة',
      removeFile: 'إزالة الملف',
    },
    en: {
      title: 'Upload Material List',
      subtitle: 'Upload your material list and our team will add items to your cart within 2-4 hours',
      uploadTitle: 'Upload Your List',
      uploadDesc: 'PDF, Excel, Word or Image',
      dragDrop: 'Drag and drop here or',
      browse: 'browse from device',
      maxSize: 'Maximum size: 10MB',
      notesLabel: 'Additional Notes (optional)',
      notesPlaceholder: 'Any details or clarifications that help us understand your request better...',
      submit: 'Submit List',
      submitting: 'Submitting...',
      loginRequired: 'Please login first',
      login: 'Login',
      successTitle: 'List Submitted Successfully!',
      successDesc: 'Our team will review your list and add products to your cart. You will receive a notification when ready.',
      estimatedTime: 'Estimated Time',
      hours: '2-4 hours',
      trackStatus: 'Track Status',
      uploadAnother: 'Upload Another List',
      howItWorks: 'How It Works',
      step1Title: 'Upload List',
      step1Desc: 'Upload an image or file of your material list',
      step2Title: 'We Review & Prepare',
      step2Desc: 'Our team reviews the list and adds products to your cart',
      step3Title: 'Review & Order',
      step3Desc: 'Review your cart, modify if needed, and complete your order',
      acceptedFormats: 'Accepted Formats',
      removeFile: 'Remove file',
    },
  };

  const t = content[language];

  const acceptedTypes = [
    { ext: 'PDF', icon: FileText, color: 'text-red-500' },
    { ext: 'Excel', icon: FileSpreadsheet, color: 'text-green-500' },
    { ext: 'Word', icon: File, color: 'text-blue-500' },
    { ext: 'Image', icon: ImageIcon, color: 'text-purple-500' },
  ];

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(language === 'ar' ? 'الملف كبير جداً' : 'File is too large');
      return;
    }
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!uploadedFile) return;

    setStatus('uploading');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStatus('submitted');
  };

  const handleReset = () => {
    setStatus('idle');
    setUploadedFile(null);
    setNotes('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t.title}
              </h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>

            {status === 'submitted' ? (
              /* Success State */
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.successTitle}
                </h2>
                <p className="text-gray-600 mb-6">{t.successDesc}</p>

                <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg mb-8">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{t.estimatedTime}: {t.hours}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/orders" className="btn-primary">
                    {t.trackStatus}
                  </Link>
                  <button onClick={handleReset} className="btn-outline">
                    {t.uploadAnother}
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Form */
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                {/* Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                    isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400',
                    uploadedFile && 'border-green-500 bg-green-50'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
                    onChange={handleInputChange}
                    className="hidden"
                  />

                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="w-12 h-12 text-green-500" />
                      <div className="text-start">
                        <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        {t.dragDrop}{' '}
                        <span className="text-primary-600 font-medium">{t.browse}</span>
                      </p>
                      <p className="text-sm text-gray-400">{t.maxSize}</p>
                    </>
                  )}
                </div>

                {/* Accepted formats */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <span className="text-sm text-gray-500">{t.acceptedFormats}:</span>
                  <div className="flex items-center gap-2">
                    {acceptedTypes.map((type) => (
                      <div
                        key={type.ext}
                        className="flex items-center gap-1 text-sm text-gray-600"
                      >
                        <type.icon className={cn('w-4 h-4', type.color)} />
                        <span>{type.ext}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.notesLabel}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    rows={4}
                    className="input resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!uploadedFile || status === 'uploading'}
                  className="btn-primary w-full mt-6 py-3 text-lg"
                >
                  {status === 'uploading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin me-2" />
                      {t.submitting}
                    </>
                  ) : (
                    t.submit
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    {t.loginRequired}{' '}
                    <button
                      onClick={() => openAuthModal('login')}
                      className="text-primary-600 font-medium hover:text-primary-700"
                    >
                      {t.login}
                    </button>
                  </p>
                )}
              </div>
            )}

            {/* How it works */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
                {t.howItWorks}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: 1, title: t.step1Title, desc: t.step1Desc, icon: Upload },
                  { step: 2, title: t.step2Title, desc: t.step2Desc, icon: Clock },
                  { step: 3, title: t.step3Title, desc: t.step3Desc, icon: CheckCircle },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="relative inline-flex">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <item.icon className="w-8 h-8 text-primary-600" />
                      </div>
                      <span className="absolute -top-1 -end-1 w-6 h-6 bg-primary-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-4 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
