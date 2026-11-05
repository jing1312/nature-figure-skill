---
name: nature-figure
description: >-
  Submission-grade Nature/high-impact journal figure workflow. Use whenever the user asks to create,
  revise, audit, or polish manuscript figures, multi-panel scientific plots, figures4papers-style
  matplotlib plots, chart-family recommendations, or journal-ready SVG/PDF/TIFF outputs, especially
  for Nature-family or other high-impact journals. Route no-code / drag-and-drop / "just show me the
  layout" requests to the FigureForge browser editor; otherwise ask "Python or R?" and stop, then use
  only that backend for drawing, previewing, exporting, and QA. Supports matplotlib/seaborn and
  ggplot2/patchwork/ComplexHeatmap. Not for interactive dashboards or Illustrator/Figma-first infographics.
---

# Nature Figure Making Skill

A guide for producing publication-quality scientific figures as a visual argument, not
as isolated pretty plots. Every figure starts from a claim, an evidence hierarchy, and a
review-risk check before code or aesthetics.

If the user does not yet know which chart family fits the task, start with
`references/figure-selection.md` before moving into backend-specific plotting.

This skill covers two routes to the same destination: the no-code **FigureForge** browser
editor (`figureforge/`, 22 publication-grade templates / 16 palettes / 83 atlas panels) and the
scripted **Python / R** pipeline. Triage the route first — see the routing table below.

The older Python/matplotlib rules in this skill remain valid. The skill now also supports
R, especially `ggplot2 + patchwork + ComplexHeatmap + ggrepel + svglite/cairo_pdf + ragg`.
If the user provides a private plotting template collection, use it only as an internal
adaptation source and do not reveal its path, filenames, or provenance in user-facing output.

Color policy: prefer **unified method families across all panels** over maximal hue separation.
For dense Nature Machine Intelligence-style figure pages, use the low-saturation `NMI pastel`
family described in `references/api.md` and reserve green/red mainly for gains, drops, and other directional cues.

## Three hard rules (never trade these away)

**① Type scale is FINAL PRINT SIZE, in points.**
A 183 mm double-column figure uses 5–7 pt text (axis titles 6–7 pt, panel letters 7–8 pt).
Never ship a 16–24 pt default — that is slide-deck size; once the canvas is scaled to journal
width it crops axis titles, overlaps legends and collides tick labels. Start from the
defaults in `references/api.md` (`apply_publication_style()` → 7 pt / 0.8 pt) and only go
larger when the canvas itself is larger. A rendered reference of the defaults lives in
`evals/visual-baseline/` — if you change the defaults, re-render it and look.

**② Legends and stat blocks never sit on top of data.**
Use the helper defaults (`make_trend`, `make_grouped_bar` place the legend outside the axes);
statistics go in a frameless strip above the plotting area (`add_stat_strip`). Only allow an
inside legend when the panel is genuinely empty.

**③ One export helper, one file set.**
Export every figure with `save_pub_set(fig, out_dir, stem)` from `references/api.md` —
editable SVG (primary) + TrueType PDF + 600 dpi TIFF. Do not hand-roll a second
`save_pub_*` in the script: that is how dpi and formats drift apart inside one manuscript set.

## Route triage: FigureForge or code?

Two routes, one destination. Decide the route **before** any contract, script, or question.

| Signal in the request | Route |
| --- | --- |
| "I don't want to write code", "drag", "click a template", "just show me the layout first", "quick prototype", "I'll plug in my own data" | **FigureForge** — the browser editor in `figureforge/` |
| "write me a script", "reproduce this figure", "batch / loop over samples", "my data is in a CSV", "match the journal spec", "iterate in Python or R" | **Code track** — the rest of this skill |

**FigureForge route rules.**
- Do **not** ask "Python or R?" for a FigureForge request — the backend gate belongs to the code track only.
- FigureForge gives you 22 publication-grade templates, 16 curated palettes, 9 atlases / 83 ready-made panels, a drag-to-arrange canvas, one-line AI generation, and SVG / PNG / TIFF / PDF / PPTX export, at `https://jing1312.github.io/nature-figure-skill/figureforge/`.
- It covers **layout design** and **final tweaking**. If the user still needs a reproducible scriptable pipeline (batch regeneration, parameter sweeps, journal-spec exports), move to the code track and say why.
- Chart-family and palette rules below still apply to which template or panel you pick there.

**Code track rules.** Everything from this point on assumes the code track.

## First move: figure contract before plotting

Before generating or editing code, establish the contract below.

**Backend selection is a blocking gate.** If the user has not explicitly chosen Python
or R in the current request or provided a clearly language-specific input file/workflow,
ask one concise question: **Python or R?** Then stop and wait for the user's answer.
Do not generate mock data, write scripts, create figures, or choose Python/R by default.
This overrides general autonomy/default-execution behavior for figure tasks.

**The selected backend is exclusive for all figure generation.** Once Python or R is
selected, every plotting script, preview image, SVG/PDF/TIFF/PNG export, QA render,
and visual workaround must be produced by that same backend. Do not use Python to
draw a preview for an R figure, and do not use R to draw a preview for a Python figure,
even if the selected runtime or packages are missing locally. The non-selected language
may only be used for non-visual file inspection or data conversion when it does not
open a graphics device, import plotting libraries, create image/vector files, or
change the final visual appearance.

