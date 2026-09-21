import type { AppConfig } from "../types/config.js";
import type { DailyDigest } from "../types/report.js";
import { getLlmPolicy } from "../llm/policy.js";
import { collectOpenPullRequests } from "../collectors/github.js";
import { collectTicketFlow } from "../collectors/jira.js";
import { collectSlackFollowUps } from "../collectors/slack.js";

export async function buildDigest(config: AppConfig): Promise<DailyDigest> {
  const llmPolicy = getLlmPolicy(config);
  const pullRequests = await collectOpenPullRequests(config);
  const ticketFlow = await collectTicketFlow();
  const slackFollowUps = await collectSlackFollowUps(config);
  const hasSecondarySlackConfig =
    (config.slack.management_channels?.length ?? 0) > 0 || (config.slack.office_and_networks_channels?.length ?? 0) > 0;
  const hasAiSlackConfig = (config.slack.ai_channels?.length ?? 0) > 0;

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      teamName: config.team.name,
      manager: config.team.manager,
      tokenPolicy: "minimal",
      llmReviewEnabled: llmPolicy.enabled
    },
    pullRequests,
    activeSprintName: ticketFlow.sprintName,
    sprintTickets: ticketFlow.sprintTickets,
    completedTickets: ticketFlow.completedTickets,
    stagnantTickets: ticketFlow.stagnantTickets,
    slackLaterItems: slackFollowUps.slackLaterItems,
    teamThreadItems: slackFollowUps.teamThreadItems,
    secondarySlackItems: slackFollowUps.secondarySlackItems,
    aiUpdates: slackFollowUps.aiUpdates,
    suggestedActions: [
      pullRequests.length > 0
        ? `Review ${pullRequests.length} open team PR${pullRequests.length === 1 ? "" : "s"} from GitHub CLI output.`
        : "No open team PRs found in the configured GitHub repositories.",
      ticketFlow.sprintTickets.length > 0
        ? `Review ${ticketFlow.sprintTickets.length} Jira ticket${ticketFlow.sprintTickets.length === 1 ? "" : "s"} in the active CLOUD sprint.`
        : "No Jira tickets were found in the active CLOUD sprint for the configured engineers.",
      ticketFlow.completedTickets.length > 0
        ? `Review ${ticketFlow.completedTickets.length} active-sprint Jira ticket${ticketFlow.completedTickets.length === 1 ? "" : "s"} completed between 9:15 a.m. on August 13, 2026 and 9:15 a.m. on August 14, 2026.`
        : "No active-sprint Jira tickets were completed in the current 9:15 a.m. briefing window.",
      ticketFlow.stagnantTickets.length > 0
        ? `Follow up on ${ticketFlow.stagnantTickets.length} active-sprint Jira ticket${ticketFlow.stagnantTickets.length === 1 ? "" : "s"} that are off track at two or more business days in the current state.`
        : "No active-sprint Jira tickets are currently off track against the two-business-day threshold.",
      slackFollowUps.slackLaterItems.length > 0
        ? `Review ${slackFollowUps.slackLaterItems.length} Slack Later item${slackFollowUps.slackLaterItems.length === 1 ? "" : "s"} returned by Slack saved-item search.`
        : "No Slack Later items are currently returned by Slack saved-item search.",
      hasSecondarySlackConfig
        ? slackFollowUps.secondarySlackItems.length > 0
          ? `Review ${slackFollowUps.secondarySlackItems.length} secondary Slack update${slackFollowUps.secondarySlackItems.length === 1 ? "" : "s"} from the last 24 hours.`
          : "No qualifying secondary Slack updates were found in the last 24 hours."
        : "Add explicit channel names for the optional secondary Slack slices when you want those report sections enabled.",
      hasAiSlackConfig
        ? slackFollowUps.aiUpdates.length > 0
          ? `Review ${slackFollowUps.aiUpdates.length} AI Slack update${slackFollowUps.aiUpdates.length === 1 ? "" : "s"} from the last 24 hours.`
          : "No qualifying AI Slack updates were found in the last 24 hours."
        : "Add explicit channel names for the optional AI Slack slice when you want that report section enabled.",
      "Keep LLM review disabled by default and enable it only for final compression when needed."
    ]
  };
}
