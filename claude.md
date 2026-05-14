# CLAUDE.md — LifeHub Desktop App

## Project Overview

**LifeHub** is a desktop application built with Next.js + Tauri managing three life domains in one codebase.

| Module | Purpose |
|--------|---------|
| **Work** | Office tasks, deadlines, project progress |
| **Personal** | Home todos, habits, goals, reminders |
| **Finance** | Expense tracking, budgets, card/UPI payment records |

**Database:** Neon (serverless PostgreSQL) via **Drizzle ORM** — same pattern as api.landcare.com.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri (Rust) — added later |
| Frontend + API | Next.js 14 (App Router) |
| Database | Neon (PostgreSQL) |
| ORM | Drizzle ORM (drizzle-orm/node-postgres) |
| DB Client | pg (node-postgres) Pool |
| Auth | Auth.js v5 (NextAuth) + Drizzle adapter |
| Password hashing | bcryptjs |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand |
| Notifications | Tauri notification plugin — added later |
| Validation | Valibot |
| Dates | date-fns |
| Language | TypeScript (strict) |

---

## Why Tauri for Desktop?

Tauri wraps your Next.js app into a native desktop binary (.exe / .dmg / .AppImage) without a full browser installation. It gives you:
- **OS notifications** — native reminders that appear in the system tray
- **Single installable binary** — users install it like any other desktop app
- **~10MB size** vs Electron's ~150MB, because Tauri uses the OS webview (Edge on Windows, WebKit on macOS/Linux)
- **Next.js stays unchanged** — Tauri is just the shell; all your UI and API routes work exactly as they would in a browser

If you later decide you want a web app only, you can drop Tauri and deploy to Vercel with zero changes to the Next.js code.

---

## Authentication — Auth.js v5 + Email/Password

### How it works

- User registers with name, email, password
- Password is hashed with **bcryptjs** before storing
- Auth.js `CredentialsProvider` handles login — verifies email exists and password matches hash
- On success, Auth.js creates a session (stored in Neon via Drizzle adapter)
- All module pages are protected — unauthenticated users are redirected to `/login`

### Auth pages

| Route | Purpose |
|-------|---------|
| `/login` | Email + password login form |
| `/register` | New account signup form |
| `/` (dashboard) | Protected — requires session |

### Auth schema (Drizzle) — src/database/schema/auth.ts

Auth.js Drizzle adapter requires these four tables:

```typescript
import { integer, pgTable, primaryKey, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }),          // hashed — null for OAuth users
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar({ length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar({ length: 255 }).notNull(),
  provider: varchar({ length: 255 }).notNull(),
  providerAccountId: varchar({ length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar({ length: 255 }),
  scope: varchar({ length: 255 }),
  id_token: text("id_token"),
  session_state: varchar({ length: 255 }),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: varchar({ length: 255 }).primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verification_tokens = pgTable("verificationTokens", {
  identifier: varchar({ length: 255 }).notNull(),
  token: varchar({ length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### src/auth.ts (Auth.js config)

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db, { schema } from "@/database/client";
import { users } from "@/database/schema/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, schema),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return { id: String(user.id), name: user.name, email: user.email };
      },
    }),
  ],
});
```

### src/app/api/auth/[...nextauth]/route.ts

```typescript
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### src/app/api/auth/register/route.ts

```typescript
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { parse } from "valibot";
import { VRegisterSchema } from "@/validations/schemas/vauth-schema";
import db from "@/database/client";
import { users } from "@/database/schema/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const data = parse(VRegisterSchema, body);

  const [existing] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(data.password, 12);
  const [user] = await db.insert(users).values({
    name: data.name,
    email: data.email,
    password: hashed,
  }).returning({ id: users.id, email: users.email });

  return NextResponse.json(user, { status: 201 });
}
```

### src/validations/schemas/vauth-schema.ts

```typescript
import type { InferOutput } from "valibot";
import { email, minLength, nonEmpty, object, pipe, string, transform } from "valibot";

