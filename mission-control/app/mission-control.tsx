"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  fixtureTasksForOwner,
  REFERENCE_DATE,
  sourceSummary,
  TASK_STATUSES,
  TIME_ZONE,
  type DashboardTask,
  type TaskSource,
  type TaskStatus,
} from "@/lib/fixtures";

type DashboardResponse = ReturnType<typeof sourceSummary> & {
  tasks: DashboardTask[];
  message?: string;
  error?: string;
};

const statusLabels: Record<TaskStatus, string> = {
  urgent: "Urgent",
  todo: "To do",
  blocked: "Blocked",
  backlog: "Backlog",
  done: "Done",
};

const sourceLabels: Record<TaskSource, string> = {
  slack: "Slack",
  gmail: "Gmail",
  calendar: "Calendar",
  manual: "Manual",
};

const initialSummary = sourceSummary();

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}

function formatDue(date: string | null) {
  if (!date) return "No deadline";

  const day = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
  const referenceDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(REFERENCE_DATE));

  return `${day === referenceDay ? "Today" : day} · ${formatTime(date)}`;
}

function SourceBadge({ source }: { source: TaskSource }) {
  return (
    <span className={`source-badge source-${source}`}>
      <span className="source-dot" aria-hidden="true" />
      {sourceLabels[source]}
    </span>
  );
}

