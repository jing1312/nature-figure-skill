---
name: nature-paper2ppt
description: Build a complete but efficient Nature-style Chinese PPTX presentation from a scientific paper, preprint, PDF, article text, abstract, figure legends, or reading notes. Use this skill whenever the user asks to make slides/PPT/PPTX for journal club, group meeting, paper sharing, thesis seminar, lab meeting, department report, or academic presentation from a research paper, not only medical papers. It identifies the paper type and argument, selects only the figures needed for the story, writes Chinese slide content and speaker notes, creates the actual .pptx deck, and runs an explicit self-review/corrective revision loop focused on figure quality, text overflow prevention, and non-template visual design before delivery.
---

# Purpose
Transform a scientific paper or paper-derived notes into a complete Chinese, figure-integrated PPTX presentation package with a Nature-style reporting logic.

The skill must not stop at an outline or script. The expected end product is a real `.pptx` deck. Keep supporting files minimal unless the user asks for more traceability.

Use this skill for papers across scientific fields, including:
- life sciences and medicine
- chemistry and materials science
- environmental and earth sciences
- physics and engineering
- computational biology, AI, and methods papers
- interdisciplinary Nature-family style research
- reviews, perspectives, resources, datasets, and benchmark papers

# Core Principle
Use the paper's scientific argument as the presentation spine.

The default slide logic should help the audience answer, in order:
1. Why does this problem matter?
2. What gap or bottleneck does the paper address?
3. What did the authors do?
4. What is the key evidence?
5. Why should we trust the result?
6. What is new, reusable, or broadly meaningful?
7. Where are the boundaries and open questions?

This is more important than copying the paper section order.

# Lean Operating Mode
Default to the lowest-overhead workflow that still produces a usable PPTX.

Do:
- read only the source material needed to understand the paper's argument,
- extract only figures/tables that will actually appear in the deck,
- create the PPTX as the primary deliverable,
- design slides with varied, evidence-led composition rather than rigid AI-looking card templates,
- prevent text overflow by writing shorter on-slide copy, using larger text boxes, and splitting slides when needed,
- run at least one self-audit and correction pass on the generated PPTX,
- run lightweight structural checks on the PPTX package after revision,
- write a short QA report.

Avoid by default:
- exhaustive extraction of every figure, page, image, table, or supplement,
- full OCR unless normal text extraction fails or the PDF is scanned,
- saving full raw extracted paper text unless it is needed for debugging or reuse,
- installing new dependencies when an existing tool can complete the task,
- launching GUI apps or desktop automation just to render previews,
- generating long markdown scripts when the user only needs a deck,
- rendering every slide when no reliable headless renderer is available.

## Toolchain Policy
Use a cross-platform Python-first stack unless the user explicitly asks for something else:
- PyMuPDF for metadata, text extraction, page rendering, and page-level crops,
- Pillow for figure crops, contact sheets, and lightweight preview images,
- python-pptx for slide authoring and PPTX-safe editing,
- zipfile plus a reopen pass through python-pptx for package validation.

This stack must work on macOS, Linux, and Windows. Use `pathlib` paths, project-local output directories, and Office-safe fonts or theme fonts. Do not hardcode OS font paths or platform-specific file locations. If Python packages are missing, create a local virtual environment and install the minimum packages only when policy permits; do not install broad document suites just to finish a normal deck.

Treat LibreOffice/soffice as optional, only when it is already available and a real rendered preview is worth the cost. Avoid Keynote, PowerPoint desktop automation, AppleScript, Preview, Finder, `open`, and any OS-specific font or path dependency in helper scripts. If a preview can be made from extracted slide objects or assets, prefer that over re-rendering the whole deck.

Ask or document the tradeoff before doing expensive extras such as full supplementary-material processing, high-resolution recreation of many figures, full slide-by-slide rendered QA, or very long decks.

# Accepted Inputs
The skill may receive:
- a full paper PDF
- supplementary figures or tables
- Word or markdown converted paper text
- abstract + results + figure legends
- structured reading notes
- manually pasted article content
- an `input/source.md` file
- a user-provided PPTX template

