
import { useEffect, useRef, useState } from "react"
import styles from '../css/index.module.css'
import Editor from "../components/Editor"
import Header from '../components/EditorHeader'
import { Documents } from "../types"
import EditorPlaceholder from "../components/EditorPlaceholder"
import { getCssVariable } from "../helpers"

const mockDataDocuments = [
  {rowsCount: 3, title: '', content: 'Hello worlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworldddddddddddddddddddddddddddddddddddddddddddddddddddd\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n  \n  \n  \n  \n  \n  \n  \n  \n  \n  \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n'},
  {rowsCount: 2, title: '', content: 'Hello world'},
  {rowsCount: 8, title: '', content: 'Hello world'},
  {rowsCount: 266, title: '', content: 'Hello world'},
  {rowsCount: 3, title: '', content: 'Hello worlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworldddddddddddddddddddddddddddddddddddddddddddddddddddd\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n  \n  \n  \n  \n  \n  \n  \n  \n  \n  \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n'},
  {rowsCount: 2, title: '', content: 'Hello world'},
  {rowsCount: 8, title: '', content: 'Hello world'},
  {rowsCount: 266, title: '', content: 'Hello world'},
  {rowsCount: 3, title: '', content: 'Hello worlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworldddddddddddddddddddddddddddddddddddddddddddddddddddd\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n  \n  \n  \n  \n  \n  \n  \n  \n  \n  \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n'},
  {rowsCount: 2, title: '', content: 'Hello world'},
  {rowsCount: 8, title: '', content: 'Hello world'},
  {rowsCount: 266, title: '', content: 'Hello world'},
  {rowsCount: 3, title: '', content: 'Hello worlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworldddddddddddddddddddddddddddddddddddddddddddddddddddd\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n  \n  \n  \n  \n  \n  \n  \n  \n  \n  \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n'},
  {rowsCount: 2, title: '', content: 'Hello world'},
  {rowsCount: 8, title: '', content: 'Hello world'},
  {rowsCount: 266, title: '', content: 'Hello world'},
  {rowsCount: 3, title: '', content: 'Hello worlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworldddddddddddddddddddddddddddddddddddddddddddddddddddd\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n  \n  \n  \n  \n  \n  \n  \n  \n  \n  \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n'},
  {rowsCount: 2, title: '', content: 'Hello world'},
  {rowsCount: 8, title: '', content: 'Hello world'},
  {rowsCount: 266, title: '', content: 'Hello world'},
  {rowsCount: 3, title: '', content: 'Hello worlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworlddddddddddddddddddddddddddddddddddddddddddddddddddddworldddddddddddddddddddddddddddddddddddddddddddddddddddd\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n  \n  \n  \n  \n  \n  \n  \n  \n  \n  \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n'},
  {rowsCount: 2, title: '', content: 'Hello world'},
  {rowsCount: 8, title: '', content: 'Hello world'},
  {rowsCount: 266, title: '', content: 'Hello world'},
]

