export interface EngineerConfig {
  name: string;
  github: string;
}

export interface TeamConfig {
  name: string;
  manager: string;
}

export interface GitHubConfig {
  organization: string;
  repositories: string[];
  engineers: EngineerConfig[];
}

export interface JiraStatusesConfig {
  in_progress: string[];
  in_review: string[];
  blocked: string[];
  done: string[];
}

export interface JiraConfig {
  base_url: string;
  projects: string[];
  statuses: JiraStatusesConfig;
}

export interface SlackConfig {
  team_channels: string[];
  ai_channels?: string[];
  management_channels?: string[];
  office_and_networks_channels?: string[];
}

export interface LlmPolicyConfig {
  enabled?: boolean;
  use_for?: Array<"executive_summary" | "final_review">;
}

export interface ReportRulesConfig {
  stagnation_days?: number;
  completed_window?: "since_previous_report" | "today";
  briefing_cutoff_local_time?: string;
}

export interface AppConfig {
  team: TeamConfig;
  github: GitHubConfig;
  jira: JiraConfig;
  slack: SlackConfig;
  rules?: ReportRulesConfig;
  llm?: LlmPolicyConfig;
}