Default output language is simplified Chinese unless the user requests otherwise. Preserve important technical terms, abbreviations, gene/protein names, model names, dataset names, equations, and statistical terms in English when needed.

# Default Fast Path
For a normal selectable-text paper PDF, run the shortest complete path:
1. Extract metadata, abstract, headings, figure legends, and table captions with PyMuPDF.
2. Identify the paper type, argument, and candidate figures before rendering high-resolution pages.
3. Render low-resolution contact sheets only when figure locations are unclear.
4. Render high-resolution images only for selected figure/table pages and crop only assets that will appear in the deck.
5. Build the PPTX directly with python-pptx, using native tables/charts when values are explicit and figure crops when the original visual carries the evidence.
6. Run the self-review and revision loop: inspect crop quality, slide density, layout bounds, source labels, notes, and figure readability; fix high- and medium-severity issues before final validation.
7. Verify by reopening the PPTX and inspecting package structure; render slide previews only if a reliable cross-platform headless renderer is already available.

OCR, full supplementary extraction, all-page high-resolution rendering, all-slide rendered QA, and long script files are opt-in or justified exceptions, not defaults.

# Workflow

## Step 1. Read and extract source material
Extract, when available:
- title, authors, journal/preprint server, year, DOI
- field and subfield
- paper type
- central problem and knowledge gap
- main claim or thesis
- study design, workflow, model, dataset, or experimental system
- key methods and controls
- main results and quantitative findings
- key figures, tables, and figure legends
- validation, robustness, ablation, or sensitivity analyses
- limitations and unresolved questions
- broader scientific, clinical, technical, environmental, or translational meaning

Do not invent missing numbers, mechanisms, datasets, or figure details.
Use a two-pass reading strategy: first capture metadata, abstract, headings, figure legends, and table captions; then read only the result and methods pages needed to support the slides.

## Step 2. Classify the paper before designing slides
Identify the primary paper type. Choose the closest fit:
- discovery / mechanism paper
- translational or applied science paper
- clinical or population study
- methods / algorithm / tool paper
- resource / dataset / atlas paper
- omics, single-cell, spatial, or multi-modal study
- materials / chemistry / engineering performance study
- environmental, ecological, or earth-system study
- benchmark / evaluation paper
- review / perspective / commentary
- meta-analysis / systematic review

Then identify the best presentation logic:
- `claim-first`: useful when the paper has one strong central claim
- `question-to-evidence`: useful for mechanism and discovery papers
- `problem-to-solution`: useful for methods, tools, and engineering papers
- `workflow-to-validation`: useful for datasets, atlases, omics, and benchmarks
- `evidence-map`: useful for reviews and perspectives

## Step 3. Build the Chinese presentation plan
Default length: 12-16 slides for a 15-20 minute report.

The default structure is:
1. 标题页
2. 研究背景：为什么这个问题重要
3. 知识缺口 / 技术瓶颈
4. 论文核心问题与主张
5. 研究设计 / 技术路线 / 分析框架
6. 关键证据1
7. 关键证据2
8. 关键证据3
9. 验证、对照或稳健性证据
10. 机制模型 / 方法优势 / 综合框架
11. 创新点与可复用价值
12. 局限性与未解决问题
13. 总结与讨论

Adapt this structure to the paper type. Do not force every paper into the same template.

For a quick or unspecified request, prefer 10-14 slides. Expand beyond 16 slides only when the user asks for a detailed seminar deck or the paper genuinely needs the extra space to stay readable.

### Plan the visual rhythm before authoring
Before creating slides, assign each slide a visual role and avoid repeating the same role too often.

Use a rhythm such as:
- opener / conceptual claim,
- problem setup,
- mechanism or workflow,
- evidence slide,
- evidence slide with cropped subpanel,
- comparison or ablation,
- boundary / limitation,
- synthesis / discussion.

For each slide, choose one of these composition types:
- `figure-dominant`: figure owns most of the slide; text is a quiet margin note or bottom strip,
- `process-wide`: full-width workflow with small stage labels,
- `claim-led`: one strong sentence with 2-3 supporting fragments, no fake cards,
- `comparison`: table/chart or two evidence blocks with a single conclusion line,
- `discussion`: open layout with a few sharp prompts, not a dense bullet page.

