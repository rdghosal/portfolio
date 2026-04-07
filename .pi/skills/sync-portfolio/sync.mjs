#!/usr/bin/env node

/**
 * Reads projects.md and generates portfolio card HTML in index.html.
 * Idempotent — same input always produces the same output.
 *
 * Usage: node .pi/skills/sync-portfolio/sync.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..", "..", "..");

const PROJECTS_PATH = join(ROOT, "projects.md");
const INDEX_PATH = join(ROOT, "index.html");

const NAV_BEGIN = "<!-- BEGIN PORTFOLIO NAV -->";
const NAV_END = "<!-- END PORTFOLIO NAV -->";
const CARDS_BEGIN = "<!-- BEGIN PORTFOLIO CARDS -->";
const CARDS_END = "<!-- END PORTFOLIO CARDS -->";

const SECTIONS = new Map([
  [
    "Professional Work",
    { slug: "professional", nav: "Professional", title: "Professional Work" },
  ],
  [
    "Open Source Contributions",
    { slug: "opensource", nav: "Open Source", title: "Open Source" },
  ],
  [
    "Personal Projects",
    { slug: "personal", nav: "Personal", title: "Personal Projects" },
  ],
]);

// --- Parsing -----------------------------------------------------------------

function normalizeKey(raw) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

function parse(md) {
  const sections = [];
  let section = null;
  let project = null;

  for (const line of md.split("\n")) {
    const h2 = line.match(/^## (.+)/);
    if (h2) {
      const name = h2[1].trim();
      if (!SECTIONS.has(name)) {
        section = null;
        continue;
      }
      section = { name, projects: [] };
      sections.push(section);
      project = null;
      continue;
    }

    if (line.match(/^### /) && section) {
      project = {};
      section.projects.push(project);
      continue;
    }

    const field = line.match(/^- \*\*(.+?)\*\*\s*(?:\([^)]*\))?\s*:\s*(.*)/);
    if (field && project) {
      const key = normalizeKey(field[1]);
      const val = field[2].trim();
      if (val && !val.startsWith("<!--")) {
        project[key] = val;
      }
    }
  }

  for (const s of sections) {
    s.projects = s.projects.filter((p) => p.project_name);
  }
  return sections.filter((s) => s.projects.length > 0);
}

// --- HTML generation ---------------------------------------------------------

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cardHtml(project, sectionName) {
  const lines = [];
  lines.push(`<div class="card">`);
  lines.push(
    `<div class="card__project-title">${esc(project.project_name)}</div>`,
  );

  // Context line — professional work only
  if (sectionName === "Professional Work") {
    const ctx = [project.employer_context, project.role].filter(Boolean);
    if (ctx.length) {
      lines.push(`<div class="card__context">${esc(ctx.join(" · "))}</div>`);
    }
  }

  if (project.one_line_hook) {
    lines.push(`<p class="card__hook">${esc(project.one_line_hook)}</p>`);
  }

  if (project.key_tech) {
    const tags = project.key_tech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    lines.push(`<div class="card__tags">`);
    for (const t of tags) {
      lines.push(`<span class="tag">${esc(t)}</span>`);
    }
    lines.push(`</div>`);
  }

  // Links vary by section type
  const links = [];
  if (sectionName === "Open Source Contributions") {
    if (project.repo_url) {
      links.push(
        `<a href="${esc(project.repo_url)}" class="card__link" target="_blank" rel="noopener">Repo</a>`,
      );
    }
    if (project.pr_issue_links) {
      links.push(
        `<a href="${esc(project.pr_issue_links)}" class="card__link" target="_blank" rel="noopener">PRs</a>`,
      );
    }
  } else if (sectionName === "Personal Projects") {
    if (project.live_url) {
      links.push(
        `<a href="${esc(project.live_url)}" class="card__link" target="_blank" rel="noopener">Live Site</a>`,
      );
    }
    links.push(
      `<span class="card__link card__link--muted">Code on request</span>`,
    );
  }

  if (links.length) {
    lines.push(`<div class="card__links">`);
    for (const l of links) {
      lines.push(l);
    }
    lines.push(`</div>`);
  }

  // Expandable detail
  const detail = [];
  if (
    sectionName === "Open Source Contributions" &&
    project.your_contribution
  ) {
    detail.push(project.your_contribution);
  }
  if (project.detail) {
    detail.push(project.detail);
  }
  if (detail.length) {
    lines.push(`<details class="card__details">`);
    lines.push(`<summary>Details</summary>`);
    lines.push(`<p>${esc(detail.join(" "))}</p>`);
    lines.push(`</details>`);
  }

  lines.push(`</div>`);
  return lines.join("\n");
}

function sectionHtml(section) {
  const cfg = SECTIONS.get(section.name);
  const cards = section.projects
    .map((p) => cardHtml(p, section.name))
    .join("\n");

  return [
    `<div class="container--${cfg.slug} container" id="${cfg.slug}">`,
    `<h1 class="section-title">${esc(cfg.title)}</h1>`,
    `<div class="card-container">`,
    cards,
    `</div>`,
    `</div>`,
  ].join("\n");
}

function navHtml(sections) {
  return sections
    .map((s) => {
      const cfg = SECTIONS.get(s.name);
      return `<li><a href="#${cfg.slug}" class="nav-link ${cfg.slug}">${esc(cfg.nav)}</a></li>`;
    })
    .join("\n");
}

// --- File injection ----------------------------------------------------------

function replaceBetween(html, begin, end, content) {
  const i = html.indexOf(begin);
  const j = html.indexOf(end);
  if (i === -1 || j === -1) {
    console.error(`Missing markers in index.html: ${begin} / ${end}`);
    process.exit(1);
  }
  return (
    html.slice(0, i + begin.length) + "\n" + content + "\n" + html.slice(j)
  );
}

// --- Main --------------------------------------------------------------------

let md;
try {
  md = readFileSync(PROJECTS_PATH, "utf-8");
} catch {
  console.error("projects.md not found. Create it first.");
  process.exit(1);
}

const sections = parse(md);

if (!sections.length) {
  console.log("No filled projects in projects.md. Nothing to sync.");
  process.exit(0);
}

let html = readFileSync(INDEX_PATH, "utf-8");
html = replaceBetween(html, NAV_BEGIN, NAV_END, navHtml(sections));
html = replaceBetween(
  html,
  CARDS_BEGIN,
  CARDS_END,
  sections.map((s) => sectionHtml(s)).join("\n"),
);
writeFileSync(INDEX_PATH, html, "utf-8");

const count = sections.reduce((n, s) => n + s.projects.length, 0);
console.log(
  `Synced ${count} project${count !== 1 ? "s" : ""} across ${sections.length} section${sections.length !== 1 ? "s" : ""}.`,
);
