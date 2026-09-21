import type { DailyDigest, PullRequestItem, SlackItem, TicketItem } from "../types/report.js";

function formatReportDate(generatedAt: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }).format(new Date(generatedAt));
}

function renderBulletList(items: string[]): string {
  if (items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function renderExecutiveSummary(digest: DailyDigest): string {
  const recentPullRequests = digest.pullRequests.filter((item) => item.ageDays <= 3);
  const slackItems = [
    ...digest.slackLaterItems,
    ...digest.teamThreadItems,
    ...digest.secondarySlackItems,
    ...digest.aiUpdates
  ];
  const prioritySignals = /ask|approval|blocker|blocked|closure|deadline|dependency|incident|needs ownership|review|follow-up/i;
  const highPrioritySlackItems = slackItems
    .filter((item) => prioritySignals.test(`${item.excerpt} ${item.whyItMatters}`))
    .filter((item) => !/resolved|clearing from Later|already handled/i.test(item.whyItMatters))
    .filter((item, index, items) => item.url && items.findIndex((candidate) => candidate.url === item.url) === index)
    .slice(0, 3);
  const summaryItems = [
    `PRs: ${digest.pullRequests.length} open${recentPullRequests.length > 0 ? `, ${recentPullRequests.length} opened in the last 3 business days` : ""}.`,
    digest.sprintTickets.length > 0
      ? `Jira: ${digest.completedTickets.length} completed since the previous briefing; ${digest.sprintTickets.filter((item) => item.daysInCurrentState >= 2).length} off track.`
      : "Jira: no active-sprint tickets found for the configured engineers.",
    ...(recentPullRequests.length > 0
      ? [
          `New PRs: ${recentPullRequests
            .slice(0, 4)
            .map((item) => `[${item.title}](${item.url}) (${item.engineer})`)
            .join(", ")}${recentPullRequests.length > 4 ? `, plus ${recentPullRequests.length - 4} more` : ""}.`
        ]
      : []),
    ...(highPrioritySlackItems.length > 0
      ? [
          "High-priority Slack:",
          ...highPrioritySlackItems.map(
            (item) => `- [${item.excerpt}](${item.url}) in **${item.channel}**`
          )
        ]
      : [])
  ];

  return summaryItems.join("\n");
}

function renderPullRequests(items: PullRequestItem[]): string {
  if (items.length === 0) {
    return "_No open PRs found._";
  }

  const buckets = [
    {
      label: "today",
      items: items.filter((item) => item.ageDays === 0)
    },
    {
      label: "1–3 days",
      items: items.filter((item) => item.ageDays >= 1 && item.ageDays <= 3)
    },
    {
      label: "4 days–1 week",
      items: items.filter((item) => item.ageDays >= 4 && item.ageDays <= 7)
    },
    {
      label: "1–2 weeks",
      items: items.filter((item) => item.ageDays >= 8 && item.ageDays <= 14)
    },
    {
      label: "more than 2 weeks",
      items: items.filter((item) => item.ageDays > 14)
    }
  ].filter((bucket) => bucket.items.length > 0);

  return buckets
    .map((bucket) => {
      const groupedByEngineer = new Map<string, PullRequestItem[]>();

      for (const item of bucket.items) {
        const existing = groupedByEngineer.get(item.engineer) ?? [];
        existing.push(item);
        groupedByEngineer.set(item.engineer, existing);
      }

      return [
        `### ${bucket.label}`,
        ...[...groupedByEngineer.entries()].map(([engineer, prs]) =>
          [
            `#### ${engineer}`,
            ...prs.map(
              (item) => `- [${item.title}](${item.url}) in \`${item.repository}\` (${item.reviewStatus}, ${item.ageDays} day${item.ageDays === 1 ? "" : "s"})`
            )
          ].join("\n")
        )
      ].join("\n");
    })
    .join("\n\n");
}

function renderTickets(items: TicketItem[]): string {
  if (items.length === 0) {
    return "_None._";
  }

  const grouped = new Map<string, TicketItem[]>();

  for (const item of items) {
    const existing = grouped.get(item.assignee) ?? [];
    existing.push(item);
    grouped.set(item.assignee, existing);
  }

  return [...grouped.entries()]
    .map(([assignee, assigneeItems]) =>
      [
        `#### ${assignee}`,
        ...assigneeItems
          .sort((left, right) => right.daysInCurrentState - left.daysInCurrentState)
          .map(
            (item) => `- [${item.key}](${item.url}) ${item.title} (${item.status}, ${item.daysInCurrentState} day${item.daysInCurrentState === 1 ? "" : "s"} in state)`
          )
      ].join("\n")
    )
    .join("\n");
}

function renderCurrentSprintTickets(
  sprintName: string | undefined,
  items: TicketItem[],
  completedWindowItems: TicketItem[]
): string {
  if (items.length === 0) {
    return "_No active sprint tickets found for the configured engineers._";
  }

  const remainingItems = items.filter((item) => {
    if (completedWindowItems.some((completedItem) => completedItem.key === item.key)) {
      return false;
    }

    return !["closed", "done", "completed"].includes(item.status.toLowerCase());
  });

  const renderEngineerGroups = (sectionItems: TicketItem[], mode: "default" | "off-track" = "default"): string[] => {
    const grouped = new Map<string, TicketItem[]>();

    for (const item of sectionItems) {
      const existing = grouped.get(item.assignee) ?? [];
      existing.push(item);
      grouped.set(item.assignee, existing);
    }

    return [...grouped.entries()].map(([assignee, assigneeItems]) =>
      [
        `#### ${assignee}`,
        ...assigneeItems
          .sort((left, right) => right.daysInCurrentState - left.daysInCurrentState)
          .map((item) => {
            if (mode !== "off-track") {
              return `- [${item.key}](${item.url}) ${item.title} (${item.status})`;
            }

            const ageLabel = `${item.daysInCurrentState} business day${item.daysInCurrentState === 1 ? "" : "s"} in ${item.status}`;
            const emphasizedAgeLabel = item.daysInCurrentState > 2 ? `**${ageLabel}**` : ageLabel;

            return `- [${item.key}](${item.url}) ${item.title} (${emphasizedAgeLabel})`;
          })
      ].join("\n")
    );
  };

  const offTrackItems = remainingItems.filter((item) => item.daysInCurrentState >= 2);

  return [
    `### ${sprintName ? `Current Sprint: ${sprintName}` : "Current Sprint"}`,
    "#### Completed since the previous 9:15 a.m. briefing",
    ...(completedWindowItems.length > 0 ? renderEngineerGroups(completedWindowItems) : ["_None._"]),
    "",
    "#### Off track",
    ...(offTrackItems.length > 0 ? renderEngineerGroups(offTrackItems, "off-track") : ["_None._"])
  ].join("\n");
}

function renderSlackItems(items: SlackItem[]): string {
  if (items.length === 0) {
    return "_None._";
  }

  return items
    .map((item) =>
      item.url
        ? `- **${item.channel}**: [${item.excerpt}](${item.url}) by ${item.author}. ${item.whyItMatters}`
        : `- **${item.channel}**: ${item.excerpt} by ${item.author}. ${item.whyItMatters}`
    )
    .join("\n");
}

export function renderDigestMarkdown(digest: DailyDigest): string {
  const reportDate = formatReportDate(digest.metadata.generatedAt);
  return [
    `# ${digest.metadata.teamName} Daily Digest`,
    "",
    `**${reportDate}**`,
    `Prepared for ${digest.metadata.manager}.`,
    `Token policy: \`${digest.metadata.tokenPolicy}\`. LLM review enabled: \`${digest.metadata.llmReviewEnabled}\`.`,
    "",
    "## Executive Summary",
    renderExecutiveSummary(digest),
    "",
    "## PRs By Age Band",
    renderPullRequests(digest.pullRequests),
    "",
    "## Ticket Flow",
    ...(digest.sprintTickets.length > 0
      ? [renderCurrentSprintTickets(digest.activeSprintName, digest.sprintTickets, digest.completedTickets)]
      : [
          "### Completed",
          renderTickets(digest.completedTickets),
          "",
    "### Off track",
          renderTickets(digest.stagnantTickets)
        ]),
    "",
    "## Slack Follow-Ups",
    "### Later Items",
    renderSlackItems(digest.slackLaterItems),
    "",
    "### Team Channel Threads",
    renderSlackItems(digest.teamThreadItems),
    "",
    "### Secondary Channel Updates",
    renderSlackItems(digest.secondarySlackItems),
    "",
    "## AI Updates",
    renderSlackItems(digest.aiUpdates),
    "",
    "## Suggested Actions",
    renderBulletList(digest.suggestedActions)
  ].join("\n");
}
