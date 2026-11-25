/* Template system: paper sizes, seven editable starter templates, sticker auto-layout,
   and the template manager (create, duplicate, rename, delete, import/export, defaults). */
(function () {
  'use strict';
  const E = () => window.Elements;

  const SIZES = [
    { id: 'A4', label: 'A4', w: 210, h: 297, kind: 'receipt' },
    { id: 'A5', label: 'A5', w: 148, h: 210, kind: 'receipt' },
    { id: 'A6', label: 'A6', w: 105, h: 148, kind: 'receipt' },
    { id: 'T80', label: '80mm thermal', w: 80, h: 190, kind: 'receipt' },
    { id: 'T58', label: '58mm thermal', w: 58, h: 160, kind: 'receipt' },
    { id: 'S50x30', label: 'Sticker 50×30', w: 50, h: 30, kind: 'sticker' },
    { id: 'S60x40', label: 'Sticker 60×40', w: 60, h: 40, kind: 'sticker' },
    { id: 'S70x50', label: 'Sticker 70×50', w: 70, h: 50, kind: 'sticker' },
    { id: 'S100x100', label: 'Sticker 100×100', w: 100, h: 100, kind: 'sticker' },
    { id: 'S100x150', label: 'Label 100×150 (4×6")', w: 100, h: 150, kind: 'sticker' },
  ];

  /* ---------------------------------------------------- build helpers */
  const AR = { dir: 'rtl', align: 'right', fontFamily: 'Cairo' };
  function mk(type, x, y, w, h, props, style, name) {
    const el = E().create(type);
    Object.assign(el, { x, y, w, h });
    Object.assign(el.style, AR, type === 'barcode' ? { dir: 'ltr', align: 'center', fontFamily: 'Arial' } : {}, style || {});
    Object.assign(el.props, props || {});
    if (name) el.name = name;
    return el;
  }
  const txt = (x, y, w, h, text, st, name) => { const one = /^\{\{(\w+)\}\}$/.exec(text); return mk('text', x, y, w, h, { text }, st, name || (one ? E().fieldLabel(one[1]) : String(text).replace(/\{\{(\w+)\}\}/g, (m, k) => E().fieldLabel(k)).slice(0, 28))); };
  const fld = (x, y, w, h, key, label, st, pr) => mk('field', x, y, w, h, Object.assign({ key, label: label == null ? E().fieldLabel(key) : label, showLabel: label !== false, labelBold: true }, pr || {}), st, E().fieldLabel(key));
  const money = (x, y, w, h, key, label, st, pr) => mk('calc', x, y, w, h, Object.assign({ formula: `{{${key}}}`, label: label || '', showLabel: !!label, layout: 'spread', suffix: ' {{currency}}', labelBold: false }, pr || {}), Object.assign({ bold: false }, st || {}), E().fieldLabel(key));
  const line = (x, y, w, pr, st) => mk('line', x, y - 1, w, 2, Object.assign({ orientation: 'h', lineStyle: 'solid', thickness: 0.3 }, pr || {}), Object.assign({ color: '#111111' }, st || {}));
  const rect = (x, y, w, h, st) => mk('rect', x, y, w, h, {}, Object.assign({ borderWidth: 0.3, borderColor: '#111111', radius: 0 }, st || {}));
  const img = (x, y, w, h) => mk('image', x, y, w, h, { bind: 'store_logo', fit: 'contain' }, {}, E().fieldLabel('store_logo'));
  const bc = (x, y, w, h, pr, st) => mk('barcode', x, y, w, h, Object.assign({ value: '{{order_number}}', format: 'CODE128', showText: true }, pr || {}), Object.assign({ fontSize: 8 }, st || {}));
  const qr = (x, y, s, pr) => mk('qr', x, y, s, s, Object.assign({ value: '{{order_number}}', ecc: 'M' }, pr || {}));
  const ico = (x, y, s, name, color) => mk('icon', x, y, s, s, { icon: name }, { color: color || '#111111' });
  const tbl = (x, y, w, h, pr, st) => mk('table', x, y, w, h, pr || {}, Object.assign({ fontSize: 9, valign: 'top' }, st || {}));
  const date = (x, y, w, h, pr, st) => mk('date', x, y, w, h, Object.assign({ source: 'now', format: 'YYYY/MM/DD HH:mm', prefix: '' }, pr || {}), st);
  const cols = (spec) => spec.map(([key, label, width, align]) => ({ key, label, width, align: align || 'center' }));
  const GRAY = '#6b7280';

  function tplBase(name, type, w, h, elements, extra) {
    return Object.assign({
      id: E().uid('tpl'), name, type, storeId: '', width: w, height: h, background: '#ffffff', defaultFont: 'Cairo',
      pages: [{ id: E().uid('pg'), elements }], createdAt: Date.now(), updatedAt: Date.now(),
    }, extra || {});
  }

  /* ---------------------------------------------- starter templates */
  const STARTERS = {
    minimal() {
      const W = 148;
      return tplBase('إيصال حديث بسيط', 'receipt', W, 210, [
        img(114, 10, 24, 16),
        txt(10, 10, 100, 9, '{{store_name}}', { fontSize: 16, bold: true }),
        txt(10, 19, 100, 8, '{{store_address}} · {{store_phone}}', { fontSize: 8, color: GRAY }),
        line(10, 30, 128, { thickness: 0.5 }),
        txt(70, 33, 68, 10, 'إيصال تسليم', { fontSize: 15, bold: true }),
        fld(10, 33, 58, 5, 'receipt_number', 'رقم الإيصال', { fontSize: 8.5, align: 'left' }),
        fld(10, 38, 58, 5, 'order_date', 'التاريخ', { fontSize: 8.5, align: 'left' }),
        txt(76, 47, 62, 5, 'معلومات العميل', { fontSize: 8, bold: true, color: GRAY }),
        txt(10, 47, 62, 5, 'تفاصيل الطلب', { fontSize: 8, bold: true, color: GRAY }),
        fld(76, 53, 62, 5, 'customer_name', 'الاسم', { fontSize: 9 }),
        fld(76, 58, 62, 5, 'customer_phone', 'الهاتف', { fontSize: 9 }),
        fld(76, 63, 62, 5, 'city_district', 'المدينة', { fontSize: 9 }),
        fld(76, 68, 62, 10, 'customer_address', 'العنوان', { fontSize: 8.5, valign: 'top' }),
        fld(10, 53, 62, 5, 'order_number', 'رقم الطلب', { fontSize: 9 }),
        fld(10, 58, 62, 5, 'payment_method', 'الدفع', { fontSize: 9 }),
        fld(10, 63, 62, 5, 'payment_status', 'حالة الدفع', { fontSize: 9 }),
        fld(10, 68, 62, 5, 'delivery_company', 'التوصيل', { fontSize: 9 }),
        tbl(10, 82, 128, 44, { columns: cols([['index', '#', 7], ['name', 'المنتج', 45, 'start'], ['qty', 'الكمية', 13], ['price', 'السعر', 17], ['total', 'المجموع', 18]]), headerBg: '#f3f4f6', lineColor: '#e5e7eb', cellPadding: 1.2 }),
        money(10, 130, 62, 5, 'subtotal', 'المجموع الفرعي', { fontSize: 9 }),
        money(10, 135, 62, 5, 'delivery_fee', 'التوصيل', { fontSize: 9 }),
        money(10, 140, 62, 5, 'discount', 'الخصم', { fontSize: 9 }),
        line(10, 146.5, 62, { thickness: 0.3 }),
        money(10, 148, 62, 8, 'total', 'الإجمالي', { fontSize: 12, bold: true }, { labelBold: true }),
        txt(76, 130, 62, 26, 'ملاحظات: {{customer_notes}}\n{{special_instructions}}', { fontSize: 8, valign: 'top', bg: '#f8fafc', radius: 2, padding: 2 }, 'ملاحظات'),
        bc(10, 161, 60, 16),
        qr(118, 159, 20),
        txt(10, 180, 128, 10, '{{return_policy}}', { fontSize: 7, color: GRAY, align: 'center' }, 'سياسة الإرجاع'),
        line(10, 192, 128, { lineStyle: 'dashed', thickness: 0.2 }, { color: '#9ca3af' }),
        txt(10, 194, 128, 6, '{{footer_text}}', { fontSize: 8, align: 'center' }, 'التذييل'),
      ], { starter: 'minimal' });
    },

    professional() {
      const blue = '#1e3a8a';
      const box = (x, key, label) => [rect(x, 46, 45, 14, { bg: '#f1f5f9', borderWidth: 0, radius: 2 }), fld(x + 2, 47, 41, 12, key, label, { fontSize: 10, bold: true }, { layout: 'stacked', labelColor: GRAY, labelBold: false })];
      return tplBase('إيصال توصيل احترافي', 'receipt', 210, 297, [
        rect(0, 0, 210, 38, { bg: blue, borderWidth: 0 }),
        img(170, 7, 30, 24),
        txt(60, 8, 106, 11, '{{store_name}}', { fontSize: 20, bold: true, color: '#ffffff' }),
        txt(60, 20, 106, 12, '{{store_address}}\nهاتف: {{store_phone}} - {{store_phone2}}', { fontSize: 9, color: '#dbeafe', valign: 'top' }, 'معلومات المتجر'),
        txt(10, 9, 46, 10, 'إيصال توصيل', { fontSize: 15, bold: true, color: '#ffffff', align: 'left' }),
        txt(10, 20, 46, 6, 'DELIVERY RECEIPT', { fontSize: 8, color: '#bfdbfe', align: 'left', dir: 'ltr', letterSpacing: 1, fontFamily: 'Arial' }),
        ...box(155, 'receipt_number', 'رقم الإيصال'), ...box(106.67, 'order_number', 'رقم الطلب'), ...box(58.33, 'order_date', 'تاريخ الطلب'), ...box(10, 'status', 'حالة الطلب'),
        rect(108, 66, 92, 48, { borderColor: '#cbd5e1', radius: 2 }),
        txt(112, 68, 84, 7, 'بيانات المستلم', { fontSize: 11, bold: true, color: blue }),
        fld(112, 77, 84, 5.5, 'customer_name', 'الاسم', { fontSize: 9.5 }),
        fld(112, 83, 84, 5.5, 'customer_phone', 'الهاتف', { fontSize: 9.5 }),
        fld(112, 89, 84, 5.5, 'customer_phone2', 'هاتف ثانوي', { fontSize: 9.5 }),
        fld(112, 95, 84, 5.5, 'city_district', 'المدينة / المنطقة', { fontSize: 9.5 }),
        fld(112, 101, 84, 11, 'customer_address', 'العنوان', { fontSize: 9, valign: 'top' }),
        rect(10, 66, 92, 48, { borderColor: '#cbd5e1', radius: 2 }),
        txt(14, 68, 84, 7, 'بيانات التوصيل والدفع', { fontSize: 11, bold: true, color: blue }),
        fld(14, 77, 84, 5.5, 'delivery_company', 'شركة التوصيل', { fontSize: 9.5 }),
        fld(14, 83, 84, 5.5, 'delivery_agent', 'المندوب', { fontSize: 9.5 }),
        fld(14, 89, 84, 5.5, 'payment_method', 'طريقة الدفع', { fontSize: 9.5 }),
        fld(14, 95, 84, 5.5, 'payment_status', 'حالة الدفع', { fontSize: 9.5 }),
        fld(14, 101, 84, 5.5, 'packages_count', 'عدد الطرود', { fontSize: 9.5 }),
        tbl(10, 122, 190, 70, { columns: cols([['index', '#', 6], ['name', 'المنتج', 30, 'start'], ['desc', 'الوصف', 28, 'start'], ['qty', 'الكمية', 10], ['price', 'السعر', 13], ['total', 'المجموع', 13]]), headerBg: blue, headerColor: '#ffffff', lineColor: '#cbd5e1', cellPadding: 1.8 }, { fontSize: 10 }),
        money(10, 198, 80, 6, 'subtotal', 'المجموع الفرعي', { fontSize: 10 }),
        money(10, 205, 80, 6, 'delivery_fee', 'أجور التوصيل', { fontSize: 10 }),
        money(10, 212, 80, 6, 'discount', 'الخصم', { fontSize: 10 }),
        money(10, 219, 80, 10, 'total', 'الإجمالي', { fontSize: 13, bold: true, color: '#ffffff', bg: blue, radius: 1.5, padding: 2 }, { labelBold: true }),
        txt(100, 198, 100, 31, 'ملاحظات العميل: {{customer_notes}}\nتعليمات خاصة: {{special_instructions}}', { fontSize: 9, valign: 'top', bg: '#f8fafc', radius: 2, padding: 3 }, 'ملاحظات'),
        txt(130, 238, 70, 6, 'توقيع المستلم', { fontSize: 9.5, align: 'center', color: GRAY }),
        line(135, 256, 60, { thickness: 0.3 }),
        txt(10, 238, 70, 6, 'توقيع المندوب', { fontSize: 9.5, align: 'center', color: GRAY }),
        line(15, 256, 60, { thickness: 0.3 }),
        qr(94, 236, 22),
        txt(10, 263, 190, 13, 'سياسة الإرجاع والاستبدال: {{return_policy}}', { fontSize: 8, color: GRAY, valign: 'top' }, 'سياسة الإرجاع'),
        line(10, 280, 190, { thickness: 0.6 }, { color: blue }),
        txt(60, 282, 140, 8, '{{footer_text}}', { fontSize: 9 }, 'التذييل'),
        date(10, 282, 50, 8, { prefix: 'طُبع في: ' }, { fontSize: 7.5, color: GRAY, align: 'left' }),
      ], { starter: 'professional' });
    },

    ecommerce() {
      const or = '#ea580c';
      return tplBase('إيصال متجر إلكتروني', 'receipt', 148, 210, [
        img(59, 7, 30, 18),
        txt(10, 26, 128, 8, '{{store_name}}', { fontSize: 13, bold: true, align: 'center' }),
        txt(10, 35, 128, 10, 'شكراً لطلبك يا {{customer_name}}!', { fontSize: 13, bold: true, align: 'center', color: or }, 'رسالة الشكر'),
        txt(10, 45, 128, 6, 'رقم الطلب {{order_number}}  ·  {{order_date}}', { fontSize: 8.5, align: 'center', color: GRAY }),
        rect(10, 54, 128, 25, { bg: '#fff7ed', borderWidth: 0, radius: 3 }),
        ico(129, 57, 6, 'truck', or),
        txt(14, 56, 113, 6.5, 'الشحن إلى: {{customer_name}} — {{customer_phone}}', { fontSize: 9.5, bold: true }, 'الشحن إلى'),
        txt(14, 63, 113, 14, '{{city_district}}\n{{customer_address}}', { fontSize: 8.5, valign: 'top' }, 'العنوان'),
        tbl(10, 83, 128, 47, { columns: cols([['name', 'المنتج', 50, 'start'], ['qty', 'الكمية', 14], ['price', 'السعر', 18], ['total', 'المجموع', 18]]), headerBg: or, headerColor: '#ffffff', lineColor: '#fed7aa', cellPadding: 1.3 }),
        money(10, 134, 64, 5, 'subtotal', 'المجموع الفرعي', { fontSize: 9 }),
        money(10, 139, 64, 5, 'delivery_fee', 'التوصيل', { fontSize: 9 }),
        money(10, 144, 64, 5, 'discount', 'الخصم', { fontSize: 9 }),
        money(10, 150, 64, 9, 'total', 'الإجمالي', { fontSize: 12, bold: true, color: '#ffffff', bg: or, radius: 2, padding: 1.5 }, { labelBold: true }),
        fld(80, 134, 58, 5, 'payment_method', 'طريقة الدفع', { fontSize: 9 }),
        fld(80, 139, 58, 5, 'payment_status', 'حالة الدفع', { fontSize: 9 }),
        money(80, 145, 58, 14, 'cod_amount', 'المطلوب عند الاستلام', { fontSize: 11, bold: true, color: or, align: 'center', borderWidth: 0.4, borderColor: or, radius: 2, borderStyle: 'dashed' }, { layout: 'stacked', labelBold: false }),
        qr(10, 164, 22, { value: 'Order {{order_number}} - {{store_name}} - {{store_phone}}' }),
        txt(35, 165, 103, 20, 'امسح الرمز لمعلومات طلبك\nللاستفسار: {{store_phone}}', { fontSize: 8.5, valign: 'top' }, 'نص QR'),
        txt(10, 189, 128, 10, '{{return_policy}}', { fontSize: 7, color: GRAY, align: 'center' }, 'سياسة الإرجاع'),
        txt(10, 200, 128, 6, '{{footer_text}}', { fontSize: 8.5, align: 'center', color: or, bold: true }, 'التذييل'),
      ], { starter: 'ecommerce' });
    },

    thermal() {
      const W = 72, X = 4, f = 8;
      const dash = (y) => line(X, y, W, { lineStyle: 'dashed', thickness: 0.25 });
      const sp = (y, key, label) => fld(X, y, W, 4.5, key, label, { fontSize: f }, { layout: 'spread', labelBold: false });
      return tplBase('إيصال حراري مضغوط 80 مم', 'receipt', 80, 190, [
        img(28, 3, 24, 12),
        txt(X, 16, W, 7, '{{store_name}}', { fontSize: 13, bold: true, align: 'center' }),
        txt(X, 23, W, 8, '{{store_address}}\n{{store_phone}}', { fontSize: 7.5, align: 'center' }, 'عنوان المتجر'),
        dash(32.5),
        sp(34, 'receipt_number', 'رقم الإيصال'), sp(38.5, 'order_number', 'رقم الطلب'), sp(43, 'order_date', 'التاريخ'),
        dash(48.5),
        sp(50, 'customer_name', 'العميل'), sp(54.5, 'customer_phone', 'الهاتف'),
        txt(X, 59, W, 9, '{{city_district}} - {{customer_address}}', { fontSize: 7.5, valign: 'top' }, 'العنوان'),
        dash(69),
        tbl(X, 70.5, W, 40, { columns: cols([['name', 'الصنف', 52, 'start'], ['qty', 'ك', 13], ['total', 'المجموع', 35]]), headerBg: '', lineColor: '#9ca3af', cellPadding: 0.6 }, { fontSize: 8 }),
        dash(112),
        money(X, 113.5, W, 4.5, 'subtotal', 'المجموع', { fontSize: f }),
        money(X, 118, W, 4.5, 'delivery_fee', 'التوصيل', { fontSize: f }),
        money(X, 122.5, W, 4.5, 'discount', 'الخصم', { fontSize: f }),
        line(X, 128, W, { thickness: 0.4 }),
        money(X, 129.5, W, 7, 'total', 'الإجمالي', { fontSize: 12, bold: true }, { labelBold: true }),
        dash(138),
        sp(139.5, 'payment_method', 'طريقة الدفع'), sp(144, 'payment_status', 'حالة الدفع'),
        money(X, 149, W, 7, 'cod_amount', 'عند الاستلام', { fontSize: 10, bold: true, borderWidth: 0.35, padding: 1 }, { labelBold: true }),
        bc(10, 158, 60, 14),
        txt(X, 173.5, W, 8, '{{footer_text}}', { fontSize: 7.5, align: 'center' }, 'التذييل'),
        date(X, 182, W, 4, { prefix: 'طُبع: ' }, { fontSize: 6.5, align: 'center' }),
      ], { starter: 'thermal' });
    },

    shipping() {
      return tplBase('ملصق شحن 100×150', 'sticker', 100, 150, [
        rect(2, 2, 96, 146, { borderWidth: 0.5 }),
        img(76, 4, 20, 12),
        txt(4, 4, 70, 7, '{{store_name}}', { fontSize: 12, bold: true }),
        txt(4, 11, 70, 5, '{{store_phone}}', { fontSize: 8 }),
        line(2, 17, 96, { thickness: 0.5 }),
        txt(4, 18.5, 92, 5, 'من: {{sender_name}} — {{sender_phone}}', { fontSize: 8.5 }, 'المرسل'),
        txt(4, 23.5, 92, 5, '{{store_address}}', { fontSize: 7.5, color: '#374151' }),
        line(2, 30, 96, { thickness: 0.5 }),
        txt(74, 32, 22, 7, 'إلى / TO', { fontSize: 9, bold: true, color: '#ffffff', bg: '#000000', align: 'center', radius: 1 }),
        txt(4, 40, 92, 10, '{{customer_name}}', { fontSize: 17, bold: true }),
        ico(90, 51.5, 6, 'phone'),
        txt(4, 51, 85, 7, '{{customer_phone}}   {{customer_phone2}}', { fontSize: 13, bold: true }, 'هاتف المستلم'),
        rect(4, 60, 92, 12, { borderWidth: 0.6, radius: 1.5 }),
        txt(5, 60.5, 90, 11, '{{city_district}}', { fontSize: 17, bold: true, align: 'center' }),
        txt(4, 73, 92, 12, '{{customer_address}}', { fontSize: 10, valign: 'top' }),
        line(2, 86, 96, { thickness: 0.5 }),
        fld(52, 87.5, 44, 10, 'order_number', 'رقم الطلب', { fontSize: 11, bold: true }, { layout: 'stacked', labelBold: false, labelColor: '#374151' }),
        txt(4, 87.5, 44, 10, 'طرد {{package_number}} من {{packages_count}}', { fontSize: 11, bold: true, align: 'center', borderWidth: 0.4, radius: 1 }, 'رقم الطرد'),
        rect(4, 99, 92, 13, { bg: '#000000', borderWidth: 0, radius: 1 }),
        txt(50, 99, 46, 13, 'الدفع عند الاستلام\nCOD', { fontSize: 9, bold: true, color: '#ffffff', align: 'center' }),
        money(4, 99, 46, 13, 'cod_amount', '', { fontSize: 15, bold: true, color: '#ffffff', align: 'center' }, { layout: 'inline' }),
        txt(4, 113, 92, 8, 'تعليمات: {{special_instructions}} {{customer_notes}}', { fontSize: 8, valign: 'top' }, 'التعليمات'),
        bc(4, 122, 70, 23, {}, { fontSize: 9 }),
        qr(76, 123.5, 20),
      ], { starter: 'shipping' });
    },

    cod() {
      return tplBase('ملصق الدفع عند الاستلام 100×100', 'sticker', 100, 100, [
        rect(1.5, 1.5, 97, 97, { borderWidth: 0.6, radius: 3 }),
        txt(3, 3, 94, 12, 'الدفع عند الاستلام  •  COD', { fontSize: 14, bold: true, color: '#ffffff', bg: '#000000', align: 'center', radius: 2 }, 'شريط COD'),
        money(3, 16.5, 94, 16, 'cod_amount', '', { fontSize: 26, bold: true, align: 'center' }, { layout: 'inline' }),
        line(5, 34, 90, { lineStyle: 'dashed', thickness: 0.3 }),
        ico(89, 36.5, 6, 'user'),
        txt(5, 36, 82, 7, '{{customer_name}}', { fontSize: 12, bold: true }),
        ico(89, 44, 6, 'phone'),
        txt(5, 43.5, 82, 7, '{{customer_phone}}', { fontSize: 12, bold: true }, 'الهاتف'),
        ico(89, 51.5, 6, 'pin'),
        txt(5, 51, 82, 11, '{{city_district}}\n{{customer_address}}', { fontSize: 8.5, valign: 'top' }, 'العنوان'),
        line(5, 63.5, 90, { thickness: 0.3 }),
        img(5, 65, 24, 12),
        fld(32, 65, 63, 6, 'order_number', 'رقم الطلب', { fontSize: 9.5 }),
        txt(32, 71, 63, 6, '{{store_name}} · {{store_phone}}', { fontSize: 7.5, color: '#374151' }, 'المتجر'),
        bc(5, 79, 64, 17),
        qr(74, 78, 19),
      ], { starter: 'cod' });
    },

    bw() {
      const X = 7, W = 91;
      return tplBase('إيصال أبيض وأسود بسيط', 'receipt', 105, 148, [
        rect(3, 3, 99, 142, { borderWidth: 0.3 }),
        txt(X, 7, W, 8, '{{store_name}}', { fontSize: 14, bold: true, align: 'center' }),
        txt(X, 15, W, 5, '{{store_phone}}', { fontSize: 8, align: 'center' }),
        line(X, 21.5, W, { lineStyle: 'double', thickness: 0.25 }),
        txt(X, 23.5, W, 7, 'إيصال استلام', { fontSize: 11, bold: true, align: 'center' }),
        fld(53, 31, 45, 5, 'receipt_number', 'رقم', { fontSize: 7.5 }),
        fld(X, 31, 45, 5, 'order_date', '', { fontSize: 7.5, align: 'left' }, { showLabel: false }),
        line(X, 37, W, { thickness: 0.2 }),
        fld(X, 38.5, W, 5.5, 'customer_name', 'المستلم', { fontSize: 9 }),
        fld(X, 44, W, 5.5, 'customer_phone', 'الهاتف', { fontSize: 9 }),
        fld(X, 49.5, W, 5.5, 'city_district', 'المدينة', { fontSize: 9 }),
        fld(X, 55, W, 9, 'customer_address', 'العنوان', { fontSize: 8, valign: 'top' }),
        tbl(X, 66, W, 32, { columns: cols([['name', 'الصنف', 52, 'start'], ['qty', 'الكمية', 16], ['total', 'المجموع', 32]]), headerBg: '', lineColor: '#000000', cellPadding: 0.8 }, { fontSize: 8 }),
        line(X, 99, W, { thickness: 0.3 }),
        money(X, 100.5, W, 5, 'subtotal', 'المجموع', { fontSize: 8.5 }),
        money(X, 105.5, W, 5, 'delivery_fee', 'التوصيل', { fontSize: 8.5 }),
        money(X, 110.5, W, 5, 'discount', 'الخصم', { fontSize: 8.5 }),
        money(X, 116.5, W, 7, 'total', 'الإجمالي', { fontSize: 11, bold: true, borderWidth: 0.3, padding: 1 }, { labelBold: true }),
        fld(X, 124.5, W, 5, 'payment_method', 'الدفع', { fontSize: 8.5 }),
        bc(22, 130.5, 61, 9, { showText: false }),
        txt(X, 140, W, 4.5, '{{footer_text}}', { fontSize: 6.5, align: 'center' }, 'التذييل'),
      ], { starter: 'bw' });
    },
  };
  const STARTER_ORDER = ['minimal', 'professional', 'ecommerce', 'thermal', 'shipping', 'cod', 'bw'];

  /** Proportional auto-layout for any sticker size. */
  function basicSticker(w, h) {
    const m = Math.max(1.5, Math.min(w, h) * 0.05), iw = w - 2 * m;
    const fs = Math.max(6, Math.min(13, h / 5.2));
    const lh = fs * 0.3528 * 1.45;
    const els = []; let y = m;
    els.push(txt(m, y, iw, lh * 1.1, '{{customer_name}}', { fontSize: Math.round(fs * 1.15 * 2) / 2, bold: true })); y += lh * 1.1;
    els.push(txt(m, y, iw, lh, '{{customer_phone}}', { fontSize: fs, bold: true }, 'الهاتف')); y += lh;
    els.push(txt(m, y, iw, lh, '{{city_district}}', { fontSize: fs })); y += lh;
    if (h >= 40) { els.push(txt(m, y, iw, lh * 1.7, '{{customer_address}}', { fontSize: Math.max(6, fs * 0.8), valign: 'top' })); y += lh * 1.7; }
    if (h >= 50) { els.push(money(m, y, iw, lh * 1.2, 'cod_amount', 'COD', { fontSize: fs, bold: true, borderWidth: 0.3, padding: 0.5 }, { labelBold: true })); y += lh * 1.3; }
    const bh = Math.max(5, Math.min(h * 0.32, h - y - m));
    const withQr = h >= 40 && w >= 60;
    const qs = withQr ? Math.min(bh, w * 0.22) : 0;
    els.push(bc(m, h - m - bh, iw - (withQr ? qs + 2 : 0), bh, { showText: bh > 9 }, { fontSize: Math.max(5, Math.min(8, bh / 2)) }));
    if (withQr) els.push(qr(w - m - qs, h - m - qs, qs));
    return els;
  }

  /* ------------------------------------------------------ manager UI */
  const Templates = {
    SIZES, STARTERS, STARTER_ORDER, basicSticker,
    filter: { kind: 'all', store: '' },

    starters() { return STARTER_ORDER.map((k) => STARTERS[k]()); },
    blank(kind, w, h, layout) {
      const name = t('newTemplateName') + ' ' + w + '×' + h;
      return tplBase(name, kind, w, h, layout ? (kind === 'sticker' ? basicSticker(w, h) : []) : []);
    },
    normalize(tp) {
      // make an imported template safe to use
      if (!tp || typeof tp !== 'object' || !Array.isArray(tp.pages)) return null;
      const out = Object.assign({ name: 'Template', type: 'receipt', width: 100, height: 150, background: '#ffffff', defaultFont: 'Cairo', storeId: '' }, tp);
      out.type = out.type === 'sticker' ? 'sticker' : 'receipt';
      out.width = Math.max(5, Number(out.width) || 100); out.height = Math.max(5, Number(out.height) || 150);
      out.pages = out.pages.map((p) => ({ id: p.id || E().uid('pg'), elements: (p.elements || []).filter((el) => el && el.type).map((el) => Object.assign({ x: 0, y: 0, w: 10, h: 10, rot: 0, props: {}, style: {} }, el, { id: el.id || E().uid('el') })) }));
      if (!out.pages.length) out.pages = [{ id: E().uid('pg'), elements: [] }];
      return out;
    },

    render() {
      if (!App.isView('templates')) return;
      const grid = document.getElementById('tpl-grid');
      const f = this.filter;
      document.querySelectorAll('#tp-kind button').forEach((b) => b.classList.toggle('active', b.dataset.kind === f.kind));
      const ss = document.getElementById('tp-store');
      ss.innerHTML = `<option value="">${t('allStores')}</option>` + App.state.stores.map((s) => `<option value="${s.id}">${E().esc(s.name)}</option>`).join('');
      ss.value = f.store;
      const list = App.state.templates.filter((tp) => (f.kind === 'all' || tp.type === f.kind) && (!f.store || tp.storeId === f.store))
        .sort((a, b) => (a.type === b.type ? 0 : a.type === 'receipt' ? -1 : 1) || (b.updatedAt - a.updatedAt));
      if (!list.length) { grid.innerHTML = `<div class="empty">${E().icon('template', 'empty-ico')}<h3>${t('noTemplates')}</h3></div>`; return; }
      const cur = App.currentTemplate();
      grid.innerHTML = list.map((tp) => {
        const isDef = App.defaultTemplateId(tp.type) === tp.id;
        const store = App.state.stores.find((s) => s.id === tp.storeId);
        return `<article class="tpl-card${cur && cur.id === tp.id ? ' current' : ''}" data-id="${tp.id}">
          <div class="tpl-thumb" data-act="open"></div>
          <div class="tpl-info">
            <div class="tpl-title"><strong title="${E().esc(tp.name)}">${E().esc(tp.name)}</strong>${isDef ? `<span class="badge ok">${E().icon('star')} ${t('default')}</span>` : ''}</div>
            <div class="muted small">${t(tp.type)} · ${tp.width}×${tp.height} mm${tp.pages.length > 1 ? ' · ' + tp.pages.length + ' ' + t('page') : ''}${store ? ' · ' + E().esc(store.name) : ''}</div>
          </div>
          <div class="tpl-actions">
            <button class="btn small primary" data-act="open">${E().icon('edit')}<span>${t('edit')}</span></button>
            <button class="icon-btn" data-act="rename" title="${t('rename')}">${E().icon('type')}</button>
            <button class="icon-btn" data-act="dup" title="${t('duplicate')}">${E().icon('copy')}</button>
            <button class="icon-btn" data-act="default" title="${t('setDefault')}" ${isDef ? 'disabled' : ''}>${E().icon('star')}</button>
            <button class="icon-btn" data-act="export" title="${t('exportJson')}">${E().icon('download')}</button>
            <button class="icon-btn" data-act="print" title="${t('print')}">${E().icon('printer')}</button>
            <button class="icon-btn danger" data-act="del" title="${t('delete')}">${E().icon('trash')}</button>
          </div>
        </article>`;
      }).join('');
      // thumbnails with the current preview order
      const order = Orders.current();
      grid.querySelectorAll('.tpl-card').forEach((card) => {
        const tp = App.getTemplate(card.dataset.id);
        const ctx = { data: Orders.buildData(order, App.storeFor(tp, order)) };
        App.renderScaledPreview(card.querySelector('.tpl-thumb'), tp, ctx, { box: { w: 240, h: 200 }, pad: 10 });
      });
    },

    async newTemplate(kind) {
      const sizes = SIZES.filter((s) => s.kind === kind);
      const res = await App.modal({
        title: kind === 'sticker' ? t('chooseStickerSize') : t('chooseReceiptSize'),
        body: `<div class="size-grid">${sizes.map((s, i) => `<label class="size-opt"><input type="radio" name="size" value="${s.id}" ${i === (kind === 'sticker' ? 3 : 1) ? 'checked' : ''}><span class="size-box" style="aspect-ratio:${s.w}/${s.h}"></span><span>${E().esc(s.label)}<br><small class="muted">${s.w}×${s.h} mm</small></span></label>`).join('')}
            <label class="size-opt"><input type="radio" name="size" value="custom"><span class="size-box dashed"></span><span>${t('customSize')}</span></label></div>
          <div class="form-grid" style="margin-top:12px">
            <label class="fld"><span>${t('templateName')}</span><input name="name" value="${E().esc(t('newTemplateName'))}"></label>
            <label class="fld"><span>${t('width')} (mm)</span><input name="w" type="number" value="100" min="10" step="1"></label>
            <label class="fld"><span>${t('height')} (mm)</span><input name="h" type="number" value="100" min="10" step="1"></label>
            ${kind === 'sticker' ? `<label class="pf-check full"><input type="checkbox" name="layout" checked><span>${t('withBasicLayout')}</span></label>` : ''}
          </div>`,
        okText: t('ok'),
        read: (root) => ({ size: (root.querySelector('input[name=size]:checked') || {}).value, name: root.querySelector('[name=name]').value, w: +root.querySelector('[name=w]').value, h: +root.querySelector('[name=h]').value, layout: !!(root.querySelector('[name=layout]') || {}).checked }),
      });
      if (!res) return;
      let w = res.w, h = res.h;
      const s = SIZES.find((x) => x.id === res.size);
      if (s) { w = s.w; h = s.h; }
      if (!(w >= 5 && h >= 5)) return;
      const tp = this.blank(kind, w, h, res.layout);
      tp.name = res.name && res.name !== t('newTemplateName') ? res.name : tp.name;
      await App.addTemplate(tp);
      App.toast(t('templateCreated'), 'success');
      App.openTemplate(tp.id);
    },
    async duplicate(id) {
      const src = App.getTemplate(id); if (!src) return;
      const c = E().clone(src);
      c.id = E().uid('tpl'); c.name = src.name + t('copySuffix'); c.createdAt = c.updatedAt = Date.now(); delete c.starter;
      c.pages.forEach((p) => { p.id = E().uid('pg'); p.elements.forEach((el) => { el.id = E().uid('el'); }); });
      await App.addTemplate(c);
      App.toast(t('templateDuplicated'), 'success');
      this.render();
      return c;
    },
    async rename(id) {
      const tp = App.getTemplate(id); if (!tp) return;
      const name = await App.prompt(t('rename'), tp.name);
      if (!name) return;
      tp.name = name; tp.updatedAt = Date.now();
      await DB.put('templates', tp);
      this.render(); Designer.fillTemplateSelect();
    },
    async remove(id) {
      const tp = App.getTemplate(id); if (!tp) return;
      if (App.state.templates.length <= 1) { App.toast(t('cannotDeleteLast'), 'warn'); return; }
      if (!(await App.confirm(t('confirmDeleteTemplate', { n: tp.name }), { danger: true, okText: t('delete') }))) return;
      await App.deleteTemplate(id);
      App.toast(t('templateDeleted'));
      this.render();
    },
    exportOne(id) {
      const tp = App.getTemplate(id); if (!tp) return;
      App.download(`template-${(tp.name || 'template').replace(/[^\w؀-ۿ-]+/g, '_')}.json`, { format: 'delivery-designer/templates', version: 1, exportedAt: new Date().toISOString(), templates: [tp] });
    },
    exportAll() {
      App.download(`templates-${new Date().toISOString().slice(0, 10)}.json`, { format: 'delivery-designer/templates', version: 1, exportedAt: new Date().toISOString(), templates: App.state.templates, stores: App.state.stores });
      App.toast(t('exported'), 'success');
    },
    async importFile() {
      const text = await App.pickFile('.json,application/json'); if (text == null) return;
      let data; try { data = JSON.parse(text); } catch (e) { App.toast(t('importFailed'), 'error'); return; }
      let list = Array.isArray(data) ? data : data.templates ? data.templates : data.pages ? [data] : null;
      if (!list) { App.toast(t('importFailed'), 'error'); return; }
      list = list.map((x) => this.normalize(x)).filter(Boolean);
      if (!list.length) { App.toast(t('importFailed'), 'error'); return; }
      // bring stores the templates reference, when included
      if (Array.isArray(data.stores)) {
        for (const s of data.stores) if (s && s.id && !App.state.stores.some((x) => x.id === s.id)) { App.state.stores.push(s); await DB.put('stores', s); }
      }
      for (const tp of list) {
        if (App.getTemplate(tp.id)) tp.id = E().uid('tpl');
        await App.addTemplate(tp);
      }
      App.toast(t('templatesImported', { n: list.length }), 'success');
      this.render();
    },
    async restoreStarters() {
      if (!(await App.confirm(t('confirmRestore')))) return;
      for (const tp of this.starters()) await App.addTemplate(tp);
      App.toast(t('startersRestored'), 'success');
      this.render();
    },

    init() {
      document.getElementById('tp-new-receipt').addEventListener('click', () => this.newTemplate('receipt'));
      document.getElementById('tp-new-sticker').addEventListener('click', () => this.newTemplate('sticker'));
      document.getElementById('tp-import').addEventListener('click', () => this.importFile());
      document.getElementById('tp-export-all').addEventListener('click', () => this.exportAll());
      document.getElementById('tp-restore').addEventListener('click', () => this.restoreStarters());
      document.getElementById('tp-kind').addEventListener('click', (e) => { const b = e.target.closest('[data-kind]'); if (b) { this.filter.kind = b.dataset.kind; this.render(); } });
      document.getElementById('tp-store').addEventListener('change', (e) => { this.filter.store = e.target.value; this.render(); });
      document.getElementById('tpl-grid').addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        const id = b.closest('.tpl-card').dataset.id;
        switch (b.dataset.act) {
          case 'open': App.openTemplate(id); break;
          case 'rename': this.rename(id); break;
          case 'dup': this.duplicate(id); break;
          case 'default': App.setDefaultTemplate(App.getTemplate(id)); this.render(); break;
          case 'export': this.exportOne(id); break;
          case 'print': Printing.openForTemplate(id); break;
          case 'del': this.remove(id); break;
          default: break;
        }
      });
    },
  };

  window.Templates = Templates;
})();
