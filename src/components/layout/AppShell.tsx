import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={session.user ?? { name: null, email: null }} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
