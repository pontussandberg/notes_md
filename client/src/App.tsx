import { useEffect, useState } from "react"
import { Route, Routes } from 'react-router-dom'
import shortid from 'shortid'
import { DocumentFile } from "./types"
import MenuContainer from "./containers/MenuContainer"
import EditorContainer from "./containers/EditorContainer"
import MarkdownContainer from "./containers/MarkdownContainer"
import navigationData from './data/navigation.json'
import { setLocalStorage, getLocalStorage } from "./localStorage"

const App = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [isMenuDrawerOpen, setisMenuDrawerOpen] = useState(false)

  useEffect(() => {
    console.log('documents -->', documents)
  })

  /**
   * Store document files in DB.
   */
  useEffect(() => {
    if (documents.length) {
      setLocalStorage('documentFiles', documents)
    }
  }, [documents])

  /**
   * Get stored document files on mount
   */
  useEffect(() => {
    const storedDocumentFiles = getLocalStorage('documentFiles')

    if (storedDocumentFiles) {
      setDocuments(storedDocumentFiles)
    }
  }, [])

  const createNewDocument = () => {
    const defaultDocument: DocumentFile = {
      id: shortid.generate(),
      rowsCount: 0,
      title: '',
      content: '',
      fileExtension: '.md',
    }

    setDocuments([defaultDocument, ...documents])
  }

  /**
   * Handler for when document updates
   */
  const handleDocumentUpdate = (id: string, data: DocumentFile) => {
    const docs = [...documents]
    const targetDocIndex = documents.findIndex(doc => doc.id === id)

    if (targetDocIndex < 0) {
      console.error('error code 123')
      return
    }

    // Replace current document with update value
    docs[targetDocIndex] = {...docs[targetDocIndex], ...data}

    // Set in state
    setDocuments(docs)
  }


  /**
   * Render routes
   */
  return (
    <Routes>
      <Route
        path={`${navigationData.menu}`}
        element={
          <MenuContainer
            documents={documents}
            onCreateNewDocument={createNewDocument}
          />
        }
      />

      <Route
        path={`${navigationData.edit}/:documentId`}
        element={
          <EditorContainer
            documents={documents}
            isMenuDrawerOpen={isMenuDrawerOpen}
            setisMenuDrawerOpen={setisMenuDrawerOpen}
            onDocumentUpdate={handleDocumentUpdate}
            />
          }
          />

      <Route
        path={`${navigationData.markdown}/:documentId`}
        element={
          <MarkdownContainer
            documents={documents}
            isMenuDrawerOpen={isMenuDrawerOpen}
            setisMenuDrawerOpen={setisMenuDrawerOpen}
          />
        }
      />

    </Routes>
  )
}


export default App