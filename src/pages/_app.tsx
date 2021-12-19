import Head from 'next/head'
import { AppProps } from '../types'
import '../css/global.css'
import '../css/vars.css'
import '../prism_lib/prism.css'
import '../prism_lib/prism.js'


const MyApp = ({ Component, pageProps }: AppProps) => {

  const getHead = () => (
    <Head>
      <title>MarkDown Notes</title>
    </Head>
  )

  return (
    <>
      { getHead() }
      <Component {...pageProps} />
    </>
  )
}

export default MyApp