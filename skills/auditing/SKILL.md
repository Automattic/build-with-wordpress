---
name: auditing
description: Audit a Studio-backed WordPress site for performance, accessibility, and visible frontend quality issues, then recommend or validate improvements.
---

# Auditing

Use this skill when the user wants to review, optimize, or verify an existing WordPress site rather than primarily build new functionality.

## Ownership

This skill owns:

- performance audits using Studio MCP tools
- accessibility-focused review of color, contrast, motion, and readability
- visible frontend quality review when the user asks for QA or polish
- before-and-after audit comparison after fixes

Use `studio` for site resolution, screenshots, and MCP tool usage details.

## Principle

Start with the smallest audit that answers the user's request.

- If the user asks about speed, Core Web Vitals, or performance, prioritize the performance workflow.
- If the user asks about accessibility, contrast, readability, or color usage, prioritize the accessibility workflow.
- If the user asks for a general review, combine the relevant sections and keep the report practical.

Do not invent automated checks that the available tools do not provide. When a conclusion comes from visual inspection or code reading rather than a dedicated tool, say so.

## Workflow

### 1. Resolve the target site

Use `studio` to:

- identify the site
- ensure it is running
- confirm the page or URL path to review

If the user did not specify a page, default to `/`.

### 2. Pick the audit scope

Choose one or more of:

- Performance Audit
- Accessibility Review
- Visual QA

Tell the user which scope you are using when it is not obvious from the request.

Once you begin the actual audit workflow, call `record_workflow_event` with `workflow: "auditing"` and `stage: "started"`.

### 3. Performance Audit

Use `audit_performance` for the requested path.

Interpret at least:

- TTFB
- FCP
- LCP
- CLS
- total page weight
- request count
- DOM size
- JS, CSS, image, and font breakdown

Use these baseline thresholds:

| Metric | Good | Needs Improvement | Poor |
|-------|------|-------------------|------|
| TTFB | < 800 ms | 800-1800 ms | > 1800 ms |
| FCP | < 1800 ms | 1800-3000 ms | > 3000 ms |
| LCP | < 2500 ms | 2500-4000 ms | > 4000 ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |

Use these page-composition warning signs:

- DOM elements above 1500
- total page weight above 3 MB
- total requests above 80
- scripts above 20 files or 500 KB total
- stylesheets above 10 files or 200 KB total

Translate findings into WordPress-specific actions where possible, such as:

- reducing or replacing heavy plugins
- deferring or removing non-critical JS
- reducing oversized images
- trimming unused theme CSS
- checking duplicate font loads
- simplifying wrapper-heavy block layouts

### 4. Accessibility Review

Use screenshots plus theme or plugin code inspection as needed.

Focus on issues this repo can realistically help with:

- low text/background contrast
- weak CTA contrast or ambiguous button states
- missing or unclear hover and focus states
- motion that should respect `prefers-reduced-motion`
- readability issues caused by font size, line height, or dense layouts
- color choices that make important information hard to distinguish

When the issue is visual, prefer screenshot-backed observations.

When the issue appears structural, inspect the relevant theme or plugin files before recommending a fix.

### 5. Visual QA

When the user wants a broader quality pass, use screenshots to check:

- spacing and alignment
- responsive layout issues
- broken visual hierarchy
- inconsistent component styling
- awkward cropping or media balance

Keep this section focused on visible problems that materially affect the site.

### 6. Report clearly

Summarize:

- what you audited
- the most important findings
- the likely causes
- the highest-value next fixes

Prefer a short prioritized report over a long exhaustive list.

### 7. Re-test after changes

If fixes are made during the same task, re-run the relevant audit steps and compare before versus after.

Call out what improved, what did not, and any remaining tradeoffs.

When the audit workflow is complete, call `record_workflow_event` with `workflow: "auditing"` and `stage: "completed"`.

## Important notes

- `audit_performance` results are synthetic measurements from a local Studio environment. Use them primarily for diagnosis and before-versus-after comparison, not as production truth.
- Accessibility observations in this workflow are often based on visual review and code inspection rather than a dedicated automated accessibility scanner.
- When performance, accessibility, and design issues conflict, explain the tradeoff instead of over-optimizing one dimension silently.
