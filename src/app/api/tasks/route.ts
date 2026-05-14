import { NextResponse } from "next/server";
import { parse, ValiError } from "valibot";
import { VWorkTaskSchema } from "@/validations/schemas/vtask-schema";
import { createWorkTask, getWorkTasks } from "@/services/database/task-db-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const tasks = await getWorkTasks(projectId ? Number(projectId) : undefined);
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = parse(VWorkTaskSchema, body);
    const task = await createWorkTask(data);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof ValiError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
