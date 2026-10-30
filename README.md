# Spreadsheet

Jspreadsheet CE supplies the grid; SheetJS CE converts XLSX inside an
app-owned worker. Files and account storage are provided by the host. Native
`.codisheet` files keep sheet names, cell values and formula text. XLSX opens as
an imported copy; formatting, charts and advanced features are not preserved.
Export creates a separate XLSX in Files and never downloads to the PC.

Run `npm ci --prefix apps/system/spreadsheet --ignore-scripts` before building.
SheetJS is pinned from its official distribution, not the outdated npm registry.

Basic arithmetic, cell references and SUM, AVERAGE, MIN, MAX and COUNT are
calculated with an app-local bounded parser. Other formulas remain in the file
but show `#ERROR!`; the vendor's dynamic JavaScript formula evaluator is
intentionally disabled. This is a basic spreadsheet, not full Excel parity.
