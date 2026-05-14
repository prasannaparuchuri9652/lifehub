import AppShell from "@/components/layout/AppShell";
import WorkBoard from "@/components/work/WorkBoard";

export const metadata = { title: "Work — LifeHub" };

export default function WorkPage() {
  return (
    <AppShell>
      <div className="flex flex-col h-full p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">Work</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage tasks and projects</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <WorkBoard />
        </div>
      </div>
    </AppShell>
  );
}
