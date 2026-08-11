import calendar from "@/fixtures/calendar.json";
import gmail from "@/fixtures/gmail.json";
import slack from "@/fixtures/slack.json";
import taskFixture from "@/fixtures/tasks.json";

export const REFERENCE_DATE = taskFixture.referenceDate;
export const TIME_ZONE = taskFixture.timeZone;

export const TASK_STATUSES = [
  "urgent",
  "todo",
  "blocked",
  "backlog",
  "done",
] as const;

export const TASK_SOURCES = ["slack", "gmail", "calendar", "manual"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskSource = (typeof TASK_SOURCES)[number];

export type DashboardTask = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  status: TaskStatus;
  source: TaskSource;
  person: string;
  dueAt: string | null;
  sourceId: string | null;
  waitingOn: string | null;
  url: string | null;
  isManual: boolean;
  createdAt: string;
  updatedAt: string;
};

export const fixtureSources = {
  slack,
  gmail,
  calendar,
  tasks: taskFixture,
};

export function fixtureTasksForOwner(ownerId: string): DashboardTask[] {
  return taskFixture.tasks.map((task) => ({
    id: `${ownerId}:${task.id}`,
    ownerId,
    title: task.title,
    description: task.description,
    status: task.status as TaskStatus,
    source: task.source as TaskSource,
    person: task.person,
    dueAt: task.dueAt ?? null,
    sourceId: task.sourceId ?? null,
    waitingOn: "waitingOn" in task ? (task.waitingOn ?? null) : null,
    url: task.url ?? null,
    isManual: false,
    createdAt: REFERENCE_DATE,
    updatedAt: REFERENCE_DATE,
  }));
}

export function sourceSummary() {
  return {
    fictional: true,
    referenceDate: REFERENCE_DATE,
    timeZone: TIME_ZONE,
    connections: {
      slack: { connected: false, mode: "fictional-fixture", count: slack.messages.length },
      gmail: { connected: false, mode: "fictional-fixture", count: gmail.messages.length },
      calendar: {
        connected: false,
        mode: "fictional-fixture",
        count: calendar.events.length,
      },
    },
    inbox: [
      ...slack.messages
        .filter((message) => message.needsResponse)
        .map((message) => ({
          id: message.id,
          source: "slack" as const,
          person: message.author,
          title: message.channel,
          preview: message.text,
          timestamp: message.sentAt,
          url: message.url,
        })),
      ...gmail.messages
        .filter((message) => message.needsResponse)
        .map((message) => ({
          id: message.id,
          source: "gmail" as const,
          person: message.from.split(" <")[0],
          title: message.subject,
          preview: message.preview,
          timestamp: message.receivedAt,
          url: message.url,
        })),
    ].sort((left, right) => right.timestamp.localeCompare(left.timestamp)),
    schedule: calendar.events,
  };
}
