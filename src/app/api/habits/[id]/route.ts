import { NextResponse } from "next/server";
import { deleteHabit } from "@/services/database/personal-db-service";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteHabit(Number(id));
  return NextResponse.json({ success: true });
}
