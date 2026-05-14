"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  work: { todo: number; in_progress: number; done: number; blocked: number };
  personal: { todo: number; in_progress: number; done: number; habits_total: number; habits_done_today: number };
  finance: { total_this_month: number; top_categories: { category: string; total: number }[] };
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  const workTotal = stats.work.todo + stats.work.in_progress + stats.work.done + stats.work.blocked;
  const personalTotal = stats.personal.todo + stats.personal.in_progress + stats.personal.done;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

      {/* Work card */}
      <Link href="/work" className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md p-5 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800">Work</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{workTotal}</span>
        </div>

        <div className="space-y-2">
          <StatRow label="To do" value={stats.work.todo} color="bg-slate-400" />
          <StatRow label="In progress" value={stats.work.in_progress} color="bg-blue-500" />
          <StatRow label="Done" value={stats.work.done} color="bg-green-500" />
          <StatRow label="Blocked" value={stats.work.blocked} color="bg-red-400" />
        </div>
      </Link>

      {/* Personal card */}
      <Link href="/personal" className="group bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-md p-5 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800">Personal</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{personalTotal}</span>
        </div>

        <div className="space-y-2">
          <StatRow label="To do" value={stats.personal.todo} color="bg-slate-400" />
          <StatRow label="In progress" value={stats.personal.in_progress} color="bg-blue-500" />
          <StatRow label="Done" value={stats.personal.done} color="bg-green-500" />
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Habits today</span>
          <span className="text-xs font-semibold text-violet-600">
            {stats.personal.habits_done_today} / {stats.personal.habits_total}
          </span>
        </div>
      </Link>

      {/* Finance card */}
      <Link href="/finance" className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md p-5 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800">Finance</span>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-0.5">Spent this month</p>
          <p className="text-2xl font-bold text-slate-900">₹{stats.finance.total_this_month.toLocaleString("en-IN")}</p>
        </div>

        {stats.finance.top_categories.length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            {stats.finance.top_categories.map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate">{c.category}</span>
                <span className="text-xs font-medium text-slate-700">₹{c.total.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}

        {stats.finance.top_categories.length === 0 && (
          <p className="text-xs text-slate-400">No expenses this month</p>
        )}
      </Link>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
      <span className="text-xs text-slate-500 flex-1">{label}</span>
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  );
}
