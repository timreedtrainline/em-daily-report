import { readFile } from "node:fs/promises";
import path from "node:path";

import type { AppConfig } from "../types/config.js";
import type { SlackItem } from "../types/report.js";

interface SlackFollowUpsSnapshot {
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  slackLaterItems?: SlackItem[];
  teamThreadItems?: SlackItem[];
  secondarySlackItems?: SlackItem[];
  aiUpdates?: SlackItem[];
}

async function loadLiveSlackFollowUpsSnapshot(): Promise<SlackFollowUpsSnapshot | null> {
  const snapshotPath = path.resolve("data/live/slack-follow-ups.json");

  try {
    const raw = await readFile(snapshotPath, "utf8");
    const parsed = JSON.parse(raw) as SlackFollowUpsSnapshot;

    return parsed;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function collectSlackFollowUps(config: AppConfig): Promise<{
  slackLaterItems: SlackItem[];
  teamThreadItems: SlackItem[];
  secondarySlackItems: SlackItem[];
  aiUpdates: SlackItem[];
}> {
  const snapshot = await loadLiveSlackFollowUpsSnapshot();

  if (snapshot) {
    return {
      slackLaterItems: snapshot.slackLaterItems ?? [],
      teamThreadItems: snapshot.teamThreadItems ?? [],
      secondarySlackItems: snapshot.secondarySlackItems ?? [],
      aiUpdates: snapshot.aiUpdates ?? []
    };
  }

  const hasSecondaryChannels =
    (config.slack.management_channels?.length ?? 0) > 0 || (config.slack.office_and_networks_channels?.length ?? 0) > 0;

  return {
    slackLaterItems: [],
    teamThreadItems: config.slack.team_channels.length > 0
      ? [
          {
            channel: "team channels",
            author: "system",
            excerpt: `Configured team channels: ${config.slack.team_channels.join(", ")}`,
            url: "",
            whyItMatters: "Team channel scope is now defined directly in config and no longer requires Slack section URLs."
          }
        ]
      : [],
    secondarySlackItems: hasSecondaryChannels
      ? [
          {
            channel: "management / office / networks",
            author: "system",
            excerpt: `Configured secondary channels: ${[
              ...(config.slack.management_channels ?? []),
              ...(config.slack.office_and_networks_channels ?? [])
            ].join(", ")}`,
            url: "",
            whyItMatters: "Secondary Slack scope is defined explicitly in config."
          }
        ]
      : [
          {
            channel: "management / office / networks",
            author: "system",
            excerpt: "Secondary Slack channels are not configured yet.",
            url: "",
            whyItMatters: "Add explicit management and office/network channel names to config when you want this slice enabled."
          }
        ],
    aiUpdates: (config.slack.ai_channels?.length ?? 0) > 0
      ? [
          {
            channel: "ai updates",
            author: "system",
            excerpt: `Configured AI channels: ${(config.slack.ai_channels ?? []).join(", ")}`,
            url: "",
            whyItMatters: "AI Slack scope is defined explicitly in config."
          }
        ]
      : [
          {
            channel: "ai updates",
            author: "system",
            excerpt: "AI Slack channels are not configured yet.",
            url: "",
            whyItMatters: "Add explicit AI channel names to config when you want this slice enabled."
          }
        ]
  };
}
