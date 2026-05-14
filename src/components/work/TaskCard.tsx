"use client";

import { useState } from "react";
import { StatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import type { Task } from "@/store/workStore";

const STATUSES = ["todo", "in_progress", "done", "blocked"] as const;
type Status = (typeof STATUSES)[number];

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null;

  const isOverdue =
    task.due_date && task.status !== "done"
      ? new Date(task.due_date) < new Date()
      : false;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-900 leading-snug flex-1">{task.title}</p>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-40"
              onMouseLeave={() => setMenuOpen(false)}>
              <p className="px-3 py-1 text-xs text-slate-400 font-medium">Move to</p>
              {STATUSES.filter((s) => s !== task.status).map((s) => (
                <button key={s}
                  onClick={() => { onStatusChange(task.id, s); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 capitalize">
                  {s.replace("_", " ")}
                </button>
              ))}
              <hr className="my-1 border-slate-100" />
              <button
                onClick={() => { onDelete(task.id); setMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center flex-wrap gap-1.5 mt-2">
        <PriorityBadge priority={task.priority} />
        {task.project_name && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-600 font-medium">
            {task.project_name}
          </span>
        )}
        {dueDate && (
          <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
            {isOverdue ? "⚠ " : ""}{dueDate}
          </span>
        )}
      </div>
    </div>
  );
}