Do not create the whole deck from one generic layout family. If the plan shows repeated `three cards + takeaway` or `figure left + rail right` slides, revise the plan before building.

## Step 4. Select figures as evidence, not decoration
Inspect the source for:
- graphical abstracts or summary models
- study design and workflow diagrams
- central result figures
- microscopy or imaging panels
- heatmaps, dimensionality reduction, networks, maps, or spatial plots
- survival curves, forest plots, calibration curves, or statistical result plots
- materials characterization and performance plots
- model architecture, benchmark, ablation, or error analysis figures
- key tables
- validation or control figures

Prioritize figures that carry the paper's argument:
1. design/workflow,
2. main evidence,
3. validation or robustness,
4. mechanism/model/synthesis,
5. practical or conceptual implication.

Prefer a few readable key panels over many unreadable full figures.

## Step 5. Extract and prepare figure assets
When the source contains usable figures:
- extract original images from the PDF or source package when possible, but only for selected figures,
- render high-resolution page images only for pages containing selected figures or tables,
- crop relevant panels when full figures are too dense,
- keep original data visuals unchanged,
- save images under `output/assets/figures/`,
- use clear filenames such as `fig1_workflow.png`, `fig2b_main_result.png`, or `fig4ef_validation.png`,
- record source page, figure number, panel, crop status, and intended slide in `output/asset_manifest.md`.

For a standard 10-14 slide journal-club deck, usually select 4-8 figure/table assets. Add more only when they directly support distinct evidence slides.

For tables and simple quantitative comparisons, prefer editable PPT-native tables/charts when values are explicit in the paper text or table. Use table screenshots only when recreating the table would risk transcription errors or when layout/formatting itself is the evidence.

If extraction fails, use the best available fallback:
- rendered page screenshot with careful crop,
- recreated editable table only when values are explicitly available,
- clearly labeled placeholder only when the visual is unavailable.

### Figure crop self-check before slide insertion
Before building the final PPTX, create a quick contact sheet or inspect selected crops directly. This is a cheap way to catch the most common deck defects before they become slide defects.

Check every selected figure/table asset for:
- clipped titles, axis labels, legends, panel letters, or source figure labels,
- irrelevant surrounding paper text or captions included in the crop,
- too little margin around the crop, especially at the top and left edges,
- unreadable small text after the planned slide scaling,
- dense multi-panel figures that should be split into separate slides or cropped to key panels,
- low-resolution or blurry rendering.

Revise the crop before placing it in the PPTX when any scientific context is cut off. A figure crop that loses a title, y-axis label, legend, or panel label is a defect, not an acceptable tradeoff.

## Step 6. Write slide-by-slide content
For each slide, write:
- Chinese title
- slide purpose
- suggested layout
- 3-4 concise Chinese bullets
- selected figure or table asset, if any
- Chinese figure caption and interpretation
- one core takeaway sentence
- Chinese speaker note when oral explanation is useful

Each slide should make one point. Result slides should answer:
- What does this figure show?
- Why does it matter for the paper's claim?
- What should the audience believe after seeing it?

Speaker notes should be useful but concise. Do not write long narration for every slide when the slide content is self-explanatory.

### On-slide text budget
Write for the slide, not for the manuscript. Most explanation belongs in speaker notes.

Use these default limits unless a user-provided template clearly supports more:
- title: one line preferred; two lines allowed only when the slide still has enough vertical space,
- normal slide: 2-3 bullets, each no more than about 18 Chinese characters or 8-10 English words,
- result slide: 1 short interpretation sentence plus at most 2 compact callouts,
- card body: 1 sentence, usually no more than 24 Chinese characters,
- metric label: 1 line whenever possible,
- source label: small and short; do not let source text compete with the figure.

If the point needs more words, split the slide or move the explanation to speaker notes. Do not rely on shrinking text below readable size to make an overfull slide work.

