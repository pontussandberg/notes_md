import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  ReactElement,
} from 'react'
import uniqid from 'uniqid'
import showdown from 'showdown'

import styles from '../css/editor.module.css'
import GlassButton from './Buttons/GlassButton'
import { TActiveKeys } from '../types'
import { getCssVariables } from '../helpers'

const Editor = ({ content }: { content: string }) => {
  const editorScrollYContainerRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const editorMarginRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<HTMLDivElement>(null)
  const singleCharRef = useRef<HTMLDivElement>(null)
  const currentLineHighlightRef = useRef<HTMLDivElement>(null)
  const editorLinesRef = useRef<HTMLDivElement>(null)

  const [documentContent, setDocumentContent] = useState(content)
  const [editorViewLines, setEditorViewLines] = useState('')
  const [currentLineNumber, setCurrentLineNumber] = useState(0)
  const [currentLinesCount, setCurrentLinesCount] = useState(0)
  const [lineEnumerationEl, setLineEnumerationEl] = useState<null | ReactElement[]>(null)
  const [mdHtml, setMdHtml] = useState('')
  const [showMdViewer, setShowMdViewer] = useState(false)
  const [activeKeys, setActiveKeys] = useState<TActiveKeys>({})
  const [isSelectingEditorContent, setIsSelectingEditorContent] = useState(false)

  const [selectionEndLine, setSelectionEndLine] = useState<number>(0)
  const [selectionStartLine, setSelectionStartLine] = useState<number>(0)

  useEffect(() => {
    // TODO - Refactor into updateEditorViewLines()

    // @ts-ignore
    if (window && window.Prism) {
      // @ts-ignore
      window.Prism.highlightAll()
    }
    ////////

    if (documentContent) {
      localStorage.setItem('note', documentContent)
    }
  }, [documentContent])

  /**
   * Mounted
   */
  useEffect(() => {
    updateLineEnumerationEl()
    updateEditorViewLines(documentContent)
  }, [])

  useEffect(() => {
    if (isSelectingEditorContent) {
      //addSpaceToEmptyLines()
    } else {
      //removeSpaceFromEmptyLines()
    }
  }, [isSelectingEditorContent])




  /**
   * Event listeners
   */
  useEffect(() => {
    editorViewRef?.current?.addEventListener('scroll', handleScrollX)

    window.addEventListener('resize', updateLineEnumerationEl)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mouseup', setTextareaSelection)

    // document.addEventListener('selectionChange', handleSelectionChange)

    // Cleanup
    return () => {
      editorViewRef?.current?.removeEventListener('scroll', handleScrollX)

      window.removeEventListener('resize', updateLineEnumerationEl)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mouseup', setTextareaSelection)

      // document.addEventListener('selectionchange', handleSelectionChange)
    }
  }, [showMdViewer, activeKeys, selectionStartLine, selectionEndLine])


  const handleSelectionChange = (event: Event) => {
    console.log(event)
  }


  /*****************
   * Misc effects  *
   *****************/

  useEffect(() => {
    updateLineEnumerationEl()
    syncVisualCaretPosition()
  }, [currentLineNumber, documentContent, showMdViewer])

  useEffect(() => {
    updateCurrentLineNumber()
  }, [documentContent, showMdViewer])

  /*****************
   *     </>       *
   *****************/

  /**
   * Text selection or highlight
   */
  const setTextareaSelection = () => {
    const selection = window.getSelection()

    const range = selection && selection.rangeCount > 0
      ? selection?.getRangeAt(0)
      : null

    if (!range) {
      return
    }

    const lines = getLines(documentContent)
    const textAreaEl = textAreaRef.current

    if (!textAreaEl) {
      return
    }

    const startIndex = getTextareaContentIndex(selectionStartLine - 1, range.startOffset, lines)
    const endIndex = getTextareaContentIndex(selectionEndLine - 1, range.endOffset, lines)

    if (!startIndex || !endIndex) {
      return
    }

    textAreaEl.selectionStart = startIndex
    textAreaEl.selectionEnd = endIndex
  }

  const handleEditorClickEvent = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, isMouseUpEvent: boolean) => {
    if (
      !editorViewRef.current
      || !textAreaRef.current
      || !editorScrollYContainerRef.current
    ) {
      return
    }

    const { scrollTop } = editorScrollYContainerRef.current
    const { scrollLeft } = editorViewRef.current
    const { current: textAreaEl } = textAreaRef

    const lines = getLines(documentContent)
    const linesCount = lines.length

    const editorCharWidth = getEditorCharWidth()
    const {
      editorPaddingLeft,
      editorPaddingTop,
      editorLineHeight,
      editorMarginWidth
    } = getEditorCssVars()

    const { x, y } = event.nativeEvent
    // Calculating current line by checking mouse Y position
    let mouseLineNumber = Math.ceil((y - editorPaddingTop + scrollTop - 2) / editorLineHeight)



    if (isMouseUpEvent) {
      setSelectionEndLine(mouseLineNumber)
    } else {
      setSelectionStartLine(mouseLineNumber)
    }

    /**
     * Check if click was recorded outside of lines
     */
    if (mouseLineNumber < 1) {
      setVisualCarretPos(0, 0)
      setCurrentLineNumber(1)
      return
      /* *** */
    } else if (mouseLineNumber > linesCount) {
      const currentLineLength = lines[linesCount - 1].length
      setVisualCarretPos(currentLineLength, linesCount)
      setCurrentLineNumber(linesCount)
      return
      /* *** */
    }

    const lineIndexZero = mouseLineNumber - 1
    const currentLineLength = lines[lineIndexZero].length

    // The index on X axis - most left character on each line is index 0
    let caretXIndex = Math.round((x - editorPaddingLeft - editorMarginWidth + scrollLeft) / editorCharWidth)

    if (caretXIndex < 0) {
      caretXIndex = 0
    }

    // Setting caretXIndex to last index of line
    if (caretXIndex >= currentLineLength) {
      caretXIndex = currentLineLength
    }

    // Setting visial caret position with css
    setVisualCarretPos(caretXIndex, lineIndexZero)

    // Update currentLineNumber state
    setCurrentLineNumber(mouseLineNumber)

    // Focus textarea element on next tick - after it's visual position has been updated - because
    setTimeout(() => {
      if (isMouseUpEvent) {

        /**
         * SELECTION CODE
         * START
         */

        // Helper var to know if selection was made in editor
        let selectionIsValid = false

        const selection = window.getSelection()
        const selectedCharsLength = selection && selection.toString()
          ? selection.toString().length
          : 0

        if (selection) {
          // Selection start / end nodes
          let selectionStartNode = selection.anchorNode
          let selectionEndNode = selection.focusNode

          // Selection char counts
          let startNodeSelectionStartIndex = selection.anchorOffset
          let endNodeSelectionEndIndex = selection.focusOffset

          // Row "div[data-row]" container elems for start / end nodes
          let selectionStartRowElem = selectionStartNode?.parentElement?.closest('div[data-row]') as HTMLElement | null
          let selectionEndRowElem = selectionEndNode?.parentElement?.closest('div[data-row]') as HTMLElement | null

          if (selectionStartRowElem && selectionEndRowElem) {

            // Selection is valid since selectionStartRowElem & selectionEndRowElem exists AND there is selected text
            if (selectedCharsLength) {
              selectionIsValid = true
            }

            // Row numbers for selection start / end nodes
            let selectionStartRowNum = selectionStartRowElem?.dataset?.row ? parseInt(selectionStartRowElem.dataset.row) : 0
            let selectionEndRowNum = selectionEndRowElem?.dataset?.row ? parseInt(selectionEndRowElem.dataset.row) : 0

            /**
             * If selection is reversed, i.e start row is greater than end row -
             * swap variable values so that terminology makes sense;
             *
             * $selectionStartRowElem       <-->  $selectionEndRowElem
             * $selectionStartRowNum        <-->  $selectionEndRowNum
             * $startNodeSelectionStartIndex  <-->  $endNodeSelectionEndIndex
             * $selectionStartNode          <-->  $selectionEndNode
             */
            if (selectionStartRowNum > selectionEndRowNum) {
              const tmpselectionStartRowElem = selectionStartRowElem
              selectionStartRowElem = selectionEndRowElem
              selectionEndRowElem = tmpselectionStartRowElem

              const tmpSelectionStartRowNum = selectionStartRowNum
              selectionStartRowNum = selectionEndRowNum
              selectionEndRowNum = tmpSelectionStartRowNum

              const tmpStartNodeSelectionStartIndex = startNodeSelectionStartIndex
              startNodeSelectionStartIndex = endNodeSelectionEndIndex
              endNodeSelectionEndIndex = tmpStartNodeSelectionStartIndex

              const tmpSelectionStartNode = selectionStartNode
              selectionStartNode = selectionEndNode
              selectionEndNode = tmpSelectionStartNode
            }

            const textareaSelectionStartIndex = getTextareaContentIndex(
              selectionStartRowNum - 1,
              startNodeSelectionStartIndex,
              lines,
            )

            const textareaSelectionEndIndex = getTextareaContentIndex(
              selectionEndRowNum - 1,
              endNodeSelectionEndIndex,
              lines,
            )

            // Set selection in textarea
            textAreaEl.focus()
            textAreaEl.setSelectionRange(textareaSelectionStartIndex, textareaSelectionEndIndex)
          }
        }

        /**
         * SELECTION CODE
         * END
         */
      }
    })

  }

  const getTextareaContentIndex = (rowIndexZero: number, colCharIndexZero: number, lines: string[]) => {
    if (rowIndexZero < 0) {
      return 0
    }

    const linesClone = [...lines]
    linesClone.length = rowIndexZero
    const stringPreSelection = linesClone.join('')

    // Index position in text content
    return stringPreSelection.length + colCharIndexZero + rowIndexZero
  }

  const handleScrollX = () => {
    if (
      !editorViewRef.current
      || !currentLineHighlightRef.current
    ) {
      return
    }

    currentLineHighlightRef.current.style.left = `${editorViewRef.current.scrollLeft}px`
  }

  /**
   * Setting visual position(top/left) of textarea caret on top of editorView
   */
  const setVisualCarretPos = (
    caretXIndex: number,
    caretYIndex: number,
  ): void => {
    const { current: textAreaEl } = textAreaRef
    const { current: editorLinesEl } = editorLinesRef
    if (!textAreaEl || !editorLinesEl) {
      return
    }

    /**
     * Char width differs depending on how many chars are on the same line
     * this is a workaround so instead of calculating the individual character width
     * we calculate the character width for the current line
     */
    // const selectedLineWidth = editorLinesEl.children[caretYIndex].querySelector('code')?.getBoundingClientRect().width || 0
    // const currentLineLength = getLines(documentContent)[caretYIndex].length
    // const lineCharWidth = (selectedLineWidth / currentLineLength) || 0


    // Can't explain but the cursur needs to be pushed back
    const hackyFixLeftValue = -1

    const { editorPaddingLeft, editorPaddingTop, editorLineHeight } = getEditorCssVars()
    const editorCharWidth = getEditorCharWidth()

    const caretTopPos = (caretYIndex * editorLineHeight) + editorPaddingTop
    const caretLeftPos = (caretXIndex * editorCharWidth) + editorPaddingLeft + hackyFixLeftValue
    textAreaEl.style.top = `${caretTopPos}px`
    textAreaEl.style.left = `${caretLeftPos}px`
  }

  /**
   * Get character width of editor text
   */
  const getEditorCharWidth = (): number => {
    if (singleCharRef.current) {
      return singleCharRef.current.getBoundingClientRect().width / 40
    }

    return 0
  }

  /**
   * Update activeKeys in state
   */
  const toggleActiveKey = (keyLowerCase: string, active: boolean) => {
    const keys = {
      ...activeKeys,
      [keyLowerCase]: active,
    }

    setActiveKeys(keys)
  }

  /**
   * Handler for key up event
   */
  const handleKeyUp = ({ key }: globalThis.KeyboardEvent) => {
    const keyLower = key.toLowerCase()
    toggleActiveKey(keyLower, false)
  }

  /**
   * Handler for key down event
   */
  const handleKeyDown = (event: globalThis.KeyboardEvent) => {
    const { key } = event
    const keyLower = key.toLowerCase()
    toggleActiveKey(keyLower, true)

    const { meta, shift, control } = activeKeys

    // Duplicate line
    if (
      (meta && shift && keyLower === 'arrowdown')
      || (meta && shift && keyLower === 'arrowup')
      || (control && shift && keyLower === 'arrowup')
      || (control && shift && keyLower === 'arrowdown')
    ) {
      event.preventDefault()
      duplicateLine()
    }

    if (isArrowKey(keyLower)) {
      syncVisualCaretPosition()
      updateCurrentLineNumber()
    } else if (keyLower === 'escape') {
      toggleMdViewer()
    }
  }

  /**
   * Synching visual caret position with actual caret position
   */
  const syncVisualCaretPosition = (editorTextContent?: string) => {
    setTimeout(() => {
      if (!editorTextContent) {
        editorTextContent = documentContent
      }

      if (textAreaRef.current && currentLineNumber > 0) {
        const { selectionStart } = textAreaRef.current
        const currentLineIndex = currentLineNumber - 1

        const lines = getLines(editorTextContent)

        const contentPreCurrentLine = [...lines]
        contentPreCurrentLine.length = currentLineIndex

        const charsBeforeCurrentLine = contentPreCurrentLine.join('').length + currentLineIndex
        const x = selectionStart - charsBeforeCurrentLine

        setVisualCarretPos(x, currentLineIndex)
      }
    })
  }

  /**
   * Handler for editor content change
   */
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target

    updateMdHtml(value)
    setDocumentContent(value)
    updateEditorViewLines(value)
  }

  /**
   * Update state with HTML translation of text content
   *
   * TODO - add PrismJS to syntax highlight the markup before it's put in state
   */
  const updateEditorViewLines = (textContent: string) => {
    const linesHTML: string[] = []
    const lines = getLines(textContent)
    for (const [i, line] of lines.entries()) {

      // TODO - cleanup this row
      const lineHtml = `<div data-row="${i + 1}" ><code class="language-markdown">${line.replace(/\ /, '&nbsp;')}${line.length === 0 ? '&nbsp;' : ''}</code></div>`
      linesHTML.push(lineHtml)
    }

    const html = linesHTML.join('')
    setEditorViewLines(html)
  }

  /**
   * Check if keyevent is a move key
   */
  const isArrowKey = (keyLower: string) => {
    if (
      keyLower === 'arrowup'
      || keyLower === 'arrowdown'
      || keyLower === 'arrowleft'
      || keyLower === 'arrowright'
    ) {
      return true
    }
  }

  /**
   * Duplicates the current line onto the next line
   */
  const duplicateLine = () => {
    const { current: el } = textAreaRef

    if (el) {
      const lines = el.value.split('\n')
      const currentLineContent = lines[currentLineNumber - 1]

      lines.splice(currentLineNumber, 0, currentLineContent).join()
      const content = lines.join('\n')

      setDocumentContent(content)
    }
  }

  /**
   * Update current line in state
   */
  const updateCurrentLineNumber = () => {
    requestAnimationFrame(() => {
      const { current: el } = textAreaRef

      if (el) {
        const currLine = el.value.substr(0, el.selectionStart).split("\n").length
        setCurrentLineNumber(currLine)
      }
    })
  }

  /**
   * Setting state with editor content compiled to markdown html
   */
  const updateMdHtml = (value: string) => {
    const converter = new showdown.Converter()
    const html = converter.makeHtml(value)
    setMdHtml(html)
  }

  const getLines = (value: string): string[] => {
    return value.split('\n')
  }

  /**
   * Get the enum JSX element for an editor line
   */
  const getLineNumEl = (index: number, isCurrentLine = false): ReactElement => {
    const { editorLineHeight, editorPaddingTop } = getEditorCssVars()
    const topPos = (index * editorLineHeight) + editorPaddingTop + 1

    return (
      <span
        className={styles.lineEnumeration}
        key={uniqid()}
        style={{
          top: `${topPos}px`,
          color: isCurrentLine ? '#fff' : 'var(--editor-light)'
        }}
      >
        {index + 1}
      </span>
    )
  }

  /**
   * Setting state var lineEnumerationEl with line enumeration els.
   */
  const updateLineEnumerationEl = () => {
    setTimeout(() => {
      if (!editorViewRef.current) {
        return
      }

      const linesCount = getLines(documentContent).length

      // Scroll to left if new line was made
      if (linesCount > currentLinesCount) {
        editorViewRef.current.scrollLeft = 0
      }

      // Build array lines
      let lines: ReactElement[] = []
      for (let i = 0; i < linesCount; i++) {
        const isCurrentLine = i + 1 === currentLineNumber
        lines.push(getLineNumEl(i, isCurrentLine))
      }

      setCurrentLinesCount(linesCount)
      setLineEnumerationEl(lines)
    })
  }

  const getEditorCssVars = () => {
    const cssVars = [
      '--editor-line-height',
      '--editor-padding-top',
      '--editor-padding-bottom',
      '--editor-padding-left',
      '--editor-margin-width',
    ]

    return getCssVariables(cssVars)
  }

  /**
   * Top position for current line highlight(cover)
   */
  const getCurrentLineHighlightTopPostion = () => {
    const { editorLineHeight, editorPaddingTop } = getEditorCssVars()
    return (currentLineNumber - 1) * editorLineHeight + editorPaddingTop
  }

  /**
   * Toggle between editor view & markdown view
   */
  const toggleMdViewer = () => {
    // setShowMdViewer(!showMdViewer)

  }

  return (
    <div
      ref={editorScrollYContainerRef}
      className={styles.scrollYContainer}
    >
      <div
        ref={editorContainerRef}
        className={styles.container}
        onMouseUp={(e) => handleEditorClickEvent(e, true)}
        onMouseDown={(e) => handleEditorClickEvent(e, false)}
      >
        {/* Left margin ( line enumeration ) */}
        <div ref={editorMarginRef} className={styles.editorMargin}>{lineEnumerationEl}</div>

        {/* Editor view */}
        <div
          ref={editorViewRef}
          className={styles.editorView}
        >
          {/* Lines */}
          <div ref={editorLinesRef} className={styles.editorViewLines} dangerouslySetInnerHTML={{ __html: editorViewLines }}></div>

          {/* This is used to get the width of each character in the editorView */}
          <div ref={singleCharRef} className={`${styles.singleCharRef} ${styles.editorViewLines}`}>abcdefghijklmnopqrstuvxyz123451234512345</div>

          {/* Current line highlight */}
          <div
            ref={currentLineHighlightRef}
            className={styles.currentLineHighlight}
            style={{
              display: `${currentLineNumber > 0 ? 'block' : 'none'}`,
              top: `${getCurrentLineHighlightTopPostion()}px`,
            }}
          ></div>

          {/* Text input */}
          <textarea
            spellCheck={false}
            disabled={showMdViewer}
            ref={textAreaRef}
            value={documentContent}
            onChange={handleInputChange}
            className={styles.textInput}
          ></textarea>
        </div>
      </div>


      {/* Editor / Markdown viewer toggle */}
      <GlassButton
        onClick={toggleMdViewer}
        title={showMdViewer ? 'Show editor (esc)' : 'Show markdown (esc)'}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          zIndex: 30,
        }}
      />

      {/* Markdown viewer */}
      <div
        onClick={toggleMdViewer}
        className={styles.mdViewer}
        dangerouslySetInnerHTML={{ __html: mdHtml }}
        style={{ display: showMdViewer ? 'block' : 'none' }}
      ></div>
    </div>

  )
}

export default Editor