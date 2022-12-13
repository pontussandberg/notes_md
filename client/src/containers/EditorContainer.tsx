import { useParams, Navigate } from 'react-router-dom'
import Editor from '../components/Editor'
import { useMutation, useQuery } from '@apollo/client'

import EditorHeader from '../components/EditorHeader'
import MenuDrawer from '../components/MenuDrawer'

import navigationData from '../data/navigation.json'
import { useEffect } from 'react'
import { setLocalStorage } from '../localStorage'
import { GET_DOCUMENT_RENDER_QUERY } from '../gql/queries'
import styles from '../css/containers/EditorContainer.module.css'

type EditorContainerProps = {
  isMenuDrawerOpen: boolean
  setisMenuDrawerOpen: (state: boolean) => void
}

const EditorContainer = ({
  isMenuDrawerOpen,
  setisMenuDrawerOpen,
}: EditorContainerProps) => {
  const { documentId } = useParams()

  const {loading, data} = useQuery(
    GET_DOCUMENT_RENDER_QUERY,
    {
      variables: {
        id: documentId,
      }
    }
  )

  /**
   * Set local storage with last document view option to "edit".
   * This is used as default option when selecting document in menu.
   */
  useEffect(() => {
    setLocalStorage('lastDocumentView', 'edit')
  }, [])

  if (loading) {
    return null
  } else if (!data?.document) {
    return <Navigate to={navigationData['404']}/>
  }

  const { document: currentDocument } = data

  if (!documentId || !currentDocument) {
    return <Navigate to={navigationData['404']}/>
  }

  return (
    <div className={styles.documentViewer}>

      {/* Menu drawer */}
      <MenuDrawer
        currentDocumentId={currentDocument.id}
        isOpen={isMenuDrawerOpen}
        currentDocumentIndex={0} /* TODO */
        navigationResource={'edit'}
      />

      {/* Editor */}
      <div className={styles.documentViewer__editorContainer}>
        <EditorHeader
          title={currentDocument.title}
          drawerOpen={isMenuDrawerOpen}
          onDrawerToggleClick={() => setisMenuDrawerOpen(!isMenuDrawerOpen)}
          documentId={documentId}
        />

        <Editor/>
      </div>
    </div>
  )
}

export default EditorContainer