<p align="center"><b>简体中文</b> | <a href="README.md">English</a></p>

# nature-figure skill（中文版）

> 英文版为正本：[README.md](README.md)。本文件是给中文使用者看的精简版，内容以英文版为准。

Nature 级 / 高影响力期刊的投稿级配图工作流，Python 与 R 双轨。

技能从一份**图表契约**开始：核心结论、证据链、图形原型、后端选择、期刊与导出约束、统计与源数据可追溯性。
绘图模板只在科学逻辑清楚之后才登场。

Python 通过 `matplotlib`、`seaborn`、`subplot_mosaic`、`statsmodels` 落地；R 通过 `ggplot2`、`patchwork`、
`ComplexHeatmap`、`ggrepel`、`svglite`、`cairo_pdf`、`ragg` 落地。

---

## 两条路线：FigureForge 还是脚本管线

| 用户想要 | 走哪条路 |
| --- | --- |
| 拖拽模板、快速看排版、不写代码、「数据我自己填」 | **FigureForge** —— 浏览器编辑器（[`figureforge/`](../../figureforge/)）：22 个出版级模板、16 组精选色卡、9 套图鉴 / 83 面板、画布自由排布、一句话 AI 生成、SVG / PNG / TIFF / PDF / PPTX 导出。在线版：[jing1312.github.io/nature-figure-skill/figureforge/](https://jing1312.github.io/nature-figure-skill/figureforge/) |
| 脚本、批量循环、可复现的「数据→图」管线、期刊规格导出 | **本技能** —— Python 或 R，契约先行 |

Agent 会先做路线分流。**免代码请求不会触发「Python 还是 R？」这道门槛**——那是脚本路线专属的。
FigureForge 负责版式设计与最后微调；批量重跑、参数扫描、可复现导出仍然需要脚本路线。

### FigureForge → Python 交接

两条路线不是二选一，可以接力：

1. **在 FigureForge 里定骨架** —— 选版式、拖面板、决定主图，导出 SVG。
2. **把几何搬进代码** —— `references/atlas-gallery.md` 记录了每个图鉴面板的槽位坐标、jewel-pastel 调色板与 QA 规则，同样的数字直接写进 `subplot_mosaic` / `patchwork` 版式。
3. **填真实数据、导出整套文件** —— 用选定后端渲染，`save_pub_set()` / `save_pub_r()` 一次产出 SVG + PDF + TIFF，整套共享字体、颜色语义与统计格式。

---

## 后端与契约规则

除非用户已经指定后端，否则先问一句 **Python 还是 R？**；用户明确要你推荐时才用 `references/backend-selection.md`。

后端一旦选定就独占使用：绘图、预览、导出、视觉 QA 全部用同一个后端。
选定后端缺运行时或缺包时，**停下来报告阻塞点**，不要用另一种语言渲染替代预览（两个方向都不行）。

绘图前先写清或推断：核心结论、图形原型（`quantitative grid` / `schematic-led composite` / `image plate + quant` / `asymmetric mixed-modality figure`）、面板图谱、证据层级、目标输出、统计与源数据需求、导出打包。
**图要服务于科学逻辑**，美观和模板匹配是次要的。

三张图就是三张图：不要静默拼成一张。整套共享字体、轴措辞、颜色语义与统计精度。
图例、统计框、样本量标注一律不要压在高密度数据区上；优先用外置无框图例、直接标注，或紧贴绘图区上方的无框统计条。

用户给的配色是「调色方向」，不是按序套用：高显著性色给主结论，灰/浅色留给 `Other` 与背景类；
当颜色在小尺寸或灰度印刷下会失效时，用点形或 hatch 补一道区分。

用户提供的私有模板库只能作为内部适配来源，**不得在用户可见输出里暴露路径、文件名与来源**。

---

## 文件结构

```
nature-figure/
├── SKILL.md                     ← 触发条件与总纲（Agent 自动加载）
├── README.md                    ← 英文正本
├── README.zh-CN.md              ← 本文件
├── agents/openai.yaml           ← OpenAI/Codex 接入：显示名与默认提示词
├── evals/
│   ├── evals.json               ← 行为评测用例（分流、契约、导出、QA）
│   └── visual-baseline/         ← 渲染基准图 + render.py（说明见该目录 README）
├── assets/
│   ├── gallery/                 ← 成图预览 PNG
│   ├── chart-atlas/             ← 图型分类预览 PNG
│   └── figures4papers/          ← 上游 demo 脚本与预览资源
└── references/                  ← 15 份按需加载的参考文档
```

## 参考文件速查

| 文件 | 什么时候打开 |
| --- | --- |
| `figure-selection.md` | 不知道该画什么图型时 |
| `figure-contract.md` | 需要把需求转成核心结论、证据链、面板图谱、审稿风险 |
| `atlas-gallery.md` | 要从 83 个现成面板里挑，或复用其几何 / 配色 / QA 规则 |
| `backend-selection.md` | 用户让你推荐 Python 还是 R |
| `r-workflow.md` / `r-template-index.md` | 用户选 R，或给了 R 脚本 / 模板 / 数据 |
| `qa-contract.md` | 投稿前自检、返修包、显微 / blot 图、期刊专项审计 |
| `design-theory.md` / `api.md` | 字号、配色理论、版式理由、调色板常量与 helper 签名 |
| `common-patterns.md` | 主图 + 附属面板、纯图例轴、暗色图版、非对称版式 |
| `nature-2026-observations.md` | 对照真实 Nature 正刊版式（示意图主导复合图、暗色图版、临床三联图、非对称主图） |
| `tutorials.md` / `chart-types.md` / `demos.md` | 端到端范例、雷达 / 3D / 置信带等具体图型、上游 demo 脚本 |

---

## Python 必守规则

1. **三个 rcParams 必设** —— `svg.fonttype='none'`（SVG 文字可编辑）、`pdf.fonttype=42`（PDF 嵌入 TrueType）、`font.size=7`（只有大幅面 slide 图才用 15–24）。
2. **主产物是 SVG** —— 同时给出 PDF 与 600 dpi TIFF 作为投稿伴生文件。
3. **关图** —— 每个 figure 用完 `plt.close(fig)`，避免内存堆积。

```python
import matplotlib as mpl
import matplotlib.pyplot as plt

mpl.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans", "sans-serif"],
    "svg.fonttype": "none",
    "pdf.fonttype": 42,
    "font.size": 7,
    "axes.spines.right": False,
    "axes.spines.top": False,
    "axes.linewidth": 0.8,
    "legend.frameon": False,
})

def save_pub_py(fig, filename, dpi=600):
    fig.savefig(f"{filename}.svg",  bbox_inches="tight")
    fig.savefig(f"{filename}.pdf",  bbox_inches="tight")
    fig.savefig(f"{filename}.tiff", dpi=dpi, bbox_inches="tight")
    plt.close(fig)
```

> `save_pub_py` 是单文件便捷版；**正本是 `references/api.md` 里的 `save_pub_set(fig, out_dir, stem)`**
> ——一次导出 SVG + PDF + TIFF 三件套。整套图请统一用正本，避免各图 dpi 与格式漂移。

R 侧的 `save_pub_r()` 模板见 `references/r-workflow.md`。

---

## 什么时候加载 / 什么时候别加载

**加载**：Python 或 R 论文配图；Nature / Science / Cell / NeurIPS / ICLR 类投稿；分组柱状图、趋势线、热图、雷达图、多面板网格；SVG / PDF / 高 DPI 导出；「这组数据该画什么图」；「Nature 风格」「publication figure」「SCI figure」「figures4papers」「高质量科研绘图」；要改图的逻辑、美观、面板版式、图注或投稿就绪度。

**别加载**：Plotly / Altair / Bokeh 等交互式前端绘图；没有投稿目标的纯探索分析；3D / GIS / 非科学插画为主；Illustrator / Figma 优先的版式。

---

## 许可与来源

`nature-figure` 技能内容衍生自 [Yuan1z0825/nature-skills](https://github.com/Yuan1z0825/nature-skills)（MIT），原始 figures4papers demo 脚本与预览资源随包附带；本仓库的扩展与 `FigureForge` 编辑器为原创，详见仓库根目录的 [`LICENSE`](../../LICENSE) 与 [`DERIVATIVE_NOTICE.md`](../../DERIVATIVE_NOTICE.md)。
