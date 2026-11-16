// app/admin/finance/budget/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Info,
  Plus,
  X,
  Save,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import {
  financeReportsAPI,
  financeExpensesAPI,
} from '@/lib/api/finance';
import type { ExpenseCategory, Expense } from '@/types/finance';
import {
  formatAFN,
  formatNumber,
  formatPercentage,
} from '@/lib/utils/finance-helpers';

interface BudgetItem {
  id: number;
  categoryId: number;
  categoryName: string;
  budgeted: number;
  spent: number;
  percent: number;
}

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [income, setIncome] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simple local budget (stored in localStorage since backend doesn't have budget endpoints)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [incomeRes, catsRes, expensesRes] = await Promise.all([
        financeReportsAPI.getIncomeStatement().catch(() => null),
        financeExpensesAPI.getCategories().catch(() => []),
        financeExpensesAPI.list().catch(() => []),
      ]);

      if (incomeRes) {
        setIncome({
          totalIncome: incomeRes.income?.total || 0,
          totalExpense: incomeRes.expenses?.total || 0,
          netIncome: incomeRes.netIncome || 0,
        });
      }

      setCategories(catsRes);

      // Load budgets from localStorage
      const saved = localStorage.getItem('finance-budgets');
      const budgets: Record<number, number> = saved ? JSON.parse(saved) : {};

      // Aggregate spent per category
      const spentByCat = new Map<number, number>();
      (expensesRes as Expense[]).forEach((e) => {
        spentByCat.set(
          e.categoryId,
          (spentByCat.get(e.categoryId) || 0) + Number(e.amount || 0)
        );
      });

      const budgetItems: BudgetItem[] = catsRes.map((c) => {
        const budgeted = budgets[c.id] || 0;
        const spent = spentByCat.get(c.id) || 0;
        return {
          id: c.id,
          categoryId: c.id,
          categoryName: c.name,
          budgeted,
          spent,
          percent: budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0,
        };
      });

      setItems(budgetItems);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت اطلاعات بودجه';
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

  const openBudgetModal = (item: BudgetItem) => {
    setEditingItem(item);
    setBudgetAmount(String(item.budgeted || 0));
    setBudgetModalOpen(true);
  };

  const handleSaveBudget = () => {
    if (!editingItem) return;
    const amount = Number(budgetAmount);
    if (isNaN(amount) || amount < 0) {
      setError('مبلغ بودجه معتبر نیست');
      return;
    }

    try {
      const saved = localStorage.getItem('finance-budgets');
      const budgets: Record<number, number> = saved ? JSON.parse(saved) : {};
      budgets[editingItem.id] = amount;
      localStorage.setItem('finance-budgets', JSON.stringify(budgets));

      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                budgeted: amount,
                percent: amount > 0 ? Math.round((it.spent / amount) * 100) : 0,
              }
            : it
        )
      );

      setSuccess('بودجه ذخیره شد');
      setBudgetModalOpen(false);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      setError('خطا در ذخیره بودجه');
    }
  };

  const totalBudgeted = items.reduce((s, i) => s + i.budgeted, 0);
  const totalSpent = items.reduce((s, i) => s + i.spent, 0);
  const remaining = totalBudgeted - totalSpent;
  const overallPercent =
    totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-indigo-500" size={26} />
            برنامه‌ریزی بودجه
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تعیین بودجه ماهانه برای هر دسته مصرف
          </p>
        </div>
        <button
          onClick={fetchData}
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

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">راهنمای بودجه</p>
          <p>
            بودجه‌ها به‌صورت محلی (در مرورگر) ذخیره می‌شوند. سیستم به‌طور
            خودکار مصارف هر دسته را با بودجه مقایسه می‌کند.
          </p>
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-indigo-600" />
              <p className="text-xs text-gray-600">مجموع بودجه</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {formatAFN(totalBudgeted)}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className="text-red-600" />
              <p className="text-xs text-gray-600">مصرف شده</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatAFN(totalSpent)}
            </p>
          </div>
          <div
            className={`rounded-xl p-5 ${
              remaining >= 0 ? 'bg-emerald-50' : 'bg-orange-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Wallet
                size={16}
                className={remaining >= 0 ? 'text-emerald-600' : 'text-orange-600'}
              />
              <p className="text-xs text-gray-600">
                {remaining >= 0 ? 'باقی‌مانده' : 'اضافه‌مصرف'}
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${
                remaining >= 0 ? 'text-emerald-600' : 'text-orange-600'
              }`}
            >
              {formatAFN(Math.abs(remaining))}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-purple-600" />
              <p className="text-xs text-gray-600">درصد مصرف</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatPercentage(overallPercent)}
            </p>
          </div>
        </div>
      )}

      {/* Income reference */}
      {!loading && income.totalIncome > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            مرجع مالی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">کل عواید</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatAFN(income.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">کل مصارف</p>
              <p className="text-lg font-bold text-red-600">
                {formatAFN(income.totalExpense)}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                income.netIncome >= 0 ? 'bg-purple-50' : 'bg-orange-50'
              }`}
            >
              <p className="text-xs text-gray-600 mb-1">
                {income.netIncome >= 0 ? 'سود' : 'زیان'}
              </p>
              <p
                className={`text-lg font-bold ${
                  income.netIncome >= 0
                    ? 'text-purple-600'
                    : 'text-orange-600'
                }`}
              >
                {formatAFN(Math.abs(income.netIncome))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            بودجه به تفکیک دسته
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="mx-auto text-gray-300" size={48} />
            <p className="mt-3 text-gray-500">
              دسته‌بندی مصرفی وجود ندارد
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ابتدا از بخش مصارف، دسته‌بندی ایجاد کنید
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const isOver = item.budgeted > 0 && item.spent > item.budgeted;
              const isWarning =
                item.budgeted > 0 &&
                item.spent <= item.budgeted &&
                item.percent >= 80;
              return (
                <div key={item.id} className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isOver
                            ? 'bg-red-100 text-red-600'
                            : isWarning
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-indigo-100 text-indigo-600'
                        }`}
                      >
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.categoryName}
                        </p>
                        {isOver && (
                          <p className="text-xs text-red-600 font-medium">
                            ⚠️ بودجه رد شده!
                          </p>
                        )}
                        {isWarning && !isOver && (
                          <p className="text-xs text-yellow-600 font-medium">
                            نزدیک به سقف بودجه
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-left">
                        <p className="text-xs text-gray-500">بودجه</p>
                        <p className="font-bold text-indigo-600">
                          {item.budgeted > 0
                            ? formatAFN(item.budgeted)
                            : 'تعیین نشده'}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">مصرف شده</p>
                        <p className="font-bold text-red-600">
                          {formatAFN(item.spent)}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">باقی</p>
                        <p
                          className={`font-bold ${
                            item.budgeted - item.spent >= 0
                              ? 'text-emerald-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {formatAFN(item.budgeted - item.spent)}
                        </p>
                      </div>
                      <button
                        onClick={() => openBudgetModal(item)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs hover:bg-indigo-100"
                      >
                        تعیین بودجه
                      </button>
                    </div>
                  </div>

                  {item.budgeted > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-red-500'
                            : isWarning
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(item.percent, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget modal */}
      {budgetModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                تعیین بودجه
              </h3>
              <button
                onClick={() => setBudgetModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              دسته: <strong>{editingItem.categoryName}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                مبلغ بودجه (افغانی)
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              {budgetAmount && Number(budgetAmount) > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  معادل: {formatAFN(Number(budgetAmount))}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setBudgetModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveBudget}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
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