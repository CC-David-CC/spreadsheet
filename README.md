# Spreadsheet

Jspreadsheet CE supplies the grid; SheetJS CE converts XLSX inside an
app-owned worker. Files and account storage are provided by the host. Native
`.codisheet` files keep sheet names, cell values and formula text. XLSX opens as
an imported copy; formatting, charts and advanced features are not preserved. **Open from My files** also imports UTF-8 comma-separated CSV as a new workbook, leaving the original CSV unchanged. CSV fields remain text, including leading zeros. Fields beginning with `=` are prefixed with an apostrophe so they do not silently become formulas; remove the apostrophe deliberately if a formula is intended. CSV import is limited to 8 MiB and a 10,000-cell grid (including the minimum grid size); semicolon-separated files are not supported. Files opens CSV in Data Explorer by default; use Spreadsheet’s Open button to import one here.
Export creates a separate XLSX in Files and never downloads to the PC. The destination and workbook values are captured when export starts; later edits are not included, and the status reports that distinction. Existing XLSX files require confirmation and a version check. **Export current sheet CSV** writes the selected worksheet’s calculated values to a separate UTF-8 CSV in My files. CSV does not preserve formulas, formatting or other sheets; unsupported or invalid formulas stop the export. Trailing empty rows and columns are omitted, formula-like text is prefixed with an apostrophe for spreadsheet safety, and output is limited to 8 MiB. Existing CSV files require replacement confirmation.

Under **CSV text safety**, protection is on by default for each window. It
prefixes potentially formula-like text with an apostrophe; export reports how
many cells were changed. Turn it off to preserve the current cell text, with
the risk that another spreadsheet app may interpret that text as a formula.
Export reports how many cells were left unprotected. In both modes formula
cells export their calculated values, not formula text; CSV import's earlier
escaping of leading `=` is not undone. The choice does not alter the workbook
and returns to protected mode in a new window. Local registered-account
desktop and emulated-phone tests cover CSV import, calculation, both export
options, server bytes and fresh-session workbook reopening. Physical touch and
how every third-party spreadsheet interprets CSV remain unverified.
Choose **Open from My files** to open a workbook, and **Choose save folder**
to select where a native workbook is saved. A file that cannot be opened leaves
the current workbook and its unsaved edits available. If a cell is still being edited while a file opens, the editor commits that cell before checking for changes and asks before replacing it. Saves capture the current filename and workbook when started, write to the browser first and synchronize with the server. If edits occur during the save, the newer edits remain unsaved. Saving over a different existing workbook asks in a desktop-styled confirmation dialog; the target version is checked again after the answer so a file changed while the dialog was open is preserved. Opening over unsaved edits uses the same themed dialog. Cancel keeps the current workbook and its edits open.

Typing in a cell marks the workbook as unsaved immediately, even before that
cell is committed. Closing the window therefore asks before discarding the
active edit. Local desktop and emulated-phone tests cover cancelling close,
saving, server synchronization and reopening in a fresh browser session.

Moving rows or columns, sorting, undo and redo mark a workbook unsaved. Local
desktop and emulated-phone account tests exercise these grid operations and
cover the close warning, saving a row reorder, server sync and reopening.
These tests use the grid's operation API; physical drag gestures remain untested.

After importing CSV or XLSX, save the new `.codisheet` before reloading. The
imported copy has no saved workbook to restore until then; it does not reopen a
previously loaded workbook as though it were the imported copy.
XLSX import requires a ZIP-based workbook; empty files, plain text with an
`.xlsx` name, and the tested truncated ZIP input are rejected
without replacing the current workbook. Other malformed or unusual workbooks
have not been comprehensively tested.

XLSX text cells beginning with `=` gain a visible leading apostrophe on import,
matching CSV's text safety rule. Actual XLSX formula cells remain formulas.
The apostrophe is part of the stored cell text; remove it deliberately to turn
that text into a formula. A single `=` is retained when exporting XLSX.

Run `npm ci --prefix apps/system/spreadsheet --ignore-scripts` before building.
SheetJS is pinned from its official distribution, not the outdated npm registry.

Basic arithmetic, cell references, PI(), ABS, SQRT, SIN, COS, TAN, SUM, AVERAGE, MIN, MAX and COUNT are calculated with an app-local bounded parser. Trigonometric functions take radians; for degrees use, for example, `=SIN(30*PI()/180)`. Calculations use floating-point numbers and may have rounding error. Invalid domains such as `=SQRT(-1)` report `#ERROR!`. The collapsed Formula help panel lists supported functions and examples. In SUM, AVERAGE, MIN, MAX and COUNT, referenced blank cells and nonnumeric text labels are ignored; decimal numeric text is counted as numeric because the grid stores many entries as text. AVERAGE with no numeric values reports an error; MIN and MAX return zero. This correction may change results produced by older versions for ranges containing blank cells. Other formulas remain in the file
but show `#ERROR!`; the vendor's dynamic JavaScript formula evaluator is
intentionally disabled. Division by zero, non-real results and arithmetic overflow at any intermediate step report `#ERROR!` and block CSV result export. This is a basic spreadsheet, not full Excel parity.

Powers use conventional mathematical precedence: `=-2^2` is `-4`,
`=(-2)^2` is `4`, and `=2^-2` is `0.25`. Powers associate right to left.
This changes results for some formulas saved by earlier versions and differs
from Excel's treatment of a leading minus; use parentheses when sharing files.

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

