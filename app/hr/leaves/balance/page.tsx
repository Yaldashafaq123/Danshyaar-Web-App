// app/admin/hr/leaves/balance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  User,
  Search,
  ChevronRight,
} from 'lucide-react';
import { hrLeavesAPI, hrStaffAPI } from '@/lib/api/hr';
import type { StaffMember, LeaveBalance } from '@/types/hr';
import {
  formatNumber,
  getCurrentShamsiYear,
} from '@/lib/utils/hr-helpers';

interface StaffWithBalance extends StaffMember {
  balance: LeaveBalance | null;
  balanceLoading: boolean;
}

export default function LeaveBalancePage() {
  const [staff, setStaff] = useState<StaffWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const currentYear = getCurrentShamsiYear();
  const [year, setYear] = useState<number>(currentYear);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load all staff
      const staffRes = await hrStaffAPI.list({ limit: 500 });
      const initial: StaffWithBalance[] = staffRes.staff.map((s) => ({
        ...s,
        balance: null,
        balanceLoading: true,
      }));
      setStaff(initial);

      // 2. Load balances in parallel (batched)
      const balances = await Promise.all(
        staffRes.staff.map(async (s) => {
          try {
            const b = await hrLeavesAPI.getBalance(s.id, year);
            return { id: s.id, balance: b };
          } catch {
            return { id: s.id, balance: null };
          }
        })
      );

      const balanceMap = new Map(balances.map((b) => [b.id, b.balance]));
      setStaff(
        initial.map((s) => ({
          ...s,
          balance: balanceMap.get(s.id) || null,
          balanceLoading: false,
        }))
      );
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات';
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

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/hr/leaves"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-pink-500" size={26} />
            بیلانس رخصتی
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            موجودی رخصتی کارمندان
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-24 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی نام کارمند..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
            <p className="mt-3 text-gray-500 text-sm">
              در حال بارگذاری بیلانس‌ها...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">کارمندی یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((s) => {
              const isExpanded = expandedId === s.id;
              return (
                <div key={s.id}>
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : s.id)
                    }
                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-right"
                  >
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{s.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {s.email}
                      </p>
                    </div>
                    {s.balance && (
                      <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">سالانه</p>
                          <p className="font-bold text-blue-600">
                            {formatNumber(s.balance.remainingAnnual)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">مریضی</p>
                          <p className="font-bold text-red-600">
                            {formatNumber(s.balance.remainingSick)}
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    )}
                  </button>

                  {isExpanded && s.balance && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <BalanceCard
                          label="سالانه"
                          total={s.balance.annualLeave}
                          used={s.balance.usedAnnual}
                          remaining={s.balance.remainingAnnual}
                          color="blue"
                        />
                        <BalanceCard
                          label="مریضی"
                          total={s.balance.sickLeave}
                          used={s.balance.usedSick}
                          remaining={s.balance.remainingSick}
                          color="red"
                        />
                        <BalanceCard
                          label="اضطراری"
                          total={s.balance.emergencyLeave}
                          used={s.balance.usedEmergency}
                          remaining={s.balance.remainingEmergency}
                          color="orange"
                        />
                        <BalanceCard
                          label="زایمان"
                          total={s.balance.maternityLeave}
                          used={s.balance.usedMaternity}
                          remaining={s.balance.remainingMaternity}
                          color="purple"
                        />
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/admin/hr/leaves?userId=${s.id}`}
                          className="text-xs text-pink-600 hover:text-pink-700"
                        >
                          مشاهده سابقه رخصتی‌ها →
                        </Link>
                      </div>
                    </div>
                  )}

                  {isExpanded && !s.balance && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500 pt-4">
                      بیلانسی ثبت نشده
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BalanceCard({
  label,
  total,
  used,
  remaining,
  color,
}: {
  label: string;
  total: number;
  used: number;
  remaining: number;
  color: 'blue' | 'red' | 'orange' | 'purple';
}) {
  const colors = {
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      bar: 'bg-blue-500',
    },
    red: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      bar: 'bg-red-500',
    },
    orange: {
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      bar: 'bg-orange-500',
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      bar: 'bg-purple-500',
    },
  }[color];

  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className={`${colors.bg} rounded-lg p-3`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors.text}`}>
        {formatNumber(remaining)}
      </p>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1 mb-1">
        <span>مصرف: {formatNumber(used)}</span>
        <span>کل: {formatNumber(total)}</span>
      </div>
      <div className="w-full bg-white/60 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${colors.bar}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}