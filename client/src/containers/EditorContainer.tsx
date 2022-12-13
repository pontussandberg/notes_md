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

  // Get data
  const { documentId } = useParams()
  const {loading, data} = useQuery(GET_DOCUMENT_RENDER_QUERY, { variables: { id: documentId } })

  /**
   * Set local storage with last document view option to "edit".
   * This is used as default option when selecting document in menu.
   */
  useEffect(() => {
    setLocalStorage('lastDocumentView', 'edit')
  }, [])

  // No document found
  if (!loading && !data?.document) {
    return <Navigate to={navigationData['404']}/>
  }

  return (
    <div className={styles.documentViewer}>
      {/* Menu drawer */}
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        navigationResource={'edit'}
      />

      {/* Editor */}
      <div className={styles.documentViewer__editorContainer}>
        <EditorHeader
          drawerOpen={isMenuDrawerOpen}
          onDrawerToggleClick={() => setisMenuDrawerOpen(!isMenuDrawerOpen)}
        />

        <Editor/>
      </div>
    </div>
  )
}

export default EditorContainer