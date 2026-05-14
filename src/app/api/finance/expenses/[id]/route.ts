import { NextResponse } from "next/server";
import { deleteExpense } from "@/services/database/finance-db-service";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteExpense(Number(id));
  return NextResponse.json({ success: true });
}
