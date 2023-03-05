import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Settings from './EditorSettings';
import styles from '../../css/components/Editor/EditorRenderer.module.css'
import { DocumentFile } from "./Editor.types";

type EditorRendererProps = {
  documentFile: DocumentFile;
  body: string;
  selection: {
    start: number;
    end: number
  };
  onSelectionChange: (
    selectionStart: number,
    selectionEnd: number,
  ) => void;
};

const EditorRenderer = ({
  documentFile,
  body,
  selection,
  onSelectionChange,
}: EditorRendererProps) => {
  const rendererRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    window.addEventListener('mouseup', () => {
      setIsSelecting(false);
    });

    return () => {
      window.removeEventListener('mouseup', () => {
        setIsSelecting(false);
      })
    }
  }, [setIsSelecting])

  /**
   * Document body as rows.
   */
  const textRows = useMemo(() => {
    return body.split('\n');
  }, [body])

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

  /**
   * Current row position that is focued, no selection.
   */
  const currentRowIndex = useMemo(() => {
    if (selection.start !== selection.end) {
      return -1;
    }

    const rowIndex = findRowIndex(selection.start);
    return rowIndex;
  }, [selection, body, textRows, findRowIndex]);

  const getTotalWidthOfCharactersInRef = useCallback((
    containerEl: HTMLElement,
    value: string
  ): number => {

    let width = 0;
    for (const char of value.split('')) {
      const el = document.createElement('span');

      el.innerHTML = `${char === ' ' ? '&nbsp;' : char}`;
      el.style.visibility = 'hidden';
      el.style.letterSpacing = Settings.Renderer.css.letterSpacing + 'px';
      el.style.fontSize = Settings.Renderer.css.fontSize + 'px';

      containerEl.appendChild(el);
      width += el.getBoundingClientRect().width;
      el.remove();
    }

    return width;
  }, [])

  /**
   * Get row height, this is same for all document.
   */
  const rowHeight = useMemo(() => {
    const { current: rendererEl } = rendererRef
    if (!rendererEl) {
      return 0
    }

    const el = document.createElement('span');
    el.innerText = 'a';
    el.style.visibility = 'hidden';
    el.style.letterSpacing = Settings.Renderer.css.letterSpacing + 'px';
    el.style.fontSize = Settings.Renderer.css.fontSize + 'px';

    rendererEl.appendChild(el);
    const { height } = el.getBoundingClientRect();
    el.remove();

    return height;
  }, [rendererRef.current, Settings.Renderer.css])

  const carretTopPos = useMemo(() => {
    const top = rowHeight * currentRowIndex;
    return `${top}px`
  }, [currentRowIndex, rowHeight])

  const carretLeftPos = useMemo(() => {
    const { current: rendererEl } = rendererRef
    if (!rendererEl || selection.start !== selection.end) {
      return
    }

    const currentRowText = textRows[currentRowIndex];
    const rowCarretIndex = Math.abs(rowsLastSelectionIndex[currentRowIndex] - currentRowText.length - selection.start);
    const left = getTotalWidthOfCharactersInRef(rendererEl, currentRowText.slice(0, rowCarretIndex));

    return `${left - (Settings.Renderer.css.letterSpacing / 2) - (Settings.Renderer.css.carretWidth / 2)}px`;
  }, [
    selection,
    rendererRef.current,
    textRows,
    currentRowIndex,
    Settings.Renderer.css,
    getTotalWidthOfCharactersInRef
  ]);

  /**
   * On click handler for Text Renderer.
   * - Set selection in parent state.
   * - Calculating selection indexes in document body by using slection API with some wizardry.
   */
  const handleClick = useCallback(() => {
    // Helper to find first parent el that has document row properties.
    const findRowElInParentTree = (el: HTMLElement | null | undefined) => {
      if (!el) {
        return null;
      }

      if (el.getAttribute('data-rowindex')) {
        return el;
      }

      let curr: HTMLElement | null = el;
      let result = null;

      while (curr && !result) {
        if (curr.getAttribute('data-rowindex')) {
          result = curr;
        } else {
          curr = curr.parentElement;
        }
      }
      return result;
    };

    const selection = window.getSelection();
    if (selection) {
      const selectionStartIndex = selection.anchorOffset;
      const selectionStartEl = findRowElInParentTree(selection.anchorNode?.parentElement);
      const selectionStartElTextContentLength = (selection.anchorNode?.textContent?.length || 0)

      const selectionEndIndex = selection.focusOffset
      const selectionEndEl = findRowElInParentTree(selection.focusNode?.parentElement);
      const selectionEndElTextContentLength = (selection.focusNode?.textContent?.length || 0)

      const selectionStartRowIndex = parseInt(selectionStartEl?.getAttribute('data-rowindex') || '0')
      const selectionEndRowIndex = parseInt(selectionEndEl?.getAttribute('data-rowindex') || '0')

      const selectionStart = Math.max(0, rowsLastSelectionIndex[selectionStartRowIndex] - selectionStartElTextContentLength + selectionStartIndex);
      const selectionEnd = Math.max(0, rowsLastSelectionIndex[selectionEndRowIndex] - selectionEndElTextContentLength + selectionEndIndex);

      const selectionStartFinal = Math.min(selectionStart, selectionEnd);
      const selectionEndFinal = Math.max(selectionStart, selectionEnd);

      onSelectionChange(selectionStartFinal, selectionEndFinal);
    }
  }, [onSelectionChange, rowsLastSelectionIndex])

  /**
   * Selection highlight element.
   * TODO - refactor into seperate component
   */
  const SelectionHighlight = useMemo(() => {
    if (isSelecting) {
      return null
    }

    if (selection.start === selection.end) {
      return null;
    }

    const rendererEl = rendererRef.current;
    if (!rendererEl) {
      return null;
    }

    const getRowSelectionIndexByBodySelectionIndex = (bodySelectionIndex: number, rowIndex: number) => {
      const prevRowLastBodyIndex = rowsLastSelectionIndex[rowIndex - 1];

      if (!prevRowLastBodyIndex) {
        return bodySelectionIndex;
      }

      return bodySelectionIndex - prevRowLastBodyIndex - 1;
    };

    const selectionStartRowIndex = findRowIndex(selection.start);
    const selectionEndRowIndex = findRowIndex(selection.end);
    const selectionStartRowCharacterIndex = getRowSelectionIndexByBodySelectionIndex(selection.start, selectionStartRowIndex);
    const selectionEndRowCharacterIndex = getRowSelectionIndexByBodySelectionIndex(selection.end, selectionEndRowIndex);
    const rowsToCover = textRows.filter((_, i) => (i >= selectionStartRowIndex && i <= selectionEndRowIndex));

    const selectionHighlightRowData = rowsToCover.map((row, i) => {
      let rowFinal: string = row;
      let left = 0;

      const isFirst = i === 0;
      const isLast = i === rowsToCover.length - 1;

      if (isFirst && isLast) {
        const strBeforeSelection = row.slice(0, selectionStartRowCharacterIndex);
        left = getTotalWidthOfCharactersInRef(rendererEl, strBeforeSelection);

        rowFinal = row.slice(selectionStartRowCharacterIndex, selectionEndRowCharacterIndex)
      }
      else if (isFirst) {
        const strBeforeSelection = row.slice(0, selectionStartRowCharacterIndex);
        left = getTotalWidthOfCharactersInRef(rendererEl, strBeforeSelection);

        rowFinal = row.slice(selectionStartRowCharacterIndex, row.length);
      }
      else if (isLast) {
        rowFinal = row.slice(0, selectionEndRowCharacterIndex);
      }

      // Filler for empty row.
      if (rowFinal.length === 0) {
        rowFinal = ' ';
      }

      return {
        width: getTotalWidthOfCharactersInRef(rendererEl, rowFinal),
        left,
      };
    })

    return selectionHighlightRowData.map((data, i) => (
      <div
        key={i}
        className={styles.selectionHighlight}
        style={{
          width: `${data.width}px`,
          left: `${data.left}px`,
          height: `${rowHeight}px`,
          top: `${rowHeight * (selectionStartRowIndex + i)}px`,
          position: 'absolute',
        }}
      ></div>)
    );
  }, [
    selection,
    rowsLastSelectionIndex,
    textRows,
    getTotalWidthOfCharactersInRef,
    isSelecting,
  ]);

  /**
   * Carret element.
   * TODO - refactor into seperate component
   */
  const Carret = useMemo(() => {
    if (isSelecting) {
      return null;
    }

    return (
      <div
        // Key is used to trigger reset of css animation when selection changes.
        key={selection.start}
        className={styles.carret}
        style={{
          height: `${rowHeight}px`,
          left: carretLeftPos,
          top: carretTopPos,
          display: selection.start === selection.end ? 'block' : 'none',
        }}>
      </div>
    )
  }, [
    selection,
    styles.carret,
    rowHeight,
    carretLeftPos,
    carretTopPos,
    isSelecting,
  ]);

  const Rows = useMemo(() => {
    return documentFile.rows.map((rowSections, i) => {
      const rowElems = rowSections.map((rowSection, i) => {
        return (
          <div
            data-rowindex={`${i}`}
            key={i}
            style={{
              fontSize: rowSection.fontSize,
              fontFamily: rowSection.fontFamily,
              fontStyle: rowSection.fontStyle,
            }}
          >
            {rowSection.content}
          </div>
        )
      });

      return rowElems
    })
  }, [documentFile])

  return (
    <>
      <div
        ref={rendererRef}
        onClick={handleClick}
        className={styles.renderer}

        // Handling mouseup event on window on mount
        onMouseDown={() => setIsSelecting(true)}
      >

        {/* <div className={styles.rowsContainer} style={{border: '5px solid gray'}}>
          {Rows}
        </div> */}

        <div className={styles.rowsContainer}>
          { /* Render rows */ }
          {
            body.split('\n').map((row, i) =>
              <div
                style={{
                  letterSpacing: Settings.Renderer.css.letterSpacing,
                  fontSize: Settings.Renderer.css.fontSize,
                }}
                data-rowindex={`${i}`}
                key={i}
              >
                {row || <div dangerouslySetInnerHTML={{ __html: '&nbsp;' }}></div>}
              </div>
            )
          }

          {/* Text selection highlight */}
          { SelectionHighlight }

          {/* Carret */}
          { Carret }
        </div>

      </div>
    </>
  );
};

export default EditorRenderer;