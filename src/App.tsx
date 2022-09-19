import React, { useEffect, useState } from "react"
import shortid from 'shortid'

import { DocumentFile } from "./types"
import styles from './css/index.module.css'

import Editor from "./components/Editor"
import EditorHeader from './components/EditorHeader'
import DocumentCard from "./components/DocumentCard"
import DocumentListItem from "./components/DocumentListItem"
import Button from "./components/Button"
import MenuDrawer from "./components/MenuDrawer"
import MarkdownRenderer from "./components/MarkdownRenderer"

const App: React.FC = () => {
  type ViewOption = 'list' | 'card'
  type MenuOption = 'documents' | 'settings'
  const debug = true

  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(true)
  const [viewOption, setViewOption] = useState<ViewOption>('card')
  const [currentMenu, setCurrentMenu] = useState<MenuOption>('documents')
  const [isMenuDrawerOpen, setisMenuDrawerOpen] = useState(false)
  const [showMarkdownRenderer, setShowMarkdownRenderer] = useState(false)

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
   * Hide markdown renderer on selected component updates
   */
  useEffect(() => {
    if (showMarkdownRenderer) {
      setShowMarkdownRenderer(false)
    }
  }, [currentDocumentIndex, showMenu])

  /**
   * Whenever state variable documents is updated, store files in DB.
   */
  useEffect(() => {
    if (documents.length) {
      localStorage.setItem('documentFiles', JSON.stringify(documents))
    }
  }, [documents])

  /**
   * Get stored document files on mount
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

  const toggleShowMarkdownRenderer = () => {
    if (showMarkdownRenderer) {
      setShowMarkdownRenderer(false)
      return
    }

    // Only enable markdown if editor is shown
    if (!showMenu && getCurrentDocument()) {
      setShowMarkdownRenderer(true)
    }
  }

  const getCurrentDocument = () => documents[currentDocumentIndex]

  /********************
   * Render functions *
   ********************/

  const renderDocumentCards = () => {
    return documents.map((document, index) => {
      return (
        <DocumentCard
          key={shortid.generate()}
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
          key={shortid.generate()}
          title={document.title || 'Empty Doc'}
          onClick={() => handleDocumentItemClick(index)}
        />
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
            onClick={createNewDocument}
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
            drawerOpen={isMenuDrawerOpen}
            onDrawerToggleClick={() => setisMenuDrawerOpen(!isMenuDrawerOpen)}
            toggleShowMarkdownRenderer={toggleShowMarkdownRenderer}
            showMarkdownRenderer={showMarkdownRenderer}
          />
          {
          showMarkdownRenderer
            ? <MarkdownRenderer markdownText={getCurrentDocument().content}/>
            : <Editor key={currentDocumentIndex}content={getCurrentDocument().content}onDocumentUpdate={handleDocumentUpdate}/>
          }

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


export default App