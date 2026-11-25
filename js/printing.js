/* Printing: lays documents out on real paper sizes in millimetres (A4/A5/A6/Letter,
   80/58 mm thermal rolls, label-printer size or custom), tiles multiple receipts/stickers
   per page, handles copies, and prints through the browser with a dynamic @page size. */
(function () {
  'use strict';
  const PX = 96 / 25.4;
  const $ = (id) => document.getElementById(id);

  const PAPERS = {
    A4: [210, 297], A5: [148, 210], A6: [105, 148], Letter: [215.9, 279.4],
  };
  const PAPER_KEYS = ['auto', 'A4', 'A5', 'A6', 'Letter', 'roll80', 'roll58', 'doc', 'custom'];

  const Printing = {
    explicit: null, // order ids passed from the orders view

    ps() { return Settings.data.print; },
    template() { return App.getTemplate(this.ps().templateId) || App.currentTemplate(); },
    orderIds(ps) {
      ps = ps || this.ps();
      const all = Orders.sorted();
      switch (ps.source) {
        case 'blank': return [null];
        case 'all': return all.map((o) => o.id);
        case 'selected': {
          const ids = (this.explicit || Settings.get('selectedOrders') || []).filter((id) => all.some((o) => o.id === id));
          return ids;
        }
        default: { const o = Orders.current(); return o ? [o.id] : [null]; }
      }
    },
    autoPaper(tpl) {
      if (tpl.width <= 58.5) return 'roll58';
      if (tpl.width <= 80.5 && tpl.type === 'receipt') return 'roll80';
      if (tpl.type === 'sticker') return 'doc';
      for (const k of ['A6', 'A5', 'A4']) { const [w, h] = PAPERS[k]; if (Math.abs(tpl.width - w) < 1 && Math.abs(tpl.height - h) < 1) return k; }
      return 'A4';
    },

    /** Compute the page layout in mm. */
    layout(tpl, ps) {
      const paper = ps.paper === 'auto' ? this.autoPaper(tpl) : ps.paper;
      let m = Object.assign({ top: 0, right: 0, bottom: 0, left: 0 }, ps.margins);
      const gap = Math.max(0, Number(ps.gap) || 0);
      const dw = tpl.width, dh = tpl.height;
      let pw, ph, scale = 1, cols = 1, rows = 1, roll = false;
      if (paper === 'doc') { m = { top: 0, right: 0, bottom: 0, left: 0 }; pw = dw; ph = dh; }
      else if (paper === 'roll80' || paper === 'roll58') {
        roll = true; pw = paper === 'roll80' ? 80 : 58;
        const aw = pw - m.left - m.right;
        scale = ps.fit ? Math.min(1, aw / dw) : 1;
        ph = dh * scale + m.top + m.bottom;
      } else {
        if (paper === 'custom') { pw = Math.max(10, Number(ps.customW) || 100); ph = Math.max(10, Number(ps.customH) || 150); }
        else [pw, ph] = PAPERS[paper] || PAPERS.A4;
        if (ps.orientation === 'landscape') [pw, ph] = [ph, pw];
        const aw = pw - m.left - m.right, ah = ph - m.top - m.bottom;
        scale = ps.fit ? Math.min(1, aw / dw, ah / dh) : 1;
        if (ps.layout !== 'single') {
          cols = Math.max(1, Math.floor((aw + gap + 0.001) / (dw * scale + gap)));
          rows = Math.max(1, Math.floor((ah + gap + 0.001) / (dh * scale + gap)));
        }
      }
      const cw = dw * scale, ch = dh * scale;
      const tooBig = !ps.fit && paper !== 'doc' && (cw > pw - m.left - m.right + 0.01 || (!roll && ch > ph - m.top - m.bottom + 0.01));
      return { paper, pw: round(pw), ph: round(ph), m, gap, scale, cols, rows, per: cols * rows, cw, ch, roll, tooBig };
    },

    /** Build the list of document units (order × copies × template pages). */
    units(tpl, ids, copies) {
      const out = [];
      copies = Math.max(1, Math.min(500, parseInt(copies, 10) || 1));
      ids.forEach((id) => {
        const order = id ? App.state.orders.find((o) => o.id === id) : null;
        for (let c = 0; c < copies; c++) tpl.pages.forEach((p, pi) => out.push({ order, page: pi }));
      });
      return out;
    },

    buildSheets(tpl, ids, ps) {
      const L = this.layout(tpl, ps);
      const units = this.units(tpl, ids, ps.copies);
      const sheets = [];
      for (let i = 0; i < units.length; i += L.per) {
        const sheet = document.createElement('div');
        sheet.className = 'print-sheet';
        sheet.style.width = L.pw + 'mm'; sheet.style.height = L.ph + 'mm';
        units.slice(i, i + L.per).forEach((u, k) => {
          const col = k % L.cols, row = Math.floor(k / L.cols);
          const cell = document.createElement('div');
          cell.className = 'print-cell' + (ps.cutMarks ? ' cut' : '');
          cell.style.cssText = `left:${round(L.m.left + col * (L.cw + L.gap))}mm;top:${round(L.m.top + row * (L.ch + L.gap))}mm;width:${round(L.cw)}mm;height:${round(L.ch)}mm`;
          const holder = document.createElement('div');
          holder.className = 'print-doc';
          if (L.scale !== 1) holder.style.transform = `scale(${L.scale})`;
          const ctx = u.order ? { data: Orders.buildData(u.order, App.storeFor(tpl, u.order)) } : { data: Orders.buildData(null, App.storeFor(tpl, null)) };
          holder.appendChild(Elements.renderPage(tpl, u.page, ctx));
          cell.appendChild(holder);
          sheet.appendChild(cell);
        });
        sheets.push(sheet);
      }
      return { L, sheets, count: units.length };
    },

    async doPrint(tpl, ids, ps) {
      if (!tpl) return;
      if (!ids.length) { App.toast(t('nothingToPrint'), 'warn'); return; }
      const { L, sheets } = this.buildSheets(tpl, ids, ps);
      if (!sheets.length) { App.toast(t('nothingToPrint'), 'warn'); return; }
      if (L.tooBig) App.toast(t('docTooBig'), 'warn');
      const root = $('print-root');
      root.innerHTML = '';
      root.classList.toggle('bw', !!ps.bw);
      sheets.forEach((s) => root.appendChild(s));
      $('page-size-style').textContent = `@page { size: ${L.pw}mm ${L.ph}mm; margin: 0; }`;
      App.loading(true, t('preparingPrint'));
      try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        await Promise.all(Array.from(root.querySelectorAll('img')).map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve())));
      } finally { App.loading(false); }
      this._printing = true;
      window.print();
      this._printing = false;
    },
    /** Print using the print-view settings. */
    print() { const tpl = this.template(); return this.doPrint(tpl, this.orderIds(), this.ps()); },
    /** Print a given template + orders immediately (from orders list, data entry, Ctrl+P). */
    quickPrint(templateId, orderIds) {
      const tpl = App.getTemplate(templateId) || App.currentTemplate();
      const ps = Object.assign({}, this.ps());
      const ids = orderIds && orderIds.length ? orderIds : this.orderIds(Object.assign({}, ps, { source: 'current' }));
      return this.doPrint(tpl, ids, ps);
    },
    /** Make sure something sensible prints when the browser menu is used. */
    beforePrint() {
      if (this._printing) return;
      const tpl = App.isView('print') ? this.template() : App.currentTemplate();
      const ids = App.isView('print') ? this.orderIds() : this.orderIds(Object.assign({}, this.ps(), { source: 'current' }));
      if (!tpl || !ids.length) return;
      const { L, sheets } = this.buildSheets(tpl, ids, this.ps());
      const root = $('print-root'); root.innerHTML = ''; sheets.forEach((s) => root.appendChild(s));
      root.classList.toggle('bw', !!this.ps().bw);
      $('page-size-style').textContent = `@page { size: ${L.pw}mm ${L.ph}mm; margin: 0; }`;
    },

    openForOrders(ids, kind) {
      this.explicit = ids.slice();
      const ps = this.ps(); ps.source = 'selected'; ps.templateId = App.defaultTemplateId(kind); Settings.save();
      App.show('print');
    },
    openForTemplate(id) { const ps = this.ps(); ps.templateId = id; Settings.save(); App.show('print'); },

    /* ------------------------------------------------------ print view */
    renderSettings() {
      const ps = this.ps(); const tpl = this.template();
      const E = Elements; const esc = E.esc;
      const nSel = (this.explicit || Settings.get('selectedOrders') || []).filter((id) => App.state.orders.some((o) => o.id === id)).length;
      const cur = Orders.current();
      const grp = (type) => App.state.templates.filter((x) => x.type === type).map((x) => `<option value="${x.id}" ${tpl && x.id === tpl.id ? 'selected' : ''}>${esc(x.name)} (${x.width}×${x.height})</option>`).join('');
      const paperLbl = { auto: t('auto'), A4: 'A4 — 210×297', A5: 'A5 — 148×210', A6: 'A6 — 105×148', Letter: 'Letter — 216×279', roll80: t('roll80'), roll58: t('roll58'), doc: t('paperDoc'), custom: t('custom') };
      const L = tpl ? this.layout(tpl, ps) : null;
      const radio = (name, val, label) => `<label class="radio"><input type="radio" name="${name}" value="${val}" ${ps[name] === val ? 'checked' : ''}><span>${label}</span></label>`;
      $('print-settings').innerHTML = `
        <div class="panel-head"><span>${t('printTemplate')}</span></div>
        <div class="pad">
          <select data-ps="templateId" class="full-w"><optgroup label="${t('receipts')}">${grp('receipt')}</optgroup><optgroup label="${t('stickers')}">${grp('sticker')}</optgroup></select>
          <div class="row gap mt">
            <button class="btn small" data-psact="def-receipt">${E.icon('file')}<span>${t('useDefaultFor')}: ${t('receipt')}</span></button>
            <button class="btn small" data-psact="def-sticker">${E.icon('tag')}<span>${t('useDefaultFor')}: ${t('sticker')}</span></button>
          </div>
        </div>
        <div class="panel-head"><span>${t('printSource')}</span></div>
        <div class="pad stack">
          ${radio('source', 'current', `${t('srcCurrent')} <small class="muted">${cur ? esc(cur.order_number) : '—'}</small>`)}
          ${radio('source', 'selected', `${t('srcSelected')} <small class="muted">(${nSel})</small>`)}
          ${radio('source', 'all', `${t('srcAll')} <small class="muted">(${App.state.orders.length})</small>`)}
          ${radio('source', 'blank', t('srcBlank'))}
          <label class="pf"><span>${t('copies')}</span><input type="number" min="1" max="500" step="1" data-ps="copies" value="${ps.copies}"></label>
        </div>
        <div class="panel-head"><span>${t('paper')}</span></div>
        <div class="pad stack">
          <select data-ps="paper">${PAPER_KEYS.map((k) => `<option value="${k}" ${ps.paper === k ? 'selected' : ''}>${paperLbl[k]}${k === 'auto' && tpl ? ' → ' + (paperLbl[this.autoPaper(tpl)] || '') : ''}</option>`).join('')}</select>
          ${ps.paper === 'custom' ? `<div class="pgrid"><label class="pf"><span>${t('width')} (mm)</span><input type="number" data-ps="customW" value="${ps.customW}" min="10" step="1"></label><label class="pf"><span>${t('height')} (mm)</span><input type="number" data-ps="customH" value="${ps.customH}" min="10" step="1"></label></div>` : ''}
          <div class="seg" data-seg-ps="orientation">
            <button data-val="portrait" class="${ps.orientation !== 'landscape' ? 'active' : ''}">${t('portrait')}</button>
            <button data-val="landscape" class="${ps.orientation === 'landscape' ? 'active' : ''}">${t('landscape')}</button>
          </div>
          <div class="pf-head">${t('margins')}</div>
          <div class="pgrid g4">
            ${['top', 'right', 'bottom', 'left'].map((k) => `<label class="pf"><span>${t(k)}</span><input type="number" min="0" step="0.5" data-ps="margins.${k}" value="${ps.margins[k]}"></label>`).join('')}
          </div>
          <label class="pf"><span>${t('gap')}</span><input type="number" min="0" step="0.5" data-ps="gap" value="${ps.gap}"></label>
        </div>
        <div class="panel-head"><span>${t('layoutMode')}</span></div>
        <div class="pad stack">
          ${radio('layout', 'auto', t('layoutAuto'))}
          ${radio('layout', 'single', t('layoutSingle'))}
          <label class="pf-check"><input type="checkbox" data-ps="fit" ${ps.fit ? 'checked' : ''}><span>${t('fitToPaper')}</span></label>
          <label class="pf-check"><input type="checkbox" data-ps="cutMarks" ${ps.cutMarks ? 'checked' : ''}><span>${t('cutMarks')}</span></label>
          <label class="pf-check"><input type="checkbox" data-ps="bw" ${ps.bw ? 'checked' : ''}><span>${t('blackWhite')}</span></label>
          ${L && L.tooBig ? `<div class="warn-box">${t('docTooBig')}</div>` : ''}
        </div>`;
    },
    renderPreview() {
      if (!App.isView('print')) return;
      this.renderSettings();
      const tpl = this.template(); const stage = $('print-preview');
      if (!tpl) { stage.innerHTML = ''; return; }
      const ids = this.orderIds();
      const ps = this.ps();
      const { L, sheets, count } = this.buildSheets(tpl, ids, ps);
      $('print-summary').textContent = count ? t('printSummary', { docs: count, per: L.per, pages: sheets.length, w: L.pw, h: L.ph }) : t('nothingToPrint');
      stage.innerHTML = '';
      if (!sheets.length) { stage.innerHTML = `<div class="empty">${Elements.icon('printer', 'empty-ico')}<h3>${t('nothingToPrint')}</h3><p>${t('selectOrdersFirst')}</p></div>`; return; }
      const avail = Math.max(200, stage.clientWidth - 48);
      const availH = Math.max(200, stage.clientHeight - 80);
      const s = Math.min(1.4, avail / (L.pw * PX), sheets.length <= 2 ? availH / (L.ph * PX) : 9);
      const max = Math.min(sheets.length, 30);
      for (let i = 0; i < max; i++) {
        const holder = document.createElement('div');
        holder.className = 'sheet-holder' + (ps.bw ? ' bw' : '');
        holder.style.width = (L.pw * PX * s) + 'px'; holder.style.height = (L.ph * PX * s) + 'px';
        sheets[i].style.transform = `scale(${s})`; sheets[i].style.transformOrigin = '0 0';
        holder.appendChild(sheets[i]);
        const lbl = document.createElement('div'); lbl.className = 'sheet-label'; lbl.textContent = `${i + 1} / ${sheets.length}`;
        const wrap = document.createElement('div'); wrap.className = 'sheet-wrap'; wrap.appendChild(holder); wrap.appendChild(lbl);
        stage.appendChild(wrap);
      }
      if (sheets.length > max) { const more = document.createElement('div'); more.className = 'muted center pad'; more.textContent = `+ ${sheets.length - max}`; stage.appendChild(more); }
    },
    initView() {
      const box = $('print-settings');
      const setPath = (path, v) => { const ks = path.split('.'); let o = this.ps(); while (ks.length > 1) o = o[ks.shift()]; o[ks[0]] = v; Settings.save(); };
      box.addEventListener('change', (e) => {
        const el = e.target;
        if (el.name === 'source') { this.explicit = el.value === 'selected' ? this.explicit : null; setPath('source', el.value); }
        else if (el.name === 'layout') setPath('layout', el.value);
        else if (el.dataset.ps) {
          const v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
          setPath(el.dataset.ps, v);
        } else return;
        this.renderPreview();
      });
      box.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        const seg = b.closest('[data-seg-ps]');
        if (seg) { setPath(seg.dataset.segPs, b.dataset.val); this.renderPreview(); return; }
        if (b.dataset.psact === 'def-receipt') { setPath('templateId', App.defaultTemplateId('receipt')); this.renderPreview(); }
        if (b.dataset.psact === 'def-sticker') { setPath('templateId', App.defaultTemplateId('sticker')); this.renderPreview(); }
      });
      $('pr-print').addEventListener('click', () => this.print());
      window.addEventListener('beforeprint', () => this.beforePrint());
      new ResizeObserver(() => { if (App.isView('print')) { clearTimeout(this._rt); this._rt = setTimeout(() => this.renderPreview(), 150); } }).observe($('print-preview'));
    },
  };
  function round(n) { return Math.round(n * 100) / 100; }

  window.Printing = Printing;
})();
