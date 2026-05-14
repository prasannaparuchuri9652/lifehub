import { NextResponse } from "next/server";
import { getWorkStats, getPersonalStats, getFinanceStats } from "@/services/database/dashboard-db-service";

export async function GET() {
  const [work, personal, finance] = await Promise.all([
    getWorkStats(),
    getPersonalStats(),
    getFinanceStats(),
  ]);
  return NextResponse.json({ work, personal, finance });
}
