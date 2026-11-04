# API Reference — Nature Figure Making

Conventions, constants, and reusable code blocks. Implement in your script or adapt as needed.

---

## Preamble — paste this first

Every snippet below assumes these imports and the publication style are already in place.
The blocks in this file are **not** standalone: they reference `plt`, `np` and `mpl`.

```python
import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt

# Then paste the helper you need from this file and call it once, e.g.
#   apply_publication_style()   # 7 pt type, 0.8 pt axes — Nature double column
#
# Type scale is FINAL PRINT SIZE in points.
# Nature double column (183 mm wide): body text 5-7 pt, axis labels 6-7 pt, panel letters 7-8 pt.
# 16-24 pt is slide-deck size and will look oversized once the figure is scaled to 183 mm.
```

---

## Type scale rule

| Context | Final-size pt |
| --- | --- |
| Tick labels, axis titles | 5–7 |
| Panel letters (a, b, c) | 7–8 |
| Legend text | 6–7 |
| Inline stat strip | 6–7 |
| Slide / poster figure (not for print) | 12–16 |

Never hard-code 16 or 24 as a "publication" default. If a panel really needs larger type
(a full-page figure), scale the canvas with it — a 90 mm single-column panel at 7 pt is
still 7 pt in the final PDF.

---

## Constants

### PALETTE

```python
PALETTE = {
    "blue_main":      "#0F4D92",
    "blue_secondary": "#3775BA",
    "green_1": "#DDF3DE",
    "green_2": "#AADCA9",
    "green_3": "#8BCF8B",
    "red_1":   "#F6CFCB",
    "red_2":   "#E9A6A1",
    "red_strong": "#B64342",
    "neutral_light": "#CFCECE",
    "neutral_mid":   "#767676",
    "neutral_dark":  "#4D4D4D",
    "neutral_black": "#272727",
    "gold":   "#FFD700",
    "teal":   "#42949E",
    "violet": "#9A4D8E",
    "magenta":"#EA84DD",
}

DEFAULT_COLORS = [
    PALETTE["blue_main"],
    PALETTE["green_3"],
    PALETTE["red_strong"],
    PALETTE["teal"],
    PALETTE["violet"],
    PALETTE["neutral_light"],
]

PALETTE_NMI_PASTEL = {
    "baseline_dark": "#484878",
    "baseline_mid":  "#7884B4",
    "baseline_soft": "#B4C0E4",
    "ours_tiny":  "#E4E4F0",
    "ours_base":  "#E4CCD8",
    "ours_large": "#F0C0CC",
    "bg_lilac": "#E0E0F0",
    "bg_aqua":  "#E0F0F0",
    "bg_peach": "#F0E0D0",
    "neutral_light": "#D8D8D8",
    "neutral_mid":   "#A8A8A8",
    "neutral_dark":  "#606060",
    "delta_up":   "#2E9E44",
    "delta_down": "#E53935",
}

DEFAULT_COLORS_NMI_PASTEL = [
    PALETTE_NMI_PASTEL["baseline_dark"],
    PALETTE_NMI_PASTEL["baseline_mid"],
    PALETTE_NMI_PASTEL["baseline_soft"],
    PALETTE_NMI_PASTEL["ours_tiny"],
    PALETTE_NMI_PASTEL["ours_base"],
    PALETTE_NMI_PASTEL["ours_large"],
]

PALETTE_NATURE_IMAGING = {
    "bg": "#000000",
    "context": "#B8B8B8",
    "cyan": "#22D7E6",
    "magenta": "#FF2AD4",
    "white": "#FFFFFF",
}

PALETTE_NATURE_MATERIAL = {
    "aqua": "#77D7D1",
    "teal": "#33B5A5",
    "lilac": "#B9A7E8",
    "violet": "#7C6CCF",
    "callout_red": "#E53935",
    "neutral": "#D9D9D9",
}

PALETTE_NATURE_CLINICAL = {
    "baseline": "#272727",
    "week6": "#E28E2C",
    "week13": "#D24B40",
    "week26": "#5B8FD6",
    "year1": "#7BAA5B",
    "year2": "#C45AD6",
    "group_band": "#F2E6D9",
}

PALETTE_NATURE_GENOMICS = {
    "neutral_light": "#D8D8D8",
    "neutral_mid": "#8F8F8F",
    "wave1": "#D9544D",
    "wave2": "#5B7FCA",
    "wave3": "#B89BD9",
    "outline": "#4D4D4D",
}

PALETTE_PUBLICATION_SOFT = {
    "green": "#66C2A5",
    "orange": "#FC8D62",
    "blue_lavender": "#8DA0CB",
    "pink": "#E78AC3",
    "lime": "#A6D854",
    "yellow": "#FFD92F",
    "tan": "#E5C494",
    "grey": "#B3B3B3",
}

PALETTE_BLUE_ROSE = {
    "cyan": "#87D0E8",
    "pale_rose": "#FDF3F3",
    "rose": "#F9B7B7",
    "deep_red": "#9D2929",
    "soft_red": "#F7A8A8",
    "coral": "#F76B5A",
    "blue": "#1B86F7",
    "dusty_rose": "#F298A8",
}
```