### Evidence hierarchy on a slide
For any result slide, order the visual logic like this:
1. hero figure or main table crop,
2. narrow interpretation rail or short annotation band,
3. only the minimum labels needed to read the evidence,
4. any deeper explanation moves to speaker notes or the next slide.

Do not let the interpretation block become as large or louder than the evidence itself.

### Layout adaptation rule
Do not default to a fixed 50/50 left-right split.
Choose the layout from the figure's aspect ratio, density, and role in the argument:
- use a full-width or near-full-width visual when the figure is wide, complex, or the slide's main evidence,
- use a tall image with a narrow text rail when the figure is vertically oriented or the caption/interpretation is short,
- use a top/bottom stack when the figure needs more horizontal room or the slide benefits from a short argument above and a visual below,
- use an asymmetric split such as 70/30, 75/25, or 65/35 when one side clearly dominates,
- use a compact visual-plus-callout layout when the slide only needs a few annotations,
- use a table or figure crop instead of shrinking a dense graphic into a small frame.

Treat equal-weight 1:1 layouts as the exception, not the default. Use them only when the text and image truly carry comparable weight and neither needs dominance. In most result slides, one side should clearly dominate.

Prefer the smallest text block that still makes the claim legible. If the visual needs space, give it space; if the text is the main point, let the slide breathe and keep the figure smaller or move it to its own slide.

For dense figures or tables, crop to the most relevant panels and avoid squeezing them into equal columns. For sparse slides, do not pad the page with extra boxes just to fill space.

### Anti-template design rule
Avoid layouts that look like generic AI-generated slides. Academic restraint does not mean mechanical repetition.

Do not overuse:
- three equal cards with icon/number strips,
- rows of identical metric pills,
- the same right-hand interpretation rail on every figure slide,
- nested rectangles and fake dashboard cards,
- evenly spaced boxes that ignore the shape of the evidence,
- generic "problem / solution / impact" grids when the paper's argument has a more specific structure.

Instead, vary the composition based on the evidence:
- let one figure own the page when it is the evidence,
- use a single large quote-like claim line only when the slide is conceptual,
- use small edge annotations, direct labels, or a narrow marginal note instead of big explanatory boxes,
- use full-width process diagrams for workflows,
- split a dense figure across two slides instead of adding a crowded explanation rail,
- place summary text as a quiet bottom strip or margin note when the figure is dominant.

Before finalizing, scan the deck at slide-sorter scale. If five or more slides share the same composition, redesign at least some of them so the deck has a natural rhythm.

### Slide archetype defaults
Use these defaults unless the source strongly suggests otherwise:
- Cover slide: one dominant visual or typographic idea, no balanced split, no dashboard-like grid.
- Background/problem slide: short setup text plus one compact context visual or schematic.
- Workflow/method slide: full-width or top-to-bottom process diagram, not two equal text/figure columns.
- Result/evidence slide: one dominant figure or table crop with a narrow interpretation rail; avoid 1:1 layouts unless the evidence and explanation truly balance.
- Comparison/table slide: full-width table or split table across slides if it becomes cramped.
- Model/summary slide: a large central model with a brief takeaway strip or short annotation band.
- Conclusion/discussion slide: text-led but open composition, with 2-4 bullets and no unnecessary containers.

### Title writing rule
Use conclusion-style titles whenever possible. A good title states the slide's point, not just its topic. Prefer sentences like “PathAgent 主动识别信息不足并补充证据” over labels like “Case Study” or “Figure 3”.

### Visual density rule
Do not downscale a dense figure, table, or multi-panel graphic into a tiny slot just to preserve symmetry. If a visual cannot be read at presentation scale, crop it, split it, or give it its own slide. Prefer one legible visual over several cramped ones.

## Step 7. Build the actual PPTX deck
Create a real `.pptx` file as the primary deliverable.

Use `python-pptx` as the default authoring tool for scientific paper decks because it creates editable PPTX files and runs on macOS, Linux, and Windows. Use a user-provided PPTX template if supplied. Use the local Presentations plugin or other PPTX tooling only when it is already available and clearly reduces work without violating the cross-platform policy.

