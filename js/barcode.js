/* Barcode (JsBarcode) and QR code (qrcode-generator) rendering to scalable SVG strings.
   Both libraries are bundled in js/vendor so the app works offline. */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const cache = new Map();
  const MAX_CACHE = 400;

  function remember(key, val) {
    if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
    cache.set(key, val);
    return val;
  }

  const FORMATS = ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'ITF14', 'ITF', 'MSI', 'codabar', 'pharmacode'];

  const Barcode = {
    FORMATS,
    available() { return typeof window.JsBarcode === 'function'; },
    qrAvailable() { return typeof window.qrcode === 'function'; },

    /** Returns an SVG string whose bars stretch to fill the container, or null when the value is invalid. */
    barcodeSVG(value, format, color) {
      value = String(value == null ? '' : value).trim();
      if (!value) return null;
      const key = 'b|' + format + '|' + color + '|' + value;
      if (cache.has(key)) return cache.get(key);
      if (!this.available()) return remember(key, null);
      try {
        const svg = document.createElementNS(NS, 'svg');
        let valid = true;
        window.JsBarcode(svg, value, {
          format: format || 'CODE128', lineColor: color || '#000000', background: 'transparent',
          displayValue: false, margin: 0, width: 2, height: 100,
          valid: (v) => { valid = v; },
        });
        if (!valid) return remember(key, null);
        const w = parseFloat(svg.getAttribute('width')) || 100;
        const h = parseFloat(svg.getAttribute('height')) || 100;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.removeAttribute('width'); svg.removeAttribute('height');
        svg.removeAttribute('style');
        svg.setAttribute('shape-rendering', 'crispEdges');
        return remember(key, svg.outerHTML);
      } catch (e) {
        return remember(key, null);
      }
    },

    /** Returns a square SVG string for the QR code (UTF-8, supports Arabic). */
    qrSVG(value, ecc, color) {
      value = String(value == null ? '' : value);
      if (!value) return null;
      const key = 'q|' + ecc + '|' + color + '|' + value;
      if (cache.has(key)) return cache.get(key);
      if (!this.qrAvailable()) return remember(key, null);
      try {
        window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8'];
        const q = window.qrcode(0, ecc || 'M');
        q.addData(value, 'Byte');
        q.make();
        const n = q.getModuleCount();
        let d = '';
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
          }
        }
        const svg = `<svg xmlns="${NS}" viewBox="0 0 ${n} ${n}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges"><path fill="${color || '#000'}" d="${d}"/></svg>`;
        return remember(key, svg);
      } catch (e) {
        return remember(key, null);
      }
    },
  };

  window.Barcode = Barcode;
})();
