# Spreadsheet

Jspreadsheet CE supplies the grid; SheetJS CE converts XLSX inside an
app-owned worker. Files and account storage are provided by the host. Native
`.codisheet` files keep sheet names, cell values and formula text. XLSX opens as
an imported copy; formatting, charts and advanced features are not preserved. **Open from My files** also imports UTF-8 comma-separated CSV as a new workbook, leaving the original CSV unchanged. CSV fields remain text, including leading zeros. Fields beginning with `=` are prefixed with an apostrophe so they do not silently become formulas; remove the apostrophe deliberately if a formula is intended. CSV import is limited to 8 MiB and a 10,000-cell grid (including the minimum grid size); semicolon-separated files are not supported. Files opens CSV in Data Explorer by default; use Spreadsheet’s Open button to import one here.
Export creates a separate XLSX in Files and never downloads to the PC. The destination and workbook values are captured when export starts; later edits are not included, and the status reports that distinction. Existing XLSX files require confirmation and a version check. **Export current sheet CSV** writes the selected worksheet’s calculated values to a separate UTF-8 CSV in My files. CSV does not preserve formulas, formatting or other sheets; unsupported or invalid formulas stop the export. Trailing empty rows and columns are omitted, formula-like text is prefixed with an apostrophe for spreadsheet safety, and output is limited to 8 MiB. Existing CSV files require replacement confirmation.
Choose **Open from My files** to open a workbook, and **Choose save folder**
to select where a native workbook is saved. A file that cannot be opened leaves
the current workbook and its unsaved edits available. Saves capture the current filename and workbook when started, write to the browser first and synchronize with the server. If edits occur during the save, the newer edits remain unsaved. Saving over a different existing workbook asks in a desktop-styled confirmation dialog; the target version is checked again after the answer so a file changed while the dialog was open is preserved. Opening over unsaved edits uses the same themed dialog. Cancel keeps the current workbook and its edits open.

After importing CSV or XLSX, save the new `.codisheet` before reloading. The
imported copy has no saved workbook to restore until then; it does not reopen a
previously loaded workbook as though it were the imported copy.
XLSX import requires a ZIP-based workbook; empty files, plain text with an
`.xlsx` name, and the tested truncated ZIP input are rejected
without replacing the current workbook. Other malformed or unusual workbooks
have not been comprehensively tested.

Run `npm ci --prefix apps/system/spreadsheet --ignore-scripts` before building.
SheetJS is pinned from its official distribution, not the outdated npm registry.

Basic arithmetic, cell references, PI(), ABS, SQRT, SIN, COS, TAN, SUM, AVERAGE, MIN, MAX and COUNT are calculated with an app-local bounded parser. Trigonometric functions take radians; for degrees use, for example, `=SIN(30*PI()/180)`. Calculations use floating-point numbers and may have rounding error. Invalid domains such as `=SQRT(-1)` report `#ERROR!`. The collapsed Formula help panel lists supported functions and examples. In SUM, AVERAGE, MIN, MAX and COUNT, referenced blank cells and nonnumeric text labels are ignored; decimal numeric text is counted as numeric because the grid stores many entries as text. AVERAGE with no numeric values reports an error; MIN and MAX return zero. This correction may change results produced by older versions for ranges containing blank cells. Other formulas remain in the file
but show `#ERROR!`; the vendor's dynamic JavaScript formula evaluator is
intentionally disabled. Division by zero, non-real results and arithmetic overflow at any intermediate step report `#ERROR!` and block CSV result export. This is a basic spreadsheet, not full Excel parity.

TAN also reports `#ERROR!` at exactly represented odd multiples of `PI()/2`,
where tangent is undefined; nearby valid angles remain supported but can be
very sensitive to floating-point rounding. CSV export rejects such errors.

Local desktop and emulated-phone account tests and live desktop and emulated-phone tests cover CSV open, edit, save as a separate workbook, invalid CSV recovery, sync and fresh-session reopening. One live phone-sized run timed out waiting for sync; a later fresh run passed. Physical touch and larger or non-UTF-8 CSV files remain unverified.

Local desktop and emulated-phone and live emulated-phone account tests also cover CSV export, cancelled replacement, selected-sheet values, invalid formulas and opening the result in Data Explorer.

If the local workbook conflicts with the server while saving, the status directs you to resolve the copies in Files. Further edits remain marked unsaved; a local conflicting copy is not described as syncing.

The app asks before closing during a workbook save or CSV/XLSX
export, even when the workbook was clean when the operation began. Cancelling
or failing an operation restores the earlier unsaved state unless newer edits
were made. A file write already sent to storage may still finish after close.

If a conflict reaches the browser while a CSV or XLSX export is being written,
the export reports that the local copy needs resolution in Files. If the
workbook was edited after export began, it also reports that the newer edits are
not in that export. Local desktop, emulated-phone and 4K and live emulated-phone
account tests use competing server writes to check both formats, retained copies
and fresh-session workbook recovery.

A separate notice stays visible if the saved workbook changes, conflicts or
cannot be checked; the current grid remains open. Save a copy or reopen after
resolving the issue. The app rechecks the workbook when an export or open
finishes, including changes detected while the operation was running. Local
desktop, emulated-phone and 4K and live emulated-phone tests cover a server
change during CSV export, retained export status, saving a copy and reopening.

Saving or exporting commits the active cell first, so the snapshot includes
what the user is typing. Desktop and emulated-phone tests cover saving and
CSV/XLSX export; physical touch remains unverified.
