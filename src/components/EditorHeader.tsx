import styles from '../css/editorHeader.module.css'

type EditorHeaderProps = {
  onMenuClick: () => void
}

const Header = ({
  onMenuClick,
}: EditorHeaderProps) => {


  return (
    <header className={styles.editorHeader}>
      <button className={styles.menuButton} onClick={onMenuClick}>
        <svg width="26" height="6" viewBox="0 0 26 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="6" height="6" rx="3" fill="#E4E4E4"/>
          <rect x="10" width="6" height="6" rx="3" fill="#E4E4E4"/>
          <rect x="20" width="6" height="6" rx="3" fill="#E4E4E4"/>
        </svg>
      </button>
    </header>
  )
}


export default Header