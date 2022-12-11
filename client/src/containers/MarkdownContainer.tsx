import { useEffect } from 'react'
import { useQuery } from '@apollo/client';
import { useParams, Navigate } from "react-router-dom"
import { GET_DOCUMENT_RENDER_QUERY } from '../gql/queries'

import { setLocalStorage } from '../localStorage'
import styles from '../css/containers/MarkdownContainer.module.css'

import MarkdownRendererHeader from '../components/MarkdownRendererHeader'
import MarkdownRenderer from "../components/MarkdownRenderer"
import navigationData from '../data/navigation.json'
import MenuDrawer from '../components/MenuDrawer'

type MarkdownContainerProps = {
  isMenuDrawerOpen: boolean
  setisMenuDrawerOpen: (state: boolean) => void
}

const MarkdownContainer = ({
  isMenuDrawerOpen,
  setisMenuDrawerOpen,
}: MarkdownContainerProps) => {
  const { documentId } = useParams();

  if (!documentId) {
    return <Navigate to={navigationData['menu']}/>
  }

  const {loading, data} = useQuery(
    GET_DOCUMENT_RENDER_QUERY,
    {
      variables: {
        id: documentId,
      }
    }
  )

  if (loading) {
    return null
  } else if (!data?.document) {
    return <Navigate to={navigationData['404']}/>
  }

  const { document: currentDocument } = data

  /**
   * Set local storage with last document view option to "edit".
   * This is used as default option when selecting document in menu.
   */
  useEffect(() => {
    setLocalStorage('lastDocumentView', 'markdown')
  }, [])

  if (!documentId || !currentDocument) {
    return <Navigate to={navigationData['404']}/>
  }

  return (
    <div className={styles.markdownContainer}>
      <MenuDrawer
        currentDocumentId={currentDocument.id}
        isOpen={isMenuDrawerOpen}
        currentDocumentIndex={0} /* TODO */
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