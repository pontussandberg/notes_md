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
    const rowsCountCapped = rowsCount <= 10 ? rowsCount : 10

    for (let i = 0; i < rowsCountCapped; i++) {
      elements.push(<span key={i}></span>)
    }

    return elements
  }


  // CSS could be refactored here...
  return (
    <div onClick={onClick} className={styles.documentCardContainer}>
      <div className={styles.documentCardContainer__documentCard}>
        <div className={styles.main__rows}>
          {renderRows()}
        </div>
      </div>

      <div className={styles.documentCardContainer__title}>{title}</div>
    </div>

  )
}


export default DocumentCard