import styles from '../css/containers/MarkdownContainer.module.css'
import { Link, useParams, Navigate } from "react-router-dom"
import MarkdownRenderer from "../components/MarkdownRenderer"
import { DocumentFile } from "../types"
import Button from '../components/Button'
import navigationData from '../data/navigation.json'
import MenuDrawer from '../components/MenuDrawer'

type MarkdownContainerProps = {
  documents: DocumentFile[]
  isMenuDrawerOpen: boolean
}

const MarkdownContainer = ({
  documents,
  isMenuDrawerOpen,
}: MarkdownContainerProps) => {
  const { documentId } = useParams();
  const currentDocument = documents.find(doc => doc.id === documentId)

  if (!documentId || !currentDocument) {
    return <Navigate to={navigationData['404']}/>
  }

  const currentDocumentIndex = documents.indexOf(currentDocument)

  return (
    <div className={styles.markdownContainer}>

      {/* Absolute position button */}
      <div className={styles.markdownContainer__editButtonContainer}>
        <Link to={`${navigationData.edit}/${documentId}`}>
          <Button
            title="Edit"
            type='secondary'
          />
        </Link>
      </div>

      <div className={styles.markdownContainer__main}>
        <MenuDrawer
          documents={documents}
          isOpen={isMenuDrawerOpen}
          currentDocumentIndex={currentDocumentIndex}
          navigationResource={'markdown'}
        />
        <MarkdownRenderer
          markdownText={currentDocument.content}
        />
      </div>
    </div>
  )
}

export default MarkdownContainer