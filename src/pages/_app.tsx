import '../css/global.css'
import { AppProps } from '../types'



const MyApp = ({ Component, pageProps }: AppProps) => {

  return (
    <Component {...pageProps} />
  )
}

export default MyApp