export default function MissionControl() {
  const [tasks, setTasks] = useState<DashboardTask[]>(() =>
    fixtureTasksForOwner("preview"),
  );
  const [summary, setSummary] = useState(initialSummary);
  const [sourceFilter, setSourceFilter] = useState<"all" | TaskSource>("all");
  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<DashboardTask | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [busy, setBusy] = useState<"refresh" | "reset" | "create" | null>(null);
  const [notice, setNotice] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/tasks", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as DashboardResponse;
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load your tasks.");
        }
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setTasks(data.tasks);
          setSummary(data);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setNotice(
            error instanceof Error ? error.message : "Unable to load demo tasks.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const sourceMatches = sourceFilter === "all" || task.source === sourceFilter;
      const textMatches =
        !normalizedQuery ||
        `${task.title} ${task.description} ${task.person} ${task.waitingOn ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);
      return sourceMatches && textMatches;
    });
  }, [query, sourceFilter, tasks]);

  const priorityTasks = tasks.filter((task) => task.status === "urgent").slice(0, 3);
  const waitingTasks = tasks
    .filter((task) => task.status === "blocked" && task.waitingOn)
    .slice(0, 3);
  const deadlines = tasks
    .filter((task) => task.status !== "done" && task.dueAt)
    .sort((left, right) => (left.dueAt ?? "").localeCompare(right.dueAt ?? ""))
    .slice(0, 3);

  async function moveTask(task: DashboardTask, status: TaskStatus) {
    if (task.status === status) return;

    const previousTasks = tasks;
    const optimisticTask = { ...task, status };
    setTasks((current) =>
      current.map((candidate) =>
        candidate.id === task.id ? optimisticTask : candidate,
      ),
    );
    if (selectedTask?.id === task.id) setSelectedTask(optimisticTask);

    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as {
        task?: DashboardTask;
        error?: string;
      };

      if (!response.ok || !data.task) {
        throw new Error(data.error ?? "Unable to save that task.");
      }

      const savedTask = data.task;
      setTasks((current) =>
        current.map((candidate) =>
          candidate.id === savedTask.id ? savedTask : candidate,
        ),
      );
      if (selectedTask?.id === savedTask.id) setSelectedTask(savedTask);
      setNotice(`Moved to ${statusLabels[status]}.`);
    } catch (error) {
      setTasks(previousTasks);
      setNotice(error instanceof Error ? error.message : "Unable to save that task.");
    }
  }

  async function runSourceAction(action: "refresh" | "reset") {
    if (
      action === "reset" &&
      !window.confirm(
        "Reset the board? Manually added tasks will be removed.",
      )
    ) {
      return;
    }

    setBusy(action);
    try {
      const response = await fetch(`/api/${action}`, { method: "POST" });
      const data = (await response.json()) as DashboardResponse;
      if (!response.ok) throw new Error(data.error ?? "The action could not finish.");
      setTasks(data.tasks);
      setSummary(data);
      setSelectedTask(null);
      setNotice(data.message ?? "Done.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The action could not finish.");
    } finally {
      setBusy(null);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy("create");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: fields.get("title"),
          description: fields.get("description"),
          status: fields.get("status"),
          dueAt: fields.get("dueAt") || null,
        }),
      });
      const data = (await response.json()) as {
        task?: DashboardTask;
        error?: string;
      };
      if (!response.ok || !data.task) {
        throw new Error(data.error ?? "Unable to create your task.");
      }

      setTasks((current) => [...current, data.task!]);
      setIsAdding(false);
      form.reset();
      setNotice("Task added.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to create your task.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mission-shell">
      <header className="topbar">
        <a className="wordmark" href="#main" aria-label="Mission Control home">
          <span className="wordmark-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>mission control<span className="wordmark-period">.</span></span>
        </a>
        <div className="topbar-actions">
          <button
            className="button button-soft refresh-button"
            onClick={() => void runSourceAction("refresh")}
            disabled={busy !== null}
          >
            <span aria-hidden="true">↻</span>
            {busy === "refresh" ? "Refreshing…" : "Refresh"}
          </button>
          <button className="button button-primary" onClick={() => setIsAdding(true)}>
            <span aria-hidden="true">＋</span> Add task
          </button>
        </div>
      </header>

      <section id="main" className="heading-row" aria-label="Day overview">
        <div>
          <h1>Your day <span>at a glance</span></h1>
        </div>
        <div className="day-stamp" aria-label="Fixed workshop reference date">
          <span>AUG</span>
          <strong>11</strong>
          <span>2026</span>
        </div>
      </section>

      <section className="bento" aria-label="Workday summaries">
        <article className="tile tile-today">
          <h2>Start here<span>.</span></h2>
          <div className="priority-list">
            {priorityTasks.map((task) => (
              <button
                className="priority-row"
                key={task.id}
                onClick={() => setSelectedTask(task)}
              >
                <span className="priority-copy">
                  <strong>{task.title}</strong>
                  <span>{task.person} · {formatDue(task.dueAt)}</span>
                </span>
                <span className="row-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </article>

        <article className="tile tile-inbox">
          <h2 className="tile-title">Inbox</h2>
          <div className="metric-line">
            <span className="metric-number">{summary.inbox.length}</span>
            <span className="metric-copy">need a reply</span>
          </div>
          <div className="inbox-list">
            {summary.inbox.slice(0, 3).map((message) => (
              <div className="inbox-row" key={message.id}>
                <span className="avatar avatar-lilac">{message.person.slice(0, 1)}</span>
                <span className="inbox-copy">
                  <strong>{message.person}</strong>
                  <span>{message.title}</span>
                </span>
                <span className="inbox-source">{sourceLabels[message.source]}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="tile tile-schedule">
          <h2>On the calendar</h2>
          <div className="schedule-list">
            {summary.schedule.slice(0, 3).map((event) => (
              <div className="schedule-row" key={event.id}>
                <span className="schedule-time">{formatTime(event.startsAt)}</span>
                <span className="schedule-rule" />
                <span className="schedule-copy">
                  <strong>{event.title}</strong>
                  <span>{event.attendees.length ? event.attendees.join(" + ") : "Protected focus time"}</span>
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="tile tile-waiting">
          <h2 className="tile-title">Waiting on</h2>
          <div className="waiting-avatars" aria-label="People with pending follow-ups">
            {waitingTasks.map((task, index) => (
              <span className={`waiting-avatar waiting-avatar-${index}`} key={task.id}>
                {task.waitingOn?.slice(0, 1)}
              </span>
            ))}
            <span className="waiting-total">{waitingTasks.length}</span>
          </div>
          <p className="waiting-copy">
            {waitingTasks.map((task) => task.waitingOn).join(", ")} have the next move.
          </p>
        </article>

        <article className="tile tile-deadlines">
          <h2 className="tile-title">Deadlines</h2>
          {deadlines.map((task) => (
            <button
              className="deadline-row"
              key={task.id}
              onClick={() => setSelectedTask(task)}
            >
              <span className="deadline-dot" aria-hidden="true" />
              <span className="deadline-title">{task.title}</span>
              <span className="deadline-time">{formatDue(task.dueAt)}</span>
            </button>
          ))}
        </article>
      </section>

      <section className="board-section" aria-label="Persistent task board">
        <div className="board-toolbar">
          <div>
            <h2 className="board-title">Your board<span>.</span></h2>
          </div>
          <div className="board-controls">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search tasks"
                placeholder="Find a task…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="filter-field">
              <span>Source</span>
              <select
                aria-label="Filter tasks by source"
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value as "all" | TaskSource)}
              >
                <option value="all">Everything</option>
                <option value="slack">Slack</option>
                <option value="gmail">Gmail</option>
                <option value="calendar">Calendar</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <button
              className="reset-button"
              onClick={() => void runSourceAction("reset")}
              disabled={busy !== null}
            >
              {busy === "reset" ? "Resetting…" : "Reset board"}
            </button>
          </div>
        </div>

        <div className="board-grid">
          {TASK_STATUSES.map((status) => {
            const columnTasks = visibleTasks.filter((task) => task.status === status);
            return (
              <section
                className={`board-column column-${status}`}
                key={status}
                aria-label={`${statusLabels[status]} tasks`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const task = tasks.find((candidate) => candidate.id === draggedId);
                  if (task) void moveTask(task, status);
                  setDraggedId(null);
                }}
              >
                <div className="column-heading">
                  <span><span className="column-dot" />{statusLabels[status]}</span>
                  <span className="column-count">{columnTasks.length}</span>
                </div>
                <div className="column-cards">
                  {columnTasks.map((task) => (
                    <article
                      className="task-card"
                      draggable
                      key={task.id}
                      onDragStart={() => setDraggedId(task.id)}
                      onDragEnd={() => setDraggedId(null)}
                    >
                      <button
                        className="task-open"
                        aria-label={`Show details for ${task.title}`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <span className="task-title">{task.title}</span>
                      </button>
                      {task.waitingOn && (
                        <span className="waiting-chip">↪ waiting on {task.waitingOn}</span>
                      )}
                      <div className="task-footer">
                        <SourceBadge source={task.source} />
                        <span className="task-due">{formatDue(task.dueAt)}</span>
                      </div>
                    </article>
                  ))}
                  {columnTasks.length === 0 && (
                    <span className="empty-column">Nothing here right now.</span>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <section
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-topline">
              <SourceBadge source={selectedTask.source} />
              <button className="close-button" aria-label="Close task details" onClick={() => setSelectedTask(null)}>×</button>
            </div>
            <h2 id="detail-title">{selectedTask.title}</h2>
            <p className="detail-description">{selectedTask.description}</p>
            <div className="detail-facts">
              <div><span>Due</span><strong>{formatDue(selectedTask.dueAt)}</strong></div>
              <div><span>Person</span><strong>{selectedTask.person || "You"}</strong></div>
              {selectedTask.waitingOn && (
                <div><span>Waiting on</span><strong>{selectedTask.waitingOn}</strong></div>
              )}
            </div>
            <label className="detail-status">
              <span>Move to</span>
              <select
                aria-label="Update task status"
                value={selectedTask.status}
                onChange={(event) => void moveTask(selectedTask, event.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map((status) => (
                  <option value={status} key={status}>{statusLabels[status]}</option>
                ))}
              </select>
            </label>
            {selectedTask.url && (
              <a className="example-link" href={selectedTask.url} target="_blank" rel="noreferrer">
                Open source ↗
              </a>
            )}
          </section>
        </div>
      )}

      {isAdding && (
        <div className="modal-backdrop" onClick={() => setIsAdding(false)}>
          <form
            className="detail-panel add-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => void addTask(event)}
          >
            <div className="detail-topline">
              <SourceBadge source="manual" />
              <button className="close-button" type="button" aria-label="Close new task" onClick={() => setIsAdding(false)}>×</button>
            </div>
            <h2 id="add-title">Add a task<span>.</span></h2>
            <label className="form-field"><span>What needs doing?</span><input name="title" maxLength={160} placeholder="Give it a useful name" required autoFocus /></label>
            <label className="form-field"><span>A little more detail</span><textarea name="description" rows={3} placeholder="Optional context for future you" /></label>
            <div className="form-pair">
              <label className="form-field"><span>Column</span><select name="status" defaultValue="todo">{TASK_STATUSES.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
              <label className="form-field"><span>Deadline</span><input name="dueAt" type="datetime-local" /></label>
            </div>
            <button className="button button-primary form-submit" disabled={busy !== null}>{busy === "create" ? "Saving…" : "Save my task →"}</button>
          </form>
        </div>
      )}
    </main>
  );
}
