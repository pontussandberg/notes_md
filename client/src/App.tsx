import { useState } from "react"
import { Route, Routes } from 'react-router-dom'
import MenuContainer from "./containers/MenuContainer"
import EditorContainer from "./containers/EditorContainer"
import MarkdownContainer from "./containers/MarkdownContainer"
import navigationData from './constants/navigation.json'

const App = () => {
  // TODO - should be a context
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