Use `DEFAULT_COLORS` when color itself carries explicit semantic meaning (`hero`, `baseline`, `positive variant`).
Use `DEFAULT_COLORS_NMI_PASTEL` when several compared methods belong to one or two related families and the page
should feel visually unified.
Use `PALETTE_PUBLICATION_SOFT` for mixed categorical summary plots that need high readability without saturated primary colours.
Use `PALETTE_BLUE_ROSE` for two-family agreement/deviation figures where cool colours carry agreement and rose/red carries deviation or reference lines.

---

## MANDATORY font + SVG rules (always first, no exceptions)

These three lines are **non-negotiable** and must appear at the top of every script,
before any figure is created. They guarantee editable text in SVG output:

```python
import matplotlib as mpl
import matplotlib.pyplot as plt

plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans', 'Liberation Sans']
plt.rcParams['svg.fonttype'] = 'none'   # keeps text as <text> nodes, not paths
```

**Why `svg.fonttype = 'none'`**: matplotlib's default (`'path'`) converts every
glyph to a bezier path, making text unselectable, unsearchable, and impossible to
re-align in Illustrator / Inkscape. With `'none'`, text stays as SVG `<text>` elements
and font substitution happens at render time.

**Output format**: always save as `.svg` (primary). PNG/PDF are optional secondary
exports. Never use `.png` alone when the figure contains text that may need adjustment.

---

## apply_publication_style()

```python
def apply_publication_style(font_size=7, axes_linewidth=0.8, use_tex=False):
    """Apply Nature-style rcParams. Call once before creating any figures.

    Defaults target a 183 mm (double-column) final figure: 7 pt type, 0.8 pt axes.
    Pass a larger size only when the canvas itself is larger (slide, poster).
    """
    # ── MANDATORY: editable SVG text ──────────────────────────────────────────
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans', 'Liberation Sans']
    plt.rcParams['svg.fonttype'] = 'none'
    # ── Layout & style ────────────────────────────────────────────────────────
    plt.rcParams['font.size'] = font_size
    plt.rcParams['axes.spines.right'] = False
    plt.rcParams['axes.spines.top'] = False
    plt.rcParams['axes.linewidth'] = axes_linewidth
    plt.rcParams['legend.frameon'] = False
    if use_tex:
        plt.rcParams['text.usetex'] = True
```

**Presets** (all values are final print size in pt):
- Journal double column (183 mm) — **the default**: `apply_publication_style()` → 7 pt / 0.8
- Journal single column (89 mm): `apply_publication_style(font_size=6, axes_linewidth=0.6)`
- Dense multi-panel page: `apply_publication_style(font_size=5.5, axes_linewidth=0.6)`
- Slide / poster figure (canvas scaled up too): `apply_publication_style(font_size=12, axes_linewidth=1.2)`
- LaTeX labels: `apply_publication_style(use_tex=True)`

---

## is_dark(hex_color, threshold=128)

```python
def is_dark(hex_color, threshold=128):
    """Return True if hex color is dark (use white text on it)."""
    c = hex_color.lstrip('#')
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    return (0.299*r + 0.587*g + 0.114*b) < threshold
```

---

## add_panel_label(ax, label, ...)

