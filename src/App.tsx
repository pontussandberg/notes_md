import { useEffect, useState } from "react"
import { Route, Routes } from 'react-router-dom'
import shortid from 'shortid'
import { DocumentFile } from "./types"
import MenuContainer from "./containers/MenuContainer"
import EditorContainer from "./containers/EditorContainer"
import MarkdownContainer from "./containers/MarkdownContainer"
import navigationData from './navigation.json'

const App = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [isMenuDrawerOpen, setisMenuDrawerOpen] = useState(false)


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
        path={`${navigationData.menu.path}`}
        element={
          <MenuContainer
            documents={documents}
            onCreateNewDocument={createNewDocument}
          />
        }
      />

      <Route
        path={`${navigationData.edit.path}/:documentId`}
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
        path={`${navigationData.markdown.path}/:documentId`}
        element={
          <MarkdownContainer documents={documents}/>
        }
      />

    </Routes>
  )
}


export default App