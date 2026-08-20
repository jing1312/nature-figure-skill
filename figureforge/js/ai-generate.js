/**
 * FigureForge — AI Generation
 *
 * Embeds nature-figure-skill design knowledge as system prompt.
 * User description + selected template → AI generates SVG directly.
 * Supports configurable LLM API endpoint.
 */
const AIGenerate = (function () {
  const SYSTEM_PROMPT = `You are a scientific figure designer. Generate a complete, valid SVG markup for a publication-quality figure.

DESIGN RULES (from Nature Figure Making Skill):
- Font: Arial, sans-serif. font-size 7-9pt for dense journal figures, 15-24 for large panels.
- Spines: only left + bottom (no top/right). stroke-width 0.8.
- Legend: frameless (legend.frameon = false). Prefer direct labels over legends.
- Background: white (black only for microscopy/volume rendering).
- No grid lines by default; use sparse y-ticks.
- Colors: use the provided palette. Reserve green/red for directional cues (gains/drops), not series identity.
- One restrained palette per figure: neutral family + signal family + accent.
- Never place legends over dense data regions.
- SVG must have editable text (do NOT convert text to paths).

OUTPUT FORMAT:
- Return ONLY valid SVG markup (no markdown, no explanation).
- Start with <svg and end with </svg>.
- All text elements must have data-edit="true" attribute.
- All visual elements (rect, circle, line, path, polyline, polygon) must have data-edit="true" attribute.
- Include data-role attributes (e.g. data-role="bar", data-role="axis", data-role="legend", data-role="title").
- Use viewBox for responsive scaling.

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
    const apiBase = localStorage.getItem('ff_api_base');
    const apiKey = localStorage.getItem('ff_api_key');
    const apiModel = localStorage.getItem('ff_api_model') || 'gpt-4o';

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
    return generateDemoSVG(userPrompt);
  }

  function extractSVG(text) {
    let svg = text.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim();
    const match = svg.match(/<svg[\s\S]*<\/svg>/);
    if (match) return match[0];
    if (svg.startsWith('<svg')) return svg;
    throw new Error('AI response does not contain valid SVG');
  }

  function generateDemoSVG(prompt) {
    const t = getTemplate('bar');
    if (t) return t.svg;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280">
      <text x="200" y="140" text-anchor="middle" font-size="14">Demo — configure API in settings</text>
    </svg>`;
  }

  function configure(base, key, model) {
    localStorage.setItem('ff_api_base', base);
    localStorage.setItem('ff_api_key', key);
    localStorage.setItem('ff_api_model', model || 'gpt-4o');
  }

  function isConfigured() {
    return !!localStorage.getItem('ff_api_base') && !!localStorage.getItem('ff_api_key');
  }

  return { generate, configure, isConfigured, SYSTEM_PROMPT };
})();
window.AIGenerate = AIGenerate;
