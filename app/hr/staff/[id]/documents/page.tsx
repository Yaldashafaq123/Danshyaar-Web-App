// app/admin/hr/staff/[id]/documents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Trash2,
  Download,
  User,
  Calendar,
} from 'lucide-react';
import { hrStaffAPI, hrDocumentsAPI } from '@/lib/api/hr';
import type { HRDocument } from '@/types/hr';
import {
  formatShamsiDate,
  documentTypeLabels,
} from '@/lib/utils/hr-helpers';

export default function StaffDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = Number(params.id);

  const [staff, setStaff] = useState<{ fullName: string } | null>(null);
  const [documents, setDocuments] = useState<HRDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'CONTRACT',
    fileUrl: '',
    isConfidential: false,
    expiresAt: '',
  });
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [staffData, docsRes] = await Promise.all([
        hrStaffAPI.getById(staffId),
        hrDocumentsAPI.list({ userId: staffId, limit: 100 }),
      ]);
      setStaff({ fullName: staffData.fullName });
      setDocuments(docsRes.documents);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در بارگذاری';
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
    if (!isNaN(staffId)) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  const openModal = () => {
    setForm({
      title: '',
      description: '',
      type: 'CONTRACT',
      fileUrl: '',
      isConfidential: false,
      expiresAt: '',
    });
    setModalOpen(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.fileUrl.trim()) {
      setError('عنوان و لینک فایل الزامی است');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await hrDocumentsAPI.upload({
        userId: staffId,
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        fileUrl: form.fileUrl,
        isConfidential: form.isConfidential,
        expiresAt: form.expiresAt || undefined,
      });
      setSuccess('سند با موفقیت اضافه شد');
      setModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در ذخیره سند';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await hrDocumentsAPI.delete(deleteId);
      setSuccess('سند حذف شد');
      setDeleteId(null);
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('خطا در حذف سند');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-pink-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/hr/staff/${staffId}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-pink-500" size={26} />
            اسناد کارمند
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {staff?.fullName || `#${staffId}`}
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
        >
          <Plus size={16} />
          افزودن سند
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">
            هیچ سندی برای این کارمند ثبت نشده
          </p>
          <button
            onClick={openModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
          >
            <Plus size={16} />
            افزودن اولین سند
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`bg-white rounded-xl shadow-sm p-5 ${
                doc.isConfidential ? 'border-2 border-red-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                  <FileText size={20} />
                </div>
                {doc.isConfidential && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                    محرمانه
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
                {doc.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {documentTypeLabels[doc.type] || doc.type}
              </p>

              {doc.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {doc.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Calendar size={12} />
                {formatShamsiDate(doc.createdAt)}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-xs hover:bg-pink-100"
                >
                  <Download size={12} />
                  دانلود
                </a>
                <button
                  onClick={() => setDeleteId(doc.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                افزودن سند جدید
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <FormInput
                label="عنوان *"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
              />

              <FormSelect
                label="نوع سند"
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                options={Object.entries(documentTypeLabels).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
              />

              <FormInput
                label="لینک فایل *"
                value={form.fileUrl}
                onChange={(v) => setForm({ ...form, fileUrl: v })}
                placeholder="https://..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  توضیحات
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <FormInput
                label="تاریخ انقضا"
                type="date"
                value={form.expiresAt}
                onChange={(v) => setForm({ ...form, expiresAt: v })}
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isConfidential}
                  onChange={(e) =>
                    setForm({ ...form, isConfidential: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-pink-600"
                />
                <span className="text-sm text-gray-700">سند محرمانه</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">حذف سند</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              آیا از حذف این سند مطمئن هستید؟
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                <Trash2 size={14} />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}