# nature-figure-skill 项目笔记

> 更新时间：2026-09-07（去 fork 化 + README 重写 + 模板拼图后）

## 一、项目信息

- **仓库**：[jing1312/nature-figure-skill](https://github.com/jing1312/nature-figure-skill)
- **定位**：论文配图工作室 —— FigureForge 可视化编辑器（原创）+ nature-figure Agent Skill 工作流（基于上游扩展）
- **结构**：`figureforge/` 前端编辑器 + 9 个 `skills/nature-*` 技能（nature-figure 是主力）

### 上游关系（去 fork 化现状）

- 内容层解耦已完成：README 以自有项目口吻撰写，上游关系压缩为「派生透明度」details 区块 +「许可与致谢」；LICENSE 双版权行（袁一哲 nature-* 内容 / jing1312 FigureForge 及文档）。
- 仓库层（GitHub fork network）尚未处理：若当前 GitHub 仓库是 Fork 按钮创建的，要彻底脱离 fork network 需在 GitHub 新建仓库后 push 本地历史（本地历史是独立的）。可选新名：`figureforge` / `paper-figure-studio` / 保留 `nature-figure-skill`。注意改名会影响 Pages 地址 `jing1312.github.io/<repo>/figureforge/`。

### 本地各副本位置

| 位置 | 角色 | 状态 |
|------|------|------|
| `D:\文档\github\nature-figure-skill` | ✅ **主工作仓库** | 当前活跃 |
| `D:\文档\学业资料\1大三\ai_test\nature-figure-skill` | 旧快照 | 不完整，建议归档/删除 |
| `C:\Users/<user>\Desktop\figure\nature-skills` | 上游原始仓库 | 仅对照参考 |
| `C:\Users/<user>\ZCodeProject\nature-figure-skill` | 克隆残留 | 空目录，可删 |

git 远端：fetch 走 gh-proxy.com 加速，push 已单独固定为直连 github.com（`git remote set-url --push`）。沙箱代理对 github.com 间歇 502，push 失败就循环重试。

## 二、已完成里程碑

- [x] 2106 行 FigureForge 升级提交推送（4d2edf7）
- [x] 三个编辑缺陷修复（ad18e3d）：切色板进撤销栈 / 多选批量改色走系列联动 / 多行文本 tspan 拆行编辑（textarea 内联编辑器，Enter 换行 Ctrl+Enter 提交）
- [x] `assets/figureforge-editor.svg` 重绘为新版暗色 currve-arrow UI（e672583）
- [x] `assets/showcase.svg` 新增：9 张真实模板渲染拼图（由 `figureforge/js/build-showcase.js` 生成，改模板后重跑即可再生成）
- [x] README 重写：自有项目定位 + showcase 置顶 + Roadmap + 派生透明度折叠区
- [x] LICENSE 双版权行；favicon 内联 emoji

## 三、项目体检记录（2026-09-07）

### 编辑器 UI/代码体检

| 项 | 状态 |
|---|---|
| favicon 缺失 | ✅ 已修（内联 emoji SVG） |
| PDF 导出 | ✅ 已实现（svg2pdf.js + jsPDF 矢量导出，CDN 按需加载） |
| CDN 依赖 | ⚠️ pptxgenjs（PPTX 导出）、UTIF（TIFF 导入）走 jsdelivr，断网时对应功能不可用；离线场景可考虑 vendor 进仓库 |
| 模板缓存 | ✅ v6 迁移机制正常；改模板记得 `library.js` version++ |
| 上游引用 | ✅ 代码/编辑器零上游引用，仅 README/DERIVATIVE_NOTICE/PROJECT-NOTES 三个 md 有 |
| 撤销栈 | ✅ 全操作覆盖（含色板切换） |

### 仓库基建

- [ ] GitHub Actions：`node --check js/*.js` + 模板 XML well-formed 测试（防白屏回归）
- [ ] GitHub Pages 已具备条件（`.nojekyll` 在），确认后台开启即可

## 四、延展方向脑暴（按价值/成本排序）

1. **PDF 导出**（高价值/低成本）：svg → canvas → jspdf 嵌入，或 svg2pdf.js 保持矢量；投稿刚需
2. **FigureForge → Python 闭环**（高价值/中成本）：编辑器导出 SVG → SKILL.md 加一节「编辑器产出后处理」：Python 读 SVG 补 `save_pub_set` 三件套 + QA 检查
3. **期刊规格预设**（高价值/低成本）：预设 Nature/Cell/通用 89/183 mm、字号 ≥5pt、线宽 ≥0.25pt 检查器，导出前一键体检
4. **hatch 纹理填充**（中价值/低成本）：`<pattern>` 定义 4-5 种纹理（斜线/点/网格），黑白印刷友好
5. **统计标注助手**（高价值/中成本）：显著性括号 + P 值面板（模板里已有 sigBr，提升为通用工具）
6. **色觉无障碍模拟**（中价值/低成本）：canvas 像素级 deuteranopia/protanopia 滤镜预览
7. **新模板**（持续）：雷达、效应量漏斗、甘特、PSM balance、SEQC/flow 板式
8. **AI 出图强化**：system prompt 直接产出带 data-series 契约的多面板综合图
9. **模板市场**（远期）：社区贡献模板 JSON，编辑器一键导入

## 五、快速上手

```bash
cd D:\文档\github\nature-figure-skill\figureforge
npx serve .   # 或 python -m http.server
# http://localhost:3000
```

重新生成 showcase 拼图：`node figureforge/js/build-showcase.js`
