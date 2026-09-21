# Prototype Data

This folder holds local snapshot data used to evaluate report usefulness before each integration is finalized.

Rules:
- Prefer deterministic local files here for quick design iteration
- Replace these snapshots with CLI-backed retrieval later
- Keep sensitive or team-specific snapshots out of the reusable `TEMPLATE/`

Current usage:
- `github-open-prs.json` seeds the digest with captured open PR data