Use tools already available in the environment first. Install only the minimum Python dependencies when the PPTX cannot otherwise be created and the environment policy permits it.

The PPTX should:
- use 16:9 widescreen layout by default,
- include the selected original figures,
- use Chinese titles, bullets, captions, and speaker notes,
- include source labels for figure slides,
- keep slide text concise and readable,
- use text boxes sized for their content, with conservative margins and no expected clipping,
- avoid text-only result slides when visuals are available,
- maintain consistent typography, spacing, titles, captions, and section transitions,
- avoid repetitive, rigid, card-heavy layouts that make the deck feel machine-generated.

Use compact, evidence-first page composition. Avoid making every result slide a rigid two-column template or any balanced 1:1 scaffold. Let slide geometry follow the figure rather than forcing the figure to fit a template.

When a slide has one dominant figure, let that figure own the page. Keep the annotation rail narrow and short, and move secondary explanation into speaker notes or a follow-up slide rather than expanding the slide horizontally into a symmetrical split.

### Text fitting implementation rules
When authoring with python-pptx or similar tooling:
- Treat automatic text shrinking (`fit_text` or equivalent) as a last resort, not the layout strategy. It can fail silently, behave differently across platforms, or make text too small.
- Prefer writing shorter text, increasing the text box, or splitting the slide.
- Use explicit line breaks for known long phrases, model names, and metric labels.
- Keep text box margins conservative; avoid tiny text boxes with long Chinese-English mixed strings.
- If using auto-fit, still verify the rendered or estimated text size and document the fallback.
- Never accept a slide where text is expected to overflow, be clipped, or require manual resizing by the user.

## Step 8. Self-review and corrective revision loop
After creating the first PPTX draft, run at least one explicit self-review pass before declaring the deck final. Treat this as a defect-finding step, not a confirmation step.

The loop is:
1. Inspect the generated PPTX and extracted assets.
2. Write a short defect list with severity (`high`, `medium`, `low`) and slide numbers.
3. Correct every high-severity issue and every medium-severity issue that can be fixed without expanding the task substantially.
4. Regenerate the PPTX after edits.
5. Re-run verification and update `output/qa_report.md` with what was checked, what was fixed, and what remains.

### Self-review checklist
Check content and structure:
- slide order follows the paper's argument, not merely the paper section order,
- each slide has one dominant claim,
- slide titles are conclusion-style where possible,
- no invented numbers, mechanisms, datasets, claims, or unsupported implications,
- result slides include source labels and do not remove original scientific labels,
- speaker notes exist when planned and are useful for oral explanation.

Check visual and layout quality:
- no cropped-off figure titles, axes, legends, panel labels, or important annotations,
- no source figure is squeezed so far that the evidence becomes unreadable,
- dense figures are split or cropped rather than placed as tiny full-figure screenshots,
- text boxes, figures, captions, source labels, and takeaway bands do not overlap,
- no text visually exceeds or is likely to exceed its text box; text overflow is a delivery-blocking defect,
- all shapes stay inside slide bounds,
- text density is reasonable; move excess explanation into speaker notes or split the slide,
- layout rhythm feels intentional rather than generated from one repeated card/rail template,
- no slide uses equal cards or metric chips merely to fill space,
- cards, metrics, and captions have consistent spacing and alignment,
- font choices are Office-safe; avoid relying on a font that is unavailable in the environment for text fitting.

### Severity rules
Use `high` for defects that can mislead the audience or make the deck look broken:
- clipped scientific evidence such as axes, legends, panel labels, table rows, figure titles, or method labels,
- unreadable main evidence on a key result slide,
- overlapping text/figures, text cut off by its box, or text extending beyond a visible boundary,
- wrong slide order or missing central evidence,
- fabricated or unsupported quantitative statements.

Use `medium` for defects that reduce professionalism or comprehension:
- overly dense slides,
- rigid AI-looking layouts, especially repeated equal cards, repeated right-side rails, or decorative metric rows,
- weak crop margins,
- figure captions detached from the visual,
- excessive repeated layouts,
- missing or unhelpful speaker notes,
- ambiguous source attribution.