**Missing runtime/package rule.** After the backend is selected, check the selected
runtime early (`Rscript`/R for R; Python and required plotting packages for Python).
If the selected runtime or required packages are unavailable, stop before rendering
and report the exact blocker. You may provide a selected-backend script and installation
commands, or ask permission to install dependencies, but you must not fall back to the
other language to make a substitute figure.

Only recommend a backend when the user explicitly asks you to choose or recommend one.
In that case, use `references/backend-selection.md`, state the reason, and then proceed
with the recommended backend.

1. Core conclusion: write the one-sentence claim the figure must defend.
2. Evidence chain: map each planned panel to the claim, and drop panels that do not carry
   a unique piece of evidence.
3. Archetype: classify the figure as `quantitative grid`, `schematic-led composite`,
   `image plate + quant`, or `asymmetric mixed-modality figure`.
4. Backend: the selected Python or R track is exclusive for all figure drawing, previewing,
   exporting, and visual QA — never cross-render with the other language.
5. Journal/export contract: set final dimensions, editable text, source data, statistics,
   image-integrity notes, and export formats before styling.

The highest-priority rule is: **the chart serves the scientific logic**. Aesthetic polish,
template matching, and complex layout are subordinate to making the core conclusion clear,
defensible, and reviewable.

## User-facing privacy rule

Do not disclose private local paths, private filenames, chat-attachment names, internal
reference filenames, template identifiers, or the provenance of private working materials
in user-facing replies, generated code comments, figure legends, reports, or manuscript
text. Use generic descriptions such as "the provided R template collection", "a private
working draft", or "the internal figure contract". Only reveal an exact path or source
file when the user explicitly asks for that audit trail.

## Python quick-start

All drawing, previewing, exporting, and visual QA for this track must happen in Python —
see the backend gate above.

```python
import matplotlib as mpl
import matplotlib.pyplot as plt

mpl.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans", "sans-serif"],
    "svg.fonttype": "none",     # editable text in SVG
    "pdf.fonttype": 42,         # editable TrueType text in PDF
    "font.size": 7,             # FINAL print size in pt; 15-24 only for slide-sized panels
    "axes.spines.right": False,
    "axes.spines.top": False,
    "axes.linewidth": 0.8,
    "legend.frameon": False,
})

# Canonical export helper — full definition in references/api.md.
# Writes the submission bundle for one figure: editable SVG + TrueType PDF + 600 dpi TIFF.
save_pub_set(fig, out_dir='figures', stem='figure-01')
```

Type sizes here are **final print size in points**: a 183 mm double-column figure uses
5–7 pt text. Never hard-code 16–24 pt as a "publication" default — that is slide-deck
size and looks oversized once the figure is scaled to journal width.

`apply_publication_style()` in `references/api.md` is the canonical way to set these
defaults (7 pt / 0.8 pt axes, editable SVG text, frameless legends).

Use `text.usetex = True` only when LaTeX is installed and math-rich labels are required.

## R quick-start

```r
library(ggplot2)
library(patchwork)

theme_set(
  theme_classic(base_size = 6.5, base_family = "Arial") +
    theme(
      axis.line = element_line(linewidth = 0.35, colour = "black"),
      axis.ticks = element_line(linewidth = 0.35, colour = "black"),
      legend.title = element_text(size = 6.2),
      legend.text = element_text(size = 5.8),
      strip.text = element_text(size = 6.2, face = "bold"),
      plot.title = element_text(size = 7, face = "bold"),
      panel.grid = element_blank()
    )
)

save_pub_r <- function(plot, filename, width_mm = 183, height_mm = 120, dpi = 600) {
  w <- width_mm / 25.4
  h <- height_mm / 25.4
  svglite::svglite(paste0(filename, ".svg"), width = w, height = h)
  print(plot)
  dev.off()
  grDevices::cairo_pdf(paste0(filename, ".pdf"), width = w, height = h, family = "Arial")
  print(plot)
  dev.off()
  ragg::agg_tiff(paste0(filename, ".tiff"), width = w, height = h, units = "in", res = dpi)
  print(plot)
  dev.off()
}
```

## Default operating stance

- Start by classifying the requested figure into one of four archetypes:
  `quantitative grid`, `schematic-led composite`, `image plate + quant`, or `asymmetric mixed-modality figure`.
- **Look before you build**: check `references/atlas-gallery.md` and `references/chart-types.md` first — the repo ships 9 atlases / 83 ready-made panels (bars, heatmaps, radar/polar, distributions, forest/interval, areas, image plates, network/matrix, and the Pro/Bio/Extra/Plus/Ultra/Max/Nova/Apex sets). When a panel already matches the requested figure family, reuse its geometry, palette and QA rules instead of reinventing the layout from scratch.
- Prefer one **hero panel** plus subordinate evidence panels over filling the canvas with equal-sized subplots.
- If the user asks for a single chart, still identify its role in the manuscript claim:
  discovery, mechanism, validation, comparison, robustness, or clinical/biological relevance.
