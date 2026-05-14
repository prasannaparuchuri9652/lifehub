import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VHabitLogSchema } from "@/validations/schemas/vpersonal-schema";
import { deleteHabitLog, logHabit } from "@/services/database/personal-db-service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = parse(VHabitLogSchema, body);
  const log = await logHabit(Number(id), data);
  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { logId } = await req.json();
  await deleteHabitLog(logId ?? Number(id));
  return NextResponse.json({ success: true });
}
