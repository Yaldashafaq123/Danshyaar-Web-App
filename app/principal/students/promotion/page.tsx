// app/admin/academic/students/promotion/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Award,
  ArrowRight,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { principalPromotionsAPI } from '@/lib/api/principal';
import type { PromotionOptions, PromotionSuggestion } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

export default function ClassPromotionPage() {
  const [data, setData] = useState<PromotionOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Modal state
  const [selectedSuggestion, setSelectedSuggestion] = useState<PromotionSuggestion | null>(null);
  const [useExistingClass, setUseExistingClass] = useState(true);
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('');
  const [notes, setNotes] = useState('');

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await principalPromotionsAPI.getPromotionOptions();
      setData(res);
    } catch (err: unknown) {
      console.error('❌ [Promotion] Error:', err);
      let message = 'خطا در دریافت اطلاعات ارتقاء';
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
    fetchOptions();
  }, []);

  const openModal = (s: PromotionSuggestion) => {
    setSelectedSuggestion(s);
    setUseExistingClass(s.canPromote);
    setNewGrade(s.suggestedNewGrade || '');
    setNewSection(s.suggestedNewSection || '');
    setNotes('');
  };

  const handlePromote = async () => {
    if (!selectedSuggestion) return;
    try {
      setProcessingId(selectedSuggestion.fromClassId);
      setError(null);
      setSuccess(null);

      await principalPromotionsAPI.promoteClass({
        fromClassId: selectedSuggestion.fromClassId,
        toClassId: useExistingClass
          ? selectedSuggestion.toClassId ?? undefined
          : undefined,
        createNewClass: !useExistingClass,
        newGrade: !useExistingClass ? newGrade : undefined,
        newSection: !useExistingClass ? newSection : undefined,
        newClassName: !useExistingClass
          ? `${newGrade} ${newSection}`.trim()
          : undefined,
        academicYearId: selectedSuggestion.targetAcademicYearId ?? undefined,
        notes: notes || undefined,
      });

      setSuccess(
        `ارتقاء صنف «${selectedSuggestion.fromClassName}» با موفقیت انجام شد`
      );
      setSelectedSuggestion(null);
      await fetchOptions();
    } catch (err: unknown) {
      console.error('❌ [Promote] Error:', err);
      let message = 'خطا در ارتقاء صنف';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ارتقاء صنوف</h1>
          <p className="text-gray-500 text-sm mt-1">
            ارتقاء شاگردان به صنف بعدی
          </p>
        </div>
        <button
          onClick={fetchOptions}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
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

      {/* Suggestions list */}
      {data && data.promotionSuggestions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Award className="mx-auto text-gray-300" size={48} />
          <p className="mt-3 text-gray-500">صنفی برای ارتقاء وجود ندارد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.promotionSuggestions.map((s) => (
            <div
              key={s.fromClassId}
              className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* From */}
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">از صنف</p>
                  <p className="text-lg font-bold text-gray-900">
                    {s.fromClassName}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {formatNumber(s.fromStudentCount)} شاگرد
                    </span>
                    <span>معلم: {s.fromTeacher}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight size={24} className="text-gray-300 rotate-180" />
                </div>

                {/* To */}
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">به صنف</p>
                  {s.canPromote ? (
                    <p className="text-lg font-bold text-green-700">
                      {s.toClassName}
                    </p>
                  ) : s.needsNewClass ? (
                    <p className="text-sm text-orange-600 font-medium">
                      نیاز به ایجاد صنف جدید: {s.suggestedNewClassName}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      صنف بعدی وجود ندارد
                    </p>
                  )}
                </div>

                {/* Action */}
                <div>
                  {s.fromStudentCount === 0 ? (
                    <span className="text-xs text-gray-400">بدون شاگرد</span>
                  ) : (
                    <button
                      onClick={() => openModal(s)}
                      disabled={!s.nextGradeName}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Award size={14} />
                      ارتقاء
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تأیید ارتقاء
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              از صنف{' '}
              <span className="font-semibold">
                {selectedSuggestion.fromClassName}
              </span>{' '}
              ({formatNumber(selectedSuggestion.fromStudentCount)} شاگرد)
            </p>

            {selectedSuggestion.canPromote && (
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    checked={useExistingClass}
                    onChange={() => setUseExistingClass(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">
                    ارتقاء به صنف موجود:{' '}
                    <strong>{selectedSuggestion.toClassName}</strong>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useExistingClass}
                    onChange={() => setUseExistingClass(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">
                    ایجاد صنف جدید
                  </span>
                </label>
              </div>
            )}

            {(!useExistingClass || !selectedSuggestion.canPromote) && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    صنف جدید
                  </label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    شعبه
                  </label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="الف / ب / ج"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                یادداشت (اختیاری)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedSuggestion(null)}
                disabled={processingId !== null}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handlePromote}
                disabled={processingId !== null}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {processingId !== null ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                تأیید و ارتقاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}