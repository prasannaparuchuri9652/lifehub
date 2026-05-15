import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VProjectSchema } from "@/validations/schemas/vtask-schema";
import { updateProject, deleteProject } from "@/services/database/task-db-service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = parse(VProjectSchema, body);
  const project = await updateProject(Number(id), data);
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteProject(Number(id));
  return NextResponse.json({ success: true });
}
