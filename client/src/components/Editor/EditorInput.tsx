import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DocumentFile, DocumentFileRowRenderData } from "./Editor.types";

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

  /**
   * Document body as rows.
   */
  const textRows = useMemo(() => {
    return documentFile.rows.map(sections => {
      return sections.reduce((acc2, section) => acc2 + section.content, '');
    });
  }, [documentFile.rows])

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
  const findRowIndex = useCallback((selectionIndex: number) => {
    let curr = [...rowsLastSelectionIndex];

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
  }, [rowsLastSelectionIndex]);

  const selectionIndexHasStyles = useCallback((selectionIndex: number) => {

  }, []);

  const getRowSelectionIndexByBodySelectionIndex = useCallback((bodySelectionIndex: number, rowIndex: number) => {
    const prevRowLastBodyIndex = rowsLastSelectionIndex[rowIndex - 1];

    if (!prevRowLastBodyIndex) {
      return bodySelectionIndex;
    }

    return bodySelectionIndex - prevRowLastBodyIndex - 1;
  }, [rowsLastSelectionIndex]);

  /**
   * Textarea OnChange event handler.
   */
  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLTextAreaElement>,
    selectionOnCapture: EditorInputProps['selection']
  ) => {
    const texareaBody = event.target.value;
    const firstChangedRowIndex = findRowIndex(selectionOnCapture.start)
    const finalChangedRowIndex = findRowIndex(selectionOnCapture.end)
    const selectionStartRowCharacterIndex = getRowSelectionIndexByBodySelectionIndex(selectionOnCapture.start, firstChangedRowIndex);
    const selectionEndRowCharacterIndex = getRowSelectionIndexByBodySelectionIndex(selectionOnCapture.end, finalChangedRowIndex);



    const selectedCount = selectionOnCapture.end - selectionOnCapture.start;
    const contentLengthDiff = texareaBody.length - textRows.join('\n').length;
    const newContentLength = selectedCount + contentLengthDiff;
    const newContent = texareaBody.slice(selectionOnCapture.start, selectionOnCapture.start + newContentLength);


    const rowsFinal = documentFile.rows.map((row, i) => {
      // Is not changed row.
      if (
        i < firstChangedRowIndex
        || i > finalChangedRowIndex
      ) {
        return row;
      }

      const isFirstRow = i === firstChangedRowIndex;
      const isFinalRow = i === finalChangedRowIndex;

      const rowSelectionEndIndex = isFinalRow ? selectionOnCapture.end : textRows[i].length;
      const rowContentLength = row.map(section => section.content).join('').length;


      // Get row
      let prevSectionsTotalContentLength = 0;
      const rowSections: DocumentFileRowRenderData[] = [];
      for (const section of row) {
        const selectionStartSectionOffsetIndex = selectionStartRowCharacterIndex - prevSectionsTotalContentLength;
        const selectionEndSectionOffsetIndex = selectionEndRowCharacterIndex - prevSectionsTotalContentLength;

        const isEntireSectionSelected = (
          selectionStartSectionOffsetIndex <= 0
          && selectionEndSectionOffsetIndex >= section.content.length
        )


        if (isEntireSectionSelected) {
          // Section is removed.
          continue;
        }

        /**
         * The selected characters in current section
         */
        const selectedCharactersInSection = section.content.slice(selectionStartSectionOffsetIndex, selectionEndSectionOffsetIndex);

        const removeStringRange = (value: string, fromIndex: number, toIndex: number) => {
          return value.substring(0, fromIndex) + value.substring(toIndex);
        }

        /**
         * Remove selected content from current section.
         */
        let updatedSectionContent = removeStringRange(section.content, selectionStartSectionOffsetIndex, selectionEndSectionOffsetIndex)

        const isSelectionStartWithinSection = (
          selectionStartSectionOffsetIndex >= 0
          && selectionStartSectionOffsetIndex <= section.content.length
        );


        if (isSelectionStartWithinSection) {
          const contentPart1 = updatedSectionContent.slice(0, selectionStartRowCharacterIndex);
          const contentPart2 = updatedSectionContent.slice(selectionStartRowCharacterIndex, updatedSectionContent.length);

          console.log(newContent)
          updatedSectionContent = contentPart1 + newContent + contentPart2;
        }

        prevSectionsTotalContentLength += section.content.length;

        rowSections.push({
          ...section,
          content: updatedSectionContent,
        })
      };

      return rowSections
    });



    onChange(rowsFinal);


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
      onSelect={handleSelectionChange}
      onChange={(event) => handleChange(event, selection)}
      value={textRows.join('\n')}
      ref={textareaRef}
    ></textarea>
  );
}

export default EditorInput