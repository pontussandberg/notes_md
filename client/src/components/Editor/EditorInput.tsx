import { useCallback, useEffect, useMemo, useRef } from "react";
import { DocumentFile, DocumentFileRowRenderData } from "./Editor.types";
import styles from './css/EditorRenderer.module.css'
import Settings from "./editorSettings";

type EditorInputProps = {
  documentFile: DocumentFile;
  body: string;
  selection: {
    start: number;
    end: number;
  };
  onChange: (rows: DocumentFile['rows']) => void;
  onSelectionChange?: (
    selectionStart: number,
    selectionEnd: number,
  ) => void;
}

const EditorInput = ({
  documentFile,
  body,
  selection,
  onChange,
  onSelectionChange,
}: EditorInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getTextRows = useCallback((rows: DocumentFile['rows']) => {
    return rows.map(sections => {
      return sections.reduce((acc2, section) => acc2 + section.content, '');
    });
  }, [])

  /**
   * Document body as rows.
   */
  const textRows = useMemo(() => {
    return getTextRows(documentFile.rows);
  }, [getTextRows, documentFile.rows])

  /**
   * Get rows last index position - each row represents the last selection index of that row
   *
   * @example getRowCharCount(['a', 'bb', 'c', 'abc']); --> [1, 4, 6, 10].
   * @example getRowCharCount(['', '', 'a', 'abc', 'def']); --> [0, 1, 3, 7, 11].
   */
  const getRowsLastSelectionIndex = useCallback((rows: DocumentFile['rows']) => {
    const rowCharIndexes: number[] = [];
    let charCount = 0;

    for (const [i, row] of getTextRows(rows).entries()) {
      const newRowAddition = 0 < i ? 1 : 0;
      charCount += row.length + newRowAddition;
      rowCharIndexes.push(charCount);
    }

    return rowCharIndexes;
  }, []);

  /**
   * Get rows last index position - each row represents the last selection index of that row
   *
   * @example getRowCharCount(['a', 'bb', 'c', 'abc']); --> [1, 4, 6, 10].
   * @example getRowCharCount(['', '', 'a', 'abc', 'def']); --> [0, 1, 3, 7, 11].
   */
  const rowsLastSelectionIndex = useMemo(() => {

    const rowCharIndexes: number[] = [];
    let charCount = 0;

    for (const [i, row] of textRows.entries()) {
      const newRowAddition = 0 < i ? 1 : 0;
      charCount += row.length + newRowAddition;
      rowCharIndexes.push(charCount);
    }

    return rowCharIndexes;
  }, [textRows]);

  // Binary search, find row for selectionIndex.
  const findRowIndex = useCallback((rows: DocumentFile['rows'], selectionIndex: number) => {
    const rowsLastSelectionIndex = getRowsLastSelectionIndex(rows)
    let curr = rowsLastSelectionIndex;

    while (curr.length > 1) {
      const half = Math.ceil(curr.length / 2);
      const firstHalf = curr.slice(0, half)
      const secondHalf = curr.slice(half)

      if (firstHalf[firstHalf.length - 1] >= selectionIndex) {
        curr = firstHalf;
      } else {
        curr = secondHalf;
      }
    }

    return rowsLastSelectionIndex.indexOf(curr[0]);
  }, [getRowsLastSelectionIndex]);

  const selectionIndexHasStyles = useCallback((selectionIndex: number) => {

  }, []);

  const getRowContentIndexByBodySelectionIndex = useCallback((
    rows: DocumentFile['rows'],
    bodySelectionIndex: number,
    rowIndex: number
  ) => {
    const prevRowLastBodyIndex = getRowsLastSelectionIndex(rows)[rowIndex - 1];

    if (!prevRowLastBodyIndex) {
      return bodySelectionIndex;
    }

    return bodySelectionIndex - prevRowLastBodyIndex - 1;
  }, [rowsLastSelectionIndex]);


  /**
   * Textarea OnChange event handler.
   *
   *
   *   rows = [
   *     {
   *       style: {...},
   *       content: 'abc',
   *     }
   *   ],
   *   [
   *     {
   *       style: {...},
   *       content: '#section1 ',
   *     },
   *     {
   *       style: {...},
   *       content: ' #section2',
   *     }
   *   ],
   *
   *
   *   'abc\n#section1  #section21'
   *   [
   *     'abc',
   *     '#section1  #section21',
   *   ]
   *
   *
   *  # IF SELECTION RANGE:
   *  - Change rows in selection range:
   *  - * For start selection row, remove all content from selection to end selection OR row last index.
   *  - * For middle selection rows (rows in between selection start and end rows), remove row.
   *  - * For last selection row, remove content from 0 to selection end index.
   *
   */
  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLTextAreaElement>,
    selectionOnCapture: EditorInputProps['selection']
  ) => {
    const textareaBody = event.target.value;

    const selectedCount = selectionOnCapture.end - selectionOnCapture.start;
    const contentLengthDiff = textareaBody.length - textRows.join('\n').length;
    const newContentLength = selectedCount + contentLengthDiff;
    const afterEditSelectionIndex = Math.max(selectionOnCapture.start, selectionOnCapture.start + newContentLength);
    const newContent = textareaBody.slice(selectionOnCapture.start, afterEditSelectionIndex);

    /**
     * Remove content in row sections between row content indexes.
     * If no section has content after filter, return a row with one default section.
     */
    const removeContentFromRow = (
      row: DocumentFileRowRenderData[],
      removeStartIndex: number,
      removeEndIndex: number
    ) => {
      const resultRow: DocumentFileRowRenderData[] = [];
      let prevSectionsContentLength = 0;

      for (const section of row) {
        const sectionSelectionStartIndexOffset = removeStartIndex - prevSectionsContentLength;
        const sectionSelectionEndIndexOffset = removeEndIndex - prevSectionsContentLength;

        // Helper to remove an index range from a string. If range is out of bounds - remove nothing.
        const removeStringRange = (value: string, fromIndex: number, toIndex: number) => {
          return value.substring(0, fromIndex) + value.substring(toIndex);
        }

        // Remove content from section if it is in the selection range.
        let updatedSectionContent = removeStringRange(
          section.content,
          sectionSelectionStartIndexOffset,
          sectionSelectionEndIndexOffset
        );

        // Add section IF it has content.
        if (updatedSectionContent.length) {
          resultRow.push({
            ...section,
            content: updatedSectionContent,
          });
        };

        // Add current section content to prev content length.
        prevSectionsContentLength += section.content.length;
      };

      // Add one default section if there is no section in result.
      if (!resultRow.length) {
        resultRow.push({
          content: '',
          style: {...Settings.defaultStyles},
        });
      };

      return resultRow;
    }

    /**
     * Helper to add new content to documentFile.
     */
    const addContentToDocument = (
      rows: DocumentFile['rows'],
      selectionStartIndex: number,
      newContent: string,
    ) => {

      if (newContent.length === 0) {
        return rows;
      };

      const startRowIndex = findRowIndex(rows, selectionStartIndex);

      // TMP for row iteraction.
      let rowsResult: DocumentFileRowRenderData[][] = [];

      for (const [rowIndex, row] of rows.entries()) {
        // If not start index row, push the unchanged row to result.
        if (rowIndex !== startRowIndex) {
          rowsResult.push(row);
          continue;
        };

        const addContentRows = newContent.split('\n');
        const addContentStartRow = addContentRows[0];
        const addContentTrailingRows = addContentRows.slice(1);
        const rowContentStartIndex = getRowContentIndexByBodySelectionIndex(rows, selectionStartIndex, rowIndex);

        // TMPs for section iteration.
        let startRow: DocumentFileRowRenderData[] = [];
        let trailingRows: DocumentFileRowRenderData[][] = [];
        let prevSectionsContentLength = 0;

        // sectionContentLengt + prevSectionsContentLength > rowContentStartIndex
        // 3 + 0 > 3 - false
        // 3 + 3 > 3  - true
        // 'abc' '123' 'fff'
        for (const [sectionIndex, section] of row.entries()) {

          const isSectionBeforeStart = prevSectionsContentLength + section.content.length < rowContentStartIndex;
          const isSectionAfterStart = prevSectionsContentLength >= rowContentStartIndex && sectionIndex > 0;
          const sectionStartIndexOffset = rowContentStartIndex - prevSectionsContentLength;

          console.log('sectionStartIndexOffset',sectionStartIndexOffset)

          // # Add unchanged section to startRow if it's before start index.
          if (isSectionBeforeStart) {
            startRow = [...startRow, section];
            prevSectionsContentLength += section.content.length;
            continue;
          }
          // # Trailing sections are handled when content is added so we break the loop.
          else if (isSectionAfterStart) {
            break;
          };

          // # If new rows need to be added.
          if (addContentTrailingRows.length) {

            const updatedSectionContent = (
              section.content.substring(0, sectionStartIndexOffset)
              + addContentStartRow
            );

            // Add current section with updated content to startRow.
            const updatedSection = {
              ...section,
              content: updatedSectionContent,
            };

            // Build trailing rows.
            const mappedTrailingRows: DocumentFileRowRenderData[][] = addContentTrailingRows.map((trailingRowText, i) => {
              const isLast = i === addContentTrailingRows.length - 1;

              // For last trailing row, get sections that was "cut off" from start row.
              let trailingSectionsFromStartRow: DocumentFileRowRenderData[] = [];
              if (isLast) {
                const trailingSections = removeContentFromRow(row, 0, rowContentStartIndex);
                const trailingSectionsContentLength = trailingSections.reduce((acc, section) => acc + section.content.length, 0);
                trailingSectionsFromStartRow = isLast && trailingSectionsContentLength
                  ? trailingSections
                  : [];
              }

              const newContentSections = {
                style: { ...Settings.defaultStyles },
                content: trailingRowText,
              }

              const newRowSections = [newContentSections, ...trailingSectionsFromStartRow];
              const newRowContentLength = newRowSections.reduce((acc, section) => acc + section.content.length, 0);

              if (newRowContentLength) {
                return newRowSections.filter(section => section.content.length > 0);
              } else {
                return newRowSections.filter((_section, i) => i === 0);
              }
            });

            startRow = [...startRow, updatedSection];
            trailingRows = mappedTrailingRows;
          }
          // # Handle no new rows to add.
          else {
            const trailingSectionContent = section.content.slice(sectionStartIndexOffset);
            console.log('trailingSectionContent',trailingSectionContent)

            const updatedSectionContent = (
              section.content.substring(0, rowContentStartIndex - prevSectionsContentLength)
              + addContentStartRow
              + trailingSectionContent
            );

            const updatedSection = {
              ...section,
              content: updatedSectionContent,
            };

            console.log('updatedSection',updatedSection)

            // # Add updated section and trailing sections to start row.
            startRow = [...startRow, updatedSection, ...row.slice(sectionIndex + 1)];
          };

          prevSectionsContentLength += section.content.length;
        };

        rowsResult = [...rowsResult, startRow, ...trailingRows];
      };

      return rowsResult;
    };

    const selectionStartRowIndex = findRowIndex(documentFile.rows, selectionOnCapture.start)
    const selectionEndRowIndex = findRowIndex(documentFile.rows, selectionOnCapture.end)
    let rowsFinal: DocumentFile['rows'] = [];

    // # Remove all content in between selection range.
    if (selectionOnCapture.start !== selectionOnCapture.end) {
      for (const [rowIndex, row] of documentFile.rows.entries()) {
        const rowContentIndexStart = getRowContentIndexByBodySelectionIndex(documentFile.rows, selectionOnCapture.start, rowIndex);
        const rowContentIndexEnd = getRowContentIndexByBodySelectionIndex(documentFile.rows, selectionOnCapture.end, rowIndex);
        const isSelectedRow = selectionStartRowIndex <= rowIndex && selectionEndRowIndex >= rowIndex;

        const rowFinal = removeContentFromRow(
          row,
          rowContentIndexStart,
          rowContentIndexEnd,
        );

        const rowFinalContentLength = rowFinal.reduce((acc, section) => acc + section.content.length, 0);

        // If row is selected and selection began before current row - add row sections to previous row.
        if (
          rowContentIndexStart < 0
          && rowContentIndexEnd > 0
          && rowFinalContentLength
        ) {
          rowsFinal[rowsFinal.length - 1] = [
            ...rowsFinal[rowsFinal.length - 1],
            ...rowFinal,
          ];
        }
        // # Add new row.
        else if (
          rowFinalContentLength
          || rowIndex === selectionStartRowIndex
          || !isSelectedRow
        ) {
          rowsFinal = [...rowsFinal, rowFinal];
        };
      };
    }
    // # Backspace input - remove one char from selection.
    else if (newContentLength === -1) {
      const selectionStartRowIndex = findRowIndex(documentFile.rows, selectionOnCapture.start);
      const rowContentChangeIndex = getRowContentIndexByBodySelectionIndex(documentFile.rows, selectionOnCapture.start, selectionStartRowIndex);

      const prevRow = documentFile.rows[selectionStartRowIndex - 1];
      const rowsBeforeChange = documentFile.rows.slice(0, selectionStartRowIndex);
      const rowsAfterChange = documentFile.rows.slice(selectionStartRowIndex + 1);
      const rowToChangeContentLength = documentFile.rows[selectionStartRowIndex].reduce(
        (acc2, section) => acc2 + section.content, ''
      ).length;

      // * Remove changed row if no content
      if (!rowToChangeContentLength) {
        rowsFinal = [...rowsBeforeChange, ...rowsAfterChange];
      }
      // * Move row sections to prev row.
      else if (rowContentChangeIndex === 0 && prevRow) {
        const prevRowUpdated = [
          ...prevRow,
          ...documentFile.rows[selectionStartRowIndex],
        ];

        const rowsBeforeChangeLastRemoved = rowsBeforeChange.filter((_, i) => i !== rowsBeforeChange.length - 1);
        const rowsBeforeChangeUpdated = [...rowsBeforeChangeLastRemoved, prevRowUpdated];

        rowsFinal = [...rowsBeforeChangeUpdated, ...rowsAfterChange];
      }
      // * Remove one character from row.
      else {
        const changedRow = removeContentFromRow(
          documentFile.rows[selectionStartRowIndex],
          rowContentChangeIndex - 1,
          rowContentChangeIndex,
        );

        rowsFinal = [...rowsBeforeChange, changedRow, ...rowsAfterChange];
      };
    }
    // # Remove no content.
    else {
      rowsFinal = [...documentFile.rows];
    };

    console.log('**** ->',rowsFinal)

    // Add new content.
    const updatedRows = addContentToDocument(rowsFinal, selectionOnCapture.start, newContent);

    // Emit event.
    onChange(updatedRows);
  }, [onChange, textRows, documentFile.rows]);

  /**
   * Textarea OnSelectionChange event handler.
   */
  const handleSelectionChange = useCallback(({ target }) => {
    const { current: textareaEl } = textareaRef;
    if (!textareaEl) {
      return;
    }

    if (onSelectionChange) {
      const { selectionStart, selectionEnd } = target;
      onSelectionChange(selectionStart, selectionEnd);
    }
  }, [onSelectionChange]);

  /**
   * Set textarea selection when selection prop changes.
   */
  useEffect(() => {
    const { current: textareaEl } = textareaRef;
    if (!textareaEl) {
      return;
    }

    const start = Math.min(selection.start, selection.end)
    const end = Math.max(selection.start, selection.end)

    textareaEl.setSelectionRange(start, end);
    textareaEl.focus()
  }, [selection, textareaRef]);

  return (
    <textarea
      className={styles.editorInput}
      cols={100}
      rows={15}
      onSelect={handleSelectionChange}
      onChange={(event) => handleChange(event, selection)}
      value={textRows.join('\n')}
      ref={textareaRef}
    ></textarea>
  );
}

export default EditorInput