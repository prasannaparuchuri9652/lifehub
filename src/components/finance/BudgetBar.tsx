"use client";

import { useState } from "react";
import type { Budget, CategorySummary } from "@/store/financeStore";

const CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Health", "Utilities", "Education", "Other"];

interface Props {
  budgets: Budget[];
  summary: CategorySummary[];
  month: string;
  onUpsert: (data: { category: string; amount: string; month: string }) => Promise<void>;
}

export default function BudgetBar({ budgets, summary, month, onUpsert }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const budgetMap = Object.fromEntries(budgets.map((b) => [b.category, parseFloat(b.amount)]));
  const spentMap = Object.fromEntries(summary.map((s) => [s.category, s.total]));

  const allCategories = [...new Set([...Object.keys(budgetMap), ...Object.keys(spentMap), ...CATEGORIES])];

  async function save(category: string) {
    if (!value || isNaN(Number(value))) return;
    setLoading(true);
    await onUpsert({ category, amount: value, month });
    setLoading(false);
    setEditing(null);
    setValue("");
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">Budgets</h2>
        <p className="text-xs text-slate-500 mt-0.5">Click a category to set budget</p>
      </div>

      <div className="divide-y divide-slate-50">
        {CATEGORIES.map((cat) => {
          const budget = budgetMap[cat] ?? 0;
          const spent = spentMap[cat] ?? 0;
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const over = budget > 0 && spent > budget;
          const warn = budget > 0 && pct >= 80 && !over;

          return (
            <div key={cat} className="px-5 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">{cat}</span>
                <div className="flex items-center gap-2">
                  {over && <span className="text-xs text-red-500 font-medium">Over budget!</span>}
                  {warn && <span className="text-xs text-amber-500 font-medium">⚠ 80%+</span>}
                  {editing === cat ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">₹</span>
                      <input
                        type="number" value={value} onChange={(e) => setValue(e.target.value)}
                        autoFocus className="w-20 px-2 py-0.5 border border-emerald-400 rounded text-xs focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && save(cat)}
                      />
                      <button onClick={() => save(cat)} disabled={loading}
                        className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded disabled:opacity-60">
                        {loading ? "…" : "Save"}
                      </button>
                      <button onClick={() => setEditing(null)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(cat); setValue(budget > 0 ? String(budget) : ""); }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      {budget > 0 ? `₹${budget.toLocaleString("en-IN")}` : "Set budget"}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? "bg-red-500" : warn ? "bg-amber-400" : "bg-emerald-500"}`}
                    style={{ width: budget > 0 ? `${pct}%` : "0%" }}
                  />
                </div>
                <span className="text-xs text-slate-500 shrink-0">
                  ₹{spent.toLocaleString("en-IN")}{budget > 0 ? ` / ₹${budget.toLocaleString("en-IN")}` : " spent"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
