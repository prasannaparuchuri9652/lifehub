import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Personal — LifeHub" };

export default function PersonalPage() {
  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-xl font-bold text-slate-900">Personal</h1>
        <p className="text-sm text-slate-500 mt-1">Home todos, habits &amp; goals — coming in Phase 3.</p>
      </div>
    </AppShell>
  );
}
