# EM Daily Report

Daily report generator for the Cloud Native Developer Experience team.

Built as a low-token `Node + TypeScript` pipeline: collect deterministically, normalize locally, render locally, and reserve LLM usage for optional final review of retrieved data.

## Integration Policy

- Prefer `CLI` integrations over direct API integrations whenever a stable CLI exists
- Use `API` integrations only when a CLI is unavailable or materially weaker
- Keep all retrieval deterministic and outside the LLM path
- Document any required local tools in the relevant README or setup notes

Current CLI expectations:
- `gh` for GitHub
- Additional CLIs should be preferred for Jira or Slack if they prove reliable enough for the workflow

Prototype shortcut:
- Local snapshot files are acceptable for early report-shape evaluation
- The app should prefer local prototype data when explicitly provided, then move to CLI-backed retrieval as integrations mature

GitHub PR scope:
- Do not treat configured repositories as the full source of truth for team output
- Prefer author-centric collection using the configured GitHub users across the organization
- Use repository lists only as optional context or known home repos, not as a hard boundary

## Repository Structure

- `TEMPLATE/` reusable starter for other staff members
- `docs/` project notes and report design for this instance
- `config/` team and source configuration for this instance
- `src/` implementation code
- `scripts/` runnable helper scripts
- `reports/` generated daily reports
- `tests/` test coverage

Generated report output:
- `reports/latest.md` is the rolling convenience copy
- `reports/history/YYYY-MM-DD/` stores immutable dated runs for that local report date
- Repeated runs on the same day create a new time-stamped file; if two runs land in the same second, the later one gets a numeric suffix instead of overwriting the earlier record

## What This Project Will Do

Generate a daily report for an engineering manager with:

- Open pull requests by engineer
- Active-sprint Jira tickets grouped into completed since the previous `9:15 a.m.` briefing, on track, and off track
- Slack follow-ups including Later items, non-team channels, and team threads

Slack config scope:
- Configure explicit Slack channel-name lists in `config/team.yaml`
- `team_channels` is the supported source of truth for the team slice
- `management_channels`, `office_and_networks_channels`, and `ai_channels` are optional explicit lists
- No Slack channel-section URLs or browser-based section-resolution steps are required

## Template Reuse

The `TEMPLATE/` folder is intentionally generic and should not contain team-specific names, repositories, channels, project keys, or personal data. Other staff members can copy that folder and create their own daily digest setup from it.

## Build Plan

1. Define the report schema and rules
2. Wire GitHub PR collection
3. Wire Jira ticket collection
4. Wire Slack follow-up collection
5. Generate one Markdown report per day
6. Add scheduling and delivery

## Current Status

This project now includes a TypeScript scaffold for config loading, report generation, and Markdown rendering.

The current prototype can also read local seeded data from `data/prototype/` so we can evaluate report usefulness before every live integration is finalized.

## Next Step

Install dependencies with `npm install`, then run:

- `npm run digest` to write `reports/latest.md` and a durable history copy
- `npm run digest:preview` to print the Markdown report to stdout without writing files

## Token Strategy

Default behavior:
- Use CLI first, then APIs only when needed, to retrieve source data
- Apply deterministic grouping, aging, filtering, and prioritization in code
- Render the report locally as Markdown and persist it under `reports/`
- Treat `9:15 a.m.` local time as the explicit daily briefing cutoff for completed-ticket windows

Use LLM only for:
- Optional executive-summary compression
- Optional final review of already-retrieved data

Do not use LLM for:
- Fetching source data
- Simple transformations
- Status bucketing
- Sorting, grouping, or stale-item detection
