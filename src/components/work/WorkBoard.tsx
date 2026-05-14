"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/store/workStore";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";

const COLUMNS = [
  { id: "todo", label: "Todo", accent: "border-t-slate-300" },
  { id: "in_progress", label: "In Progress", accent: "border-t-blue-400" },
  { id: "done", label: "Done", accent: "border-t-green-400" },
  { id: "blocked", label: "Blocked", accent: "border-t-red-400" },
] as const;

export default function WorkBoard() {
  const { tasks, projects, loading, fetchTasks, fetchProjects, createTask, updateTask, deleteTask } =
    useWorkStore();
  const [addingTo, setAddingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 px-1">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className={`flex flex-col w-72 shrink-0 bg-slate-100 rounded-xl border-t-4 ${col.accent} p-3`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-semibold text-slate-700">{col.label}</span>
              <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-full font-medium shadow-sm">
                {colTasks.length}
              </span>
            </div>

            {/* Cards + form */}
            <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
              {loading && colTasks.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">Loading…</div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(id, status) => updateTask(id, { status })}
                    onDelete={deleteTask}
                  />
                ))
              )}

              {addingTo === col.id ? (
                <TaskForm
                  projects={projects}
                  defaultStatus={col.id}
                  onSubmit={async (data) => {
                    await createTask(data);
                    setAddingTo(null);
                  }}
                  onCancel={() => setAddingTo(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingTo(col.id)}
                  className="w-full text-left text-xs text-slate-400 hover:text-indigo-600 px-2 py-2 rounded-lg hover:bg-white transition-colors"
                >
                  + Add task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
