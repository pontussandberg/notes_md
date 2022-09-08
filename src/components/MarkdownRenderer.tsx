import showdown from 'showdown'
import styles from '../css/MarkdownRenderer.module.css'


type MarkdownRendererProps = {
  markdownText: string
}

const MarkdownRenderer = ({markdownText}: MarkdownRendererProps) => {
  const getMarkdownHtml = () => {
    const converter = new showdown.Converter()
    return converter.makeHtml(markdownText)
  }

  return (
    <div
      className={styles.markdownRenderer}
      dangerouslySetInnerHTML={{ __html: getMarkdownHtml() }}
    ></div>
  )
}

export default MarkdownRenderer