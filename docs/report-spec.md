# Report Spec

## Sections

### 1. Meetings Today

Fields:
- Title
- Time
- Attendees
- Join link
- Context
- Preparation prompts

Preparation prompt examples:
- What decision do I need from this meeting?
- What blocker should I raise?
- Who needs support from me?
- What follow-up do I want to leave with clear ownership?

### 2. Open Pull Requests

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

### 3. Ticket Flow

Subsections:
- Completed since yesterday
- In progress more than 2 days
- In review more than 2 days
- Blocked more than 2 days

Fields:
- Assignee
- Ticket key
- Title
- Link
- Status
- Days in current state

### 4. Slack Follow-Ups

Subsections:
- Later items
- Non-team channel messages
- Team channel threads

Fields:
- Channel
- Author
- Excerpt
- Link
- Why it matters

## Output Format

Generate one Markdown report per day with this structure:

1. Executive summary
2. Meetings today
3. PRs by engineer
4. Ticket flow
5. Slack follow-ups
6. Suggested manager actions

## Rules To Finalize

- Which repositories belong to the team
- Which Jira projects or boards define team work
- Which Slack channels count as team channels
- Whether completed tickets are "completed today" or "completed since last report"
- Whether stagnant means more than 2 full days or at least 48 hours
