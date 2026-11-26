/* Element definitions, icons, data placeholders and the shared renderer.
   The same renderer is used by the editor canvas, previews and print output,
   so what you see is exactly what gets printed. All geometry is in millimetres. */
(function () {
  'use strict';

  const PX_PER_MM = 96 / 25.4;

  /* ------------------------------------------------------------------ icons */
  const ICONS = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    package: '<path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    card: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
    refresh: '<polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    umbrella: '<path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>',
    recycle: '<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L7.2 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.5-2.7l-1.2-2.1"/><path d="M14 16l-3 3 3 3"/><path d="M8.3 13.6L7.2 9.5 3.1 10.6"/><path d="M9.3 5.8l1.1-1.9A1.8 1.8 0 0 1 12 3a1.8 1.8 0 0 1 1.5.9l3.9 6.8"/><path d="M13.4 9.6l4.1 1.1 1.1-4.1"/>',
    thisWayUp: '<path d="M8 18V4M4.5 7.5L8 4l3.5 3.5M16 18V4M12.5 7.5L16 4l3.5 3.5M3 21h18"/>',
    handleCare: '<rect x="8" y="3" width="8" height="7"/><path d="M2 13l4 1 4 3h6a2 2 0 0 0 0-4h-4"/><path d="M22 13l-4 1"/><path d="M2 19l5 2h10l5-2"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    fragile: '<path d="M8 2h8l-1 7a3 3 0 0 1-6 0z"/><line x1="12" y1="12" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/><path d="M11 2l1 3-1.5 2"/>',
    // UI icons
    undo: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
    redo: '<polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>',
    zoomIn: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
    zoomOut: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    magnet: '<path d="M4 3h5v8a3 3 0 0 0 6 0V3h5v8a8 8 0 0 1-16 0z"/><line x1="4" y1="8" x2="9" y2="8"/><line x1="15" y1="8" x2="20" y2="8"/>',
    ruler: '<path d="M21.3 8.7L8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z"/><path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    field: '<rect x="2" y="7" width="20" height="10" rx="2"/><line x1="6" y1="10" x2="6" y2="14"/><path d="M10 12h8"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    barcode: '<path d="M3 5v14M6 5v14M8 5v14M11 5v14M14 5v14M16 5v14M19 5v14M21 5v14"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14h1"/>',
    minus: '<line x1="4" y1="12" x2="20" y2="12"/>',
    square: '<rect x="3" y="3" width="18" height="18" rx="2"/>',
    shapes: '<circle cx="7" cy="17" r="4"/><path d="M12 3l4.5 7.5h-9z"/><rect x="13" y="13" width="8" height="8"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    quote: '<path d="M4 6h16M4 12h10M4 18h13"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    chevronDown: '<polyline points="6 9 12 15 18 9"/>',
    chevronUp: '<polyline points="18 15 12 9 6 15"/>',
    chevronsUp: '<polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/>',
    chevronsDown: '<polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
    rotate: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    alignLeft: '<line x1="4" y1="3" x2="4" y2="21"/><rect x="7" y="6" width="13" height="4"/><rect x="7" y="14" width="8" height="4"/>',
    alignCenterH: '<line x1="12" y1="3" x2="12" y2="21"/><rect x="5" y="6" width="14" height="4"/><rect x="8" y="14" width="8" height="4"/>',
    alignRight: '<line x1="20" y1="3" x2="20" y2="21"/><rect x="4" y="6" width="13" height="4"/><rect x="9" y="14" width="8" height="4"/>',
    alignTop: '<line x1="3" y1="4" x2="21" y2="4"/><rect x="6" y="7" width="4" height="13"/><rect x="14" y="7" width="4" height="8"/>',
    alignMiddle: '<line x1="3" y1="12" x2="21" y2="12"/><rect x="6" y="5" width="4" height="14"/><rect x="14" y="8" width="4" height="8"/>',
    alignBottom: '<line x1="3" y1="20" x2="21" y2="20"/><rect x="6" y="4" width="4" height="13"/><rect x="14" y="9" width="4" height="8"/>',
    distributeH: '<line x1="3" y1="3" x2="3" y2="21"/><line x1="21" y1="3" x2="21" y2="21"/><rect x="9" y="7" width="6" height="10"/>',
    distributeV: '<line x1="3" y1="3" x2="21" y2="3"/><line x1="3" y1="21" x2="21" y2="21"/><rect x="7" y="9" width="10" height="6"/>',
    textRight: '<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="10" x2="9" y2="10"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/>',
    textCenter: '<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="10" x2="7" y2="10"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="7" y2="18"/>',
    textLeft: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="15" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="15" y2="18"/>',
    textJustify: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/>',
    bold: '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
    italic: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
    underline: '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  };
  const DESIGN_ICONS = ['phone', 'pin', 'truck', 'package', 'user', 'calendar', 'cash', 'dollar', 'home', 'bag', 'file', 'alert', 'checkCircle', 'clock', 'mail', 'globe', 'card', 'arrowUp', 'scissors', 'refresh', 'star', 'heart', 'tag', 'droplet', 'fragile', 'hash', 'umbrella', 'recycle', 'thisWayUp', 'handleCare'];

  function icon(name, cls) {
    const body = ICONS[name] || ICONS.star;
    return `<svg class="ico ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  /* ------------------------------------------------------------ utilities */
  let idc = 0;
  function uid(prefix) { idc = (idc + 1) % 1e6; return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + idc.toString(36); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function round(n, p) { const f = Math.pow(10, p == null ? 2 : p); return Math.round(n * f) / f; }

  function fmtNum(n, decimals) {
    n = Number(n) || 0;
    const d = decimals == null || decimals < 0 ? (window.Settings ? Settings.get('decimals') : 0) : decimals;
    return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtDate(d, fmt) {
    if (!(d instanceof Date) || isNaN(d)) return '';
    return (fmt || 'YYYY/MM/DD').replace(/YYYY|MM|DD|HH|hh|mm|ss|A/g, (tk) => {
      switch (tk) {
        case 'YYYY': return d.getFullYear();
        case 'MM': return pad(d.getMonth() + 1);
        case 'DD': return pad(d.getDate());
        case 'HH': return pad(d.getHours());
        case 'hh': return pad(((d.getHours() + 11) % 12) + 1);
        case 'mm': return pad(d.getMinutes());
        case 'ss': return pad(d.getSeconds());
        case 'A': return d.getHours() < 12 ? (I18N.lang === 'ar' ? 'ص' : 'AM') : (I18N.lang === 'ar' ? 'م' : 'PM');
        default: return tk;
      }
    });
  }
  function parseDate(s) { if (!s) return null; const d = new Date(s); return isNaN(d) ? null : d; }

  /* -------------------------------------------------------- placeholders */
  // Key list used by the "insert field" menus, grouped for the UI.
  const FIELD_GROUPS = [
    ['store', ['store_name', 'store_phone', 'store_phone2', 'store_address', 'return_policy', 'footer_text']],
    ['order', ['receipt_number', 'order_number', 'order_date', 'status', 'payment_method', 'payment_status']],
    ['customer', ['customer_name', 'customer_phone', 'customer_phone2', 'customer_address', 'city', 'district', 'city_district']],
    ['items', ['product_name', 'product_description', 'quantity', 'product_price', 'items_count']],
    ['charges', ['subtotal', 'delivery_fee', 'discount', 'total', 'paid_amount', 'cod_amount', 'currency']],
    ['shipping', ['delivery_company', 'delivery_agent', 'sender_name', 'sender_phone', 'package_number', 'packages_count', 'weight', 'customer_notes', 'special_instructions']],
    ['other', ['today', 'now']],
  ];
  const ALL_FIELDS = FIELD_GROUPS.reduce((a, g) => a.concat(g[1]), []);
  const NUMERIC_FIELDS = ['subtotal', 'delivery_fee', 'discount', 'total', 'paid_amount', 'cod_amount', 'quantity', 'product_price', 'items_count', 'packages_count'];

  function fieldLabel(key) {
    if (key && key.indexOf('custom_') === 0) return key.slice(7);
    const k = 'f.' + key; const s = t(k); return s === k ? key : s;
  }

  /** Replace {{key}} placeholders. ctx.raw keeps them visible; missing data renders empty. */
  // iso=true wraps each value in Unicode first-strong isolates so phone numbers,
  // codes and dates keep their order inside Arabic (RTL) text.
  function resolve(text, ctx, iso) {
    text = text == null ? '' : String(text);
    if (ctx && ctx.raw) return text;
    const data = (ctx && ctx.data) || {};
    return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => {
      const v = data[k] != null ? String(data[k]) : '';
      return iso && v && !/[\u0600-\u06FF]/.test(v) ? '\u2068' + v + '\u2069' : v;
    });
  }

  function evalFormula(formula, ctx) {
    const nums = (ctx && ctx.data && ctx.data.__num) || {};
    const data = (ctx && ctx.data) || {};
    let expr = String(formula || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => {
      let v = nums[k];
      if (v == null) v = parseFloat(String(data[k] == null ? '' : data[k]).replace(/,/g, ''));
      return '(' + (isFinite(v) ? Number(v) : 0) + ')';
    });
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!/^[\d\s.+\-*/()%]*$/.test(expr)) return NaN;
    if (!expr.trim()) return 0;
    try { const v = Function('"use strict";return (' + expr + ');')(); return isFinite(v) ? v : NaN; } catch (e) { return NaN; }
  }

  /* --------------------------------------------------- element defaults */
  function baseStyle() {
    const ar = !window.I18N || I18N.lang === 'ar';
    return {
      fontFamily: 'Cairo', fontSize: 10, bold: false, italic: false, underline: false,
      align: ar ? 'right' : 'left', valign: 'middle', lineHeight: 1.3, letterSpacing: 0, dir: ar ? 'rtl' : 'ltr',
      color: '#111111', bg: '', borderColor: '#111111', borderWidth: 0, borderStyle: 'solid', radius: 0, padding: 0, opacity: 100,
    };
  }

  const TYPES = {
    text: { icon: 'type', w: 50, h: 8, props: () => ({ text: t('newText') }) },
    static: { icon: 'quote', w: 50, h: 8, as: 'text', props: () => ({ text: t('staticText'), static: true }) },
    field: { icon: 'field', w: 60, h: 7, props: () => ({ label: t('f.customer_name'), key: 'customer_name', showLabel: true, sep: ': ', layout: 'inline', labelBold: true, labelColor: '' }) },
    image: { icon: 'image', w: 30, h: 20, props: () => ({ src: '', bind: 'store_logo', fit: 'contain' }) },
    barcode: { icon: 'barcode', w: 50, h: 15, props: () => ({ value: '{{order_number}}', format: 'CODE128', showText: true }), style: { fontSize: 8, align: 'center', dir: 'ltr', fontFamily: 'Arial' } },
    qr: { icon: 'qr', w: 20, h: 20, props: () => ({ value: '{{order_number}}', ecc: 'M' }) },
    line: { icon: 'minus', w: 60, h: 2, props: () => ({ orientation: 'h', lineStyle: 'solid', thickness: 0.4 }) },
    rect: { icon: 'square', w: 50, h: 30, props: () => ({}), style: { borderWidth: 0.4, radius: 1.5 } },
    icon: { icon: 'smile', w: 8, h: 8, props: () => ({ icon: 'phone', strokeWidth: 2 }) },
    shape: { icon: 'shapes', w: 20, h: 20, props: () => ({ shape: 'ellipse', fill: '#e5e7eb', stroke: '#111111', strokeWidth: 0.4 }) },
    date: { icon: 'calendar', w: 40, h: 7, props: () => ({ source: 'now', format: 'YYYY/MM/DD HH:mm', prefix: '' }) },
    calc: { icon: 'calculator', w: 60, h: 7, props: () => ({ label: t('f.total'), formula: '{{subtotal}} + {{delivery_fee}} - {{discount}}', decimals: -1, prefix: '', suffix: ' {{currency}}', layout: 'spread', showLabel: true, labelBold: false, sep: ': ' }), style: { bold: true } },
    table: {
      icon: 'table', w: 120, h: 30,
      props: () => ({
        columns: [
          { key: 'index', label: '#', width: 8, align: 'center' },
          { key: 'name', label: t('f.item_name'), width: 44, align: 'start' },
          { key: 'qty', label: t('f.item_qty'), width: 14, align: 'center' },
          { key: 'price', label: t('f.item_price'), width: 17, align: 'center' },
          { key: 'total', label: t('f.item_total'), width: 17, align: 'center' },
        ],
        showHeader: true, headerBg: '#f1f5f9', headerColor: '#111111', rowLines: true, lineColor: '#cbd5e1', cellPadding: 1, rowHeight: 0,
      }),
      style: { fontSize: 9, valign: 'top' },
    },
  };

  function create(type, opts) {
    const def = TYPES[type];
    if (!def) throw new Error('Unknown element type ' + type);
    const el = {
      id: uid('el'), type: def.as || type, name: t('el.' + type), x: 10, y: 10, w: def.w, h: def.h, rot: 0,
      hidden: false, locked: false, props: def.props(), style: Object.assign(baseStyle(), def.style || {}),
    };
    return Object.assign(el, opts || {});
  }

  /* ------------------------------------------------------------ shapes */
  function shapeSVG(p, w, h) {
    const sw = Math.max(0, Number(p.strokeWidth) || 0);
    const i = sw / 2;
    const W = Math.max(w, 0.1), H = Math.max(h, 0.1);
    const fill = p.fill || 'none', stroke = sw > 0 ? (p.stroke || '#000') : 'none';
    let body = '';
    const pts = (arr) => arr.map((q) => q[0].toFixed(3) + ',' + q[1].toFixed(3)).join(' ');
    switch (p.shape) {
      case 'triangle': body = `<polygon points="${pts([[W / 2, i], [W - i, H - i], [i, H - i]])}"/>`; break;
      case 'diamond': body = `<polygon points="${pts([[W / 2, i], [W - i, H / 2], [W / 2, H - i], [i, H / 2]])}"/>`; break;
      case 'hexagon': body = `<polygon points="${pts([[W * 0.25, i], [W * 0.75, i], [W - i, H / 2], [W * 0.75, H - i], [W * 0.25, H - i], [i, H / 2]])}"/>`; break;
      case 'star': {
        const arr = []; const cx = W / 2, cy = H / 2;
        for (let k = 0; k < 10; k++) {
          const r = k % 2 === 0 ? 1 : 0.42; const a = -Math.PI / 2 + k * Math.PI / 5;
          arr.push([cx + Math.cos(a) * (W / 2 - i) * r, cy + Math.sin(a) * (H / 2 - i) * r]);
        }
        body = `<polygon points="${pts(arr)}"/>`; break;
      }
      case 'arrow': body = `<polygon points="${pts([[i, H * 0.3], [W * 0.6, H * 0.3], [W * 0.6, i], [W - i, H / 2], [W * 0.6, H - i], [W * 0.6, H * 0.7], [i, H * 0.7]])}"/>`; break;
      case 'arrowLeft': body = `<polygon points="${pts([[W - i, H * 0.3], [W * 0.4, H * 0.3], [W * 0.4, i], [i, H / 2], [W * 0.4, H - i], [W * 0.4, H * 0.7], [W - i, H * 0.7]])}"/>`; break;
      case 'roundRect': { const r = Math.min(W, H) * 0.2; body = `<rect x="${i}" y="${i}" width="${Math.max(0, W - sw)}" height="${Math.max(0, H - sw)}" rx="${r}"/>`; break; }
      default: body = `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${Math.max(0, W / 2 - i)}" ry="${Math.max(0, H / 2 - i)}"/>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible"><g fill="${esc(fill)}" stroke="${esc(stroke)}" stroke-width="${sw}" stroke-linejoin="round">${body}</g></svg>`;
  }
  const SHAPES = ['ellipse', 'roundRect', 'triangle', 'diamond', 'hexagon', 'star', 'arrow', 'arrowLeft'];

  /* ---------------------------------------------------------- renderer */
  const VALIGN = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

  function textStyleCSS(s) {
    const parts = [
      `font-family:${fontStack(s.fontFamily)}`, `font-size:${Number(s.fontSize) || 10}pt`,
      `font-weight:${s.bold ? 700 : 400}`, `font-style:${s.italic ? 'italic' : 'normal'}`,
      `text-decoration:${s.underline ? 'underline' : 'none'}`, `text-align:${s.align || 'right'}`,
      `line-height:${Number(s.lineHeight) || 1.3}`, `letter-spacing:${Number(s.letterSpacing) || 0}pt`,
      `direction:${s.dir === 'auto' ? 'inherit' : (s.dir || 'rtl')}`, `color:${s.color || '#111'}`,
    ];
    return parts.join(';');
  }
  function fontStack(f) {
    f = f || 'Cairo';
    if (/^(serif|sans-serif|monospace)$/.test(f)) return f;
    return `'${f.replace(/'/g, '')}', 'Cairo', Tahoma, Arial, sans-serif`;
  }

  function render(el, ctx) {
    ctx = ctx || {};
    if (el.hidden && !ctx.editor) return null;
    const s = Object.assign(baseStyle(), el.style || {});
    const p = el.props || {};
    const n = document.createElement('div');
    n.className = 'el type-' + el.type + (el.hidden ? ' is-hidden' : '') + (el.locked ? ' is-locked' : '');
    n.dataset.id = el.id;
    n.style.cssText = `left:${el.x}mm;top:${el.y}mm;width:${el.w}mm;height:${el.h}mm;` +
      (el.rot ? `transform:rotate(${el.rot}deg);` : '') + `opacity:${(s.opacity == null ? 100 : s.opacity) / 100};`;

    const box = document.createElement('div');
    box.className = 'el-box';
    const bw = Number(s.borderWidth) || 0;
    let css = `justify-content:${VALIGN[s.valign] || 'center'};padding:${Number(s.padding) || 0}mm;` + textStyleCSS(s) + ';';
    if (s.bg && el.type !== 'line') css += `background:${s.bg};`;
    if (bw > 0 && el.type !== 'line') css += `border:${bw}mm ${s.borderStyle || 'solid'} ${s.borderColor || '#000'};`;
    if (s.radius) css += `border-radius:${s.radius}mm;`;
    if (s.dir === 'auto') box.setAttribute('dir', 'auto');
    box.style.cssText = css;
    n.appendChild(box);

    const R = (txt) => resolve(txt, ctx, true);
    const RV = (txt) => resolve(txt, ctx, false); // raw values for barcodes / QR

    switch (el.type) {
      case 'text': {
        const d = document.createElement('div');
        d.className = 'el-text';
        d.textContent = p.static ? (p.text || '') : R(p.text);
        box.appendChild(d);
        break;
      }
      case 'field': {
        const d = document.createElement('div');
        d.className = 'el-text field-' + (p.layout || 'inline');
        const val = ctx.raw ? '{{' + p.key + '}}' : R('{{' + p.key + '}}');
        if (p.showLabel !== false && p.label) {
          const l = document.createElement('span'); l.className = 'f-label';
          l.textContent = R(p.label) + (p.layout === 'inline' || !p.layout ? (p.sep == null ? ': ' : p.sep) : '');
          if (p.labelBold) l.style.fontWeight = '700';
          if (p.labelColor) l.style.color = p.labelColor;
          d.appendChild(l);
        }
        const v = document.createElement('span'); v.className = 'f-value'; v.textContent = val;
        d.appendChild(v);
        box.appendChild(d);
        break;
      }
      case 'calc': {
        const d = document.createElement('div');
        d.className = 'el-text field-' + (p.layout || 'inline');
        let out;
        if (ctx.raw) out = p.formula;
        else {
          const v = evalFormula(p.formula, ctx);
          out = isNaN(v) ? '—' : R(p.prefix || '') + '\u2068' + fmtNum(v, Number(p.decimals)) + '\u2069' + R(p.suffix || '');
          if (!ctx.data || !ctx.data.__num) out = '';
        }
        if (p.showLabel !== false && p.label) {
          const l = document.createElement('span'); l.className = 'f-label';
          l.textContent = R(p.label) + (p.layout === 'inline' ? (p.sep == null ? ': ' : p.sep) : '');
          if (p.labelBold === false) l.style.fontWeight = '400';
          if (p.labelBold) l.style.fontWeight = '700';
          if (p.labelColor) l.style.color = p.labelColor;
          d.appendChild(l);
        }
        const v = document.createElement('span'); v.className = 'f-value'; v.textContent = out;
        if (ctx.raw) v.style.fontSize = '0.8em';
        d.appendChild(v);
        box.appendChild(d);
        break;
      }
      case 'date': {
        const d = document.createElement('div'); d.className = 'el-text';
        if (ctx.raw) d.textContent = (p.prefix || '') + (p.source === 'order' ? '{{order_date}}' : p.format);
        else {
          let dt = new Date();
          if (p.source === 'order') dt = (ctx.data && ctx.data.__orderDate) ? new Date(ctx.data.__orderDate) : null;
          d.textContent = dt ? R(p.prefix || '') + '\u2068' + fmtDate(dt, p.format) + '\u2069' : '';
        }
        box.appendChild(d);
        break;
      }
      case 'image': {
        let src = p.src;
        if (p.bind) src = (ctx.data && ctx.data[p.bind]) || (ctx.data ? '' : p.src) || p.src;
        if (src) {
          const img = document.createElement('img');
          img.src = src; img.alt = ''; img.draggable = false;
          img.style.objectFit = p.fit === 'fill' ? 'fill' : (p.fit || 'contain');
          box.appendChild(img);
        } else if (ctx.editor) {
          box.classList.add('img-empty');
          box.innerHTML = icon('image') + `<span>${esc(p.bind ? fieldLabel(p.bind) : t('logoPlaceholder'))}</span>`;
        }
        break;
      }
      case 'barcode': {
        const value = ctx.raw ? '' : RV(p.value);
        const svg = Barcode.barcodeSVG(ctx.raw ? '123456789012' : value, p.format, s.color);
        const wrap = document.createElement('div'); wrap.className = 'bc-wrap';
        if (svg) {
          const bars = document.createElement('div'); bars.className = 'bc-bars'; bars.innerHTML = svg; wrap.appendChild(bars);
          if (p.showText !== false) {
            const tx = document.createElement('div'); tx.className = 'bc-text'; tx.textContent = ctx.raw ? p.value : value; wrap.appendChild(tx);
          }
        } else if (ctx.editor || value) {
          wrap.classList.add('bc-invalid'); wrap.textContent = value ? t('invalidBarcode') : p.value;
        }
        box.appendChild(wrap);
        break;
      }
      case 'qr': {
        const value = ctx.raw ? 'QR' : RV(p.value);
        const svg = Barcode.qrSVG(value, p.ecc, s.color);
        if (svg) { const q = document.createElement('div'); q.className = 'qr-wrap'; q.innerHTML = svg; box.appendChild(q); }
        break;
      }
      case 'line': {
        const ln = document.createElement('div');
        const th = Number(p.thickness) || 0.3;
        const st = p.lineStyle || 'solid';
        const bstyle = st === 'double' ? `${Math.max(th * 3, 0.6)}mm double` : `${th}mm ${st}`;
        if (p.orientation === 'v') ln.style.cssText = `position:absolute;top:0;bottom:0;left:50%;transform:translateX(-50%);border-left:${bstyle} ${s.color || '#000'};`;
        else ln.style.cssText = `position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);border-top:${bstyle} ${s.color || '#000'};`;
        box.style.padding = '0';
        box.appendChild(ln);
        break;
      }
      case 'rect': break;
      case 'icon': {
        const w = document.createElement('div'); w.className = 'icon-wrap';
        w.innerHTML = icon(p.icon);
        const sv = w.firstChild; sv.setAttribute('stroke-width', p.strokeWidth || 2); sv.style.color = s.color;
        box.appendChild(w);
        break;
      }
      case 'shape': {
        const inner = Math.max(0, el.w - 2 * (Number(s.padding) || 0) - 2 * bw);
        const innerH = Math.max(0, el.h - 2 * (Number(s.padding) || 0) - 2 * bw);
        box.innerHTML = shapeSVG(p, inner, innerH);
        break;
      }
      case 'table': box.appendChild(renderTable(el, p, s, ctx)); break;
      default: break;
    }
    return n;
  }

  function renderTable(el, p, s, ctx) {
    const tbl = document.createElement('table');
    tbl.className = 'el-table';
    const cols = p.columns || [];
    const lc = p.lineColor || '#ccc';
    const cp = (Number(p.cellPadding) || 0) + 'mm';
    const start = s.dir === 'ltr' ? 'left' : 'right';
    const alignOf = (a) => (a === 'start' ? start : a === 'end' ? (start === 'left' ? 'right' : 'left') : (a || 'center'));
    let html = '<colgroup>' + cols.map((c) => `<col style="width:${Number(c.width) || 10}%">`).join('') + '</colgroup>';
    const cellBorder = p.rowLines ? `border-bottom:0.2mm solid ${esc(lc)};` : '';
    if (p.showHeader !== false) {
      html += '<thead><tr>' + cols.map((c) => `<th style="text-align:${alignOf(c.align)};padding:${cp};background:${esc(p.headerBg || 'transparent')};color:${esc(p.headerColor || s.color)};border-bottom:0.3mm solid ${esc(lc)}">${esc(resolve(c.label, ctx))}</th>`).join('') + '</tr></thead>';
    }
    let rows;
    if (ctx.raw || !ctx.data || !ctx.data.__items) {
      rows = ctx.raw ? [{ index: 1, name: '{{item.name}}', desc: '{{item.desc}}', qty: '{{item.qty}}', price: '{{item.price}}', total: '{{item.total}}' }] : [];
    } else rows = ctx.data.__items;
    const rh = Number(p.rowHeight) ? `height:${p.rowHeight}mm;` : '';
    html += '<tbody>' + rows.map((r) => '<tr>' + cols.map((c) => `<td style="text-align:${alignOf(c.align)};padding:${cp};${cellBorder}${rh}">${esc(r[c.key] != null ? r[c.key] : '')}</td>`).join('') + '</tr>').join('') + '</tbody>';
    tbl.innerHTML = html;
    return tbl;
  }

  /** Render a whole template page into a container (used by editor, previews and print). */
  function renderPage(tpl, pageIndex, ctx, target) {
    const page = target || document.createElement('div');
    page.classList.add('doc-page');
    page.style.width = tpl.width + 'mm';
    page.style.height = tpl.height + 'mm';
    page.style.background = tpl.background || '#ffffff';
    page.innerHTML = '';
    const pg = tpl.pages[pageIndex] || tpl.pages[0];
    if (!pg) return page;
    for (const el of pg.elements) {
      const node = render(el, ctx);
      if (node) page.appendChild(node);
    }
    return page;
  }

  window.Elements = {
    PX_PER_MM, ICONS, DESIGN_ICONS, SHAPES, TYPES, FIELD_GROUPS, ALL_FIELDS, NUMERIC_FIELDS,
    icon, uid, esc, clone, round, fmtNum, fmtDate, parseDate, fieldLabel, resolve, evalFormula,
    baseStyle, create, render, renderPage, fontStack,
  };
})();