Use `low` for cosmetic issues that do not affect comprehension:
- minor alignment imperfections,
- palette or typography refinements,
- optional split of a readable but dense figure.

### Programmatic checks when using python-pptx
When generating with python-pptx, perform a lightweight audit in code after the first draft and again after revision:
- reopen the PPTX with `Presentation(output_path)`,
- count slides and embedded media,
- count non-empty notes slides if notes were planned,
- check every shape's left/top/right/bottom stays within the slide canvas,
- flag text-heavy slides by character count and number of text boxes,
- flag any text box whose estimated text length is too large for its width/height, especially mixed Chinese-English strings,
- flag long unbroken tokens or labels that may overflow narrow boxes,
- count repeated layout patterns and flag decks that reuse the same composition too often,
- flag images whose displayed size is too small for their role,
- scan for placeholder text such as `lorem`, `xxxx`, or accidental unreplaced labels.

These checks cannot prove visual perfection, but they reliably catch many failures and should trigger a manual/self-review pass.

### Rendered preview policy
Render slide previews when a reliable headless renderer is readily available. If rendered previews are available, inspect them for:

- missing images,
- distorted or low-resolution figures,
- unreadable panels,
- text overflow,
- overlapping captions, bullets, and figures,
- excessive bullet density,
- wrong slide order,
- missing source labels,
- missing or unhelpful speaker notes.

If rendered preview reveals defects, revise and regenerate the PPTX. Do not deliver a deck with obvious visual defects merely because the package validates.

If no reliable renderer is available, still complete the self-review loop using:
- crop/contact-sheet inspection for selected assets,
- python-pptx structural checks,
- slide-by-slide text and shape inspection,
- a clear note in `output/qa_report.md` that rendered preview was unavailable.

## Step 9. Final verification
After revision, perform lightweight verification:
- reopen the PPTX with the generation library when possible,
- check slide count,
- check embedded media count,
- check speaker notes presence when notes were planned,
- check obvious shape bounds if tooling supports it,
- create a contact sheet from selected extracted assets when figures were cropped.

Do not stop at "PPTX opens" if the self-review found high-severity issues. Correct them first, then verify again. Document any remaining limitation in `output/qa_report.md`.

# Paper-Type Guidance

## Discovery / mechanism papers
Use a question-to-evidence arc:
1. phenomenon and importance,
2. unknown mechanism,
3. hypothesis or question,
4. experimental design,
5. evidence chain,
6. model,
7. limitations and next experiments.

## Methods, AI, tool, or algorithm papers
Use a problem-to-solution arc:
1. current bottleneck,
2. proposed method,
3. workflow or architecture,
4. evaluation design,
5. performance compared with baselines,
6. ablation, robustness, or failure cases,
7. reuse scenarios and limitations.

## Resource, dataset, atlas, omics, or benchmark papers
Use a workflow-to-validation arc:
1. why the resource is needed,
2. dataset/cohort/sample design,
3. generation and quality control workflow,
4. main landscape or map,
5. validation and reproducibility,
6. example biological or technical insights,
7. access, reuse, and boundaries.

## Clinical, population, or intervention studies
Use a design-to-inference arc:
1. clinical/public-health problem,
2. study question,
3. cohort/trial/design,
4. endpoints and variables,
5. primary result,
6. subgroup/sensitivity/secondary analyses,
7. bias, limitations, and practical implication.

## Materials, chemistry, physics, engineering papers
Use a property-to-mechanism or design-to-performance arc:
1. target property or technical challenge,
2. design principle,
3. synthesis/fabrication/setup,
4. characterization,
5. performance evidence,
6. mechanism or structure-property relationship,
7. scalability, stability, or application boundary.

## Reviews and perspectives
Use an evidence-map arc:
1. why the topic matters now,
2. conceptual framework,
3. theme 1,
4. theme 2,
5. theme 3,
6. controversy or unresolved problem,
7. author's synthesis,
8. future directions.

# Style Rules
Use a restrained Nature-style academic presentation design:
- clean white or very light background,
- dark readable text,
- one or two muted accent colors,
- compact but not crowded layouts,
- figure-first result slides,
- concise captions,
- no decorative stock images,
- no decorative gradients,
- no exaggerated marketing-style section pages.

