/* Storage layer: IndexedDB for orders/templates/stores, LocalStorage for settings.
   Everything stays in this browser on this device. */
(function () {
  'use strict';

  const DB_NAME = 'delivery-designer';
  const DB_VERSION = 1;
  const STORES = ['orders', 'templates', 'stores'];
  const LS_KEY = 'dd.settings.v1';

  let dbPromise = null;
  let memoryFallback = null; // used if IndexedDB is unavailable (e.g. some private modes)

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      if (!('indexedDB' in window)) { memoryFallback = {}; resolve(null); return; }
      let req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { memoryFallback = {}; resolve(null); return; }
      req.onupgradeneeded = () => {
        const db = req.result;
        STORES.forEach((s) => { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' }); });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { console.warn('IndexedDB unavailable, using memory only', req.error); memoryFallback = {}; resolve(null); };
      req.onblocked = () => console.warn('IndexedDB upgrade blocked');
    });
    return dbPromise;
  }

  function mem(store) { memoryFallback[store] = memoryFallback[store] || new Map(); return memoryFallback[store]; }

  async function tx(store, mode, fn) {
    const db = await openDB();
    if (!db) return fn(null);
    return new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const os = t.objectStore(store);
      let result;
      Promise.resolve(fn(os)).then((r) => { result = r; });
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('Transaction aborted'));
    });
  }

  function reqP(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }

  const DB = {
    async getAll(store) {
      const db = await openDB();
      if (!db) return Array.from(mem(store).values()).map((x) => JSON.parse(JSON.stringify(x)));
      return tx(store, 'readonly', (os) => reqP(os.getAll()));
    },
    async put(store, obj) {
      const db = await openDB();
      if (!db) { mem(store).set(obj.id, JSON.parse(JSON.stringify(obj))); return; }
      return tx(store, 'readwrite', (os) => { os.put(obj); });
    },
    async putMany(store, list) {
      const db = await openDB();
      if (!db) { list.forEach((o) => mem(store).set(o.id, JSON.parse(JSON.stringify(o)))); return; }
      return tx(store, 'readwrite', (os) => { list.forEach((o) => os.put(o)); });
    },
    async delete(store, id) {
      const db = await openDB();
      if (!db) { mem(store).delete(id); return; }
      return tx(store, 'readwrite', (os) => { os.delete(id); });
    },
    async clear(store) {
      const db = await openDB();
      if (!db) { mem(store).clear(); return; }
      return tx(store, 'readwrite', (os) => { os.clear(); });
    },
    isPersistent() { return !memoryFallback; },
    async estimate() {
      try { if (navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate(); } catch (e) { /* ignore */ }
      return null;
    },
  };

  const Settings = {
    defaults: {
      lang: 'ar', theme: 'light', zoom: 1, showGrid: true, snap: true, showRulers: true, gridSize: 1, showPlaceholders: false,
      currentTemplateId: null, previewOrderId: null, currency: 'د.ع', decimals: 0,
      defaultTemplate: { receipt: null, sticker: null },
      orderPrefix: 'ORD-', receiptPrefix: 'R-', nextNumber: 1001,
      defaultSenderName: '', defaultSenderPhone: '',
      print: {
        templateId: null, source: 'current', copies: 1, paper: 'auto', customW: 100, customH: 150, orientation: 'portrait',
        margins: { top: 5, right: 5, bottom: 5, left: 5 }, gap: 2, layout: 'auto', fit: true, cutMarks: false, bw: false,
      },
      selectedOrders: [], seeded: false,
    },
    data: null,
    load() {
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch (e) { saved = {}; }
      const d = JSON.parse(JSON.stringify(this.defaults));
      if (!saved.theme) { try { if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) d.theme = 'dark'; } catch (e) { /* ignore */ } }
      this.data = Object.assign(d, saved);
      this.data.print = Object.assign(JSON.parse(JSON.stringify(this.defaults.print)), saved.print || {});
      this.data.print.margins = Object.assign({}, this.defaults.print.margins, (saved.print || {}).margins || {});
      this.data.defaultTemplate = Object.assign({ receipt: null, sticker: null }, saved.defaultTemplate || {});
      return this.data;
    },
    save() {
      try { localStorage.setItem(LS_KEY, JSON.stringify(this.data)); } catch (e) { console.warn('LocalStorage unavailable', e); }
    },
    get(k) { return this.data[k]; },
    set(k, v) { this.data[k] = v; this.save(); },
    clear() { try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ } this.load(); },
  };

  window.DB = DB;
  window.Settings = Settings;
})();
