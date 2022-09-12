import Head from 'next/head'
import { AppProps, DocumentFile } from '../types'
import '../css/global.css'
import '../css/vars.css'
import '../prism_lib/prism.css'
import '../prism_lib/prism.js'
import { useEffect, useState } from 'react'


const MyApp = ({ Component, pageProps }: AppProps) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([])



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
      <Component
        documents={documents}
        setDocuments={setDocuments}
        {...pageProps}
      />
    </>
  )
}

export default MyApp