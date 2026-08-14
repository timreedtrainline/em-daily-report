# EM Daily Report

Daily report generator for the Cloud Native Developer Experience team.

## Repository Structure

- `TEMPLATE/` reusable starter for other staff members
- `docs/` project notes and report design for this instance
- `config/` team and source configuration for this instance
- `src/` implementation code
- `scripts/` runnable helper scripts
- `reports/` generated daily reports
- `tests/` test coverage

## What This Project Will Do

Generate a daily report for an engineering manager with:

- Today’s meetings plus preparation prompts
- Open pull requests by engineer
- Completed or stagnant Jira tickets
- Slack follow-ups including Later items, non-team channels, and team threads

## Template Reuse

The `TEMPLATE/` folder is intentionally generic and should not contain team-specific names, repositories, channels, project keys, or personal data. Other staff members can copy that folder and create their own daily digest setup from it.

## Build Plan

1. Define the report schema and rules
2. Wire GitHub PR collection
3. Wire Jira ticket collection
4. Wire Slack follow-up collection
5. Wire Outlook meeting collection
6. Generate one Markdown report per day
7. Add scheduling and delivery

## Current Status

This project is bootstrapped and ready for implementation.

## Next Step

Fill in the team configuration in `config/team.example.yaml`, then we can implement the first data source.
