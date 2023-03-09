import { useCallback, useMemo, useState } from "react";
import { DocumentFile, DocumentFileRowSectionStyles } from "./Editor.types";
import EditorInput from "./EditorInput";
import EditorRenderer from "./EditorRenderer";
import Settings from './editorSettings';

const Editor = () => {
  const [currentStyles, setCurrentStyles] = useState<DocumentFileRowSectionStyles>(Settings.defaultStyles);

  // Mock data.
  const [documentFile, setDocumentFile] = useState<DocumentFile>({
    rows: [
      [
        {
          style: {
            fontSize: 24,
            fontFamily: 'arial',
            fontStyle: 'normal',
            letterSpacing: 0.4,
          },
          content: 'abc',
        }
      ],
      [
        {
          style: {
            fontSize: 40,
            fontFamily: 'arial',
            fontStyle: 'normal',
            letterSpacing: 0.4,
          },
          content: 'abcdefghiklm',
        }
      ],
      [
        {
          style: {
            fontSize: 24,
            fontFamily: 'arial',
            fontStyle: 'normal',
            letterSpacing: 0.4,
          },
          content: '',
        }
      ],
      [
        {
          style: {
            fontSize: 24,
            fontFamily: 'arial',
            fontStyle: 'normal',
            letterSpacing: 0.4,
          },
          content: 'abc d',
        }
      ],
      [
        {
          style: {
            fontSize: 24,
            fontFamily: 'arial',
            fontStyle: 'normal',
            letterSpacing: 0.4,
          },
          content: '123 456 89',
        }
      ],
      [
        {
          style: {
            fontSize: 24,
            fontFamily: 'arial',
            fontStyle: 'normal',
            letterSpacing: 0.4,
          },
          content: '123 45 6 77777',
        }
      ],
    ],
  });

  const documentFileBody = useMemo(() => {
    return documentFile.rows.map(row => {
      return row.map(rowSection => rowSection.content).join('')
    }).join('\n')
  }, [documentFile.rows])

  const [editorContent, setEditorContent] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0});


  // #############################################################################
  // # EditorRenderer
  // #############################################################################
  /**
   * Renderer SelectionChange event handler.
   */
  const handleRendererSelectionChange = useCallback((
    start: number,
    end: number,
  ) => {
    setSelection({start, end});
  }, [setSelection])


  // #############################################################################
  // # EditorInput (Textarea)
  // #############################################################################
  /**
   * Textarea OnChange event handler.
   */
  const handleEditorInput = useCallback((rows: DocumentFile['rows']) => {
    console.log('documentFile',documentFile.rows[0])
    console.log('documentFile',rows[0])
    setDocumentFile({
      ...documentFile,
      rows,
    });
    // setEditorContent(value);
  }, [documentFile]);

  /**
   * Textarea SelectionChange event handler.
   */
  const handleTextareaSelectionChange = useCallback((
    start: number,
    end: number,
  ) => {
    setSelection({start, end});
  }, [setSelection]);

  return (
    <>
      <EditorInput
        documentFile={documentFile}
        body={editorContent}
        selection={selection}
        onChange={handleEditorInput}
        onSelectionChange={handleTextareaSelectionChange}
      />
      <EditorRenderer
        documentFile={documentFile}
        body={editorContent}
        selection={selection}
        onSelectionChange={handleRendererSelectionChange}
      />
    </>
  )
}

export default Editor