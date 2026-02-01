import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  User,
  Download,
  Eye,
  Play,
  ChevronDown,
  ShoppingCart,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface MaterialList {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  notes: string | null;
  status: string;
  assignedTo: string | null;
  processedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
}

type ListStatus = 'all' | 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';

export default function AdminMaterialListsPage() {
  const { language } = useLanguageStore();
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListStatus>('all');
  const [materialLists, setMaterialLists] = useState<MaterialList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const content = {
    ar: {
      title: 'قوائم المواد',
      search: 'بحث بالرقم أو اسم العميل...',
      allStatuses: 'جميع الحالات',
      listId: 'رقم القائمة',
      customer: 'العميل',
      file: 'الملف',
      notes: 'ملاحظات',
      status: 'الحالة',
      date: 'التاريخ',
      actions: 'إجراءات',
      viewFile: 'عرض الملف',
      review: 'مراجعة',
      viewCart: 'عرض السلة',
      statuses: {
        pending: 'بانتظار المراجعة',
        processing: 'جاري المراجعة',
        ready: 'جاهز',
        completed: 'مكتمل',
        cancelled: 'ملغي',
      },
      noLists: 'لا توجد قوائم',
      noNotes: 'لا توجد ملاحظات',
      refresh: 'تحديث',
      loadError: 'حدث خطأ أثناء تحميل البيانات',
    },
    en: {
      title: 'Material Lists',
      search: 'Search by ID or customer name...',
      allStatuses: 'All Statuses',
      listId: 'List ID',
      customer: 'Customer',
      file: 'File',
      notes: 'Notes',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      viewFile: 'View File',
      review: 'Review',
      viewCart: 'View Cart',
      statuses: {
        pending: 'Pending Review',
        processing: 'Processing',
        ready: 'Ready',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      noLists: 'No material lists found',
      noNotes: 'No notes',
      refresh: 'Refresh',
      loadError: 'Error loading data',
    },
  };

  const t = content[language];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    processing: Play,
    ready: CheckCircle,
    completed: CheckCircle,
    cancelled: Clock,
  };

  const fileTypeIcons: Record<string, string> = {
    pdf: '📄',
    xlsx: '📊',
    xls: '📊',
    docx: '📝',
    doc: '📝',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
  };

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return fileTypeIcons[ext] || '📄';
  };

  const fetchMaterialLists = async (currentToken: string | null, currentStatus: string, currentSearch: string) => {
    if (!currentToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentStatus !== 'all') params.append('status', currentStatus);
      if (currentSearch) params.append('search', currentSearch);

      const response = await fetch(
        `${API_URL}/admin/material-lists?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch material lists');

      const data = await response.json();
      setMaterialLists(data.data || []);
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading data');
      console.error('Error fetching material lists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when token/statusFilter changes
  useEffect(() => {
    fetchMaterialLists(token, statusFilter, searchQuery);
  }, [token, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) fetchMaterialLists(token, statusFilter, searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchMaterialLists(token, statusFilter, searchQuery);
  };

  const filteredLists = materialLists.filter((list) => {
    const matchesSearch =
      list.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      list.user.phone.includes(searchQuery);
    return matchesSearch;
  });

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي - لوحة التحكم' : 'Shatably Admin'}</title>
      </Head>

      <AdminLayout title={t.title}>
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full ps-10 pe-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ListStatus)}
                className="appearance-none px-4 py-2.5 pe-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t.allStatuses}</option>
                {Object.entries(t.statuses).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
              {t.refresh}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Lists Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.listId}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.customer}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.file}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.notes}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.status}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.date}</th>
                    <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLists.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        {t.noLists}
                      </td>
                    </tr>
                  ) : (
                    filteredLists.map((list) => {
                      const StatusIcon = statusIcons[list.status] || Clock;
                      return (
                        <tr key={list.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <span className="font-medium text-primary-600">
                              {list.id.slice(0, 8)}...
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {list.user.name || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500" dir="ltr">
                                {list.user.phone}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">
                                {getFileTypeIcon(list.fileName)}
                              </span>
                              <span className="text-sm text-gray-600 max-w-[150px] truncate">
                                {list.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600 max-w-[200px] truncate">
                              {list.notes || (
                                <span className="text-gray-400 italic">{t.noNotes}</span>
                              )}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                                statusColors[list.status] || statusColors.pending
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {t.statuses[list.status as keyof typeof t.statuses] ||
                                list.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(list.createdAt, language)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={list.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title={t.viewFile}
                              >
                                <Download className="w-4 h-4 text-gray-500" />
                              </a>
                              {(list.status === 'pending' ||
                                list.status === 'processing') && (
                                <Link
                                  href={`/admin/material-lists/${list.id}`}
                                  className="p-2 hover:bg-primary-50 rounded-lg text-primary-600"
                                  title={t.review}
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              )}
                              {(list.status === 'ready' ||
                                list.status === 'completed') && (
                                <Link
                                  href={`/admin/material-lists/${list.id}`}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                  title={t.viewCart}
                                >
                                  <ShoppingCart className="w-4 h-4 text-gray-500" />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
