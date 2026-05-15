import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VHabitSchema } from "@/validations/schemas/vpersonal-schema";
import { updateHabit, deleteHabit } from "@/services/database/personal-db-service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = parse(VHabitSchema, body);
  const habit = await updateHabit(Number(id), data);
  return NextResponse.json(habit);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteHabit(Number(id));
  return NextResponse.json({ success: true });
}
