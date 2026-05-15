import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VPaymentMethodSchema } from "@/validations/schemas/vfinance-schema";
import { updatePaymentMethod, deletePaymentMethod } from "@/services/database/finance-db-service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = parse(VPaymentMethodSchema, body);
  const method = await updatePaymentMethod(Number(id), data);
  return NextResponse.json(method);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deletePaymentMethod(Number(id));
  return NextResponse.json({ success: true });
}
