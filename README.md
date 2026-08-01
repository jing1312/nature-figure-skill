# nature-figure-skill

An independently hosted **derivative snapshot** of [`Yuan1z0825/nature-skills`](https://github.com/Yuan1z0825/nature-skills), with a small set of local extensions to the `nature-figure` workflow.

> [!IMPORTANT]
> This is not the original `nature-skills` repository and is not presented as an independently authored replacement. Most files in the initial snapshot are unchanged from upstream. The original MIT licence and attribution are preserved in [`LICENSE`](LICENSE) and [`DERIVATIVE_NOTICE.md`](DERIVATIVE_NOTICE.md).

## Repository status

- **Upstream baseline:** [`f3941a1`](https://github.com/Yuan1z0825/nature-skills/commit/f3941a1722e39af78b24bc7a34167b8880629545), dated 24 May 2026
- **Initial derivative snapshot:** [`11fc2b8`](https://github.com/jing1312/nature-figure-skill/commit/11fc2b84a4fcd4f035b7a6f32045a9b2832c6a12)
- **Synchronisation:** this repository is a historical snapshot with local figure-workflow extensions; it is not automatically synchronised with current upstream development
- **Recommended source for the latest upstream release:** [`Yuan1z0825/nature-skills`](https://github.com/Yuan1z0825/nature-skills)

## What is verifiably different

A file-level comparison of the initial derivative commit against the upstream baseline identified substantive local edits in four `nature-figure` files:

| File | Local extension in this snapshot |
| --- | --- |
| [`skills/nature-figure/SKILL.md`](skills/nature-figure/SKILL.md) | Guidance for exporting independent figure sets, avoiding annotations over dense data, and assigning user-supplied colours by semantic role |
| [`references/api.md`](skills/nature-figure/references/api.md) | Two additional publication-oriented palettes and a frameless statistic-strip helper |
| [`references/common-patterns.md`](skills/nature-figure/references/common-patterns.md) | Patterns for outside legends, independent exports, semantic palette assignment, and non-obstructing statistics |
| [`references/design-theory.md`](skills/nature-figure/references/design-theory.md) | Design guidance for mapping supplied colours to scientific meaning and maintaining contrast |

The initial snapshot also added [`DERIVATIVE_NOTICE.md`](DERIVATIVE_NOTICE.md) and the root-level `skill_scatter_plot` PNG/SVG examples. Three bibliographic sample files differ only in line endings and are **not** claimed as substantive modifications. The upstream star-history workflow was not included.

No authorship claim is made for unchanged upstream files. For the complete original project history and subsequent community contributions, use the [upstream repository](https://github.com/Yuan1z0825/nature-skills).

## Included snapshot

The repository contains nine reusable instruction bundles. Each `skills/nature-*` directory is one portable unit; copy the whole directory because skills may depend on references, assets, scripts, or local README files.

| Skill | Snapshot status | Purpose |
| --- | --- | --- |
| [`nature-figure`](skills/nature-figure/README.md) | Stable | Scientific-figure workflow for Python and R |
| [`nature-polishing`](skills/nature-polishing/README.md) | Stable | Academic prose polishing |
| [`nature-writing`](skills/nature-writing/README.md) | Draft | Manuscript section drafting and restructuring |
| [`nature-citation`](skills/nature-citation/README.md) | Beta | Citation retrieval and reference export |
| [`nature-data`](skills/nature-data/README.md) | Draft | Data-availability and FAIR metadata guidance |
| [`nature-reader`](skills/nature-reader/README.md) | Beta | Source-grounded bilingual paper reading |
| [`nature-response`](skills/nature-response/README.md) | Beta | Point-by-point reviewer responses |
| [`nature-paper2ppt`](skills/nature-paper2ppt/README.md) | Beta | Chinese scientific-paper presentations |
| [`nature-academic-search`](skills/nature-academic-search/README.md) | Beta | Multi-source academic search and reference management |

Status labels above describe the imported snapshot and should not be interpreted as independent validation by this repository.

## Installation

### Install this derivative snapshot

```bash
git clone https://github.com/jing1312/nature-figure-skill.git
cd nature-figure-skill
```

For a Codex-compatible local skill library, install one complete skill directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/nature-figure ~/.codex/skills/
```

Or install every skill contained in this snapshot:

```bash
mkdir -p ~/.codex/skills
for d in skills/nature-*; do
  cp -R "$d" ~/.codex/skills/
done
```

For a longer snapshot-specific walkthrough, see [`install.md`](install.md). Note that some plugin metadata remains attributed to and configured for the upstream project; manual directory installation is therefore the least ambiguous way to use this derivative snapshot.

### Use the latest upstream version

```bash
git clone https://github.com/Yuan1z0825/nature-skills.git
cd nature-skills
```

Follow the current [upstream README](https://github.com/Yuan1z0825/nature-skills#readme) for supported installation methods and the latest skill set.

## Scientific-figure extension at a glance

The local `nature-figure` edits focus on four practical presentation problems:

1. Exporting requested plots as consistent independent files rather than silently combining them into a composite.
2. Moving legends and summary statistics away from dense data regions.
3. Mapping custom colours to scientific roles instead of applying them in arbitrary list order.
4. Preserving colour semantics, typography, axis wording, and statistic formatting across a figure set.

These are workflow and documentation extensions. They do not guarantee journal acceptance or replace journal-specific author instructions, statistical review, accessibility checks, or scientific validation.

## Attribution and licence

The upstream project is credited to Yuan Yizhe and its contributors. This derivative retains the original MIT licence in [`LICENSE`](LICENSE). See [`DERIVATIVE_NOTICE.md`](DERIVATIVE_NOTICE.md) for the concise redistribution notice.

When redistributing this repository:

1. retain the original copyright and licence;
2. identify it as a derivative of `Yuan1z0825/nature-skills`;
3. distinguish local modifications from unchanged upstream material; and
4. do not imply endorsement or official affiliation with the upstream maintainers.