export const VLoginSchema = object({
  email: pipe(string(), email("Invalid email")),
  password: pipe(string(), nonEmpty("Password is required")),
});

export const VRegisterSchema = object({
  name: pipe(string(), nonEmpty("Name is required"), transform((v) => v.trim())),
  email: pipe(string(), email("Invalid email")),
  password: pipe(string(), minLength(8, "Password must be at least 8 characters")),
});

export type ValidatedLogin = InferOutput<typeof VLoginSchema>;
export type ValidatedRegister = InferOutput<typeof VRegisterSchema>;
```

### Route protection — src/middleware.ts

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/register");

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
```

### Login page — src/app/login/page.tsx

```tsx
"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-xl shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">LifeHub</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" required
            className="w-full border rounded-md px-3 py-2 text-sm" />
          <input name="password" type="password" placeholder="Password" required
            className="w-full border rounded-md px-3 py-2 text-sm" />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button type="submit"
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium">
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          No account? <a href="/register" className="underline">Register</a>
        </p>
      </div>
    </div>
  );
}
```

### Auth install commands

```bash
npm install next-auth@beta @auth/drizzle-adapter bcryptjs
npm install -D @types/bcryptjs
```

Add to `.env`:

```env
AUTH_SECRET=your_random_secret_here
```

Generate a secret: `npx auth secret`

---

## Neon Database Setup

Your Neon project is already configured. The `.env` file is set up with your pooler connection string.

```env
DATABASE_URL="postgresql://neondb_owner:***@ep-raspy-frost-ahdkz9ql-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
AUTH_SECRET=""   # generate with: npx auth secret
```

Run to create all tables: `npx drizzle-kit generate && npx drizzle-kit migrate`

> Using the **pooler** endpoint — this handles connection limits automatically (important for Next.js serverless routes).

---

## Folder Structure

```
todo_project/
├── src-tauri/
│   ├── src/main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── work/page.tsx
│   │   ├── personal/page.tsx
│   │   ├── finance/page.tsx
│   │   └── api/
│   │       ├── tasks/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── personal/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── finance/
│   │       │   ├── expenses/route.ts
│   │       │   └── payment-methods/route.ts
│   │       └── reminders/
│   │           ├── route.ts
│   │           └── [id]/read/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ReminderBadge.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── work/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── ProjectProgress.tsx
│   │   ├── personal/
│   │   │   ├── HomeTaskList.tsx
│   │   │   ├── HabitTracker.tsx
│   │   │   └── GoalCard.tsx
│   │   └── finance/
│   │       ├── ExpenseForm.tsx
│   │       ├── PaymentMethodCard.tsx
│   │       ├── BudgetBar.tsx
│   │       └── ExpenseSummary.tsx
│   ├── database/
│   │   ├── client.ts             # Drizzle + pg Pool
│   │   └── schema/
│   │       ├── reminders.ts
│   │       ├── work-tasks.ts
│   │       ├── projects.ts
│   │       ├── personal-tasks.ts
│   │       ├── habits.ts
│   │       ├── habit-logs.ts
│   │       ├── expenses.ts
│   │       ├── budgets.ts
│   │       └── payment-methods.ts
│   ├── services/
│   │   └── database/
│   │       ├── base-db-service.ts
│   │       ├── task-db-service.ts
│   │       ├── personal-db-service.ts
│   │       ├── finance-db-service.ts
│   │       └── reminder-db-service.ts
│   ├── validations/
│   │   └── schemas/
│   │       ├── vtask-schema.ts
│   │       ├── vpersonal-schema.ts
│   │       └── vfinance-schema.ts
│   ├── helpers/
│   │   └── app-helper.ts
│   ├── config/
│   │   └── db-config.ts
│   ├── store/
│   │   ├── workStore.ts
│   │   ├── personalStore.ts
│   │   └── financeStore.ts
│   └── lib/
│       └── reminder.ts
├── drizzle.config.ts
├── migrations/
├── .env
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema/*",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## src/database/client.ts

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as reminders from "./schema/reminders.js";
import * as work_tasks from "./schema/work-tasks.js";
import * as projects from "./schema/projects.js";
import * as personal_tasks from "./schema/personal-tasks.js";
import * as habits from "./schema/habits.js";
import * as habit_logs from "./schema/habit-logs.js";
import * as expenses from "./schema/expenses.js";
import * as budgets from "./schema/budgets.js";
import * as payment_methods from "./schema/payment-methods.js";
import * as auth_tables from "./schema/auth.js";

const { Pool } = pg;

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const schema = {
  ...auth_tables,
  ...reminders,
  ...work_tasks,
  ...projects,
  ...personal_tasks,
  ...habits,
  ...habit_logs,
  ...expenses,
  ...budgets,
  ...payment_methods,
};

const db = drizzle(dbClient, { schema });

try {
  await db.execute("select 1");
} catch (err) {
  console.error("DB connection failed", err);
  process.exit(1);
}

export default db;
```

