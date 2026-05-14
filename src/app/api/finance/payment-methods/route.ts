import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VPaymentMethodSchema } from "@/validations/schemas/vfinance-schema";
import { createPaymentMethod, getPaymentMethods } from "@/services/database/finance-db-service";

export async function GET() {
  const data = await getPaymentMethods();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = parse(VPaymentMethodSchema, body);
  const method = await createPaymentMethod(data);
  return NextResponse.json(method, { status: 201 });
}
