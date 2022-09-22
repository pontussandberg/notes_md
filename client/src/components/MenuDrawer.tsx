import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRawCssVarianble, setCssVariable } from '../helpers'
import { DocumentFile, NavigationData } from '../types'
import styles from '../css/components/MenuDrawer.module.css'
import navigationData from '../data/navigation.json'

type MenuDrawerProps = {
  isOpen: boolean
  currentDocumentIndex: number
  documents: DocumentFile[]
  navigationResource: keyof NavigationData
}

const MenuDrawer = ({
  isOpen,
  currentDocumentIndex,
  documents,
  navigationResource,
}: MenuDrawerProps) => {

  /**
   * Open / closes menu drawer by setting a css variable value -
   * that controls the width
   */
    useEffect(() => {
      const open = '250px'
      const closed = getRawCssVarianble('--editor-margin-width')

      setCssVariable('--menuDrawerWidth', isOpen ? open : closed)
  }, [isOpen])


  const getMenuDrawerItemClasses = (index: number) => {
    const classes = [styles.items__item]

    if (!isOpen) {
      classes.push(styles.closed)
      return classes.join(' ')
    }

    if (currentDocumentIndex === index) {
      classes.push(styles.active)
    } else if (currentDocumentIndex === index - 1) {
      classes.push(styles.afterCurrent)
    } else if (currentDocumentIndex === index + 1) {
      classes.push(styles.beforeCurrent)
    }

    return classes.join(' ')
  }


  return (
    <div className={`${styles.menuDrawer} ${!isOpen && styles.closed}`}>
      <Link to={navigationData.menu}>
        <button
          className={styles.menuDrawer__menuButton}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4" rx="2" fill="#D9D9D9"/><rect y="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect y="14" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="7" y="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="7" y="14" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="14" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="14" y="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="14" y="14" width="4" height="4" rx="2" fill="#D9D9D9"/></svg>
        </button>
      </Link>

      <div className={styles.menuDrawer__items}>
        {documents.map((doc, index) => (
          <Link
            to={`${navigationData[navigationResource]}/${doc.id}`}
            key={index}
          >
            <div className={getMenuDrawerItemClasses(index)}>{doc.title || 'Empty doc'}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MenuDrawer