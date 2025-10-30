# Matrix calculator with web languages ⚙️

Small browser-based matrix calculator (HTML / CSS / JS) for quick operations with one or two matrices.

## Quick start 🚀

1. Open `calculadora_matriz.html` in your browser.
2. The page loads with two editable **3×3** matrices.
3. Change size (2–10), fill manually, or use **Random** / **Example** buttons, then run operations from the center panel.

## Main controls 🧭

- **Size selectors** (`#matrix1-size`, `#matrix2-size`): change matrix dimensions — this **resets values**.
- **Random** / **Example**: quickly fill the matrix with values.
- **Clear**: reset a matrix or the result (`Borrar Matriz`, `Borrar Resultado`).
- **Single-matrix ops**: `ESCALAR` (use inline `#scalar-input-*`), **Transpose**, **Determinant**, **Inverse**, **Identity**.
- **Pair ops**: **Sum**, **Subtract**, **Multiply** (follow dimension rules).
- **Messages**: `#calculation-error` (errors) and `#calculation-success` (success). Results are displayed in `#result-display`.

## Behavior & notes ⚠️

- All operations require every involved cell to contain a valid number — validation prevents incomplete calculations.
- Changing a matrix **size discards** previous values (no undo).
- Random values are numeric (2 decimal places) to avoid string-concatenation bugs.
- Determinant/inverse routines are fine for small matrices; performance may degrade for large sizes.

## Files 📁

- `calculadora_matriz.html` — UI
- `calculadora_matrix.css` — styles
- `calculadora_matriz.js` — logic and operations