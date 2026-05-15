"use client";

import type { Expense } from "@/store/financeStore";

interface Props {
  expenses: Expense[];
  onDelete: (id: number) => void;
  onView: (expense: Expense) => void;
}

export default function ExpenseSummary({ expenses, onDelete, onView }: Props) {
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Expenses this month</h2>
          <p className="text-xs text-slate-500 mt-0.5">{expenses.length} transactions</p>
        </div>
        <span className="text-lg font-bold text-slate-900">₹{total.toLocaleString("en-IN")}</span>
      </div>

      <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
        {expenses.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No expenses this month</p>
        )}
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 group">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-sm">{categoryEmoji(expense.category)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <button onClick={() => onView(expense)} className="text-sm font-medium text-slate-800 truncate hover:underline text-left block">
                {expense.description || expense.category}
              </button>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">
                  {new Date(expense.expense_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{expense.category}</span>
                {expense.payment_label && (
                  <span className="text-xs text-slate-400">{expense.payment_label}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                ₹{parseFloat(expense.amount).toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => onDelete(expense.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1 rounded"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    "Food & Dining": "🍽️", Transport: "🚗", Shopping: "🛍️",
    Entertainment: "🎬", Health: "💊", Utilities: "💡",
    Education: "📚", Other: "📦",
  };
  return map[cat] ?? "💰";
}
