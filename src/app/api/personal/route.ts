import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VPersonalTaskSchema } from "@/validations/schemas/vpersonal-schema";
import { createPersonalTask, getPersonalTasks } from "@/services/database/personal-db-service";

export async function GET() {
  const tasks = await getPersonalTasks();
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = parse(VPersonalTaskSchema, body);
  const task = await createPersonalTask(data);
  return NextResponse.json(task, { status: 201 });
}
