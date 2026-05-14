import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VHabitSchema } from "@/validations/schemas/vpersonal-schema";
import { createHabit, getHabitStreaks, getHabits } from "@/services/database/personal-db-service";

export async function GET() {
  const [habits, streaks] = await Promise.all([getHabits(), getHabitStreaks()]);
  return NextResponse.json(
    habits.map((h) => ({ ...h, ...(streaks[h.id] ?? { streak: 0, total: 0, todayDone: false }) }))
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = parse(VHabitSchema, body);
  const habit = await createHabit(data);
  return NextResponse.json(habit, { status: 201 });
}
