<div align="center">
  <img src="assets/nature-figure-cover.svg" alt="nature-figure-skill：让每一张论文配图，都经得起审稿人追问" width="100%" />
</div>

<div align="center">

# 🎨 nature-figure-skill

### 让每一张论文配图，都经得起审稿人追问。

基于 [`Yuan1z0825/nature-skills`](https://github.com/Yuan1z0825/nature-skills) 快照的开源衍生仓库，
在上游 `nature-figure` 之上补齐了一套可审查的配图生产工作流：
**图表契约 · 阻断式后端门禁 · 独立图集导出 · 语义配色 · Python / R 单后端全套交付**。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Upstream](https://img.shields.io/badge/upstream-Yuan1z0825%2Fnature--skills-2f5fb8.svg)](https://github.com/Yuan1z0825/nature-skills)
[![Snapshot baseline](https://img.shields.io/badge/snapshot%20baseline-f3941a1-4c78a8.svg)](https://github.com/Yuan1z0825/nature-skills/commit/f3941a1722e39af78b24bc7a34167b8880629545)
[![Backends](https://img.shields.io/badge/backend-Python%20%7C%20R-3776ab.svg)](#-本仓库改进了什么)

</div>

> [!IMPORTANT]
> 这是上游 `nature-skills`（袁一哲及贡献者）的**派生快照**，不是原仓库本身，也不声称替代上游。
> 上游 MIT 许可与署名保留在 [`LICENSE`](LICENSE) 与 [`DERIVATIVE_NOTICE.md`](DERIVATIVE_NOTICE.md)。
> 下文「[文件级贡献说明](#-文件级贡献说明可审查)」逐文件区分了本地修改与未改动的上游内容。

**目录**

- 🎯 [它解决什么](#-它解决什么) · ✨ [本仓库改进了什么](#-本仓库改进了什么) · 🖼️ [落到图面上的效果](#️-落到图面上的效果)
- 📦 [产物长什么样](#-产物长什么样) · 🧭 [你能这样用](#-你能这样用) · 📚 [快照还包含什么](#-快照还包含什么)
- 🚀 [安装](#-安装) · 🛡️ [边界与不承诺](#️-边界与不承诺) · 🔍 [文件级贡献说明](#-文件级贡献说明可审查) · 📄 [派生声明与许可](#-派生声明与许可)

## 🎯 它解决什么

只要做过论文配图，大概率被这四件事折磨过：

- **三张图变一张图**：要的是三张独立 figure，拿到的却是被拼进一张画布的合集，投稿前还得手动拆开。
- **图例盖住数据**：图例默认位置正好压在点云上，统计标注挡掉观测点，审稿人第一眼就抓这个。
- **颜色没有含义**：颜色按列表顺序套，读者看不出哪个是主方法，换一次顺序含义就变一次。
- **组图各说各话**：字体、轴措辞、数值精度跨图不一致，返修时整套图被打回来统一。

上游 `nature-figure` 是一份很好的「配图风格指南」；本仓库的本地贡献是把它变成
**一条确定性、可审查的配图生产工作流**——先回答什么、何时停下、怎么画、怎么交付，全部成文。

## ✨ 本仓库改进了什么

<img src="assets/figure-workflow.svg" alt="nature-figure 完整工作流与四项本地扩展" width="100%"/>

### ① 阻断式后端门禁：「Python or R？」不是客套

- 没选后端就**不动手写任何图**，只问一句 **Python or R?** 然后等待回答——覆盖 Agent 默认的「先做了再说」。
- 选定后**单后端贯穿**：绘制、预览、导出、视觉 QA 全部同一后端；不允许用另一种语言「代画」预览。
- 运行时或绘图包缺失时**停下并报告阻塞**，可以给出安装命令，但绝不跨语言替补出一张「差不多的图」。

### ② 图表契约：先写结论，再写代码

画图前必须先立契约：一句话核心结论 → 每个面板对齐哪条证据 → 图型归类 →
导出尺寸与格式。没有证据支撑的面板直接砍掉，**图服务科学逻辑，不是服务好看**。

### ③ 独立图集导出：三张图就是三张图

- 每张图独立成文件：一份主 SVG + PDF/TIFF/PNG 投稿伴生版本，不静默合并成大拼图。
- 同一图集共享字体、轴措辞、颜色语义、统计精度和命名规则，跨图天然一致。

### ④ 布局保护数据：一个观测点都不许挡

新增模式：专用图例面板、无框外置图例、图内直接标注、居中无框统计条——
图例和相关系数、样本量等统计信息一律**离开数据密集区**。

### ⑤ 语义配色：颜色是科学语言

- 用户给的颜色**按科学角色分配**（主方法 / 基线族 / 背景 / 方向性变化），不按列表顺序套。
- 同一方法族保持同色系；低饱和度 `NMI pastel` 家族适配 Nature MI 风格密集图页；
  绿/红主要留给涨跌等方向语义。
- 灰度印刷可回退：网纹、透明度阶梯、标记形状，颜色失效时信息不失效。

### ⑥ 交付纪律与隐私规则

- SVG 中文字保持真文本可编辑（`svg.fonttype="none"`）、PDF 嵌入 TrueType（`pdf.fonttype=42`），
  编辑部改字不用你重画。
- 隐私规则：本地私有路径、文件名、模板来源不会泄漏进图、图注、代码注释或稿件文本。

## 🖼️ 落到图面上的效果

同样的数据，改与不改，是两种审稿体验：

<img src="assets/before-after-improvements.svg" alt="改进前后对比：图例外置与语义配色" width="100%"/>

## 📦 产物长什么样

本工作流的交付不是「一张位图」，而是**每张图一组文件**：

```text
figure-01.svg    ← 主产物：文字保持可编辑，编辑部可直接改字
figure-01.pdf    ← TrueType 嵌入，投稿伴生版
figure-01.tiff   ← 600 dpi，满足多数期刊印刷要求
figure-01.png    ← 预览/演示用
```

同一图集内的所有图共享字体、轴措辞、颜色语义与统计精度——返修时改一处，整套图一致更新。
仓库根目录的 `skill_scatter_plot` 是随快照引入的静态示例素材，不代表本工作流的实际产出，效果见仁见智。

## 🧭 你能这样用

| 场景 | 你可以这样问 |
|---|---|
| 画投稿级配图 | “根据这段结果画 Figure 3，投稿用，Python。” |
| 多张独立图 | “这三组结果分别出三张独立图，不要拼在一起。” |
| 指定颜色 | “用我给的颜色：A 方法蓝、B 方法同族浅蓝、对照灰。” |
| 修图返修 | “审稿人说图例挡住数据了，重排 Figure 2 布局。” |
| 组图统一 | “Figure 1–4 的字体、轴措辞和统计格式统一一遍。” |

标准工作顺序：图表契约 → 后端门禁 → 单后端绘制 → 布局与 QA → 独立导出 → 交付清单。

## 📚 快照还包含什么

派生快照同时带入了上游的九个科研技能目录。每个 `skills/nature-*` 是一个可独立安装的单元；
安装时**整目录复制**，不要只拷 `SKILL.md`（技能依赖各自的 `references/` 等文件）。

| 技能 | 快照状态 | 用途 |
| --- | --- | --- |
| [`nature-figure`](skills/nature-figure/README.md) | Stable | Python / R 投稿级科研配图工作流（**本仓库的扩展重点**） |
| [`nature-polishing`](skills/nature-polishing/README.md) | Stable | 学术文本润色 |
| [`nature-writing`](skills/nature-writing/README.md) | Draft | 稿件章节起草与重构 |
| [`nature-citation`](skills/nature-citation/README.md) | Beta | 文献检索与参考文献导出 |
| [`nature-data`](skills/nature-data/README.md) | Draft | 数据可用性与 FAIR 元数据指引 |
| [`nature-reader`](skills/nature-reader/README.md) | Beta | 基于原文的中英双语论文精读 |
| [`nature-response`](skills/nature-response/README.md) | Beta | 逐点回复审稿意见 |
| [`nature-paper2ppt`](skills/nature-paper2ppt/README.md) | Beta | 中文科研论文汇报 PPT |
| [`nature-academic-search`](skills/nature-academic-search/README.md) | Beta | 多源文献检索与参考文献管理 |

状态标签描述的是导入时的快照状况，不代表本仓库的独立验证；上游最新进展请以上游仓库为准。

## 🚀 安装

### 方式一：交给 Agent（推荐）

```text
请安装这个 Agent Skill：https://github.com/jing1312/nature-figure-skill
先审查仓库内容和 SKILL.md，再整目录安装到你当前 Agent 的 Skills 目录；
如果已安装旧版本，先备份再更新。完成后告诉我实际安装路径和验证结果。
```

### 方式二：手动安装本派生快照

```bash
git clone https://github.com/jing1312/nature-figure-skill.git
cd nature-figure-skill

# 只装 nature-figure（含本仓库的全部扩展）
mkdir -p ~/.codex/skills
cp -R skills/nature-figure ~/.codex/skills/
```

或安装快照里的全部技能：

```bash
mkdir -p ~/.codex/skills
for d in skills/nature-*; do
  cp -R "$d" ~/.codex/skills/
done
```

更细的安装说明见 [`install.md`](install.md)。注意：部分插件元数据仍署上游项目名并面向上游配置，
因此**手动整目录安装**是使用本派生快照最不容易出歧义的方式。

### 想要上游最新版？

```bash
git clone https://github.com/Yuan1z0825/nature-skills.git
```

上游持续更新，本仓库是带扩展的历史快照、不自动同步。要最新技能列表请走上游，并参考
[上游 README](https://github.com/Yuan1z0825/nature-skills#readme) 的安装方式。

## 🛡️ 边界与不承诺

- 这是**工作流与文档层面的扩展**，不是新的绘图库，也不保证任何期刊一定接收。
- 它不能替代期刊的投稿须知、统计审查、无障碍检查和科学内容本身的验证。
- 后端门禁、独立性、配色等规则能显著减少返修风险，但最终判断仍以审稿意见为准。

## 🔍 文件级贡献说明（可审查）

把初始派生提交与上游基线
[`f3941a1`](https://github.com/Yuan1z0825/nature-skills/commit/f3941a1722e39af78b24bc7a34167b8880629545)（2026-05-24）
逐文件比对，实质性本地修改集中在四个 `nature-figure` 工作流文件：

| 文件 | 本地贡献 |
| --- | --- |
| [`skills/nature-figure/SKILL.md`](skills/nature-figure/SKILL.md) | 图表契约、阻断式单后端执行、独立图集导出、非遮挡式标注、语义配色、隐私规则 |
| [`skills/nature-figure/references/api.md`](skills/nature-figure/references/api.md) | 两套面向发表的调色板、可编辑 SVG 规则、无框统计条 helper |
| [`skills/nature-figure/references/common-patterns.md`](skills/nature-figure/references/common-patterns.md) | 专用图例布局、独立导出模式、语义调色板映射、非遮挡统计模式 |
| [`skills/nature-figure/references/design-theory.md`](skills/nature-figure/references/design-theory.md) | 颜色按科学角色映射、对比度与排版的设计依据 |

除此之外：初始快照新增了 [`DERIVATIVE_NOTICE.md`](DERIVATIVE_NOTICE.md) 与根目录的
`skill_scatter_plot` 示例（PNG/SVG）；另有三个文献样例文件仅换行符不同，**不**计为实质修改。
未改动的上游文件不主张任何本地作者身份；上游的完整历史和后续社区贡献见
[原仓库](https://github.com/Yuan1z0825/nature-skills)。

## 📄 派生声明与许可

上游项目归 **Yuan Yizhe（袁一哲）** 及其贡献者所有，按 [MIT 许可](LICENSE) 分发；
本派生仓库保留原许可与版权。简明再分发须知见 [`DERIVATIVE_NOTICE.md`](DERIVATIVE_NOTICE.md)。

再分发本仓库时请：

1. 保留原始版权与许可；
2. 注明它是 `Yuan1z0825/nature-skills` 的派生作品；
3. 区分本地修改与未改动的上游内容；
4. 不暗示上游维护者的背书或官方关联。

欢迎提交 Issue / PR 改进 `nature-figure` 工作流扩展；涉及上游内容变更的建议，请优先提给上游。