Use Chinese suitable for oral academic reporting:
- avoid rigid translation,
- avoid long paragraphs,
- avoid jargon stacking,
- preserve technical terms where Chinese translation would reduce precision,
- prefer evidence-based interpretation over vague praise.

Borrow Nature-style figure-page composition principles, but keep this skill self-contained and independent from any other skill. Treat each slide like a publication figure page: one dominant idea, one clear evidence hierarchy, and asymmetry when the story needs it.

### Nature-style page composition
- Prefer one hero visual per slide when the evidence is complex or the claim is central.
- Use asymmetric layouts by default when the visual and the text are not equally important.
- Keep gutters real and tight. Use whitespace to separate roles, not to make a balanced grid.
- Use small panel labels (`a`, `b`, `c`) when a slide contains multiple visual subpanels.
- Use direct labels or a shared legend strip when categories repeat across panels.
- Reuse one restrained palette across the slide or slide family; reserve green/red for gains, drops, or directional change.
- If a slide has a schematic and data, let one dominate and the other validate.
- Use dark backgrounds only when the dominant visual is an image plate or the source content benefits from it; keep normal chart slides light.
- Avoid decorative boxes, fake cards, and symmetrical two-column scaffolds unless the content truly calls for them.
- If a figure would become unreadable when scaled down, crop it, split it, or move it to its own slide.

### Typography system
- Build a clear three-level hierarchy: title, body, caption/source. Do not let every text block look like the same font at slightly different sizes.
- Use one Chinese sans-serif family for most copy and one English/number companion font for metrics, abbreviations, model names, DOI, and small metadata.
- Prefer title sizes roughly in the 24-32 pt range, body copy in the 12-16 pt range, and source/caption text in the 7-9 pt range unless the template clearly calls for something else.
- Let titles carry more weight than bullets. Large metrics may stand out, but they must not overpower the slide title or the main figure.
- Keep captions and source labels lighter in color and smaller in size than the main argument text.
- Avoid mixing many font families on one slide. One Chinese family plus one English/numeric companion is the default maximum.

### Figure-text coordination
- Do not let figures look pasted onto the page. Pair them with a clear shared field: a tight frame, a caption edge, an interpretation rail, or a short takeaway strip.
- When a slide has one dominant figure, let the figure own about 55-75% of the slide area and keep the explanatory text to a narrow rail or short band.
- Keep captions attached to the figure edge or inside a bottom caption band. Avoid detached caption text floating far from the visual.
- Use 1-3 metric callouts or a short interpretation strip to help read the figure; do not surround the figure with many equal-weight boxes.
- If the source figure is very dense, prefer a cropped hero panel plus one or two callouts over shrinking the entire figure and compensating with long bullets.
- Use text to guide the reading order and interpretation of the figure, not to repeat every panel label in prose.

### Page fullness rule
- Slides should feel complete rather than empty. Most slides should have a stable top anchor, a dominant middle block, and a bottom anchor such as a takeaway strip, source strip, or conclusion line.
- Add fullness through evidence-supporting elements: metric chips, compact interpretation bands, short source strips, or a narrow comparison block.
- Avoid large unstructured blank areas caused by tiny figures, short bullets marooned in one corner, or captions that sit far from the visual.
- If a slide still feels sparse after placing the main claim and figure, add one concise support layer before adding more bullets.
- Do not fill space with decoration alone. Any added block should clarify hierarchy, guide reading order, or improve figure readability.

### Slide archetype recipes
- Hero figure result slide: 60-75% visual area, 20-30% interpretation rail, and a short takeaway band.
- Workflow slide: one full-width or near-full-width process visual plus a compact annotation strip, not two equal columns of text and diagram.
- Comparison slide: one chart or table block plus a slim metric or conclusion rail; split into two slides if the table becomes cramped.
- Text-led synthesis slide: 2-4 strong bullets or 3 compact claim cards, plus one summary sentence or discussion strip at the bottom.
- Cover slide: one dominant visual or typographic block, a small metadata band, and no dashboard-like grid of equally weighted mini-elements.

