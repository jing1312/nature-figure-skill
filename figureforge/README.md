# FigureForge — Visual SVG Figure Editor

A pure-frontend interactive SVG figure editor that lets you **visualize and select figure layout templates BEFORE AI generates the actual plot**.

## The Problem It Solves

With traditional AI figure generation (including the `nature-figure-skill` workflow), figure design — legend placement, color schemes, panel layout — is only described in text until the code is rendered. This forces expensive iterative re-drawing: "move the legend to the right", "use softer colors", "make panel A bigger".

**FigureForge** flips this: you pick a visual template skeleton first, then AI fills in the data. After generation, you can directly manipulate any element — drag, recolor, resize, retext — with instant WYSIWYG feedback.

## Features

### Pre-AI Template Gallery (16 templates)
- **10 chart types**: Bar, Line/Trend, Heatmap, Scatter/Bubble, Radar/Polar, Distribution (box), Forest Plot, Area/Stacked, Image Plate (microscopy), Network/Graph
- **6 layout patterns**: Hero Panel, Legend Panel, Asymmetric, Clinical Triptych, Dark Plate, Quantitative Grid 2×2

### Direct Manipulation (WYSIWYG)
- Click to select → blue highlight overlay
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
- **PNG / JPG / GIF / WebP**: drag onto canvas → embedded as movable image
- **Project JSON**: restores a previously saved FigureForge project
- (TIFF/PDF cannot be edited in-browser; export to those instead)

### Export
- Dialog (导出… button / Ctrl+E): **SVG · PNG · TIFF · PPTX · JSON**
- Resolution presets: 1× / 2× / 4× / **300 dpi / 600 dpi** (computed from
  the mm figure size for print-accurate pixels)
- PNG supports transparent background; **TIFF is a hand-written baseline
  encoder** with embedded dpi metadata (journal submission ready); PPTX
  builds a single-slide deck sized to the figure (loads pptxgenjs from CDN)

### Workspace Appearance
- Editor canvas background selectable: 深蓝黑 / 深灰 / 浅灰 / 白 / 墨绿 / 暗紫
  (persisted); figure background color + transparency controlled separately

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
- Embeds nature-figure-skill design knowledge as system prompt
- User description + selected template + palette → AI generates SVG
- Supports any OpenAI-compatible API endpoint (configurable via localStorage)
- Falls back to demo SVG when no API configured

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

```js
// In browser console:
AIGenerate.configure('https://api.openai.com/v1', 'your-key', 'gpt-4o');
```

Without an API key, the "✨ 生成" button loads a demo template so you can still explore the editor.

## Architecture

```
figureforge/
  index.html              — three-panel layout entry point
  css/style.css           — dark theme, responsive panels
  js/
    palettes.js           — 8 Nature color palettes
    templates.js          — 16 SVG skeleton templates (10 chart + 6 layout)
    canvas.js             — SVG direct manipulation engine
    properties.js         — context-sensitive property panel
    ai-generate.js        — AI generation with embedded design knowledge
    history.js            — undo/redo command stack
    export.js             — SVG/PNG/clipboard/project export
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
