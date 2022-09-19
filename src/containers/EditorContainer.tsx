import { useParams, Navigate } from 'react-router-dom'
import Editor from '../components/Editor'
import EditorHeader from '../components/EditorHeader'
import MenuDrawer from '../components/MenuDrawer'
import styles from '../css/containers/EditorContainer.module.css'
import { DocumentFile } from '../types'
import navigationData from '../navigation.json'

type EditorContainerProps = {
  documents: DocumentFile[]
  isMenuDrawerOpen: boolean
  setisMenuDrawerOpen: (state: boolean) => void
  onDocumentUpdate: (id: string, documentData: DocumentFile) => void
}

const EditorContainer = ({
  isMenuDrawerOpen,
  documents,
  setisMenuDrawerOpen,
  onDocumentUpdate,
}: EditorContainerProps) => {
  const { documentId } = useParams();
  const currentDocument = documents.find(doc => doc.id === documentId)

  if (!documentId || !currentDocument) {
    return <Navigate to={navigationData['404'].path}/>
  }

  const currentDocumentIndex = documents.indexOf(currentDocument)

  return (
    <div className={styles.documentViewer}>

      {/* Menu drawer */}
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        currentDocumentIndex={currentDocumentIndex}
        documents={documents}
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