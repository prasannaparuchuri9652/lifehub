import { NextResponse } from "next/server";
import { getExpenseSummary } from "@/services/database/finance-db-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? undefined;
  const data = await getExpenseSummary(month);
  return NextResponse.json(data);
}
