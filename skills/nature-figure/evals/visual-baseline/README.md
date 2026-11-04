# Visual baseline

A rendered reference figure for the `nature-figure` skill, produced by the skill's own
helpers with the **default** publication settings.

| File | What it is |
| --- | --- |
| `baseline-journal.png` | 183 mm double-column, 4-panel composite, 300 dpi preview |
| `baseline-journal.svg` | Same figure as editable SVG (text stays as `<text>` nodes) |
| `render.py` | Regenerates both — and doubles as a check that `references/api.md` still runs |

## Why

The skill's rules were correct, but the **defaults were not**: `apply_publication_style()`
shipped with a 16 pt / 2.5 pt default, which is slide-deck size. On a 183 mm figure that
cropped axis labels, overlapped legends and collided heatmap ticks. A prose rule cannot
catch that — only a rendered baseline can.

## Regenerate

```bash
python render.py              # rewrite the baseline files
python render.py --check      # assert the invariants, store nothing
```

Requires `matplotlib` and `numpy`.

`render.py` executes every ```python block of `references/api.md` verbatim (blocks tagged
`no-run` are usage examples and skipped). If any helper stops running, the script fails
before drawing anything.

## Invariants asserted

- every api.md code block executes cleanly
- default type scale: `font.size <= 8` pt, `axes.linewidth <= 1.2` pt
- figure width equals 183 mm (Nature double column)
- the exported SVG still contains real `<text>` nodes (text stays editable)

## After changing defaults

Re-render and **look at the PNG**. The type scale, legend placement and label crowding
are the three things that regress silently — a passing `--check` only proves the numbers
are in range, not that the figure reads well.

When a change is intentional, overwrite the baseline and say so in the commit message.
