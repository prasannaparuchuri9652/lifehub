"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/store/financeStore";

interface Props {
  methods: PaymentMethod[];
  onAdd: (data: Partial<PaymentMethod>) => Promise<void>;
  onDelete: (id: number) => void;
}

const TYPE_ICONS: Record<string, string> = {
  card: "💳", upi: "📱", cash: "💵", netbanking: "🏦",
};

export default function PaymentMethodCard({ methods, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("card");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await onAdd({
      type: form.get("type") as string,
      label: form.get("label") as string,
      last_four: (form.get("last_four") as string) || undefined,
      upi_id: (form.get("upi_id") as string) || undefined,
      is_default: form.get("is_default") === "on",
    });
    setLoading(false);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">Payment Methods</h2>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 border-b border-slate-100 bg-emerald-50">
          <div className="flex gap-2">
            <select name="type" value={type} onChange={(e) => setType(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="netbanking">Net Banking</option>
            </select>
            <input name="label" required placeholder="Label (e.g. HDFC Savings)"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {type === "card" && (
            <input name="last_four" maxLength={4} placeholder="Last 4 digits (e.g. 4242)"
              pattern="\d{4}" title="Must be exactly 4 digits"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          )}
          {type === "upi" && (
            <input name="upi_id" placeholder="UPI ID (e.g. name@upi)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          )}

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" name="is_default" className="rounded" />
            Set as default
          </label>

          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm">
            {loading ? "Adding…" : "Add Method"}
          </button>
        </form>
      )}

      <div className="divide-y divide-slate-50">
        {methods.length === 0 && !showForm && (
          <p className="text-sm text-slate-400 text-center py-6">No payment methods saved</p>
        )}
        {methods.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 group">
            <span className="text-xl">{TYPE_ICONS[m.type] ?? "💰"}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">
                {m.label}
                {m.last_four && <span className="text-slate-400 ml-1 font-normal">••••{m.last_four}</span>}
                {m.is_default && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Default</span>}
              </p>
              {m.upi_id && <p className="text-xs text-slate-400 mt-0.5">{m.upi_id}</p>}
            </div>
            <button
              onClick={() => onDelete(m.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1 rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
