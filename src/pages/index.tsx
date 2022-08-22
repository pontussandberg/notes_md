
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import styles from '../css/index.module.css'
import Editor from "../components/Editor"
import Header from '../components/EditorHeader'
import { DocumentFile } from "../types"
import EditorPlaceholder from "../components/EditorPlaceholder"


const IndexPage = () => {
  const [documents, setDocuments] = useState<DocumentFile[] | null>(null)
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(true)

  /**
   * Whenever state variable documents is updated, store files in DB.
   */
  useEffect(() => {
    if (documents)
    localStorage.setItem('documentFiles', JSON.stringify(documents))
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

  /**
   * Handler for clicking menu CTA in editor header
   */
  const handleShowMenu = () => {
    setShowMenu(true)
  }

  /**
   * Handler for click document card in menu
   */
  const handleDocumentCardClick = (index: number) => {
    setCurrentDocumentIndex(index)
    setShowMenu(false)
  }

  /**
   * Handler for when document updates
   */
  const handleDocumentUpdate = (data: DocumentFile) => {
    if (!documents) {
      return
    }

    const docs = [...documents]
    docs[currentDocumentIndex] = {...docs[currentDocumentIndex], ...data}
    setDocuments(docs)
  }

  /********************
   * Render functions *
   ********************/

  const renderDocumentCards = () => {
    if (!documents) {
      return null
    }

    return documents.map((document, index) => {
      return (
        <EditorPlaceholder
          key={uuidv4()}
          title={document.title || 'Empty Doc'}
          rowsCount={document.rowsCount}
          onClick={() => handleDocumentCardClick(index)}
        />
      )
    })
  }

  const renderMenu = () => {
    return (
      <div className={styles.menu}>

        {/* Sidebar */}
        <div className={styles.menuSidebar}></div>

        {/* Dashboard (Where menu content is rendered) */}
        <div className={styles.menuDashboard}>

          {/* Notes */}
          <div className={styles.dashboardDocumentCards}>
            {renderDocumentCards()}
          </div>

          {/* Settings */}
          {/* <div></div> */}
        </div>
      </div>
    )
  }

  const renderEditor = () => {
    if (!documents) {
      return null
    }

    return (
      <div className={styles.editorContainer}>
        <Header onMenuClick={handleShowMenu}/>
        <Editor onDocumentUpdate={handleDocumentUpdate} content={documents[currentDocumentIndex].content}/>
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