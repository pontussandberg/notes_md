
import { useRouter } from 'next/router'
import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import styles from '../css/index.module.css'
import { DocumentFile } from "../types"
import DocumentCard from "../components/DocumentCard"
import DocumentListItem from "../components/DocumentListItem"
import Button from "../components/Button"
import Link from 'next/link'


type ViewOption = 'list' | 'card'
type MenuOption = 'documents' | 'settings'

type IndexPageProps = {
  documents: DocumentFile[]
  setDocuments: (docs: DocumentFile[]) => void
}

const IndexPage = ({documents, setDocuments}: IndexPageProps) => {
  const [currentMenu, setCurrentMenu] = useState<MenuOption>('documents')
  const [documentsViewOption, setDocumentsViewOption] = useState<ViewOption>('card')
  const router = useRouter()


  const createNewDocument = () => {
    const defaultDocument: DocumentFile = {
      rowsCount: 0,
      title: '',
      content: '',
      fileExtension: '.md',
      id: uuidv4(),
    }

    setDocuments([defaultDocument, ...documents])
  }

  /**
   * Handler for click document card in menu
   */
  const handleDocumentItemClick = (index: number) => {

  }


  /********************
   * Render functions *
   ********************/

  const renderDocumentCards = () => {
    return documents.map((document, index) => {
      return (
        <Link href={`/edit/${document.id}`}>
          <a>
            <DocumentCard
              key={uuidv4()}
              title={document.title || 'Empty Doc'}
              rowsCount={document.rowsCount}
              onClick={() => handleDocumentItemClick(index)}
            />
          </a>
        </Link>
      )
    })
  }

  const renderDocumentListItems = () => {
    return documents.map((document, index) => {
      return (
        <Link href={`/edit/${document.id}`}>
          <a>
            <DocumentListItem
              key={uuidv4()}
              title={document.title || 'Empty Doc'}
              onClick={() => handleDocumentItemClick(index)}
            />
          </a>
        </Link>
      )
    })
  }

  const renderDocuments = () => {
    const showCards = documentsViewOption === 'card'

    return (
      <div className={styles.documents}>

        {/* Header */}
        <div className={styles.documents__header}>
          <Button
            type='primary'
            title={'New document'}
            onClick={createNewDocument}
          />
          <div>
            <button onClick={() => setDocumentsViewOption('card')} className={`${styles.showOptionBtn} ${showCards && styles.active}`}><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="6" height="6" rx="1" fill="#D9D9D9"/><rect x="9" width="6" height="6" rx="1" fill="#D9D9D9"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#D9D9D9"/><rect y="9" width="6" height="6" rx="1" fill="#D9D9D9"/></svg></button>
            <button onClick={() => setDocumentsViewOption('list')} className={`${styles.showOptionBtn} ${!showCards && styles.active}`}><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="15" height="3" rx="1" fill="#D9D9D9"/><rect y="12" width="15" height="3" rx="1" fill="#D9D9D9"/><rect y="6" width="15" height="3" rx="1" fill="#D9D9D9"/></svg></button>
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
        return renderDocuments()
      case 'settings':
        return renderMenuSettings()
    }
  }


  /**
   * Render
   */
  return (
    <div className={styles.menu}>

      {/* Sidebar */}
      <div className={styles.menu__sidebar}>
        <h1 className={styles.sidebar__title}>Notes MD</h1>
        <a onClick={() => setCurrentMenu('documents')} className={`${styles.sidebar__item} ${currentMenu === 'documents' && styles.active}`}>Documents</a>
        <a onClick={() => setCurrentMenu('settings')} className={`${styles.sidebar__item} ${currentMenu === 'settings' && styles.active}`}>Settings</a>
      </div>

      {/* Menu main content */}
      <div className={styles.menu__main}>
        {renderCurrentMenu()}
      </div>

    </div>
  )
}

export default IndexPage;