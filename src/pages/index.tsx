
import { useEffect, useState } from "react"
import styles from '../css/index.module.css'
import Editor from "../components/Editor"
import Header from '../components/EditorHeader'

const IndexPage = () => {
  const [content, setContent] = useState<string | null>(null)

  useEffect(() => {
    const savedContent = localStorage.getItem('note')
    if (typeof savedContent === 'string') {
      setContent(savedContent)
    }
  }, [])

  const handleShowMenu = () => {
    console.log('menu clicked')
  }

  if (typeof content === 'string') {
    return (
      <main>
        <section className={styles.editorWithHeaderWrapper}>
          <Header
            onMenuClick={handleShowMenu}
          />
          <Editor
            content={content}
          />
        </section>
      </main>
    )
  }

  return null
}

export default IndexPage;