---

## src/helpers/app-helper.ts

```typescript
import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
};
```

---

## Schema Files (same pattern as api.landcare.com)

### src/database/schema/work-tasks.ts

```typescript
import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper.js";
import { projects } from "./projects.js";

export const work_tasks = pgTable(
  "work_tasks",
  {
    id: serial().primaryKey(),
    title: varchar().notNull(),
    description: text(),
    status: varchar().notNull().default("todo"),
    priority: varchar().notNull().default("medium"),
    project_id: integer().references(() => projects.id),
    due_date: timestamp("due_date"),
    completed_at: timestamp("completed_at"),
    tags: varchar(),
    ...timestamps,
  },
  (t) => [index("work_tasks_status_idx").on(t.status)]
);

export type WorkTask = typeof work_tasks.$inferSelect;
export type NewWorkTask = typeof work_tasks.$inferInsert;
export type WorkTasksTable = typeof work_tasks;
```

### src/database/schema/payment-methods.ts

```typescript
import { boolean, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../../helpers/app-helper.js";

export const payment_methods = pgTable("payment_methods", {
  id: serial().primaryKey(),
  type: varchar().notNull(),
  label: varchar().notNull(),
  last_four: varchar({ length: 4 }),
  upi_id: varchar(),
  is_default: boolean().default(false),
  ...timestamps,
});

export type PaymentMethod = typeof payment_methods.$inferSelect;
export type NewPaymentMethod = typeof payment_methods.$inferInsert;
```

---

## Validation — Valibot (same pattern as api.landcare.com)

### src/validations/schemas/vtask-schema.ts

```typescript
import type { InferOutput } from "valibot";
import {
  literal, nonEmpty, object, optional,
  pipe, string, transform, union
} from "valibot";

export const VWorkTaskSchema = object({
  title: pipe(string(), nonEmpty("Title is required"), transform((v) => v.trim())),
  description: optional(string()),
  status: optional(union([literal("todo"), literal("in_progress"), literal("done"), literal("blocked")])),
  priority: optional(union([literal("low"), literal("medium"), literal("high"), literal("urgent")])),
  tags: optional(string()),
});

export type ValidatedWorkTask = InferOutput<typeof VWorkTaskSchema>;
```

### src/validations/schemas/vfinance-schema.ts

```typescript
import type { InferOutput } from "valibot";
import { length, literal, nonEmpty, object, optional, pipe, regex, string, union } from "valibot";

export const VPaymentMethodSchema = object({
  type: union([literal("card"), literal("upi"), literal("cash"), literal("netbanking")]),
  label: pipe(string(), nonEmpty("Label is required")),
  last_four: optional(pipe(
    string(),
    length(4, "Must be exactly 4 digits"),
    regex(/^\d{4}$/, "Must be 4 numeric digits")
  )),
  upi_id: optional(string()),
  is_default: optional(string()),
});

export type ValidatedPaymentMethod = InferOutput<typeof VPaymentMethodSchema>;
```

---

## DB Service Pattern

### src/services/database/task-db-service.ts