```python
def add_panel_label(ax, label, x=-0.06, y=1.02, fontsize=None,
                    color='black', fontweight='bold'):
    """Place a Nature-style panel label near the top-left edge.

    fontsize=None follows the active type scale (rcParams['font.size'] * 1.15),
    so panel letters stay consistent with the rest of the figure.
    """
    if fontsize is None:
        fontsize = mpl.rcParams['font.size'] * 1.15
    ax.text(
        x, y, label,
        transform=ax.transAxes,
        fontsize=fontsize,
        fontweight=fontweight,
        color=color,
        ha='left',
        va='bottom',
    )
```

For dark image plates, move the label inside the panel and switch to white:
`add_panel_label(ax, 'a', x=0.01, y=0.98, color='white')`

---

## add_stat_strip(ax, text, ...)

Use this instead of putting `n`, Pearson/Spearman, confidence intervals, or model summaries in a boxed annotation over
data. It keeps the plotting area unobstructed while preserving source-data traceability inside the figure file.

```python
def add_stat_strip(ax, text, y=1.01, fontsize=6.8, color="#333333"):
    """Place a centred, frameless statistic strip just above the axes."""
    ax.text(
        0.5,
        y,
        text,
        transform=ax.transAxes,
        va="bottom",
        ha="center",
        fontsize=fontsize,
        color=color,
        clip_on=False,
    )
```

Use `ax.set_title(title, y=1.08, pad=0)` when a title and statistic strip share the same top margin.

---

## style_dark_image_ax(ax, ...)

```python
def style_dark_image_ax(ax, facecolor='black'):
    """Prepare an axes for microscopy / rendering plates."""
    ax.set_facecolor(facecolor)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)
    return ax
```

---

## make_grouped_bar(ax, categories, series, labels, ...)

```python
def make_grouped_bar(ax, categories, series, labels,
                     ylabel='Value', colors=None,
                     annotate=False, bar_width=0.8,
                     error_kw=None, legend=True, legend_outside=True):
    """
    Grouped bar chart.

    Parameters
    ----------
    ax         : matplotlib Axes
    categories : list[str]  — x-axis category names (length K)
    series     : list[array] — one array per group (each length K)
    labels     : list[str]  — legend label per group
    ylabel     : str
    colors     : list[str] | None  — defaults to DEFAULT_COLORS; override with
                                     DEFAULT_COLORS_NMI_PASTEL for unified-family figures
    annotate   : bool  — print value above each bar
    bar_width  : float — total width for all bars in one category
    error_kw   : dict  — passed to ax.bar as error_kw
    legend         : bool  — draw a legend at all
    legend_outside : bool  — place the legend outside the axes (default). Set False
                        only when the panel has genuinely empty space inside.

    Returns
    -------
    list[BarContainer]
    """
    import numpy as np
    if colors is None:
        colors = DEFAULT_COLORS
    if error_kw is None:
        lw = mpl.rcParams['axes.linewidth']
        error_kw = {'elinewidth': max(0.6, lw), 'capthick': max(0.6, lw), 'capsize': 2.5}
    n_groups = len(series)
    n_cats = len(categories)
    w = bar_width / n_groups
    x = np.arange(n_cats)
    containers = []
    for i, (vals, label, color) in enumerate(zip(series, labels, colors)):
        offset = (i - (n_groups - 1) / 2) * w
        bars = ax.bar(x + offset, vals, width=w, label=label,
                      color=color, edgecolor='none',
                      error_kw=error_kw)
        containers.append(bars)
        if annotate:
            for bar, val in zip(bars, vals):
                ax.text(bar.get_x() + bar.get_width() / 2,
                        bar.get_height() + 0.01,
                        f'{val:.2f}', ha='center', va='bottom',
                        fontsize=mpl.rcParams['font.size'] * 0.9)
    ax.set_xticks(x)
    ax.set_xticklabels(categories)
    ax.set_ylabel(ylabel)
    if legend:
        if legend_outside:
            ax.legend(loc='upper left', bbox_to_anchor=(1.02, 1.0), borderaxespad=0)
        else:
            ax.legend(loc='upper left', frameon=False)
    return containers
```

---

## make_trend(ax, x, y_series, labels, ...)

