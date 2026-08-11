import { env } from "cloudflare:workers";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { missionTasks } from "@/db/schema";
import {
  fixtureTasksForOwner,
  TASK_STATUSES,
  type DashboardTask,
  type TaskStatus,
} from "@/lib/fixtures";

const tableStatement = `CREATE TABLE IF NOT EXISTS mission_tasks (
  id text PRIMARY KEY NOT NULL,
  owner_id text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '' NOT NULL,
  status text NOT NULL,
  source text NOT NULL,
  person text DEFAULT '' NOT NULL,
  due_at text,
  source_id text,
  waiting_on text,
  url text,
  is_manual integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
)`;

async function ensureDatabase() {
  if (!env.DB) {
    throw new Error("This site requires its dedicated Sites D1 database binding.");
  }

  await env.DB.batch([
    env.DB.prepare(tableStatement),
    env.DB.prepare(
      "CREATE INDEX IF NOT EXISTS idx_mission_tasks_owner_status ON mission_tasks (owner_id, status)",
    ),
  ]);

  return getDb();
}

export function ownerForRequest(request: Request): string | null {
  const authenticatedOwner = request.headers
    .get("oai-authenticated-user-id")
    ?.trim();

  if (authenticatedOwner) return authenticatedOwner;

  const { hostname } = new URL(request.url);
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
    ? "local-workshop-demo"
    : null;
}

export async function seedMissingFixtureTasks(ownerId: string) {
  const db = await ensureDatabase();
  const fixtures = fixtureTasksForOwner(ownerId);

  // D1 limits each prepared statement to 100 bound variables. Each task has
  // 14 fields, so keep fixture inserts well below that limit.
  for (let offset = 0; offset < fixtures.length; offset += 6) {
    await db
      .insert(missionTasks)
      .values(fixtures.slice(offset, offset + 6))
      .onConflictDoUpdate({
        target: missionTasks.id,
        set: {
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          source: sql`excluded.source`,
          person: sql`excluded.person`,
          dueAt: sql`excluded.due_at`,
          sourceId: sql`excluded.source_id`,
          waitingOn: sql`excluded.waiting_on`,
          url: sql`excluded.url`,
        },
      });
  }

  return db;
}

export async function listTasks(ownerId: string): Promise<DashboardTask[]> {
  const db = await seedMissingFixtureTasks(ownerId);
  return db
    .select()
    .from(missionTasks)
    .where(eq(missionTasks.ownerId, ownerId))
    .orderBy(asc(missionTasks.dueAt), asc(missionTasks.createdAt));
}

export async function createManualTask(
  ownerId: string,
  input: {
    title: string;
    description?: string;
    status?: TaskStatus;
    dueAt?: string | null;
  },
) {
  const db = await ensureDatabase();
  const timestamp = new Date().toISOString();
  const [task] = await db
    .insert(missionTasks)
    .values({
      id: `${ownerId}:manual:${crypto.randomUUID()}`,
      ownerId,
      title: input.title,
      description: input.description?.trim() ?? "",
      status: input.status ?? "todo",
      source: "manual",
      person: "You",
      dueAt: input.dueAt ?? null,
      sourceId: null,
      waitingOn: null,
      url: null,
      isManual: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  return task;
}

export async function updateTaskStatus(
  ownerId: string,
  taskId: string,
  status: TaskStatus,
) {
  const db = await ensureDatabase();
  const [task] = await db
    .update(missionTasks)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(and(eq(missionTasks.id, taskId), eq(missionTasks.ownerId, ownerId)))
    .returning();

  return task ?? null;
}

export async function resetFixtureTasks(ownerId: string) {
  const db = await ensureDatabase();
  await db.delete(missionTasks).where(eq(missionTasks.ownerId, ownerId));
  await seedMissingFixtureTasks(ownerId);
  return listTasks(ownerId);
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && TASK_STATUSES.includes(value as TaskStatus);
}

export function unauthorizedResponse() {
  return Response.json(
    { error: "Sign in to access your own workshop tasks." },
    { status: 401 },
  );
}

export function routeError(error: unknown) {
  console.error("Mission Control task route failed", error);
  return Response.json(
    { error: "The workshop task database is temporarily unavailable." },
    { status: 500 },
  );
}
