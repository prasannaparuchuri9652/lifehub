"use client";

import { useState } from "react";
import type { Habit } from "@/store/personalStore";

interface Props {
  habits: Habit[];
  onLog: (habitId: number) => Promise<void>;
  onAdd: (data: { name: string; frequency?: string; color?: string }) => Promise<void>;
  onDelete: (id: number) => void;
  onView: (habit: Habit) => void;
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

export default function HabitTracker({ habits, onLog, onAdd, onDelete, onView }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState<number | null>(null);

  async function handleLog(habitId: number) {
    setLogging(habitId);
    await onLog(habitId);
    setLogging(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await onAdd({
      name: form.get("name") as string,
      frequency: (form.get("frequency") as string) || "daily",
      color: (form.get("color") as string) || "#6366f1",
    });
    setLoading(false);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Habits</h2>
          <p className="text-xs text-slate-500 mt-0.5">{habits.filter((h) => h.todayDone).length}/{habits.length} done today</p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="px-5 py-4 border-b border-slate-100 space-y-3 bg-violet-50">
          <input name="name" required placeholder="Habit name (e.g. Drink water)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex gap-2">
            <select name="frequency" defaultValue="daily"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="flex items-center gap-1.5 flex-1">
              {COLORS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="color" value={c} className="sr-only" />
                  <span className="block w-5 h-5 rounded-full border-2 border-transparent hover:border-slate-400"
                    style={{ backgroundColor: c }} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg">
              {loading ? "Adding…" : "Add Habit"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Habit rows */}
      <div className="divide-y divide-slate-50">
        {habits.length === 0 && !showForm && (
          <p className="text-sm text-slate-400 text-center py-8">No habits yet — add one above</p>
        )}
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            logging={logging === habit.id}
            onLog={() => handleLog(habit.id)}
            onDelete={() => onDelete(habit.id)}
            onView={() => onView(habit)}
          />
        ))}
      </div>
    </div>
  );
}

function HabitRow({ habit, logging, onLog, onDelete, onView }: {
  habit: Habit;
  logging: boolean;
  onLog: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 group">
      {/* Color dot */}
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color ?? "#6366f1" }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <button onClick={onView} className="text-sm font-medium text-slate-800 hover:underline text-left">{habit.name}</button>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-slate-400 capitalize">{habit.frequency}</span>
          <span className="text-xs text-slate-500">
            🔥 <span className="font-semibold text-slate-700">{habit.streak}</span> day streak
          </span>
          <span className="text-xs text-slate-400">{habit.total} total</span>
        </div>
      </div>

      {/* Log button */}
      <button
        onClick={onLog}
        disabled={habit.todayDone || logging}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0
          ${habit.todayDone
            ? "bg-green-100 text-green-700 cursor-default"
            : "bg-violet-100 hover:bg-violet-200 text-violet-700 disabled:opacity-60"
          }`}
      >
        {habit.todayDone ? "✓ Done" : logging ? "…" : "Mark done"}
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1 rounded"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
