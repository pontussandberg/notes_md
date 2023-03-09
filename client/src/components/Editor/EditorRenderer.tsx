import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Settings from './editorSettings';
import styles from '../../css/components/Editor/EditorRenderer.module.css'
import { DocumentFile, DocumentFileRowRenderData, DocumentFileRowSectionStyles } from "./Editor.types";

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
   * Document content as rows.
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

  /**
   * Current row position that is focued, no selection.
   */
  const currentRowIndex = useMemo(() => {
    if (selection.start !== selection.end) {
      return -1;
    }

    const rowIndex = findRowIndex(selection.start);
    return rowIndex;
  }, [selection, textRows, findRowIndex]);

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
   * Pass in string and render styles to get total width of that string in PX.
   */
  const simulateRenderStyledContent = useCallback((
    value: string,
    styles: DocumentFileRowSectionStyles,
  ) => {
    if (!rendererRef.current) {
      return {
        width: 0,
        height: 0,
      };
    }

    const el = document.createElement('span');

    el.innerText = value;
    el.style.whiteSpace = 'pre';
    el.style.visibility = 'hidden';

    el.style.letterSpacing = `${styles.letterSpacing}px`;
    el.style.fontSize = `${styles.fontSize}px`;
    el.style.fontStyle = styles.fontStyle;
    el.style.fontFamily = styles.fontFamily;

    rendererRef.current.appendChild(el);
    const { width, height } = el.getBoundingClientRect();
    el.remove();

    return {
      width,
      height,
    };
  }, [rendererRef])

  /**
   * Get toltal px width of row between start and stop indexes.
   */
  const getRenderDimensionsFromRow = useCallback((
    row: DocumentFileRowRenderData[],
    rowStartIndex: number,
    rowStopIndex: number,
    str?: string,
  ) => {
    /**
     * Considering the following values, this is what happens in the loop:
     *
     * row = [{ content: '12' }, { content: 'qqq }, { content: 'abc }]
     * rowStartIndex = 4
     * rowEndIndex = 8
     *
     * // Iteration 1.
     * sectionStartIndex = (4 - 0) = 4
     * sectionEndIndex = (8 - 0) = 8
     * relevantContent = ''
     *
     * // Iteration 2.
     * sectionStartIndex = (4 - 2) = 2
     * sectionEndIndex = (8 - 2) = 6
     * relevantContent = 'q'
     *
     * // Iteration 3.
     * sectionStartIndex = (4 - 5) = -1
     * sectionEndIndex = (8 - 5) = 3
     * relevantContent = 'abc'
     *
     */
    let widthPx = 0;
    let maxHeightPx = 0;
    let prevSectionsCharCount = 0;

    console.log(str)

    for (const section of row) {
      const sectionStartIndex = Math.max(0, rowStartIndex - prevSectionsCharCount);
      const sectionEndIndex = Math.max(0, rowStopIndex - prevSectionsCharCount)
      const relevantContent = section.content.slice(sectionStartIndex, sectionEndIndex);
      const { width, height } = simulateRenderStyledContent(relevantContent, section.style);
      console.log('\n')
      console.log('relevantContent',relevantContent)
      console.log({width, height})
      console.log('\n')
      widthPx += width;

      if (height > maxHeightPx) {
        maxHeightPx = height;
      }

      prevSectionsCharCount += section.content.length;
    }

    console.log(str)

    return {
      widthPx,
      maxHeightPx,
    };
  }, [simulateRenderStyledContent]);
  // console.log('assert', getRenderDimensionsFromRow(
  //   [
  //     { content: '12', style: { fontSize: 24, fontFamily: 'arial', fontStyle: 'normal', letterSpacing: 0.4 } },
  //     { content: 'qqq', style: { fontSize: 24, fontFamily: 'arial', fontStyle: 'normal', letterSpacing: 0.4 } },
  //     { content: 'abc', style: { fontSize: 24, fontFamily: 'arial', fontStyle: 'normal', letterSpacing: 0.4 } },
  //   ],
  //   4,
  //   8,
  //   'test',
  // ))

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

    /**
     * Build hightlight render data array.
     */
    const selectionHighlightRowData = documentFile.rows.map((row, i) => {
      if (i < selectionStartRowIndex) {
        return {
          width: 0,
          left: 0,
          rowMaxHeight: getRenderDimensionsFromRow(row, 0, row.length).maxHeightPx,
        };
      } else if (i > selectionEndRowIndex) {
        return null;
      }

      const isFirst = i === selectionStartRowIndex;
      const isLast = i === selectionEndRowIndex;

      const highlightStartIndex = isFirst ? selectionStartRowCharacterIndex : 0;
      const highlightEndIndex = isLast ? selectionEndRowCharacterIndex : textRows[i].length;

      console.log('rowIndex', i)
      console.log(isLast)
      console.log('highlightStartIndex', highlightStartIndex)
      console.log('highlightEndIndex', highlightEndIndex)

      const highlightContentDimesions = getRenderDimensionsFromRow(
        row,
        highlightStartIndex,
        highlightEndIndex,
      );

      const beforeHighlightContentDimesions = getRenderDimensionsFromRow(
        row,
        0,
        highlightStartIndex,
      );

      return {
        left: beforeHighlightContentDimesions.widthPx,
        width: highlightContentDimesions.widthPx,
        rowMaxHeight: Math.max(beforeHighlightContentDimesions.maxHeightPx, highlightContentDimesions.maxHeightPx),
      };
    }).filter((renderData): renderData is {left: number, width: number, rowMaxHeight: number} => renderData !== null);

    console.log('selectionHighlightRowData',selectionHighlightRowData)

    let prevRowsTotalHeight = 0;
    return selectionHighlightRowData.map((data, i) => {
      const result = (
        <div
          key={i}
          className={styles.selectionHighlight}
          style={{
            width: `${data.width}px`,
            left: `${data.left}px`,
            height: `${data.rowMaxHeight}px`,
            top: `${prevRowsTotalHeight}px`,
            position: 'absolute',
          }}
        ></div>
      );

      prevRowsTotalHeight += data.rowMaxHeight;

      return result;
    }
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
              fontSize: rowSection.style.fontSize,
              fontFamily: rowSection.style.fontFamily,
              fontStyle: rowSection.style.fontStyle,
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

        <div className={styles.rowsContainer} style={{border: '5px solid gray'}}>
          {/* Content rows */}
          { Rows }

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