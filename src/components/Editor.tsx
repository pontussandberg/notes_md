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
import e from 'express'

const Editor = ({ content }: { content: string }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const customScrollbarRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<HTMLDivElement>(null)
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
    window.addEventListener('resize', updateLineEnumerationEl)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {

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
  }, [currentLineNumber, documentContent, showMdViewer])

  useEffect(() => {
    updateCurrentLineNumber()
  }, [documentContent])

  /*****************
   *     </>       *
   *****************/
  const handleEditorClickEvent = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!editorContainerRef.current) {
      return
    }
    console.log('click')

    const { scrollTop } = editorContainerRef.current
    const { y } = event.nativeEvent
    const lines = getLines(documentContent)
    const linesCount = lines.length

    const {
      editorPaddingTop,
      editorLineHeight,
    } = getEditorCssVars()

    // Calculating current line by checking mouse Y position
    let mouseLineNumber = Math.ceil((y - editorPaddingTop + scrollTop - 2) / editorLineHeight)

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
      || !currentLineHighlightRef.current
      || !textAreaRef.current
      || !customScrollbarRef.current
    ) {
      return
    }

    // TODO - customScrollbarRef styles

    currentLineHighlightRef.current.style.left = `${textAreaRef.current.scrollLeft}px`
    editorViewRef.current.scrollLeft = textAreaRef.current.scrollLeft
    editorViewRef.current.scrollTop = textAreaRef.current.scrollTop
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

    const { alt, shift, control, meta } = activeKeys

    console.log(activeKeys)

    // Duplicate line
    if (
      (control && shift && keyLower === 'arrowup')
      || (control && shift && keyLower === 'arrowdown')
    ) {
      event.preventDefault()
      duplicateLine(false)
      /* * */
    } else if (
      (alt && shift && keyLower === 'arrowdown')
      || (alt && shift && keyLower === 'arrowup')
    ) {
      event.preventDefault()
      duplicateLine(true)
      /* * */
    }

    // TODO
    // Delete line from selection feature
    if (meta && keyLower === 'backspace') {
      event.preventDefault()
    }

    // Move line
    if (isArrowKey(keyLower)) {
      updateCurrentLineNumber()
    }

    // Toggle md viewer
    if (keyLower === 'escape') {
      toggleMdViewer()
    }
  }

  /**
   * Handler for editor margin line enumeration click event
   */
  const handleLineEnumerationClick = (index: number) => {
    const { current: textareaEl } = textAreaRef

    if (!textareaEl) {
      return
    }

    setCurrentLineNumber(index + 1)

    const lines = getLines(documentContent)
    const lineStart = getTextareaContentIndex(index, 0, lines)
    const lineEnd = getTextareaContentIndex(index, lines[index].length, lines)

    textareaEl.focus()

    setTimeout(() => {
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

  /**
   * Update state with HTML translation of text content
   *
   * TODO - add PrismJS to syntax highlight the markup before it's put in state
   */
  const updateEditorViewLines = (textContent: string) => {
    const linesHTML: string[] = []
    const lines = getLines(textContent)
    for (const line of lines) {
      const lineHtml = `<div><code class="language-markdown">${line.replace(/\ /, '&nbsp;')}${line.length === 0 ? '&nbsp;' : ''}</code></div>`
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
  const duplicateLine = (moveDown: boolean) => {
    const { current: el } = textAreaRef

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
        onClick={() => handleLineEnumerationClick(index)}
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
    return (currentLineNumber - 1) * editorLineHeight + editorPaddingTop
  }

  /**
   * Toggle between editor view & markdown view
   */
  const toggleMdViewer = () => {
    // setShowMdViewer(!showMdViewer)

  }

  return (
    <>
      <div
        ref={editorContainerRef}
        className={styles.container}
      >
        {/* Left margin ( line enumeration ) */}
        <div className={styles.editorMargin}>{lineEnumerationEl}</div>

        {/* Editor */}
        <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>

          {/* Editor view */}
          <div
            ref={editorViewRef}
            className={styles.editorView}
          >
            {/* Lines */}
            <div ref={editorLinesRef} className={styles.editorViewLines} dangerouslySetInnerHTML={{ __html: editorViewLines }}></div>

            {/* Current line highlight */}
            <div
              ref={currentLineHighlightRef}
              className={styles.currentLineHighlight}
              style={{
                display: `${currentLineNumber > 0 ? 'block' : 'none'}`,
                top: `${getCurrentLineHighlightTopPostion()}px`,
              }}
            ></div>
          </div>

          {/* Text input */}
          <textarea
            spellCheck={false}
            disabled={showMdViewer}
            ref={textAreaRef}
            value={documentContent}
            onChange={handleInputChange}
            className={styles.textInput}
            onScroll={handleTextareaScroll}
            onClick={handleEditorClickEvent}
            onMouseDown={handleEditorClickEvent}
            onMouseUp={handleEditorClickEvent}
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
    </>
  )
}

export default Editor