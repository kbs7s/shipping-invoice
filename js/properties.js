/* Properties panel: every property of the selected element(s) or of the page/template,
   bound by data-path so edits apply live to the canvas. */
(function () {
  'use strict';
  const E = () => window.Elements;
  const esc = (s) => E().esc(s);

  const FONTS = ['Cairo', 'Tahoma', 'Arial', 'Segoe UI', 'Times New Roman', 'Traditional Arabic', 'Simplified Arabic', 'Courier New', 'Georgia', 'Verdana', 'Arial Black', 'monospace', 'serif'];
  const TEXT_TYPES = ['text', 'field', 'date', 'calc', 'table', 'barcode'];

  function getPath(o, path) { return path.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
  function setPath(o, path, v) {
    const ks = path.split('.'); let cur = o;
    for (let i = 0; i < ks.length - 1; i++) { if (cur[ks[i]] == null) cur[ks[i]] = {}; cur = cur[ks[i]]; }
    cur[ks[ks.length - 1]] = v;
  }

  /* ---------------------------------------------------------- controls */
  const C = {
    num(path, label, o) { o = o || {}; return `<label class="pf ${o.cls || ''}"><span>${label}</span><input type="number" data-path="${path}" data-type="num" step="${o.step || 0.1}" ${o.min != null ? `min="${o.min}"` : ''} ${o.max != null ? `max="${o.max}"` : ''}></label>`; },
    text(path, label, o) { o = o || {}; return `<label class="pf ${o.cls || 'full'}"><span>${label}</span><input type="text" data-path="${path}" ${o.ltr ? 'dir="ltr"' : ''}></label>`; },
    area(path, label, o) {
      o = o || {};
      return `<div class="pf full"><span class="pf-head">${label}${o.insert ? C.insertSelect(path) : ''}</span><textarea data-path="${path}" rows="${o.rows || 3}" ${o.ltr ? 'dir="ltr"' : ''}></textarea>${o.help ? `<small class="muted">${o.help}</small>` : ''}</div>`;
    },
    insertSelect(target) {
      let opts = `<option value="">${t('insertField')}</option>`;
      const GL = { store: t('store'), order: t('sec.order'), customer: t('sec.customer'), items: t('sec.items'), charges: t('sec.charges'), shipping: t('sec.shipping'), other: t('f.now') };
      E().FIELD_GROUPS.forEach(([g, keys]) => { opts += `<optgroup label="${GL[g] || g}">` + keys.map((k) => `<option value="${k}">${esc(E().fieldLabel(k))} {{${k}}}</option>`).join('') + '</optgroup>'; });
      const o = App.state.orders.find((x) => x.custom && x.custom.length);
      if (o) opts += `<optgroup label="${t('sec.custom')}">` + o.custom.filter((c) => c.key).map((c) => `<option value="custom_${esc(c.key)}">{{custom_${esc(c.key)}}}</option>`).join('') + '</optgroup>';
      return `<select class="insert-sel" data-insert="${target}">${opts}</select>`;
    },
    select(path, label, options, o) {
      o = o || {};
      return `<label class="pf ${o.cls || ''}"><span>${label}</span><select data-path="${path}" ${o.rerender ? 'data-rerender="1"' : ''} ${o.type ? `data-type="${o.type}"` : ''}>${options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></label>`;
    },
    color(path, label, o) {
      o = o || {};
      return `<label class="pf ${o.cls || ''}"><span>${label}</span><span class="color-row"><input type="color" data-path="${path}" data-type="color">${o.none ? `<button type="button" class="chip" data-clear="${path}" title="${t('transparent')}">∅</button>` : ''}</span></label>`;
    },
    check(path, label, o) { o = o || {}; return `<label class="pf-check ${o.cls || ''}"><input type="checkbox" data-path="${path}" data-type="bool" ${o.rerender ? 'data-rerender="1"' : ''}><span>${label}</span></label>`; },
    seg(path, opts) { return `<div class="seg sm" data-seg="${path}">${opts.map(([v, ic, title]) => `<button type="button" data-set="${path}" data-val="${v}" title="${esc(title)}">${ic ? E().icon(ic) : esc(title)}</button>`).join('')}</div>`; },
    range(path, label) { return `<label class="pf full"><span>${label} <output data-out="${path}"></output></span><input type="range" min="0" max="100" step="1" data-path="${path}" data-type="num"></label>`; },
    section(title, body, open) { return `<details class="psec" ${open === false ? '' : 'open'}><summary>${title}</summary><div class="psec-body">${body}</div></details>`; },
  };

  const Properties = {
    root() { return document.getElementById('props'); },
    targets() { return Designer.selected(); },

    render() {
      const root = this.root(); if (!root) return;
      const tpl = Designer.tpl(); if (!tpl) { root.innerHTML = ''; return; }
      const sel = this.targets();
      root.innerHTML = sel.length ? this.elementHTML(sel) : this.pageHTML(tpl);
      this.sync();
    },

    /* ---------------------------------------------------- page panel */
    pageHTML(tpl) {
      const sizes = Templates.SIZES.map((s) => [s.id, `${s.label} — ${s.w}×${s.h}`]);
      const isDef = App.defaultTemplateId(tpl.type) === tpl.id;
      let h = `<div class="props-head"><strong>${E().icon('template')} ${t('pageSettings')}</strong></div>`;
      h += C.section(t('templateName'), `<div class="pgrid">
          ${C.text('tpl.name', t('templateName'))}
          ${C.select('tpl.type', t('templateType'), [['receipt', t('receipt')], ['sticker', t('sticker')]], { rerender: true })}
          ${C.select('tpl.storeId', t('store'), [['', t('noStore')]].concat(App.state.stores.map((s) => [s.id, s.name])))}
        </div>
        <button type="button" class="btn small ${isDef ? 'ok' : ''}" data-action="setDefault" ${isDef ? 'disabled' : ''}>${E().icon(isDef ? 'check' : 'star')}<span>${isDef ? t('isDefault') : t('setDefault')}</span></button>`);
      h += C.section(t('paperSize'), `<div class="pgrid">
          <label class="pf full"><span>${t('paperSize')}</span><select data-action-change="preset"><option value="">${t('customSize')}</option>${sizes.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select></label>
          ${C.num('tpl.width', t('width') + ' (mm)', { min: 10, step: 1 })}
          ${C.num('tpl.height', t('height') + ' (mm)', { min: 10, step: 1 })}
        </div>
        <button type="button" class="btn small" data-action="swapWH">${E().icon('rotate')}<span>${t('swapWH')}</span></button>`);
      h += C.section(t('appearance'), `<div class="pgrid">
          ${C.color('tpl.background', t('background'))}
          ${C.select('tpl.defaultFont', t('defaultFont'), FONTS.map((f) => [f, f]))}
          ${C.num('set.gridSize', t('gridSize'), { min: 0.5, step: 0.5 })}
        </div>`);
      h += `<p class="muted small pad">${t('emptyPageHint')}</p>`;
      return h;
    },

    /* ------------------------------------------------- element panel */
    elementHTML(sel) {
      const el = sel[0]; const multi = sel.length > 1;
      const p = el.props || {};
      const typeKey = el.type === 'text' && p.static ? 'static' : el.type;
      let h = `<div class="props-head">
          <span class="type-ico">${E().icon((E().TYPES[typeKey] || E().TYPES.text).icon)}</span>
          ${multi ? `<strong>${sel.length} ${t('multiSelected')}</strong>` : `<input class="name-input" data-path="name" type="text" title="${t('elementName')}">`}
          <button class="icon-btn xs" data-action="hide" title="${t('visible')}">${E().icon(el.hidden ? 'eyeOff' : 'eye')}</button>
          <button class="icon-btn xs" data-action="lock" title="${t('locked')}">${E().icon(el.locked ? 'lock' : 'unlock')}</button>
          <button class="icon-btn xs danger" data-action="delete" title="${t('delete')}">${E().icon('trash')}</button>
        </div>`;
      if (multi) h += `<p class="muted small pad">${t('multiHint')}</p>`;
      if (!multi) { const content = this.contentHTML(el); if (content) h += C.section(t('content'), content); }

      h += C.section(t('positionSize'), `<div class="pgrid g4">
          ${C.num('x', t('x'))}${C.num('y', t('y'))}${C.num('w', t('w'), { min: 0.5 })}${C.num('h', t('h'), { min: 0.5 })}
          ${C.num('rot', t('rotation'), { step: 1, min: -180, max: 180, cls: 'span2' })}
        </div>
        <div class="pf-head">${t('alignToPage')}</div>
        <div class="btn-row">${['alignLeft', 'alignCenterH', 'alignRight', 'alignTop', 'alignMiddle', 'alignBottom'].map((c) => `<button type="button" class="icon-btn" data-action="align" data-arg="${c}" title="${t(c)}">${E().icon(c)}</button>`).join('')}</div>`);

      const hasText = sel.some((x) => TEXT_TYPES.includes(x.type));
      if (hasText) {
        h += C.section(t('typography'), `<div class="pgrid">
            ${C.select('style.fontFamily', t('fontFamily'), FONTS.map((f) => [f, f]), { cls: 'span2' })}
            ${C.num('style.fontSize', t('fontSize'), { min: 3, step: 0.5 })}
            <div class="pf"><span>&nbsp;</span><div class="seg sm">
              <button type="button" data-toggle="style.bold" title="${t('bold')}">${E().icon('bold')}</button>
              <button type="button" data-toggle="style.italic" title="${t('italic')}">${E().icon('italic')}</button>
              <button type="button" data-toggle="style.underline" title="${t('underline')}">${E().icon('underline')}</button>
            </div></div>
            <div class="pf span2"><span>${t('textAlign')}</span>${C.seg('style.align', [['right', 'textRight', t('right')], ['center', 'textCenter', 'center'], ['left', 'textLeft', t('left')], ['justify', 'textJustify', 'justify']])}</div>
            <div class="pf span2"><span>${t('vAlign')}</span>${C.seg('style.valign', [['top', 'alignTop', t('top')], ['middle', 'alignMiddle', 'middle'], ['bottom', 'alignBottom', t('bottom')]])}</div>
            ${C.num('style.lineHeight', t('lineHeight'), { min: 0.5, step: 0.05 })}
            ${C.num('style.letterSpacing', t('letterSpacing'), { step: 0.1 })}
            ${C.select('style.dir', t('direction'), [['rtl', t('rtl')], ['ltr', t('ltr')], ['auto', t('autoDir')]])}
            ${C.color('style.color', t('textColor'))}
          </div>`);
      } else if (['icon', 'line', 'qr'].includes(el.type)) {
        h += C.section(t('color'), `<div class="pgrid">${C.color('style.color', t('color'))}</div>`);
      }

      h += C.section(t('appearance'), `<div class="pgrid">
          ${el.type !== 'line' ? C.color('style.bg', t('bgColor'), { none: true }) : ''}
          ${el.type !== 'line' ? C.color('style.borderColor', t('borderColor')) : ''}
          ${el.type !== 'line' ? C.num('style.borderWidth', t('borderWidth'), { min: 0, step: 0.1 }) : ''}
          ${el.type !== 'line' ? C.select('style.borderStyle', t('borderStyle'), [['solid', t('solid')], ['dashed', t('dashed')], ['dotted', t('dotted')], ['double', t('double')]]) : ''}
          ${el.type !== 'line' ? C.num('style.radius', t('radius'), { min: 0, step: 0.5 }) : ''}
          ${el.type !== 'line' ? C.num('style.padding', t('padding'), { min: 0, step: 0.5 }) : ''}
          ${C.range('style.opacity', t('opacity'))}
          ${C.check('__visible', t('visible'))}
          ${C.check('locked', t('locked'))}
        </div>
        <div class="pf-head">${t('layerOrder')}</div>
        <div class="btn-row">
          <button type="button" class="btn small" data-action="layer" data-arg="front">${E().icon('chevronsUp')}<span>${t('toFront')}</span></button>
          <button type="button" class="btn small" data-action="layer" data-arg="forward">${E().icon('chevronUp')}<span>${t('forward')}</span></button>
          <button type="button" class="btn small" data-action="layer" data-arg="backward">${E().icon('chevronDown')}<span>${t('backward')}</span></button>
          <button type="button" class="btn small" data-action="layer" data-arg="back">${E().icon('chevronsDown')}<span>${t('toBack')}</span></button>
        </div>`);
      return h;
    },

    contentHTML(el) {
      const p = el.props || {};
      const fieldOpts = E().ALL_FIELDS.map((k) => [k, `${E().fieldLabel(k)}  {{${k}}}`]);
      const customs = new Set(); App.state.orders.forEach((o) => (o.custom || []).forEach((c) => c.key && customs.add('custom_' + c.key)));
      customs.forEach((k) => fieldOpts.push([k, `{{${k}}}`]));
      if (p.key && !fieldOpts.some((f) => f[0] === p.key)) fieldOpts.push([p.key, `{{${p.key}}}`]);
      switch (el.type) {
        case 'text':
          return p.static ? C.area('props.text', t('textContent'), { rows: 3 }) : C.area('props.text', t('textContent'), { rows: 3, insert: true });
        case 'field':
          return `<div class="pgrid">
              ${C.select('props.key', t('dataField'), fieldOpts, { cls: 'full', rerender: true })}
              ${C.text('props.label', t('label'), { cls: 'span2' })}
              ${C.check('props.showLabel', t('showLabel'))}
              ${C.check('props.labelBold', t('labelBold'))}
              ${C.select('props.layout', t('layout'), [['inline', t('layoutInline')], ['spread', t('layoutSpread')], ['stacked', t('layoutStacked')]], { rerender: true })}
              ${p.layout === 'inline' || !p.layout ? C.text('props.sep', t('separator'), { cls: '' }) : ''}
              ${C.color('props.labelColor', t('labelColor'), { none: true })}
            </div>`;
        case 'calc':
          return `${C.area('props.formula', t('formula'), { rows: 2, insert: true, ltr: true, help: t('calcHelp') })}
            <div class="pgrid">
              ${C.text('props.label', t('label'), { cls: 'span2' })}
              ${C.check('props.showLabel', t('showLabel'))}
              ${C.check('props.labelBold', t('labelBold'))}
              ${C.select('props.layout', t('layout'), [['inline', t('layoutInline')], ['spread', t('layoutSpread')], ['stacked', t('layoutStacked')]], { rerender: true })}
              ${C.select('props.decimals', t('decimals'), [['-1', t('auto')], ['0', '0'], ['1', '1'], ['2', '2'], ['3', '3']], { type: 'num' })}
              ${C.text('props.prefix', t('prefix'), { cls: '' })}
              ${C.text('props.suffix', t('suffix'), { cls: '' })}
            </div>`;
        case 'date':
          return `<div class="pgrid">
              ${C.select('props.source', t('dateSource'), [['now', t('dateNow')], ['order', t('dateOrder')]])}
              ${C.select('props.format', t('dateFormat'), [['YYYY/MM/DD', '2026/11/25'], ['DD/MM/YYYY', '25/11/2026'], ['YYYY-MM-DD', '2026-11-25'], ['YYYY/MM/DD HH:mm', '2026/11/25 14:30'], ['DD/MM/YYYY HH:mm', '25/11/2026 14:30'], ['DD/MM/YYYY hh:mm A', '25/11/2026 02:30 PM'], ['HH:mm', '14:30']])}
              ${C.text('props.prefix', t('prefix'))}
            </div>`;
        case 'image':
          return `<div class="pgrid">
              ${C.select('props.bind', t('bindTo'), [['', t('none')], ['store_logo', t('f.store_logo')]], { cls: 'full', rerender: true })}
              ${C.select('props.fit', t('fit'), [['contain', t('fitContain')], ['cover', t('fitCover')], ['fill', t('fitFill')]], { cls: 'full' })}
            </div>
            <div class="btn-row">
              <button type="button" class="btn small" data-action="upload">${E().icon('upload')}<span>${t('uploadImage')}</span></button>
              ${p.src ? `<button type="button" class="btn small danger-outline" data-action="removeImage">${E().icon('x')}<span>${t('removeImage')}</span></button>` : ''}
            </div>
            ${p.src ? `<img class="img-thumb" src="${esc(p.src)}" alt="">` : ''}`;
        case 'barcode':
          return `${C.area('props.value', t('barcodeValue'), { rows: 1, insert: true, ltr: true })}
            <div class="pgrid">
              ${C.select('props.format', t('barcodeFormat'), Barcode.FORMATS.map((f) => [f, f]))}
              ${C.check('props.showText', t('showText'))}
            </div>`;
        case 'qr':
          return `${C.area('props.value', t('qrValue'), { rows: 2, insert: true, ltr: true })}
            <div class="pgrid">${C.select('props.ecc', t('ecc'), [['L', 'L 7%'], ['M', 'M 15%'], ['Q', 'Q 25%'], ['H', 'H 30%']])}</div>`;
        case 'line':
          return `<div class="pgrid">
              ${C.select('props.orientation', t('lineOrientation'), [['h', t('horizontal')], ['v', t('vertical')]], { rerender: true })}
              ${C.select('props.lineStyle', t('lineStyle'), [['solid', t('solid')], ['dashed', t('dashed')], ['dotted', t('dotted')], ['double', t('double')]])}
              ${C.num('props.thickness', t('thickness'), { min: 0.05, step: 0.05 })}
            </div>`;
        case 'icon':
          return `<div class="icon-pick">${E().DESIGN_ICONS.map((n) => `<button type="button" class="icon-btn ${p.icon === n ? 'active' : ''}" data-set="props.icon" data-val="${n}" data-rr="1" title="${n}">${E().icon(n)}</button>`).join('')}</div>
            <div class="pgrid">${C.num('props.strokeWidth', t('strokeWidth').replace(' (mm)', ''), { min: 0.5, max: 4, step: 0.25 })}</div>`;
        case 'shape':
          return `<div class="pgrid">
              ${C.select('props.shape', t('shape'), E().SHAPES.map((s) => [s, s]), { cls: 'full' })}
              ${C.color('props.fill', t('fill'), { none: true })}
              ${C.color('props.stroke', t('stroke'))}
              ${C.num('props.strokeWidth', t('strokeWidth'), { min: 0, step: 0.1 })}
            </div>`;
        case 'table': {
          const keys = ['index', 'name', 'desc', 'qty', 'price', 'total'];
          const keyLbl = { index: '#', name: t('f.item_name'), desc: t('f.item_desc'), qty: t('f.item_qty'), price: t('f.item_price'), total: t('f.item_total') };
          const cols = (p.columns || []).map((c, i) => `<div class="col-row">
              <select data-path="props.columns.${i}.key">${keys.map((k) => `<option value="${k}">${esc(keyLbl[k])}</option>`).join('')}</select>
              <input type="text" data-path="props.columns.${i}.label" placeholder="${t('label')}">
              <input type="number" data-path="props.columns.${i}.width" data-type="num" min="1" max="100" step="1" title="${t('colWidth')}">
              <select data-path="props.columns.${i}.align"><option value="start">⇤</option><option value="center">↔</option><option value="end">⇥</option></select>
              <button type="button" class="icon-btn xs danger" data-action="delCol" data-arg="${i}">${E().icon('x')}</button>
            </div>`).join('');
          return `<div class="pf-head">${t('columns')}</div><div class="cols">${cols}</div>
            <button type="button" class="btn small" data-action="addCol">${E().icon('plus')}<span>${t('addColumn')}</span></button>
            <div class="pgrid">
              ${C.check('props.showHeader', t('showHeader'))}
              ${C.check('props.rowLines', t('rowLines'))}
              ${C.color('props.headerBg', t('headerBg'), { none: true })}
              ${C.color('props.lineColor', t('borderColor'))}
              ${C.num('props.cellPadding', t('padding'), { min: 0, step: 0.25 })}
            </div>`;
        }
        default: return '';
      }
    },

    /* --------------------------------------------------- value binding */
    read(path) {
      if (path.indexOf('tpl.') === 0) return getPath(Designer.tpl(), path.slice(4));
      if (path.indexOf('set.') === 0) return Settings.get(path.slice(4));
      const el = this.targets()[0]; if (!el) return undefined;
      if (path === '__visible') return !el.hidden;
      return getPath(el, path);
    },
    write(path, v) {
      if (path.indexOf('set.') === 0) { Settings.set(path.slice(4), v); Designer.render(); return; }
      if (path.indexOf('tpl.') === 0) { Designer.change((tpl) => setPath(tpl, path.slice(4), v)); if (path === 'tpl.name' || path === 'tpl.type') Designer.fillTemplateSelect(); return; }
      const sel = this.targets();
      Designer.change(() => sel.forEach((el) => {
        if (path === '__visible') { el.hidden = !v; return; }
        if (path === 'props.key' && el.type === 'field') {
          const prevLbl = E().fieldLabel(el.props.key);
          if (!el.props.label || el.props.label === prevLbl) el.props.label = E().fieldLabel(v);
        }
        setPath(el, path, v);
      }));
    },
    sync() {
      const root = this.root(); if (!root) return;
      root.querySelectorAll('[data-path]').forEach((inp) => {
        if (inp === document.activeElement && inp.type !== 'checkbox') return;
        const v = this.read(inp.dataset.path);
        if (inp.type === 'checkbox') inp.checked = inp.dataset.path === 'props.showLabel' || inp.dataset.path === 'props.showText' || inp.dataset.path === 'props.showHeader' ? v !== false : !!v;
        else if (inp.type === 'color') inp.value = /^#[0-9a-f]{6}$/i.test(v || '') ? v : (inp.dataset.path.indexOf('bg') >= 0 || inp.dataset.path.indexOf('Bg') >= 0 || inp.dataset.path.indexOf('fill') >= 0 ? '#ffffff' : '#000000');
        else if (inp.type === 'number') inp.value = v == null || v === '' ? '' : Math.round(Number(v) * 100) / 100;
        else inp.value = v == null ? '' : v;
        if (inp.type === 'color') { const chip = root.querySelector(`[data-clear="${inp.dataset.path}"]`); if (chip) chip.classList.toggle('active', !v); }
      });
      root.querySelectorAll('[data-out]').forEach((o) => { o.textContent = this.read(o.dataset.out); });
      root.querySelectorAll('[data-toggle]').forEach((b) => b.classList.toggle('active', !!this.read(b.dataset.toggle)));
      root.querySelectorAll('[data-set]').forEach((b) => b.classList.toggle('active', String(this.read(b.dataset.set)) === b.dataset.val));
      const preset = root.querySelector('[data-action-change="preset"]');
      if (preset) { const tpl = Designer.tpl(); const m = Templates.SIZES.find((s) => s.w === tpl.width && s.h === tpl.height); preset.value = m ? m.id : ''; }
    },
    focusContent() { const f = this.root().querySelector('.psec textarea, .psec select'); if (f) f.focus(); },

    init() {
      const root = this.root();
      root.addEventListener('input', (e) => {
        const inp = e.target; const path = inp.dataset.path; if (!path) return;
        let v;
        if (inp.dataset.type === 'num') { v = parseFloat(inp.value); if (isNaN(v)) return; }
        else if (inp.dataset.type === 'bool') v = inp.checked;
        else v = inp.value;
        if (['w', 'h'].includes(path)) v = Math.max(0.5, v);
        this.write(path, v);
        if (inp.dataset.rerender) this.render();
      });
      root.addEventListener('change', (e) => {
        const inp = e.target;
        if (inp.dataset.insert) {
          const key = inp.value; inp.value = ''; if (!key) return;
          const ta = root.querySelector(`[data-path="${inp.dataset.insert}"]`);
          const ins = '{{' + key + '}}';
          const s = ta.selectionStart != null ? ta.selectionStart : ta.value.length, en = ta.selectionEnd != null ? ta.selectionEnd : s;
          ta.value = ta.value.slice(0, s) + ins + ta.value.slice(en);
          this.write(inp.dataset.insert, ta.value);
          ta.focus(); ta.selectionStart = ta.selectionEnd = s + ins.length;
          return;
        }
        if (inp.dataset.actionChange === 'preset') {
          const s = Templates.SIZES.find((x) => x.id === inp.value); if (!s) return;
          Designer.change((tpl) => { tpl.width = s.w; tpl.height = s.h; }, { immediate: true });
          Designer.fit();
        }
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.toggle) { this.write(b.dataset.toggle, !this.read(b.dataset.toggle)); this.sync(); return; }
        if (b.dataset.set) {
          const cur = this.read(b.dataset.set); const v = typeof cur === 'number' ? Number(b.dataset.val) : b.dataset.val;
          this.write(b.dataset.set, v); if (b.dataset.rr) this.render(); else this.sync(); return;
        }
        if (b.dataset.clear) { this.write(b.dataset.clear, ''); this.sync(); return; }
        const a = b.dataset.action; if (!a) return;
        const sel = this.targets(); const el = sel[0];
        switch (a) {
          case 'delete': Designer.deleteSelected(); break;
          case 'hide': Designer.cmd('hide'); break;
          case 'lock': Designer.cmd('lock'); break;
          case 'align': Designer.align(b.dataset.arg); break;
          case 'layer': Designer.reorder(b.dataset.arg); break;
          case 'swapWH': Designer.change((tpl) => { const w = tpl.width; tpl.width = tpl.height; tpl.height = w; }, { immediate: true }); Designer.fit(); this.sync(); break;
          case 'setDefault': App.setDefaultTemplate(Designer.tpl()); this.render(); break;
          case 'upload':
            App.pickImage().then((src) => { if (!src) return; Designer.change(() => { el.props.src = src; el.props.bind = ''; }, { immediate: true, props: true }); });
            break;
          case 'removeImage': Designer.change(() => { el.props.src = ''; }, { immediate: true, props: true }); break;
          case 'addCol': Designer.change(() => { el.props.columns.push({ key: 'desc', label: t('f.item_desc'), width: 20, align: 'start' }); }, { immediate: true, props: true }); break;
          case 'delCol': Designer.change(() => { el.props.columns.splice(+b.dataset.arg, 1); }, { immediate: true, props: true }); break;
          default: break;
        }
      });
      // commit history when a field loses focus after typing
      root.addEventListener('focusout', () => Designer.flush());
    },
  };

  window.Properties = Properties;
})();
