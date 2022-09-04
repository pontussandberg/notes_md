
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import styles from '../css/index.module.css'
import Editor from "../components/Editor"
import EditorHeader from '../components/EditorHeader'
import { DocumentFile } from "../types"
import DocumentCard from "../components/DocumentCard"
import DocumentListItem from "../components/DocumentListItem"
import PrimaryButton from "../components/PrimaryButton"
import MenuDrawer from "../components/MenuDrawer"


type ShowOption = 'list' | 'card'
type MenuOption = 'documents' | 'settings'
const debug = true

const IndexPage = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(true)
  const [showOption, setShowOption] = useState<ShowOption>('list')
  const [currentMenu, setCurrentMenu] = useState<MenuOption>('documents')
  const [isMenuDrawerOpen, setisMenuDrawerOpen] = useState(false)

  /**
   * Runs on every rernder
   */
  const logger = () => {
    if (!debug) {
      return
    }

    console.log(documents)
  }
  useEffect(() => {
    logger()
  })

  /**
   * Whenever state variable documents is updated, store files in DB.
   */
  useEffect(() => {
    if (documents.length) {
      localStorage.setItem('documentFiles', JSON.stringify(documents))
    }
  }, [documents])

  /**
   * Get stored document files
   */
  useEffect(() => {
    const storedDocumentFiles = localStorage.getItem('documentFiles')
    if (storedDocumentFiles) {
      setDocuments(JSON.parse(storedDocumentFiles))
    }
  }, [])

  const createNewDocument = () => {
    const defaultDocument: DocumentFile = {
      rowsCount: 0,
      title: '',
      content: '',
      fileExtension: '.md',
    }

    setDocuments([defaultDocument, ...documents])
  }

  /**
   * Handler for clicking menu CTA in editor header
   */
  const handleShowMenu = () => {
    setShowMenu(true)
  }

  /**
   * Handler for click document card in menu
   */
  const handleDocumentItemClick = (index: number) => {
    setCurrentDocumentIndex(index)
    setShowMenu(false)
  }

  /**
   * Handler for when document updates
   */
  const handleDocumentUpdate = (data: DocumentFile) => {
    const docs = [...documents]

    // Replace current document with update value
    docs[currentDocumentIndex] = {...docs[currentDocumentIndex], ...data}

    // Set in state
    setDocuments(docs)
  }

  /********************
   * Render functions *
   ********************/

  const renderDocumentCards = () => {
    return documents.map((document, index) => {
      return (
        <DocumentCard
          key={uuidv4()}
          title={document.title || 'Empty Doc'}
          rowsCount={document.rowsCount}
          onClick={() => handleDocumentItemClick(index)}
        />
      )
    })
  }

  const renderDocumentListItems = () => {
    return documents.map((document, index) => {
      return (
        <DocumentListItem
          key={uuidv4()}
          title={document.title || 'Empty Doc'}
          onClick={() => handleDocumentItemClick(index)}
        />
      )
    })
  }

  const renderMenuDocuments = () => {
    const showCards = showOption === 'card'

    return (
      <div className={styles.documents}>

        {/* Header */}
        <div className={styles.documents__header}>
          <div>
            <PrimaryButton
              title={'New document'}
              onClick={createNewDocument}
              />
          </div>

          <div>
            <button onClick={() => setShowOption('list')} className={`${styles.showOptionBtn} ${!showCards && styles.active}`}><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="15" height="3" rx="1" fill="#D9D9D9"/><rect y="12" width="15" height="3" rx="1" fill="#D9D9D9"/><rect y="6" width="15" height="3" rx="1" fill="#D9D9D9"/></svg></button>
            <button onClick={() => setShowOption('card')} className={`${styles.showOptionBtn} ${showCards && styles.active}`}><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="6" height="6" rx="1" fill="#D9D9D9"/><rect x="9" width="6" height="6" rx="1" fill="#D9D9D9"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#D9D9D9"/><rect y="9" width="6" height="6" rx="1" fill="#D9D9D9"/></svg></button>
          </div>
        </div>

        {/* Content */}
        <div className={showCards ? styles.documents__itemCards : styles.documents__itemList}>
          {showCards ? renderDocumentCards() : renderDocumentListItems()}
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

  const renderMenu = () => {
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
  const getCurrentDocument = () => documents[currentDocumentIndex]

  const renderEditor = () => {
    return (
      <div className={styles.documentViewer}>

        {/* Menu drawer */}
        <MenuDrawer
          isOpen={isMenuDrawerOpen}
          currentDocumentIndex={currentDocumentIndex}
          indexedDocumentTitles={documents.map(({title}) => title)}
          onItemClick={handleDocumentItemClick}
          onShowMenu={handleShowMenu}
        />

        {/* Editor */}
        <div className={styles.documentViewer__editorContainer}>
          <EditorHeader
            title={getCurrentDocument().title}
            onDrawerToggleClick={() => setisMenuDrawerOpen(!isMenuDrawerOpen)}
            drawerOpen={isMenuDrawerOpen}
          />
          <Editor
            key={currentDocumentIndex}
            content={getCurrentDocument().content}
            onDocumentUpdate={handleDocumentUpdate}
          />
        </div>
      </div>
    )
  }

  /**
   * Render
   */
  return (
    <main>
      {showMenu && renderMenu()}
      {!showMenu && renderEditor()}
    </main>
  )
}

export default IndexPage;