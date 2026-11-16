// app/admin/finance/fee-templates/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  Home,
  DollarSign,
  Search,
  UserPlus,
  X,
  Save,
} from 'lucide-react';
import { financeTemplatesAPI } from '@/lib/api/finance';
import type { FeeTemplate } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  feeTypeLabels,
} from '@/lib/utils/finance-helpers';

interface StudentForAssign {
  id: number;
  name: string;
  phone: string;
  rollNumber: string;
  selected: boolean;
  existingFee: boolean;
  feeStatus: string | null;
  feeId: number | null;
}

export default function FeeTemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = Number(params.id);

  const [template, setTemplate] = useState<FeeTemplate | null>(null);
  const [students, setStudents] = useState<StudentForAssign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const t = await financeTemplatesAPI.getById(templateId);
      setTemplate(t);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت قالب';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(templateId)) loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const openAssignModal = async () => {
    try {
      setAssignModalOpen(true);
      setAssignSearch('');
      const res = await financeTemplatesAPI.getStudents(templateId);
      setStudents(
        res.students.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone || '',
          rollNumber: s.rollNumber || `#${s.id}`,
          selected: false,
          existingFee: s.existingFee,
          feeStatus: s.feeStatus,
          feeId: s.feeId,
        }))
      );
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت لیست شاگردان';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
      setAssignModalOpen(false);
    }
  };

  const toggleStudent = (idx: number) => {
    setStudents((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, selected: !s.selected } : s))
    );
  };

  const selectAll = (checked: boolean) => {
    setStudents((prev) => prev.map((s) => ({ ...s, selected: checked })));
  };

  const handleAssign = async () => {
    const selected = students.filter((s) => s.selected);
    if (selected.length === 0) {
      setError('هیچ شاگردی انتخاب نشده');
      return;
    }

    try {
      setAssigning(true);
      setError(null);
      setSuccess(null);

      const res = await financeTemplatesAPI.assign({
        templateId,
        studentIds: selected.map((s) => s.id),
      });

      setSuccess(
        `${formatNumber(res.created)} جدید، ${formatNumber(res.updated)} بروزرسانی${
          res.errors > 0 ? `، ${res.errors} خطا` : ''
        }`
      );
      setAssignModalOpen(false);
      await loadTemplate();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در تخصیص';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!template) return null;

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
    s.phone.includes(assignSearch)
  );

  const selectedCount = students.filter((s) => s.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-500" size={26} />
            {template.name}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {template.academicYearName || '—'}
            {template.classId && ` • ${template.className}`}
          </p>
        </div>
        <button
          onClick={openAssignModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <UserPlus size={16} />
          تخصیص به شاگردان
        </button>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox
          label="اقلام"
          value={formatNumber(template.itemCount)}
          icon={FileText}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatBox
          label="شاگردان تخصیص‌یافته"
          value={formatNumber(template.assignedCount)}
          icon={Users}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatBox
          label="صنف"
          value={template.classId ? template.className : 'همه'}
          icon={Home}
          color="text-purple-600"
          bg="bg-purple-50"
          isText
        />
        <StatBox
          label="مجموع ماهانه"
          value={formatAFN(template.totalAmount)}
          icon={DollarSign}
          color="text-emerald-600"
          bg="bg-emerald-50"
          isText
        />
      </div>

      {/* Description */}
      {template.description && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-700">{template.description}</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            اقلام فیس
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {template.items.map((item) => (
            <div
              key={item.id || item.name}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <DollarSign size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {feeTypeLabels[item.feeType] || item.feeType}
                    </span>
                    {item.isRecurring && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        ماهانه
                      </span>
                    )}
                    {!item.isMandatory && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        اختیاری
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-base font-bold text-gray-900 flex-shrink-0">
                {formatAFN(item.amount)}
              </p>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">مجموع:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatAFN(template.totalAmount)}
          </span>
        </div>
      </div>

      {/* Assign modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  تخصیص قالب به شاگردان
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedCount} از {students.length} شاگرد انتخاب شده
                </p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search + select all */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="جستجوی شاگرد..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    students.length > 0 && students.every((s) => s.selected)
                  }
                  onChange={(e) => selectAll(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                انتخاب همه
              </label>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg">
              {filteredStudents.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-500">
                  شاگردی یافت نشد
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((s) => {
                    const originalIdx = students.findIndex((x) => x.id === s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                          s.selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={s.selected}
                          onChange={() => toggleStudent(originalIdx)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Users size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.rollNumber}
                            {s.phone && ` • ${s.phone}`}
                          </p>
                        </div>
                        {s.existingFee && (
                          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">
                            فیس موجود
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info */}
            {students.some((s) => s.selected && s.existingFee) && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
                توجه: برخی از شاگردان انتخاب‌شده قبلاً فیس دارند. اگر
                پرداختی ثبت نشده باشد، فیس قبلی جایگزین می‌شود؛ در غیر این
                صورت فیس جدید به‌عنوان تخصیص جداگانه ایجاد خواهد شد.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setAssignModalOpen(false)}
                disabled={assigning}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning || selectedCount === 0}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {assigning ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                تخصیص به {selectedCount} شاگرد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  bg,
  isText = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  isText?: boolean;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p
        className={`${isText ? 'text-sm' : 'text-xl'} font-bold ${color} truncate`}
      >
        {value}
      </p>
    </div>
  );
}