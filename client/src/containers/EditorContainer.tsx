import { useParams, Navigate } from 'react-router-dom'
import Editor from '../components/Editor'
import EditorHeader from '../components/EditorHeader'
import MenuDrawer from '../components/MenuDrawer'
import styles from '../css/containers/EditorContainer.module.css'
import { DocumentFile } from '../types'
import navigationData from '../data/navigation.json'
import { useEffect } from 'react'
import { setLocalStorage } from '../localStorage'

type EditorContainerProps = {
  documents: DocumentFile[]
  isMenuDrawerOpen: boolean
  lastDocumentView: 'edit' | 'markdown'
  setLastDocumentView: (value: 'edit' | 'markdown') => void
  setisMenuDrawerOpen: (state: boolean) => void
  onDocumentUpdate: (id: string, documentData: DocumentFile) => void
}

const EditorContainer = ({
  isMenuDrawerOpen,
  documents,
  lastDocumentView,
  setLastDocumentView,
  setisMenuDrawerOpen,
  onDocumentUpdate,
}: EditorContainerProps) => {
  const { documentId } = useParams();
  const currentDocument = documents.find(doc => doc.id === documentId)

  /**
   * Set local storage with last document view option to "edit".
   * This is used as default option when selecting document in menu.
   */
  useEffect(() => {
    setLastDocumentView('edit')
    setLocalStorage('lastDocumentView', 'edit')
  }, [])

  if (!documentId || !currentDocument) {
    return <Navigate to={navigationData['404']}/>
  }

  const currentDocumentIndex = documents.indexOf(currentDocument)

  return (
    <div className={styles.documentViewer}>

      {/* Menu drawer */}
      <MenuDrawer
        currentDocumentId={currentDocument.id}
        isOpen={isMenuDrawerOpen}
        currentDocumentIndex={currentDocumentIndex}
        documents={documents}
        navigationResource={'edit'}
        lastDocumentView={lastDocumentView}
      />

      {/* Editor */}
      <div className={styles.documentViewer__editorContainer}>
        <EditorHeader
          title={currentDocument.title}
          drawerOpen={isMenuDrawerOpen}
          onDrawerToggleClick={() => setisMenuDrawerOpen(!isMenuDrawerOpen)}
          documentId={documentId}
        />

        <Editor
          documentId={documentId}
          key={currentDocumentIndex}
          content={currentDocument.content}
          onDocumentUpdate={onDocumentUpdate}
        />
      </div>
    </div>
  )
}

export default EditorContainer