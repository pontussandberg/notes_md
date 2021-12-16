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
  const rowEnumerationContainerRef = useRef<HTMLDivElement>(null)

  const [ editorContent, setEditorContent ] = useState('')

  /**
   * Mounted
   */
  useEffect(() => {
    if (editorRef?.current) {
      console.log(typeof editorRef.current)
      editorRef.current.addEventListener('scroll', positionRowEnumerationContainer)
    }

    // const item = localStorage.getItem('note')
    // setEditorContent(item)
  }, [])

  /**
   * Handler for editor content change
   */
  const handleEditorChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target
    localStorage.setItem('note', value)
    setEditorContent(value)
  }

  /**
   * Positioning of row enumeration relative to scroll position of editor el
   */
  const positionRowEnumerationContainer = (event: Event) => {
    const { target } = event
    const editorEl = target as HTMLTextAreaElement

    console.log(editorEl.scrollTop)

    console.log(rowEnumerationContainerRef.current)

    if (rowEnumerationContainerRef?.current) {
      rowEnumerationContainerRef.current.style.top = `-${editorEl.scrollTop}px`
    }
  }

  /**
   * Get the enum JSX element for an editor row
   */
  const getRowEnumEl = (index: number): ReactElement => {
    const topPos = (index * editorLineHeight) + editorPaddingTop - 3

    return (
      <span
        className={styles.rowEnumeration}
        key={uniqid()}
        style={{ top: `${topPos}px` }}
      >{ index + 1 }</span>
    )
  }

  /**
   * Render enumeration for editor rows
   */
  const renderRowNumbers = () => {
    const { current: editorEl } = editorRef

    if (!editorEl) {
      return null
    }

    const { scrollHeight } = editorEl
    const totalEditorHeight = scrollHeight - editorPaddingBottom - editorPaddingTop
    const rowsCount = Math.floor(totalEditorHeight / editorLineHeight)

    let rows: ReactElement[] = []
    for (let i = 0; i < rowsCount; i++) {
      rows.push(getRowEnumEl(i))
    }

    return rows
  }

  return (
    <div className={styles.editorContainer}>
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
      <div ref={rowEnumerationContainerRef} className={styles.rowEnumerationContainer}>
        { renderRowNumbers() }
      </div>
    </div>
  )
}

export default Editor