import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { loadConfig } from "../config/load-config.js";
import { buildDigest } from "../report/build-digest.js";
import { renderDigestMarkdown } from "../report/render-markdown.js";

const emitJson = process.argv.includes("--json");
const emitStdout = process.argv.includes("--stdout");

function getLocalDateParts(timestamp: string): {
  dateStamp: string;
  timeStamp: string;
} {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const parts = formatter.formatToParts(new Date(timestamp));
  const lookup = new Map(parts.map((part) => [part.type, part.value]));

  const year = lookup.get("year");
  const month = lookup.get("month");
  const day = lookup.get("day");
  const hour = lookup.get("hour");
  const minute = lookup.get("minute");
  const second = lookup.get("second");

  if (!year || !month || !day || !hour || !minute || !second) {
    throw new Error("Failed to derive local report timestamp parts.");
  }

  return {
    dateStamp: `${year}-${month}-${day}`,
    timeStamp: `${hour}${minute}${second}`
  };
}

async function writeDigestFiles(markdown: string, generatedAt: string): Promise<{
  latestPath: string;
  historyPath: string;
}> {
  const { dateStamp, timeStamp } = getLocalDateParts(generatedAt);
  const reportsDir = path.resolve("reports");
  const historyDir = path.join(reportsDir, "history", dateStamp);
  const latestPath = path.join(reportsDir, "latest.md");

  await mkdir(historyDir, { recursive: true });

  const baseHistoryName = `daily-digest-${dateStamp}-${timeStamp}`;
  let candidatePath = path.join(historyDir, `${baseHistoryName}.md`);
  let version = 2;

  while (true) {
    try {
      await writeFile(candidatePath, markdown, { encoding: "utf8", flag: "wx" });
      break;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException)?.code !== "EEXIST") {
        throw error;
      }

      candidatePath = path.join(historyDir, `${baseHistoryName}-${version}.md`);
      version += 1;
    }
  }

  await writeFile(latestPath, markdown, "utf8");

  return {
    latestPath,
    historyPath: candidatePath
  };
}

async function main(): Promise<void> {
  const config = await loadConfig();
  const digest = await buildDigest(config);
  const markdown = renderDigestMarkdown(digest);

  if (emitJson) {
    process.stdout.write(`${JSON.stringify(digest, null, 2)}\n`);
    return;
  }

  if (emitStdout) {
    process.stdout.write(`${markdown}\n`);
    return;
  }

  const { latestPath, historyPath } = await writeDigestFiles(markdown, digest.metadata.generatedAt);
  process.stdout.write(`Wrote latest report: ${latestPath}\n`);
  process.stdout.write(`Wrote history report: ${historyPath}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Failed to generate digest preview: ${message}\n`);
  process.exitCode = 1;
});
