# Daily Digest Template Spec

## Goal

Generate a daily digest for an engineering manager with:

- Meetings for the day and preparation prompts
- Open pull requests grouped by engineer
- Completed and stagnant tickets
- Messaging follow-ups

## Suggested Sections

### 1. Meetings Today

Suggested fields:
- Title
- Time
- Attendees
- Join link
- Context
- Preparation prompts

### 2. Open Pull Requests

Suggested fields:
- Engineer
- Repository
- Title
- Link
- Age in days
- Review status

### 3. Ticket Flow

Suggested subsections:
- Completed since previous report
- In progress older than threshold
- In review older than threshold
- Blocked older than threshold

### 4. Follow-Ups

Suggested subsections:
- Saved items
- Messages from outside core team channels
- Active team threads

## Output Shape

Suggested output:

1. Executive summary
2. Meetings today
3. PRs by engineer
4. Ticket flow
5. Follow-ups
6. Recommended manager actions
