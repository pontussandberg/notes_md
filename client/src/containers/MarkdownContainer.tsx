import styles from '../css/containers/MarkdownContainer.module.css'
import { useParams, Navigate } from "react-router-dom"
import MarkdownRenderer from "../components/MarkdownRenderer"
import { DocumentFile } from "../types"
import navigationData from '../data/navigation.json'
import MenuDrawer from '../components/MenuDrawer'
import MarkdownRendererHeader from '../components/MarkdownRendererHeader'
import { useEffect } from 'react'
import { setLocalStorage } from '../localStorage'

type MarkdownContainerProps = {
  documents: DocumentFile[]
  isMenuDrawerOpen: boolean
  lastDocumentView: 'edit' | 'markdown'
  setLastDocumentView: (value: 'edit' | 'markdown') => void
  setisMenuDrawerOpen: (state: boolean) => void
}

const MarkdownContainer = ({
  documents,
  isMenuDrawerOpen,
  lastDocumentView,
  setLastDocumentView,
  setisMenuDrawerOpen,
}: MarkdownContainerProps) => {
  const { documentId } = useParams();
  const currentDocument = documents.find(doc => doc.id === documentId)

  /**
   * Set local storage with last document view option to "edit".
   * This is used as default option when selecting document in menu.
   */
  useEffect(() => {
    setLastDocumentView('markdown')
    setLocalStorage('lastDocumentView', 'markdown')
  }, [])

  if (!documentId || !currentDocument) {
    return <Navigate to={navigationData['404']}/>
  }

  const currentDocumentIndex = documents.indexOf(currentDocument)

  return (
    <div className={styles.markdownContainer}>
      <MenuDrawer
        currentDocumentId={currentDocument.id}
        documents={documents}
        isOpen={isMenuDrawerOpen}
        currentDocumentIndex={currentDocumentIndex}
        navigationResource={'markdown'}
        lastDocumentView={lastDocumentView}
      />

      <div className={styles.markdownContainer__markdownRenderer}>
        <MarkdownRendererHeader
          documentId={documentId}
          drawerOpen={isMenuDrawerOpen}
          onDrawerToggleClick={() => setisMenuDrawerOpen(!isMenuDrawerOpen)}
        />

        <MarkdownRenderer
          markdownText={currentDocument.content}
        />
      </div>
  </div>
  )
}

export default MarkdownContainer