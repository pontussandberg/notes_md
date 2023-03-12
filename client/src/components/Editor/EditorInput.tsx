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
    // console.log('Test')
    // console.log(
    //   removeContentFromRow(
    //     [{style: Settings.defaultStyles, content: '123'},{style: Settings.defaultStyles, content: 'abc'},{style: Settings.defaultStyles, content: 'xqc'}],
    //     -2,
    //     1,
    //   )
    // );


    const addContentToDocument = (
      rows: DocumentFile['rows'],
      selectionStartIndex: number,
      newContent: string,
    ) => {

      const startRowIndex = findRowIndex(rows, selectionStartIndex);

      // TMP rows result.
      let rowsResult: DocumentFileRowRenderData[][] = [];

      for (const [rowIndex, row] of rows.entries()) {

        // If not start index row, push the unchanged row to result.
        if (rowIndex !== startRowIndex) {
          rowsResult.push(row);
          continue;
        }

        const addContentRows = newContent.split('\n');
        const addContentStartRow = addContentRows[0];
        const addContentTrailingRows = addContentRows.slice(1);
        const rowContentStartIndex = getRowContentIndexByBodySelectionIndex(rows, selectionStartIndex, rowIndex);

        // TMPs for section iteration.
        let startRow: DocumentFileRowRenderData[] = [];
        let prevSectionsContentLength = 0;

        for (const [sectionIndex, section] of row.entries()) {
          const isSectionBeforeStart = prevSectionsContentLength + section.content.length < rowContentStartIndex;
          const isSectionAfterStart = prevSectionsContentLength > rowContentStartIndex;

          // # Add unchanged section to startRow if it's before start index.
          if (isSectionBeforeStart) {
            startRow = [...startRow, section];
            prevSectionsContentLength += section.content.length;
            continue;
          }
          // # Trailing sections are handled when content is added so we break the loop.
          else if (isSectionAfterStart) {
            break;
          }

          /**
           * Trailing section content after selection start.
           */
          const sectionTrailingContent = section.content.substring(
            rowContentStartIndex - prevSectionsContentLength,
          );

          // # If new rows need to be added.
          if (
            sectionTrailingContent
            && addContentTrailingRows.length
          ) {
            const updatedSectionContent = (
              section.content.substring(0, rowContentStartIndex - prevSectionsContentLength)
              + addContentStartRow
            );

            // # Add current section with updated content to startRow.
            startRow.push({
              ...section,
              content: updatedSectionContent,
            });

            // # Build trailing rows.
            const trailingRows: DocumentFileRowRenderData[][] = addContentTrailingRows.map((trailingRowText, i) => {
              const isLast = i === addContentTrailingRows.length - 1;
              const trailingSectionsFromStartRow = isLast
                ? removeContentFromRow(row, 0, rowContentStartIndex)
                : [];

              return [
                {
                  style: { ...Settings.defaultStyles },
                  content: trailingRowText,
                },
                ...trailingSectionsFromStartRow,
              ];
            });

            rowsResult = [...rowsResult, startRow, ...trailingRows];
          }
          // # Handle no new rows to add.
          else {
            const updatedSectionContent = (
              section.content.substring(0, rowContentStartIndex - prevSectionsContentLength)
              + addContentStartRow
              + sectionTrailingContent
            );

            const updatedSection = {
              ...section,
              content: updatedSectionContent,
            };

            // # Add updated section and trailing sections to start row.
            startRow = [...startRow, updatedSection, ...row.slice(sectionIndex + 1)];
            rowsResult = [...rowsResult, startRow];
          };

          prevSectionsContentLength += section.content.length;
        };
      };

      return rowsResult;
    };

    // console.log('Test')
    // console.log('result',
    //   addContentToDocument(
    //     [
    //       [{style: Settings.defaultStyles, content: '123'},{style: Settings.defaultStyles, content: 'abc'},{style: Settings.defaultStyles, content: 'xqc'}],
    //       [{style: Settings.defaultStyles, content: 'ddd'},{style: Settings.defaultStyles, content: ' 222'},{style: Settings.defaultStyles, content: 'd'}],
    //     ],
    //     11,
    //     'ADD\nnew line'
    //   )
    // );

    let rowsFinal: DocumentFile['rows'] = [];

    // # Remove all content in between selection range.
    if (selectionOnCapture.start !== selectionOnCapture.end) {
      for (const [rowIndex, row] of documentFile.rows.entries()) {
        const rowFinal = removeContentFromRow(
          row,
          getRowContentIndexByBodySelectionIndex(documentFile.rows, selectionOnCapture.start, rowIndex),
          getRowContentIndexByBodySelectionIndex(documentFile.rows, selectionOnCapture.end, rowIndex),
        );
        console.log('rowFinal', rowFinal)

        const rowFinalContentLength = rowFinal.reduce((acc, section) => acc + section.content.length, 0);
        if (rowFinalContentLength) {
          rowsFinal.push(rowFinal);
        }
      }
    }
    // # Backspace input - remove one char from selection.
    else if (newContentLength === -1) {
      const rowChangeIndex = findRowIndex(documentFile.rows, selectionOnCapture.start)
      const rowsBeforeChange = documentFile.rows.slice(0, rowChangeIndex);
      const rowsAfterChange = documentFile.rows.slice(rowChangeIndex + 1);
      const rowToChangeContentLength = documentFile.rows[rowChangeIndex].reduce(
        (acc2, section) => acc2 + section.content, ''
      ).length;

      // Remove changed row if no content
      if (!rowToChangeContentLength) {
        rowsFinal = [...rowsBeforeChange, ...rowsAfterChange];
      }
      // Remove one character from row.
      else {
        const rowContentChangeIndex = getRowContentIndexByBodySelectionIndex(documentFile.rows, selectionOnCapture.start, rowChangeIndex);
        const changedRow = removeContentFromRow(
          documentFile.rows[rowChangeIndex],
          rowContentChangeIndex - 1,
          rowContentChangeIndex,
        );

        rowsFinal = [...rowsBeforeChange, changedRow, ...rowsAfterChange];
      };
    }
    // # Remove no content.
    else {
      rowsFinal = [...documentFile.rows];
    }

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