import { useState } from 'react'
import { Link } from 'react-router-dom'
import shortid from 'shortid'

import Button from '../components/Button'
import DocumentCard from '../components/DocumentCard'
import DocumentListItem from '../components/DocumentListItem'

import navigationData from '../data/navigation.json'
import styles from '../css/containers/MenuContainer.module.css'
import { DocumentFile } from '../types'

type ViewOption = 'list' | 'card'
type MenuOption = 'documents' | 'settings'

type MenuContainerProps = {
  documents: DocumentFile[]
  lastDocumentView: 'edit' | 'markdown'
  onCreateNewDocument: () => void
}

const MenuContainer = ({
  onCreateNewDocument,
  documents,
  lastDocumentView,
}: MenuContainerProps) => {
  const [currentMenu, setCurrentMenu] = useState<MenuOption>('documents')
  const [viewOption, setViewOption] = useState<ViewOption>('card')

  const getDocumentLink = (documentId: string): string => {
    const currentDoc = documents.find(doc => doc.id === documentId)
    console.log(currentDoc?.content)
    console.log(currentDoc?.content.length)

    // Should never run
    if (!currentDoc) {
      console.error('Something went wrong')
      return ''
    }

    const resource = lastDocumentView === 'edit' || currentDoc.content.trim().length === 0
      ? navigationData.edit
      : navigationData.markdown

    return `${resource}/${documentId}`
  }

  const renderDocumentCards = () => {
    return documents.map((document) => {
      return (
        <Link
          to={getDocumentLink(document.id)}
          key={shortid.generate()}
        >
          <DocumentCard
            title={document.title || 'Empty Doc'}
            rowsCount={document.rowsCount}
          />
        </Link>
      )
    })
  }

  const renderDocumentListItems = () => {
    return documents.map((document) => {
      return (
        <Link
          to={getDocumentLink(document.id)}
          key={shortid.generate()}
        >
          <DocumentListItem
            title={document.title || 'Empty Doc'}
          />
        </Link>
      )
    })
  }

  const renderMenuDocuments = () => {
    const showCards = viewOption === 'card'

    return (
      <div className={styles.main__documents}>

        {/* Header */}
        <div className={styles.documents__header}>
          <Button
            type='primary'
            title={'New document'}
            onClick={onCreateNewDocument}
          />
          <div>
            <button onClick={() => setViewOption('card')} className={`${styles.showOptionBtn} ${showCards && styles.active}`}><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="6" height="6" rx="1" fill="#D9D9D9"/><rect x="9" width="6" height="6" rx="1" fill="#D9D9D9"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#D9D9D9"/><rect y="9" width="6" height="6" rx="1" fill="#D9D9D9"/></svg></button>
            <button onClick={() => setViewOption('list')} className={`${styles.showOptionBtn} ${!showCards && styles.active}`}><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="15" height="3" rx="1" fill="#D9D9D9"/><rect y="12" width="15" height="3" rx="1" fill="#D9D9D9"/><rect y="6" width="15" height="3" rx="1" fill="#D9D9D9"/></svg></button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.documents__documentItems}>
          {showCards
            ? <div className={styles.documentItems__cards}>{renderDocumentCards()}</div>
            : <div className={styles.documentItems__list}>{renderDocumentListItems()}</div>
          }
        </div>

      </div>
    )
  }

  const renderMenuSettings = () => {
    return <></>
  }

  const renderCurrentMenu = () => {
    switch (currentMenu) {
      case 'documents':
        return renderMenuDocuments()
      case 'settings':
        return renderMenuSettings()
    }
  }


  return (
    <div className={styles.menu}>

      {/* Menu Navigation */}
      <div className={styles.menu__navigation}>
        <h1 className={styles.navigation__title}>Notes MD</h1>
        <div className={styles.navigation__linkGroup}>
          <a onClick={() => setCurrentMenu('documents')} className={`${styles.linkGroup__link} ${currentMenu === 'documents' && styles.active}`}>Documents</a>
          <a onClick={() => setCurrentMenu('settings')} className={`${styles.linkGroup__link} ${currentMenu === 'settings' && styles.active}`}>Settings</a>
        </div>

        <div className={styles.navigation__linkGroup}>
          <a href="#" className={styles.linkGroup__link}>Login</a>

        </div>
      </div>


      {/* Menu main content */}
      <div className={styles.menu__main}>
        {renderCurrentMenu()}
      </div>
    </div>
  )
}

export default MenuContainer