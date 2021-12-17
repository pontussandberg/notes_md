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
import options from '../options.json'
import GlassButton from './Buttons/GlassButton'
const { editorLineHeight, editorPaddingTop, editorPaddingBottom } = options

const Editor = () => {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const editorFrameRef = useRef<HTMLTextAreaElement>(null)
  const lineEnumerationContainerRef = useRef<HTMLDivElement>(null)

  const [ editorContent, setEditorContent ] = useState('')
  const [ currentLine, setCurrentLine ] = useState(0)
  const [ currentLinesCount, setCurrentLinesCount ] = useState(0)
  const [ lineEnumerationEl, setLineEnumerationEl ] = useState<null | ReactElement[]>(null)
  const [ mdHtml, setMdHtml ] = useState('')
  const [ showMdViewer, setShowMdViewer ] = useState(false)


  /**
   * Mounted
   */
  useEffect(() => {
    updateLineEnumerationEl()
    setEditorContent(localStorage.getItem('note') || '')
  }, [])

  /**
   * Event listeners
   */
  useEffect(() => {
    editorRef?.current?.addEventListener('scroll', positionLineEnumerationContainer)
    window.addEventListener('mousedown', updateCurrentLine)
    window.addEventListener('resize', updateLineEnumerationEl)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      editorRef?.current?.removeEventListener('scroll', positionLineEnumerationContainer)
      window.removeEventListener('mousedown', updateCurrentLine)
      window.removeEventListener('resize', updateLineEnumerationEl)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMdViewer])

  /**
   * currentLine updates
   */
  useEffect(() => {
    updateLineEnumerationEl()
  }, [currentLine])

  /**
   * editorContent updates
   */
  useEffect(() => {
    reRenderEditor()

    localStorage.setItem('note', editorContent)
  }, [editorContent])

  /**
   * showMdViewer updates
   */
  useEffect(() => {
    reRenderEditor()
  }, [showMdViewer])

  const reRenderEditor = () => {
    updateMdHtml()
    updateLineEnumerationEl()
    updateCurrentLine()
  }

  /**
   * Handler for key down event
   */
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    const keyLower = key.toLowerCase()

    if (isArrowKey(keyLower)) {
      updateCurrentLine()
    } else if (keyLower === 'escape') {
      toggleMdViewer()
    }
  }

  /**
   * Check if keyevent is a move key
   */
  const isArrowKey = (keyLower: string) => {
    if (
      keyLower === 'arrowup'
      || keyLower === 'arrowdown'
      || keyLower === 'arrowleft'
      || keyLower === 'arrowright'
    ) {
      return true
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
        setCurrentLine(currLine)
      }
    })
  }

  /**
   * Handler for editor content change
   */
  const handleEditorChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target
    setEditorContent(value)
  }

  /**
   * Setting state with editor content compiled to markdown html
   */
  const updateMdHtml = () => {
    const converter = new showdown.Converter()
    const html = converter.makeHtml(editorContent)
    setMdHtml(html)
  }

  /**
   * Positioning of line enumeration relative to scroll position of editor el
   */
  const positionLineEnumerationContainer = (event: Event) => {
    const { target } = event
    const editorEl = target as HTMLTextAreaElement

    if (lineEnumerationContainerRef?.current) {
      lineEnumerationContainerRef.current.style.top = `-${editorEl.scrollTop}px`
    }
  }

  /**
   * Get the enum JSX element for an editor line
   */
  const getLineEnumEl = (index: number, isCurrentLine = false): ReactElement => {
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
      const { current: editorFrameEl } = editorFrameRef

      if (!editorFrameEl) {
        return null
      }

      const { scrollHeight } = editorFrameEl
      const totalEditorHeight = scrollHeight - editorPaddingBottom - editorPaddingTop
      const linesCount = Math.floor(totalEditorHeight / editorLineHeight)

      // Scroll to left if new line was made
      if (
        linesCount > currentLinesCount
        && currentLinesCount > 0
        && editorRef.current
      ) {
        editorRef.current.scrollLeft = 0
      }

      // Build array lines
      let lines: ReactElement[] = []
      for (let i = 0; i < linesCount; i++) {
        const isCurrentLine = i + 1 === currentLine
        lines.push(getLineEnumEl(i, isCurrentLine))
      }

      setCurrentLinesCount(linesCount)
      setLineEnumerationEl(lines)
    }, 10)
  }

  /**
   * Top position for current line highlight(cover)
   */
  const getCurrentLineCoverTopPostion = () => {
    return (currentLine - 1) * options.editorLineHeight + options.editorPaddingTop - 1.5
  }

  /**
   * Styles for editor that are set in options.json
   */
  const getEditorStyles = () => {
    return {
      lineHeight: `${options.editorLineHeight}px !important`,
      paddingTop: `${options.editorPaddingTop}px !important`,
      paddingBottom: `${options.editorPaddingBottom}px !important`,
    }
  }

  /**
   * Toggle between editor view & markdown view
   */
  const toggleMdViewer = () => {
    setShowMdViewer(!showMdViewer)
  }

  return (
    <div className={styles.editorContainer}>
      {/* Editor */}
      <textarea
      disabled={showMdViewer}
      style={getEditorStyles()}
      ref={editorRef}
      value={editorContent}
      onChange={handleEditorChange}
      className={styles.editor}
      ></textarea>

      {/* Editor duplicate with height 0 to calculate stuff */}
      <textarea
      readOnly
      disabled={showMdViewer}
      style={getEditorStyles()}
      ref={editorFrameRef}
      value={editorContent}
      className={`${styles.editor} ${styles.editorFrame}`}
      ></textarea>

      {/* Line enumerations */}
      <div
        ref={lineEnumerationContainerRef}
        className={styles.lineEnumerationContainer}
      >
        { lineEnumerationEl }
      </div>
      <div className={styles.lineEnumerationCover}></div>

      {/* Current line cover */}
      <div
        className={styles.currentLineCover}
        style={{
          display: `${currentLine > 0 ? 'block' : 'none' }`,
          top: `${getCurrentLineCoverTopPostion()}px`,
          height: `${options.editorLineHeight + 2}px`,
        }}
      ></div>

      {/* Editor / Markdown viewer toggle */}
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

export default Editor