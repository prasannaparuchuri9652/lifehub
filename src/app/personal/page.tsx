import AppShell from "@/components/layout/AppShell";
import PersonalBoard from "@/components/personal/PersonalBoard";

export const metadata = { title: "Personal — LifeHub" };

export default function PersonalPage() {
  return (
    <AppShell>
      <div className="flex flex-col h-full p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">Personal</h1>
          <p className="text-sm text-slate-500 mt-0.5">Home tasks, habits &amp; streaks</p>
        </div>
        <PersonalBoard />
      </div>
    </AppShell>
  );
}
