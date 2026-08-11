import { sourceSummary } from "@/lib/fixtures";

export function GET() {
  return Response.json(sourceSummary());
}
