import { NextResponse } from "next/server";
import { deletePaymentMethod } from "@/services/database/finance-db-service";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deletePaymentMethod(Number(id));
  return NextResponse.json({ success: true });
}