```typescript
import { asc, eq, isNull } from "drizzle-orm";
import type { ValidatedWorkTask } from "../../validations/schemas/vtask-schema.js";
import db from "../../database/client.js";
import { work_tasks } from "../../database/schema/work-tasks.js";

export async function getWorkTasks() {
  return db
    .select()
    .from(work_tasks)
    .where(isNull(work_tasks.deleted_at))
    .orderBy(asc(work_tasks.created_at));
}

export async function createWorkTask(data: ValidatedWorkTask) {
  const [task] = await db.insert(work_tasks).values(data).returning();
  return task;
}

export async function updateWorkTask(id: number, data: Partial<ValidatedWorkTask>) {
  const [task] = await db
    .update(work_tasks)
    .set({ ...data, updated_at: new Date() })
    .where(eq(work_tasks.id, id))
    .returning();
  return task;
}

export async function deleteWorkTask(id: number) {
  await db
    .update(work_tasks)
    .set({ deleted_at: new Date() })
    .where(eq(work_tasks.id, id));
}
```

---

## API Route Pattern

### src/app/api/tasks/route.ts

```typescript
import { NextResponse } from "next/server";
import { parse } from "valibot";
import { VWorkTaskSchema } from "@/validations/schemas/vtask-schema";
import { createWorkTask, getWorkTasks } from "@/services/database/task-db-service";

export async function GET() {
  const tasks = await getWorkTasks();
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = parse(VWorkTaskSchema, body);
  const task = await createWorkTask(data);
  return NextResponse.json(task, { status: 201 });
}
```

---

## Development Phases

### Phase 1 — Foundation + Auth (Week 1-2)
**Goal:** App runs in browser, Neon connected, login/register working.

