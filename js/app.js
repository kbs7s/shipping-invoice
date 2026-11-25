/* Application shell: state, views, persistence wiring, dialogs, toasts, context menu,
   theme/language, settings & backup, keyboard shortcuts and startup. */
(function () {
  'use strict';
  const PX = 96 / 25.4;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => Elements.esc(s);

  const SAMPLE_LOGO = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><rect width="240" height="120" rx="18" fill="#0f766e"/>' +
    '<path d="M62 92c-6-30 10-58 44-66-2 32-16 55-44 66z" fill="#99f6e4"/><path d="M62 92c10-18 22-32 40-46" stroke="#0f766e" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<text x="170" y="70" font-family="Cairo, Tahoma, Arial" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">الريحان</text>' +
    '<text x="170" y="96" font-family="Arial" font-size="15" fill="#ccfbf1" text-anchor="middle" letter-spacing="3">AL RAYHAN</text></svg>');

  const VIEWS = ['designer', 'data', 'orders', 'templates', 'print', 'settings'];

  const App = {
    SAMPLE_LOGO,
    state: { templates: [], orders: [], stores: [] },
    view: 'designer',
    listeners: {},

    /* ------------------------------------------------------ event bus */
    on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    emit(ev, data) { (this.listeners[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } }); },

    /* ------------------------------------------------------ templates */
    getTemplate(id) { return this.state.templates.find((x) => x.id === id) || null; },
    currentTemplate() { return this.getTemplate(Settings.get('currentTemplateId')) || this.state.templates[0] || null; },
    replaceTemplate(obj) { const i = this.state.templates.findIndex((x) => x.id === obj.id); if (i >= 0) this.state.templates[i] = obj; else this.state.templates.push(obj); },
    async addTemplate(tp) { this.state.templates.push(tp); await DB.put('templates', tp); if (!this.defaultTemplateId(tp.type)) this.setDefaultTemplate(tp, true); },
    async deleteTemplate(id) {
      const tp = this.getTemplate(id);
      this.state.templates = this.state.templates.filter((x) => x.id !== id);
      await DB.delete('templates', id);
      const d = Settings.get('defaultTemplate');
      if (tp && d[tp.type] === id) { const n = this.state.templates.find((x) => x.type === tp.type); d[tp.type] = n ? n.id : null; Settings.save(); }
      if (Settings.get('currentTemplateId') === id) { Settings.set('currentTemplateId', (this.defaultTemplate('receipt') || this.state.templates[0] || {}).id || null); Designer.open(); }
      Designer.fillTemplateSelect();
    },
    saveTemplateSoon(tpl) {
      this.setSaving(true);
      clearTimeout(this._tt);
      this._tt = setTimeout(async () => { await DB.put('templates', tpl); this.setSaving(false); }, 400);
    },
    defaultTemplateId(kind) {
      const d = Settings.get('defaultTemplate') || {};
      if (d[kind] && this.getTemplate(d[kind])) return d[kind];
      const f = this.state.templates.find((x) => x.type === kind);
      return f ? f.id : (this.currentTemplate() || {}).id;
    },
    defaultTemplate(kind) { return this.getTemplate(this.defaultTemplateId(kind)); },
    setDefaultTemplate(tpl, silent) {
      if (!tpl) return;
      const d = Object.assign({}, Settings.get('defaultTemplate')); d[tpl.type] = tpl.id; Settings.set('defaultTemplate', d);
      if (!silent) this.toast(t('templateDefaultSet'), 'success');
    },
    storeFor(tpl, order) {
      const S = this.state.stores;
      return (tpl && tpl.storeId && S.find((s) => s.id === tpl.storeId)) || (order && order.storeId && S.find((s) => s.id === order.storeId)) || S[0] || null;
    },
    openTemplate(id) {
      if (!this.getTemplate(id)) return;
      Designer.flush();
      Settings.set('currentTemplateId', id);
      this.show('designer');
      Designer.open();
    },

    /* ---------------------------------------------------------- views */
    isView(v) { return this.view === v; },
    show(v) {
      if (!VIEWS.includes(v)) v = 'designer';
      this.view = v;
      document.querySelectorAll('.view').forEach((s) => s.classList.toggle('active', s.id === 'view-' + v));
      document.querySelectorAll('#main-tabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
      Settings.set('lastView', v);
      this.refreshView();
    },
    refreshView() {
      switch (this.view) {
        case 'designer': Designer.fillTemplateSelect(); Designer.render(); Properties.render(); if (!this._fitted) { this._fitted = true; requestAnimationFrame(() => Designer.fit()); } break;
        case 'data': Orders.renderForm(); Orders.renderPreview(); break;
        case 'orders': Orders.renderOrdersView(); break;
        case 'templates': Templates.render(); break;
        case 'print': Printing.renderPreview(); break;
        case 'settings': this.renderSettings(); break;
        default: break;
      }
    },

    /* ---------------------------------------------------------- UI bits */
    injectIcons(root) {
      (root || document).querySelectorAll('[data-icon]').forEach((n) => {
        if (n.firstElementChild && n.firstElementChild.classList.contains('ico')) n.firstElementChild.remove();
        n.insertAdjacentHTML('afterbegin', Elements.icon(n.dataset.icon));
      });
    },
    setSaving(on) {
      const s = $('save-state'); if (!s) return;
      s.textContent = on ? t('saving') : t('saved');
      s.classList.toggle('busy', on);
    },
    toast(msg, type) {
      const n = document.createElement('div');
      n.className = 'toast ' + (type || 'info');
      const ic = { success: 'checkCircle', warn: 'alert', error: 'alert', info: 'checkCircle' }[type || 'info'];
      n.innerHTML = Elements.icon(ic) + `<span>${esc(msg)}</span>`;
      $('toast-root').appendChild(n);
      requestAnimationFrame(() => n.classList.add('show'));
      setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }, type === 'error' || type === 'warn' ? 4200 : 2400);
    },
    loading(on, text) {
      let el = $('loading-overlay');
      if (on) {
        if (!el) { el = document.createElement('div'); el.id = 'loading-overlay'; el.className = 'loading-overlay'; document.body.appendChild(el); }
        el.innerHTML = `<div class="spinner"></div><div>${esc(text || t('loading'))}</div>`; el.hidden = false;
      } else if (el) el.hidden = true;
    },
    modal(opts) {
      return new Promise((resolve) => {
        const back = document.createElement('div');
        back.className = 'modal-backdrop';
        const buttons = opts.buttons || [
          { label: opts.cancelText || t('cancel'), value: null },
          { label: opts.okText || t('ok'), value: 'ok', primary: !opts.danger, danger: !!opts.danger },
        ];
        back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
            <header><h3>${esc(opts.title || '')}</h3><button class="icon-btn" data-close>${Elements.icon('x')}</button></header>
            <div class="modal-body">${opts.body || ''}</div>
            <footer>${buttons.map((b, i) => `<button class="btn ${b.primary ? 'primary' : ''} ${b.danger ? 'danger' : ''}" data-bi="${i}">${esc(b.label)}</button>`).join('')}</footer>
          </div>`;
        $('modal-root').appendChild(back);
        const body = back.querySelector('.modal-body');
        const done = (v) => {
          let out = v;
          if (v != null && opts.read) out = opts.read(body, v);
          else if (v === 'ok') out = true;
          back.remove(); document.removeEventListener('keydown', onKey, true);
          resolve(v == null ? (opts.read ? null : false) : out);
        };
        const onKey = (e) => {
          if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(null); }
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { const p = buttons.findIndex((b) => b.primary || b.danger); if (p >= 0) { e.preventDefault(); e.stopPropagation(); done(buttons[p].value); } }
        };
        document.addEventListener('keydown', onKey, true);
        back.addEventListener('click', (e) => {
          if (e.target === back || e.target.closest('[data-close]')) return done(null);
          const b = e.target.closest('[data-bi]'); if (b) done(buttons[+b.dataset.bi].value);
        });
        const f = body.querySelector('input:not([type=radio]):not([type=checkbox]), textarea') || back.querySelector('.btn.primary, .btn.danger');
        if (f) setTimeout(() => { f.focus(); if (f.select) f.select(); }, 30);
      });
    },
    confirm(msg, o) { o = o || {}; return this.modal({ title: o.title || t('confirm'), body: `<p class="pre">${esc(msg)}</p>`, okText: o.okText || t('ok'), danger: o.danger }); },
    prompt(title, value) { return this.modal({ title, body: `<input type="text" class="full-w" value="${esc(value || '')}">`, read: (b) => b.querySelector('input').value.trim() }); },
    contextMenu(items, x, y) {
      const m = $('ctx-menu');
      m.innerHTML = items.map((it, i) => (it === '-' ? '<div class="ctx-sep"></div>' : `<button class="ctx-item ${it.danger ? 'danger' : ''}" data-i="${i}" ${it.disabled ? 'disabled' : ''}>${Elements.icon(it.icon || 'more')}<span>${esc(it.label)}</span>${it.kbd ? `<kbd>${it.kbd}</kbd>` : ''}</button>`)).join('');
      m.hidden = false;
      const r = m.getBoundingClientRect();
      m.style.left = Math.min(x, window.innerWidth - r.width - 6) + 'px';
      m.style.top = Math.min(y, window.innerHeight - r.height - 6) + 'px';
      m.onclick = (e) => { const b = e.target.closest('[data-i]'); if (!b) return; m.hidden = true; items[+b.dataset.i].action(); };
    },
    download(filename, obj) {
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    },
    pickFile(accept, asDataURL) {
      return new Promise((resolve) => {
        const inp = $('file-input'); inp.value = ''; inp.accept = accept || '';
        inp.onchange = () => {
          const f = inp.files && inp.files[0]; if (!f) return resolve(null);
          const r = new FileReader();
          r.onload = () => resolve(r.result); r.onerror = () => resolve(null);
          asDataURL ? r.readAsDataURL(f) : r.readAsText(f);
        };
        inp.click();
      });
    },
    async pickImage() {
      const src = await this.pickFile('image/*', true);
      if (!src) return null;
      if (!/^data:image\//.test(src)) { this.toast(t('unsupportedFile'), 'error'); return null; }
      if (/^data:image\/svg/.test(src)) return src;
      // downscale large photos so templates and backups stay small
      return new Promise((resolve) => {
        const im = new Image();
        im.onload = () => {
          const max = 900; const k = Math.min(1, max / Math.max(im.width, im.height));
          if (k === 1 && src.length < 400000) return resolve(src);
          const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const png = /^data:image\/png/.test(src);
          if (k < 1) this.toast(t('imageTooLarge'));
          resolve(c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.9));
        };
        im.onerror = () => resolve(null);
        im.src = src;
      });
    },
    /** Render a template page scaled into a container (thumbnails, data preview). */
    renderScaledPreview(container, tpl, ctx, opts) {
      opts = opts || {};
      container.innerHTML = '';
      const pad = opts.pad == null ? 16 : opts.pad;
      let aw, ah;
      if (opts.box) { aw = opts.box.w - pad * 2; ah = opts.box.h - pad * 2; }
      else { aw = container.clientWidth - pad * 2; ah = container.clientHeight - pad * 2; }
      const pages = opts.box ? [0] : tpl.pages.map((p, i) => i);
      let s = Math.min(aw / (tpl.width * PX), (opts.box ? ah : Math.max(ah, 200)) / (tpl.height * PX));
      if (opts.maxScale) s = Math.min(s, opts.maxScale);
      s = Math.max(0.05, s);
      pages.forEach((pi) => {
        const holder = document.createElement('div');
        holder.className = 'preview-holder';
        holder.style.width = (tpl.width * PX * s) + 'px'; holder.style.height = (tpl.height * PX * s) + 'px';
        const page = Elements.renderPage(tpl, pi, ctx);
        page.style.transform = `scale(${s})`; page.style.transformOrigin = '0 0';
        holder.appendChild(page);
        container.appendChild(holder);
      });
    },

    /* ------------------------------------------------------- theme/lang */
    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
      const b = $('btn-theme'); b.dataset.icon = theme === 'dark' ? 'sun' : 'moon'; this.injectIcons(b.parentNode);
    },
    setLang(lang) {
      Settings.set('lang', lang);
      I18N.set(lang);
      Designer.buildPalette();
      this.emit('lang');
      this.refreshView();
      if (this.view !== 'designer') Designer.dirty = true;
    },

    /* ------------------------------------------------------ settings view */
    renderSettings() {
      const S = Settings.data; const E = Elements;
      const stores = this.state.stores.map((s) => `
        <div class="store-card" data-sid="${s.id}">
          <div class="store-logo">${s.logo ? `<img src="${esc(s.logo)}" alt="">` : E.icon('image')}
            <div class="row gap"><button class="btn small" data-sact="logo">${E.icon('upload')}<span>${t('logo')}</span></button>${s.logo ? `<button class="icon-btn danger" data-sact="nologo" title="${t('removeImage')}">${E.icon('x')}</button>` : ''}</div>
          </div>
          <div class="form-grid">
            <label class="fld"><span>${t('storeName')}</span><input data-sk="name" value="${esc(s.name)}"></label>
            <label class="fld"><span>${t('f.store_phone')}</span><input data-sk="phone" value="${esc(s.phone)}"></label>
            <label class="fld"><span>${t('f.store_phone2')}</span><input data-sk="phone2" value="${esc(s.phone2)}"></label>
            <label class="fld"><span>${t('f.store_address')}</span><input data-sk="address" value="${esc(s.address)}"></label>
            <label class="fld full"><span>${t('f.return_policy')}</span><textarea data-sk="returnPolicy" rows="2">${esc(s.returnPolicy)}</textarea></label>
            <label class="fld full"><span>${t('f.footer_text')}</span><input data-sk="footer" value="${esc(s.footer)}"></label>
          </div>
          <button class="btn small danger-outline" data-sact="del">${E.icon('trash')}<span>${t('delete')}</span></button>
        </div>`).join('');
      $('settings-root').innerHTML = `
        <section class="card">
          <h3>${E.icon('sliders')} ${t('general')}</h3>
          <div class="form-grid">
            <label class="fld"><span>${t('language')}</span><select data-set="lang"><option value="ar">العربية</option><option value="en">English</option></select></label>
            <label class="fld"><span>${t('theme')}</span><select data-set="theme"><option value="light">${t('light')}</option><option value="dark">${t('dark')}</option></select></label>
            <label class="fld"><span>${t('currency')}</span><input data-set="currency" value="${esc(S.currency)}"></label>
            <label class="fld"><span>${t('decimals')}</span><select data-set="decimals" data-num="1">${[0, 1, 2, 3].map((n) => `<option value="${n}">${n}</option>`).join('')}</select></label>
            <label class="fld"><span>${t('orderPrefix')}</span><input dir="ltr" data-set="orderPrefix" value="${esc(S.orderPrefix)}"></label>
            <label class="fld"><span>${t('receiptPrefix')}</span><input dir="ltr" data-set="receiptPrefix" value="${esc(S.receiptPrefix)}"></label>
            <label class="fld"><span>${t('nextNumber')}</span><input type="number" data-set="nextNumber" data-num="1" value="${S.nextNumber}"></label>
            <label class="fld"><span>${t('defaultSender')} — ${t('name')}</span><input data-set="defaultSenderName" value="${esc(S.defaultSenderName)}"></label>
            <label class="fld"><span>${t('defaultSender')} — ${t('phone')}</span><input data-set="defaultSenderPhone" value="${esc(S.defaultSenderPhone)}"></label>
          </div>
        </section>
        <section class="card">
          <div class="row between"><h3>${E.icon('home')} ${t('stores')}</h3><button class="btn small primary" data-sact="add">${E.icon('plus')}<span>${t('addStore')}</span></button></div>
          <div class="stores">${stores || `<p class="muted">—</p>`}</div>
        </section>
        <section class="card">
          <h3>${E.icon('save')} ${t('dataManagement')}</h3>
          <p class="note">${t('storageNote')}</p>
          <p class="muted small" id="storage-usage"></p>
          <div class="row gap wrap">
            <button class="btn primary" data-dact="export">${E.icon('download')}<span>${t('exportAll')}</span></button>
            <button class="btn" data-dact="import">${E.icon('upload')}<span>${t('importBackup')}</span></button>
            <button class="btn" data-dact="exportOrders">${E.icon('download')}<span>${t('exportOrders')}</span></button>
            <button class="btn" data-dact="exportTemplates">${E.icon('download')}<span>${t('exportTemplates')}</span></button>
            <button class="btn" data-dact="importTemplates">${E.icon('upload')}<span>${t('importTemplates')}</span></button>
            <button class="btn" data-dact="demo">${E.icon('package')}<span>${t('loadDemo')}</span></button>
            <button class="btn danger" data-dact="clear">${E.icon('trash')}<span>${t('clearAll')}</span></button>
          </div>
        </section>
        <section class="card">
          <h3>${E.icon('hash')} ${t('shortcuts')}</h3>
          <table class="kbd-table">${[['Ctrl + S', t('save')], ['Ctrl + Z', t('undo')], ['Ctrl + Y / Ctrl + Shift + Z', t('redo')], ['Ctrl + C / V / X', `${t('copy')} / ${t('paste')} / ${t('cut')}`], ['Ctrl + D', t('duplicate')], ['Delete', t('delete')], ['Ctrl + A', t('selectAll')], ['Ctrl + P', t('print')], ['← ↑ → ↓', '1 mm (Shift: 5 mm, Alt: 0.1 mm)'], ['Ctrl + wheel / Ctrl + = / -', `${t('zoomIn')} / ${t('zoomOut')}`], ['Ctrl + 0', t('zoomFit')], ['Shift + drag', 'Lock axis / keep ratio / 15° rotation'], ['Alt + drag', 'Disable snapping'], ['Esc', '—']].map(([k, v]) => `<tr><td><kbd>${k}</kbd></td><td>${esc(v)}</td></tr>`).join('')}</table>
        </section>`;
      const root = $('settings-root');
      root.querySelector('[data-set="lang"]').value = I18N.lang;
      root.querySelector('[data-set="theme"]').value = S.theme;
      root.querySelector('[data-set="decimals"]').value = String(S.decimals);
      DB.estimate().then((est) => {
        const n = $('storage-usage'); if (!n || !est) return;
        const f = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB');
        n.textContent = t('storageUsage', { used: f(est.usage || 0), quota: f(est.quota || 0) }) + (DB.isPersistent() ? '' : ' — IndexedDB unavailable (memory only)');
      });
    },
    initSettings() {
      const root = $('settings-root');
      root.addEventListener('change', (e) => {
        const el = e.target; const k = el.dataset.set; if (!k) return;
        if (k === 'lang') return this.setLang(el.value);
        if (k === 'theme') { Settings.set('theme', el.value); return this.applyTheme(el.value); }
      });
      root.addEventListener('input', (e) => {
        const el = e.target;
        if (el.dataset.set && !['lang', 'theme'].includes(el.dataset.set)) {
          Settings.set(el.dataset.set, el.dataset.num ? (parseFloat(el.value) || 0) : el.value);
          Designer.dirty = true;
        }
        if (el.dataset.sk) {
          const s = this.state.stores.find((x) => x.id === el.closest('[data-sid]').dataset.sid);
          s[el.dataset.sk] = el.value; this.saveStoreSoon(s);
        }
      });
      root.addEventListener('click', async (e) => {
        const b = e.target.closest('button'); if (!b) return;
        const sa = b.dataset.sact, da = b.dataset.dact;
        const card = b.closest('[data-sid]'); const s = card && this.state.stores.find((x) => x.id === card.dataset.sid);
        if (sa === 'add') { const ns = { id: Elements.uid('store'), name: t('storeName'), phone: '', phone2: '', address: '', logo: '', returnPolicy: '', footer: '' }; this.state.stores.push(ns); await DB.put('stores', ns); this.renderSettings(); }
        if (sa === 'del' && s) { if (await this.confirm(t('confirmDeleteStore', { n: s.name }), { danger: true, okText: t('delete') })) { this.state.stores = this.state.stores.filter((x) => x !== s); await DB.delete('stores', s.id); this.renderSettings(); } }
        if (sa === 'logo' && s) { const src = await this.pickImage(); if (src) { s.logo = src; await DB.put('stores', s); this.renderSettings(); Designer.dirty = true; } }
        if (sa === 'nologo' && s) { s.logo = ''; await DB.put('stores', s); this.renderSettings(); Designer.dirty = true; }
        if (da === 'export') { this.download(`delivery-designer-backup-${new Date().toISOString().slice(0, 10)}.json`, this.backupObject()); this.toast(t('exported'), 'success'); }
        if (da === 'import') this.importBackup();
        if (da === 'exportOrders') { this.download(`orders-${new Date().toISOString().slice(0, 10)}.json`, { format: 'delivery-designer/orders', version: 1, orders: this.state.orders }); this.toast(t('exported'), 'success'); }
        if (da === 'exportTemplates') Templates.exportAll();
        if (da === 'importTemplates') Templates.importFile();
        if (da === 'demo') this.loadDemo();
        if (da === 'clear') this.clearAll();
      });
    },
    saveStoreSoon(s) { this.setSaving(true); clearTimeout(this._sst); this._sst = setTimeout(async () => { await DB.put('stores', s); this.setSaving(false); Designer.dirty = true; }, 400); },

    /* ------------------------------------------------------ backup */
    backupObject() {
      return { format: 'delivery-designer/backup', version: 1, exportedAt: new Date().toISOString(), settings: Settings.data, templates: this.state.templates, orders: this.state.orders, stores: this.state.stores };
    },
    async importBackup() {
      const text = await this.pickFile('.json,application/json'); if (text == null) return;
      let data; try { data = JSON.parse(text); } catch (e) { this.toast(t('importFailed'), 'error'); return; }
      if (!data || typeof data !== 'object' || (!data.templates && !data.orders)) { this.toast(t('importFailed'), 'error'); return; }
      const mode = await this.modal({ title: t('importBackup'), body: `<p>${t('confirmImportBackup')}</p>`, buttons: [{ label: t('cancel'), value: null }, { label: t('importMerge'), value: 'merge' }, { label: t('importReplace'), value: 'replace', danger: true }] });
      if (!mode) return;
      const templates = (data.templates || []).map((x) => Templates.normalize(x)).filter(Boolean);
      const orders = (data.orders || []).filter((o) => o && o.id);
      const stores = (data.stores || []).filter((s) => s && s.id);
      this.loading(true);
      try {
        if (mode === 'replace') {
          await Promise.all(['templates', 'orders', 'stores'].map((s) => DB.clear(s)));
          this.state = { templates: [], orders: [], stores: [] };
          if (data.settings) { Settings.data = Object.assign(Settings.load(), data.settings); Settings.save(); }
        }
        const merge = (list, key) => { list.forEach((x) => { const i = this.state[key].findIndex((y) => y.id === x.id); if (i >= 0) this.state[key][i] = x; else this.state[key].push(x); }); };
        merge(templates, 'templates'); merge(orders, 'orders'); merge(stores, 'stores');
        await DB.putMany('templates', templates); await DB.putMany('orders', orders); await DB.putMany('stores', stores);
        if (!this.state.templates.length) { const st = Templates.starters(); this.state.templates = st; await DB.putMany('templates', st); }
        this.ensureValid();
      } finally { this.loading(false); }
      this.toast(t('backupImported'), 'success');
      I18N.set(Settings.get('lang')); this.applyTheme(Settings.get('theme'));
      Designer.histories = {}; Designer.open(); this.emit('lang'); this.refreshView();
    },
    async loadDemo() {
      if (!this.state.stores.some((s) => s.id === 'store_demo')) { const s = Orders.demoStore(); this.state.stores.unshift(s); await DB.put('stores', s); }
      const orders = Orders.demoOrders();
      this.state.orders.push(...orders); await DB.putMany('orders', orders);
      Settings.set('previewOrderId', orders[0].id);
      this.toast(t('demoLoaded'), 'success');
      this.emit('orders'); this.refreshView();
    },
    async clearAll() {
      const v = await this.modal({ title: t('clearAll'), body: `<p>${t('confirmClearAll')}</p><input type="text" class="full-w" placeholder="${t('typeToConfirm')}">`, okText: t('delete'), danger: true, read: (b) => b.querySelector('input').value.trim() });
      if (v == null || (v !== t('typeToConfirm') && v.toLowerCase() !== 'delete' && v !== 'حذف')) return;
      await Promise.all(['templates', 'orders', 'stores'].map((s) => DB.clear(s)));
      const lang = Settings.get('lang'), theme = Settings.get('theme');
      Settings.clear(); Settings.set('lang', lang); Settings.set('theme', theme); Settings.set('seeded', true);
      this.state = { templates: Templates.starters(), orders: [], stores: [] };
      await DB.putMany('templates', this.state.templates);
      this.ensureValid();
      Designer.histories = {}; Designer.open();
      this.toast(t('dataCleared'));
      this.refreshView();
    },

    /* ------------------------------------------------------ startup */
    ensureValid() {
      const S = Settings.data;
      const d = S.defaultTemplate;
      ['receipt', 'sticker'].forEach((k) => { if (!this.getTemplate(d[k])) { const f = this.state.templates.find((x) => x.type === k); d[k] = f ? f.id : null; } });
      if (!this.getTemplate(S.currentTemplateId)) S.currentTemplateId = d.receipt || (this.state.templates[0] || {}).id || null;
      if (!this.state.orders.some((o) => o.id === S.previewOrderId)) S.previewOrderId = (Orders.sorted()[0] || {}).id || null;
      if (S.print && S.print.templateId && !this.getTemplate(S.print.templateId)) S.print.templateId = null;
      Settings.save();
    },
    async seed() {
      const starters = Templates.starters();
      const store = Orders.demoStore();
      const orders = Orders.demoOrders();
      this.state.templates = starters; this.state.stores = [store]; this.state.orders = orders;
      await DB.putMany('templates', starters); await DB.put('stores', store); await DB.putMany('orders', orders);
      Settings.data.defaultTemplate = { receipt: starters.find((x) => x.starter === 'minimal').id, sticker: starters.find((x) => x.starter === 'shipping').id };
      Settings.data.currentTemplateId = Settings.data.defaultTemplate.receipt;
      Settings.data.previewOrderId = orders[0].id;
      Settings.data.nextNumber = 1001 + orders.length;
      Settings.data.seeded = true; Settings.save();
    },
    async saveNow() {
      Designer.flush();
      const tpl = this.currentTemplate();
      clearTimeout(this._tt);
      if (tpl) await DB.put('templates', tpl);
      const o = Orders.current(); clearTimeout(Orders._st); if (o) await DB.put('orders', o);
      Settings.save(); this.setSaving(false);
      this.toast(t('savedOk'), 'success');
    },
    printShortcut() {
      if (this.view === 'print') return Printing.print();
      if (this.view === 'data') { const tp = Orders.previewTemplate(); const o = Orders.current(); return Printing.quickPrint(tp && tp.id, o ? [o.id] : null); }
      const sel = (Settings.get('selectedOrders') || []);
      if (this.view === 'orders' && sel.length) return Printing.quickPrint(this.defaultTemplateId('receipt'), sel);
      const o = Orders.current();
      return Printing.quickPrint((this.currentTemplate() || {}).id, o ? [o.id] : null);
    },
    bindGlobal() {
      $('main-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) this.show(b.dataset.view); });
      $('btn-lang').addEventListener('click', () => this.setLang(I18N.lang === 'ar' ? 'en' : 'ar'));
      $('btn-theme').addEventListener('click', () => { const th = Settings.get('theme') === 'dark' ? 'light' : 'dark'; Settings.set('theme', th); this.applyTheme(th); Designer.drawRulers(); });
      $('btn-save').addEventListener('click', () => this.saveNow());
      $('btn-print-quick').addEventListener('click', () => this.printShortcut());
      document.addEventListener('pointerdown', (e) => { const m = $('ctx-menu'); if (!m.hidden && !m.contains(e.target)) m.hidden = true; });
      window.addEventListener('blur', () => { $('ctx-menu').hidden = true; });
      document.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey; const k = (e.key || '').toLowerCase();
        if (mod && k === 's') { e.preventDefault(); this.saveNow(); return; }
        if (mod && k === 'p') { e.preventDefault(); this.printShortcut(); return; }
        if ($('modal-root').children.length) return;
        if (e.key === 'Escape' && !$('ctx-menu').hidden) { $('ctx-menu').hidden = true; return; }
        const tg = e.target;
        if (tg && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))) return;
        if (this.view === 'designer' && Designer.handleKey(e)) e.preventDefault();
      });
      window.addEventListener('beforeunload', () => { Designer.flush(); const tpl = this.currentTemplate(); if (tpl) DB.put('templates', tpl); });
      this.on('orders', () => { Designer.fillTemplateSelect(); Designer.render(); this.refreshView(); });
      this.on('order-switch', () => { Designer.fillTemplateSelect(); Designer.render(); if (this.view !== 'designer') this.refreshView(); });
      this.on('lang', () => { Designer.fillTemplateSelect(); this.setSaving(false); });
      window.addEventListener('resize', () => { clearTimeout(this._rz); this._rz = setTimeout(() => { if (this.view === 'data') Orders.renderPreview(); }, 120); });
    },
    async init() {
      Settings.load();
      I18N.set(Settings.get('lang'));
      this.applyTheme(Settings.get('theme'));
      $('splash').querySelector('.splash-text').textContent = t('loading');
      try {
        const [templates, orders, stores] = await Promise.all([DB.getAll('templates'), DB.getAll('orders'), DB.getAll('stores')]);
        this.state = { templates, orders, stores };
        if (!Settings.get('seeded') && !templates.length && !orders.length) await this.seed();
        if (!this.state.templates.length) { const st = Templates.starters(); this.state.templates = st; await DB.putMany('templates', st); }
      } catch (e) {
        console.error(e);
        this.state = { templates: Templates.starters(), orders: [], stores: [] };
      }
      this.ensureValid();
      this.injectIcons();
      Designer.init(); Properties.init(); Orders.initDataEntry(); Orders.initOrdersView(); Templates.init(); Printing.initView(); this.initSettings();
      this.bindGlobal();
      $('app').hidden = false;
      $('splash').remove();
      this.show(Settings.get('lastView') || 'designer');
      Designer.open();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { Designer.render(); });
      window.__appReady = true;
    },
  };

  window.App = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
