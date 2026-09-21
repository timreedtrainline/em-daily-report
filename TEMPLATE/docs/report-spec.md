# Daily Digest Template Spec

## Goal

Generate a daily digest for an engineering manager with:

- Open pull requests grouped by engineer
- Completed and stagnant tickets
- Messaging follow-ups

## Suggested Sections

### 1. Open Pull Requests

Suggested fields:
- Engineer
- Repository
- Title
- Link
- Age in days
- Review status

### 2. Ticket Flow

Suggested subsections:
- Completed since the previous `9:15 a.m.` briefing
- On track
- Off track

Suggested rules:
- Use a daily briefing window from the previous day at `9:15 a.m.` local time to the current day at `9:15 a.m.` local time for completed work
- Use business-day current-state aging for on-track vs off-track classification, discounting weekends

### 3. Follow-Ups

Suggested subsections:
- Saved items
- Active team threads
- Secondary channel updates

### 4. AI Updates

Suggested subsections:
- AI channel highlights
- Important replies or decisions

## Output Shape

Suggested output:

1. Executive summary
2. PRs by engineer
3. Ticket flow
4. Follow-ups
5. AI updates
6. Recommended manager actions

## Slack Scope Model

Primary:
- `team_channels`

Secondary:
- `management_channels`
- `office_and_networks_channels`

Separate section:
- `ai_channels`
