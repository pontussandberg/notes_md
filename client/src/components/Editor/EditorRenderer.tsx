import { useCallback, useMemo, useRef } from "react";
import Settings from './editorRendererSettings';
import styles from '../../css/components/Editor/EditorRenderer.module.css'

type EditorRendererProps = {
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
  body,
  selection,
  onSelectionChange,
}: EditorRendererProps) => {
  const rendererRef = useRef<HTMLDivElement>(null);

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

  /**
   * Current row position that is focued, no selection.
   */
  const currentRowIndex = useMemo(() => {
    if (selection.start !== selection.end) {
      return -1;
    }

    // Binary search, find row for selectionIndex.
    const findRowIndex = (selectionIndex: number) => {
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
    };

    const rowIndex = findRowIndex(selection.start);
    return rowIndex;
  }, [selection, body, textRows]);

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
    el.style.letterSpacing = Settings.css.letterSpacing + 'px';
    el.style.fontSize = Settings.css.fontSize + 'px';

    rendererEl.appendChild(el);
    const { height } = el.getBoundingClientRect();
    el.remove();

    return height;
  }, [rendererRef.current, Settings.css])

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
    const rowCarretIndex = Math.abs(
      rowsLastSelectionIndex[currentRowIndex] - currentRowText.length - selection.start
    );

    let left = 0;
    for (const [i, char] of currentRowText.split('').entries()) {
      if (i === rowCarretIndex) {
        break;
      }

      const el = document.createElement('span');

      // Using 2 chars to include letter spacing.
      el.innerText = `${char}`;
      el.style.visibility = 'hidden';
      el.style.letterSpacing = Settings.css.letterSpacing + 'px';
      el.style.fontSize = Settings.css.fontSize + 'px';

      rendererEl.appendChild(el);
      left += el.getBoundingClientRect().width;
      el.remove();
    }

    return `${left - (Settings.css.letterSpacing / 2) - (Settings.css.carretWidth / 2)}px`;
  }, [selection, rendererRef.current, textRows, currentRowIndex, Settings.css]);

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

      console.log(result)
      console.log('end')
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

      onSelectionChange(selectionStart, selectionEnd);
    }
  }, [onSelectionChange, rowsLastSelectionIndex])

  return (
    <>
      <div
        onClick={handleClick}
        ref={rendererRef}
        className={styles.renderer}
      >

        <div className={styles.rowsContainer}>
          { /* Render rows */
            body.split('\n').map((row, i) =>
              <div
                style={{
                  letterSpacing: Settings.css.letterSpacing,
                  fontSize: Settings.css.fontSize,
                }}
                data-rowindex={`${i}`}
                key={i}
              >
                {row || <div dangerouslySetInnerHTML={{ __html: '&nbsp;' }}></div>}
              </div>
            )
          }

          {/* Carret */}
          <div
            className={styles.carret}
            style={{
              height: `${rowHeight}px`,
              left: carretLeftPos,
              top: carretTopPos,
              display: selection.start === selection.end ? 'block' : 'none',
            }}>
          </div>
        </div>

      </div>
    </>
  );
};

export default EditorRenderer;