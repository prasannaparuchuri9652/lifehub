import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Finance — LifeHub" };

export default function FinancePage() {
  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-xl font-bold text-slate-900">Finance</h1>
        <p className="text-sm text-slate-500 mt-1">Expenses, budgets &amp; payment tracking — coming in Phase 4.</p>
      </div>
    </AppShell>
  );
}
