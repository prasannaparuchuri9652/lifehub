import { create } from "zustand";

export interface Expense {
  id: number;
  amount: string;
  category: string;
  description?: string | null;
  expense_date: string;
  payment_method_id?: number | null;
  payment_label?: string | null;
  payment_type?: string | null;
}

export interface Budget {
  id: number;
  category: string;
  amount: string;
  month: string;
}

export interface PaymentMethod {
  id: number;
  type: string;
  label: string;
  last_four?: string | null;
  upi_id?: string | null;
  is_default?: boolean | null;
}

export interface CategorySummary {
  category: string;
  total: number;
}

interface FinanceStore {
  expenses: Expense[];
  budgets: Budget[];
  paymentMethods: PaymentMethod[];
  summary: CategorySummary[];
  month: string;
  loading: boolean;
  setMonth: (month: string) => void;
  fetchAll: (month?: string) => Promise<void>;
  addExpense: (data: Partial<Expense>) => Promise<void>;
  updateExpense: (id: number, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  upsertBudget: (data: { category: string; amount: string; month: string }) => Promise<void>;
  addPaymentMethod: (data: Partial<PaymentMethod>) => Promise<void>;
  updatePaymentMethod: (id: number, data: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: number) => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  expenses: [],
  budgets: [],
  paymentMethods: [],
  summary: [],
  month: new Date().toISOString().slice(0, 7),
  loading: false,

  setMonth: (month) => {
    set({ month });
    get().fetchAll(month);
  },

  fetchAll: async (month) => {
    const m = month ?? get().month;
    set({ loading: true });
    const [expenses, budgets, paymentMethods, summary] = await Promise.all([
      fetch(`/api/finance/expenses?month=${m}`).then((r) => r.json()),
      fetch(`/api/finance/budgets?month=${m}`).then((r) => r.json()),
      fetch("/api/finance/payment-methods").then((r) => r.json()),
      fetch(`/api/finance/summary?month=${m}`).then((r) => r.json()),
    ]);
    set({ expenses, budgets, paymentMethods, summary, loading: false });
  },

  addExpense: async (data) => {
    const res = await fetch("/api/finance/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const expense = await res.json();
    set((s) => ({ expenses: [expense, ...s.expenses] }));
    await get().fetchAll();
  },

  updateExpense: async (id, data) => {
    const res = await fetch(`/api/finance/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updated } : e)) }));
    await get().fetchAll();
  },

  deleteExpense: async (id) => {
    await fetch(`/api/finance/expenses/${id}`, { method: "DELETE" });
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
    await get().fetchAll();
  },

  upsertBudget: async (data) => {
    const res = await fetch("/api/finance/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const budget = await res.json();
    set((s) => ({
      budgets: s.budgets.some((b) => b.id === budget.id)
        ? s.budgets.map((b) => (b.id === budget.id ? budget : b))
        : [...s.budgets, budget],
    }));
  },

  addPaymentMethod: async (data) => {
    const res = await fetch("/api/finance/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const method = await res.json();
    set((s) => ({ paymentMethods: [...s.paymentMethods, method] }));
  },

  updatePaymentMethod: async (id, data) => {
    const res = await fetch(`/api/finance/payment-methods/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    set((s) => ({ paymentMethods: s.paymentMethods.map((m) => (m.id === id ? { ...m, ...updated } : m)) }));
  },

  deletePaymentMethod: async (id) => {
    await fetch(`/api/finance/payment-methods/${id}`, { method: "DELETE" });
    set((s) => ({ paymentMethods: s.paymentMethods.filter((m) => m.id !== id) }));
  },
}));
