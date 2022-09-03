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
import { DocumentFile, TActiveKeys } from '../types'
import { getCssVariables } from '../helpers'
import CustomScrollbar from './CustomScrollbar'

type EditorProps = {
  content: string

  /* Default height and width are "100%" */
  height?: number
  width?: number
  heightUnits?: string
  widthUnits?: string
  onDocumentUpdate: (data: DocumentFile) => void
}

const Editor = ({
  content,
  height = 100,
  width = 100,
  heightUnits = '%',
  widthUnits = '%',
  onDocumentUpdate,
}: EditorProps) => {
  const componentWrapperRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<HTMLDivElement>(null)
  const currentLineHighlightRef = useRef<HTMLDivElement>(null)
  const editorLinesRef = useRef<HTMLDivElement>(null)

  const [documentContent, setDocumentContent] = useState(content)
  const [editorViewLines, setEditorViewLines] = useState('')
  const [currentLineNumber, setCurrentLineNumber] = useState(0)
  const [hideCurrentLineHighlight, setHideCurrentLineHighlight] = useState(false)
  const [currentLinesCount, setCurrentLinesCount] = useState(0)
  const [lineEnumerationEl, setLineEnumerationEl] = useState<null | ReactElement[]>(null)
  const [_mdHtml, setMdHtml] = useState('')
  const [showMdViewer, _setShowMdViewer] = useState(false)
  const [activeKeys, setActiveKeys] = useState<TActiveKeys>({})

  /**
   * Set editor dimensions on mount.
   */
  useEffect(() => {
    const { current: componentWrapperEl } = componentWrapperRef
    if (componentWrapperEl) {
      componentWrapperEl.style.height = `${height}${heightUnits}`
      componentWrapperEl.style.width = `${width}${widthUnits}`
    }
  }, [])

  /**
   * This effect will make sure that editor padding is always shown
   * when no more chars can be shown to left of carret.
   */
  useEffect(() => {
    const { editorPaddingLeft } = getEditorCssVars()
    if (textareaRef.current && textareaRef.current.scrollLeft <= editorPaddingLeft) {
      textareaRef.current.scrollLeft = 0
    }
  })

  useEffect(() => {
    // TODO - Refactor into updateEditorViewLines()

    // @ts-ignore
    if (window.Prism) {
      setTimeout(() => {
        // @ts-ignore
        window.Prism.highlightAll()
      })
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
    window.addEventListener('resize', updateLineEnumerationEl)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    document.addEventListener('selectionchange', handleDocumentSelectionChange)
    // ***
    return () => {
      window.removeEventListener('resize', updateLineEnumerationEl)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('selectionchange', handleDocumentSelectionChange)
      // ***
    }
  }, [showMdViewer, activeKeys])


  /*****************
   * Misc effects  *
   *****************/

  useEffect(() => {
    updateLineEnumerationEl()
  }, [currentLineNumber, documentContent, showMdViewer])

  useEffect(() => {
    updateCurrentLineNumber()
    emitContentUpdate()
  }, [documentContent])

  const getDocTitle = () => {
    return getLines(documentContent)[0].slice(0, 32)
  }

  const emitContentUpdate = () => {
    onDocumentUpdate({
      rowsCount: getLines(documentContent).length,
      title: getDocTitle(),
      content: documentContent,
      fileExtension: '.md'
    })
  }

  /*****************
   *     </>       *
   *****************/
  const handleEditorClickEvent = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    if (
      !editorContainerRef.current
      || !componentWrapperRef.current
    ) {
      return
    }

    const { scrollTop } = editorContainerRef.current
    const { y } = event.nativeEvent
    const lines = getLines(documentContent)
    const linesCount = lines.length

    const {
      editorPaddingTop,
      editorLineHeight,
    } = getEditorCssVars()

    const editorTopOffset = componentWrapperRef.current.getBoundingClientRect().top + document.documentElement.scrollTop

    // Calculating current line by checking mouse Y position
    let mouseLineNumber = Math.ceil((y - editorPaddingTop + scrollTop - editorTopOffset) / editorLineHeight)

    /**
     * Check line number
     */
    if (mouseLineNumber < 1) {
      // setVisualCarretPos(0, 0)
      setCurrentLineNumber(1)
      return
      /* *** */
    } else if (mouseLineNumber > linesCount) {
      setCurrentLineNumber(linesCount)
      return
      /* *** */
    } else {
      setCurrentLineNumber(mouseLineNumber)
    }
  }

  const handleTextareaScroll = () => {
    if (
      !editorViewRef.current
      || !textareaRef.current
      || !editorWrapperRef.current
    ) {
      return
    }

    if (currentLineHighlightRef.current) {
      // Set current line highlight position
      currentLineHighlightRef.current.style.left = `${textareaRef.current.scrollLeft}px`
    }

    // Set scroll position for editorView element
    editorViewRef.current.scrollLeft = textareaRef.current.scrollLeft
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
   * # Keybinds
   * Handler for key down event
   */
  const handleKeyDown = (event: globalThis.KeyboardEvent) => {
    const { key } = event
    const keyLower = key.toLowerCase()
    toggleActiveKey(keyLower, true)

    const { alt, shift, control, meta } = activeKeys

    // Duplicate current row keybind
    if (
      (control && shift && keyLower === 'arrowup')
      || (control && shift && keyLower === 'arrowdown')
    ) {
      event.preventDefault()
      duplicateLine('up')
    }
    else if (
      (alt && shift && keyLower === 'arrowdown')
      || (alt && shift && keyLower === 'arrowup')
    ) {
      event.preventDefault()
      duplicateLine('down')
    }

    // TODO - fix so that it doesn't erase everything when there's no whitespace in front of cursor.
    if (meta && keyLower === 'backspace') {
      // const lines = getLines(documentContent)
      // const currentLineIndex = currentLineNumber - 1

      // const currentLine = lines[currentLineIndex]

      // if (!currentLine.endsWith(' ')) {
      //   console.log('hello')
      //   lines[currentLineIndex] = currentLine + ' '

      //   setDocumentContent(lines.join(''))
      // }
    }

    // Cancel default save
    if (meta && keyLower === 's') {
      event.preventDefault()
    }

    // Move row
    if (isArrowKey(keyLower)) {
      updateCurrentLineNumber()
    }
  }

  /**
   * Handler for editor margin line enumeration click event
   */
  const handleLineEnumerationClick = (index: number) => {
    const { current: textareaEl } = textareaRef

    if (!textareaEl) {
      return
    }

    setCurrentLineNumber(index + 1)

    const lines = getLines(documentContent)
    const lineStart = getTextareaContentIndex(index, 0, lines)
    const lineEnd = getTextareaContentIndex(index, lines[index].length, lines)


    setTimeout(() => {
      textareaEl.focus()
      textareaEl.setSelectionRange(lineStart, lineEnd)
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


  const handleDocumentSelectionChange = () => {
    const selection = window.getSelection()

    if (selection && selection.toString().length) {
      setHideCurrentLineHighlight(true)
    } else {
      setHideCurrentLineHighlight(false)
    }
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
      const sanitizedLine = line.replace(/\ /, '&nbsp;')
      const lineHtml = `<div><code class="language-markdown">${sanitizedLine}</code></div>`

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
  const duplicateLine = (direction: 'up' | 'down') => {
    const moveDown = direction === 'down'
    const { current: el } = textareaRef

    if (el) {
      const lines = el.value.split('\n')
      const currentLineContent = lines[currentLineNumber - 1]

      lines.splice(currentLineNumber, 0, currentLineContent).join('')
      const content = lines.join('\n')

      setDocumentContent(content)
      updateEditorViewLines(content)

      const newLineNumber = moveDown
        ? currentLineNumber + 1
        : currentLineNumber - 1

      const newLineIndex = newLineNumber - 1

      const selectionStart = getTextareaContentIndex(newLineIndex, 0, lines)
      const selectionEnd = getTextareaContentIndex(newLineIndex, currentLineContent.length, lines)

      el.setSelectionRange(selectionStart, selectionEnd)
    }
  }

  /**
   * Update current line in state
   */
  const updateCurrentLineNumber = () => {
    requestAnimationFrame(() => {
      const { current: el } = textareaRef

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
    const topPos = (index * editorLineHeight) + editorPaddingTop - 0.4

    return (
      <span
        onMouseDown={() => handleLineEnumerationClick(index)}
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
   * TODO - Refactor into render function
   *
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
   * Getting the index of a character in a list of strings,
   * each list element characters are counted as seperate elements the returned index value.
   */
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

  /**
   * Top position for current line highlight(cover)
   */
  const getCurrentLineHighlightTopPostion = () => {
    const { editorLineHeight, editorPaddingTop } = getEditorCssVars()
    const randomCorrectionValue = 0
    return (currentLineNumber - 1) * editorLineHeight + editorPaddingTop - randomCorrectionValue
  }

  /**
   * Toggle between editor view & markdown view
   */
  // const toggleMdViewer = () => {
  //  setShowMdViewer(!showMdViewer)

  // }

  /**
   *******************
   * Render helpers  *
   * *****************
   */
  const renderCurrentLineHighlight = () => {
    const style = {
      display: `${currentLineNumber > 0 ? 'block' : 'none'}`,
      top: `${getCurrentLineHighlightTopPostion()}px`,
    }

    if (hideCurrentLineHighlight) {
      return null
    }

    return (
      <div
        ref={currentLineHighlightRef}
        className={styles.currentLineHighlight}
        style={style}
      ></div>
    )
  }


  /**
   **********
   * Render *
   * ********
   */
  return (
    <div className={styles.componentWrapper} ref={componentWrapperRef}>

      {/* Scrollbar for editor scroll Y axis */}
      <CustomScrollbar
        containerElementRef={componentWrapperRef}
        scrollElementRef={editorContainerRef}
        orientation={'verticalRight'}
      />

      <div
        ref={editorContainerRef}
        className={styles.container}
      >

        {/* Left margin ( line enumeration ) */}
        <div className={styles.editorMargin}>{lineEnumerationEl}</div>

        {/* Editor */}
        <div ref={editorWrapperRef} className={styles.editorWrapper}>

          {/* Editor view */}
          <div
            ref={editorViewRef}
            className={styles.editorView}
          >
            {/* Lines */}
            <div ref={editorLinesRef} className={styles.editorViewLines} dangerouslySetInnerHTML={{ __html: editorViewLines }}></div>

            {/* Current line highlight */}
            {renderCurrentLineHighlight()}
          </div>

          {/* Text input */}
          <textarea
            spellCheck={false}
            disabled={showMdViewer}
            ref={textareaRef}
            value={documentContent}
            onChange={handleInputChange}
            className={styles.textInput}
            onScroll={handleTextareaScroll}
            onClick={handleEditorClickEvent}
            onMouseDown={handleEditorClickEvent}
            onMouseUp={handleEditorClickEvent}
          ></textarea>

          {/* Scrollbar for editor scroll X axis */}
          <CustomScrollbar
            containerElementRef={editorWrapperRef}
            scrollElementRef={textareaRef}
            orientation={'horizontalBottom'}
            positionFixedLeft={getEditorCssVars().editorMarginWidth}
            positionFixed={true}
            disableFadeOut={true}
            scrollbarThickness={10}
            scrollbarThicknessActive={14}
          />
        </div>


        {/* Editor / Markdown viewer toggle */}
        {/* <GlassButton
            onClick={toggleMdViewer}
            title={showMdViewer ? 'Show editor (esc)' : 'Show markdown (esc)'}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 30,
            }}
          /> */}

        {/* Markdown viewer */}
        {/* <div
            onClick={toggleMdViewer}
            className={styles.mdViewer}
            dangerouslySetInnerHTML={{ __html: mdHtml }}
            style={{ display: showMdViewer ? 'block' : 'none' }}
          ></div> */}


      </div>
    </div>
  )
}

export default Editor