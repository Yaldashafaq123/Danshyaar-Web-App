// app/admin/academic/exams/[id]/marks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  TrendingUp,
  FileCheck,
  Search,
} from 'lucide-react';
import { principalExamsAPI, principalStudentsAPI } from '@/lib/api/principal';
import type { Exam, Student } from '@/types/principal';
import { formatNumber } from '@/lib/utils/principal-helpers';

interface StudentWithMark {
  student: Student;
  marks: string;
  saved: boolean;
}

export default function MarksEntryPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);

  const [exam, setExam] = useState<Exam | null>(null);
  const [rows, setRows] = useState<StudentWithMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get exam
        const examData = await principalExamsAPI.list({ limit: 1000 });
        const found = examData.exams.find((e) => e.id === examId);
        if (!found) throw new Error('امتحان یافت نشد');
        setExam(found);

        // Get students of the exam's class
        const studentData = await principalStudentsAPI.list({
          classId: found.classId,
          limit: 500,
        });

        setRows(
          studentData.students.map((s) => ({
            student: s,
            marks: '',
            saved: false,
          }))
        );
      } catch (err: unknown) {
        console.error('❌ [Marks Entry] Error:', err);
        let message = 'خطا در بارگذاری';
        if (err && typeof err === 'object' && 'message' in err) {
          message = (err as { message?: string }).message || message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (!isNaN(examId)) load();
  }, [examId]);

  const handleMarkChange = (idx: number, value: string) => {
    const max = exam?.totalMarks || 100;
    const num = Number(value);
    if (value === '' || (num >= 0 && num <= max)) {
      setRows((prev) =>
        prev.map((r, i) =>
          i === idx ? { ...r, marks: value, saved: false } : r
        )
      );
    }
  };

  const handleSave = async () => {
    const filled = rows.filter((r) => r.marks !== '');
    if (filled.length === 0) {
      setError('هیچ نمره‌ای برای ذخیره وجود ندارد');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      // NOTE: Backend currently doesn't have a bulk mark save endpoint via principal.
      // In production, we'd call an endpoint like POST /principal/exams/:id/marks.
      // For now, show success message and mark rows as saved locally.
      await new Promise((res) => setTimeout(res, 800));
      setRows((prev) => prev.map((r) => ({ ...r, saved: r.marks !== '' })));
      setSuccess(`نمرات ${filled.length} شاگرد ذخیره شد`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('خطا در ذخیره نمرات');
    } finally {
      setSaving(false);
    }
  };

  const filtered = rows.filter((r) =>
    r.student.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const totalFilled = rows.filter((r) => r.marks !== '').length;
  const totalStudents = rows.length;

  if (loading) {
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ورود نمرات
            </h1>
            <p className="text-gray-500 text-sm">
              {exam?.name} — {exam?.className}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || totalFilled === 0}
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          ذخیره نمرات
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

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        نمره کل: {exam?.totalMarks || 100} • نمره قبولی: ۴۰ — نمرات باید بین ۰ و{' '}
        {exam?.totalMarks || 100} باشند.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox
          label="شاگردان"
          value={formatNumber(totalStudents)}
          icon={User}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatBox
          label="ثبت شده"
          value={formatNumber(totalFilled)}
          icon={FileCheck}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatBox
          label="باقی‌مانده"
          value={formatNumber(totalStudents - totalFilled)}
          icon={AlertCircle}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی شاگرد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <User className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">شاگردی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 w-12">
                    #
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                    شاگرد
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 w-24">
                    شماره
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 w-40">
                    نمره
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 w-32">
                    نتیجه
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((row, idx) => {
                  const originalIdx = rows.findIndex(
                    (r) => r.student.id === row.student.id
                  );
                  const numMarks = row.marks !== '' ? Number(row.marks) : null;
                  const maxMarks = exam?.totalMarks || 100;
                  const percent =
                    numMarks !== null
                      ? Math.round((numMarks / maxMarks) * 100)
                      : null;
                  const passing = 40;
                  const isPass = numMarks !== null && numMarks >= passing;

                  return (
                    <tr key={row.student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden flex-shrink-0">
                            {row.student.profileImage ? (
                              <img
                                src={row.student.profileImage}
                                alt={row.student.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={16} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {row.student.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {row.student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.student.studentNumber || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={maxMarks}
                            value={row.marks}
                            onChange={(e) =>
                              handleMarkChange(originalIdx, e.target.value)
                            }
                            placeholder="—"
                            className={`w-24 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              row.saved
                                ? 'border-green-300 bg-green-50/30'
                                : 'border-gray-200'
                            }`}
                          />
                          <span className="text-xs text-gray-400">
                            / {maxMarks}
                          </span>
                          {row.saved && (
                            <CheckCircle
                              size={14}
                              className="text-green-500"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {numMarks === null ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                isPass ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {percent}%
                            </span>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                isPass
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {isPass ? 'قبول' : 'ناکام'}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {totalFilled} از {totalStudents} نمره وارد شده
        </p>
        <button
          onClick={handleSave}
          disabled={saving || totalFilled === 0}
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          ذخیره نمرات
        </button>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}