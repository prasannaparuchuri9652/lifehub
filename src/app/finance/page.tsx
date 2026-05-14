import AppShell from "@/components/layout/AppShell";
import FinanceBoard from "@/components/finance/FinanceBoard";

export const metadata = { title: "Finance — LifeHub" };

export default function FinancePage() {
  return (
    <AppShell>
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">Finance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Expenses, budgets &amp; payment methods</p>
        </div>
        <FinanceBoard />
      </div>
    </AppShell>
  );
}
