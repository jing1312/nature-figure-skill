# Figure Selection Guide

Use this file when the user does not yet know which chart family fits the task.
Start from the scientific question, then route to one or two chart families.

## Quick routing

| What the user wants to show | Best first choice | Second choice | Avoid first |
|---|---|---|---|
| Compare groups on one metric | Grouped bar, dot plot | Box/violin, cloud-rain | Pie chart, radar |
| Show composition or proportions | Stacked bar | Nested pie | Dense radar |
| Show distribution or spread | Cloud-rain, violin, histogram | Marginal histogram | Pure mean bar |
| Show trend over time or gradient | Line plot | Multi-line trend panel | Radar |
| Show correlation or matrix structure | Heatmap | Network heatmap | Overloaded scatter |
| Show relationships or modules | Network heatmap | Chord diagram | Full all-edge graph |
| Show hierarchy or nesting | Sunburst, nested pie | Stacked composition | Flat pie for deep hierarchy |
| Show multi-metric benchmarking | Radar, ranking bubble | Small multiples bars | Too many radar spokes |
| Show 3-variable encoding | Bubble scatter | Annotated scatter | 4+ encodings in one axis |
| Show cyclical / directional layout | Rose plot, radial bar | Polar comparison | Length-based comparison on polar axes |

## Common trigger phrases

Use this router when the user says things like:

- "which chart should I use"
- "help me choose a figure type"
- "I need a publication figure but I do not know the chart"
- "compare groups"
- "show composition"
- "show distribution"
- "show trends over time"
- "show correlation / matrix / network"
- "show hierarchy or ranking"
- "bubble chart or radar?"

## Preferred defaults

- Use `heatmap` for many variables or a matrix.
- Use `line plot` for continuous x-axis trends.
- Use `grouped bar` or `dot plot` for clear group comparisons.
- Use `stacked bar` for composition when the parts matter.
- Use `cloud-rain` or `violin` when the raw distribution matters.

## Higher-complexity figures

Only use these when the story truly benefits from the format:

- `chord diagram`
- `sunburst`
- `radar`
- `radial bar`
- `network heatmap`

## Example recommendation format

When recommending chart families, keep the answer short and bounded:

```text
Recommended chart 1:
- Chart: stacked bar
- Why: directly shows composition differences across groups
- Use when: the parts sum to a meaningful whole

Recommended chart 2:
- Chart: dot plot or grouped bar
- Why: better if one component is the main claim

Not recommended:
- Chart: sunburst
- Why: no true hierarchy, so it adds visual complexity without evidence value
```

Recommend at most three chart families. For manuscript figures, prefer one reliable
chart plus one fallback over a long menu.

## Fallback rule

If two candidates are both plausible, choose the one that makes the scientific claim
easier to check at a glance, not the one that looks more elaborate.
