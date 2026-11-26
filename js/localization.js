/* Localization: Arabic (RTL, default) and English (LTR) */
(function () {
  'use strict';

  const ar = {
    appName: 'مصمم الإيصالات', appTagline: 'إيصالات وملصقات شحن', loading: 'جارِ التحميل…',
    'nav.designer': 'المصمم', 'nav.data': 'إدخال البيانات', 'nav.orders': 'الطلبات', 'nav.templates': 'القوالب', 'nav.print': 'الطباعة', 'nav.settings': 'الإعدادات',
    saved: 'محفوظ', saving: 'جارِ الحفظ…', saveTip: 'حفظ (Ctrl+S)', printTip: 'طباعة (Ctrl+P)', themeTip: 'الوضع الليلي/النهاري',
    elements: 'العناصر', layers: 'الطبقات', properties: 'الخصائص', currentTemplate: 'القالب الحالي',
    undo: 'تراجع (Ctrl+Z)', redo: 'إعادة (Ctrl+Y)', zoomIn: 'تكبير', zoomOut: 'تصغير', zoomFit: 'ملاءمة الشاشة',
    grid: 'الشبكة', snap: 'الالتصاق والأدلة الذكية', rulers: 'المساطر',
    alignLeft: 'محاذاة لليسار', alignCenterH: 'توسيط أفقي', alignRight: 'محاذاة لليمين', alignTop: 'محاذاة للأعلى', alignMiddle: 'توسيط عمودي', alignBottom: 'محاذاة للأسفل',
    distributeH: 'توزيع أفقي', distributeV: 'توزيع عمودي',
    duplicate: 'تكرار', delete: 'حذف', copy: 'نسخ', paste: 'لصق', cut: 'قص', selectAll: 'تحديد الكل',
    previewWith: 'معاينة ببيانات', showPlaceholders: 'إظهار أسماء الحقول بدل البيانات', noOrder: '— بدون بيانات —',
    // palette
    'el.text': 'نص', 'el.field': 'حقل بيانات', 'el.image': 'شعار / صورة', 'el.barcode': 'باركود', 'el.qr': 'رمز QR', 'el.line': 'خط فاصل',
    'el.rect': 'مستطيل / إطار', 'el.icon': 'أيقونة', 'el.shape': 'شكل', 'el.static': 'نص ثابت', 'el.date': 'تاريخ ووقت', 'el.calc': 'حقل محسوب', 'el.table': 'جدول المنتجات',
    newText: 'نص جديد', staticText: 'نص ثابت',
    // properties
    pageSettings: 'إعدادات الصفحة', templateName: 'اسم القالب', templateType: 'نوع القالب', store: 'المتجر', noStore: '— عام —',
    paperSize: 'حجم المستند', width: 'العرض', height: 'الارتفاع', orientation: 'الاتجاه', swapWH: 'تبديل العرض والارتفاع',
    background: 'الخلفية', defaultFont: 'الخط الافتراضي', gridSize: 'حجم الشبكة (مم)', setDefault: 'تعيين كقالب افتراضي', isDefault: 'هذا هو القالب الافتراضي',
    content: 'المحتوى', positionSize: 'الموضع والأبعاد', typography: 'الخطوط والنص', appearance: 'المظهر',
    x: 'س (X)', y: 'ص (Y)', w: 'العرض', h: 'الارتفاع', rotation: 'الدوران°', alignToPage: 'محاذاة إلى الصفحة',
    fontFamily: 'نوع الخط', fontSize: 'الحجم (pt)', bold: 'عريض', italic: 'مائل', underline: 'تسطير', textAlign: 'محاذاة النص', vAlign: 'المحاذاة العمودية',
    lineHeight: 'ارتفاع السطر', letterSpacing: 'تباعد الأحرف', direction: 'اتجاه النص', textColor: 'لون النص',
    bgColor: 'لون الخلفية', borderColor: 'لون الحدود', borderWidth: 'سماكة الحدود (مم)', borderStyle: 'نمط الحدود', radius: 'تدوير الزوايا (مم)', padding: 'الحشو (مم)', opacity: 'الشفافية %',
    visible: 'ظاهر', locked: 'مقفل', layerOrder: 'ترتيب الطبقة', toFront: 'إلى الأمام', forward: 'للأمام خطوة', backward: 'للخلف خطوة', toBack: 'إلى الخلف',
    elementName: 'اسم العنصر', textContent: 'النص', insertField: 'إدراج حقل…', label: 'العنوان', dataField: 'حقل البيانات', showLabel: 'إظهار العنوان', separator: 'الفاصل',
    layout: 'التخطيط', layoutInline: 'في سطر', layoutSpread: 'على الطرفين', layoutStacked: 'فوق بعض', labelColor: 'لون العنوان', labelBold: 'عنوان عريض',
    imageSource: 'مصدر الصورة', uploadImage: 'رفع صورة', bindTo: 'ربط بـ', none: 'لا شيء', fit: 'الملاءمة', fitContain: 'احتواء', fitCover: 'تغطية', fitFill: 'تمديد', removeImage: 'إزالة الصورة',
    barcodeValue: 'قيمة الباركود', barcodeFormat: 'نوع الباركود', showText: 'إظهار الرقم', qrValue: 'محتوى QR', ecc: 'تصحيح الأخطاء',
    lineOrientation: 'اتجاه الخط', horizontal: 'أفقي', vertical: 'عمودي', thickness: 'السماكة (مم)', lineStyle: 'نمط الخط', color: 'اللون',
    solid: 'متصل', dashed: 'متقطع', dotted: 'منقط', double: 'مزدوج',
    icon: 'الأيقونة', shape: 'الشكل', fill: 'التعبئة', stroke: 'لون الإطار', strokeWidth: 'سماكة الإطار (مم)',
    dateSource: 'المصدر', dateNow: 'وقت الطباعة', dateOrder: 'تاريخ الطلب', dateFormat: 'التنسيق', prefix: 'بادئة', suffix: 'لاحقة',
    formula: 'المعادلة', decimals: 'المنازل العشرية', auto: 'تلقائي', calcHelp: 'استخدم الحقول والأرقام والعمليات + − × ÷ ( )',
    columns: 'الأعمدة', showHeader: 'إظهار رأس الجدول', headerBg: 'خلفية الرأس', rowLines: 'خطوط الصفوف', addColumn: 'إضافة عمود', colWidth: 'العرض %',
    transparent: 'شفاف', multiSelected: 'عناصر محددة', multiHint: 'التعديلات تُطبق على كل العناصر المحددة.',
    rtl: 'يمين ← يسار', ltr: 'يسار → يمين', autoDir: 'تلقائي',
    // pages
    page: 'صفحة', addPage: 'إضافة صفحة', duplicatePage: 'تكرار الصفحة', deletePage: 'حذف الصفحة',
    // data entry
    newOrder: 'طلب جديد', template: 'القالب', receipt: 'إيصال', sticker: 'ملصق', openInDesigner: 'فتح في المصمم', print: 'طباعة',
    'sec.order': 'معلومات الطلب', 'sec.customer': 'العميل', 'sec.items': 'المنتجات', 'sec.charges': 'المبالغ', 'sec.shipping': 'الشحن والتوصيل', 'sec.notes': 'الملاحظات', 'sec.custom': 'حقول مخصصة',
    addItem: 'إضافة منتج', addCustomField: 'إضافة حقل مخصص', fieldKey: 'المفتاح', fieldValue: 'القيمة', remove: 'إزالة',
    // fields
    'f.store_name': 'اسم المتجر', 'f.store_phone': 'هاتف المتجر', 'f.store_phone2': 'هاتف المتجر 2', 'f.store_address': 'عنوان المتجر', 'f.store_logo': 'شعار المتجر', 'f.return_policy': 'سياسة الإرجاع والاستبدال', 'f.footer_text': 'نص التذييل',
    'f.receipt_number': 'رقم الإيصال', 'f.order_number': 'رقم الطلب', 'f.order_date': 'تاريخ الطلب', 'f.customer_name': 'اسم العميل', 'f.customer_phone': 'هاتف العميل', 'f.customer_phone2': 'هاتف ثانوي',
    'f.customer_address': 'العنوان الكامل', 'f.city': 'المدينة', 'f.district': 'المنطقة / الحي', 'f.city_district': 'المدينة - المنطقة',
    'f.product_name': 'اسم المنتج', 'f.product_description': 'وصف المنتج', 'f.quantity': 'الكمية', 'f.product_price': 'سعر المنتج', 'f.subtotal': 'المجموع الفرعي',
    'f.delivery_fee': 'أجور التوصيل', 'f.discount': 'الخصم', 'f.total': 'الإجمالي', 'f.paid_amount': 'المبلغ المدفوع', 'f.cod_amount': 'مبلغ الدفع عند الاستلام',
    'f.payment_method': 'طريقة الدفع', 'f.payment_status': 'حالة الدفع', 'f.status': 'حالة الطلب', 'f.delivery_company': 'شركة التوصيل', 'f.delivery_agent': 'المندوب',
    'f.customer_notes': 'ملاحظات العميل', 'f.special_instructions': 'تعليمات خاصة', 'f.sender_name': 'اسم المرسل', 'f.sender_phone': 'هاتف المرسل',
    'f.package_number': 'رقم الطرد', 'f.packages_count': 'عدد الطرود', 'f.weight': 'الوزن', 'f.items_count': 'عدد الأصناف', 'f.currency': 'العملة', 'f.today': 'تاريخ اليوم', 'f.now': 'التاريخ والوقت الآن',
    'f.item_name': 'المنتج', 'f.item_desc': 'الوصف', 'f.item_qty': 'الكمية', 'f.item_price': 'السعر', 'f.item_total': 'المجموع', 'f.item_index': '#',
    // statuses
    'st.new': 'جديد', 'st.preparing': 'قيد التجهيز', 'st.ready': 'جاهز للتوصيل', 'st.shipped': 'تم الشحن', 'st.delivered': 'تم التسليم', 'st.returned': 'مرتجع', 'st.cancelled': 'ملغي',
    'ps.unpaid': 'غير مدفوع', 'ps.paid': 'مدفوع', 'ps.partial': 'مدفوع جزئياً', 'ps.cod': 'الدفع عند الاستلام',
    'pm.cash': 'نقداً', 'pm.cod': 'الدفع عند الاستلام', 'pm.card': 'بطاقة', 'pm.transfer': 'تحويل بنكي', 'pm.wallet': 'محفظة إلكترونية',
    allStatuses: 'كل حالات الطلب', allPayments: 'كل حالات الدفع',
    // orders
    searchOrders: 'بحث برقم الطلب، الاسم، الهاتف…', filterCustomer: 'فلترة بالعميل', from: 'من', to: 'إلى', clearFilters: 'مسح الفلاتر', actions: 'إجراءات',
    printSelectedReceipts: 'طباعة الإيصالات المحددة', printSelectedStickers: 'طباعة الملصقات المحددة', printAllFiltered: 'طباعة كل الظاهر',
    edit: 'تعديل', printReceipt: 'طباعة إيصال', printSticker: 'طباعة ملصق',
    noOrders: 'لا توجد طلبات بعد', noOrdersHint: 'أنشئ طلباً جديداً أو حمّل بيانات تجريبية من الإعدادات.', noMatches: 'لا توجد نتائج مطابقة للفلاتر',
    ordersSummary: '{shown} من {total} طلب · المحدد: {sel}', selectOrdersFirst: 'حدد طلباً واحداً على الأقل',
    confirmDeleteOrder: 'حذف الطلب {n}؟ لا يمكن التراجع.', orderDeleted: 'تم حذف الطلب', orderDuplicated: 'تم تكرار الطلب', orderCreated: 'تم إنشاء طلب جديد',
    loadDemo: 'تحميل بيانات تجريبية',
    // templates
    newReceiptTemplate: 'قالب إيصال جديد', newStickerTemplate: 'قالب ملصق جديد', importTemplates: 'استيراد قوالب', exportTemplates: 'تصدير كل القوالب', restoreStarters: 'استعادة القوالب الجاهزة',
    all: 'الكل', receipts: 'الإيصالات', stickers: 'الملصقات', allStores: 'كل المتاجر', rename: 'إعادة تسمية', exportJson: 'تصدير JSON', default: 'افتراضي',
    noTemplates: 'لا توجد قوالب', newTemplateName: 'قالب جديد', chooseStickerSize: 'اختر حجم الملصق', chooseReceiptSize: 'اختر حجم الإيصال', customSize: 'حجم مخصص',
    templateCreated: 'تم إنشاء القالب', templateDeleted: 'تم حذف القالب', templateDuplicated: 'تم تكرار القالب', templatesImported: 'تم استيراد {n} قالب', templateDefaultSet: 'تم التعيين كافتراضي',
    confirmDeleteTemplate: 'حذف القالب "{n}"؟', cannotDeleteLast: 'لا يمكن حذف آخر قالب', copySuffix: ' (نسخة)', startersRestored: 'تمت إضافة القوالب الجاهزة',
    confirmRestore: 'إضافة نسخ جديدة من كل القوالب الجاهزة؟ لن تُحذف قوالبك الحالية.', withBasicLayout: 'مع تخطيط أساسي جاهز',
    // print
    printNow: 'طباعة الآن', printSource: 'المستندات', srcCurrent: 'الطلب الحالي', srcSelected: 'الطلبات المحددة', srcAll: 'كل الطلبات', srcBlank: 'القالب فقط (بدون بيانات)',
    copies: 'عدد النسخ', paper: 'الورق', paperDoc: 'بحجم المستند (طابعة ملصقات)', roll80: 'ورق حراري 80 مم', roll58: 'ورق حراري 58 مم', custom: 'مخصص',
    portrait: 'طولي', landscape: 'عرضي', margins: 'الهوامش (مم)', top: 'أعلى', bottom: 'أسفل', left: 'يسار', right: 'يمين', gap: 'المسافة بين المستندات (مم)',
    layoutMode: 'التوزيع', layoutAuto: 'أكبر عدد ممكن في الصفحة', layoutSingle: 'مستند واحد لكل صفحة', fitToPaper: 'تصغير ليلائم الورق', cutMarks: 'خطوط القص', blackWhite: 'أبيض وأسود',
    printSummary: '{docs} مستند · {per} في الصفحة · {pages} صفحة · الورق {w}×{h} مم', docTooBig: 'المستند أكبر من الورق — فعّل "تصغير ليلائم الورق" أو اختر ورقاً أكبر.',
    nothingToPrint: 'لا يوجد ما يُطبع', preparingPrint: 'جارِ تجهيز الطباعة…', printTemplate: 'قالب الطباعة', useDefaultFor: 'الافتراضي',
    // settings
    stores: 'المتاجر', addStore: 'إضافة متجر', storeName: 'اسم المتجر', logo: 'الشعار', general: 'عام', currency: 'العملة', language: 'اللغة', theme: 'المظهر', light: 'فاتح', dark: 'داكن',
    defaultSender: 'المرسل الافتراضي', dataManagement: 'إدارة البيانات', exportAll: 'تصدير نسخة احتياطية كاملة', importBackup: 'استيراد نسخة احتياطية', clearAll: 'حذف كل البيانات',
    exportOrders: 'تصدير الطلبات', confirmClearAll: 'سيتم حذف كل الطلبات والقوالب والمتاجر من هذا المتصفح. اكتب "حذف" للتأكيد.', typeToConfirm: 'حذف',
    dataCleared: 'تم حذف كل البيانات', backupImported: 'تم استيراد النسخة الاحتياطية', importFailed: 'فشل الاستيراد: الملف غير صالح', exported: 'تم التصدير',
    confirmImportBackup: 'استبدال كل البيانات الحالية بالنسخة الاحتياطية؟', importMerge: 'دمج', importReplace: 'استبدال',
    demoLoaded: 'تم تحميل البيانات التجريبية', confirmDeleteStore: 'حذف المتجر "{n}"؟',
    storageNote: 'تُحفظ البيانات في هذا المتصفح فقط (IndexedDB و LocalStorage) على هذا الجهاز. ليست قاعدة بيانات مشتركة عبر الإنترنت — استخدم التصدير للنسخ الاحتياطي أو النقل إلى جهاز آخر.',
    storageUsage: 'المساحة المستخدمة: {used} من {quota}', orderNumbering: 'ترقيم الطلبات', nextNumber: 'الرقم التالي', orderPrefix: 'بادئة رقم الطلب', receiptPrefix: 'بادئة رقم الإيصال',
    shortcuts: 'اختصارات لوحة المفاتيح', about: 'حول التطبيق',
    // general ui
    save: 'حفظ', cancel: 'إلغاء', ok: 'موافق', confirm: 'تأكيد', close: 'إغلاق', yes: 'نعم', name: 'الاسم', phone: 'الهاتف', address: 'العنوان',
    savedOk: 'تم الحفظ', copied: 'تم النسخ', pasted: 'تم اللصق', deleted: 'تم الحذف', nothingSelected: 'لم يتم تحديد أي عنصر',
    emptyPageHint: 'اختر عنصراً من القائمة لإضافته، أو حدد عنصراً لتعديل خصائصه.', invalidBarcode: 'قيمة باركود غير صالحة', logoPlaceholder: 'الشعار',
    unsupportedFile: 'ملف غير مدعوم', imageTooLarge: 'تم تصغير الصورة لتقليل الحجم',
  };

  const en = {
    appName: 'Receipt Designer', appTagline: 'Receipts & shipping labels', loading: 'Loading…',
    'nav.designer': 'Designer', 'nav.data': 'Data entry', 'nav.orders': 'Orders', 'nav.templates': 'Templates', 'nav.print': 'Print', 'nav.settings': 'Settings',
    saved: 'Saved', saving: 'Saving…', saveTip: 'Save (Ctrl+S)', printTip: 'Print (Ctrl+P)', themeTip: 'Dark / light mode',
    elements: 'Elements', layers: 'Layers', properties: 'Properties', currentTemplate: 'Current template',
    undo: 'Undo (Ctrl+Z)', redo: 'Redo (Ctrl+Y)', zoomIn: 'Zoom in', zoomOut: 'Zoom out', zoomFit: 'Fit to screen',
    grid: 'Grid', snap: 'Snapping & smart guides', rulers: 'Rulers',
    alignLeft: 'Align left', alignCenterH: 'Center horizontally', alignRight: 'Align right', alignTop: 'Align top', alignMiddle: 'Center vertically', alignBottom: 'Align bottom',
    distributeH: 'Distribute horizontally', distributeV: 'Distribute vertically',
    duplicate: 'Duplicate', delete: 'Delete', copy: 'Copy', paste: 'Paste', cut: 'Cut', selectAll: 'Select all',
    previewWith: 'Preview with', showPlaceholders: 'Show field names instead of data', noOrder: '— no data —',
    'el.text': 'Text', 'el.field': 'Data field', 'el.image': 'Logo / image', 'el.barcode': 'Barcode', 'el.qr': 'QR code', 'el.line': 'Separator line',
    'el.rect': 'Rectangle / border', 'el.icon': 'Icon', 'el.shape': 'Shape', 'el.static': 'Static text', 'el.date': 'Date & time', 'el.calc': 'Calculated field', 'el.table': 'Items table',
    newText: 'New text', staticText: 'Static text',
    pageSettings: 'Page settings', templateName: 'Template name', templateType: 'Template type', store: 'Store', noStore: '— General —',
    paperSize: 'Document size', width: 'Width', height: 'Height', orientation: 'Orientation', swapWH: 'Swap width/height',
    background: 'Background', defaultFont: 'Default font', gridSize: 'Grid size (mm)', setDefault: 'Set as default template', isDefault: 'This is the default template',
    content: 'Content', positionSize: 'Position & size', typography: 'Typography', appearance: 'Appearance',
    x: 'X', y: 'Y', w: 'Width', h: 'Height', rotation: 'Rotation°', alignToPage: 'Align to page',
    fontFamily: 'Font family', fontSize: 'Size (pt)', bold: 'Bold', italic: 'Italic', underline: 'Underline', textAlign: 'Text alignment', vAlign: 'Vertical alignment',
    lineHeight: 'Line height', letterSpacing: 'Letter spacing', direction: 'Text direction', textColor: 'Text color',
    bgColor: 'Background color', borderColor: 'Border color', borderWidth: 'Border width (mm)', borderStyle: 'Border style', radius: 'Corner radius (mm)', padding: 'Padding (mm)', opacity: 'Opacity %',
    visible: 'Visible', locked: 'Locked', layerOrder: 'Layer order', toFront: 'Bring to front', forward: 'Bring forward', backward: 'Send backward', toBack: 'Send to back',
    elementName: 'Element name', textContent: 'Text', insertField: 'Insert field…', label: 'Label', dataField: 'Data field', showLabel: 'Show label', separator: 'Separator',
    layout: 'Layout', layoutInline: 'Inline', layoutSpread: 'Spread', layoutStacked: 'Stacked', labelColor: 'Label color', labelBold: 'Bold label',
    imageSource: 'Image source', uploadImage: 'Upload image', bindTo: 'Bind to', none: 'None', fit: 'Fit', fitContain: 'Contain', fitCover: 'Cover', fitFill: 'Stretch', removeImage: 'Remove image',
    barcodeValue: 'Barcode value', barcodeFormat: 'Barcode type', showText: 'Show number', qrValue: 'QR content', ecc: 'Error correction',
    lineOrientation: 'Orientation', horizontal: 'Horizontal', vertical: 'Vertical', thickness: 'Thickness (mm)', lineStyle: 'Line style', color: 'Color',
    solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted', double: 'Double',
    icon: 'Icon', shape: 'Shape', fill: 'Fill', stroke: 'Stroke', strokeWidth: 'Stroke width (mm)',
    dateSource: 'Source', dateNow: 'Print time', dateOrder: 'Order date', dateFormat: 'Format', prefix: 'Prefix', suffix: 'Suffix',
    formula: 'Formula', decimals: 'Decimals', auto: 'Auto', calcHelp: 'Use fields, numbers and + − × ÷ ( )',
    columns: 'Columns', showHeader: 'Show header', headerBg: 'Header background', rowLines: 'Row lines', addColumn: 'Add column', colWidth: 'Width %',
    transparent: 'Transparent', multiSelected: 'elements selected', multiHint: 'Changes apply to all selected elements.',
    rtl: 'Right → left', ltr: 'Left → right', autoDir: 'Auto',
    page: 'Page', addPage: 'Add page', duplicatePage: 'Duplicate page', deletePage: 'Delete page',
    newOrder: 'New order', template: 'Template', receipt: 'Receipt', sticker: 'Sticker', openInDesigner: 'Open in designer', print: 'Print',
    'sec.order': 'Order', 'sec.customer': 'Customer', 'sec.items': 'Products', 'sec.charges': 'Amounts', 'sec.shipping': 'Shipping & delivery', 'sec.notes': 'Notes', 'sec.custom': 'Custom fields',
    addItem: 'Add product', addCustomField: 'Add custom field', fieldKey: 'Key', fieldValue: 'Value', remove: 'Remove',
    'f.store_name': 'Store name', 'f.store_phone': 'Store phone', 'f.store_phone2': 'Store phone 2', 'f.store_address': 'Store address', 'f.store_logo': 'Store logo', 'f.return_policy': 'Return & exchange policy', 'f.footer_text': 'Footer text',
    'f.receipt_number': 'Receipt no.', 'f.order_number': 'Order no.', 'f.order_date': 'Order date', 'f.customer_name': 'Customer name', 'f.customer_phone': 'Customer phone', 'f.customer_phone2': 'Secondary phone',
    'f.customer_address': 'Full address', 'f.city': 'City', 'f.district': 'District', 'f.city_district': 'City - district',
    'f.product_name': 'Product name', 'f.product_description': 'Product description', 'f.quantity': 'Quantity', 'f.product_price': 'Product price', 'f.subtotal': 'Subtotal',
    'f.delivery_fee': 'Delivery fee', 'f.discount': 'Discount', 'f.total': 'Total', 'f.paid_amount': 'Paid amount', 'f.cod_amount': 'COD amount',
    'f.payment_method': 'Payment method', 'f.payment_status': 'Payment status', 'f.status': 'Order status', 'f.delivery_company': 'Delivery company', 'f.delivery_agent': 'Delivery agent',
    'f.customer_notes': 'Customer notes', 'f.special_instructions': 'Special instructions', 'f.sender_name': 'Sender name', 'f.sender_phone': 'Sender phone',
    'f.package_number': 'Package no.', 'f.packages_count': 'Packages', 'f.weight': 'Weight', 'f.items_count': 'Items count', 'f.currency': 'Currency', 'f.today': 'Today', 'f.now': 'Now',
    'f.item_name': 'Product', 'f.item_desc': 'Description', 'f.item_qty': 'Qty', 'f.item_price': 'Price', 'f.item_total': 'Total', 'f.item_index': '#',
    'st.new': 'New', 'st.preparing': 'Preparing', 'st.ready': 'Ready for delivery', 'st.shipped': 'Shipped', 'st.delivered': 'Delivered', 'st.returned': 'Returned', 'st.cancelled': 'Cancelled',
    'ps.unpaid': 'Unpaid', 'ps.paid': 'Paid', 'ps.partial': 'Partially paid', 'ps.cod': 'Cash on delivery',
    'pm.cash': 'Cash', 'pm.cod': 'Cash on delivery', 'pm.card': 'Card', 'pm.transfer': 'Bank transfer', 'pm.wallet': 'E-wallet',
    allStatuses: 'All order statuses', allPayments: 'All payment statuses',
    searchOrders: 'Search order no., name, phone…', filterCustomer: 'Filter by customer', from: 'From', to: 'To', clearFilters: 'Clear filters', actions: 'Actions',
    printSelectedReceipts: 'Print selected receipts', printSelectedStickers: 'Print selected stickers', printAllFiltered: 'Print all shown',
    edit: 'Edit', printReceipt: 'Print receipt', printSticker: 'Print sticker',
    noOrders: 'No orders yet', noOrdersHint: 'Create a new order or load demo data from Settings.', noMatches: 'No orders match the filters',
    ordersSummary: '{shown} of {total} orders · selected: {sel}', selectOrdersFirst: 'Select at least one order',
    confirmDeleteOrder: 'Delete order {n}? This cannot be undone.', orderDeleted: 'Order deleted', orderDuplicated: 'Order duplicated', orderCreated: 'New order created',
    loadDemo: 'Load demo data',
    newReceiptTemplate: 'New receipt template', newStickerTemplate: 'New sticker template', importTemplates: 'Import templates', exportTemplates: 'Export all templates', restoreStarters: 'Restore starter templates',
    all: 'All', receipts: 'Receipts', stickers: 'Stickers', allStores: 'All stores', rename: 'Rename', exportJson: 'Export JSON', default: 'Default',
    noTemplates: 'No templates', newTemplateName: 'New template', chooseStickerSize: 'Choose sticker size', chooseReceiptSize: 'Choose receipt size', customSize: 'Custom size',
    templateCreated: 'Template created', templateDeleted: 'Template deleted', templateDuplicated: 'Template duplicated', templatesImported: '{n} template(s) imported', templateDefaultSet: 'Set as default',
    confirmDeleteTemplate: 'Delete template "{n}"?', cannotDeleteLast: 'Cannot delete the last template', copySuffix: ' (copy)', startersRestored: 'Starter templates added',
    confirmRestore: 'Add fresh copies of all starter templates? Your templates will not be removed.', withBasicLayout: 'With a basic ready layout',
    printNow: 'Print now', printSource: 'Documents', srcCurrent: 'Current order', srcSelected: 'Selected orders', srcAll: 'All orders', srcBlank: 'Template only (no data)',
    copies: 'Copies', paper: 'Paper', paperDoc: 'Same as document (label printer)', roll80: '80 mm thermal roll', roll58: '58 mm thermal roll', custom: 'Custom',
    portrait: 'Portrait', landscape: 'Landscape', margins: 'Margins (mm)', top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right', gap: 'Gap between documents (mm)',
    layoutMode: 'Layout', layoutAuto: 'As many as fit per page', layoutSingle: 'One document per page', fitToPaper: 'Shrink to fit paper', cutMarks: 'Cut lines', blackWhite: 'Black & white',
    printSummary: '{docs} document(s) · {per} per page · {pages} page(s) · paper {w}×{h} mm', docTooBig: 'Document is larger than the paper — enable "Shrink to fit paper" or choose larger paper.',
    nothingToPrint: 'Nothing to print', preparingPrint: 'Preparing print…', printTemplate: 'Print template', useDefaultFor: 'Default',
    stores: 'Stores', addStore: 'Add store', storeName: 'Store name', logo: 'Logo', general: 'General', currency: 'Currency', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark',
    defaultSender: 'Default sender', dataManagement: 'Data management', exportAll: 'Export full backup', importBackup: 'Import backup', clearAll: 'Delete all data',
    exportOrders: 'Export orders', confirmClearAll: 'All orders, templates and stores will be deleted from this browser. Type "delete" to confirm.', typeToConfirm: 'delete',
    dataCleared: 'All data deleted', backupImported: 'Backup imported', importFailed: 'Import failed: invalid file', exported: 'Exported',
    confirmImportBackup: 'Replace all current data with the backup?', importMerge: 'Merge', importReplace: 'Replace',
    demoLoaded: 'Demo data loaded', confirmDeleteStore: 'Delete store "{n}"?',
    storageNote: 'Data is stored only in this browser on this device (IndexedDB and LocalStorage). It is not a shared online database — use export to back up or move data to another device.',
    storageUsage: 'Storage used: {used} of {quota}', orderNumbering: 'Order numbering', nextNumber: 'Next number', orderPrefix: 'Order no. prefix', receiptPrefix: 'Receipt no. prefix',
    shortcuts: 'Keyboard shortcuts', about: 'About',
    save: 'Save', cancel: 'Cancel', ok: 'OK', confirm: 'Confirm', close: 'Close', yes: 'Yes', name: 'Name', phone: 'Phone', address: 'Address',
    savedOk: 'Saved', copied: 'Copied', pasted: 'Pasted', deleted: 'Deleted', nothingSelected: 'Nothing selected',
    emptyPageHint: 'Pick an element from the list to add it, or select an element to edit its properties.', invalidBarcode: 'Invalid barcode value', logoPlaceholder: 'Logo',
    unsupportedFile: 'Unsupported file', imageTooLarge: 'Image was downscaled to save space',
  };

  const I18N = {
    dicts: { ar, en },
    lang: 'ar',
    t(key, vars) {
      let s = (this.dicts[this.lang] && this.dicts[this.lang][key]);
      if (s == null) s = this.dicts.en[key];
      if (s == null) s = key;
      if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
      return s;
    },
    dir() { return this.lang === 'ar' ? 'rtl' : 'ltr'; },
    set(lang) {
      this.lang = lang === 'en' ? 'en' : 'ar';
      document.documentElement.lang = this.lang;
      document.documentElement.dir = this.dir();
      document.title = this.lang === 'ar' ? 'مصمم إيصالات التوصيل والملصقات' : 'Delivery Receipt & Label Designer';
      this.apply(document);
    },
    apply(root) {
      root.querySelectorAll('[data-i18n]').forEach((n) => {
        const key = n.getAttribute('data-i18n');
        // keep icon children: replace only text nodes / span text
        n.textContent = this.t(key);
      });
      root.querySelectorAll('[data-i18n-title]').forEach((n) => { n.title = this.t(n.getAttribute('data-i18n-title')); n.setAttribute('aria-label', n.title); });
      root.querySelectorAll('[data-i18n-placeholder]').forEach((n) => { n.placeholder = this.t(n.getAttribute('data-i18n-placeholder')); });
    },
  };

  window.I18N = I18N;
  window.t = (k, v) => I18N.t(k, v);
})();
