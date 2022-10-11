import ls from 'local-storage'
import { DocumentFile } from './types'


type LocalStorage = {
  lastDocumentView: 'edit' | 'markdown'
  documentFiles: DocumentFile[]
}

export const setLocalStorage = <T extends keyof LocalStorage>(key: T, value: LocalStorage[T]) => {
  if (typeof value === 'object') {
    localStorage.setItem(key, JSON.stringify(value))
  } else {
    localStorage.setItem(key, value)
  }
}

export const getLocalStorage = <T extends keyof LocalStorage>(key: T) => {
  const data = ls(key) as unknown as string

  try {
    return JSON.parse(data) as LocalStorage[T]
  } catch (e) {
    return data as LocalStorage[T]
  }
}