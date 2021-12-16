import {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  ReactElement,
} from 'react'
import styles from '../css/editor.module.css'
import options from '../options.json'
import uniqid from 'uniqid'

const { editorLineHeight, editorPaddingTop, editorPaddingBottom } = options

const Editor = () => {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const editorFrameRef = useRef<HTMLTextAreaElement>(null)
  const lineEnumerationContainerRef = useRef<HTMLDivElement>(null)

  const [ editorContent, setEditorContent ] = useState('')
  const [ currentLine, setCurrentLine ] = useState(0)
  const [ currentLinesCount, setCurrentLinesCount ] = useState(0)
  const [ lineEnumerationEl, setLineEnumerationEl ] = useState<null | ReactElement[]>(null)
  const [ lineNumCheckIntervalRunning, setLineNumCheckIntervalRunning ] = useState(false)
  const [ lineNumInterval, setLineNumInterval ] = useState<null | ReturnType<typeof setInterval>>(null)


  /**
   * Mounted
   */
  useEffect(() => {
    updateLineEnumerationEl()

    editorRef?.current?.addEventListener('scroll', positionLineEnumerationContainer)
    window.addEventListener('mousedown', checkCurrentLine)
    window.addEventListener('resize', updateLineEnumerationEl)
    window.addEventListener('keydown', ({ key }) => isVerticalMoveKey(key) && setLineNumCheckIntervalRunning(true))
    window.addEventListener('keyup', ({ key }) => isVerticalMoveKey(key) && setLineNumCheckIntervalRunning(false))

    return () => {
      editorRef?.current?.removeEventListener('scroll', positionLineEnumerationContainer)
    }
  }, [])

  /**
   * lineNumCheckIntervalRunning updates for toggle interval
   */
  useEffect(() => {
    if (lineNumCheckIntervalRunning) {
      const interval = setInterval(checkCurrentLine, 5)
      setLineNumInterval(interval)
    } else {
      // @ts-ignore
      clearInterval(lineNumInterval)
    }
  }, [lineNumCheckIntervalRunning])

  /**
   * currentLine updates
   */
  useEffect(() => {
    updateLineEnumerationEl()
  }, [currentLine])

  /**
   * Check if keyevent is down or up key
   */
  const isVerticalMoveKey = (key: string) => {
    const keyLower = key.toLowerCase()
    if (keyLower === 'arrowup' || keyLower === 'arrowdown') {
      return true
    }
  }

  /**
   * Update current line in state
   */
  const checkCurrentLine = () => {
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
    localStorage.setItem('note', value)
    setEditorContent(value)
    updateLineEnumerationEl()
    checkCurrentLine()
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
   *
   */
  const getCurrentLineCoverTopPostion = () => {
    return (currentLine - 1) * options.editorLineHeight + options.editorPaddingTop
  }

  return (
    <div className={styles.editorContainer}>
      {/* Editor */}
      <textarea
        ref={editorRef}
        value={editorContent}
        onChange={handleEditorChange}
        className={styles.editor}
        style={{
          lineHeight: `${options.editorLineHeight}px !important`,
          paddingTop: `${options.editorPaddingTop}px !important`,
          paddingBottom: `${options.editorPaddingBottom}px !important`,
        }}
      ></textarea>

      {/* Editor duplicate with height 0 to calculate stuff */}
      <textarea
        ref={editorFrameRef}
        readOnly
        style={{
          lineHeight: `${options.editorLineHeight}px !important`,
          paddingTop: `${options.editorPaddingTop}px !important`,
          paddingBottom: `${options.editorPaddingBottom}px !important`,
        }}
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
          height: `${options.editorLineHeight + 1}px`,
        }}
      ></div>
    </div>
  )
}

export default Editor