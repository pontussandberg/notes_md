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
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const lineEnumerationContainerRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<HTMLDivElement>(null)
  const singleCharRef = useRef<HTMLDivElement>(null)

  const [ documentContent, setDocumentContent ] = useState(content)
  const [ editorViewLines, setEditorViewLines ] = useState('')
  const [ currentLineNumber, setCurrentLineNumber ] = useState(0)
  const [ currentLinesCount, setCurrentLinesCount ] = useState(0)
  const [ lineEnumerationEl, setLineEnumerationEl ] = useState<null | ReactElement[]>(null)
  const [ mdHtml, setMdHtml ] = useState('')
  const [ showMdViewer, setShowMdViewer ] = useState(false)
  const [ activeKeys, setActiveKeys ] = useState<TActiveKeys>({})


  useEffect(() => {
    // TODO - Refactor into updateEditorViewLines()

    // @ts-ignore
    if (window.Prism) {
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

  /**
   * Event listeners
   */
  useEffect(() => {
    editorViewRef?.current?.addEventListener('mouseup', handleEditorMouseUpEvent)

    window.addEventListener('resize', updateLineEnumerationEl)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      editorViewRef?.current?.removeEventListener('mouseup', handleEditorMouseUpEvent)

      window.removeEventListener('resize', updateLineEnumerationEl)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [showMdViewer, activeKeys])


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

  const handleEditorMouseUpEvent = (event: MouseEvent) => {
    if (
      !editorViewRef.current
      || !textAreaRef.current
    ) {
      return
    }

    // Focus textarea element
    textAreaRef.current.focus()

    const { scrollTop } = editorViewRef.current
    const { current: editorEl } = textAreaRef

    const lines = getLines(documentContent)
    const linesCount = lines.length

    const { editorPaddingLeft, editorPaddingTop, editorLineHeight } = getEditorCssVars()
    const editorCharWidth = getEditorCharWidth()

    const { x, y } = event

    /**
     * # Setting caret selection position in textarea
     *
     * The full content string index position of caret
     * @param caretContentIndex
     */
    const setEditorCaretPos = (
      caretContentIndex: number,
    ): void => {
      editorEl.selectionStart = caretContentIndex
      editorEl.selectionEnd = caretContentIndex
    }

    // Calculating current line by checking mouse Y position
    let mouseLineNumber = Math.ceil((y - editorPaddingTop + scrollTop - 2) / editorLineHeight)

    /**
     * Check if click was recorded outsideof lines
     */
    if (mouseLineNumber < 1) {
      setEditorCaretPos(0)
      setVisualCarretPos(0, 0)
      setCurrentLineNumber(linesCount)
      return
      /* *** */
    } else if (mouseLineNumber > linesCount) {
      const currentLineLength = lines[linesCount - 1].length
      setEditorCaretPos(documentContent.length)
      setVisualCarretPos(currentLineLength, linesCount)
      setCurrentLineNumber(linesCount)
      return
      /* *** */
    }

    const lineIndexZero = mouseLineNumber - 1
    const currentLineLength = lines[lineIndexZero].length

    // The index on X axis - most left character on each line is index 0
    let caretXIndex = Math.abs(Math.round((x - editorPaddingLeft) / editorCharWidth))

    // Setting caretXIndex to last index of line
    if (caretXIndex > currentLineLength) {
      caretXIndex = currentLineLength
    }

    // Getting all content before the selected line
    const linesClone = [...lines]
    linesClone.length = lineIndexZero
    const stringPreSelection = linesClone.join('')

    // Caret index position in text content
    const caretContentIndex = stringPreSelection.length + caretXIndex + lineIndexZero

    // Setting caret position inside of textarea el
    setEditorCaretPos(caretContentIndex)

    // Setting visial caret position with css
    setVisualCarretPos(caretXIndex, lineIndexZero)

    // Update currentLineNumber state
    setCurrentLineNumber(mouseLineNumber)
  }

  /**
   * Setting visual position(top/left) of textarea caret on top of editorView
   */
  const setVisualCarretPos = (
    caretXIndex: number,
    caretYIndex: number,
  ): void => {
    const { current: editorEl } = textAreaRef
    return
    // if (!editorEl) {
    //   return
    // }

    // const { editorPaddingLeft, editorPaddingTop, editorLineHeight } = getEditorCssVars()
    // const editorCharWidth = getEditorCharWidth()

    // const caretTopPos = (caretYIndex * editorLineHeight) + editorPaddingTop
    // const caretLeftPos = (caretXIndex * editorCharWidth) + editorPaddingLeft
    // editorEl.style.top = `${caretTopPos}px`
    // editorEl.style.left = `${caretLeftPos}px`
  }

  /**
   * Get character width of editor text
   */
  const getEditorCharWidth = (): number => {
    if (singleCharRef.current) {
      return singleCharRef.current.getBoundingClientRect().width
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
  const handleEditorChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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
    for (const line of lines) {
      const lineHtml = `<div><code class="language-markdown">${line}</code></div>`
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
  const getLineEnumEl = (index: number, isCurrentLine = false): ReactElement => {
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
        { index + 1 }
      </span>
    )
  }

  /**
   * Setting state var lineEnumerationEl with line enumeration els.
   */
  const updateLineEnumerationEl = () => {
    setTimeout(() => {
      const linesCount = getLines(documentContent).length

      // TODO - Scroll to left if new line was made

      // Build array lines
      let lines: ReactElement[] = []
      for (let i = 0; i < linesCount; i++) {
        const isCurrentLine = i + 1 === currentLineNumber
        lines.push(getLineEnumEl(i, isCurrentLine))
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
      '--editor-padding-left'
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
      ref={editorContainerRef}
      className={styles.container}
    >
      <div
        ref={editorViewRef}
        className={styles.editorView}
      >
        {/* Lines */}
        <div className={styles.editorViewLines} dangerouslySetInnerHTML={{ __html: editorViewLines }}></div>

        {/* This is used to get the width of each character in the editorView */}
        <div ref={singleCharRef} className={styles.singleCharRef}>x</div>

        {/* Line enumerations */}
        <div ref={lineEnumerationContainerRef} className={styles.lineEnumerationContainer}>{ lineEnumerationEl }</div>
        <div className={styles.lineEnumerationCover}></div>

        {/* Current line highlight */}
        <div
          className={styles.currentLineHighlight}
          style={{
            display: `${currentLineNumber > 0 ? 'block' : 'none' }`,
            top: `${getCurrentLineHighlightTopPostion()}px`,
          }}
        ></div>

        {/* Editor */}
        <textarea
        spellCheck={false}
        disabled={showMdViewer}
        ref={textAreaRef}
        value={documentContent}
        onChange={handleEditorChange}
        className={styles.editor}
        style={{
          // top: `${getCurrentLineHighlightTopPostion()}px`
        }}
        ></textarea>
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