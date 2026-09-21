import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

import type { AppConfig } from "../types/config.js";

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Expected ${label} to be a non-empty string.`);
  }

  return value;
}

function assertStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`Expected ${label} to be an array of non-empty strings.`);
  }

  return value;
}

function optionalStringArray(value: unknown, label: string): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  return assertStringArray(value, label);
}

export async function loadConfig(configPath = "config/team.yaml"): Promise<AppConfig> {
  const absolutePath = path.resolve(configPath);
  const raw = await readFile(absolutePath, "utf8");
  const parsed = YAML.parse(raw) as Partial<AppConfig> | null;

  if (!parsed) {
    throw new Error(`Config file ${absolutePath} is empty.`);
  }

  const config: AppConfig = {
    team: {
      name: assertString(parsed.team?.name, "team.name"),
      manager: assertString(parsed.team?.manager, "team.manager")
    },
    github: {
      organization: assertString(parsed.github?.organization, "github.organization"),
      repositories: assertStringArray(parsed.github?.repositories, "github.repositories"),
      engineers: (parsed.github?.engineers ?? []).map((engineer, index) => ({
        name: assertString(engineer?.name, `github.engineers[${index}].name`),
        github: assertString(engineer?.github, `github.engineers[${index}].github`)
      }))
    },
    jira: {
      base_url: assertString(parsed.jira?.base_url, "jira.base_url"),
      projects: assertStringArray(parsed.jira?.projects, "jira.projects"),
      statuses: {
        in_progress: assertStringArray(parsed.jira?.statuses?.in_progress, "jira.statuses.in_progress"),
        in_review: assertStringArray(parsed.jira?.statuses?.in_review, "jira.statuses.in_review"),
        blocked: assertStringArray(parsed.jira?.statuses?.blocked, "jira.statuses.blocked"),
        done: assertStringArray(parsed.jira?.statuses?.done, "jira.statuses.done")
      }
    },
    slack: {
      team_channels: assertStringArray(parsed.slack?.team_channels, "slack.team_channels"),
      ai_channels: optionalStringArray(parsed.slack?.ai_channels, "slack.ai_channels"),
      management_channels: optionalStringArray(parsed.slack?.management_channels, "slack.management_channels"),
      office_and_networks_channels: optionalStringArray(
        parsed.slack?.office_and_networks_channels,
        "slack.office_and_networks_channels"
      )
    },
    rules: parsed.rules,
    llm: parsed.llm
  };

  return config;
}
