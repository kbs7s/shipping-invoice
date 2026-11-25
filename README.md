# Delivery Receipt & Shipping Label Designer

A complete, offline-capable visual designer for **delivery receipts, shipping labels, package stickers, COD stickers, order slips and return receipts**. It is plain HTML5 + CSS3 + vanilla JavaScript with no build step and no server, so it runs directly on **GitHub Pages** or from any static host.

Arabic (RTL) is the default interface language and English (LTR) is one click away.

---

## Features

**Visual editor (Designer tab)**
- Live canvas that shows the document exactly as it prints (all geometry is in millimetres).
- Elements: text, data field, logo/image, barcode, QR code, separator line, rectangle/border, icon, custom shape, static text, date & time, calculated field, items table.
- Drag & drop from the palette, move, resize with 8 handles (rotation aware), rotate (Shift = 15° steps), duplicate, delete, copy/paste, multi-select (Shift/Ctrl + click or drag a marquee).
- Align to page or to the selection, distribute horizontally/vertically, layer ordering, lock and hide.
- Rulers in mm, grid, snapping to grid, page edges/centre and other elements with pink smart guides (hold Alt to disable).
- Zoom (buttons, Ctrl + wheel, Ctrl + = / − / 0), fit to screen, undo/redo history (150 steps), multiple pages per template.
- Context menu (right click), inline text editing (double click a text element), layers panel.

**Properties panel**
- Position & size: X, Y, width, height, rotation, align to page.
- Typography: font family, size (pt), bold, italic, underline, text alignment, vertical alignment, line height, letter spacing, direction (RTL/LTR/auto), colour.
- Appearance: background, border colour/width/style, corner radius, padding, opacity, visibility, lock, layer order.
- Content per element type (placeholder insertion menu, barcode format, QR error correction, line style, shape type, icon picker, date format, calculation formula, table columns…).
- With nothing selected: template name, type (receipt/sticker), store, document size presets, custom width/height, background, default font, grid size, “set as default”.

**Data binding**
- Placeholders such as `{{order_number}}`, `{{customer_name}}`, `{{customer_phone}}`, `{{customer_address}}`, `{{product_name}}`, `{{quantity}}`, `{{product_price}}`, `{{delivery_fee}}`, `{{discount}}`, `{{total}}`, `{{order_date}}`, `{{payment_method}}`, `{{cod_amount}}`, `{{store_name}}`, `{{return_policy}}`… (the full list is in the “Insert field” menu).
- Custom order fields appear as `{{custom_<key>}}`.
- Calculated fields, e.g. `{{subtotal}} + {{delivery_fee}} - {{discount}}`.
- Data-entry tab with a live preview; switch receipt/sticker templates without losing order data; preview any order in the designer (or show field names with the `{ }` button).

**Templates**
- Seven editable starter templates: minimal modern receipt (A5), professional delivery receipt (A4), e-commerce receipt (A5), compact 80 mm thermal receipt, 100×150 shipping label, 100×100 COD sticker, minimal black-and-white receipt (A6).
- Create, edit, duplicate, rename, delete, set default (per receipt/sticker), export one or all as JSON, import JSON, filter by type and store, restore starters.
- Sticker sizes 50×30, 60×40, 70×50, 100×100, 100×150 or custom, with an optional automatic starter layout.

**Printing**
- Paper: automatic, A4, A5, A6, Letter, 80 mm and 58 mm thermal rolls, “same as document” (label printers) or custom size; portrait/landscape; custom margins and gaps.
- Multiple receipts or stickers per page, one per page, copies, current/selected/all orders or the template alone.
- Shrink-to-fit, cut lines, black & white. A dedicated `@media print` stylesheet prints only the documents, and the page size is set in mm through `@page`.

**Orders**
- Create, edit, duplicate, delete, search, filter by date range, customer, delivery status and payment status; change status inline; print a receipt or sticker per order; print selected or all filtered orders; reprint any time.
- Statuses: New, Preparing, Ready for delivery, Shipped, Delivered, Returned, Cancelled. Payment: Unpaid, Paid, Partially paid, Cash on delivery.

**Data & storage**
- Orders, templates (including images) and stores are kept in **IndexedDB**; settings in **LocalStorage**. Everything autosaves and is restored after a refresh.
- Full JSON backup export/import (merge or replace), separate template and order export, demo data, and a typed confirmation before deleting everything.

**Interface**
- Arabic RTL by default and English LTR, light and dark modes, responsive layout (side panels become drawers on tablets and phones), toasts, confirmation dialogs, empty states and loading indicators.

### Keyboard shortcuts

| Keys | Action |
|---|---|
| Ctrl + S | Save |
| Ctrl + Z / Ctrl + Y (or Ctrl + Shift + Z) | Undo / redo |
| Ctrl + C / Ctrl + V / Ctrl + X | Copy / paste / cut |
| Ctrl + D | Duplicate |
| Delete | Delete the selected elements |
| Ctrl + A | Select all |
| Ctrl + P | Print |
| Arrow keys | Move 1 mm (Shift 5 mm, Alt 0.1 mm) |
| Ctrl + wheel, Ctrl + = / − / 0 | Zoom in / out / fit |

