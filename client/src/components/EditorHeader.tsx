import { Link, useParams } from 'react-router-dom'
import styles from '../css/components/EditorHeader.module.css'
import Button from './Button'
import navigationData from '../constants/navigation.json'
import { useQuery } from '@apollo/client'
import { GET_DOCUMENT_RENDER_QUERY } from '../gql/queries'

type EditorHeaderProps = {
  drawerOpen: boolean
  onDrawerToggleClick: () => void
}

const EditorHeader = ({
  onDrawerToggleClick,
  drawerOpen,
}: EditorHeaderProps) => {
  const { documentId } = useParams()
  const { data } = useQuery(GET_DOCUMENT_RENDER_QUERY, { variables: { id: documentId } })

  const getDrawerButtonStyles = () => {
    const classes = [styles.drawerButton]

    if (!drawerOpen) {
      classes.push(styles.closed)
    }

    return classes.join(' ')
  }

  return (
    <header className={styles.editorHeader}>

      <button className={getDrawerButtonStyles()} onClick={onDrawerToggleClick}>
        <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><g><path d="M4 16V4H2v12h2zM13 15l-1.5-1.5L14 11H6V9h8l-2.5-2.5L13 5l5 5-5 5z"></path></g></svg>
      </button>

      <div className={styles.title}>{data?.document?.title || ''}</div>

      {!drawerOpen && (
        <div className={styles.renderMarkdownButton}>
          <Link to={`${navigationData.markdown}/${documentId}`}>
            <Button
              type='secondary'
              title={'Render Markdown'}
            />
          </Link>
        </div>
      )}
    </header>
  )
}


export default EditorHeader