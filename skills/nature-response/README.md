# `nature-response` skill

A reviewer-response skill for drafting, auditing, and revising point-by-point response
letters for Nature-family and high-impact journal manuscript revisions.

This skill is bilingual-aware. It accepts Chinese or English reviewer comments, editor
letters, author notes, and draft rebuttals, then prepares an English response package with
Chinese author confirmation notes when useful.

## What it does

- splits reviewer comments into stable IDs such as `R1.1`, `R1.2`, and `R2.1`
- classifies each concern by type, severity, action, evidence need, and risk
- creates a response strategy summary before drafting prose
- routes requests into drafting, auditing, revising, triage-only, or appeal-like handling
- assigns editor instruction IDs such as `E.1` before reviewer IDs when the decision letter includes editor instructions
- drafts an editor-readable point-by-point response letter
- maps each response to a manuscript action, location, or missing-information flag
- rewrites defensive or vague author notes into professional response language
- handles difficult cases such as out-of-scope experiments, factual reviewer errors, conflicting reviewers, statistical critiques, and compliance concerns
- flags missing experiments, analyses, line numbers, citations, figure panels, and manuscript changes instead of inventing them

## When to use

- preparing a Nature, Nature Portfolio, Springer Nature, or similar high-impact journal revision
- responding to major or minor revision comments
- turning reviewer comments into a manuscript change checklist
- auditing a draft rebuttal for missing responses, tone problems, or unsupported claims
- converting Chinese author notes into submission-ready English point-by-point replies
- deciding how to respectfully disagree with a reviewer or explain a scope boundary

## What it returns

Unless the user asks for another format, the skill returns:

1. response strategy summary
2. comment-response tracker
3. draft point-by-point response letter
4. manuscript change checklist
5. missing information / risk flags
6. Chinese confirmation notes when the user writes in Chinese

## Core rules

- Preserve reviewer comments faithfully before responding.
- Answer every concern, cross-reference it, or mark it unresolved.
- Map every response to a concrete action such as `ACCEPT_TEXT`, `ACCEPT_ANALYSIS`, `SOFTEN_CLAIM`, `DISAGREE`, or `AUTHOR_INPUT_NEEDED`.
- Do not invent experiments, analyses, citations, line numbers, figure panels, supplementary items, reviewer identities, editor instructions, or manuscript changes.
- Use cooperative, evidence-forward, non-defensive language.
- Treat the response letter as an editor-facing verification document, not a politeness exercise.

## Source hierarchy

- Target journal instructions and decision-letter requirements.
- Nature / Nature Portfolio / Springer Nature revision and peer-review process guidance.
- Springer Nature editorial advice on rebuttal letters.
- Local manuscript facts supplied by the author.

The source basis is summarized in `references/source-basis.md` with URLs, rule summaries, and source-type labels.

## File structure

```text
nature-response/
├── README.md
├── SKILL.md
├── references/
│   ├── source-basis.md
│   ├── response-structure.md
│   ├── comment-taxonomy.md
│   ├── action-mapping.md
│   ├── tone-and-stance.md
│   ├── chinese-author-alignment.md
│   ├── difficult-cases.md
│   ├── intake-and-routing.md
│   └── qa-checklist.md
├── tests/
    ├── conflicting-reviewers.md
    ├── defensive-draft-audit.md
    ├── evaluation-summary.md
    ├── minor-revision.md
    ├── major-revision-missing-evidence.md
    ├── impossible-experiment.md
    └── rubric.md
└── examples/
    ├── conflicting-reviewers.md
    ├── major-revision-with-missing-evidence.md
    └── minor-revision.md
```

## Status

Beta. The behavior is defined by synthetic Markdown fixtures and examples. The skill should remain
below Stable until it has been validated on real anonymized revision packages with author permission.
