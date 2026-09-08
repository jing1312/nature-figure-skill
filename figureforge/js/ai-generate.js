/**
 * FigureForge — AI Generation
 *
 * Embeds nature-figure-skill design knowledge as system prompt.
 * User description + selected template → AI generates SVG directly.
 * Supports configurable LLM API endpoint.
 */
const AIGenerate = (function () {
  const SYSTEM_PROMPT = `You are a scientific figure designer. Generate a complete, valid SVG markup for a publication-quality figure in the style of Nature journals.

CANVAS & GEOMETRY
- Root: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">. Plot area roughly x 58-384, y 44-236.
- Y axis MUST have the smallest value at the BOTTOM and the largest at the TOP (value v maps to y = y1 - (v-min)/(max-min)*(y1-y0)). Never invert.

TYPOGRAPHY
- Font: Arial, sans-serif everywhere (font-family="'Arial',sans-serif").
- Title 10.5px bold top-center, declarative sentence-case finding, format "Figure N | The finding stated as a sentence".
- Axis titles 8px gray (#595959); tick labels 7.2px (#3D3D3D); panel labels lowercase bold 9.5px (a, b, c...).

AXES & GRID
- Spines: only left + bottom, stroke #262626, stroke-width 0.9. No top/right spines, no axis box.
- Tick marks point OUTWARD, 3.5 units long, stroke-width 0.9.
- Light horizontal gridlines BEHIND the data: stroke #E7E7EC, width 1, at y-tick positions. No vertical gridlines except forest plots.

DATA PRESENTATION (what makes it look publication-grade)
- Look like a Nature figure, not a tutorial: default series colours follow Tableau's rich harmonious set (#4E79A7 steel blue, #F28E2B warm orange, #E15759 coral, #76B7B2 teal, #59A14F green, #B07AA1 mauve) — but use the USER-SELECTED palette when given. Neutral grey #C4C9D4 for control groups, and ONE accent for the key condition. Never rainbow-color every group.
- Title is a declarative sentence case finding: "Figure 1 | Treatment raises response in a dose-dependent manner".
- Bars: modest gap, neutral grey for controls + one accent bar for the highlight. Always add error bars (mean ± s.d.): 0.9-unit vertical line with 2.5-unit horizontal caps, color #4D4D4D. Add a small italic note "mean ± s.d., n = 6" bottom-right.
- Add at least one significance bracket where two groups compare: thin 0.9-unit bracket above the bars with label ns / * / ** / ***.
- Line charts: 1.6-unit stroke, round joins, small markers (r ≤ 2.6), and a 12%-opacity filled CI band behind the line when applicable.
- Multi-series: prefer DIRECT LABELS at line ends over legend boxes; controls drawn in grey #AEB4BE dashed; if a legend is needed, keep it frameless (no border, no background) outside the plot area.
- Scatter: semi-transparent points (fill-opacity 0.65, r = 2.8) + a thin (1) dark regression line and an italic "R² = ..." annotation.
- Pie/composition: use a DONUT (e.g. #4E79A7 → #76B7B2 → #F1CE63 → grey, or the single-hue ramp of the chosen palette) with a total "n = ..." in the hole, frameless legend at right.
- Box plots: ALL boxes share one muted fill (accent colour at ~28% opacity) + dark median line + whisker caps; overlay small grey jittered raw points (r 1.7, 45% opacity).
- Heatmaps: sequential single-hue colormap (#F7F7FA → #4E79A7), white 1-unit cell borders, and a labeled colorbar legend with min/mid/max ticks on the right.
- Forest plots: vertical dashed reference line at OR=1, square markers sized by weight, CI whiskers with caps, coral #E15759 diamond for the pooled estimate, numeric "[lo, hi]" column at right.
- Schematics: thin-outline boxes on near-white fills (#F2F4F8), only the pivotal step tinted with the accent, arrowheads #4D4D4D, no heavy color blocks.

EDITABILITY (critical)
- Every text, rect, circle, line, path, polyline, polygon, ellipse element MUST carry data-edit="true".
- Data series elements MUST carry data-role (bar / line / area / marker / series / stat / heat / band) AND data-series="0|1|2..." matching their series index, so recoloring stays coherent.
- Neutral elements (error bars, brackets, axes, gridlines) use data-role="stat" / "axis" / "grid".

COLOR
- Use the provided palette in its given order for data-series 0,1,2...
- Neutral grey #C4C9D4 for control/baseline groups; accent colour only for the condition the figure argues about.
- Reserve red/green for directional meaning, never as arbitrary series identity.
- White background.

OUTPUT FORMAT
- Return ONLY valid SVG markup (no markdown, no explanation). Start with <svg and end with </svg>.

COLOR PALETTES (use the one specified by user):
- NMI Pastel: #484878, #7884B4, #B4C0E4, #E4E4F0, #E4CCD8, #F0C0CC
- Classic Nature: #0F4D92, #3775BA, #8BCF8B, #B64342, #42949E, #9A4D8E
- Publication Soft: #66C2A5, #FC8D62, #8DA0CB, #E78AC3, #A6D854, #FFD92F
- Nature Clinical: #272727, #E28E2C, #D24B40, #5B8FD6, #7BAA5B, #C45AD6
- Nature Imaging: #22D7E6, #FF2AD4, #B8B8B8, #FFFFFF (on black bg)

LAYOUT PATTERNS:
- Hero Panel: one large panel (45-60% height) + smaller evidence panels below.
- Legend Panel: data panels + dedicated legend-only panel on right.
- Asymmetric: hero panel spans all rows on one side.
- Clinical Triptych: 3x3 grid (trajectories / forest plots / summaries).
- Dark Plate: 3x5 grid on black background for microscopy.
- Quantitative Grid: 2x2 equal panels.`;

  async function generate(description, templateKey, paletteKey) {
    const statusEl = document.getElementById('ai-status');
    const btn = document.getElementById('btn-ai-generate');
    btn.disabled = true;
    statusEl.className = 'ai-status';
    statusEl.textContent = '生成中...';

    try {
      const templateInfo = templateKey ? getTemplate(templateKey) : null;
      const palette = paletteKey ? PALETTES[paletteKey] : PALETTES.nmi_pastel;

      let userPrompt = `Generate an SVG figure based on this description:\n${description}\n\n`;
      userPrompt += `Use this color palette: ${palette.name}\n`;
      userPrompt += `Colors: ${palette.defaultSequence.join(', ')}\n`;
      if (templateInfo) {
        userPrompt += `\nFollow this layout template: ${templateInfo.name}\n`;
        userPrompt += `Template description: ${templateInfo.description}\n`;
      }
      userPrompt += `\nGenerate a complete, valid SVG with viewBox="0 0 400 280". Make it look realistic with actual data values, proper axes, labels, and legend.`;

      const svg = await callAPI(SYSTEM_PROMPT, userPrompt);
      if (!svg) {
        Canvas.loadSVG(generateDemoSVG(userPrompt));
        statusEl.className = 'ai-status error';
        statusEl.innerHTML = '⚠️ 未配置 AI 接口，已展示内置示例图。点击工具栏 <b>⚙ 设置</b> 填入 API 地址 / Key / 模型后即可真正生成。';
        return null;
      }
      Canvas.loadSVG(svg);
      statusEl.className = 'ai-status success';
      statusEl.textContent = '✅ 生成成功！可以开始在画布上编辑。';
      return svg;
    } catch (err) {
      statusEl.className = 'ai-status error';
      statusEl.textContent = '❌ ' + err.message;
      console.error('AI generate error:', err);
      throw err;
    } finally {
      btn.disabled = false;
    }
  }

  async function callAPI(systemPrompt, userPrompt) {
    // API key is kept in sessionStorage only (never localStorage) so it is
    // cleared when the tab closes, limiting exposure if the origin is
    // ever compromised (e.g. via a stored/persistent XSS elsewhere).
    const apiBase = sessionStorage.getItem('ff_api_base');
    const apiKey = sessionStorage.getItem('ff_api_key');
    const apiModel = sessionStorage.getItem('ff_api_model') || 'gpt-4o';

    if (apiBase && apiKey) {
      const resp = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: apiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      const data = await resp.json();
      const content = data.choices[0].message.content;
      return extractSVG(content);
    }
    return null; // not configured
  }

  function extractSVG(text) {
    let svg = text.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim();
    const match = svg.match(/<svg[\s\S]*<\/svg>/);
    if (match) return match[0];
    if (svg.startsWith('<svg')) return svg;
    throw new Error('AI response does not contain valid SVG');
  }

  function generateDemoSVG(prompt) {
    const t = getTemplate('grouped-bar');
    if (t) return t.svg;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280">
      <text x="200" y="140" text-anchor="middle" font-size="14">Demo — configure API in settings</text>
    </svg>`;
  }

  function configure(base, key, model) {
    sessionStorage.setItem('ff_api_base', base);
    sessionStorage.setItem('ff_api_key', key);
    sessionStorage.setItem('ff_api_model', model || 'gpt-4o');
  }

  function isConfigured() {
    return !!sessionStorage.getItem('ff_api_base') && !!sessionStorage.getItem('ff_api_key');
  }

  return { generate, configure, isConfigured, SYSTEM_PROMPT };
})();
window.AIGenerate = AIGenerate;