---

## Important: where your data lives

Data is stored **only in the browser you use, on that device**. It is not an online database and it is not shared between devices, browsers or people. Clearing site data in the browser deletes it. Use **Settings → Export full backup** regularly and **Import backup** to move data to another device or browser.

## Offline use

All libraries and fonts are bundled locally, so after the page has loaded once the app needs no internet connection:

| Library | Purpose | File |
|---|---|---|
| [JsBarcode](https://github.com/lindell/JsBarcode) 3.11.6 (MIT) | Barcodes (CODE128, CODE39, EAN-13/8, UPC, ITF…) | `js/vendor/JsBarcode.all.min.js` |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 (MIT) | QR codes with UTF-8 (Arabic) support | `js/vendor/qrcode-generator.js` |
| [Cairo](https://fonts.google.com/specimen/Cairo) (SIL OFL) | Arabic + Latin font, regular and bold | `assets/fonts/` |

You can also open `index.html` directly from disk (`file://`), because the app uses classic scripts rather than ES modules. Some browsers restrict IndexedDB for `file://` pages; if that happens the app still works but keeps data in memory only until you export it, so serving it over HTTP (GitHub Pages or a local server) is recommended.

PDF export uses the browser’s own print dialog: choose **Save as PDF** as the printer. No jsPDF is needed, and text stays selectable and sharp.

---

## Deploying to GitHub Pages

1. Create a new repository on GitHub (for example `delivery-designer`). It can be public, or private on a plan that includes Pages.
2. Upload the **contents** of this folder to the repository root, so that `index.html` sits at the top level:
   ```
   index.html
   css/  js/  assets/  README.md
   ```
   Using git:
   ```bash
   cd delivery-designer
   git init
   git add .
   git commit -m "Delivery receipt & label designer"
   git branch -M main
   git remote add origin https://github.com/<your-user>/delivery-designer.git
   git push -u origin main
   ```
   Or drag and drop the files in the GitHub web interface (**Add file → Upload files**).
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Source: Deploy from a branch**, then **Branch: `main`** and folder **`/ (root)`**, and click **Save**.
5. After a minute the site is live at `https://<your-user>.github.io/delivery-designer/`.

Notes:
- All paths are relative, so the app works from a sub-path such as `/delivery-designer/`.
- No build process, Node.js, PHP or database server is required.
- A `.nojekyll` file is included so GitHub Pages serves every file exactly as is.
- To use a custom domain, add it under **Settings → Pages → Custom domain**.

### Running locally

Any static server works, for example:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## Printing tips

- **Thermal printers (80 mm / 58 mm):** choose the 80 mm or 58 mm roll (or *Automatic* for the thermal template). In the browser print dialog set margins to *None* and scale to *100%*; in the printer driver choose the matching roll width.
- **Label printers (Zebra, Xprinter, TSC…):** pick *Same as document* so each label prints on its own page of exactly the label size. Create a matching paper size in the printer driver if needed.
- **Sticker sheets on A4:** pick *A4*, set the sheet’s margins and gap, enable *Cut lines* if you will cut by hand.
- Always keep the browser print scale at **100%** (“Actual size”) for accurate dimensions. Enable “Background graphics” if a coloured background does not print.

---

## Project structure

```
index.html            App shell and views
css/style.css         Theme tokens, components, document rendering
css/editor.css        Designer, data entry and print views
css/print.css         @media print rules
css/responsive.css    Tablet and phone layouts
js/localization.js    Arabic / English strings
js/storage.js         IndexedDB + LocalStorage
js/barcode.js         Barcode and QR rendering (SVG)
js/elements.js        Element types, placeholders and the shared renderer
js/templates.js       Paper sizes, starter templates, template manager
js/orders.js          Order model, data binding, data entry, order list
js/designer.js        Canvas editor (selection, drag, resize, rotate, snapping, rulers, history)
js/properties.js      Properties panel
js/printing.js        Print layout engine and print view
js/app.js             Startup, views, dialogs, settings, backup, shortcuts
js/vendor/            Bundled libraries
assets/fonts/         Cairo font files
assets/icons/         App icon
assets/logos/         Sample logo
```

### Template JSON format

```json
{
  "format": "delivery-designer/templates",
  "version": 1,
  "templates": [{
    "id": "tpl_…", "name": "My label", "type": "sticker",
    "width": 100, "height": 150, "background": "#ffffff", "storeId": "",
    "pages": [{ "id": "pg_…", "elements": [
      { "id": "el_…", "type": "text", "x": 5, "y": 5, "w": 90, "h": 10, "rot": 0,
        "props": { "text": "{{customer_name}}" },
        "style": { "fontFamily": "Cairo", "fontSize": 14, "bold": true, "align": "right", "dir": "rtl", "color": "#111111" } }
    ]}]
  }]
}
```
All positions and sizes are in millimetres; font sizes are in points.
