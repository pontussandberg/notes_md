/**
 * # This page render the text editor.
 *
 * Path query includes id of current document
 * - `edit/:documentId`
 *
 *
 */


 import { useRouter } from 'next/router'
 import styles from '../css/edit.module.css'

 import Editor from "../components/Editor"
 import EditorHeader from "../components/EditorHeader"
 import { DocumentFile } from '../types'
 import { useState } from 'react'
 // import MarkdownRenderer from "../components/MarkdownRenderer"

 type EditPageProps = {
   documents: DocumentFile[]
   setDocuments: (docs: DocumentFile[]) => void
 }

 const EditPage = ({
   documents,
   setDocuments,
 }: EditPageProps): JSX.Element => {
   const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(true)

   const router = useRouter()
   const { pid: documentId } = router.query

   const redirect404 = () => {
     router.pathname = '/404'
   }

   const redirectMarkdownRenderer = (documentId: string) => {
     router.pathname = `/markdown${documentId}`
   }

   /**
    * Handler for when document updates
    */
   const handleDocumentUpdate = (document: DocumentFile, documentId: string) => {
     const docsClone = [...documents]

     const documentIndex = docsClone.findIndex(doc => doc.id === documentId)

     // Replace current document with update values
     docsClone[documentIndex] = {
       ...docsClone[documentIndex],
       ...document
     }

     // Set in state
     setDocuments(docsClone)
   }

   const renderDocument = (document: DocumentFile, documentId: string) => {
     return (
       <div className={styles.documentViewer__editorContainer}>
         <EditorHeader
           title={document.title}
           drawerOpen={isMenuDrawerOpen}
           onDrawerToggleClick={() => setIsMenuDrawerOpen(!isMenuDrawerOpen)}
           toggleShowMarkdownRenderer={() => redirectMarkdownRenderer(documentId)}
         />

         <Editor
           content={document.content}
           onDocumentUpdate={() => handleDocumentUpdate(document, documentId)}
         />
       </div>
     )

       {/*
       {
       showMarkdownRenderer
         ? <MarkdownRenderer markdownText={getCurrentDocument().content}/>
         : <Editor key={currentDocumentIndex}content={getCurrentDocument().content}onDocumentUpdate={handleDocumentUpdate}/>
       }
       */}
   }

   /**
    * RENDER
    */
   if (
     documentId
     && !Array.isArray(documentId)
   ) {


     const document = documents.find(doc => doc.id === documentId)

     if (!document) {
       redirect404()
       return <></>
     }

     return renderDocument(document, documentId)
   }

   return <></>
 }

 export default EditPage