# EM Daily Digest Template

Reusable starter for building a daily engineering manager digest.

Recommended stack:
- `Node + TypeScript` for deterministic collection and report generation
- Optional `React` UI later if you want a browsable dashboard

Token strategy:
- Use APIs or CLI for retrieval
- Use local code for bucketing, sorting, grouping, and stale detection
- Reserve LLM usage for optional final review of already-retrieved data

## Integration Policy

- Prefer `CLI` integrations over direct API integrations whenever a stable CLI exists
- Use `API` integrations only when a CLI is unavailable or materially weaker
- Keep all retrieval deterministic and outside the LLM path
- Document required local tooling in the project README

Example CLI choices:
- `gh` for GitHub
- Equivalent Jira or Slack CLIs if your environment provides them

Prototype shortcut:
- During early design, a project may temporarily read from local snapshot files
- As the workflow hardens, replace snapshots with CLI-backed retrieval

GitHub PR scope:
- Prefer author-centric collection using the configured GitHub users across the relevant organization
- Do not assume a fixed repository list fully represents where a team contributes

## Intended Use

Copy this folder to a new location, rename it for your team, and fill in the placeholder configuration.

This template should stay free of:

- Team-specific names
- Repository names
- Jira project keys
- Slack channel names
- Personal data

## Included Structure

- `docs/` generic design notes
- `config/` placeholder configuration
- `src/` implementation area
- `scripts/` runnable entrypoints
- `reports/` generated output
- `tests/` test coverage

Suggested output behavior:
- keep `reports/latest.md` as the rolling convenience copy
- write immutable dated runs under `reports/history/YYYY-MM-DD/`
- version same-day repeat runs with a timestamp and numeric suffix when needed instead of overwriting the earlier record

## Suggested Setup

1. Copy this folder
2. Rename the project
3. Fill in `config/team.example.yaml`
4. Choose an implementation stack
5. Build collectors for PRs, tickets, and messaging
6. Make the default digest command write both `latest` and dated history output
