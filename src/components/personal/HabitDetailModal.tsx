"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import { useToastStore } from "@/store/toastStore";
import type { Habit } from "@/store/personalStore";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

interface Props {
  habit: Habit | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Habit>) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function HabitDetailModal({ habit, open, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToastStore((s) => s.show);

  if (!habit) return null;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!habit) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await onUpdate(habit.id, {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      frequency: form.get("frequency") as "daily" | "weekly",
      color: form.get("color") as string,
    });
    setSaving(false);
    setEditing(false);
    toast("Habit updated");
  }

  function handleDelete() {
    if (!habit) return;
    onDelete(habit.id);
    toast("Habit deleted", "error");
    onClose();
  }

  return (
    <Modal open={open} onClose={() => { setEditing(false); onClose(); }} title={editing ? "Edit Habit" : "Habit Detail"} width="sm">
      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
            <input name="name" required defaultValue={habit.name}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
            <textarea name="description" rows={2} defaultValue={habit.description ?? ""}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Frequency</label>
            <select name="frequency" defaultValue={habit.frequency}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="color" value={c} defaultChecked={habit.color === c} className="sr-only" />
                  <span className="block w-6 h-6 rounded-full border-2 border-transparent hover:border-slate-400"
                    style={{ backgroundColor: c }} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg">
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
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: habit.color ?? "#6366f1" }} />
            <h3 className="text-lg font-semibold text-slate-900">{habit.name}</h3>
          </div>
          {habit.description && <p className="text-sm text-slate-500">{habit.description}</p>}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-500">{habit.streak}</p>
              <p className="text-xs text-slate-500 mt-0.5">day streak</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-700">{habit.total}</p>
              <p className="text-xs text-slate-500 mt-0.5">total logs</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${habit.todayDone ? "bg-green-50" : "bg-slate-50"}`}>
              <p className={`text-sm font-semibold mt-1 ${habit.todayDone ? "text-green-600" : "text-slate-400"}`}>
                {habit.todayDone ? "✓ Done" : "Pending"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">today</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Frequency</p>
              <p className="text-sm font-medium text-slate-700 capitalize">{habit.frequency}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setEditing(true)}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
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
