import styles from '../css/DocumentListItem.module.css'

type DocumentListItemProps = {
  title: string
  onClick: () => void
}

const DocumentListItem = ({
  title,
  onClick,
}: DocumentListItemProps) => {

  return (
    <div
      onClick={onClick}
      className={styles.documentListItem}
    >
      <div className={styles.documentListItem__icon}></div>
      <div className={styles.documentListItem__title}>{title}</div>
    </div>
  )
}


export default DocumentListItem