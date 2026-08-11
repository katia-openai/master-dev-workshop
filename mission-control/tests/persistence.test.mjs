import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import test, { after, before } from "node:test";

const baseUrl = "http://localhost:4397";
const projectRoot = new URL("../", import.meta.url);
let server;
let serverOutput = "";

async function request(path, { method = "GET", body, owner } = {}) {
  const headers = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (owner) headers["oai-authenticated-user-id"] = owner;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  return { response, data };
}

before(async () => {
  server = spawn(
    process.execPath,
    [new URL("../node_modules/vinext/dist/cli.js", import.meta.url).pathname, "dev", "--port", "4397"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        WRANGLER_LOG_PATH: ".wrangler/test-wrangler.log",
        WRANGLER_WRITE_LOGS: "false",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`The workshop test server exited early.\n${serverOutput}`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/sources`);
      if (response.ok) return;
    } catch {
      // Wait for the local Cloudflare worker to finish booting.
    }

    await delay(300);
  }

  throw new Error(`The workshop test server did not become ready.\n${serverOutput}`);
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([once(server, "exit"), delay(4_000)]);
  if (server.exitCode === null) server.kill("SIGKILL");
});

test("the workshop page renders its real dashboard, not starter content", async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /mission control/i);
  assert.match(html, /your day.*at a glance/is);
  assert.match(html, /AUG.*11.*2026/is);
  assert.match(html, /Start here/i);
  assert.match(html, /Inbox/i);
  assert.match(html, /On the calendar/i);
  assert.doesNotMatch(
    html,
    /fictional workshop data|fictional by design|the work, without the noise|01\s*\/\s*today/i,
  );
  assert.doesNotMatch(html, /your site is taking shape|codex-preview|react-loading-skeleton/i);
});

test("source connections are honestly disconnected fictional fixtures", async () => {
  const { response, data } = await request("/api/sources");
  assert.equal(response.status, 200);
  assert.equal(data.fictional, true);
  for (const source of ["slack", "gmail", "calendar"]) {
    assert.equal(data.connections[source].connected, false);
    assert.equal(data.connections[source].mode, "fictional-fixture");
    assert.ok(data.connections[source].count > 0);
  }
});

test("D1 seeds every board column and saved status survives a reload and refresh", async () => {
  const owner = "fictional-status-test";
  const reset = await request("/api/reset", { method: "POST", owner });
  assert.equal(reset.response.status, 200);
  const first = await request("/api/tasks", { owner });
  assert.equal(first.response.status, 200);
  assert.equal(first.data.tasks.length, 17);
  assert.deepEqual(
    new Set(first.data.tasks.map((task) => task.status)),
    new Set(["urgent", "todo", "blocked", "backlog", "done"]),
  );

  const task = first.data.tasks.find((candidate) => candidate.status === "urgent");
  const changed = await request(`/api/tasks/${encodeURIComponent(task.id)}`, {
    method: "PATCH",
    owner,
    body: { status: "done" },
  });
  assert.equal(changed.response.status, 200);
  assert.equal(changed.data.task.status, "done");

  const reloaded = await request("/api/tasks", { owner });
  assert.equal(reloaded.data.tasks.find((item) => item.id === task.id).status, "done");

  const refreshed = await request("/api/refresh", { method: "POST", owner });
  assert.equal(refreshed.response.status, 200);
  assert.equal(refreshed.data.tasks.length, 17);
  assert.equal(refreshed.data.tasks.find((item) => item.id === task.id).status, "done");
});

test("manual tasks survive reload and fixture refresh, and reset is deliberate", async () => {
  const owner = "fictional-manual-test";
  await request("/api/reset", { method: "POST", owner });

  const created = await request("/api/tasks", {
    method: "POST",
    owner,
    body: { title: "Check the fictional attendee handout", status: "todo" },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.task.source, "manual");
  assert.equal(created.data.task.isManual, true);

  const reloaded = await request("/api/tasks", { owner });
  assert.ok(reloaded.data.tasks.some((task) => task.id === created.data.task.id));

  const refreshed = await request("/api/refresh", { method: "POST", owner });
  assert.equal(refreshed.data.tasks.length, 18);
  assert.ok(refreshed.data.tasks.some((task) => task.id === created.data.task.id));

  const reset = await request("/api/reset", { method: "POST", owner });
  assert.equal(reset.response.status, 200);
  assert.equal(reset.data.tasks.length, 17);
  assert.ok(!reset.data.tasks.some((task) => task.id === created.data.task.id));
});

test("task routes enforce server-side owner isolation", async () => {
  const owner = "fictional-owner-a";
  const otherOwner = "fictional-owner-b";
  const created = await request("/api/tasks", {
    method: "POST",
    owner,
    body: { title: "Owner A private fictional task", status: "todo" },
  });
  assert.equal(created.response.status, 201);

  const otherBoard = await request("/api/tasks", { owner: otherOwner });
  assert.ok(!otherBoard.data.tasks.some((task) => task.id === created.data.task.id));

  const forbiddenUpdate = await request(
    `/api/tasks/${encodeURIComponent(created.data.task.id)}`,
    { method: "PATCH", owner: otherOwner, body: { status: "done" } },
  );
  assert.equal(forbiddenUpdate.response.status, 404);

  const original = await request("/api/tasks", { owner });
  assert.equal(
    original.data.tasks.find((task) => task.id === created.data.task.id).status,
    "todo",
  );
});

test("task input rejects missing titles and invented statuses", async () => {
  const owner = "fictional-input-test";
  assert.equal(
    (await request("/api/tasks", { method: "POST", owner, body: { title: "   " } }))
      .response.status,
    400,
  );
  assert.equal(
    (
      await request("/api/tasks", {
        method: "POST",
        owner,
        body: { title: "Fictional input", status: "made-up" },
      })
    ).response.status,
    400,
  );
});
