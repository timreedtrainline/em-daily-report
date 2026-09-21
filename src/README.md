# Source Code

Implementation code will live here.

Suggested modules:
- `collectors/` for source-specific data collection
- `models/` for normalized report data
- `renderers/` for Markdown or Slack output

Current scaffold:
- `cli/` local entrypoints
- `collectors/` CLI-first source integrations
- `config/` typed config loading
- `llm/` explicit low-token review policy
- `report/` digest assembly and Markdown rendering
- `types/` normalized config and report types

The primary CLI should support:
- a normal write mode that updates `reports/latest.md` and adds a dated immutable file under `reports/history/`
- a preview mode that prints Markdown to stdout without touching report files
