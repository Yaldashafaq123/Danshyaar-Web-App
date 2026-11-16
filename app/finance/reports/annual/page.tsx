// app/admin/finance/reports/annual/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  Wallet,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  financeDashboardAPI,
  financeReportsAPI,
} from '@/lib/api/finance';
import type { FeeStatistics } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatPercentage,
} from '@/lib/utils/finance-helpers';

export default function AnnualReportPage() {
  const [stats, setStats] = useState<FeeStatistics | null>(null);
  const [income, setIncome] = useState<{
    income: { total: number };
    expenses: { total: number };
    netIncome: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState(new Date().getFullYear() - 621);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, i] = await Promise.all([
        financeDashboardAPI.getFeeStatistics().catch(() => null),
        financeReportsAPI.getIncomeStatement().catch(() => null),
      ]);
      if (s) setStats(s);
      if (i) setIncome(i);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت گزارش سالانه';
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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const totalIncome = income?.income?.total || 0;
  const totalExpense = income?.expenses?.total || 0;
  const netIncome = income?.netIncome || 0;
  const collectionRate = stats?.collectionRate || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/finance/reports"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-orange-500" size={26} />
            گزارش سالانه
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            خلاصه کل سال مالی
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Year filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          سال مالی
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-orange-500 mx-auto" size={32} />
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">گزارش مالی سال</p>
                <p className="text-4xl font-bold mt-2">{year}</p>
                <p className="text-orange-100 text-sm mt-3">
                  سود خالص سال: {formatAFN(netIncome)}
                </p>
              </div>
              <Award size={80} className="text-orange-200 opacity-40" />
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card
              label="عواید سال"
              value={formatAFN(totalIncome)}
              icon={TrendingUp}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <Card
              label="مصارف سال"
              value={formatAFN(totalExpense)}
              icon={TrendingDown}
              color="text-red-600"
              bg="bg-red-50"
            />
            <Card
              label="سود خالص"
              value={formatAFN(netIncome)}
              icon={Wallet}
              color={netIncome >= 0 ? 'text-purple-600' : 'text-orange-600'}
              bg={netIncome >= 0 ? 'bg-purple-50' : 'bg-orange-50'}
            />
            <Card
              label="نرخ وصول"
              value={formatPercentage(collectionRate)}
              icon={BarChart3}
              color="text-blue-600"
              bg="bg-blue-50"
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-500" />
                آمار وصول
              </h3>
              <div className="space-y-3 text-sm">
                <Row label="وصول امروز" value={formatAFN(stats?.todayCollection ?? 0)} />
                <Row label="وصول هفته" value={formatAFN(stats?.weekCollection ?? 0)} />
                <Row label="وصول ماه" value={formatAFN(stats?.monthCollection ?? 0)} />
                <Row label="وصول سال" value={formatAFN(stats?.yearCollection ?? 0)} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                آمار شاگردان و فیس
              </h3>
              <div className="space-y-3 text-sm">
                <Row
                  label="کل شاگردان"
                  value={formatNumber(stats?.totalStudents ?? 0)}
                />
                <Row
                  label="تخصیص‌های فعال"
                  value={formatNumber(stats?.totalAssignments ?? 0)}
                />
                <Row
                  label="تکمیل شده"
                  value={formatNumber(stats?.paidAssignments ?? 0)}
                />
                <Row
                  label="معوقات"
                  value={formatAFN(stats?.pendingFees ?? 0)}
                />
              </div>
            </div>
          </div>

          {/* Summary text */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              خلاصه مالی
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              در سال مالی <strong>{year}</strong>، مجموع عواید مکتب{' '}
              <strong className="text-emerald-600">{formatAFN(totalIncome)}</strong>{' '}
              و مجموع مصارف{' '}
              <strong className="text-red-600">{formatAFN(totalExpense)}</strong>{' '}
              بوده است.{' '}
              {netIncome >= 0 ? (
                <>
                  سود خالص سال{' '}
                  <strong className="text-purple-600">
                    {formatAFN(netIncome)}
                  </strong>{' '}
                  بوده است.
                </>
              ) : (
                <>
                  زیان خالص سال{' '}
                  <strong className="text-orange-600">
                    {formatAFN(Math.abs(netIncome))}
                  </strong>{' '}
                  بوده است.
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Card({
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
    <div className={`${bg} rounded-xl p-5`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-xl font-bold ${color} truncate`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}