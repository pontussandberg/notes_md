import styles from '../css/editorPlaceholder.module.css'

type EditorPlaceholderProps = {
  rowsCount: number
  title?: string
  onClick?: () => void
}


const EditorPlaceholder = ({
  rowsCount = 5,
  title = '',
  onClick = () => {},
}: EditorPlaceholderProps) => {

  /**
   * Render span elements - count equal to $rowsCount
   */
  const renderRows = () => {
    const elements = []
    const rowsCountCapped = rowsCount <= 16 ? rowsCount : 16

    for (let i = 0; i < rowsCountCapped; i++) {
      elements.push(<span key={i}></span>)
    }

    return elements
  }



  return (
    <div>
      <div className={styles.editorPlaceholder} onClick={onClick}>
        <div className={styles.editorPlaceholderHeader}></div>
        <div style={{display: 'flex', alignItems: 'stretch', flexGrow: 1}}>
          <div className={styles.editorPlaceholderMargin}>
            {renderRows()}
          </div>

          <div className={styles.editorPlaceholderRows}>
            {renderRows()}
          </div>
        </div>
      </div>

      <div className={styles.title}>{title}</div>
    </div>

  )
}


export default EditorPlaceholder