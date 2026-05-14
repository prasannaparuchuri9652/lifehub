import { NextResponse } from "next/server";
import { parse, ValiError } from "valibot";
import { VProjectSchema } from "@/validations/schemas/vtask-schema";
import { createProject, getProjects } from "@/services/database/task-db-service";

export async function GET() {
  const data = await getProjects();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = parse(VProjectSchema, body);
    const project = await createProject(data);
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof ValiError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
