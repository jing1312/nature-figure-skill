# nature-figure-skill 项目笔记

> 整理时间：2026-09-07（本地工作区状态快照）

## 一、项目信息

- **仓库**：[jing1312/nature-figure-skill](https://github.com/jing1312/nature-figure-skill)
- **性质**：上游 Yuan1z0825/nature-skills 的衍生版本（MIT License，见 DERIVATIVE_NOTICE.md）
- **定位**：科研论文配图 Agent Skill —— 让每张子图经得起审稿人追问
- **本市分支结构**：9 个 Skill（nature-figure 是主力）+ `figureforge/` 浏览器可视化编辑器

### 本地各副本位置

| 位置 | 角色 | 状态 |
|------|------|------|
| `D:\文档\github\nature-figure-skill` | ✅ **主工作仓库**（唯一权威副本） | 当前活跃 |
| `D:\文档\学业资料\1大三\ai_test\nature-figure-skill` | 旧快照 | 不完整（只有 README + assets），建议归档或删除 |
| `C:\Users/<user>\Desktop\figure\nature-skills` | 上游原始仓库（袁一哲版） | 仅作对照参考 |
| `C:\Users/<user>\ZCodeProject\nature-figure-skill` | 克隆残留 | 空目录残件，可删 |

仓库远端已临时指到镜像 `gh-proxy.com`（国内直连 GitHub 不通），推送前先确认或改回。

## 二、当前未提交的改动（共 2106 行新增）

两部分，互不冲突：

### 1. 你的 WIP（sync 前保留的本地改动）
- `install.md` —— 重写为独联体安装指南（原英文版换为中文场景版）
- `skills/nature-figure/SKILL.md`、`README.md` —— skill 行为说明微调
- `skills/nature-figure/references/figure-selection.md`（新增）——按科学问题路由图表家族的速查表
- `skills/nature-figure/agents/openai.yaml`（新增）——界面元信息
- 另有 stash `local-wip-before-sync` 备份留着，确认无误后可 `git stash drop`

### 2. FigureForge 增强工作（本会话完成）

| 模块 | 内容 |
|------|------|
| **templates.js**（16→22 模板） | 全面重绘为出版级：修正 Y 轴方向 bug，加网格线/误差棒/置信带/显著性括号/边缘标签/合计框数；新增小提琴图、KM 生存曲线、火山图、3 张多面板综合示例；柱状图叠加原始数据点（superplot） |
| **聚类热图** | 行/列树状图 + 程序/处理注释色条 + 红白发散 Z-score 渐变色底 + 刻度色标条 |
| **palettes.js** | 新增 6 组精选色卡（Tableau 10 / Tol Muted / Seaborn Deep / 莫兰迪 / Economist / 马卡龙），默认改为 Tableau 10，原 8 组保留，共 14 组 |
| **canvas.js** | 选中后四角拖拽缩放手柄（矩形/圆/椭圆/图片，图片锁定比例）；图片工具包（双击裁剪、90°旋转、翻转、SVG 滤镜色调调整、替换图片）；`data-series` 联动删除（删数据元素时图例色块跟随消失） |
| **app.js** | 色板切换按 `data-series` 协调换色（修复折线无色切换/标记彩虹 bug）；拖拽路由按扩展名分派；Ctrl+V 粘贴剪贴板截图 |
| **properties.js** | 滑杆双排加深数字输入框（`--slider-fill` 填充轨道）；改色自动联动同系列元素（一次撤销整组回退）；面板显示「🔗 同系列联动 N 处」 |
| **daynight.js**（新文件） | 日/夜主题全屏过渡动画（移植自 88lin/HeoLume commit 5d4a5be）——星空、日月交替弧线、入夜流星、`prefers-reduced-motion` 降级瞬切 |
| **style.css** | 亮/暗双主题（CSS 变量）；青绿 accent + 发丝线分区 + 微标签 + 渐变面板（参考 currve-arrow.yysuni.com）；新增 crop/link-hint 样式 |
| **index.html** | 工具栏加 ☀/🌙 主题切换 + ⚙ API 设置弹窗；工作区背景 6 → 14 个选项（含「跟随主题」）；面板标题去 emoji 化 |
| **library.js** | 模板库缓存版本升 v6（老用户自动迁移换新模板）；导入支持 PNG/JPG/WebP/GIF/TIFF（TIFF 经 UTIF CDN 解码） |
| **ai-generate.js** | 系统提示词重写为出版级规范（正确轴方向、误差棒、括号、置信带、框外图例、发散色阶等）；未配 API 时明确提示而非静默展示示例 |

## 三、尚待完善的方向（按优先级）

### 高优
1. **提交 & 推送**：工作区已有两千多行新增，先 commit 再推到 GitHub
2. **README 截图过时**：根目录 `assets/figureforge-editor.svg` 的编辑器截图还是旧 UI（蓝紫暗色 + 旧模板），应重截一张新效果
3. **`nature-figure` ↔ FigureForge 联动**：目前两套是独立工具——FigureForge 导出的 SVG 无法交给 skill 的 Python 管线（`save_pub_set` 等）补齐 PDF/TIFF 同步导出；值得在 SKILL.md 里写一段“编辑器产出 → 代码后端出版导出”的桥接流程
4. **编辑缺陷**：
   - 色板切换无撤销（`applyPaletteToSVG` 不进 History）
   - 多选的 batch 改色不同步系列（`applyToSelection` 不走联动）
   - 多行文本如 caption 只能单行编辑（`<text>` 无 tspan 拆解）

### 中优
5. **模板扩充**（花样继续）：radar/雷达、bubble、时间轴甘特、效应量漏斗图、PSM balance 等临床常用；每个补到模板里
6. **导出**：PDF 导出缺失（期刊投稿刚需）——可尝试 pdf-lib/jspdf 轻量引入；600 dpi TIFF 已有
7. **Fill patterns**：柱子的 hatch/dot 纹理填充（黑白打印友好）
8. **AI 生成的 System Prompt** 与模板 `data-series` 契约尚可再压榨一层：让 AI 直接产出联动标注齐全的多面板综合图

### 低优 / 杂项
9. **自动化最小保障**：加 GitHub Actions 跑 `node --check js/*.js` + 模板 XML 有效性测试，避免“页面白屏”级回归
10. **GitHub Pages**：仓库根有 `.nojekyll`，可直接开 Pages 让 `https://jing1312.github.io/nature-figure-skill/figureforge/` 在线可用（零后端）
11. **清理本地**：删 `ZCodeProject/nature-figure-skill` 空残件、`ai_test` 下的旧副本
12. localStorage 模板缓存迁移机制已生效（v6），将来改模板只需：`templates.js` 改内容 + `library.js` version++ 

## 四、快速上手

```bash
# 本地预览 FigureForge（任何静态服务器都行）
cd D:\文档\github\nature-figure-skill\figureforge
npx serve . # 或 python -m http.server
# 打开 http://localhost:3000
```

提交时留意 `assets/figureforge-editor.svg` 与新版 UI 的一致性。