```python
def make_trend(ax, x, y_series, labels,
               colors=None, ylabel=None, xlabel=None,
               show_shadow=False, shadow_alpha=0.15,
               lw=1.6, marker='o', markersize=4,
               legend=True, legend_outside=True):
    """
    Multi-line trend plot.

    Parameters
    ----------
    x        : array-like   — shared x values
    y_series : list[array]  — one 1D array per line
    labels   : list[str]
    show_shadow : bool  — fill_between ± std if y_series contains 2D arrays (rows=runs)
    legend_outside : bool  — legend outside the axes by default, so it can never
                        cover the data (a hard rule of this skill).
    """
    import numpy as np
    if colors is None:
        colors = DEFAULT_COLORS
    for y, label, color in zip(y_series, labels, colors):
        y = np.asarray(y)
        if y.ndim == 2:
            mean, std = y.mean(0), y.std(0)
        else:
            mean, std = y, None
        ax.plot(x, mean, color=color, lw=lw, marker=marker,
                markersize=markersize, label=label)
        if show_shadow and std is not None:
            ax.fill_between(x, mean - std, mean + std,
                            color=color, alpha=shadow_alpha)
    if ylabel:
        ax.set_ylabel(ylabel)
    if xlabel:
        ax.set_xlabel(xlabel)
    if legend:
        if legend_outside:
            ax.legend(loc='upper left', bbox_to_anchor=(1.02, 1.0), borderaxespad=0)
        else:
            ax.legend(loc='upper left', frameon=False)
```

---

## make_forest_plot(ax, labels, estimates, ci_low, ci_high, ...)

```python
def make_forest_plot(ax, labels, estimates, ci_low, ci_high,
                     colors=None, ref=0.0, xlabel=None, xlim=None,
                     marker='o', markersize=5, lw=1.5):
    """
    Minimal forest plot helper for Nature-style clinical/statistical panels.
    """
    import numpy as np
    y = np.arange(len(labels))[::-1]
    if colors is None:
        colors = ['#B64342'] * len(labels)
    for yi, est, lo, hi, color in zip(y, estimates, ci_low, ci_high, colors):
        ax.plot([lo, hi], [yi, yi], color=color, lw=lw)
        ax.plot(est, yi, marker=marker, ms=markersize, color=color)
    ax.axvline(ref, color='#767676', linestyle='--', linewidth=1.2, alpha=0.8)
    ax.set_yticks(y)
    ax.set_yticklabels(labels)
    if xlabel:
        ax.set_xlabel(xlabel)
    if xlim is not None:
        ax.set_xlim(xlim)
    ax.spines['right'].set_visible(False)
    ax.spines['top'].set_visible(False)
```

Use pale `ax.axhspan(...)` bands behind contiguous label groups when you need the
clinical-triptych look from `Nature`.

---

## make_heatmap(ax, matrix, ...)

```python
def make_heatmap(ax, matrix, x_labels=None, y_labels=None,
                 cmap='magma', cbar_label=None, annotate=False,
                 fmt='{:.2f}', fontsize=12):
    """
    2D heatmap with optional colorbar and cell annotations.
    """
    import numpy as np
    import matplotlib as mpl
    im = ax.imshow(matrix, cmap=cmap, aspect='auto')
    if cbar_label:
        cbar = ax.figure.colorbar(im, ax=ax)
        cbar.set_label(cbar_label)
    if x_labels:
        ax.set_xticks(range(len(x_labels)))
        ax.set_xticklabels(x_labels, rotation=30, ha='right')
    if y_labels:
        ax.set_yticks(range(len(y_labels)))
        ax.set_yticklabels(y_labels)
    if annotate:
        norm = mpl.colors.Normalize(vmin=matrix.min(), vmax=matrix.max())
        cm_obj = plt.get_cmap(cmap)
        for (i, j), val in np.ndenumerate(matrix):
            r, g, b, _ = cm_obj(norm(val))
            lum = 0.299*r + 0.587*g + 0.114*b
            color = 'white' if lum < 0.5 else 'black'
            ax.text(j, i, fmt.format(val), ha='center', va='center',
                    fontsize=fontsize, color=color)
    ax.set_frame_on(False)
```

