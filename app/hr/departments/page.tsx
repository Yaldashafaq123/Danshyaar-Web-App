// app/admin/hr/departments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { hrStaffAPI } from '@/lib/api/hr';
import type { StaffMember } from '@/types/hr';
import {
  formatNumber,
  staffTypeLabels,
  staffTypeColors,
} from '@/lib/utils/hr-helpers';

interface Department {
  name: string;
  staff: StaffMember[];
  positions: Map<string, StaffMember[]>;
}

export default function DepartmentsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrStaffAPI.list({ limit: 500 });
      setStaff(res.staff);
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
  }, []);

  // Group by department
  const departments = new Map<string, Department>();

  staff.forEach((s) => {
    const deptName = s.department || 'بدون بخش';
    if (!departments.has(deptName)) {
      departments.set(deptName, {
        name: deptName,
        staff: [],
        positions: new Map(),
      });
    }
    const dept = departments.get(deptName)!;
    dept.staff.push(s);

    const posName = s.position || 'بدون سمت';
    if (!dept.positions.has(posName)) {
      dept.positions.set(posName, []);
    }
    dept.positions.get(posName)!.push(s);
  });

  // Group by staff type
  const staffTypes = new Map<string, number>();
  staff.forEach((s) => {
    const type = s.staffType || 'OTHER';
    staffTypes.set(type, (staffTypes.get(type) || 0) + 1);
  });

  const deptList = Array.from(departments.values()).sort(
    (a, b) => b.staff.length - a.staff.length
  );

  const typeList = Array.from(staffTypes.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/hr"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-pink-500" size={26} />
            بخش‌ها و پست‌ها
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            ساختار سازمانی مکتب
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-pink-500 mx-auto" size={32} />
        </div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={16} className="text-pink-600" />
                <p className="text-xs text-gray-600">تعداد بخش‌ها</p>
              </div>
              <p className="text-2xl font-bold text-pink-600">
                {formatNumber(deptList.length)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-blue-600" />
                <p className="text-xs text-gray-600">کل کارمندان</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(staff.length)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={16} className="text-purple-600" />
                <p className="text-xs text-gray-600">انواع کارمند</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(typeList.length)}
              </p>
            </div>
          </div>

          {/* Staff types breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              توزیع انواع کارمند
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {typeList.map(([type, count]) => (
                <div
                  key={type}
                  className={`rounded-lg p-3 ${
                    staffTypeColors[type] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <p className="text-xs opacity-80">
                    {staffTypeLabels[type] || type}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatNumber(count)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              بخش‌ها و ساختار
            </h3>
            <div className="space-y-3">
              {deptList.map((dept) => {
                const isExpanded = expandedDept === dept.name;
                return (
                  <div
                    key={dept.name}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedDept(isExpanded ? null : dept.name)
                      }
                      className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 text-right"
                    >
                      <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                        <Building2 size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">
                          {dept.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatNumber(dept.staff.length)} کارمند
                          {' • '}
                          {formatNumber(dept.positions.size)} سمت
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-pink-600">
                          {formatNumber(dept.staff.length)}
                        </span>
                        <ChevronRight
                          size={18}
                          className={`text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                        <div className="space-y-4">
                          {Array.from(dept.positions.entries()).map(
                            ([posName, posStaff]) => (
                              <div key={posName}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase
                                    size={14}
                                    className="text-gray-400"
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    {posName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({formatNumber(posStaff.length)} نفر)
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
                                  {posStaff.map((s) => (
                                    <Link
                                      key={s.id}
                                      href={`/admin/hr/staff/${s.id}`}
                                      className="flex items-center gap-2 p-2 bg-white rounded-lg hover:shadow-sm transition-shadow"
                                    >
                                      <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0 overflow-hidden">
                                        {s.profileImage ? (
                                          <img
                                            src={s.profileImage}
                                            alt={s.fullName}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <Users size={12} />
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-700 truncate">
                                        {s.fullName}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}