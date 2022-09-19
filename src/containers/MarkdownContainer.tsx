import styles from '../css/MarkdownContainer.module.css'
import { Link, useParams } from "react-router-dom"
import MarkdownRenderer from "../components/MarkdownRenderer"
import { DocumentFile } from "../types"
import Button from '../components/Button'
import navigationData from '../navigation.json'

type MarkdownContainerProps = {
  documents: DocumentFile[]
}

const MarkdownContainer = ({
  documents,
}: MarkdownContainerProps) => {
  const { documentId } = useParams();
  const currentDocument = documents.find(doc => doc.id === documentId)

  if (!documentId || !currentDocument) {
    // TODO REDIRECT 404
    return null
  }

  return (
    <div className={styles.markdownContainer}>
      <div className={styles.markdownContainer__editButtonContainer}>
        <Link to={`${navigationData.edit.path}/${documentId}`}>
          <Button title="Edit"/>
        </Link>
      </div>

      <MarkdownRenderer markdownText={currentDocument.content}/>
    </div>
  )
}

export default MarkdownContainer