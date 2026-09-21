# Scripts

Place runnable entrypoints here, for example:

- daily report generation
- local validation
- one-off source diagnostics

The first runnable entrypoint currently lives in `src/cli/generate-digest.ts`.

Expected report commands:
- `npm run digest` writes `reports/latest.md` and a durable history file
- `npm run digest:preview` prints the Markdown report to stdout
