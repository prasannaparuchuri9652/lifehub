import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VExpenseSchema } from "@/validations/schemas/vfinance-schema";
import { createExpense, getExpenses } from "@/services/database/finance-db-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? undefined;
  const data = await getExpenses(month);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = parse(VExpenseSchema, body);
  const expense = await createExpense(data);
  return NextResponse.json(expense, { status: 201 });
}
