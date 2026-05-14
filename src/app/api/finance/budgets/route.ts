import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VBudgetSchema } from "@/validations/schemas/vfinance-schema";
import { getBudgets, upsertBudget } from "@/services/database/finance-db-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? undefined;
  const data = await getBudgets(month);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = parse(VBudgetSchema, body);
  const budget = await upsertBudget(data);
  return NextResponse.json(budget, { status: 201 });
}
