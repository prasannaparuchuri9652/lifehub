import { create } from "zustand";

export interface PersonalTask {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  category?: string | null;
  due_date?: string | Date | null;
  is_recurring?: boolean | null;
  recurrence?: string | null;
  completed_at?: string | Date | null;
}

export interface Habit {
  id: number;
  name: string;
  description?: string | null;
  frequency: string;
  color?: string | null;
  streak: number;
  total: number;
  todayDone: boolean;
}

interface PersonalStore {
  tasks: PersonalTask[];
  habits: Habit[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  fetchHabits: () => Promise<void>;
  createTask: (data: Partial<PersonalTask>) => Promise<void>;
  updateTask: (id: number, data: Partial<PersonalTask>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  createHabit: (data: { name: string; description?: string; frequency?: string; color?: string }) => Promise<void>;
  logHabit: (habitId: number) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
}

export const usePersonalStore = create<PersonalStore>((set, get) => ({
  tasks: [],
  habits: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    const res = await fetch("/api/personal");
    const tasks = await res.json();
    set({ tasks, loading: false });
  },

  fetchHabits: async () => {
    const res = await fetch("/api/habits");
    const habits = await res.json();
    set({ habits });
  },

  createTask: async (data) => {
    const res = await fetch("/api/personal", {
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
    const res = await fetch(`/api/personal/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...existing, ...data }),
    });
    const updated = await res.json();
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)) }));
  },

  deleteTask: async (id) => {
    await fetch(`/api/personal/${id}`, { method: "DELETE" });
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  createHabit: async (data) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const habit = await res.json();
    set((s) => ({ habits: [...s.habits, { ...habit, streak: 0, total: 0, todayDone: false }] }));
  },

  logHabit: async (habitId) => {
    const today = new Date().toISOString().slice(0, 10);
    await fetch(`/api/habits/${habitId}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logged_date: today }),
    });
    await get().fetchHabits();
  },

  deleteHabit: async (id) => {
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
  },
}));
