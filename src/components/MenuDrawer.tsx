
import { useEffect } from 'react'
import styles from '../css/MenuDrawer.module.css'
import { getRawCssVarianble, setCssVariable } from '../helpers'

type MenuDrawerProps = {
  isOpen: boolean
  currentDocumentIndex: number
  indexedDocumentTitles: string[]
  onItemClick: (index: number) => void
  onShowMenu: () => void
}

const MenuDrawer = ({
  isOpen,
  currentDocumentIndex,
  indexedDocumentTitles,
  onItemClick,
  onShowMenu,
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
      <button className={styles.menuDrawer__menuButton} onClick={onShowMenu}><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4" rx="2" fill="#D9D9D9"/><rect y="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect y="14" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="7" y="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="7" y="14" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="14" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="14" y="7" width="4" height="4" rx="2" fill="#D9D9D9"/><rect x="14" y="14" width="4" height="4" rx="2" fill="#D9D9D9"/></svg></button>

      <div className={styles.menuDrawer__items}>
        {indexedDocumentTitles.map((title , index) => (
          <div
            className={getMenuDrawerItemClasses(index)}
            onClick={() => onItemClick(index)}
          >{title || 'Empty doc'}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MenuDrawer