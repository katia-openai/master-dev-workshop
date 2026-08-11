import { sourceSummary } from "@/lib/fixtures";
import {
  createManualTask,
  isTaskStatus,
  listTasks,
  ownerForRequest,
  routeError,
  unauthorizedResponse,
} from "@/lib/task-store";

export async function GET(request: Request) {
  const ownerId = ownerForRequest(request);
  if (!ownerId) return unauthorizedResponse();

  try {
    const tasks = await listTasks(ownerId);
    return Response.json({ tasks, ...sourceSummary() });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  const ownerId = ownerForRequest(request);
  if (!ownerId) return unauthorizedResponse();

  try {
    const body = (await request.json()) as {
      title?: unknown;
      description?: unknown;
      status?: unknown;
      dueAt?: unknown;
    };
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title || title.length > 160) {
      return Response.json(
        { error: "Add a task title between 1 and 160 characters." },
        { status: 400 },
      );
    }

    if (body.status !== undefined && !isTaskStatus(body.status)) {
      return Response.json({ error: "Choose a valid board column." }, { status: 400 });
    }

    const task = await createManualTask(ownerId, {
      title,
      description: typeof body.description === "string" ? body.description : "",
      status: body.status,
      dueAt: typeof body.dueAt === "string" && body.dueAt ? body.dueAt : null,
    });

    return Response.json({ task }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
