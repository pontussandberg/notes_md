import Head from 'next/head'
import '../css/global.css'
import '../css/vars.css'
import '../prism_lib/prism.css'
import '../prism_lib/prism.js'
import { useEffect, useState } from 'react'
import React from 'react'
import { DocumentFile } from './types'



const App = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([])

  /**
   * Mount
   */
  useEffect(() => {
    fetchData()
  }, [])

  /**
   * Whenever $documents is updated, store files in DB.
   */
  useEffect(() => {
    if (documents.length) {
      localStorage.setItem('documentFiles', JSON.stringify(documents))
    }
  }, [documents])

  /**
   * Get stored document files on mount
   */
  const fetchData = () => {
    const storedDocumentFiles = localStorage.getItem('documentFiles')

    if (storedDocumentFiles) {
      setDocuments(JSON.parse(storedDocumentFiles))
     }
  }

  const renderHead = () => (
    <Head>
      <title>MarkDown Notes</title>
    </Head>
  )

  /**
   * RENDER
   */
  return (
    <>
      { renderHead() }

    </>
  )
}

export default App