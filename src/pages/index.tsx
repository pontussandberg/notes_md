// import Editor from "../components/Editor";
import { useEffect, useState } from "react";
import Editor2 from "../components/Editor2";

const IndexPage = () => {
  const [content, setContent] = useState<string | null>(null)

  useEffect(() => {
    const savedContent = localStorage.getItem('note')
    if (typeof savedContent === 'string') {
      setContent(savedContent)
    }
  }, [])

  if (typeof content === 'string') {
    return <Editor2 content={content}/>
  }

  return null
}

export default IndexPage;