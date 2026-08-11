import { sourceSummary } from "@/lib/fixtures";
import {
  ownerForRequest,
  resetFixtureTasks,
  routeError,
  unauthorizedResponse,
} from "@/lib/task-store";

export async function POST(request: Request) {
  const ownerId = ownerForRequest(request);
  if (!ownerId) return unauthorizedResponse();

  try {
    return Response.json({
      tasks: await resetFixtureTasks(ownerId),
      ...sourceSummary(),
      message: "Board reset.",
    });
  } catch (error) {
    return routeError(error);
  }
}