# Citation and Attribution Rules
Include source information:
- title slide: paper title, authors if useful, journal/preprint server, year, DOI if available,
- figure slides: small labels such as `Source: Fig. 2b, Nature, 2024`,
- adapted or redrawn content: label as `整理自` or `改绘自`,
- do not remove original figure labels or alter scientific data.

# Output Files
Generate a minimal but complete output package by default.

## 1. `output/final_presentation_cn.pptx`
The main deliverable: a complete Chinese PPTX deck with figures, captions, takeaways, source labels, and speaker notes.

## 2. `output/qa_report.md`
A short quality report:
- PPTX creation status,
- slide count,
- figures inserted,
- missing or placeholder figures,
- self-review defects found, grouped by severity,
- defects corrected during the revision pass,
- text overflow and text-fit checks performed,
- design-rhythm / anti-template review performed,
- verification method used after revision,
- known limitations,
- manual follow-up if needed.

## 3. `output/assets/figures/`
Extracted or cropped figure assets used in the deck.

## 4. `output/asset_manifest.md`
Figure asset traceability file, generated only when external figure/table assets are extracted:
- asset filename,
- original figure / panel,
- source page or source file,
- extraction method,
- slide placement,
- quality notes, including whether titles, axes, legends, and panel labels are preserved.

If no external figure/table assets are extracted, omit `asset_manifest.md` or write a one-line note in `qa_report.md` instead.

Create these optional files only when useful for review, debugging, or user-requested traceability:

## Optional: `output/ppt_outline_cn.md`
Chinese outline:
- paper information,
- paper type,
- central argument,
- slide structure,
- slide purpose.

## Optional: `output/figure_plan.md`
Figure selection plan:
- figure / panel,
- what it shows,
- why it matters,
- recommended slide,
- Chinese caption,
- interpretation.

## Optional: `output/ppt_script_cn_with_figures.md`
Slide-by-slide script:

```markdown
## Slide X. [中文标题]
- Purpose:
- Layout:
- On-slide bullets:
  - ...
  - ...
  - ...
- Figure/Table:
- Chinese caption:
- Core takeaway:
- Speaker note:
```

## Optional: `output/rendered/`
Rendered slide previews only when a reliable headless renderer is available or the user requests visual QA.

Skip the optional outline/script/figure-plan files by default unless they materially reduce back-and-forth, help verify a complex paper, or are explicitly requested.

# Quality Rules
- Build the `.pptx` whenever tooling is available.
- Do not stop at a markdown outline or script.
- Do not fabricate results, methods, numbers, or figure details.
- Do not add expensive processing steps unless they improve the deck or were requested.
- Do not overload slides with text.
- Do not deliver slides with text extending beyond visible boxes, clipped by boxes, or likely to overflow after font substitution.
- Do not make result slides text-only when figures are available.
- Make every slide serve the paper's argument.
- Ensure figures are readable at presentation scale.
- Ensure selected figure crops preserve all scientifically necessary context before placing them in slides.
- Ensure text, captions, and figures do not overlap.
- Ensure font hierarchy is consistent across slides and that figures, captions, and metrics feel visually related rather than independently placed.
- Ensure the visual rhythm does not feel like a repeated AI template; vary composition based on evidence role and figure geometry.
- Ensure the deck is not visually underfilled: empty regions should be intentional whitespace, not leftover template space from an undersized figure or text block.
- Run at least one self-review and corrective revision pass; do not deliver a first draft with known high-severity defects.
- Document uncertainty and missing source material clearly.

# Fallback Rules
If only partial content is available:
- still create a useful PPTX structure when possible,
- clearly mark uncertain slides or missing details,
- use placeholders only when a required figure is unavailable,
- do not invent exact values or claims,
- write `output/qa_report.md` explaining what could not be verified.

If PPTX tooling is unavailable:
- generate a concise markdown outline and figure plan,
- prepare figure assets if possible,
- explain why the PPTX could not be built in the current environment,
- keep the outputs structured enough for a downstream PPTX builder to run without re-reading the paper.
