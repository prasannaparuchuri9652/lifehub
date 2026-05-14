import { NextResponse } from "next/server";
import { parse, ValiError } from "valibot";
import { VWorkTaskSchema } from "@/validations/schemas/vtask-schema";
import { updateWorkTask, deleteWorkTask } from "@/services/database/task-db-service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = parse(VWorkTaskSchema, body);
    const task = await updateWorkTask(Number(id), data);
    return NextResponse.json(task);
  } catch (err) {
    if (err instanceof ValiError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteWorkTask(Number(id));
  return NextResponse.json({ success: true });
}
