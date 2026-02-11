import Head from 'next/head';
import { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Loader2,
  Trash2,
  Download,
  X,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export default function AdminUploadsPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    ar: {
      title: 'رفع الصور',
      subtitle: 'ارفع صور المنتجات هنا واحصل على الروابط لاستخدامها في ملف الاستيراد',
      dropzone: 'اسحب الصور هنا أو اضغط للاختيار',
      formats: 'JPG, PNG, WebP, GIF - حتى 10 ميجا للصورة',
      uploading: 'جاري الرفع...',
      uploaded: 'الصور المرفوعة',
      copyUrl: 'نسخ الرابط',
      copied: 'تم النسخ!',
      copyAll: 'نسخ جميع الروابط',
      clear: 'مسح الكل',
      noUploads: 'لم يتم رفع صور بعد',
      fileCount: 'صورة',
      downloadList: 'تحميل قائمة الروابط',
    },
    en: {
      title: 'Image Uploads',
      subtitle: 'Upload product images here and get URLs to use in your import sheet',
      dropzone: 'Drag images here or click to select',
      formats: 'JPG, PNG, WebP, GIF - up to 10MB per file',
      uploading: 'Uploading...',
      uploaded: 'Uploaded Images',
      copyUrl: 'Copy URL',
      copied: 'Copied!',
      copyAll: 'Copy All URLs',
      clear: 'Clear All',
      noUploads: 'No images uploaded yet',
      fileCount: 'images',
      downloadList: 'Download URL List',
    },
  };

  const content = t[language];

  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploads((prev) => [...prev, ...(data.data || [])]);
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const copyAllUrls = () => {
    const allUrls = uploads.map((u) => u.url).join('\n');
    navigator.clipboard.writeText(allUrls);
    setCopiedUrl('all');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const downloadUrlList = () => {
    const content = 'Original Name,URL\n' + uploads.map((u) => `${u.originalName},${u.url}`).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-urls-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Head>
        <title>{content.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}</title>
      </Head>

      <AdminLayout title={content.title}>
        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-gray-600 mb-4">{content.subtitle}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
          />

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors',
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50',
              uploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-3" />
                <p className="text-lg font-medium text-gray-700">{content.uploading}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium text-gray-700">{content.dropzone}</p>
                <p className="text-sm text-gray-500 mt-1">{content.formats}</p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Files */}
        {uploads.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {content.uploaded} ({uploads.length} {content.fileCount})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadUrlList}
                  className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  {content.downloadList}
                </button>
                <button
                  onClick={copyAllUrls}
                  className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  {copiedUrl === 'all' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copiedUrl === 'all' ? content.copied : content.copyAll}
                </button>
                <button
                  onClick={() => setUploads([])}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {content.clear}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {uploads.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                    <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                    <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                    <p className="text-xs text-primary-600 truncate mt-1 font-mono">{file.url}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50"
                    >
                      {copiedUrl === file.url ? (
                        <><Check className="w-4 h-4 text-green-500" />{content.copied}</>
                      ) : (
                        <><Copy className="w-4 h-4" />{content.copyUrl}</>
                      )}
                    </button>
                    <button
                      onClick={() => removeUpload(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploads.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{content.noUploads}</p>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
