# FigureForge — Visual SVG Figure Editor

A pure-frontend interactive SVG figure editor that lets you **visualize and select figure layout templates BEFORE AI generates the actual plot**.

## The Problem It Solves

With traditional AI figure generation (including the `nature-figure-skill` workflow), figure design — legend placement, color schemes, panel layout — is only described in text until the code is rendered. This forces expensive iterative re-drawing: "move the legend to the right", "use softer colors", "make panel A bigger".

**FigureForge** flips this: you pick a visual template skeleton first, then AI fills in the data. After generation, you can directly manipulate any element — drag, recolor, resize, retext — with instant WYSIWYG feedback.

## Features

### Control-Panel Design Language
The control panels follow the polished tool aesthetic of
[currve-arrow.yysuni.com](https://currve-arrow.yysuni.com/):
- **Filled sliders** — the track fills with the accent colour up to the
  thumb, white thumb with layered soft shadows, hover/active rings, and a
  **precise number input** (tabular-nums) beside every slider
- **Teal accent + hairline sections** — panels separated by hairlines with
  tiny uppercase letter-spaced section labels, no heavy card boxes
- **Gradient panels** — white → slate → pale-teal diagonal panel background
  (dark theme: deep-slate equivalent) with an inner highlight edge
- Checked-state tinting for segmented buttons and checkbox chips via CSS
  `:has()`, gradient primary buttons with coloured shadows

### Colour Cards (curated palettes)
Default template colours follow Tableau's rich harmonious family
(#4E79A7 steel blue + grey controls + one accent). The 🌍 色板 dropdown ships
**14 curated colour cards**, one click recolors the whole figure coherently:
- **Tableau 10** — the classic rich professional set
- **Tol Muted** — Paul Tol's elegant colour-blind-safe scheme
- **Seaborn Deep** — vivid yet balanced matplotlib classic
- **Morandi 莫兰迪** — dusty, understated, high-class feel
- **Economist Style** — confident blues with a red accent
- **Macaron 马卡龙** — airy pastels for soft stories
- Plus the originals: Classic Nature, Publication Soft, NMI Pastel,
  Blue Rose, Nature Clinical / Material / Genomics / Imaging
- Recoloring respects `data-series`: bar-chart groups stay single-hue with
  the highlight on slot 1, box plots stay one colour, markers follow their
  line, schematic outlines follow the card while the boxes stay neutral

### Day / Night Themes with Sunrise-Sunset Transition
- Toolbar **☀️ / 🌙** toggle flips the whole editor between a refined dark
  slate theme and a paper-white daylight theme
- The flip plays a full-screen **sunrise/sunset animation** (ported from
  [88lin/HeoLume `5d4a5be`](https://github.com/88lin/HeoLume/commit/5d4a5bea410bf5edd5597f34dcc696620dd0be13)):
  sky fades in, day/night gradients crossfade while the sun and moon sweep
  along an arc and swap at its midpoint, stars twinkle, a meteor streaks on
  the way into night — the theme itself flips while the sky covers the page
- Honors `prefers-reduced-motion` (instant flip, no sky)
- Theme choice and workspace background persist in localStorage

### Workspace Backgrounds (13 options)
- **跟随主题 (auto)** — canvas follows the active theme (曜石黑 in dark,
  云雾灰 in light)
- Dark group: 曜石黑 / 深蓝黑 / 石墨灰 / 墨绿 / 暗紫 / 酒红 / 深海蓝
- Light group: 云雾灰 / 蓝灰 / 象牙白 / 暖沙 / 浅青 / 纯白
- An explicit color keeps working in both themes

### Publication-Grade Templates (v3 tuning)
All 16 built-in templates follow the Nature visual language — NPG-family
muted palette, grey controls, single accent, hairline rules:
- **NPG-family series colours** (#3C5488 ink blue, #00A087 teal, #E64B35
  vermillion, #8491B4 grey-blue) with **neutral grey #C4C9D4 controls** and
  one accent for the condition the figure argues about — never rainbow groups
- **Declarative sentence-case titles**: "Figure 1 | Treatment raises response
  in a dose-dependent manner", plus italic methods notes
  ("mean ± s.d., n = 6", "two-sided Pearson test")
- Correct axis orientation (0 at the bottom), outward ticks, light horizontal
  gridlines behind the data, left+bottom spines only (0.9)
- **Error bars with caps** and a **significance bracket** (ns / \* / \*\*) on
  the bar charts
- **95% CI band** on the trend line, **regression line + italic R²** on the
  scatter, **direct end labels** on the multi-line chart (KO as grey dashed)
- **Single-hue donut** (#3C5488 → #D6DEEB ramp) with "n = …" in the hole and
  a frameless legend
- **Box plots in one muted hue** with jittered raw points overlaid
  (grey, 45% opacity), whisker caps, dark medians
- **Heatmap** with sequential ink-blue colormap, white cell borders and a
  labeled **colorbar legend** (0 / 0.5 / 1 ticks)
- **Forest plot** with dashed OR=1 reference line, weight-sized squares, CI
  whiskers, **vermillion pooled diamond** and a numeric "[lo, hi]" column
- **Layout skeletons are filled with mini charts** (bars / line / scatter /
  box / heatmap insets) instead of empty boxes — bold lowercase a/b/c/d panel
  labels, caption block included; the schematic uses thin-outline boxes on
  near-white fills with only the pivotal step tinted
- Every series carries `data-role` + `data-series`, so switching the global
  palette recolors the whole figure coherently (markers follow their line)

### Linked Series Editing
Every data mark carries a data-series id, and the whole figure respects it:
- **Recolour once, update everywhere** — change the fill/stroke of any
  element (a legend swatch, one bar, a line…) and every sibling of the same
  series syncs instantly; the property panel shows a 🔗 hint with the number
  of linked places, and a single undo reverts the whole group
- **Delete a data element → its legend swatch goes with it** (undo brings
  both back)
- Switching a colour card recolors series coherently by the same ids

### Direct Manipulation (WYSIWYG)
- Click to select → blue highlight overlay
- **Resize handles**: select a rectangle / circle / ellipse / image and drag
  any of the four corner handles (images keep their aspect ratio, circles
  stay round); undo-able
- Drag to move elements with **smart alignment guides** (BioRender / Figma style):
  edges & centers snap to other elements and to the canvas frame, magenta
  guide lines appear on alignment, hold <kbd>Alt</kbd> to bypass snapping
- Grid snapping as fallback (5-unit step), toggle via the ⇄ toolbar button
- **Multi-select**: Shift+click or rubber-band marquee on empty canvas;
  multi-drag keeps relative spacing, batch fill/stroke/order from the panel
- **Group / ungroup**: Ctrl+G / Ctrl+Shift+G (also in context menu)
- Double-click to edit text inline; toolbar `T` inserts a new text box
- Arrow keys nudge (Shift+arrow = 10 units); wheel zooms
- Right-click context menu: duplicate, bring to front, send to back, delete
- Zoom (wheel / Ctrl±), fit-to-view

### Session Persistence
- 💾 button or Ctrl+S saves to browser localStorage; **reopen the page and
  continue where you left off** (auto-restores with a toast)
- Every edit auto-saves (debounced) — closing the tab never loses work

### Template Library Management
- Section renamed to 「图表」 with **New blank figure**, **Import SVG**,
  **New folder** actions
- Rename any template (double-click or right-click), organize into folders,
  move between folders, delete (right-click menu)
- Imported/user templates persist in localStorage
- Left panel collapsible via the « button

### Import
- **SVG files**: drag onto the canvas (or 📥 导入) — fully editable vectors,
  optionally added to the template library
- **PNG / JPG / WebP / GIF**: drag onto canvas (or 📥 导入 / Ctrl+V paste a
  screenshot) → inserted as a movable, resizable `<image>` — **plus real
  bitmap editing** (see below)
- **TIFF**: decoded in the browser via UTIF (loaded from CDN on demand) and
  inserted like any raster image — no ImageMagick needed
- **Project JSON**: restores a previously saved FigureForge project

### Bitmap Image Editing (no vector source required)
Imported photos, scanned figures and paper screenshots stay editable:
- **✂ Crop** — interactive crop overlay (8 handles + drag, dimmed outside
  area), re-encodes at native resolution; double-click an image to start
- **Rotate 90° cw/ccw and flip H/V** — pixel-accurate re-encode, the figure
  keeps its centre and swaps dimensions
- **Tone adjustments** — brightness / contrast / saturation sliders plus
  grayscale and invert toggles, stored as an SVG filter so exports keep them
- **Replace image** — swap the bitmap while keeping position and size
- Paste directly from the clipboard (Ctrl+V) — screenshots land on the canvas

### Export
- Dialog (导出… button / Ctrl+E): **SVG · PNG · TIFF · PPTX · JSON**
- Resolution presets: 1× / 2× / 4× / **300 dpi / 600 dpi** (computed from
  the mm figure size for print-accurate pixels)
- PNG supports transparent background; **TIFF is a hand-written baseline
  encoder** with embedded dpi metadata (journal submission ready); PPTX
  builds a single-slide deck sized to the figure (loads pptxgenjs from CDN)

### Workspace Appearance
- Editor canvas background selectable: **跟随主题 (auto)** + 13 fixed colors
  (深蓝黑 / 石墨灰 / 墨绿 / 暗紫 / 酒红 / 深海蓝 / 云雾灰 / 蓝灰 / 象牙白 /
  暖沙 / 浅青 / 纯白, persisted); figure background color + transparency
  controlled separately

### Context-Sensitive Property Panel
- **Text**: font family, size, weight, fill color, text anchor, position
- **Rect**: position, size, corner radius, fill, stroke, opacity
- **Circle**: center, radius, fill, stroke, opacity
- **Line**: endpoints, stroke color, width, dash pattern
- **Path/Polyline**: fill, stroke, width, opacity
- All changes apply in real-time and push to undo stack

### Color Palettes (from nature-figure-skill)
8 publication-grade palettes extracted from the skill's `api.md`:
- Classic Nature, NMI Pastel, Nature Imaging, Nature Material
- Nature Clinical, Nature Genomics, Publication Soft, Blue Rose

### AI Generation
- Embeds nature-figure-skill design knowledge as system prompt — the prompt
  encodes the same publication rules the templates follow (axis orientation,
  gridlines, error bars, significance brackets, frameless legends, donut
  composition, heatmap colorbar, data-role/data-series editability contract)
- User description + selected template + palette → AI generates SVG
- **⚙ settings dialog** (toolbar) for any OpenAI-compatible endpoint —
  API base / key / model, stored in localStorage
- Without an API key the ✨ 生成 button says so explicitly and loads the
  built-in publication-grade demo figure instead of failing silently

### Export
- Download SVG (stripped of editor-only attributes)
- Download PNG (2× resolution)
- Copy SVG to clipboard
- Save/Load project as JSON

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Shift+Z / Ctrl+Y | Redo |
| Delete | Delete selected |
| Ctrl+D | Duplicate |
| Escape | Deselect |
| Ctrl+S | Export SVG |
| Ctrl+Shift+C | Copy SVG |
| Ctrl± | Zoom in/out |
| Ctrl+0 | Fit to view |

## Usage

Open `index.html` in any modern browser. No build step, no dependencies, no backend.

```bash
# Serve locally
python3 -m http.server 8000
# Open http://localhost:8000
```

### Configuring AI API (optional)

Click the toolbar **⚙** button, or in the browser console:

```js
AIGenerate.configure('https://api.openai.com/v1', 'your-key', 'gpt-4o');
```

Without an API key, the "✨ 生成" button shows a warning and loads the built-in
publication-grade demo figure so you can still explore the editor.

## Architecture

```
figureforge/
  index.html              — three-panel layout entry point
  css/style.css           — dual theme (dark + light), day/night sky CSS
  js/
    palettes.js           — 8 Nature color palettes
    templates.js          — 16 publication-grade SVG templates (10 chart + 6 layout)
    canvas.js             — SVG direct manipulation engine
    properties.js         — context-sensitive property panel
    ai-generate.js        — AI generation with embedded design knowledge
    history.js            — undo/redo command stack
    export.js             — SVG/PNG/clipboard/project export
    daynight.js           — sunrise/sunset theme transition (from HeoLume)
    app.js                — main orchestrator, event wiring, shortcuts
```

## Design Principles (from nature-figure-skill)

- **Font**: Arial sans-serif, 7–9pt for dense journal figures
- **Spines**: only left + bottom (no top/right)
- **Legend**: frameless, prefer direct labels
- **Background**: white (black only for microscopy)
- **Colors**: one restrained palette per figure
- **SVG text stays editable** — never converted to paths

## License

Same as parent repository.
