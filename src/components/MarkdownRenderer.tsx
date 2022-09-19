import React from 'react'
import showdown from 'showdown'
import styles from '../css/components/MarkdownRenderer.module.css'
import { DocumentFile } from '../types'


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