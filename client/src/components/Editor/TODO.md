# Store document data as rows with metadata for styling

## Editor component
- Keep state what current style is.

## Style interface component
- Build UI.
- Feed parent with current style depending on selection.
- On style change, create a new section in `documentFile.rows[rowIndex]` at the current index.

## Input component
- Input component need to be fed via props with current styling.
- On input event, IF no text selection DO:
- * Get current styles for pos. Styles get cleared after 3

## Renderer component
