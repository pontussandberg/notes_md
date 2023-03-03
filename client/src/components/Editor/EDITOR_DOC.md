## Selection

### Window keydown event effect
- If focus === 'renderer' and selectionIndexes range > 0 do:
- * Set focus to 'input'.
- * Set selection in textarea.
- * texarea.focus()

### Renderer selection change
- Set parent state focus to 'renderer'.
- Set parent state selectionIndex.

### Renderer selectionIndex change effect
- IF selectionIndex range === 0 do:
- * (TODO) Set graphic carret position.
- ELSE do:
- * Select renderer text.

### Input selection change
- If selectionIndex range > 0 do:
- * Set parent state focus to 'renderer'.
- * Set parent state selectionIndex.

