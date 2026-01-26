import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
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
  MoreVertical,
  ShoppingCart,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguageStore } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';

// Mock material lists data
const mockMaterialLists = [
  {
    id: 'ML-001',
    customer: { name: 'محمد أحمد', phone: '01012345678' },
    fileName: 'قائمة_مواد_فيلا.pdf',
    fileType: 'pdf',
    notes: 'فيلا 300 متر، التجمع الخامس',
    status: 'pending',
    assignedTo: null,
    createdAt: '2024-01-25T10:30:00',
  },
  {
    id: 'ML-002',
    customer: { name: 'سارة محمود', phone: '01098765432' },
    fileName: 'material_list.xlsx',
    fileType: 'xlsx',
    notes: 'شقة 150 متر تشطيب كامل',
    status: 'processing',
    assignedTo: 'أحمد علي',
    createdAt: '2024-01-25T09:15:00',
  },
  {
    id: 'ML-003',
    customer: { name: 'عمر حسن', phone: '01112223334' },
    fileName: 'photo_list.jpg',
    fileType: 'image',
    notes: '',
    status: 'ready',
    assignedTo: 'محمد سعيد',
    createdAt: '2024-01-24T16:45:00',
  },
  {
    id: 'ML-004',
    customer: { name: 'فاطمة علي', phone: '01556667778' },
    fileName: 'requirements.docx',
    fileType: 'docx',
    notes: 'مطلوب أسعار تنافسية',
    status: 'completed',
    assignedTo: 'أحمد علي',
    createdAt: '2024-01-24T14:20:00',
  },
];

type ListStatus = 'all' | 'pending' | 'processing' | 'ready' | 'completed';

export default function AdminMaterialListsPage() {
  const { language } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListStatus>('all');

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
      assignedTo: 'مسؤول المراجعة',
      date: 'التاريخ',
      actions: 'إجراءات',
      viewFile: 'عرض الملف',
      startProcessing: 'بدء المراجعة',
      viewCart: 'عرض السلة',
      markReady: 'جاهز للمراجعة',
      complete: 'إتمام',
      statuses: {
        pending: 'بانتظار المراجعة',
        processing: 'جاري المراجعة',
        ready: 'جاهز',
        completed: 'مكتمل',
      },
      noLists: 'لا توجد قوائم',
      unassigned: 'غير محدد',
      noNotes: 'لا توجد ملاحظات',
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
      assignedTo: 'Assigned To',
      date: 'Date',
      actions: 'Actions',
      viewFile: 'View File',
      startProcessing: 'Start Processing',
      viewCart: 'View Cart',
      markReady: 'Mark Ready',
      complete: 'Complete',
      statuses: {
        pending: 'Pending Review',
        processing: 'Processing',
        ready: 'Ready',
        completed: 'Completed',
      },
      noLists: 'No material lists found',
      unassigned: 'Unassigned',
      noNotes: 'No notes',
    },
  };

  const t = content[language];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    processing: Play,
    ready: CheckCircle,
    completed: CheckCircle,
  };

  const fileTypeIcons: Record<string, string> = {
    pdf: '📄',
    xlsx: '📊',
    docx: '📝',
    image: '🖼️',
  };

  const filteredLists = mockMaterialLists.filter((list) => {
    const matchesSearch =
      list.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || list.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          </div>
        </div>

        {/* Lists Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.listId}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.customer}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.file}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.notes}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.status}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.assignedTo}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.date}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLists.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      {t.noLists}
                    </td>
                  </tr>
                ) : (
                  filteredLists.map((list) => {
                    const StatusIcon = statusIcons[list.status];
                    return (
                      <tr key={list.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <span className="font-medium text-primary-600">{list.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{list.customer.name}</p>
                            <p className="text-sm text-gray-500">{list.customer.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{fileTypeIcons[list.fileType]}</span>
                            <span className="text-sm text-gray-600 max-w-[150px] truncate">
                              {list.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600 max-w-[200px] truncate">
                            {list.notes || <span className="text-gray-400 italic">{t.noNotes}</span>}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', statusColors[list.status])}>
                            <StatusIcon className="w-3 h-3" />
                            {t.statuses[list.status as keyof typeof t.statuses]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {list.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-primary-600" />
                              </div>
                              <span className="text-sm">{list.assignedTo}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">{t.unassigned}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(list.createdAt, language)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg" title={t.viewFile}>
                              <Download className="w-4 h-4 text-gray-500" />
                            </button>
                            {list.status === 'pending' && (
                              <button className="p-2 hover:bg-primary-50 rounded-lg text-primary-600" title={t.startProcessing}>
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {list.status === 'processing' && (
                              <button className="p-2 hover:bg-green-50 rounded-lg text-green-600" title={t.markReady}>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {(list.status === 'ready' || list.status === 'completed') && (
                              <button className="p-2 hover:bg-gray-100 rounded-lg" title={t.viewCart}>
                                <ShoppingCart className="w-4 h-4 text-gray-500" />
                              </button>
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
        </div>
      </AdminLayout>
    </>
  );
}
