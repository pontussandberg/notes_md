import styles from '../css/containers/MarkdownContainer.module.css'
import { useParams, Navigate } from "react-router-dom"
import MarkdownRenderer from "../components/MarkdownRenderer"
import { DocumentFile } from "../types"
import navigationData from '../data/navigation.json'
import MenuDrawer from '../components/MenuDrawer'
import MarkdownRendererHeader from '../components/MarkdownRendererHeader'

type MarkdownContainerProps = {
  documents: DocumentFile[]
  isMenuDrawerOpen: boolean
  setisMenuDrawerOpen: (state: boolean) => void
}

const MarkdownContainer = ({
  documents,
  isMenuDrawerOpen,
  setisMenuDrawerOpen,
}: MarkdownContainerProps) => {
  const { documentId } = useParams();
  const currentDocument = documents.find(doc => doc.id === documentId)

  if (!documentId || !currentDocument) {
    return <Navigate to={navigationData['404']}/>
  }

  const currentDocumentIndex = documents.indexOf(currentDocument)

  return (
    <div className={styles.markdownContainer}>
      <MenuDrawer
        documents={documents}
        isOpen={isMenuDrawerOpen}
        currentDocumentIndex={currentDocumentIndex}
        navigationResource={'markdown'}
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