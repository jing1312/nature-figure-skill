/**
 * FigureForge — Property Panel
 *
 * Context-sensitive: detects selected element type and shows relevant controls.
 * All changes apply to the SVG element in real-time (WYSIWYG).
 */
const Properties = (function () {
  let currentEl = null;

  function onSelectionChanged(el) {
    currentEl = el;
    const empty = document.getElementById('prop-empty');
    const panel = document.getElementById('prop-panel');
    const content = document.getElementById('prop-content');
    const title = document.getElementById('prop-title');

    const count = window.Canvas ? Canvas.getSelection().length : (el ? 1 : 0);

    if (!el || !count) {
      empty.style.display = 'block';
      panel.classList.add('hidden');
      return;
    }

    empty.style.display = 'none';
    panel.classList.remove('hidden');
    content.innerHTML = '';

    if (count > 1) { renderMultiProps(content, count); return; }

    const tag = el.tagName;
    const role = el.getAttribute('data-role') || '';
    title.textContent = `${tag}${role ? ' · ' + role : ''}`;

    if (tag === 'text') renderTextProps(el, content);
    else if (tag === 'rect') renderRectProps(el, content);
    else if (tag === 'circle') renderCircleProps(el, content);
    else if (tag === 'line') { if (role === 'axis') renderAxisProps(el, content); else renderLineProps(el, content); }
    else if (tag === 'polyline' || tag === 'polygon') renderPolyProps(el, content);
    else if (tag === 'path') renderPathProps(el, content);
    else renderGenericProps(el, content);
  }

  function renderMultiProps(c, count) {
    document.getElementById('prop-title').textContent = `${count} 个元素已选中`;
    c.appendChild(sectionHeader('批量操作'));
    const btnRow = document.createElement('div');
    btnRow.className = 'prop-row';
    btnRow.innerHTML = `
      <button class="prop-btn" data-act="group">⛓ 成组</button>
      <button class="prop-btn" data-act="dup">⧉ 复制</button>
      <button class="prop-btn danger" data-act="del">🗑 删除</button>`;
    btnRow.querySelector('[data-act="group"]').addEventListener('click', () => Canvas.groupSelection());
    btnRow.querySelector('[data-act="dup"]').addEventListener('click', () => Canvas.duplicateElement());
    btnRow.querySelector('[data-act="del"]').addEventListener('click', () => Canvas.deleteElement());
    c.appendChild(btnRow);
    c.appendChild(sectionHeader('公共样式'));
    c.appendChild(colorPicker('填充', '#4a9eff', v => applyToSelection('fill', v)));
    c.appendChild(colorPicker('描边', '#333333', v => applyToSelection('stroke', v)));
    const opRow = slider('透明度', 0, 1, 0.05, 1, v => applyToSelection('opacity', v));
    c.appendChild(opRow);
    c.appendChild(sectionHeader('排列'));
    const arrRow = document.createElement('div');
    arrRow.className = 'prop-row';
    arrRow.innerHTML = `
      <button class="prop-btn" data-act="top">⬆ 置顶</button>
      <button class="prop-btn" data-act="bottom">⬇ 置底</button>`;
    arrRow.querySelector('[data-act="top"]').addEventListener('click', () => {
      const els = Canvas.getSelection(); const parent = els[0].parentNode;
      els.forEach(el => parent.appendChild(el));
    });
    arrRow.querySelector('[data-act="bottom"]').addEventListener('click', () => {
      const els = Canvas.getSelection(); const parent = els[0].parentNode;
      [...els].reverse().forEach(el => parent.insertBefore(el, parent.firstChild));
    });
    c.appendChild(arrRow);
  }

  function applyToSelection(attr, value) {
    const els = Canvas.getSelection();
    const olds = els.map(el => el.getAttribute(attr));
    els.forEach(el => el.setAttribute(attr, value));
    if (window.History) {
      History.push({
        undo: () => els.forEach((el, i) => { if (olds[i] === null) el.removeAttribute(attr); else el.setAttribute(attr, olds[i]); }),
        redo: () => els.forEach(el => el.setAttribute(attr, value)),
        label: `Batch ${attr}`
      });
    }
    Canvas.updateSelectionOverlay();
  }

  function renderAxisProps(el, c) {
    c.appendChild(sectionHeader('坐标轴'));
    const horizontal = Math.abs(parseFloat(getAttr(el, 'x2')) - parseFloat(getAttr(el, 'x1'))) >=
                       Math.abs(parseFloat(getAttr(el, 'y2')) - parseFloat(getAttr(el, 'y1')));
    const len = horizontal
      ? Math.abs(parseFloat(getAttr(el, 'x2')) - parseFloat(getAttr(el, 'x1')))
      : Math.abs(parseFloat(getAttr(el, 'y2')) - parseFloat(getAttr(el, 'y1')));
    c.appendChild(slider('轴长度', 10, 760, 1, len, v => {
      const old = getAttr(el, horizontal ? 'x2' : 'y2');
      const base = horizontal ? getAttr(el, 'x1') : getAttr(el, 'y1');
      const sign = parseFloat(old) >= parseFloat(base) ? 1 : -1;
      setAttr(el, horizontal ? 'x2' : 'y2', parseFloat(base) + sign * v);
    }));
    c.appendChild(slider('轴粗细', 0.25, 6, 0.25, parseFloat(getAttr(el, 'stroke-width', '1')), v => setAttr(el, 'stroke-width', v)));
    c.appendChild(colorPicker('轴颜色', getAttr(el, 'stroke', '#333333'), v => setAttr(el, 'stroke', v)));
    c.appendChild(sectionHeader('端点（微调）'));
    c.appendChild(slider('X1', 0, 800, 1, parseFloat(getAttr(el, 'x1', '0')), v => setAttr(el, 'x1', v)));
    c.appendChild(slider('Y1', 0, 600, 1, parseFloat(getAttr(el, 'y1', '0')), v => setAttr(el, 'y1', v)));
    c.appendChild(slider('X2', 0, 800, 1, parseFloat(getAttr(el, 'x2', '0')), v => setAttr(el, 'x2', v)));
    c.appendChild(slider('Y2', 0, 600, 1, parseFloat(getAttr(el, 'y2', '0')), v => setAttr(el, 'y2', v)));
    c.appendChild(sectionHeader('刻度/标签字体'));
    c.appendChild(input('提示', '点击画布中的刻度文字可单独修改字体、字号与粗细', () => {}));
  }

  function row(label, innerHTML) {
    const div = document.createElement('div');
    div.className = 'prop-row';
    div.innerHTML = `<label>${label}</label>${innerHTML}`;
    return div;
  }

  function sectionHeader(text) {
    const h = document.createElement('div');
    h.className = 'prop-section-header';
    h.textContent = text;
    return h;
  }

  function colorPicker(label, value, onChange) {
    const div = row(label, `
      <div class="prop-color">
        <input type="color" value="${value || '#000000'}">
        <input type="text" value="${value || ''}">
      </div>`);
    const picker = div.querySelector('input[type="color"]');
    const text = div.querySelector('input[type="text"]');
    picker.addEventListener('input', e => {
      text.value = e.target.value;
      onChange(e.target.value);
    });
    text.addEventListener('change', e => {
      picker.value = e.target.value;
      onChange(e.target.value);
    });
    return div;
  }

  function slider(label, min, max, step, value, onChange) {
    const div = row(label, `
      <div class="prop-slider">
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}">
        <span class="slider-value">${value}</span>
      </div>`);
    const range = div.querySelector('input[type="range"]');
    const display = div.querySelector('.slider-value');
    range.addEventListener('input', e => {
      display.textContent = e.target.value;
      onChange(parseFloat(e.target.value));
    });
    return div;
  }

  function select(label, options, value, onChange) {
    const opts = options.map(o =>
      `<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${o.label}</option>`
    ).join('');
    const div = row(label, `<select class="prop-select">${opts}</select>`);
    const sel = div.querySelector('select');
    sel.addEventListener('change', e => onChange(e.target.value));
    return div;
  }

  function input(label, value, onChange) {
    const div = row(label, `<input type="text" class="prop-input" value="${value}">`);
    const inp = div.querySelector('input');
    inp.addEventListener('change', e => onChange(e.target.value));
    return div;
  }

  function pushHistory(attr, oldVal, newVal, el) {
    if (window.History) {
      History.push({
        undo: () => { el.setAttribute(attr, oldVal); },
        redo: () => { el.setAttribute(attr, newVal); },
        label: `Change ${attr}`
      });
    }
  }

  function getAttr(el, name, fallback = '') {
    return el.getAttribute(name) || fallback;
  }

  function setAttr(el, name, value) {
    const old = el.getAttribute(name);
    el.setAttribute(name, value);
    pushHistory(name, old, value, el);
    if (window.Canvas) Canvas.updateSelectionOverlay();
  }

  function renderTextProps(el, c) {
    c.appendChild(sectionHeader('文字内容'));
    c.appendChild(input('内容', el.textContent, v => {
      const old = el.textContent;
      el.textContent = v;
      if (window.History) History.push({
        undo: () => { el.textContent = old; },
        redo: () => { el.textContent = v; },
        label: 'Edit Text'
      });
    }));
    c.appendChild(sectionHeader('字体'));
    c.appendChild(select('字体', [
      {value: "'Arial',sans-serif", label: 'Arial'},
      {value: "'Helvetica',sans-serif", label: 'Helvetica'},
      {value: "'DejaVu Sans',sans-serif", label: 'DejaVu Sans'},
      {value: "'Times New Roman',serif", label: 'Times'},
      {value: "'Courier New',monospace", label: 'Courier'},
    ], getAttr(el, 'font-family'), v => setAttr(el, 'font-family', v)));
    c.appendChild(slider('大小', 4, 48, 0.5, parseFloat(getAttr(el, 'font-size', '7')), v => setAttr(el, 'font-size', v)));
    const weight = getAttr(el, 'font-weight', 'normal');
    c.appendChild(select('粗细', [
      {value: 'normal', label: 'Regular'},
      {value: 'bold', label: 'Bold'},
      {value: '300', label: 'Light'},
      {value: '600', label: 'SemiBold'},
    ], weight, v => setAttr(el, 'font-weight', v)));
    c.appendChild(sectionHeader('位置'));
    c.appendChild(slider('X', 0, 800, 1, parseFloat(getAttr(el, 'x', '0')), v => setAttr(el, 'x', v)));
    c.appendChild(slider('Y', 0, 600, 1, parseFloat(getAttr(el, 'y', '0')), v => setAttr(el, 'y', v)));
    c.appendChild(sectionHeader('对齐'));
    c.appendChild(select('锚点', [
      {value: 'start', label: '左对齐'},
      {value: 'middle', label: '居中'},
      {value: 'end', label: '右对齐'},
    ], getAttr(el, 'text-anchor', 'start'), v => setAttr(el, 'text-anchor', v)));
    c.appendChild(sectionHeader('颜色'));
    c.appendChild(colorPicker('填充', getAttr(el, 'fill', '#333333'), v => setAttr(el, 'fill', v)));
  }

  function renderRectProps(el, c) {
    c.appendChild(sectionHeader('位置与尺寸'));
    c.appendChild(slider('X', 0, 800, 1, parseFloat(getAttr(el, 'x', '0')), v => setAttr(el, 'x', v)));
    c.appendChild(slider('Y', 0, 600, 1, parseFloat(getAttr(el, 'y', '0')), v => setAttr(el, 'y', v)));
    c.appendChild(slider('宽', 1, 800, 1, parseFloat(getAttr(el, 'width', '10')), v => setAttr(el, 'width', v)));
    c.appendChild(slider('高', 1, 600, 1, parseFloat(getAttr(el, 'height', '10')), v => setAttr(el, 'height', v)));
    const rx = getAttr(el, 'rx', '0');
    c.appendChild(slider('圆角', 0, 50, 1, parseFloat(rx), v => setAttr(el, 'rx', v)));
    c.appendChild(sectionHeader('填充'));
    c.appendChild(colorPicker('颜色', getAttr(el, 'fill', 'none'), v => setAttr(el, 'fill', v)));
    const opacity = getAttr(el, 'fill-opacity', '1');
    c.appendChild(slider('透明度', 0, 1, 0.05, parseFloat(opacity), v => setAttr(el, 'fill-opacity', v)));
    c.appendChild(sectionHeader('描边'));
    c.appendChild(colorPicker('颜色', getAttr(el, 'stroke', 'none'), v => setAttr(el, 'stroke', v)));
    c.appendChild(slider('宽度', 0, 10, 0.5, parseFloat(getAttr(el, 'stroke-width', '0')), v => setAttr(el, 'stroke-width', v)));
  }

  function renderCircleProps(el, c) {
    c.appendChild(sectionHeader('位置与尺寸'));
    c.appendChild(slider('CX', 0, 800, 1, parseFloat(getAttr(el, 'cx', '0')), v => setAttr(el, 'cx', v)));
    c.appendChild(slider('CY', 0, 600, 1, parseFloat(getAttr(el, 'cy', '0')), v => setAttr(el, 'cy', v)));
    c.appendChild(slider('半径', 1, 200, 1, parseFloat(getAttr(el, 'r', '5')), v => setAttr(el, 'r', v)));
    c.appendChild(sectionHeader('填充'));
    c.appendChild(colorPicker('颜色', getAttr(el, 'fill', 'none'), v => setAttr(el, 'fill', v)));
    const opacity = getAttr(el, 'opacity', getAttr(el, 'fill-opacity', '1'));
    c.appendChild(slider('透明度', 0, 1, 0.05, parseFloat(opacity), v => setAttr(el, 'opacity', v)));
    c.appendChild(sectionHeader('描边'));
    c.appendChild(colorPicker('颜色', getAttr(el, 'stroke', 'none'), v => setAttr(el, 'stroke', v)));
    c.appendChild(slider('宽度', 0, 10, 0.5, parseFloat(getAttr(el, 'stroke-width', '0')), v => setAttr(el, 'stroke-width', v)));
  }

  function renderLineProps(el, c) {
    c.appendChild(sectionHeader('端点'));
    c.appendChild(slider('X1', 0, 800, 1, parseFloat(getAttr(el, 'x1', '0')), v => setAttr(el, 'x1', v)));
    c.appendChild(slider('Y1', 0, 600, 1, parseFloat(getAttr(el, 'y1', '0')), v => setAttr(el, 'y1', v)));
    c.appendChild(slider('X2', 0, 800, 1, parseFloat(getAttr(el, 'x2', '0')), v => setAttr(el, 'x2', v)));
    c.appendChild(slider('Y2', 0, 600, 1, parseFloat(getAttr(el, 'y2', '0')), v => setAttr(el, 'y2', v)));
    c.appendChild(sectionHeader('样式'));
    c.appendChild(colorPicker('颜色', getAttr(el, 'stroke', '#333'), v => setAttr(el, 'stroke', v)));
    c.appendChild(slider('宽度', 0, 10, 0.5, parseFloat(getAttr(el, 'stroke-width', '1')), v => setAttr(el, 'stroke-width', v)));
    const dash = getAttr(el, 'stroke-dasharray', '');
    c.appendChild(select('虚线', [
      {value: '', label: '实线'},
      {value: '4,2', label: '虚线'},
      {value: '2,2', label: '点线'},
      {value: '6,2,2,2', label: '点划线'},
    ], dash, v => setAttr(el, 'stroke-dasharray', v)));
  }

  function renderPolyProps(el, c) {
    c.appendChild(sectionHeader('样式'));
    c.appendChild(colorPicker('填充', getAttr(el, 'fill', 'none'), v => setAttr(el, 'fill', v)));
    c.appendChild(colorPicker('描边', getAttr(el, 'stroke', '#333'), v => setAttr(el, 'stroke', v)));
    c.appendChild(slider('宽度', 0, 10, 0.5, parseFloat(getAttr(el, 'stroke-width', '1')), v => setAttr(el, 'stroke-width', v)));
    const opacity = getAttr(el, 'fill-opacity', '1');
    c.appendChild(slider('填充透明度', 0, 1, 0.05, parseFloat(opacity), v => setAttr(el, 'fill-opacity', v)));
    c.appendChild(input('点坐标', getAttr(el, 'points'), v => setAttr(el, 'points', v)));
  }

  function renderPathProps(el, c) {
    c.appendChild(sectionHeader('样式'));
    c.appendChild(colorPicker('填充', getAttr(el, 'fill', 'none'), v => setAttr(el, 'fill', v)));
    c.appendChild(colorPicker('描边', getAttr(el, 'stroke', '#333'), v => setAttr(el, 'stroke', v)));
    c.appendChild(slider('宽度', 0, 10, 0.5, parseFloat(getAttr(el, 'stroke-width', '1')), v => setAttr(el, 'stroke-width', v)));
    const opacity = getAttr(el, 'fill-opacity', '1');
    c.appendChild(slider('填充透明度', 0, 1, 0.05, parseFloat(opacity), v => setAttr(el, 'fill-opacity', v)));
  }

  function renderGenericProps(el, c) {
    c.appendChild(sectionHeader('属性'));
    const attrs = el.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const a = attrs[i];
      if (a.name.startsWith('data-')) continue;
      c.appendChild(input(a.name, a.value, v => setAttr(el, a.name, v)));
    }
  }

  return { onSelectionChanged };
})();
window.Properties = Properties;
