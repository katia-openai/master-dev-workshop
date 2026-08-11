import { copyFile, mkdir, readdir, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = resolve(projectRoot, "dist");
const clientDirectory = resolve(distDirectory, "client");
const serverDirectory = resolve(distDirectory, "server");
const hostingDirectory = resolve(distDirectory, ".openai");

const clientEntries = await readdir(distDirectory, { withFileTypes: true });
await mkdir(clientDirectory, { recursive: true });
for (const entry of clientEntries) {
  if ([".openai", "client", "server"].includes(entry.name)) {
    continue;
  }
  await rename(
    resolve(distDirectory, entry.name),
    resolve(clientDirectory, entry.name),
  );
}
await mkdir(serverDirectory, { recursive: true });
await mkdir(hostingDirectory, { recursive: true });
await copyFile(
  resolve(projectRoot, "worker", "sites-static.js"),
  resolve(serverDirectory, "index.js"),
);
await copyFile(
  resolve(projectRoot, ".openai", "hosting.json"),
  resolve(hostingDirectory, "hosting.json"),
);
