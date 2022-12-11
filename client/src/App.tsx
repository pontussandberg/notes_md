import { useEffect, useState } from "react"
import { Route, Routes } from 'react-router-dom'
import shortid from 'shortid'
import { DocumentFile } from "./types"
import MenuContainer from "./containers/MenuContainer"
import EditorContainer from "./containers/EditorContainer"
import MarkdownContainer from "./containers/MarkdownContainer"
import navigationData from './data/navigation.json'

const App = () => {
  const [isMenuDrawerOpen, setisMenuDrawerOpen] = useState(true)

  /**
   * Render routes
   */
  return (
    <Routes>
      <Route
        path={`${navigationData.menu}`}
        element={
          <MenuContainer/>
        }
      />

      <Route
        path={`${navigationData.edit}/:documentId`}
        element={
          <EditorContainer
            isMenuDrawerOpen={isMenuDrawerOpen}
            setisMenuDrawerOpen={setisMenuDrawerOpen}
            />
          }
          />

      <Route
        path={`${navigationData.markdown}/:documentId`}
        element={
          <MarkdownContainer
            isMenuDrawerOpen={isMenuDrawerOpen}
            setisMenuDrawerOpen={setisMenuDrawerOpen}
          />
        }
      />

    </Routes>
  )
}


export default App