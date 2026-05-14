"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/store/financeStore";

const CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Health", "Utilities", "Education", "Other"];

interface Props {
  paymentMethods: PaymentMethod[];
  month: string;
  onAdd: (data: Record<string, string>) => Promise<void>;
}

export default function ExpenseForm({ paymentMethods, month, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await onAdd({
      amount: form.get("amount") as string,
      category: form.get("category") as string,
      description: form.get("description") as string,
      payment_method_id: form.get("payment_method_id") as string,
      expense_date: form.get("expense_date") as string,
    });
    setLoading(false);
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">Add Expense</h2>
        <button
          onClick={() => setOpen((p) => !p)}
          className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount (₹)</label>
              <input name="amount" type="number" step="0.01" min="0" required placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input name="expense_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <select name="category" required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description (optional)</label>
            <input name="description" placeholder="What was this for?"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment method</label>
            <select name="payment_method_id"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="">Cash / not specified</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}{m.last_four ? ` ••••${m.last_four}` : ""}{m.upi_id ? ` (${m.upi_id})` : ""}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition-colors">
            {loading ? "Adding…" : "Add Expense"}
          </button>
        </form>
      )}
    </div>
  );
}
