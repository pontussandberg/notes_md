import { useEffect } from 'react'
import { useQuery } from '@apollo/client';
import { useParams, Navigate } from "react-router-dom"
import { GET_DOCUMENT_CONTAINER_QUERY } from '../gql/queries'

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

  // Get data
  const { documentId } = useParams();
  const {loading, data} = useQuery(GET_DOCUMENT_CONTAINER_QUERY, { variables: { id: documentId } })

  /**
   * Set local storage with last document view option to "edit".
   * This is used as default option when selecting document in menu.
   */
  useEffect(() => {
    setLocalStorage('lastDocumentView', 'markdown')
  }, [])

  // No document found
  if (!loading && !data?.document) {
    return <Navigate to={navigationData['404']}/>
  }

  return (
    <div className={styles.markdownContainer}>
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        navigationResource={'markdown'}
      />

      <div className={styles.markdownContainer__markdownRenderer}>
        <MarkdownRendererHeader
          drawerOpen={isMenuDrawerOpen}
          onDrawerToggleClick={() => setisMenuDrawerOpen(!isMenuDrawerOpen)}
        />

        <MarkdownRenderer/>
      </div>
  </div>
  )
}

export default MarkdownContainer