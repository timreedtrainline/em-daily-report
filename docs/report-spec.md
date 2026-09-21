# Report Spec

## Sections

### 1. Open Pull Requests

Fields:
- Engineer
- Repository
- PR title
- PR link
- Age in days
- Review status

Grouping:
- Group by engineer
- Sort oldest first within each engineer

### 2. Ticket Flow

Subsections:
- Completed since the previous `9:15 a.m.` briefing window
- On track
- Off track

Fields:
- Assignee
- Ticket key
- Title
- Link
- Status
- Business-day age in current state

### 3. Slack Follow-Ups

Subsections:
- Later items
- Team channel threads
- Secondary channel updates

Fields:
- Channel
- Author
- Excerpt
- Link
- Why it matters

### 4. AI Updates

Subsections:
- AI channel highlights
- Important replies or decisions

Fields:
- Channel
- Author
- Excerpt
- Link
- Why it matters

## Output Format

Generate one Markdown report per day with this structure:

1. Executive summary
2. PRs by engineer
3. Ticket flow
4. Slack follow-ups
5. AI updates
6. Suggested manager actions

## Rules To Finalize

- Which repositories belong to the team
- Which Jira projects or boards define team work
- Daily briefing cutoff is explicitly `9:15 a.m.` local time
- Completed tickets use the prior-day `9:15 a.m.` to current-day `9:15 a.m.` briefing window
- On-track vs off-track uses business-day current-state aging, with weekends discounted

## Slack Scope Priority

Primary:
- `team_channels`

Secondary:
- `management_channels`
- `office_and_networks_channels`

Separate section:
- `ai_channels`
