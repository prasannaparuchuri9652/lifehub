"use client";

import { useState } from "react";
import { PriorityBadge } from "@/components/shared/StatusBadge";
import type { Task } from "@/store/workStore";

const STATUSES = ["todo", "in_progress", "done", "blocked"] as const;

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  todo:        { label: "Todo",        dot: "bg-slate-400" },
  in_progress: { label: "In Progress", dot: "bg-blue-500" },
  done:        { label: "Done",        dot: "bg-green-500" },
  blocked:     { label: "Blocked",     dot: "bg-red-400" },
};

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

  const isOverdue = task.due_date && task.status !== "done"
    ? new Date(task.due_date) < new Date()
    : false;

  const isDone = task.status === "done";

  return (
    <div className={`bg-white border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all group ${isDone ? "border-green-200 opacity-75" : "border-slate-200"}`}>
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={() => onStatusChange(task.id, isDone ? "todo" : "done")}
          title={isDone ? "Mark as todo" : "Mark as done"}
          className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isDone ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-green-400"}`}
        >
          {isDone && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <p className={`text-sm font-medium leading-snug flex-1 ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
          {task.title}
        </p>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-44" onMouseLeave={() => setMenuOpen(false)}>
              <p className="px-3 py-1 text-xs text-slate-400 font-medium uppercase tracking-wide">Move to</p>
              {STATUSES.filter((s) => s !== task.status).map((s) => {
                const c = STATUS_CONFIG[s];
                return (
                  <button key={s}
                    onClick={() => { onStatusChange(task.id, s); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {c.label}
                  </button>
                );
              })}
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

      {task.description && (
        <p className="text-xs text-slate-400 mb-2 line-clamp-2 ml-6">{task.description}</p>
      )}

      <div className="flex items-center flex-wrap gap-1.5 ml-6">
        <PriorityBadge priority={task.priority} />
        {task.project_name && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600 font-medium">
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
