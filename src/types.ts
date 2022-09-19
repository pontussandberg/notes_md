import { MouseEventHandler } from "react"

export type DocumentFile = {
  id: string
  listIndex?: number
  rowsCount: number
  title: string
  content: string
  fileExtension: '.md'
}

// Hacky but thes props are handled by NextJS anyway
export type AppProps = {
  Component: any
  pageProps: any
}

export type TGlassButtonProps = {
  title: string
  onClick: MouseEventHandler<HTMLButtonElement>
  style?: Object
  disabled?: boolean
}

export type TActiveKeys = TKeyBooleanValue

export type TKeyNumberValue = {
  [key: string]: number
}

export type TKeyBooleanValue = {
  [key: string]: boolean
}