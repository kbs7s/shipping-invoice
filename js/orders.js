/* Orders: data model, data binding (placeholder values), demo data,
   data-entry form and the order management table. */
(function () {
  'use strict';
  const E = () => window.Elements;

  const STATUSES = ['new', 'preparing', 'ready', 'shipped', 'delivered', 'returned', 'cancelled'];
  const PAY_STATUSES = ['unpaid', 'paid', 'partial', 'cod'];
  const PAY_METHODS = ['cash', 'cod', 'card', 'transfer', 'wallet'];

  function num(v) { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return isFinite(n) ? n : 0; }
  function nowLocalISO(d) { d = d || new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }

  function blankOrder() {
    const S = Settings.data;
    const n = S.nextNumber || 1001;
    S.nextNumber = n + 1; Settings.save();
    return {
      id: E().uid('ord'), receipt_number: (S.receiptPrefix || '') + n, order_number: (S.orderPrefix || '') + n, order_date: nowLocalISO(),
      customer_name: '', customer_phone: '', customer_phone2: '', customer_address: '', city: '', district: '',
      items: [{ name: '', description: '', qty: 1, price: 0 }],
      delivery_fee: 0, discount: 0, paid_amount: 0, payment_method: 'cod', payment_status: 'cod', status: 'new',
      delivery_company: '', delivery_agent: '', customer_notes: '', special_instructions: '',
      sender_name: S.defaultSenderName || '', sender_phone: S.defaultSenderPhone || '', package_number: '1', packages_count: '1', weight: '',
      custom: [], storeId: '', createdAt: Date.now(), updatedAt: Date.now(),
    };
  }

  /** Build the flat key → value map used by {{placeholders}}. */
  function buildData(order, store) {
    const S = Settings.data;
    const F = (v) => E().fmtNum(v);
    const st = store || {};
    const d = {
      store_name: st.name || '', store_phone: st.phone || '', store_phone2: st.phone2 || '', store_address: st.address || '',
      store_logo: st.logo || '', return_policy: st.returnPolicy || '', footer_text: st.footer || '', currency: S.currency || '',
      today: E().fmtDate(new Date(), 'YYYY/MM/DD'), now: E().fmtDate(new Date(), 'YYYY/MM/DD HH:mm'),
    };
    if (!order) return d;
    const o = order;
    const items = (o.items || []).filter((i) => i && (i.name || num(i.price) || num(i.qty) > 1));
    const sub = items.reduce((a, i) => a + num(i.qty) * num(i.price), 0);
    const fee = num(o.delivery_fee), disc = num(o.discount), paid = num(o.paid_amount);
    const total = sub + fee - disc;
    const cod = o.payment_status === 'paid' ? 0 : o.payment_status === 'partial' ? Math.max(0, total - paid) : (o.payment_status === 'unpaid' && o.payment_method !== 'cod' ? total : total);
    const qty = items.reduce((a, i) => a + num(i.qty), 0);
    const od = E().parseDate(o.order_date);
    Object.assign(d, {
      receipt_number: o.receipt_number || '', order_number: o.order_number || '',
      order_date: od ? E().fmtDate(od, 'YYYY/MM/DD HH:mm') : '',
      customer_name: o.customer_name || '', customer_phone: o.customer_phone || '', customer_phone2: o.customer_phone2 || '',
      customer_address: o.customer_address || '', city: o.city || '', district: o.district || '',
      city_district: [o.city, o.district].filter(Boolean).join(' - '),
      product_name: items.map((i) => i.name).filter(Boolean).join('، '),
      product_description: items.map((i) => i.description).filter(Boolean).join('، '),
      quantity: String(qty), product_price: items[0] ? F(items[0].price) : '', items_count: String(items.length),
      subtotal: F(sub), delivery_fee: F(fee), discount: F(disc), total: F(total), paid_amount: F(paid), cod_amount: F(cod),
      payment_method: o.payment_method ? t('pm.' + o.payment_method) : '', payment_status: o.payment_status ? t('ps.' + o.payment_status) : '',
      status: o.status ? t('st.' + o.status) : '',
      delivery_company: o.delivery_company || '', delivery_agent: o.delivery_agent || '',
      customer_notes: o.customer_notes || '', special_instructions: o.special_instructions || '',
      sender_name: o.sender_name || st.name || '', sender_phone: o.sender_phone || st.phone || '',
      package_number: o.package_number || '', packages_count: o.packages_count || '', weight: o.weight || '',
    });
    (o.custom || []).forEach((c) => { if (c && c.key) d['custom_' + c.key] = c.value || ''; });
    d.__num = { subtotal: sub, delivery_fee: fee, discount: disc, total, paid_amount: paid, cod_amount: cod, quantity: qty, product_price: items[0] ? num(items[0].price) : 0, items_count: items.length, packages_count: num(o.packages_count) };
    d.__items = items.map((i, k) => ({ index: k + 1, name: i.name || '', desc: i.description || '', qty: String(num(i.qty)), price: F(i.price), total: F(num(i.qty) * num(i.price)) }));
    d.__orderDate = od ? od.toISOString() : null;
    return d;
  }

  /* ------------------------------------------------------------ demo */
  function demoStore() {
    return {
      id: 'store_demo', name: 'متجر الريحان', phone: '0770 123 4567', phone2: '0750 765 4321',
      address: 'بغداد - الكرادة داخل - شارع 62', logo: App.SAMPLE_LOGO,
      returnPolicy: 'يمكن استبدال أو إرجاع المنتج خلال 7 أيام من الاستلام بحالته الأصلية مع الإيصال. لا تُسترد أجور التوصيل.',
      footer: 'شكراً لتسوقكم معنا — تابعونا @alrayhan.store',
    };
  }
  function demoOrders() {
    const base = [
      ['أحمد كريم', '0771 234 5678', '', 'بغداد', 'المنصور', 'شارع 14 رمضان، قرب جامع الرحمن، بناية 12', [['ساعة يد كلاسيك', 'جلد بني - مقاس 42', 1, 45000], ['حزام جلد', 'أسود', 1, 15000]], 5000, 0, 'cod', 'cod', 'new', 'يرجى الاتصال قبل الوصول'],
      ['زينب علي حسين', '0780 111 2233', '0750 999 8877', 'البصرة', 'العشار', 'شارع الكورنيش، مقابل مصرف الرافدين', [['عطر نسائي 100 مل', 'زهري', 2, 30000]], 7000, 5000, 'cod', 'cod', 'preparing', 'التوصيل بعد الساعة 4 عصراً'],
      ['Omar Saleh', '0751 444 5566', '', 'أربيل', 'عنكاوا', 'Ankawa main street, near Family Mall', [['Wireless earbuds', 'Black', 1, 35000], ['Phone case', 'iPhone 15', 2, 8000]], 6000, 0, 'card', 'paid', 'ready', ''],
      ['فاطمة جاسم', '0782 555 6677', '', 'النجف', 'حي السعد', 'قرب مدرسة السعد الابتدائية، الزقاق الثالث', [['طقم أواني طبخ', '10 قطع', 1, 85000]], 8000, 10000, 'transfer', 'partial', 'shipped', 'قابل للكسر'],
      ['مصطفى عبد الله', '0773 888 9900', '', 'كربلاء', 'حي الحسين', 'شارع الإسكان، دار 45', [['حقيبة ظهر', 'رمادي', 1, 28000], ['قنينة ماء حرارية', '750 مل', 1, 12000]], 6000, 0, 'cod', 'unpaid', 'delivered', ''],
      ['سارة محمود', '0790 321 6540', '', 'بغداد', 'زيونة', 'شارع الربيعي، عمارة 7، الطابق 3', [['فستان صيفي', 'مقاس M - أزرق', 1, 40000]], 5000, 0, 'cod', 'cod', 'returned', 'استبدال المقاس'],
    ];
    const now = Date.now();
    return base.map((b, i) => ({
      id: E().uid('ord'), receipt_number: 'R-' + (1001 + i), order_number: 'ORD-' + (1001 + i), order_date: nowLocalISO(new Date(now - (i * 26 + 3) * 3600e3)),
      customer_name: b[0], customer_phone: b[1], customer_phone2: b[2], city: b[3], district: b[4], customer_address: b[5],
      items: b[6].map((x) => ({ name: x[0], description: x[1], qty: x[2], price: x[3] })),
      delivery_fee: b[7], discount: b[8], paid_amount: b[10] === 'partial' ? 40000 : 0, payment_method: b[9], payment_status: b[10], status: b[11],
      delivery_company: 'شركة البرق للتوصيل', delivery_agent: ['علي حسن', 'حيدر جواد', 'كرار سامي'][i % 3], customer_notes: b[12], special_instructions: i % 2 ? 'يُرجى التعامل بحذر' : '',
      sender_name: 'متجر الريحان', sender_phone: '0770 123 4567', package_number: '1', packages_count: i === 3 ? '2' : '1', weight: (0.5 + i * 0.4).toFixed(1) + ' kg',
      custom: [], storeId: 'store_demo', createdAt: now - i * 1000, updatedAt: now - i * 1000,
    }));
  }

  /* ------------------------------------------------------ data entry */
  const FORM = [
    ['sec.order', [['receipt_number'], ['order_number'], ['order_date', 'datetime-local'], ['status', 'select', STATUSES, 'st.'], ['payment_status', 'select', PAY_STATUSES, 'ps.'], ['payment_method', 'select', PAY_METHODS, 'pm.'], ['storeId', 'store']]],
    ['sec.customer', [['customer_name'], ['customer_phone', 'tel'], ['customer_phone2', 'tel'], ['city'], ['district'], ['customer_address', 'textarea', null, null, 'full']]],
    ['sec.items', 'items'],
    ['sec.charges', [['delivery_fee', 'number'], ['discount', 'number'], ['paid_amount', 'number'], ['__totals', 'totals', null, null, 'full']]],
    ['sec.shipping', [['delivery_company'], ['delivery_agent'], ['sender_name'], ['sender_phone', 'tel'], ['package_number'], ['packages_count'], ['weight']]],
    ['sec.notes', [['customer_notes', 'textarea', null, null, 'full'], ['special_instructions', 'textarea', null, null, 'full']]],
    ['sec.custom', 'custom'],
  ];

  const Orders = {
    STATUSES, PAY_STATUSES, PAY_METHODS, blankOrder, buildData, demoStore, demoOrders, num,
    filters: { search: '', customer: '', from: '', to: '', status: '', payment: '' },

    current() {
      const id = Settings.get('previewOrderId');
      return App.state.orders.find((o) => o.id === id) || null;
    },
    sorted() { return App.state.orders.slice().sort((a, b) => (b.order_date || '').localeCompare(a.order_date || '') || b.createdAt - a.createdAt); },

    async create(silent) {
      const o = blankOrder();
      App.state.orders.push(o);
      await DB.put('orders', o);
      Settings.set('previewOrderId', o.id);
      if (!silent) App.toast(t('orderCreated'), 'success');
      App.emit('orders');
      return o;
    },
    async duplicate(id) {
      const src = App.state.orders.find((o) => o.id === id); if (!src) return;
      const o = E().clone(src);
      const S = Settings.data; const n = S.nextNumber++; Settings.save();
      Object.assign(o, { id: E().uid('ord'), order_number: (S.orderPrefix || '') + n, receipt_number: (S.receiptPrefix || '') + n, status: 'new', createdAt: Date.now(), updatedAt: Date.now() });
      App.state.orders.push(o); await DB.put('orders', o);
      Settings.set('previewOrderId', o.id);
      App.toast(t('orderDuplicated'), 'success'); App.emit('orders');
      return o;
    },
    async remove(id) {
      const o = App.state.orders.find((x) => x.id === id); if (!o) return;
      const ok = await App.confirm(t('confirmDeleteOrder', { n: o.order_number || '' }), { danger: true, okText: t('delete') });
      if (!ok) return;
      App.state.orders = App.state.orders.filter((x) => x.id !== id);
      await DB.delete('orders', id);
      Settings.set('selectedOrders', (Settings.get('selectedOrders') || []).filter((x) => x !== id));
      if (Settings.get('previewOrderId') === id) Settings.set('previewOrderId', (this.sorted()[0] || {}).id || null);
      App.toast(t('orderDeleted')); App.emit('orders');
    },
    saveSoon(o) {
      o.updatedAt = Date.now();
      clearTimeout(this._st); App.setSaving(true);
      this._st = setTimeout(async () => { await DB.put('orders', o); App.setSaving(false); }, 350);
    },

    /* ---------- data entry view ---------- */
    renderForm() {
      const form = document.getElementById('order-form');
      const o = this.current();
      this.fillOrderSelect(document.getElementById('de-order-select'));
      if (!o) {
        form.innerHTML = `<div class="empty">${E().icon('clipboard', 'empty-ico')}<h3>${t('noOrders')}</h3><p>${t('noOrdersHint')}</p></div>`;
        return;
      }
      let html = '';
      for (const [sec, fields] of FORM) {
        html += `<fieldset class="fs"><legend>${t(sec)}</legend>`;
        if (fields === 'items') html += this.itemsHTML(o);
        else if (fields === 'custom') html += this.customHTML(o);
        else {
          html += '<div class="form-grid">';
          for (const [key, type, opts, prefix, span] of fields) html += this.fieldHTML(o, key, type, opts, prefix, span);
          html += '</div>';
        }
        html += '</fieldset>';
      }
      form.innerHTML = html;
      this.updateTotals();
    },
    fieldHTML(o, key, type, opts, prefix, span) {
      const E_ = E();
      const lbl = key === 'storeId' ? t('store') : t('f.' + key);
      const cls = 'fld' + (span === 'full' ? ' full' : '');
      const v = o[key] == null ? '' : o[key];
      if (type === 'select') return `<label class="${cls}"><span>${lbl}</span><select name="${key}">${opts.map((x) => `<option value="${x}" ${x === v ? 'selected' : ''}>${t(prefix + x)}</option>`).join('')}</select></label>`;
      if (type === 'store') return `<label class="${cls}"><span>${lbl}</span><select name="${key}"><option value="">${t('noStore')}</option>${App.state.stores.map((s) => `<option value="${s.id}" ${s.id === v ? 'selected' : ''}>${E_.esc(s.name)}</option>`).join('')}</select></label>`;
      if (type === 'textarea') return `<label class="${cls}"><span>${lbl}</span><textarea name="${key}" rows="2">${E_.esc(v)}</textarea></label>`;
      if (type === 'totals') return `<div class="${cls} totals-box" id="de-totals"></div>`;
      return `<label class="${cls}"><span>${lbl}</span><input name="${key}" type="${type || 'text'}" ${type === 'number' ? 'step="any" min="0" inputmode="decimal"' : ''} value="${E_.esc(v)}"></label>`;
    },
    itemsHTML(o) {
      const E_ = E();
      return `<div class="items">${(o.items || []).map((it, i) => `
        <div class="item-row" data-i="${i}">
          <input data-item="name" placeholder="${t('f.item_name')}" value="${E_.esc(it.name)}" class="it-name">
          <input data-item="description" placeholder="${t('f.item_desc')}" value="${E_.esc(it.description)}" class="it-desc">
          <input data-item="qty" type="number" min="0" step="any" placeholder="${t('f.item_qty')}" value="${E_.esc(it.qty)}" class="it-qty" title="${t('f.item_qty')}">
          <input data-item="price" type="number" min="0" step="any" placeholder="${t('f.item_price')}" value="${E_.esc(it.price)}" class="it-price" title="${t('f.item_price')}">
          <button type="button" class="icon-btn danger" data-act="del-item" title="${t('remove')}">${E_.icon('x')}</button>
        </div>`).join('')}</div>
        <button type="button" class="btn small" data-act="add-item">${E_.icon('plus')}<span>${t('addItem')}</span></button>`;
    },
    customHTML(o) {
      const E_ = E();
      return `<div class="customs">${(o.custom || []).map((c, i) => `
        <div class="item-row" data-ci="${i}">
          <input data-custom="key" placeholder="${t('fieldKey')}" value="${E_.esc(c.key)}" class="it-key">
          <input data-custom="value" placeholder="${t('fieldValue')}" value="${E_.esc(c.value)}" class="it-name">
          <code class="ph-hint">{{custom_${E_.esc(c.key || '…')}}}</code>
          <button type="button" class="icon-btn danger" data-act="del-custom" title="${t('remove')}">${E_.icon('x')}</button>
        </div>`).join('')}</div>
        <button type="button" class="btn small" data-act="add-custom">${E_.icon('plus')}<span>${t('addCustomField')}</span></button>`;
    },
    updateTotals() {
      const box = document.getElementById('de-totals'); const o = this.current();
      if (!box || !o) return;
      const d = buildData(o, App.storeFor(null, o));
      box.innerHTML = [['subtotal', d.subtotal], ['total', d.total], ['cod_amount', d.cod_amount]].map(([k, v]) => `<div><span>${t('f.' + k)}</span><strong>${v} ${E().esc(d.currency)}</strong></div>`).join('');
    },
    bindForm() {
      const form = document.getElementById('order-form');
      form.addEventListener('submit', (e) => e.preventDefault());
      form.addEventListener('input', (e) => {
        const o = this.current(); if (!o) return;
        const tEl = e.target;
        if (tEl.name) {
          o[tEl.name] = tEl.type === 'number' ? (tEl.value === '' ? '' : Number(tEl.value)) : tEl.value;
          if (tEl.name === 'payment_status' && tEl.value === 'cod') o.payment_method = 'cod';
        } else if (tEl.dataset.item) {
          const i = +tEl.closest('[data-i]').dataset.i; o.items[i][tEl.dataset.item] = tEl.type === 'number' ? (tEl.value === '' ? '' : Number(tEl.value)) : tEl.value;
        } else if (tEl.dataset.custom) {
          const i = +tEl.closest('[data-ci]').dataset.ci; o.custom[i][tEl.dataset.custom] = tEl.dataset.custom === 'key' ? tEl.value.replace(/[^\w؀-ۿ]/g, '_') : tEl.value;
          if (tEl.dataset.custom === 'key') { const hint = tEl.parentNode.querySelector('.ph-hint'); if (hint) hint.textContent = `{{custom_${o.custom[i].key}}}`; }
        } else return;
        this.saveSoon(o);
        this.updateTotals();
        this.renderPreview();
        if (tEl.name === 'order_number' || tEl.name === 'customer_name') this.fillOrderSelect(document.getElementById('de-order-select'));
      });
      form.addEventListener('change', (e) => { if (e.target.tagName === 'SELECT') form.dispatchEvent(new Event('input')); });
      form.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        const o = this.current(); if (!o) return;
        const act = b.dataset.act;
        if (act === 'add-item') o.items.push({ name: '', description: '', qty: 1, price: 0 });
        if (act === 'del-item') o.items.splice(+b.closest('[data-i]').dataset.i, 1);
        if (act === 'add-custom') (o.custom = o.custom || []).push({ key: 'field' + ((o.custom.length || 0) + 1), value: '' });
        if (act === 'del-custom') o.custom.splice(+b.closest('[data-ci]').dataset.ci, 1);
        this.saveSoon(o); this.renderForm(); this.renderPreview();
      });
    },
    fillOrderSelect(sel, withNone) {
      if (!sel) return;
      const cur = Settings.get('previewOrderId');
      const list = this.sorted();
      sel.innerHTML = (withNone ? `<option value="">${t('noOrder')}</option>` : '') +
        list.map((o) => `<option value="${o.id}" ${o.id === cur ? 'selected' : ''}>${E().esc(o.order_number || '—')} · ${E().esc(o.customer_name || '')}</option>`).join('');
      if (!withNone && !list.length) sel.innerHTML = `<option value="">${t('noOrders')}</option>`;
      if (withNone && !list.find((o) => o.id === cur)) sel.value = '';
    },
    previewKind: 'receipt',
    previewTemplate() {
      const kind = this.previewKind;
      const cur = App.currentTemplate();
      if (this._deTemplateId) { const tp = App.getTemplate(this._deTemplateId); if (tp) return tp; }
      if (cur && cur.type === kind) return cur;
      return App.defaultTemplate(kind) || cur;
    },
    renderPreview() {
      const stage = document.getElementById('de-preview');
      if (!stage || !App.isView('data')) return;
      const tpl = this.previewTemplate(); if (!tpl) { stage.innerHTML = ''; return; }
      const sel = document.getElementById('de-template-select');
      sel.innerHTML = App.state.templates.filter((x) => x.type === this.previewKind).map((x) => `<option value="${x.id}" ${x.id === tpl.id ? 'selected' : ''}>${E().esc(x.name)}</option>`).join('');
      document.querySelectorAll('#de-kind button').forEach((b) => b.classList.toggle('active', b.dataset.kind === this.previewKind));
      const o = this.current();
      const ctx = { data: buildData(o, App.storeFor(tpl, o)) };
      App.renderScaledPreview(stage, tpl, ctx, { fit: true, pad: 32, maxScale: 2.2 });
    },
    initDataEntry() {
      this.bindForm();
      document.getElementById('de-order-select').addEventListener('change', (e) => { Settings.set('previewOrderId', e.target.value); App.emit('order-switch'); });
      const step = (dir) => {
        const list = this.sorted(); const i = list.findIndex((o) => o.id === Settings.get('previewOrderId'));
        const n = list[(i + dir + list.length) % list.length]; if (n) { Settings.set('previewOrderId', n.id); App.emit('order-switch'); }
      };
      const rtl = () => I18N.dir() === 'rtl';
      document.getElementById('de-prev').addEventListener('click', () => step(rtl() ? -1 : -1));
      document.getElementById('de-next').addEventListener('click', () => step(1));
      document.getElementById('de-new').addEventListener('click', () => this.create());
      document.getElementById('de-dup').addEventListener('click', () => { const o = this.current(); if (o) this.duplicate(o.id); });
      document.getElementById('de-del').addEventListener('click', () => { const o = this.current(); if (o) this.remove(o.id); });
      document.getElementById('de-template-select').addEventListener('change', (e) => { this._deTemplateId = e.target.value; this.renderPreview(); });
      document.getElementById('de-kind').addEventListener('click', (e) => { const b = e.target.closest('[data-kind]'); if (!b) return; this.previewKind = b.dataset.kind; this._deTemplateId = null; this.renderPreview(); });
      document.getElementById('de-open-designer').addEventListener('click', () => { const tp = this.previewTemplate(); if (tp) App.openTemplate(tp.id); });
      document.getElementById('de-print').addEventListener('click', () => { const tp = this.previewTemplate(); const o = this.current(); if (tp) Printing.quickPrint(tp.id, o ? [o.id] : null); });
    },

    /* ---------- order management view ---------- */
    filtered() {
      const f = this.filters; const q = f.search.trim().toLowerCase(); const c = f.customer.trim().toLowerCase();
      return this.sorted().filter((o) => {
        if (q) {
          const hay = [o.order_number, o.receipt_number, o.customer_name, o.customer_phone, o.customer_phone2, o.city, o.district, o.customer_address, (o.items || []).map((i) => i.name).join(' ')].join(' ').toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        if (c && (String(o.customer_name || '') + ' ' + String(o.customer_phone || '')).toLowerCase().indexOf(c) < 0) return false;
        const day = (o.order_date || '').slice(0, 10);
        if (f.from && day < f.from) return false;
        if (f.to && day > f.to) return false;
        if (f.status && o.status !== f.status) return false;
        if (f.payment && o.payment_status !== f.payment) return false;
        return true;
      });
    },
    renderOrdersView() {
      if (!App.isView('orders')) return;
      const E_ = E();
      const tb = document.querySelector('#orders-table tbody');
      const list = this.filtered();
      const sel = new Set(Settings.get('selectedOrders') || []);
      const statusSel = (o) => `<select class="status-sel st-${o.status}" data-act="status">${STATUSES.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${t('st.' + s)}</option>`).join('')}</select>`;
      tb.innerHTML = list.map((o) => {
        const d = buildData(o, App.storeFor(null, o));
        return `<tr data-id="${o.id}" class="${sel.has(o.id) ? 'selected' : ''}">
          <td class="w-check"><input type="checkbox" data-act="check" ${sel.has(o.id) ? 'checked' : ''}></td>
          <td><a href="#" data-act="edit" class="strong">${E_.esc(o.order_number)}</a></td>
          <td class="nowrap">${E_.esc(d.order_date)}</td>
          <td>${E_.esc(o.customer_name)}</td>
          <td class="nowrap ltr-num">${E_.esc(o.customer_phone)}</td>
          <td>${E_.esc(d.city_district)}</td>
          <td class="nowrap strong">${d.total} ${E_.esc(d.currency)}</td>
          <td>${statusSel(o)}</td>
          <td><span class="badge ps-${o.payment_status}">${t('ps.' + o.payment_status)}</span></td>
          <td class="nowrap row-actions">
            <button class="icon-btn" data-act="edit" title="${t('edit')}">${E_.icon('edit')}</button>
            <button class="icon-btn" data-act="dup" title="${t('duplicate')}">${E_.icon('copy')}</button>
            <button class="icon-btn" data-act="print-r" title="${t('printReceipt')}">${E_.icon('printer')}</button>
            <button class="icon-btn" data-act="print-s" title="${t('printSticker')}">${E_.icon('tag')}</button>
            <button class="icon-btn danger" data-act="del" title="${t('delete')}">${E_.icon('trash')}</button>
          </td></tr>`;
      }).join('');
      const empty = document.getElementById('orders-empty');
      empty.hidden = list.length > 0;
      if (!list.length) {
        const none = !App.state.orders.length;
        empty.innerHTML = `${E_.icon(none ? 'clipboard' : 'search', 'empty-ico')}<h3>${none ? t('noOrders') : t('noMatches')}</h3>${none ? `<p>${t('noOrdersHint')}</p><div class="row gap center"><button class="btn primary" data-act="new">${t('newOrder')}</button><button class="btn" data-act="demo">${t('loadDemo')}</button></div>` : ''}`;
      }
      document.getElementById('or-check-all').checked = list.length > 0 && list.every((o) => sel.has(o.id));
      document.getElementById('orders-summary').textContent = t('ordersSummary', { shown: list.length, total: App.state.orders.length, sel: sel.size });
    },
    initOrdersView() {
      const fs = document.getElementById('f-status'), fp = document.getElementById('f-payment');
      const fillFilters = () => {
        fs.innerHTML = `<option value="">${t('allStatuses')}</option>` + STATUSES.map((s) => `<option value="${s}">${t('st.' + s)}</option>`).join('');
        fp.innerHTML = `<option value="">${t('allPayments')}</option>` + PAY_STATUSES.map((s) => `<option value="${s}">${t('ps.' + s)}</option>`).join('');
        fs.value = this.filters.status; fp.value = this.filters.payment;
      };
      fillFilters(); App.on('lang', fillFilters);
      const bind = (id, key) => document.getElementById(id).addEventListener('input', (e) => { this.filters[key] = e.target.value; this.renderOrdersView(); });
      bind('f-search', 'search'); bind('f-customer', 'customer'); bind('f-from', 'from'); bind('f-to', 'to'); bind('f-status', 'status'); bind('f-payment', 'payment');
      document.getElementById('f-clear').addEventListener('click', () => {
        this.filters = { search: '', customer: '', from: '', to: '', status: '', payment: '' };
        ['f-search', 'f-customer', 'f-from', 'f-to', 'f-status', 'f-payment'].forEach((id) => { document.getElementById(id).value = ''; });
        this.renderOrdersView();
      });
      document.getElementById('or-new').addEventListener('click', async () => { await this.create(); App.show('data'); });
      document.getElementById('or-check-all').addEventListener('change', (e) => {
        const ids = this.filtered().map((o) => o.id); const sel = new Set(Settings.get('selectedOrders') || []);
        ids.forEach((id) => (e.target.checked ? sel.add(id) : sel.delete(id)));
        Settings.set('selectedOrders', Array.from(sel)); this.renderOrdersView();
      });
      const printSel = (kind) => {
        const ids = (Settings.get('selectedOrders') || []).filter((id) => App.state.orders.some((o) => o.id === id));
        if (!ids.length) { App.toast(t('selectOrdersFirst'), 'warn'); return; }
        Printing.openForOrders(ids, kind);
      };
      document.getElementById('or-print-receipts').addEventListener('click', () => printSel('receipt'));
      document.getElementById('or-print-stickers').addEventListener('click', () => printSel('sticker'));
      document.getElementById('or-print-all').addEventListener('click', () => {
        const ids = this.filtered().map((o) => o.id);
        if (!ids.length) { App.toast(t('nothingToPrint'), 'warn'); return; }
        Printing.openForOrders(ids, 'receipt');
      });
      const view = document.getElementById('view-orders');
      view.addEventListener('change', async (e) => {
        const tr = e.target.closest('tr[data-id]');
        if (e.target.dataset.act === 'check' && tr) {
          const sel = new Set(Settings.get('selectedOrders') || []);
          e.target.checked ? sel.add(tr.dataset.id) : sel.delete(tr.dataset.id);
          Settings.set('selectedOrders', Array.from(sel)); this.renderOrdersView();
        }
        if (e.target.dataset.act === 'status' && tr) {
          const o = App.state.orders.find((x) => x.id === tr.dataset.id);
          o.status = e.target.value; o.updatedAt = Date.now(); await DB.put('orders', o);
          e.target.className = 'status-sel st-' + o.status; App.toast(t('savedOk'), 'success');
        }
      });
      view.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT' || b.type === 'checkbox') return;
        const tr = b.closest('tr[data-id]'); const id = tr && tr.dataset.id;
        const act = b.dataset.act;
        if (act === 'edit') { e.preventDefault(); Settings.set('previewOrderId', id); App.show('data'); }
        else if (act === 'dup') this.duplicate(id);
        else if (act === 'del') this.remove(id);
        else if (act === 'print-r') Printing.quickPrint(App.defaultTemplateId('receipt'), [id]);
        else if (act === 'print-s') Printing.quickPrint(App.defaultTemplateId('sticker'), [id]);
        else if (act === 'new') { this.create().then(() => App.show('data')); }
        else if (act === 'demo') App.loadDemo();
      });
    },
  };

  window.Orders = Orders;
})();
