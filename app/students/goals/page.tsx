// app/student/goals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Target,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  Award,
  BookOpen,
  Percent,
  Star,
  Plus,
  X,
  Save,
  Calendar,
  Flame,
} from 'lucide-react';
import {
  studentGradesAPI,
  studentAttendanceAPI,
} from '@/lib/api/student-portal';
import type { TermGrades, AttendanceOverview } from '@/types/student-portal';
import {
  formatNumber,
  formatPercentage,
} from '@/lib/utils/student-helpers';

interface LearningGoal {
  id: number;
  title: string;
  description?: string;
  category: 'academic' | 'attendance' | 'personal';
  target: number;
  current: number;
  unit: string;
  dueDate?: string;
  completed: boolean;
}

export default function GoalsPage() {
  const [grades, setGrades] = useState<TermGrades | null>(null);
  const [attendance, setAttendance] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<LearningGoal[]>([]);

  // Add goal modal
  const [addOpen, setAddOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'academic' as LearningGoal['category'],
    target: 90,
    unit: 'امتیاز',
    dueDate: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [gradesRes, attendanceRes] = await Promise.all([
        studentGradesAPI.getCurrent().catch(() => null),
        studentAttendanceAPI.getOverview().catch(() => null),
      ]);

      setGrades(gradesRes);
      setAttendance(attendanceRes);

      // Auto-create goals from data
      const autoGoals: LearningGoal[] = [
        {
          id: 1,
          title: 'رسیدن به معدل ۹۰',
          description: 'هدف کل سال تحصیلی',
          category: 'academic',
          target: 90,
          current: gradesRes?.overallAverage || 0,
          unit: 'امتیاز',
          completed: (gradesRes?.overallAverage || 0) >= 90,
        },
        {
          id: 2,
          title: 'حضور ۹۵٪',
          description: 'هدف نرخ حضور',
          category: 'attendance',
          target: 95,
          current: attendanceRes?.stats.averageRate || 0,
          unit: '٪',
          completed: (attendanceRes?.stats.averageRate || 0) >= 95,
        },
        {
          id: 3,
          title: 'رتبه در ۳ نفر اول',
          description: 'رتبه‌بندی صنف',
          category: 'academic',
          target: 3,
          current: gradesRes?.classRank || 0,
          unit: 'رتبه',
          completed: (gradesRes?.classRank || 100) <= 3,
        },
      ];

      // Load saved custom goals
      let customGoals: LearningGoal[] = [];
      try {
        const saved = localStorage.getItem('student-goals');
        if (saved) customGoals = JSON.parse(saved);
      } catch (err) {
        console.error('Failed to load goals:', err);
      }

      setGoals([...autoGoals, ...customGoals]);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اهداف';
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

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: LearningGoal = {
      id: Date.now(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit,
      dueDate: newGoal.dueDate || undefined,
      completed: false,
    };

    const customGoals = goals.filter((g) => g.id > 3);
    const updated = [...customGoals, goal];

    try {
      localStorage.setItem('student-goals', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save goals:', err);
    }

    setGoals([...goals.slice(0, 3), ...updated]);
    setAddOpen(false);
    setNewGoal({
      title: '',
      description: '',
      category: 'academic',
      target: 90,
      unit: 'امتیاز',
      dueDate: '',
    });
  };

  const handleDeleteGoal = (id: number) => {
    if (id <= 3) return; // Can't delete auto goals
    const customGoals = goals.filter((g) => g.id > 3 && g.id !== id);
    try {
      localStorage.setItem('student-goals', JSON.stringify(customGoals));
    } catch (err) {
      console.error('Failed to save goals:', err);
    }
    setGoals(goals.filter((g) => g.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  const completedGoals = goals.filter((g) => g.completed);
  const activeGoals = goals.filter((g) => !g.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="text-indigo-500" size={26} />
            اهداف یادگیری
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            اهداف شخصی و پیشرفت خود را پیگیری کنید
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Plus size={16} />
            هدف جدید
          </button>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-indigo-600" />
            <p className="text-xs text-gray-600">کل اهداف</p>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {formatNumber(goals.length)}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-xs text-gray-600">تکمیل شده</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(completedGoals.length)}
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-amber-600" />
            <p className="text-xs text-gray-600">در جریان</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {formatNumber(activeGoals.length)}
          </p>
        </div>
      </div>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Flame className="text-amber-500" size={20} />
            اهداف در جریان
          </h3>
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={goal.id > 3 ? () => handleDeleteGoal(goal.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            اهداف تکمیل شده
          </h3>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Target className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            هنوز هدفی تعیین نکرده‌اید
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Plus size={16} />
            تعیین اولین هدف
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                افزودن هدف جدید
              </h3>
              <button
                onClick={() => setAddOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  عنوان هدف *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  placeholder="مثال: مطالعه روزانه ۱ ساعت"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  توضیحات
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    دسته
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        category: e.target.value as LearningGoal['category'],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="academic">تحصیلی</option>
                    <option value="attendance">حضور</option>
                    <option value="personal">شخصی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    واحد
                  </label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, unit: e.target.value })
                    }
                    placeholder="امتیاز، ساعت، ٪"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  هدف (مقدار)
                </label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  تاریخ هدف
                </label>
                <input
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                <Save size={14} />
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  onDelete,
}: {
  goal: LearningGoal;
  onDelete?: () => void;
}) {
  const progress =
    goal.target > 0
      ? Math.min((goal.current / goal.target) * 100, 100)
      : 0;

  const categoryConfig = {
    academic: {
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      label: 'تحصیلی',
    },
    attendance: {
      icon: Percent,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      label: 'حضور',
    },
    personal: {
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      label: 'شخصی',
    },
  }[goal.category];

  const Icon = categoryConfig.icon;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 ${
        goal.completed ? 'border-l-4 border-green-500' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryConfig.bg}`}
        >
          <Icon size={22} className={categoryConfig.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                {goal.title}
                {goal.completed && (
                  <CheckCircle className="text-green-500" size={16} />
                )}
              </h4>
              {goal.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {goal.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${categoryConfig.bg} ${categoryConfig.color} font-medium`}
              >
                {categoryConfig.label}
              </span>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="حذف"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>
                {goal.current.toFixed(goal.unit === 'رتبه' ? 0 : 1)}{' '}
                {goal.unit} از {goal.target} {goal.unit}
              </span>
              <span
                className={`font-bold ${
                  goal.completed ? 'text-green-600' : 'text-indigo-600'
                }`}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  goal.completed
                    ? 'bg-gradient-to-r from-green-400 to-emerald-600'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {goal.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              تاریخ هدف: {goal.dueDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}