import { auth } from "@/auth";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";

export const metadata = { title: "Dashboard — LifeHub" };

const modules = [
  {
    href: "/work",
    label: "Work",
    description: "Tasks, projects, deadlines",
    color: "bg-indigo-50 border-indigo-200 hover:border-indigo-400",
    iconColor: "text-indigo-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/personal",
    label: "Personal",
    description: "Home todos, habits, goals",
    color: "bg-violet-50 border-violet-200 hover:border-violet-400",
    iconColor: "text-violet-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/finance",
    label: "Finance",
    description: "Expenses, budgets, payments",
    color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
    iconColor: "text-emerald-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "there";

  return (
    <AppShell>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {name.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Here&apos;s your life at a glance.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`flex flex-col gap-3 p-5 rounded-xl border-2 transition-colors ${m.color}`}
            >
              <span className={m.iconColor}>{m.icon}</span>
              <div>
                <p className="font-semibold text-slate-900">{m.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