**1a — Next.js + DB setup**
- [ ] `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
- [ ] `npm install drizzle-orm pg && npm install -D drizzle-kit @types/pg`
- [ ] `npm install valibot zustand date-fns`
- [ ] `.env` already created with DATABASE_URL (Neon pooler) and AUTH_SECRET placeholder
- [ ] Run `npx auth secret` to fill in AUTH_SECRET in `.env`
- [ ] Create `src/helpers/app-helper.ts` with timestamps helper
- [ ] Write all schema files in `src/database/schema/` (including `auth.ts`)
- [ ] Create `src/database/client.ts` — import all schemas including auth tables
- [ ] Create `drizzle.config.ts`
- [ ] `npx drizzle-kit generate && npx drizzle-kit migrate`

**1b — Auth.js setup**
- [ ] `npm install next-auth@beta @auth/drizzle-adapter bcryptjs`
- [ ] `npm install -D @types/bcryptjs`
- [ ] `npx auth secret` — generates AUTH_SECRET, add to `.env`
- [ ] Create `src/auth.ts` with CredentialsProvider
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Create `src/app/api/auth/register/route.ts`
- [ ] Create `src/validations/schemas/vauth-schema.ts`
- [ ] Create `src/middleware.ts` for route protection
- [ ] Build `/login` page
- [ ] Build `/register` page
- [ ] Test: register → login → redirect to dashboard → logout

**1c — Shell**
- [ ] `npx shadcn@latest init`
- [ ] Base layout with sidebar: Work / Personal / Finance / Dashboard
- [ ] `npm run dev` — confirm app opens at localhost:3000

**Deliverable:** Register, login, see dashboard. All Neon tables created. Sidebar navigates.

---

### Phase 2 — Work Module (Week 3-4)
**Goal:** Full CRUD for tasks and projects.

- [ ] Schema: `work-tasks.ts`, `projects.ts`
- [ ] Valibot: `vtask-schema.ts`
- [ ] DB service: `task-db-service.ts`
- [ ] API: `/api/tasks` GET + POST, `/api/tasks/[id]` GET + PUT + DELETE
- [ ] Components: `TaskForm`, `TaskList` (Todo / In Progress / Done / Blocked), `ProjectProgress`
- [ ] `StatusBadge` shared component
- [ ] `workStore.ts`
- [ ] Insert reminder row when task has due_date

**Deliverable:** Create, edit, soft-delete tasks. Progress per project.

---

### Phase 3 — Personal Module (Week 5-6)
**Goal:** Home todos, habits, recurring tasks.

- [ ] Schema: `personal-tasks.ts`, `habits.ts`, `habit-logs.ts`
- [ ] Valibot: `vpersonal-schema.ts`
- [ ] DB service: `personal-db-service.ts`
- [ ] API: `/api/personal` GET + POST + PUT + DELETE
- [ ] Components: `HomeTaskList`, `HabitTracker` (streak), `GoalCard`
- [ ] Recurring task auto-create on completion
- [ ] `personalStore.ts`

**Deliverable:** Home todos, habit streaks, recurring tasks.

---

### Phase 4 — Finance Module (Week 7-8)
**Goal:** Expenses, budgets, payment methods.

- [ ] Schema: `expenses.ts`, `budgets.ts`, `payment-methods.ts`
- [ ] Valibot: `vfinance-schema.ts` (last_four: length 4 + regex enforced)
- [ ] DB service: `finance-db-service.ts`
- [ ] API: `/api/finance/expenses`, `/api/finance/payment-methods`
- [ ] Components: `ExpenseForm`, `PaymentMethodCard`, `BudgetBar`, `ExpenseSummary`
- [ ] `financeStore.ts`
- [ ] Reminder at 80% budget usage per category

**Deliverable:** Log expenses, budgets tracked, card/UPI stored safely.

---

### Phase 5 — Reminder Engine + Dashboard (Week 9-10)
**Goal:** Cross-module OS notifications and unified view.

- [ ] Schema: `reminders.ts`
- [ ] DB service: `reminder-db-service.ts`
- [ ] `src/lib/reminder.ts` — query due reminders, fire Tauri OS notification
- [ ] On app start: dispatch pending reminders; 60s poll interval
- [ ] Dashboard: today tasks, habits due, budget alerts, reminder list, progress per module
- [ ] Mark reminder as read

**Deliverable:** OS notifications fire. Dashboard shows everything.

---

### Phase 6 — Polish + Build (Week 11-12)
**Goal:** Installable binary ready for daily use.

- [ ] Dark/light mode (next-themes)
- [ ] Global search across modules
- [ ] CSV export for Finance
- [ ] Settings page
- [ ] `npm run tauri build` — .msi (Windows) / .dmg (macOS) / .AppImage (Linux)
- [ ] Error boundaries + loading skeletons

**Deliverable:** Signed installable desktop app.

---

## Key Rules

1. **Drizzle via `src/database/client.ts` only.** Never create a Pool elsewhere.
2. **One schema file per table** in `src/database/schema/`. Always export `$inferSelect` and `$inferInsert` types.
3. **Valibot for all validation** — same pattern as `vnotes-schema.ts` in api.landcare.com.
4. **Soft delete always.** Use `deleted_at` timestamp, never hard-delete rows. Filter with `isNull(table.deleted_at)`.
5. **Zustand stores call `/api/` routes only.** No direct DB imports in components or stores.
6. **last_four = 4 digits max.** Valibot `length(4)` + `regex(/^\d{4}$/)` enforced at schema level.
7. **Never commit `.env`.**

---

## Setup Commands

```bash
# 1. Bootstrap Next.js
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# 2. Drizzle + Postgres
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg

# 3. Auth.js v5
npm install next-auth@beta @auth/drizzle-adapter bcryptjs
npm install -D @types/bcryptjs
npx auth secret        # paste the output into AUTH_SECRET in .env

# 4. Validation, state, dates
npm install valibot zustand date-fns

# 5. shadcn/ui
npx shadcn@latest init

# 6. Generate SQL migrations + apply to Neon
npx drizzle-kit generate
npx drizzle-kit migrate

# 7. Start dev server
npm run dev            # open localhost:3000

# --- Later: Tauri desktop shell ---
# npm install --save-dev @tauri-apps/cli
# npm run tauri init
# npm run tauri dev
```

---

## .gitignore

```
.env
src-tauri/target/
```
