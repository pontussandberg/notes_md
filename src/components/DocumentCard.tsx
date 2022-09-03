import styles from '../css/DocumentCard.module.css'

type DocumentCardProps = {
  rowsCount: number
  title?: string
  onClick?: () => void
}


const DocumentCard = ({
  rowsCount = 5,
  title = '',
  onClick = () => {},
}: DocumentCardProps) => {

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


  // CSS could be refactored here...
  return (
    <div onClick={onClick} className={styles.documentCardContainer}>
      <div className={styles.documentCardContainer__documentCard}>
        <div className={styles.documentCard__header}></div>

        <div className={styles.documentCard__main}>
          <div className={styles.main__margin}>
            {renderRows()}
          </div>

          <div className={styles.main__rows}>
            {renderRows()}
          </div>
        </div>
      </div>

      <div className={styles.documentCardContainer__title}>{title}</div>
    </div>

  )
}


export default DocumentCard