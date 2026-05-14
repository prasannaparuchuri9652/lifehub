import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VPersonalTaskSchema } from "@/validations/schemas/vpersonal-schema";
import { deletePersonalTask, updatePersonalTask } from "@/services/database/personal-db-service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = parse(VPersonalTaskSchema, body);
  const task = await updatePersonalTask(Number(id), data);
  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deletePersonalTask(Number(id));
  return NextResponse.json({ success: true });
}
