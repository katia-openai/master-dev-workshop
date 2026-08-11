import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const fixtureNames = ["slack", "gmail", "calendar", "tasks"];

async function readFixture(name) {
  return JSON.parse(
    await readFile(new URL(`../fixtures/${name}.json`, import.meta.url), "utf8"),
  );
}

test("all workshop sources are explicitly fictional and deterministic", async () => {
  for (const name of fixtureNames) {
    const fixture = await readFixture(name);
    assert.equal(fixture.fictional, true, `${name} must declare itself fictional`);
    assert.equal(fixture.referenceDate, "2026-08-11T09:30:00-05:00");
    assert.equal(fixture.timeZone, "America/Chicago");
    assert.match(fixture.notice, /fictional|invented/i);
  }
});

test("fixture activity forms a coherent August 11 workday", async () => {
  const slack = await readFixture("slack");
  const gmail = await readFixture("gmail");
  const calendar = await readFixture("calendar");
  const tasks = await readFixture("tasks");
  const referenceTime = Date.parse(tasks.referenceDate);

  for (const message of [...slack.messages, ...gmail.messages]) {
    const timestamp = message.sentAt ?? message.receivedAt;
    assert.ok(Date.parse(timestamp) <= referenceTime);
  }

  for (const event of calendar.events) {
    assert.ok(Date.parse(event.startsAt) > referenceTime);
    assert.ok(Date.parse(event.endsAt) > Date.parse(event.startsAt));
  }

  for (const task of tasks.tasks) {
    if (!task.dueAt) continue;
    const dueTime = Date.parse(task.dueAt);
    if (task.status === "done") assert.ok(dueTime <= referenceTime);
    else assert.ok(dueTime > referenceTime);
  }
});

test("fixtures contain stable unique identifiers and example.com links only", async () => {
  for (const name of fixtureNames) {
    const fixture = await readFixture(name);
    const records = fixture.messages ?? fixture.events ?? fixture.tasks;
    assert.ok(records.length > 0, `${name} must contain demo records`);
    assert.equal(new Set(records.map((record) => record.id)).size, records.length);

    for (const record of records) {
      if (record.url) assert.equal(new URL(record.url).hostname, "example.com");
      if (record.from) assert.match(record.from, /@example\.com>/);
    }
  }
});

test("the demo populates all five board columns and all source labels", async () => {
  const { tasks } = await readFixture("tasks");
  assert.deepEqual(
    new Set(tasks.map((task) => task.status)),
    new Set(["urgent", "todo", "blocked", "backlog", "done"]),
  );
  assert.deepEqual(
    new Set(tasks.map((task) => task.source)),
    new Set(["slack", "gmail", "calendar", "manual"]),
  );
  assert.ok(tasks.filter((task) => task.waitingOn).length >= 3);
  assert.ok(tasks.filter((task) => task.dueAt).length >= 8);
});

test("fictional records never contain private names, company domains, or secrets", async () => {
  for (const name of fixtureNames) {
    const text = await readFile(
      new URL(`../fixtures/${name}.json`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(text, /katia|openai\.com|slack\.com|google\.com/i);
    assert.doesNotMatch(text, /bearer\s+[a-z0-9._-]+|api[_-]?key|client[_-]?secret/i);
  }
});

test("the exact workshop mood-board asset is included", async () => {
  const image = await readFile(
    new URL("../assets/mission-control-moodboard.png", import.meta.url),
  );
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(image.byteLength > 1_000_000);
});
