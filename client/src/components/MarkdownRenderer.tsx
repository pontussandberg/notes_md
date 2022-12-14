import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import showdown from 'showdown'
import styles from '../css/components/MarkdownRenderer.module.css'
import { GET_DOCUMENT_MD_RENDER_QUERY } from '../gql/queries'

const MarkdownRenderer = () => {
  const { documentId } = useParams()
  const {data} = useQuery(GET_DOCUMENT_MD_RENDER_QUERY, { variables: { id: documentId } })

  const getMarkdownHtml = () => {
    if (data?.document?.content) {
      const converter = new showdown.Converter()
      return converter.makeHtml(data.document.content)
    }

    return ''
  }

  return (
    <div
      className={styles.markdownRenderer}
      dangerouslySetInnerHTML={{ __html: getMarkdownHtml() }}
    ></div>
  )
}

export default MarkdownRenderer