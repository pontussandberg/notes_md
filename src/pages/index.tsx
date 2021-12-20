// import Editor from "../components/Editor";
import { useEffect, useState } from "react";
import Editor from "../components/Editor";

const IndexPage = () => {
  const [content, setContent] = useState<string | null>(null)

  useEffect(() => {
    const savedContent = localStorage.getItem('note')
    if (typeof savedContent === 'string') {
      setContent(savedContent)
    }
  }, [])

  if (typeof content === 'string') {
    return <Editor content={content}/>
  }

  return null
}

export default IndexPage;