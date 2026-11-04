#!/usr/bin/env python3
"""Render the visual baseline for the nature-figure skill.

The baseline is produced by executing the code blocks in
`references/api.md` **verbatim** — so this script doubles as a check that the
documented helpers still run. It then draws a four-panel journal-width
composite with the skill's own helpers and stores the result next to itself.

Usage:
    python render.py                 # write baseline-<preset>.png / .svg here
    python render.py --out DIR       # write somewhere else
    python render.py --check         # render and assert the structural
                                     # invariants (type scale, editable text,
                                     # figure width) without storing anything

Requires: matplotlib, numpy
"""
import argparse
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
API_MD = os.path.join(SKILL_ROOT, "references", "api.md")

MM = 1 / 25.4
DOUBLE_COLUMN_MM = 183


def load_api_helpers():
    """Execute every python block of api.md in one namespace.

    Blocks that are prose fragments on purpose (the bare rcParams trio and the
    indented headless snippet) are skipped; everything else must run clean.
    """
    md = open(API_MD, encoding="utf-8").read()
    blocks = re.findall(r"```python([^\n]*)\n(.*?)```", md, re.S)
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np

    ns = {"plt": plt, "np": np, "mpl": matplotlib}
    ran, skipped = 0, []
    for i, (info, b) in enumerate(blocks):
        if "no-run" in info:
            skipped.append(i)
            continue
        try:
            exec(compile(b, f"<api.md block {i}>", "exec"), ns)
            ran += 1
        except Exception as e:  # noqa: BLE001
            print(f"  FAIL api.md block {i}: {type(e).__name__}: {e}")
            return None, None, None, skipped
    return ns, plt, np, skipped


def build(ns, plt, np):
    """Four-panel composite, 183 mm double column, skill helpers only."""
    rng = np.random.default_rng(7)
    cats = ["Ctrl", "Low", "Mid", "High", "Peak"]
    ctrl = rng.normal(100, 8, 5)
    treat = rng.normal(140, 12, 5)

    x = np.arange(0, 16)
    runs_ctrl = rng.normal(100, 6, (6, 16))
    runs_treat = rng.normal(78, 5, (6, 16))

    labels = ["Vehicle", "Low dose", "High dose"]
    est = np.array([0.12, 0.34, 0.51])
    lo = est - np.array([0.09, 0.11, 0.13])
    hi = est + np.array([0.09, 0.12, 0.14])

    mat = rng.normal(0, 1, (12, 10))

    fig = plt.figure(figsize=(DOUBLE_COLUMN_MM * MM, 120 * MM))
    gs = fig.add_gridspec(2, 2, hspace=0.6, wspace=0.42,
                          left=0.11, right=0.88, top=0.92, bottom=0.11)
    ax_a = fig.add_subplot(gs[0, 0])
    ax_b = fig.add_subplot(gs[0, 1])
    ax_c = fig.add_subplot(gs[1, 0])
    ax_d = fig.add_subplot(gs[1, 1])

    ns["make_grouped_bar"](ax_a, cats, [ctrl, treat], ["Vehicle", "Treatment"],
                           ylabel="Tumour volume (mm3)")
    ax_a.set_xlabel("Dose")

    ns["make_trend"](ax_b, x, [runs_ctrl, runs_treat], ["Vehicle", "Treatment"],
                     ylabel="Normalised mass", xlabel="Day", show_shadow=True)
    ns["add_stat_strip"](ax_b, "log-rank p = 0.003; n = 24 per arm")

    ns["make_forest_plot"](ax_c, labels, est, lo, hi, xlabel="Effect size (95% CI)")

    ns["make_heatmap"](ax_d, mat, x_labels=[f"G{i}" for i in range(10)],
                       y_labels=[f"S{i}" for i in range(12)], cbar_label="z-score")

    for ax, lab in zip([ax_a, ax_b, ax_c, ax_d], "abcd"):
        ns["add_panel_label"](ax, lab)

    return fig


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=HERE)
    ap.add_argument("--check", action="store_true", help="assert invariants only")
    args = ap.parse_args()

    ns, plt, np, skipped = load_api_helpers()
    if ns is None:
        print("FAILED: api.md code blocks did not execute")
        return 1
    print(f"api.md blocks executed cleanly ({len(skipped)} prose-only blocks skipped)")

    import matplotlib
    font_size = matplotlib.rcParams["font.size"]
    ns["apply_publication_style"]()
    font_size = matplotlib.rcParams["font.size"]
    lw = matplotlib.rcParams["axes.linewidth"]
    print(f"default type scale: font.size={font_size}, axes.linewidth={lw}")

    fig = build(ns, plt, np)
    width_mm = fig.get_size_inches()[0] * 25.4
    print(f"figure width: {width_mm:.1f} mm (target {DOUBLE_COLUMN_MM})")

    if args.check:
        import tempfile
        target = tempfile.mkdtemp(prefix="nature-figure-baseline-")
    else:
        target = args.out
    saved = ns["save_pub_set"](fig, out_dir=target, stem="baseline-journal",
                               formats=("svg", "png"), dpi=300, close=False)
    print("saved:", saved)

    svg = open(os.path.join(target, "baseline-journal.svg"), encoding="utf-8").read()
    n_text = len(re.findall(r"<text", svg))
    print(f"svg <text> nodes: {n_text} (text stays editable)")
    plt.close(fig)

    problems = []
    if font_size > 8:
        problems.append(f"default font.size={font_size} exceeds 8 pt journal maximum")
    if lw > 1.2:
        problems.append(f"default axes.linewidth={lw} exceeds 1.2 pt")
    if abs(width_mm - DOUBLE_COLUMN_MM) > 1:
        problems.append(f"figure width {width_mm:.1f} mm != {DOUBLE_COLUMN_MM} mm")
    if n_text < 40:
        problems.append(f"only {n_text} <text> nodes — text may have been converted to paths")

    if problems:
        for p in problems:
            print("  FAIL", p)
        return 1
    print("all baseline invariants hold")
    return 0


if __name__ == "__main__":
    sys.exit(main())
