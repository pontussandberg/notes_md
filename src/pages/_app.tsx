import Head from 'next/head'
import { AppProps } from '../types'
import '../css/global.css'
import '../css/vars.css'


const MyApp = ({ Component, pageProps }: AppProps) => {

  return (
    <>
      <Head>
        <title>MarkDown Notes</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp