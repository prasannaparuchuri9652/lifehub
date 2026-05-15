"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { useToastStore } from "@/store/toastStore";
import type { Expense, PaymentMethod } from "@/store/financeStore";

const CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Health", "Utilities", "Education", "Other"];

interface Props {
  expense: Expense | null;
  paymentMethods: PaymentMethod[];
  open: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Expense>) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function ExpenseModal({ expense, paymentMethods, open, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToastStore((s) => s.show);

  if (!expense) return null;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!expense) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await onUpdate(expense.id, {
      amount: form.get("amount") as string,
      category: form.get("category") as string,
      description: (form.get("description") as string) || undefined,
      payment_method_id: form.get("payment_method_id") ? Number(form.get("payment_method_id")) : undefined,
      expense_date: form.get("expense_date") as string,
    });
    setSaving(false);
    setEditing(false);
    toast("Expense updated");
  }

  function handleDelete() {
    if (!expense) return;
    onDelete(expense.id);
    toast("Expense deleted", "error");
    onClose();
  }

  return (
    <Modal open={open} onClose={() => { setEditing(false); onClose(); }} title={editing ? "Edit Expense" : "Expense Detail"} width="sm">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Amount (₹)</label>
              <input name="amount" required type="number" step="0.01" min="0" defaultValue={expense.amount}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
              <input name="expense_date" required type="date"
                defaultValue={expense.expense_date ? expense.expense_date.slice(0, 10) : ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
            <select name="category" defaultValue={expense.category}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
            <input name="description" defaultValue={expense.description ?? ""}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Payment method</label>
            <select name="payment_method_id" defaultValue={expense.payment_method_id ?? ""}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Cash / none</option>
              {paymentMethods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900">
              ₹{parseFloat(expense.amount).toLocaleString("en-IN")}
            </span>
            <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{expense.category}</span>
          </div>
          {expense.description && <p className="text-sm text-slate-500">{expense.description}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(expense.expense_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            {expense.payment_label && (
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400">Paid via</p>
                <p className="text-sm font-medium text-slate-700">{expense.payment_label}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setEditing(true)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Edit
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
