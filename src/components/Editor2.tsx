import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  ReactElement,
} from 'react'
import uniqid from 'uniqid'
import showdown from 'showdown'

import styles from '../css/editor2.module.css'
import GlassButton from './Buttons/GlassButton'
import { TActiveKeys } from '../types'
import { getCssVariable, getCssVariables } from '../helpers'

const Editor2 = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const lineEnumerationContainerRef = useRef<HTMLDivElement>(null)
  const editorViewerRef = useRef<HTMLDivElement>(null)

  const [ editorContent, setEditorContent ] = useState('')
  const [ editorViewerHTML, setEditorViewerHTML ] = useState('')
  const [ currentLineIndex, setCurrentLineIndex ] = useState(0)
  const [ currentLinesCount, setCurrentLinesCount ] = useState(0)
  const [ lineEnumerationEl, setLineEnumerationEl ] = useState<null | ReactElement[]>(null)
  const [ mdHtml, setMdHtml ] = useState('')
  const [ showMdViewer, setShowMdViewer ] = useState(false)
  const [ activeKeys, setActiveKeys ] = useState<TActiveKeys>({})


  useEffect(() => {
    // @ts-ignore
    if (window.Prism) {
      // @ts-ignore
      window.Prism.highlightAll()
    }

    if (editorContent) {
      localStorage.setItem('note', editorContent)
    }
  }, [editorContent])

  /**
   * Mounted
   */
  useEffect(() => {
    updateLineEnumerationEl()
    setEditorContent(localStorage.getItem('note') || '')
  }, [])

  /**
   * Event listeners
   */
  useEffect(() => {
    editorViewerRef?.current?.addEventListener('click', () => {
      if (editorRef.current) {
        editorRef.current.focus()
      }
    })

    editorViewerRef?.current?.addEventListener('mousedown', (event) => {
      if (
        !editorViewerRef.current
        || !editorRef.current
      ) {
        return
      }

      const { current: editorViewerEl } = editorViewerRef
      const { current: editorEl } = editorRef
      const { x, y } = event


      /* Setting current line */
      const { editorPaddingTop, editorLineHeight } = getEditorCssVars()
      const lines = getLines(editorContent)
      const linesCount = lines.length
      const { scrollTop } = editorViewerEl

      let line = Math.ceil((y - editorPaddingTop + scrollTop - 3) / editorLineHeight)

      if (line <= 0) {
        line = 1
      } else if (line >= linesCount) {
        line = linesCount
      }


      /* Selcting in textarea */
      let charIndex = Math.abs(Math.round((x - 50) / 10.5))
      const lineIndexZero = line - 1

      const currentLineLength = lines[lineIndexZero].length

      if (charIndex > currentLineLength) {
        charIndex = currentLineLength
      }

      charIndex += lineIndexZero


      const linesClone = [...lines]
      linesClone.length = lineIndexZero
      const stringPreSelection = linesClone.join('')


      const caretPositon = stringPreSelection.length + charIndex
      editorEl.selectionStart = caretPositon
      editorEl.selectionEnd = caretPositon


      setCurrentLineIndex(line)
    })

    window.addEventListener('resize', updateLineEnumerationEl)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('resize', updateLineEnumerationEl)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [showMdViewer, activeKeys])

  useEffect(() => {
    updateLineEnumerationEl()
  }, [currentLineIndex, editorContent, showMdViewer])

  useEffect(() => {
    updateCurrentLine()
  }, [editorContent, showMdViewer])

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
      updateCurrentLine()
    } else if (keyLower === 'escape') {
      toggleMdViewer()
    }
  }

  /**
   * Handler for editor content change
   */
  const handleEditorChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target
    updateMdHtml(value)
    setEditorContent(value)

    // const html = getLines(value).map((line, i) => `<div id="line_${ i + 1 }">${line}&nbsp;</div>`)
    const linesHTML: string[] = []
    const lines = getLines(value)
    for (const line of lines) {
      const lineHtml = `<div><code class="language-markdown">${line}</code></div>`
      linesHTML.push(lineHtml)
    }

    const html = linesHTML.join('')
    setEditorViewerHTML(html)
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
    const { current: el } = editorRef

    if (el) {
      const lines = el.value.split('\n')
      const currentLineContent = lines[currentLineIndex - 1]

      lines.splice(currentLineIndex, 0, currentLineContent).join()
      const content = lines.join('\n')

      setEditorContent(content)
    }
  }

  /**
   * Update current line in state
   */
  const updateCurrentLine = () => {
    requestAnimationFrame(() => {
      const { current: el } = editorRef

      if (el) {
        const currLine = el.value.substr(0, el.selectionStart).split("\n").length
        setCurrentLineIndex(currLine)
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
   * This is a workaround to be able to use setTimeout in this render function.
   */
  const updateLineEnumerationEl = () => {
    setTimeout(() => {
      const linesCount = getLines(editorContent).length

      // TODO - Scroll to left if new line was made

      // Build array lines
      let lines: ReactElement[] = []
      for (let i = 0; i < linesCount; i++) {
        const isCurrentLine = i + 1 === currentLineIndex
        lines.push(getLineEnumEl(i, isCurrentLine))
      }

      setCurrentLinesCount(linesCount)
      setLineEnumerationEl(lines)
    }, 10)
  }

  const getEditorCssVars = () => {
    const cssVars = [
      '--editor-line-height',
      '--editor-padding-top',
      '--editor-padding-bottom',
    ]

    return getCssVariables(cssVars)
  }

  /**
   * Top position for current line highlight(cover)
   */
  const getCurrentLineCoverTopPostion = () => {
    const { editorLineHeight, editorPaddingTop } = getEditorCssVars()
    return (currentLineIndex - 1) * editorLineHeight + editorPaddingTop
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
      className={styles.editorContainer}
    >
      <div
        ref={editorViewerRef}
        className={styles.editorViewer}
      >
        {/* Syntax */}
        <div className={styles.editorViewerSyntax} dangerouslySetInnerHTML={{ __html: editorViewerHTML }}></div>

        {/* Line enumerations */}
        <div ref={lineEnumerationContainerRef} className={styles.lineEnumerationContainer}>{ lineEnumerationEl }</div>
        <div className={styles.lineEnumerationCover}></div>

        {/* Current line cover */}
        <div
          className={styles.currentLineCover}
          style={{
            display: `${currentLineIndex > 0 ? 'block' : 'none' }`,
            top: `${getCurrentLineCoverTopPostion()}px`,
          }}
        ></div>

        {/* Editor2 */}
        <textarea
        spellCheck={false}
        disabled={showMdViewer}
        ref={editorRef}
        value={editorContent}
        onChange={handleEditorChange}
        className={styles.editor}
        style={{
          // top: `${getCurrentLineCoverTopPostion()}px`
        }}
        ></textarea>
      </div>


      {/* Editor2 / Markdown viewer toggle */}
      <GlassButton
        onClick={ toggleMdViewer }
        title={ showMdViewer ? 'Show editor (esc)' : 'Show markdown (esc)' }
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

export default Editor2