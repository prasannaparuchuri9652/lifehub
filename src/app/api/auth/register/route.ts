import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { parse, ValiError } from "valibot";
import { VRegisterSchema } from "@/validations/schemas/vauth-schema";
import db from "@/database/client";
import { users } from "@/database/schema/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = parse(VRegisterSchema, body);

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(data.password, 12);

    const [user] = await db
      .insert(users)
      .values({ name: data.name, email: data.email, password: hashed })
      .returning({ id: users.id, email: users.email });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof ValiError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Validation failed." },
        { status: 400 }
      );
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
