"use client";

import { useEffect, useState } from "react";
import { useFinanceStore } from "@/store/financeStore";
import type { Expense, PaymentMethod } from "@/store/financeStore";
import ExpenseForm from "./ExpenseForm";
import ExpenseSummary from "./ExpenseSummary";
import BudgetBar from "./BudgetBar";
import PaymentMethodCard from "./PaymentMethodCard";
import ExpenseModal from "./ExpenseModal";
import PaymentMethodModal from "./PaymentMethodModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToastStore } from "@/store/toastStore";

export default function FinanceBoard() {
  const {
    expenses, budgets, paymentMethods, summary, month, loading,
    fetchAll, setMonth, addExpense, updateExpense, deleteExpense,
    upsertBudget, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  } = useFinanceStore();
  const toast = useToastStore((s) => s.show);

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [confirmExpenseId, setConfirmExpenseId] = useState<number | null>(null);
  const [confirmMethodId, setConfirmMethodId] = useState<number | null>(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleDeleteExpense(id: number) {
    await deleteExpense(id);
    toast("Expense deleted", "error");
    setConfirmExpenseId(null);
    setSelectedExpense(null);
  }

  async function handleDeleteMethod(id: number) {
    await deletePaymentMethod(id);
    toast("Payment method deleted", "error");
    setConfirmMethodId(null);
    setSelectedMethod(null);
  }

  return (
    <>
      <ExpenseModal
        expense={selectedExpense}
        paymentMethods={paymentMethods}
        open={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onUpdate={async (id, data) => { await updateExpense(id, data); }}
        onDelete={(id) => setConfirmExpenseId(id)}
      />
      <PaymentMethodModal
        method={selectedMethod}
        open={!!selectedMethod}
        onClose={() => setSelectedMethod(null)}
        onUpdate={async (id, data) => { await updatePaymentMethod(id, data); }}
        onDelete={(id) => setConfirmMethodId(id)}
      />
      <ConfirmDialog
        open={confirmExpenseId !== null}
        title="Delete expense?"
        message="This will permanently remove this expense."
        onConfirm={() => confirmExpenseId !== null && handleDeleteExpense(confirmExpenseId)}
        onCancel={() => setConfirmExpenseId(null)}
      />
      <ConfirmDialog
        open={confirmMethodId !== null}
        title="Delete payment method?"
        message="This will remove this payment method."
        onConfirm={() => confirmMethodId !== null && handleDeleteMethod(confirmMethodId)}
        onCancel={() => setConfirmMethodId(null)}
      />

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
            <ExpenseSummary
              expenses={expenses}
              onDelete={(id) => setConfirmExpenseId(id)}
              onView={setSelectedExpense}
            />
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
              onDelete={(id) => setConfirmMethodId(id)}
              onEdit={setSelectedMethod}
            />
          </div>
        </div>
      </div>
    </>
  );
}