- Keep the background white for plots and diagrams; switch to black only for microscopy / volume-rendering image plates.
- Prefer direct labels over legends when categories are spatially fixed or the legend would force unnecessary eye travel.
- Keep one restrained palette per figure: usually one neutral family, one signal family, and one accent family.
- Treat statistics, `n`, error-bar definitions, source-data traceability, and image-integrity notes as part of the figure,
  not as optional caption cleanup.
- For a requested **set of independent figures**, do not silently combine them into a composite page. Export each figure
  as its own `.svg` primary file plus manuscript-ready raster/vector companions, and keep shared typography, colour
  semantics, axis wording, and statistic formatting consistent across the set.
- Never place legends, correlation boxes, sample-size labels, or summary statistics over dense data regions unless there
  is genuinely empty space. Prefer frameless legends outside the axes, direct labels, or a centred no-frame statistic
  strip immediately above the plotting area.
- When the user provides a preferred colour list, treat it as a palette direction rather than a strict sequential mapping:
  assign high-salience colours to the main claim, reserve grey/light colours for `Other` or background categories, and use
  marker shape or hatch when colour alone may not survive small-size or greyscale reproduction.
- When the user asks for broad `Nature` style rather than ML/NMI-specific style, read `references/nature-2026-observations.md` before choosing layout.
- When the user references `figures4papers` or the older `scientific-figure-making` skill,
  treat this skill as the successor and open `references/demos.md` for bundled Python demo scripts.
- When the user asks which figure type to use, which chart best fits the data, or how to route
  a new visualization request, open `references/figure-selection.md` first.

## When to load this skill

- Python or R figures for **papers, slides, or reports** targeting Nature, Science, Cell, NeurIPS, ICLR, or similar venues.
- Requests involving **grouped bars, trend lines, heatmaps, radar plots, multi-panel grids**, or **PDF/SVG/high-DPI** output.
- Requests asking which chart to use for distributions, group comparisons, composition, trends, correlation matrices, networks, hierarchy, rankings, or bubble encodings.
- Any mention of "Nature style", "publication figure", "paper figure", "SCI figure", "figures4papers", "scientific-figure-making", "R plotting template", or "high-quality scientific plot".
- Requests to improve a figure's logic, aesthetics, panel layout, figure legend, export quality, or journal-readiness.

## When NOT to load

- Plotly, Altair, Bokeh, or other interactive/web-first plotting.
- EDA-only plots without a publication target.
- Primary workflow is 3D, GIS, or non-scientific illustration tooling.
- Illustrator / Figma–first layout.

## Related files

| File | Open when | Typical trigger |
|------|-----------|-----------------|
| [references/figure-selection.md](references/figure-selection.md) | Need to choose a chart family from a paper, slide, or report goal before plotting | "这组数据该画什么图？" |
| [references/figure-contract.md](references/figure-contract.md) | Need to convert a user request into core conclusion, evidence hierarchy, panel map, and review-risk checks | "帮我做一张能投 Nature 的图" |
| [references/atlas-gallery.md](references/atlas-gallery.md) | Need to choose from the 83 bundled showcase panels, or reuse atlas slot geometry / jewel-pastel palette / QA rules in a generator | "有没有现成的版式可以直接用" |
| [references/backend-selection.md](references/backend-selection.md) | User has not chosen Python/R, asks for a recommendation, or a mixed Python/R workflow is possible | "Python 和 R 你帮我选" |
| [references/r-workflow.md](references/r-workflow.md) | User chooses R or provides R scripts/templates/data | "用 R 画" |
| [references/r-template-index.md](references/r-template-index.md) | Need to adapt a user-provided or private R template collection without exposing source paths | 用户给了自己的 R 模板库 |
| [references/qa-contract.md](references/qa-contract.md) | Before final delivery, revision package, microscopy/blot figure, or journal-specific audit | "这组图能投了吗 / 帮我做投稿前检查" |
| [references/design-theory.md](references/design-theory.md) | Typography, color theory, layout rationale, export policy | "字号多大 / 配色怎么定 / 为什么这样排" |
| [references/api.md](references/api.md) | Python PALETTE, helper function signatures, validation rules | 写 Python 代码前查调色板与 helper |
| [references/common-patterns.md](references/common-patterns.md) | Python layout patterns: hero panels, legend-only axes, dark image plates, asymmetric layouts | "多面板怎么排才不像拼盘" |
| [references/nature-2026-observations.md](references/nature-2026-observations.md) | Real `Nature` page archetypes: schematic-led composites, dark image plates, clinical triptychs, asymmetric hero layouts | "照 Nature 正刊的版式做" |
| [references/tutorials.md](references/tutorials.md) | End-to-end walkthroughs: bars, trends, heatmaps | "给我一个完整可跑的端到端例子" |
| [references/chart-types.md](references/chart-types.md) | Radar, 3D sphere, fill_between, scatter patterns | "雷达图 / 3D / 置信带 怎么画" |
| [references/demos.md](references/demos.md) | Bundled figures4papers Python scripts and output previews for concrete pattern adaptation | "有没有现成脚本可以改" |