---

## save_pub_set(fig, out_dir, stem, ...) — the canonical export

This is the **single canonical export helper** of the skill. It writes the full
submission bundle for one figure: editable SVG (primary), TrueType-embedded PDF, and a
600 dpi TIFF. Use it everywhere; `save_pub_figure` below is the single-file variant.

```python
def save_pub_set(fig, out_dir, stem, formats=('svg', 'pdf', 'tiff'), dpi=600,
                 bbox_inches='tight', close=True):
    """
    Export one figure as a submission-grade file set.

    Parameters
    ----------
    fig      : matplotlib Figure
    out_dir : str | Path — target directory (created if missing)
    stem    : str          — file stem, e.g. 'figure-01'
    formats : tuple        — subset of ('svg', 'pdf', 'tiff', 'png')
    dpi     : int          — raster dpi (600 for line art and dense panels)
    bbox_inches : str|None — 'tight' keeps the frameless stat strip and panel
                             labels; use None only if you manage margins yourself.

    Returns
    -------
    list[str] — saved file paths, in order
    """
    import os
    from pathlib import Path
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    saved = []
    for fmt in formats:
        p = str(out / f'{stem}.{fmt}')
        kw = {}
        if fmt in ('svg', 'pdf', 'tiff', 'png') and bbox_inches:
            kw['bbox_inches'] = bbox_inches
        fig.savefig(p, dpi=dpi, **kw)
        saved.append(p)
    if close:
        plt.close(fig)
    return saved
```

Example:

```python no-run
save_pub_set(fig, out_dir='figures', stem='figure-01')      # svg + pdf + tiff
save_pub_set(fig, out_dir='figures', stem='figure-02', formats=('svg', 'pdf'))
```

---

## save_pub_figure(fig, out_path, ...)

Single-file export with an explicit extension. `finalize_figure` is kept as an alias
for older scripts.

```python
def save_pub_figure(fig, out_path, formats=None, dpi=600,
                     pad=2, bbox_inches='tight', close=True):
    """
    Apply tight_layout and save one figure.

    Parameters
    ----------
    out_path : str   — path without extension, or with extension
    formats  : list  — e.g. ['png', 'pdf']. If None, uses extension of out_path.
    dpi      : int   — 600 for line art, 300 is enough for photographic panels
    pad      : float — tight_layout pad (2 default, 1 for compact multi-panel)
    bbox_inches : str|None — 'tight' preserves the stat strip and panel labels
    """
    import os
    from pathlib import Path
    fig.tight_layout(pad=pad)
    base = Path(out_path)
    os.makedirs(base.parent, exist_ok=True)
    if formats is None:
        formats = [base.suffix.lstrip('.') or 'png']
        base = base.with_suffix('')
    saved = []
    for fmt in formats:
        p = str(base) + f'.{fmt}'
        kw = {}
        if bbox_inches is not None:
            kw['bbox_inches'] = bbox_inches
        fig.savefig(p, dpi=dpi, **kw)
        saved.append(p)
    if close:
        plt.close(fig)
    return saved


finalize_figure = save_pub_figure   # backward-compatible alias
```

---

## Headless / server rendering

```python
import matplotlib
matplotlib.use('Agg')          # no display needed; must come before pyplot
import matplotlib.pyplot as plt
```

## Validation Rules

- `make_grouped_bar`: `len(categories)` must equal length of each array in `series`.
- `make_trend`: each array in `y_series` must have same length as `x`.
- `make_heatmap`: `matrix` must be 2D; `x_labels` length = `matrix.shape[1]`; `y_labels` length = `matrix.shape[0]`.
- `save_pub_set`: supported formats — `svg`, `pdf`, `tiff`, `png`.

---

## Conventions

- Save outputs under `./figures/` (or path given by user); `save_pub_set` and `save_pub_figure` create parent dirs.
- In headless / batch runs, set non-interactive backend before importing pyplot:

```python
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
```

- Always `plt.close(fig)` after saving to free memory (`save_pub_set` does it for you).
- For multi-panel figures, prefer one baseline family plus one hero family; reserve green/red for delta cues.
- When color roles, resolution, or layout are underspecified and would change the figure, confirm with user before finalizing.
