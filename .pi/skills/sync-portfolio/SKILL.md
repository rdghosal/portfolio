---
name: sync-portfolio
description: Sync projects.md into portfolio cards in index.html. Run after editing projects.md to regenerate the portfolio section. Idempotent — same input always produces the same output.
---

# Sync Portfolio

Generates portfolio card HTML from `projects.md` and injects it into `index.html` between marker comments.

## Usage

```bash
npm run sync
```

Or directly:

```bash
node .pi/skills/sync-portfolio/sync.mjs
```

## How it works

1. Parses `projects.md` for filled project entries (skips empty templates)
2. Generates distilled card HTML for each project, grouped by section
3. Replaces content between `<!-- BEGIN PORTFOLIO NAV -->` / `<!-- END PORTFOLIO NAV -->` markers in `index.html` with nav links
4. Replaces content between `<!-- BEGIN PORTFOLIO CARDS -->` / `<!-- END PORTFOLIO CARDS -->` markers with section containers and cards
5. Prettier formats the output on commit

## Card structure by section

**Professional Work** — no links, shows employer/role context:

```
Title → Context (employer · role) → Hook → Tech tags → Details
```

**Open Source Contributions** — repo/PR links, contribution framing:

```
Title → Hook → Tech tags → Repo / PR links → Details
```

**Personal Projects** — "Code on request" instead of repo links:

```
Title → Hook → Tech tags → [Live Site] Code on request → Details
```

## projects.md format

Each project needs at minimum a `**Project name**` field filled in. Empty or comment-only values are skipped. See `projects.md` in the project root for the full template.

## Idempotency

The script is deterministic: same `projects.md` content always produces the same `index.html` output. Running it multiple times with unchanged input is a no-op (file content is identical).

Sections with zero filled projects are omitted entirely — no empty nav links or containers.
