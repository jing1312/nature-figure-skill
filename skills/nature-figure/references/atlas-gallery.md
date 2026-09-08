# Atlas Gallery — 83-panel showcase system

This repository ships nine programmatically generated showcase atlases under `assets/`.
Each atlas is produced by a Node script in `figureforge/js/`. Use them as a visual
index when choosing a figure type, and reuse their geometry/palette conventions when
generating new panels.

## Generators and their panels

| Generator | SVG output | Panels |
|-----------|-----------|--------|
| `build-showcase.js` | `assets/showcase.svg` | 12 base: bar, hist, violin, box, trends±CI, ribbon, event, traces, point-range, slope + PCA/jointplot/heatmaps/ROC |
| `build-showcase-pro.js` | `assets/showcase-pro.svg` | 6: radar, polar bars, polar density, pathway quadrant, volcano, z-score heatmap |
| `build-showcase-bio.js` | `assets/showcase-bio.svg` | 12 single-cell flavored panels |
| `build-showcase-extra.js` | `assets/showcase-extra.svg` | 8: oncoprint, waterfall, alluvial, ridgeline, Bland-Altman, immune stream, forest, manhattan |
| `build-showcase-plus.js` | `assets/showcase-plus.svg` | 9: chord, upset, network, ternary, clustermap, treemap, sunburst, hexbin, parallel coords |
| `build-showcase-ultra.js` | `assets/showcase-ultra.svg` | 9: circos links, QQ, KM+risk table, raincloud, GO lollipop, venn, gantt, radial dendrogram, coverage tracks |
| `build-showcase-max.js` | `assets/showcase-max.svg` | 9: SPLOM, MA, pathway dot plot, circle packing, bump, 2D contour, dumbbell, diverging stacked, calendar heatmap |
| `build-showcase-nova.js` | `assets/showcase-nova.svg` | 9: sankey, correlogram, mosaic, biplot, pyramid, circular heatmap, dual-axis combo, pseudo-3D surface, ECDF+KS |
| `build-showcase-apex.js` | `assets/showcase-apex.svg` | 9: funnel, taylor, arc diagram, icicle, beeswarm, cycle plot, horizon, bullet, waffle |

Total: **83 panels**. Rebuild any of them with `node figureforge/js/<generator>.js`.

## Shared slot geometry (3-column pages)

```js
const W = 1080, COLW = 352, PW = 316, PH = 226;
const ROWY = r => 66 + r * 296;      // panel row baseline
const X0 = col => 24 + col * COLW;   // panel column origin
const H = 66 + rows * 296 + 6;
```

- **Never use 4 columns.** `COLW = 352` allows exactly 3 per 1080-wide page; a 4th
  column silently draws off-canvas and renders as black/empty cells.
- Long row labels (gantt tasks, KM risk table) require shifting the plot right by
  50–60 px and shrinking `w` accordingly.

## Shared palette tokens (jewel pastel)

```js
const C = {
  blue: '#6FA8CE', sky: '#9CC8E8', teal: '#6FBFB2', mint: '#86C6A8',
  sage: '#A9C08C', honey: '#F2C57C', apricot: '#F0A875', rose: '#E98CA6',
  lilac: '#B49CD9', plum: '#9B8AA6', indigo: '#7A89C8', coral: '#F08E7A',
  gray: '#AAB0B0', ink: '#333333', tick: '#4A4A4A'
};
```

Diverging ramps: teal `#5FA98B` (negative) ↔ rose `#D97A93` (positive), through a
near-white middle. Sequential ramps: square-root scaling of the value before mixing.

## QA rules learned the hard way (violations produce broken panels)

1. **Escape XML entities** in text: `Age < 65` → `Age &lt; 65`, `Protocol & IRB` →
   `Protocol &amp; IRB`. A single bare `<` or `&` silently kills every panel after it.
2. **Legends never overlap data.** Prefer direct labels; otherwise use a frameless
   strip *above* the plot area (see `plus` panel f, `ultra` panel i).
3. **Clamp data into inset/sub-plot frames** — zoomed points must be min/max clamped.
4. **Reserve gutters before drawing**: colorbars and dendrograms claim their width
   from the heatmap cell math, never draw over cells.
5. **`head()` letters and titles must use the same ROWY as their panel** — a stale
   ROWY prints two titles on top of each other.
6. **Draw order matters for folded/stacked bands**: horizon charts draw light band
   first, dark band last.
7. **Correlation matrices stored upper-triangular must be mirrored** (`R[j][i]`) when
   reading the lower triangle.
8. **Normalize x in manhattan-style plots** over the *total* chromosome length, not 1.
9. In JS, do not reference a `const` in a template string above its declaration (TDZ),
   and never reuse a destructured parameter name as a `reduce` accumulator.
