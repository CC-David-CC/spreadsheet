# Spreadsheet

Jspreadsheet CE supplies the grid; SheetJS CE converts XLSX inside an
app-owned worker. Files and account storage are provided by the host. Native
`.codisheet` files keep sheet names, cell values and formula text. XLSX opens as
an imported copy; formatting, charts and advanced features are not preserved. **Open from My files** also imports UTF-8 comma-separated CSV as a new workbook, leaving the original CSV unchanged. CSV fields remain text, including leading zeros. Fields beginning with `=` are prefixed with an apostrophe so they do not silently become formulas; remove the apostrophe deliberately if a formula is intended. CSV import is limited to 8 MiB and a 10,000-cell grid (including the minimum grid size); semicolon-separated files are not supported. Files opens CSV in Data Explorer by default; use Spreadsheet’s Open button to import one here.
Export creates a separate XLSX in Files and never downloads to the PC.
Choose **Open from My files** to open a workbook, and **Choose save folder**
to select where a native workbook is saved. A file that cannot be opened leaves
the current workbook and its unsaved edits available. Saves are written to the
browser first and synchronized with the server.

Run `npm ci --prefix apps/system/spreadsheet --ignore-scripts` before building.
SheetJS is pinned from its official distribution, not the outdated npm registry.

Basic arithmetic, cell references and SUM, AVERAGE, MIN, MAX and COUNT are
calculated with an app-local bounded parser. Other formulas remain in the file
but show `#ERROR!`; the vendor's dynamic JavaScript formula evaluator is
intentionally disabled. This is a basic spreadsheet, not full Excel parity.

Local desktop and emulated-phone account tests and live desktop and emulated-phone tests cover CSV open, edit, save as a separate workbook, invalid CSV recovery, sync and fresh-session reopening. One live phone-sized run timed out waiting for sync; a later fresh run passed. Physical touch and larger or non-UTF-8 CSV files remain unverified.