If a workbook opened directly from Files is temporarily unavailable, the app
keeps its restore reference and offers **Retry saved spreadsheet**. A blank
scratch workbook is available in the meantime; if the original is named
`Untitled.codisheet`, the scratch default uses `Untitled-recovery.codisheet`.
Retry asks before discarding scratch edits, and saving a scratch copy switches
to that file and clears the old retry target. Invalid or confirmed missing
files open a blank workbook without a retry. Local registered-account desktop
and emulated-phone tests covered injected read failure, retry cancellation,
separate scratch save and sync, unchanged server original and successful retry.
Physical touch and a conflict during CSV/XLSX import remain unverified.

Only one Open from My files chooser can be active per window. Repeated clicks
while it is open do not create competing choices; cancelling leaves the
current workbook in place.

Only one file or folder chooser can run at a time. If the destination path is
edited or the saved workbook changes while a folder choice is pending, that
choice is ignored and the user can choose again. Local desktop and
emulated-phone tests cover overlapping choices, saving during a choice,
native and CSV server saves, and reopening. Physical touch is unverified.

Native workbook validation counts the rectangular grid Jspreadsheet will
create, including its minimum 10 columns by 20 rows, across all sheets. A
workbook whose expanded grids exceed 10,000 cells is rejected before it can
replace the current workbook; exactly 10,000 cells is accepted. If edits in an
open workbook exceed the limit, saving reports an error. Local desktop and
emulated-phone account tests cover sparse, wide and multi-sheet limits,
preserving and syncing the prior workbook, fresh-session reopening and the
exact boundary. Very large input parsing and physical touch remain unverified.

Choose **Try measurement example** to start with three measured lengths and an
`AVERAGE` formula. Change a length to see the average update, then save the
workbook to My files if you want to keep it. Replacing unsaved work asks first;
cancelling keeps the current workbook. The example is a separate unsaved
workbook and never writes over a saved workbook without confirmation. Local
registered-account desktop and emulated-phone tests cover recalculation,
cancel, server sync and opening the saved workbook in a fresh browser session.
Physical touch remains unverified. Results use floating-point arithmetic, so
some decimals show small rounding differences.

Formula cells display up to 12 significant digits by default, avoiding common
floating-point display artifacts. **Formula help · display → Show
full floating-point precision** shows the complete JavaScript numeric result;
the choice is stored per account in this browser and is not part of a workbook.
This rounds the display only: calculations and CSV exports use full precision,
and saved workbooks retain the original formula text. XLSX export follows its
existing workbook conversion rules. As with any floating-point calculation,
validate engineering-critical results independently.

When a formula cell is changed to a literal, its old formula tooltip and
accessibility label are removed; other formula labels remain available. Local
registered-account desktop and emulated-phone tests cover the correction,
CSV import/export, server sync and reopening the workbook in a fresh browser.
The test inspects accessibility labels but does not verify a physical screen
reader or touch device.

In aggregate functions, text that has numeric syntax but overflows the browser's
floating-point range (for example `1e309`) is an error rather than a label to
ignore. The formula displays `#ERROR!` and CSV export stops, so an overflowing
measurement cannot silently disappear from an average or total. Ordinary
nonnumeric labels remain ignored. Local registered-account desktop and
emulated-phone tests covered a failed CSV export retaining the old file,
correcting the measurement, server sync and fresh-session reopening.

Direct cell references accept decimal and scientific-notation numeric text;
nonnumeric text, including `0x10` and whitespace-only text, gives `#ERROR!`
instead of silently using JavaScript's number conversion. Aggregate ranges
continue to ignore text labels. This can change results for previously saved
workbooks that relied on hexadecimal-style text being treated as a number.
An isolated local registered-account desktop and emulated-phone test opened
a measurement workbook, confirmed an invalid reference blocked CSV export,
corrected the measurement through the grid API, saved and synchronized the
workbook, and reopened the result in a fresh browser session. Physical touch
editing is not verified by that test.

As a temporary safeguard, moving and sorting rows or columns is blocked while
any sheet contains a formula. Deleting rows is permitted only below every
formula cell and understood reference in the workbook; deleting columns is
permitted only to their right. Unknown or ambiguous formula syntax keeps
deletion blocked. Undo/redo is blocked when its next action would change the
sheet structure; ordinary cell undo/redo remains available. Row and column
insertion remain available. This protects against an
observed range-reference error: moving rows 1 and 2 changed `SUM(A1:A3)` to
`SUM(A2:A3)`, dropping a value. Some permutations can produce disjoint reference
ranges that the current formula language cannot express, so this is a guard,
not full spreadsheet reference semantics. Remove formulas first only if doing so
is appropriate for your workbook; keep a copy before restructuring.

Local registered-account desktop and emulated-phone tests checked the guard,
including a formula still being typed, ordinary cell undo, row insertion, server
sync and fresh-session reopening. A separate formula-free reorder/sort test
passed. Tests exercise the grid's operations API; physical drag gestures and all
formula reference cases are not verified.

Local registered-account desktop and emulated-phone tests also removed an
unrelated trailing row and column from a two-sheet workbook, preserved formula
text and results, blocked deletion through a referenced area, synced and reopened.
This is a conservative subset, not a general formula-reference rewrite.
