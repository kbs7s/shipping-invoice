/* Visual design canvas: selection, drag, resize (rotation-aware), rotate, snapping and smart guides,
   rulers, grid, zoom, undo/redo, clipboard, alignment, layers, pages and context menus. */
(function () {
  'use strict';
  const PX = 96 / 25.4;
  const $ = (id) => document.getElementById(id);
  const PALETTE = ['text', 'field', 'image', 'barcode', 'qr', 'line', 'rect', 'icon', 'shape', 'static', 'date', 'calc', 'table'];

  const Designer = {
    zoom: 1, pageIndex: 0, selection: [], clipboard: null, histories: {}, drag: null, guides: [], editingId: null, dirty: true, cursor: null,

    /* ---------------------------------------------------------- basics */
    tpl() { return App.currentTemplate(); },
    page() { const t = this.tpl(); if (!t) return null; if (this.pageIndex >= t.pages.length) this.pageIndex = t.pages.length - 1; return t.pages[Math.max(0, this.pageIndex)]; },
    els() { const p = this.page(); return p ? p.elements : []; },
    getEl(id) { return this.els().find((e) => e.id === id); },
    selected() { return this.selection.map((id) => this.getEl(id)).filter(Boolean); },
    primary() { return this.selected()[0] || null; },
    S() { return Settings.data; },
    ctx() {
      const tpl = this.tpl();
      if (this.S().showPlaceholders) return { editor: true, raw: true };
      const o = Orders.current();
      const pid = Settings.get('previewOrderId');
      const order = pid ? o : null;
      return { editor: true, data: Orders.buildData(order, App.storeFor(tpl, order)) };
    },

    /* ------------------------------------------------------------ init */
    init() {
      this.zoom = this.S().zoom || 1;
      this.buildPalette();
      this.bindToolbar();
      this.bindStage();
      let lastW = 0;
      new ResizeObserver((en) => {
        const w = en[0].contentRect.width;
        if (lastW && Math.abs(w - lastW) > 120 && App.isView('designer')) { clearTimeout(this._fitT); this._fitT = setTimeout(() => this.fit(), 120); }
        if (w) lastW = w;
        this.drawRulers();
      }).observe($('ed-stage'));
      $('ed-scroll').addEventListener('scroll', () => this.drawRulers());
      $('toggle-left').addEventListener('click', () => $('view-designer').classList.toggle('show-left'));
      $('toggle-right').addEventListener('click', () => $('view-designer').classList.toggle('show-right'));
    },
    buildPalette() {
      const pal = $('palette');
      pal.innerHTML = PALETTE.map((tp) => `<button class="pal-btn" draggable="true" data-type="${tp}" title="${t('el.' + tp)}">${Elements.icon(Elements.TYPES[tp].icon)}<span>${t('el.' + tp)}</span></button>`).join('');
      pal.onclick = (e) => { const b = e.target.closest('[data-type]'); if (!b) return; this.addElement(b.dataset.type); if (window.innerWidth <= 1100) $('view-designer').classList.remove('show-left'); };
      pal.ondragstart = (e) => { const b = e.target.closest('[data-type]'); if (b) { e.dataTransfer.setData('text/x-dd-type', b.dataset.type); e.dataTransfer.effectAllowed = 'copy'; } };
    },
    bindToolbar() {
      $('ed-toolbar').addEventListener('click', (e) => {
        const b = e.target.closest('[data-cmd]'); if (!b) return;
        this.cmd(b.dataset.cmd);
      });
      $('ed-template-select').addEventListener('change', (e) => App.openTemplate(e.target.value));
      $('ed-order-select').addEventListener('change', (e) => { Settings.set('previewOrderId', e.target.value || null); App.emit('order-switch'); });
    },
    cmd(c) {
      const S = this.S();
      switch (c) {
        case 'undo': return this.undo();
        case 'redo': return this.redo();
        case 'zoomIn': return this.setZoom(this.zoom * 1.25);
        case 'zoomOut': return this.setZoom(this.zoom / 1.25);
        case 'zoomReset': return this.setZoom(1);
        case 'zoomFit': return this.fit();
        case 'toggleGrid': Settings.set('showGrid', !S.showGrid); return this.render();
        case 'toggleSnap': Settings.set('snap', !S.snap); return this.syncToolbar();
        case 'toggleRulers': Settings.set('showRulers', !S.showRulers); this.syncToolbar(); return this.drawRulers();
        case 'togglePlaceholders': Settings.set('showPlaceholders', !S.showPlaceholders); return this.render();
        case 'duplicate': return this.duplicate();
        case 'delete': return this.deleteSelected();
        case 'copy': return this.copy();
        case 'paste': return this.paste();
        case 'cut': this.copy(); return this.deleteSelected();
        case 'selectAll': this.selection = this.els().filter((e) => !e.hidden).map((e) => e.id); return this.afterSelect();
        case 'front': case 'back': case 'forward': case 'backward': return this.reorder(c);
        case 'lock': return this.change(() => { const v = !this.selected().every((e) => e.locked); this.selected().forEach((e) => { e.locked = v; }); }, { props: true });
        case 'hide': return this.change(() => { const v = !this.selected().every((e) => e.hidden); this.selected().forEach((e) => { e.hidden = v; }); }, { props: true });
        default:
          if (/^align|^distribute/.test(c)) return this.align(c);
      }
    },

    /* -------------------------------------------------------- history */
    hist() {
      const tpl = this.tpl(); if (!tpl) return null;
      if (!this.histories[tpl.id]) this.histories[tpl.id] = { stack: [JSON.stringify(tpl)], i: 0 };
      return this.histories[tpl.id];
    },
    commit() {
      clearTimeout(this._ct); this._ct = null;
      const h = this.hist(); if (!h) return;
      const s = JSON.stringify(this.tpl());
      if (h.stack[h.i] === s) return;
      h.stack = h.stack.slice(0, h.i + 1); h.stack.push(s);
      if (h.stack.length > 150) h.stack.shift();
      h.i = h.stack.length - 1;
      this.syncToolbar();
    },
    commitSoon() { clearTimeout(this._ct); this._ct = setTimeout(() => this.commit(), 400); },
    flush() { if (this._ct) this.commit(); },
    undo() { this.flush(); const h = this.hist(); if (h && h.i > 0) { h.i--; this.restore(h.stack[h.i]); } },
    redo() { this.flush(); const h = this.hist(); if (h && h.i < h.stack.length - 1) { h.i++; this.restore(h.stack[h.i]); } },
    restore(json) {
      const obj = JSON.parse(json);
      App.replaceTemplate(obj);
      this.selection = this.selection.filter((id) => this.getEl(id));
      this.render(); Properties.render(); App.saveTemplateSoon(obj); this.syncToolbar();
    },

    /** Central mutation entry point: mutate, re-render, autosave, record history. */
    change(fn, opts) {
      opts = opts || {};
      const tpl = this.tpl(); if (!tpl) return;
      fn(tpl);
      tpl.updatedAt = Date.now();
      this.render();
      App.saveTemplateSoon(tpl);
      if (opts.commit !== false) (opts.immediate ? this.commit() : this.commitSoon());
      if (opts.props) Properties.render(); else Properties.sync();
    },

    /* ------------------------------------------------------- rendering */
    open() {
      this.pageIndex = 0; this.selection = [];
      this.hist();
      this.fillTemplateSelect();
      this.render(); Properties.render();
      requestAnimationFrame(() => this.fit());
    },
    fillTemplateSelect() {
      const sel = $('ed-template-select'); const cur = this.tpl();
      const grp = (type) => App.state.templates.filter((x) => x.type === type).map((x) => `<option value="${x.id}" ${cur && x.id === cur.id ? 'selected' : ''}>${Elements.esc(x.name)}</option>`).join('');
      sel.innerHTML = `<optgroup label="${t('receipts')}">${grp('receipt')}</optgroup><optgroup label="${t('stickers')}">${grp('sticker')}</optgroup>`;
      Orders.fillOrderSelect($('ed-order-select'), true);
    },
    render() {
      const tpl = this.tpl();
      if (!tpl) return;
      if (!App.isView('designer')) { this.dirty = true; return; }
      this.dirty = false;
      const pageEl = $('ed-page');
      if (this.editingId) return; // do not destroy the inline editor
      Elements.renderPage(tpl, this.pageIndex, this.ctx(), pageEl);
      pageEl.classList.toggle('show-grid', !!this.S().showGrid);
      const g = Number(this.S().gridSize) || 1;
      pageEl.style.setProperty('--grid', g + 'mm');
      pageEl.style.setProperty('--grid-major', (g * 10) + 'mm');
      this.applyZoom();
      this.renderOverlay();
      this.renderLayers();
      this.renderPageTabs();
      this.syncToolbar();
      this.updateStatus();
    },
    applyZoom() {
      const tpl = this.tpl(); if (!tpl) return;
      const z = this.zoom;
      const wrap = $('ed-page-wrap');
      wrap.style.width = (tpl.width * PX * z) + 'px';
      wrap.style.height = (tpl.height * PX * z) + 'px';
      wrap.style.setProperty('--z', z);
      wrap.style.setProperty('--iz', 1 / z);
      [$('ed-page'), $('ed-overlay')].forEach((n) => { n.style.transform = `scale(${z})`; });
      const ov = $('ed-overlay'); ov.style.width = tpl.width + 'mm'; ov.style.height = tpl.height + 'mm';
      $('zoom-label').textContent = Math.round(z * 100) + '%';
      this.drawRulers();
    },
    setZoom(z, anchor) {
      z = Math.max(0.1, Math.min(8, z));
      const sc = $('ed-scroll');
      let keep = null;
      if (anchor) {
        const r = $('ed-page').getBoundingClientRect();
        keep = { mx: (anchor.x - r.left) / (PX * this.zoom), my: (anchor.y - r.top) / (PX * this.zoom), cx: anchor.x, cy: anchor.y };
      }
      this.zoom = z; Settings.set('zoom', z);
      this.applyZoom(); this.renderOverlay();
      if (keep) {
        const r = $('ed-page').getBoundingClientRect();
        sc.scrollLeft += (r.left + keep.mx * PX * z) - keep.cx;
        sc.scrollTop += (r.top + keep.my * PX * z) - keep.cy;
      }
      this.drawRulers();
    },
    fit() {
      const tpl = this.tpl(); if (!tpl) return;
      const sc = $('ed-scroll');
      const aw = sc.clientWidth - 80, ah = sc.clientHeight - 80;
      if (aw <= 0 || ah <= 0) return;
      this.setZoom(Math.min(aw / (tpl.width * PX), ah / (tpl.height * PX), 4));
    },
    syncToolbar() {
      const S = this.S();
      const tb = $('ed-toolbar');
      const set = (c, on) => { const b = tb.querySelector(`[data-cmd="${c}"]`); if (b) b.classList.toggle('active', !!on); };
      set('toggleGrid', S.showGrid); set('toggleSnap', S.snap); set('toggleRulers', S.showRulers); set('togglePlaceholders', S.showPlaceholders);
      const h = this.hist();
      tb.querySelector('[data-cmd="undo"]').disabled = !h || h.i <= 0;
      tb.querySelector('[data-cmd="redo"]').disabled = !h || h.i >= h.stack.length - 1;
      const n = this.selection.length;
      ['duplicate', 'delete', 'alignLeft', 'alignCenterH', 'alignRight', 'alignTop', 'alignMiddle', 'alignBottom'].forEach((c) => { tb.querySelector(`[data-cmd="${c}"]`).disabled = n === 0; });
      ['distributeH', 'distributeV'].forEach((c) => { tb.querySelector(`[data-cmd="${c}"]`).disabled = n < 3; });
      $('ed-stage').classList.toggle('no-rulers', !S.showRulers);
    },

    renderOverlay() {
      const ov = $('ed-overlay'); if (!ov) return;
      let html = '';
      const sel = this.selected();
      const single = sel.length === 1;
      for (const el of sel) {
        const prim = el === sel[0];
        html += `<div class="sel-box${prim ? ' primary' : ''}${el.locked ? ' locked' : ''}" style="left:${el.x}mm;top:${el.y}mm;width:${el.w}mm;height:${el.h}mm;transform:rotate(${el.rot || 0}deg)">`;
        if (single && !el.locked) {
          ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((h) => { html += `<div class="handle h-${h}" data-h="${h}"></div>`; });
          html += '<div class="rot-stem"></div><div class="handle h-rot" data-h="rot" title="' + t('rotation') + '"></div>';
        }
        if (this.drag && this.drag.kind !== 'marquee' && prim) {
          const lbl = this.drag.kind === 'rotate' ? `${Math.round(el.rot || 0)}°` : this.drag.kind === 'resize' ? `${Elements.round(el.w, 1)} × ${Elements.round(el.h, 1)}` : `${Elements.round(el.x, 1)}, ${Elements.round(el.y, 1)}`;
          html += `<div class="sel-tip">${lbl}</div>`;
        }
        html += '</div>';
      }
      for (const g of this.guides) {
        html += g.axis === 'x' ? `<div class="guide gx" style="left:${g.pos}mm"></div>` : `<div class="guide gy" style="top:${g.pos}mm"></div>`;
      }
      if (this.drag && this.drag.kind === 'marquee' && this.drag.rect) {
        const r = this.drag.rect; html += `<div class="marquee" style="left:${r.x}mm;top:${r.y}mm;width:${r.w}mm;height:${r.h}mm"></div>`;
      }
      ov.innerHTML = html;
    },
    renderLayers() {
      const ul = $('layers'); const els = this.els();
      $('layer-count').textContent = els.length ? '(' + els.length + ')' : '';
      const sel = new Set(this.selection);
      ul.innerHTML = els.slice().reverse().map((el) => `
        <li class="layer${sel.has(el.id) ? ' active' : ''}${el.hidden ? ' dim' : ''}" data-id="${el.id}">
          ${Elements.icon((Elements.TYPES[el.type] || Elements.TYPES[el.props && el.props.static ? 'static' : 'text']).icon)}
          <span class="layer-name">${Elements.esc(el.name || t('el.' + el.type))}</span>
          <button class="icon-btn xs" data-lact="hide" title="${t('visible')}">${Elements.icon(el.hidden ? 'eyeOff' : 'eye')}</button>
          <button class="icon-btn xs" data-lact="lock" title="${t('locked')}">${Elements.icon(el.locked ? 'lock' : 'unlock')}</button>
        </li>`).join('') || `<li class="muted small pad">${t('emptyPageHint')}</li>`;
      ul.onclick = (e) => {
        const li = e.target.closest('li[data-id]'); if (!li) return;
        const id = li.dataset.id; const b = e.target.closest('[data-lact]');
        if (b) { const el = this.getEl(id); this.change(() => { if (b.dataset.lact === 'hide') el.hidden = !el.hidden; else el.locked = !el.locked; }, { props: true, immediate: true }); return; }
        if (e.shiftKey || e.ctrlKey || e.metaKey) this.toggleSelect(id); else this.selection = [id];
        this.afterSelect();
      };
    },
    renderPageTabs() {
      const tpl = this.tpl(); const box = $('page-tabs');
      box.innerHTML = tpl.pages.map((p, i) => `<button class="page-tab${i === this.pageIndex ? ' active' : ''}" data-p="${i}">${t('page')} ${i + 1}</button>`).join('') +
        `<button class="icon-btn xs" data-pact="add" title="${t('addPage')}">${Elements.icon('plus')}</button>` +
        `<button class="icon-btn xs" data-pact="dup" title="${t('duplicatePage')}">${Elements.icon('copy')}</button>` +
        (tpl.pages.length > 1 ? `<button class="icon-btn xs danger" data-pact="del" title="${t('deletePage')}">${Elements.icon('trash')}</button>` : '');
      box.onclick = (e) => {
        const p = e.target.closest('[data-p]');
        if (p) { this.pageIndex = +p.dataset.p; this.selection = []; this.render(); Properties.render(); return; }
        const a = e.target.closest('[data-pact]'); if (!a) return;
        if (a.dataset.pact === 'add') this.change((tp) => { tp.pages.push({ id: Elements.uid('pg'), elements: [] }); this.pageIndex = tp.pages.length - 1; }, { immediate: true, props: true });
        if (a.dataset.pact === 'dup') this.change((tp) => { const c = Elements.clone(tp.pages[this.pageIndex]); c.id = Elements.uid('pg'); c.elements.forEach((el) => { el.id = Elements.uid('el'); }); tp.pages.splice(this.pageIndex + 1, 0, c); this.pageIndex++; }, { immediate: true, props: true });
        if (a.dataset.pact === 'del') App.confirm(t('deletePage') + '?', { danger: true }).then((ok) => { if (ok) this.change((tp) => { tp.pages.splice(this.pageIndex, 1); this.pageIndex = Math.max(0, this.pageIndex - 1); this.selection = []; }, { immediate: true, props: true }); });
      };
    },
    updateStatus() {
      const tpl = this.tpl(); if (!tpl) return;
      const p = this.primary();
      const parts = [];
      const L = (s) => `<bdi dir="ltr">${s}</bdi>`;
      if (this.cursor) parts.push(L(`X ${this.cursor.x.toFixed(1)} · Y ${this.cursor.y.toFixed(1)} mm`));
      if (p) parts.push(`${Elements.esc(p.name || '')}: ` + L(`${Elements.round(p.x, 1)}, ${Elements.round(p.y, 1)} — ${Elements.round(p.w, 1)} × ${Elements.round(p.h, 1)} mm${p.rot ? ' · ' + Elements.round(p.rot, 1) + '°' : ''}`));
      if (this.selection.length > 1) parts.push(this.selection.length + ' ' + t('multiSelected'));
      parts.push(`${t('page')}: ` + L(`${tpl.width} × ${tpl.height} mm`));
      $('ed-status').innerHTML = parts.map((x) => `<span>${x}</span>`).join('');
    },

    /* ---------------------------------------------------------- rulers */
    drawRulers() {
      if (!App.isView('designer') || !this.S().showRulers) return;
      const tpl = this.tpl(); if (!tpl) return;
      const pr = $('ed-page').getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const css = getComputedStyle(document.documentElement);
      const bg = css.getPropertyValue('--ruler-bg').trim() || '#f3f4f6';
      const fg = css.getPropertyValue('--ruler-fg').trim() || '#6b7280';
      const pageBg = css.getPropertyValue('--ruler-page').trim() || '#fff';
      const acc = css.getPropertyValue('--accent').trim() || '#2563eb';
      const pxmm = PX * this.zoom;
      const minor = [0.5, 1, 2, 5, 10, 20, 50].find((s) => s * pxmm >= 5) || 50;
      const major = [5, 10, 20, 50, 100, 200, 500].find((s) => s * pxmm >= 45) || 500;
      const sel = this.selected();
      const bb = sel.length ? this.bbox(sel) : null;
      const draw = (cv, horiz) => {
        const r = cv.getBoundingClientRect();
        const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
        if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
        const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.fillStyle = bg; c.fillRect(0, 0, W, H);
        const origin = horiz ? pr.left - r.left : pr.top - r.top;
        const len = horiz ? W : H; const thick = horiz ? H : W;
        const pageLen = (horiz ? tpl.width : tpl.height) * pxmm;
        c.fillStyle = pageBg;
        if (horiz) c.fillRect(origin, 0, pageLen, H); else c.fillRect(0, origin, W, pageLen);
        if (bb) {
          c.fillStyle = acc + '33';
          const a = origin + (horiz ? bb.x : bb.y) * pxmm, b = (horiz ? bb.w : bb.h) * pxmm;
          if (horiz) c.fillRect(a, 0, b, H); else c.fillRect(0, a, W, b);
        }
        c.strokeStyle = fg; c.fillStyle = fg; c.lineWidth = 1; c.font = '10px system-ui, sans-serif';
        const startMM = Math.floor(-origin / pxmm / minor) * minor;
        const endMM = (len - origin) / pxmm;
        c.beginPath();
        for (let mm = startMM; mm <= endMM; mm = Math.round((mm + minor) * 1000) / 1000) {
          const pos = Math.round(origin + mm * pxmm) + 0.5;
          const isMajor = Math.abs(mm / major - Math.round(mm / major)) < 1e-6;
          const isMid = !isMajor && Math.abs(mm / (major / 2) - Math.round(mm / (major / 2))) < 1e-6;
          const tl = isMajor ? thick * 0.6 : isMid ? thick * 0.4 : thick * 0.22;
          if (horiz) { c.moveTo(pos, H); c.lineTo(pos, H - tl); } else { c.moveTo(W, pos); c.lineTo(W - tl, pos); }
          if (isMajor) {
            if (horiz) c.fillText(String(Math.round(mm)), pos + 2, 10);
            else { c.save(); c.translate(9, pos + 2); c.rotate(-Math.PI / 2); c.textAlign = 'right'; c.fillText(String(Math.round(mm)), 0, 0); c.restore(); }
          }
        }
        c.stroke();
        if (this.cursor) {
          const pos = origin + (horiz ? this.cursor.x : this.cursor.y) * pxmm;
          c.strokeStyle = acc; c.beginPath();
          if (horiz) { c.moveTo(pos, 0); c.lineTo(pos, H); } else { c.moveTo(0, pos); c.lineTo(W, pos); }
          c.stroke();
        }
      };
      draw($('ruler-h'), true); draw($('ruler-v'), false);
    },

    /* ------------------------------------------------------- selection */
    toggleSelect(id) { const i = this.selection.indexOf(id); if (i >= 0) this.selection.splice(i, 1); else this.selection.push(id); },
    afterSelect() { this.renderOverlay(); this.renderLayers(); this.syncToolbar(); this.updateStatus(); this.drawRulers(); Properties.render(); },
    select(ids) { this.selection = ids.slice(); this.afterSelect(); },
    bbox(list) {
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      list.forEach((e) => { x1 = Math.min(x1, e.x); y1 = Math.min(y1, e.y); x2 = Math.max(x2, e.x + e.w); y2 = Math.max(y2, e.y + e.h); });
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    },

    /* --------------------------------------------------- element ops */
    addElement(type, at) {
      const tpl = this.tpl(); if (!tpl) return;
      const el = Elements.create(type);
      if (tpl.defaultFont) el.style.fontFamily = tpl.defaultFont;
      el.w = Math.min(el.w, tpl.width - 4); el.h = Math.min(el.h, tpl.height - 4);
      if (type === 'line') el.w = Math.max(10, tpl.width - 10);
      if (at) { el.x = at.x - el.w / 2; el.y = at.y - el.h / 2; }
      else {
        const sc = $('ed-scroll'); const pr = $('ed-page').getBoundingClientRect(); const sr = sc.getBoundingClientRect();
        const cx = ((sr.left + sr.width / 2) - pr.left) / (PX * this.zoom), cy = ((sr.top + sr.height / 2) - pr.top) / (PX * this.zoom);
        el.x = cx - el.w / 2; el.y = cy - el.h / 2;
        const n = this.els().length % 6; el.x += n * 2; el.y += n * 2;
      }
      el.x = Elements.round(Math.max(0, Math.min(tpl.width - el.w, el.x)), 1);
      el.y = Elements.round(Math.max(0, Math.min(tpl.height - el.h, el.y)), 1);
      this.selection = [el.id];
      this.change(() => { this.page().elements.push(el); }, { immediate: true, props: true });
      return el;
    },
    deleteSelected() {
      if (!this.selection.length) return;
      const ids = new Set(this.selection);
      this.selection = [];
      this.change(() => { const p = this.page(); p.elements = p.elements.filter((e) => !ids.has(e.id)); }, { immediate: true, props: true });
    },
    duplicate() {
      const sel = this.selected(); if (!sel.length) return;
      const clones = sel.map((e) => Object.assign(Elements.clone(e), { id: Elements.uid('el'), x: e.x + 3, y: e.y + 3, locked: false }));
      this.selection = clones.map((c) => c.id);
      this.change(() => { this.page().elements.push(...clones); }, { immediate: true, props: true });
    },
    copy() {
      const sel = this.selected(); if (!sel.length) return;
      this.clipboard = Elements.clone(sel); this.pasteCount = 0;
      try { sessionStorage.setItem('dd.clip', JSON.stringify(this.clipboard)); } catch (e) { /* ignore */ }
      App.toast(t('copied'));
    },
    paste() {
      let clip = this.clipboard;
      if (!clip) { try { clip = JSON.parse(sessionStorage.getItem('dd.clip') || 'null'); } catch (e) { clip = null; } }
      if (!clip || !clip.length) return;
      this.pasteCount = (this.pasteCount || 0) + 1;
      const off = 3 * this.pasteCount;
      const clones = clip.map((e) => Object.assign(Elements.clone(e), { id: Elements.uid('el'), x: e.x + off, y: e.y + off }));
      this.selection = clones.map((c) => c.id);
      this.change(() => { this.page().elements.push(...clones); }, { immediate: true, props: true });
    },
    reorder(how) {
      const ids = new Set(this.selection); if (!ids.size) return;
      this.change(() => {
        const arr = this.page().elements;
        const sel = arr.filter((e) => ids.has(e.id)); const rest = arr.filter((e) => !ids.has(e.id));
        if (how === 'front') { this.page().elements = rest.concat(sel); return; }
        if (how === 'back') { this.page().elements = sel.concat(rest); return; }
        if (how === 'forward') { for (let i = arr.length - 2; i >= 0; i--) if (ids.has(arr[i].id) && !ids.has(arr[i + 1].id)) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; } }
        if (how === 'backward') { for (let i = 1; i < arr.length; i++) if (ids.has(arr[i].id) && !ids.has(arr[i - 1].id)) { [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]; } }
      }, { immediate: true });
    },
    align(c) {
      const sel = this.selected().filter((e) => !e.locked); if (!sel.length) return;
      const tpl = this.tpl();
      const ref = sel.length === 1 ? { x: 0, y: 0, w: tpl.width, h: tpl.height } : this.bbox(sel);
      this.change(() => {
        if (c === 'distributeH' || c === 'distributeV') {
          if (sel.length < 3) return;
          const hz = c === 'distributeH'; const k = hz ? 'x' : 'y', d = hz ? 'w' : 'h';
          const s = sel.slice().sort((a, b) => a[k] - b[k]);
          const total = (s[s.length - 1][k] + s[s.length - 1][d]) - s[0][k];
          const gap = (total - s.reduce((a, e) => a + e[d], 0)) / (s.length - 1);
          let pos = s[0][k];
          s.forEach((e) => { e[k] = Elements.round(pos, 2); pos += e[d] + gap; });
          return;
        }
        sel.forEach((e) => {
          if (c === 'alignLeft') e.x = ref.x;
          if (c === 'alignCenterH') e.x = ref.x + (ref.w - e.w) / 2;
          if (c === 'alignRight') e.x = ref.x + ref.w - e.w;
          if (c === 'alignTop') e.y = ref.y;
          if (c === 'alignMiddle') e.y = ref.y + (ref.h - e.h) / 2;
          if (c === 'alignBottom') e.y = ref.y + ref.h - e.h;
          e.x = Elements.round(e.x, 2); e.y = Elements.round(e.y, 2);
        });
      }, { immediate: true });
    },
    nudge(dx, dy) {
      const sel = this.selected().filter((e) => !e.locked); if (!sel.length) return;
      this.change(() => sel.forEach((e) => { e.x = Elements.round(e.x + dx, 2); e.y = Elements.round(e.y + dy, 2); }));
    },

    /* --------------------------------------------------- pointer input */
    toMM(e) {
      const r = $('ed-page').getBoundingClientRect();
      return { x: (e.clientX - r.left) / (PX * this.zoom), y: (e.clientY - r.top) / (PX * this.zoom) };
    },
    bindStage() {
      const sc = $('ed-scroll');
      sc.addEventListener('pointerdown', (e) => this.onDown(e));
      sc.addEventListener('pointermove', (e) => this.onMove(e));
      sc.addEventListener('pointerup', (e) => this.onUp(e));
      sc.addEventListener('pointercancel', (e) => this.onUp(e));
      sc.addEventListener('pointerleave', () => { if (!this.drag) { this.cursor = null; this.drawRulers(); } });
      sc.addEventListener('dblclick', (e) => this.onDbl(e));
      sc.addEventListener('contextmenu', (e) => this.onContext(e));
      sc.addEventListener('wheel', (e) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        this.setZoom(this.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), { x: e.clientX, y: e.clientY });
      }, { passive: false });
      sc.addEventListener('dragover', (e) => { if (e.dataTransfer.types.includes('text/x-dd-type')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
      sc.addEventListener('drop', (e) => {
        const type = e.dataTransfer.getData('text/x-dd-type'); if (!type) return;
        e.preventDefault(); this.addElement(type, this.toMM(e));
      });
    },
    /* touch: two fingers pinch-zoom, one finger on empty space pans, long press opens the menu */
    touchDown(e) {
      this.touches = this.touches || new Map();
      this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.touches.size === 2) {
        clearTimeout(this._lp);
        if (this.drag && this.drag.kind === 'move' && this.drag.moved) this.change(() => {}, { immediate: true });
        const [a, b] = Array.from(this.touches.values());
        this.drag = { kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: this.zoom };
        try { $('ed-scroll').setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        e.preventDefault();
        return true;
      }
      return false;
    },
    onDown(e) {
      if (e.pointerType === 'touch' && this.touchDown(e)) return;
      if (e.button !== 0 || this.editingId) return;
      if (e.target.closest('.el-text[contenteditable="true"]')) return;
      const m = this.toMM(e);
      const handle = e.target.closest('.handle');
      const prim = this.primary();
      if (handle && prim) {
        e.preventDefault(); $('ed-scroll').setPointerCapture(e.pointerId);
        const h = handle.dataset.h;
        this.drag = h === 'rot'
          ? { kind: 'rotate', id: prim.id, start: m, cx: prim.x + prim.w / 2, cy: prim.y + prim.h / 2 }
          : { kind: 'resize', id: prim.id, dir: h, start: m, orig: Elements.clone(prim) };
        return;
      }
      const node = e.target.closest('#ed-page .el');
      if (node) {
        e.preventDefault();
        const id = node.dataset.id;
        if (e.shiftKey || e.ctrlKey || e.metaKey) { this.toggleSelect(id); this.afterSelect(); if (!this.selection.includes(id)) return; }
        else if (!this.selection.includes(id)) { this.selection = [id]; this.afterSelect(); }
        $('ed-scroll').setPointerCapture(e.pointerId);
        const movable = this.selected().filter((x) => !x.locked);
        this.drag = { kind: 'move', start: m, sx: e.clientX, sy: e.clientY, moved: false, origs: movable.map((x) => ({ id: x.id, x: x.x, y: x.y, w: x.w, h: x.h })) };
        if (e.pointerType === 'touch') {
          clearTimeout(this._lp);
          const cx = e.clientX, cy = e.clientY;
          this._lp = setTimeout(() => { if (this.drag && this.drag.kind === 'move' && !this.drag.moved) { this.drag = null; this.onContext({ preventDefault() {}, target: node, clientX: cx, clientY: cy }); } }, 550);
        }
        return;
      }
      if (e.target.closest('.ed-workspace')) {
        e.preventDefault();
        if (!(e.shiftKey || e.ctrlKey || e.metaKey)) { if (this.selection.length) { this.selection = []; this.afterSelect(); } }
        $('ed-scroll').setPointerCapture(e.pointerId);
        if (e.pointerType === 'touch') { const sc = $('ed-scroll'); this.drag = { kind: 'pan', sx: e.clientX, sy: e.clientY, sl: sc.scrollLeft, st: sc.scrollTop }; return; }
        this.drag = { kind: 'marquee', start: m, base: this.selection.slice(), rect: null };
      }
    },
    onMove(e) {
      if (e.pointerType === 'touch' && this.touches && this.touches.has(e.pointerId)) this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.drag && this.drag.kind === 'pinch') {
        if (this.touches.size < 2) return;
        const [a, b] = Array.from(this.touches.values());
        this.setZoom(this.drag.z0 * Math.hypot(a.x - b.x, a.y - b.y) / this.drag.d0, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        return;
      }
      if (this.drag && this.drag.kind === 'pan') {
        const sc = $('ed-scroll'); sc.scrollLeft = this.drag.sl - (e.clientX - this.drag.sx); sc.scrollTop = this.drag.st - (e.clientY - this.drag.sy);
        return;
      }
      const m = this.toMM(e);
      this.cursor = m;
      const d = this.drag;
      if (!d) { this.drawRulers(); this.updateStatus(); return; }
      if (d.kind === 'move') {
        if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < (e.pointerType === 'touch' ? 6 : 3)) return;
        d.moved = true; clearTimeout(this._lp);
        if (!d.origs.length) return;
        let dx = m.x - d.start.x, dy = m.y - d.start.y;
        if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
        const bb = this.bbox(d.origs);
        const snapped = this.snapBox({ x: bb.x + dx, y: bb.y + dy, w: bb.w, h: bb.h }, d.origs.map((o) => o.id), e.altKey);
        dx = snapped.x - bb.x; dy = snapped.y - bb.y;
        d.origs.forEach((o) => { const el = this.getEl(o.id); el.x = Elements.round(o.x + dx, 2); el.y = Elements.round(o.y + dy, 2); });
        this.liveUpdate(d.origs.map((o) => o.id));
      } else if (d.kind === 'resize') {
        this.doResize(d, m, e);
        this.liveUpdate([d.id], true);
      } else if (d.kind === 'rotate') {
        const el = this.getEl(d.id);
        let a = Math.atan2(m.y - d.cy, m.x - d.cx) * 180 / Math.PI + 90;
        if (e.shiftKey) a = Math.round(a / 15) * 15;
        else { const r90 = Math.round(a / 90) * 90; if (Math.abs(a - r90) < 3) a = r90; }
        a = ((a % 360) + 360) % 360; if (a > 180) a -= 360;
        el.rot = Elements.round(a, 1);
        this.liveUpdate([d.id]);
      } else if (d.kind === 'marquee') {
        const x = Math.min(d.start.x, m.x), y = Math.min(d.start.y, m.y);
        d.rect = { x, y, w: Math.abs(m.x - d.start.x), h: Math.abs(m.y - d.start.y) };
        const hit = this.els().filter((el) => !el.hidden && el.x < x + d.rect.w && el.x + el.w > x && el.y < y + d.rect.h && el.y + el.h > y).map((el) => el.id);
        this.selection = Array.from(new Set(d.base.concat(hit)));
        this.renderOverlay();
      }
      this.drawRulers(); this.updateStatus();
    },
    /** Fast path during a drag: re-render only the affected element nodes. */
    liveUpdate(ids, full) {
      const tpl = this.tpl(); const pageEl = $('ed-page'); const ctx = this._liveCtx || (this._liveCtx = this.ctx());
      ids.forEach((id) => {
        const el = this.getEl(id); const old = pageEl.querySelector(`.el[data-id="${id}"]`);
        if (!el || !old) return;
        if (full) { const n = Elements.render(el, ctx); if (n) old.replaceWith(n); }
        else { old.style.left = el.x + 'mm'; old.style.top = el.y + 'mm'; old.style.transform = el.rot ? `rotate(${el.rot}deg)` : ''; }
      });
      this.renderOverlay();
      Properties.sync();
      tpl.updatedAt = Date.now();
    },
    onUp(e) {
      clearTimeout(this._lp);
      if (this.touches) this.touches.delete(e.pointerId);
      if (this.drag && this.drag.kind === 'pinch') { if (!this.touches || this.touches.size === 0) this.drag = null; return; }
      if (this.drag && this.drag.kind === 'pan') { this.drag = null; return; }
      const d = this.drag; if (!d) return;
      this.drag = null; this.guides = []; this._liveCtx = null;
      try { $('ed-scroll').releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (d.kind === 'marquee') { this.afterSelect(); return; }
      if (d.kind === 'move' && !d.moved) { this.renderOverlay(); return; }
      this.change(() => {}, { immediate: true });
    },
    doResize(d, m, e) {
      const el = this.getEl(d.id); const o = d.orig;
      const rad = (o.rot || 0) * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
      const dx = m.x - d.start.x, dy = m.y - d.start.y;
      const lx = dx * cos + dy * sin, ly = -dx * sin + dy * cos;
      const sx = d.dir.includes('e') ? 1 : d.dir.includes('w') ? -1 : 0;
      const sy = d.dir.includes('s') ? 1 : d.dir.includes('n') ? -1 : 0;
      let nw = o.w + sx * lx, nh = o.h + sy * ly;
      if (e.shiftKey && sx && sy) { const r = o.w / o.h; if (Math.abs(nw / o.w) > Math.abs(nh / o.h)) nh = nw / r; else nw = nh * r; }
      this.guides = [];
      if (!o.rot && this.S().snap && !e.altKey) {
        const tg = this.snapTargets([el.id]); const th = 5 / (PX * this.zoom); const g = Number(this.S().gridSize) || 0;
        const snap1 = (v, list, axis) => {
          let best = null;
          list.forEach((tv) => { const dd = tv - v; if (Math.abs(dd) < th && (!best || Math.abs(dd) < Math.abs(best.d))) best = { d: dd, pos: tv }; });
          if (best) { this.guides.push({ axis, pos: best.pos }); return v + best.d; }
          return g ? Math.round(v / g) * g : v;
        };
        if (sx === 1) nw = snap1(o.x + nw, tg.xs, 'x') - o.x;
        if (sx === -1) nw = (o.x + o.w) - snap1(o.x + o.w - nw, tg.xs, 'x');
        if (sy === 1) nh = snap1(o.y + nh, tg.ys, 'y') - o.y;
        if (sy === -1) nh = (o.y + o.h) - snap1(o.y + o.h - nh, tg.ys, 'y');
      }
      nw = Math.max(0.5, nw); nh = Math.max(0.5, nh);
      const R = (px, py) => ({ x: px * cos - py * sin, y: px * sin + py * cos });
      const c0 = { x: o.x + o.w / 2, y: o.y + o.h / 2 };
      const aL = R(-sx * o.w / 2, -sy * o.h / 2);
      const A = { x: c0.x + aL.x, y: c0.y + aL.y };
      const bL = R(-sx * nw / 2, -sy * nh / 2);
      const c1 = { x: A.x - bL.x, y: A.y - bL.y };
      el.w = Elements.round(nw, 2); el.h = Elements.round(nh, 2);
      el.x = Elements.round(c1.x - nw / 2, 2); el.y = Elements.round(c1.y - nh / 2, 2);
    },
    snapTargets(exclude) {
      const tpl = this.tpl(); const ex = new Set(exclude);
      const xs = [0, tpl.width / 2, tpl.width], ys = [0, tpl.height / 2, tpl.height];
      this.els().forEach((e) => { if (ex.has(e.id) || e.hidden) return; xs.push(e.x, e.x + e.w / 2, e.x + e.w); ys.push(e.y, e.y + e.h / 2, e.y + e.h); });
      return { xs, ys };
    },
    snapBox(b, exclude, disable) {
      this.guides = [];
      if (!this.S().snap || disable) return b;
      const tg = this.snapTargets(exclude);
      const th = 5 / (PX * this.zoom);
      const g = Number(this.S().gridSize) || 0;
      const axis = (pos, size, list, ax) => {
        let best = null;
        [0, size / 2, size].forEach((off) => list.forEach((tv) => { const d = tv - (pos + off); if (Math.abs(d) < th && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, tv }; }));
        if (best) {
          // show every guide line that coincides after snapping
          const np = pos + best.d;
          [0, size / 2, size].forEach((off) => { if (list.some((tv) => Math.abs(tv - (np + off)) < 0.01)) this.guides.push({ axis: ax, pos: np + off }); });
          return np;
        }
        return g ? Math.round(pos / g) * g : pos;
      };
      return { x: axis(b.x, b.w, tg.xs, 'x'), y: axis(b.y, b.h, tg.ys, 'y'), w: b.w, h: b.h };
    },
    onDbl(e) {
      const node = e.target.closest('#ed-page .el'); if (!node) return;
      const el = this.getEl(node.dataset.id); if (!el || el.locked) return;
      if (el.type !== 'text') { Properties.focusContent(); return; }
      const tx = node.querySelector('.el-text'); if (!tx) return;
      this.editingId = el.id;
      tx.textContent = el.props.text || '';
      tx.contentEditable = 'true'; tx.spellcheck = false; tx.focus();
      const range = document.createRange(); range.selectNodeContents(tx); const s = window.getSelection(); s.removeAllRanges(); s.addRange(range);
      const finish = (cancel) => {
        tx.removeEventListener('blur', onBlur); tx.removeEventListener('keydown', onKey);
        this.editingId = null;
        if (!cancel) this.change(() => { el.props.text = tx.innerText.replace(/\n$/, ''); }, { immediate: true, props: true });
        else this.render();
      };
      const onBlur = () => finish(false);
      const onKey = (ev) => { ev.stopPropagation(); if (ev.key === 'Escape') { ev.preventDefault(); tx.removeEventListener('blur', onBlur); finish(true); } };
      tx.addEventListener('blur', onBlur); tx.addEventListener('keydown', onKey);
    },
    onContext(e) {
      e.preventDefault();
      const node = e.target.closest('#ed-page .el');
      if (node && !this.selection.includes(node.dataset.id)) { this.selection = [node.dataset.id]; this.afterSelect(); }
      const has = this.selection.length > 0;
      const allLocked = has && this.selected().every((x) => x.locked);
      const items = has ? [
        { label: t('copy'), icon: 'copy', kbd: 'Ctrl+C', action: () => this.copy() },
        { label: t('paste'), icon: 'clipboard', kbd: 'Ctrl+V', action: () => this.paste() },
        { label: t('duplicate'), icon: 'copy', kbd: 'Ctrl+D', action: () => this.duplicate() },
        '-',
        { label: t('toFront'), icon: 'chevronsUp', action: () => this.reorder('front') },
        { label: t('forward'), icon: 'chevronUp', action: () => this.reorder('forward') },
        { label: t('backward'), icon: 'chevronDown', action: () => this.reorder('backward') },
        { label: t('toBack'), icon: 'chevronsDown', action: () => this.reorder('back') },
        '-',
        { label: t('alignCenterH'), icon: 'alignCenterH', action: () => this.align('alignCenterH') },
        { label: t('alignMiddle'), icon: 'alignMiddle', action: () => this.align('alignMiddle') },
        { label: allLocked ? t('locked') + ' ✓' : t('locked'), icon: allLocked ? 'lock' : 'unlock', action: () => this.cmd('lock') },
        { label: t('visible'), icon: 'eyeOff', action: () => this.cmd('hide') },
        '-',
        { label: t('delete'), icon: 'trash', kbd: 'Del', danger: true, action: () => this.deleteSelected() },
      ] : [
        { label: t('paste'), icon: 'clipboard', kbd: 'Ctrl+V', action: () => this.paste(), disabled: !this.clipboard },
        { label: t('selectAll'), icon: 'grid', kbd: 'Ctrl+A', action: () => this.cmd('selectAll') },
        '-',
        { label: t('el.text'), icon: 'type', action: () => this.addElement('text', this.toMM(e)) },
        { label: t('el.field'), icon: 'field', action: () => this.addElement('field', this.toMM(e)) },
        { label: t('zoomFit'), icon: 'maximize', action: () => this.fit() },
      ];
      App.contextMenu(items, e.clientX, e.clientY);
    },

    /** Keyboard shortcuts specific to the canvas. Returns true when handled. */
    handleKey(e) {
      const k = e.key; const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.shiftKey && (k === 'z' || k === 'Z')) { this.undo(); return true; }
      if (mod && (k === 'y' || k === 'Y' || ((k === 'z' || k === 'Z') && e.shiftKey))) { this.redo(); return true; }
      if (mod && (k === 'c' || k === 'C')) { this.copy(); return true; }
      if (mod && (k === 'v' || k === 'V')) { this.paste(); return true; }
      if (mod && (k === 'x' || k === 'X')) { this.cmd('cut'); return true; }
      if (mod && (k === 'd' || k === 'D')) { this.duplicate(); return true; }
      if (mod && (k === 'a' || k === 'A')) { this.cmd('selectAll'); return true; }
      if (mod && (k === '=' || k === '+')) { this.cmd('zoomIn'); return true; }
      if (mod && k === '-') { this.cmd('zoomOut'); return true; }
      if (mod && k === '0') { this.fit(); return true; }
      if (k === 'Delete' || k === 'Backspace') { if (this.selection.length) { this.deleteSelected(); return true; } return false; }
      if (k === 'Escape') { if (this.selection.length) { this.selection = []; this.afterSelect(); } return true; }
      const step = e.shiftKey ? 5 : e.altKey ? 0.1 : 1;
      if (k === 'ArrowLeft') { this.nudge(-step, 0); return true; }
      if (k === 'ArrowRight') { this.nudge(step, 0); return true; }
      if (k === 'ArrowUp') { this.nudge(0, -step); return true; }
      if (k === 'ArrowDown') { this.nudge(0, step); return true; }
      return false;
    },
  };

  window.Designer = Designer;
})();
