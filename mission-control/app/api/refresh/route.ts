import { sourceSummary } from "@/lib/fixtures";
import {
  listTasks,
  ownerForRequest,
  routeError,
  seedMissingFixtureTasks,
  unauthorizedResponse,
} from "@/lib/task-store";

export async function POST(request: Request) {
  const ownerId = ownerForRequest(request);
  if (!ownerId) return unauthorizedResponse();

  try {
    await seedMissingFixtureTasks(ownerId);
    return Response.json({
      tasks: await listTasks(ownerId),
      ...sourceSummary(),
      message: "Sources refreshed.",
    });
  } catch (error) {
    return routeError(error);
  }
}