const IndexPage = () => {
  const animatedEditorPlaceholderContainerRef = useRef<HTMLDivElement>(null)
  const dashboardDocumentCardsRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const [documents, setDocuments] = useState<Documents[]>(mockDataDocuments)
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  // const [showEditor, setShowEditor] = useState(true)


  /**
   * Animate open/close menu
   */
  useEffect(() => {
    if (showMenu) {

    } else {

    }
  }, [showMenu])

  /**
   * Handler for clicking menu CTA in editor header
   */
  const handleShowMenu = () => {
    const { current: animatedEditorPlaceholderContainerEl } = animatedEditorPlaceholderContainerRef
    const { current: dashboardDocumentCardsEl } = dashboardDocumentCardsRef
    const { current: editorContainerEl } = editorContainerRef

    if (
      !animatedEditorPlaceholderContainerEl
      || !dashboardDocumentCardsEl
      || !editorContainerEl
    ) {
      return
    }
    setShowMenu(true)


    const dashboardDocumentGridGap = getCssVariable('--dashboard-document-grid-gap')
    const dashboardDocumentSideLength = getCssVariable('--dashboard-document-side-length')
    const dashboardDocumentsElRect = dashboardDocumentCardsEl.getBoundingClientRect()

    const dashboardDocumentsOffsetLeft = dashboardDocumentsElRect.left
    const dashboardDocumentsOffsetTop = dashboardDocumentsElRect.top

    const dashboardDocumentCardsPerRow = Math.floor((dashboardDocumentsElRect.width + dashboardDocumentGridGap) / (dashboardDocumentGridGap + dashboardDocumentSideLength))

    const dashboardDocumentCardRow = Math.floor(currentDocumentIndex / dashboardDocumentCardsPerRow)
    const dashboardDocumentCardCol = Math.floor(currentDocumentIndex % dashboardDocumentCardsPerRow)

    const animateLeft = dashboardDocumentsOffsetLeft + (dashboardDocumentCardCol * (dashboardDocumentGridGap + dashboardDocumentSideLength))
    const animateTop = dashboardDocumentsOffsetTop + (dashboardDocumentCardRow * (dashboardDocumentGridGap + dashboardDocumentSideLength))

    animatedEditorPlaceholderContainerEl.style.opacity = '1'
    animatedEditorPlaceholderContainerEl.style.width = `${dashboardDocumentSideLength}px`
    animatedEditorPlaceholderContainerEl.style.height = `${dashboardDocumentSideLength}px`
    animatedEditorPlaceholderContainerEl.style.left = `${animateLeft}px`
    animatedEditorPlaceholderContainerEl.style.top = `${animateTop}px`


    const editorCloseAnimationTimeS = getCssVariable('--editor-close-animation-time')
    setTimeout(() => {
      // setShowEditor(false)
      editorContainerEl.style.display = 'none'

    }, editorCloseAnimationTimeS * 1000)
  }

  /**
   * Handler for click document card in menu
   */
  const handleDocumentCardClick = (index: number) => {
    // setShowEditor(true)
    setCurrentDocumentIndex(index)

    setTimeout(() => {

      const { current: animatedEditorPlaceholderContainerEl } = animatedEditorPlaceholderContainerRef
      const { current: dashboardDocumentCardsEl } = dashboardDocumentCardsRef
      const { current: editorContainerEl } = editorContainerRef

      if (
        !animatedEditorPlaceholderContainerEl
        || !dashboardDocumentCardsEl
        || !editorContainerEl
        ) {
        return
      }

      const dashboardDocumentGridGap = getCssVariable('--dashboard-document-grid-gap')
      const dashboardDocumentSideLength = getCssVariable('--dashboard-document-side-length')

      const dashboardDocumentsElRect = dashboardDocumentCardsEl.getBoundingClientRect()

      const dashboardDocumentsOffsetLeft = dashboardDocumentsElRect.left
      const dashboardDocumentsOffsetTop = dashboardDocumentsElRect.top

      const dashboardDocumentCardsPerRow = Math.floor((dashboardDocumentsElRect.width + dashboardDocumentGridGap) / (dashboardDocumentGridGap + dashboardDocumentSideLength))
      console.log(dashboardDocumentCardsPerRow)

      const dashboardDocumentCardRow = Math.floor(index / dashboardDocumentCardsPerRow)
      const dashboardDocumentCardCol = Math.floor(index % dashboardDocumentCardsPerRow)

      const startLeft = dashboardDocumentsOffsetLeft + (dashboardDocumentCardCol * (dashboardDocumentGridGap + dashboardDocumentSideLength))
      const startTop = dashboardDocumentsOffsetTop + (dashboardDocumentCardRow * (dashboardDocumentGridGap + dashboardDocumentSideLength))

      editorContainerEl.style.display = ''
      animatedEditorPlaceholderContainerEl.style.transition = 'none'
      animatedEditorPlaceholderContainerEl.style.left = `${startLeft}px`
      animatedEditorPlaceholderContainerEl.style.top = `${startTop}px`
      animatedEditorPlaceholderContainerEl.style.width = `${dashboardDocumentSideLength}px`
      animatedEditorPlaceholderContainerEl.style.height = `${dashboardDocumentSideLength}px`
      animatedEditorPlaceholderContainerEl.style.transition = ''

      setTimeout(() => {
        console.log(animatedEditorPlaceholderContainerEl.style.width)

        animatedEditorPlaceholderContainerEl.style.opacity = '1'
        animatedEditorPlaceholderContainerEl.style.width = `${window.innerWidth}px`
        animatedEditorPlaceholderContainerEl.style.height = `${window.innerHeight}px`
        animatedEditorPlaceholderContainerEl.style.left = '0'
        animatedEditorPlaceholderContainerEl.style.top = '0'

        const editorCloseAnimationTimeS = getCssVariable('--editor-close-animation-time')
        setTimeout(() => {
          animatedEditorPlaceholderContainerEl.style.opacity = '0'
          setShowMenu(false)
        }, editorCloseAnimationTimeS * 1000)
      }, 100)
    })
  }


  const renderDocumentCards = () => {
    return documents.map((document, index) => {
      return (

        <div className={styles.editorPlaceholderContainer}>
          <EditorPlaceholder
            key={index}
            title={''}
            rowsCount={document.rowsCount}
            onClick={() => handleDocumentCardClick(index)}
          />
        </div>
      )
    })
  }


  return (
    <main>

      {/* Menu */}
      <div className={styles.menu}>

        {/* Sidebar */}
        <div className={styles.menuSidebar}></div>

        {/* Dashboard (Where menu content is rendered) */}
        <div className={styles.menuDashboard}>

          {/* Notes */}
          <div ref={dashboardDocumentCardsRef} className={styles.dashboardDocumentCards}>
            {renderDocumentCards()}
          </div>

          {/* Settings */}
          {/* <div></div> */}
        </div>
      </div>


      {/* Editor */}
      {true && (

        <div className={styles.editorContainer} ref={editorContainerRef}>
          {!showMenu &&(
            <>
              <Header onMenuClick={handleShowMenu}/>
              <Editor content={documents[currentDocumentIndex].content}/>
            </>
          )}

          <div ref={animatedEditorPlaceholderContainerRef} className={styles.animatedEditorPlaceholderContainer}>
            <EditorPlaceholder rowsCount={documents[currentDocumentIndex].rowsCount}/>
          </div>
        </div>

      )}

    </main>
  )
}

export default IndexPage;