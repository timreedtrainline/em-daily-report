export interface PullRequestItem {
  engineer: string;
  repository: string;
  title: string;
  url: string;
  ageDays: number;
  reviewStatus: string;
}

export interface TicketItem {
  assignee: string;
  key: string;
  title: string;
  url: string;
  status: string;
  daysInCurrentState: number;
  completedToday?: boolean;
  stale?: boolean;
}

export interface SlackItem {
  channel: string;
  author: string;
  excerpt: string;
  url?: string;
  whyItMatters: string;
}

export interface DigestMetadata {
  generatedAt: string;
  teamName: string;
  manager: string;
  tokenPolicy: "minimal";
  llmReviewEnabled: boolean;
}

export interface DailyDigest {
  metadata: DigestMetadata;
  pullRequests: PullRequestItem[];
  activeSprintName?: string;
  sprintTickets: TicketItem[];
  completedTickets: TicketItem[];
  stagnantTickets: TicketItem[];
  slackLaterItems: SlackItem[];
  teamThreadItems: SlackItem[];
  secondarySlackItems: SlackItem[];
  aiUpdates: SlackItem[];
  suggestedActions: string[];
}
