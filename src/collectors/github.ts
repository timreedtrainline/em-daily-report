import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

import type { AppConfig } from "../types/config.js";
import type { PullRequestItem } from "../types/report.js";
import { businessDaysOpen } from "../report/business-days.js";

const execFileAsync = promisify(execFile);

interface GhPrAuthor {
  login: string;
  name?: string;
  is_bot?: boolean;
}

interface GhPullRequest {
  createdAt: string;
  draft?: boolean;
  repositoryUrl?: string;
  title: string;
  url: string;
}

interface GhApiSearchResponse {
  items: Array<{
    created_at: string;
    draft?: boolean;
    html_url: string;
    repository_url: string;
    title: string;
  }>;
}

interface GithubSnapshotFile {
  generatedAt: string;
  organization: string;
  engineers: Array<{
    engineer: string;
    author: string;
    items: GhApiSearchResponse["items"];
  }>;
}

function normalizeReviewState(isDraft?: boolean): string {
  return isDraft ? "draft" : "open";
}

function repositoryNameFromUrl(repositoryUrl: string): string {
  const segments = repositoryUrl.split("/");

  return segments.at(-1) ?? "unknown-repo";
}

async function runGhPrSearch(owner: string, author: string): Promise<GhPullRequest[]> {
  const { stdout } = await execFileAsync("gh", [
    "api",
    `search/issues?q=is:pr+is:open+author:${author}+org:${owner}&per_page=100`
  ]);

  const response = JSON.parse(stdout) as GhApiSearchResponse;

  return response.items.map((item) => ({
    createdAt: item.created_at,
    draft: item.draft,
    repositoryUrl: item.repository_url,
    title: item.title,
    url: item.html_url
  }));
}

async function loadPrototypePullRequests(): Promise<PullRequestItem[] | null> {
  const prototypePath = path.resolve("data/prototype/github-open-prs.json");

  try {
    const raw = await readFile(prototypePath, "utf8");
    const parsed = JSON.parse(raw) as PullRequestItem[];

    if (!Array.isArray(parsed)) {
      throw new Error("Prototype PR data must be an array.");
    }

    return parsed;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function normalizePullRequests(
  engineers: Array<{
    engineer: string;
    items: GhApiSearchResponse["items"];
  }>
): PullRequestItem[] {
  const items: PullRequestItem[] = [];
  const seenUrls = new Set<string>();

  for (const engineer of engineers) {
    for (const pr of engineer.items) {
      if (seenUrls.has(pr.html_url)) {
        continue;
      }

      seenUrls.add(pr.html_url);

      items.push({
        engineer: engineer.engineer,
        repository: pr.repository_url ? repositoryNameFromUrl(pr.repository_url) : "unknown-repo",
        title: pr.title,
        url: pr.html_url,
        ageDays: businessDaysOpen(pr.created_at),
        reviewStatus: normalizeReviewState(pr.draft)
      });
    }
  }

  return items.sort((left, right) => {
    if (left.engineer !== right.engineer) {
      return left.engineer.localeCompare(right.engineer);
    }

    return right.ageDays - left.ageDays;
  });
}

async function loadLivePullRequests(): Promise<PullRequestItem[] | null> {
  const liveSnapshotPath = path.resolve("data/live/github-open-prs.json");

  try {
    const raw = await readFile(liveSnapshotPath, "utf8");
    const parsed = JSON.parse(raw) as GithubSnapshotFile;

    if (!Array.isArray(parsed.engineers)) {
      throw new Error("Live GitHub snapshot must contain an engineers array.");
    }

    return normalizePullRequests(parsed.engineers);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function collectOpenPullRequests(config: AppConfig): Promise<PullRequestItem[]> {
  const liveItems = await loadLivePullRequests();

  if (liveItems) {
    return liveItems;
  }

  try {
    const liveEngineers: GithubSnapshotFile["engineers"] = [];

    for (const engineer of config.github.engineers) {
      const prs = await runGhPrSearch(config.github.organization, engineer.github);
      liveEngineers.push({
        engineer: engineer.name,
        author: engineer.github,
        items: prs.map((pr) => ({
          created_at: pr.createdAt,
          draft: pr.draft,
          html_url: pr.url,
          repository_url: pr.repositoryUrl ?? "",
          title: pr.title
        }))
      });
    }

    return normalizePullRequests(liveEngineers);
  } catch {
    const prototypeItems = await loadPrototypePullRequests();

    if (prototypeItems) {
      return prototypeItems;
    }

    throw new Error("Unable to collect pull requests from GitHub search and no prototype snapshot is available.");
  }
}
