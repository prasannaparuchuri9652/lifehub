import { auth } from "@/auth";
import AppShell from "@/components/layout/AppShell";
import DashboardStats from "@/components/dashboard/DashboardStats";

export const metadata = { title: "Dashboard — LifeHub" };

export default async function DashboardPage() {
  const session = await auth();
  const name = (session?.user?.name ?? session?.user?.email ?? "there").split(" ")[0];

  return (
    <AppShell>
      <div className="p-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {name} 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">Here&apos;s your life at a glance.</p>
        </div>
        <DashboardStats />
      </div>
    </AppShell>
  );
}
