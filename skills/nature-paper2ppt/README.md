# `nature-paper2ppt` skill

A journal-club and lab-meeting skill for turning scientific papers into concise Chinese
PowerPoint decks with a Nature-style evidence narrative.

The skill accepts a paper PDF, preprint, article text, abstract plus figure legends, or
structured reading notes. It identifies the paper type, extracts the scientific argument,
selects only the figures that support that argument, writes Chinese slide content and
speaker notes, builds a real `.pptx`, and performs lightweight package QA.

## What it does

- converts a scientific paper into a 10-16 slide Chinese presentation
- keeps the paper's argument as the slide spine instead of copying section order
- classifies the paper type before choosing the narrative logic
- selects key figures, tables, or panels as evidence rather than decoration
- crops dense figure panels when full figures would be unreadable
- writes Chinese titles, concise bullets, captions, takeaways, and speaker notes
- creates an actual editable `.pptx` deck as the primary deliverable
- records used figure assets in an asset manifest when figures are extracted
- runs lightweight QA on slide count, embedded media, speaker notes, and PPTX package structure

## Source and design hierarchy

- Nature-style scientific reporting logic: problem, gap, claim, evidence, validation,
  reuse value, limitations, and discussion
- Academic journal-club practice: short live-presentation slides rather than dense
  reading notes
- Evidence-first slide design: one dominant figure or table per result slide when possible
- Low-overhead production: avoid exhaustive OCR, figure extraction, and rendering unless
  they materially improve the deck

## File structure

```text
nature-paper2ppt/
├── SKILL.md
└── README.md
```

## When to use

- making a PPT or PPTX from a research paper PDF
- preparing a journal club, group meeting, lab meeting, paper sharing, or thesis seminar
- summarising a Nature-family paper into Chinese slides
- turning article text, figure legends, or reading notes into a presentation
- creating a figure-integrated deck rather than only an outline or summary
- needing speaker notes, source labels, and a QA report for the deck

## Default output package

The expected default output is a small working folder containing:

```text
output/
├── final_presentation_cn.pptx
├── qa_report.md
├── asset_manifest.md          # when source figures/tables are extracted
└── assets/
    └── figures/
```

Optional outline or script files may be created when they help review or debugging, but
the `.pptx` remains the main deliverable.

## Presentation logic

The default arc helps the audience answer:

1. Why does this problem matter?
2. What gap or bottleneck does the paper address?
3. What did the authors do?
4. What is the key evidence?
5. Why should we trust the result?
6. What is new, reusable, or broadly meaningful?
7. Where are the boundaries and open questions?

The skill adapts this arc by paper type. Discovery papers use a question-to-evidence
logic; methods, AI, and tool papers use problem-to-solution; resources and atlases use
workflow-to-validation; reviews use an evidence-map structure.

## Design intent

The skill should create a deck that can be used directly in an academic oral report. It
should be concise, figure-led, and evidence-aware. It should not fabricate values,
methods, mechanisms, datasets, or figure interpretations that are not supported by the
source paper.

Dense result visuals should be cropped, split, or given their own slide instead of being
shrunk into a symmetrical two-column layout. Explanatory text should stay short on slides,
with deeper interpretation moved into speaker notes.

## Notes

- Default language is Simplified Chinese while preserving important technical terms,
  abbreviations, gene names, model names, equations, and statistical terms in English.
- The skill is designed for research papers across domains, not only biomedical papers.
- When no reliable headless renderer is available, the skill performs structural QA and
  records that rendered preview QA was skipped.
