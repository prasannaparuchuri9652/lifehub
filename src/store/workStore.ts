import { create } from "zustand";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  project_id?: number | null;
  project_name?: string | null;
  due_date?: string | Date | null;
  tags?: string | null;
  created_at?: string | Date | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: string;
}

interface WorkStore {
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  fetchTasks: (projectId?: number) => Promise<void>;
  fetchProjects: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  createProject: (data: { name: string; description?: string }) => Promise<void>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export const useWorkStore = create<WorkStore>((set, get) => ({
  tasks: [],
  projects: [],
  loading: false,

  fetchTasks: async (projectId) => {
    set({ loading: true });
    const url = projectId ? `/api/tasks?projectId=${projectId}` : "/api/tasks";
    const res = await fetch(url);
    const tasks = await res.json();
    set({ tasks, loading: false });
  },

  fetchProjects: async () => {
    const res = await fetch("/api/projects");
    const projects = await res.json();
    set({ projects });
  },

  createTask: async (data) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const task = await res.json();
    set((s) => ({ tasks: [task, ...s.tasks] }));
  },

  updateTask: async (id, data) => {
    const existing = get().tasks.find((t) => t.id === id);
    if (!existing) return;
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...data }),
    });
    const updated = await res.json();
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)) }));
  },

  deleteTask: async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  createProject: async (data) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const project = await res.json();
    set((s) => ({ projects: [...s.projects, project] }));
  },

  updateProject: async (id, data) => {
    const existing = get().projects.find((p) => p.id === id);
    if (!existing) return;
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...data }),
    });
    const updated = await res.json();
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...updated } : p)) }));
  },

  deleteProject: async (id) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },
}));
