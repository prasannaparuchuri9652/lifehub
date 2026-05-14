"use client";

import { useEffect } from "react";
import { useFinanceStore } from "@/store/financeStore";
import ExpenseForm from "./ExpenseForm";
import ExpenseSummary from "./ExpenseSummary";
import BudgetBar from "./BudgetBar";
import PaymentMethodCard from "./PaymentMethodCard";

export default function FinanceBoard() {
  const {
    expenses, budgets, paymentMethods, summary, month, loading,
    fetchAll, setMonth, addExpense, deleteExpense, upsertBudget,
    addPaymentMethod, deletePaymentMethod,
  } = useFinanceStore();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Month</label>
        <input
          type="month" value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        {loading && <span className="text-xs text-slate-400">Loading…</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <ExpenseForm
            paymentMethods={paymentMethods}
            month={month}
            onAdd={addExpense}
          />
          <ExpenseSummary expenses={expenses} onDelete={deleteExpense} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <BudgetBar
            budgets={budgets}
            summary={summary}
            month={month}
            onUpsert={upsertBudget}
          />
          <PaymentMethodCard
            methods={paymentMethods}
            onAdd={addPaymentMethod}
            onDelete={deletePaymentMethod}
          />
        </div>
      </div>
    </div>
  );
}
