import {
  isTaskStatus,
  ownerForRequest,
  routeError,
  unauthorizedResponse,
  updateTaskStatus,
} from "@/lib/task-store";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ taskId: string }> },
) {
  const ownerId = ownerForRequest(request);
  if (!ownerId) return unauthorizedResponse();

  try {
    const { taskId } = await context.params;
    const body = (await request.json()) as { status?: unknown };

    if (!isTaskStatus(body.status)) {
      return Response.json({ error: "Choose a valid board column." }, { status: 400 });
    }

    const task = await updateTaskStatus(ownerId, taskId, body.status);
    if (!task) {
      return Response.json({ error: "That task was not found." }, { status: 404 });
    }

    return Response.json({ task });
  } catch (error) {
    return routeError(error);
  }
}
