import { useCallback, useMemo, useState } from "react";
import { DocumentFile, DocumentFileRowSectionStyles } from "./Editor.types";
import EditorInput from "./EditorInput";
import EditorRenderer from "./EditorRenderer";
import Settings from './EditorSettings';

const Editor = () => {
  const [currentStyles, setCurrentStyles] = useState<DocumentFileRowSectionStyles>(Settings.defaultStyles);

  // Mock data.
  const [documentFile, setDocumentFile] = useState<DocumentFile>({
    rows: [
      [
        {
          fontSize: 24,
          fontFamily: 'arial',
          fontStyle: 'normal',
          content: 'abc',
        }
      ],
      [
        {
          fontSize: 24,
          fontFamily: 'arial',
          fontStyle: 'normal',
          content: 'abcdefghiklm',
        }
      ],
      [
        {
          fontSize: 24,
          fontFamily: 'arial',
          fontStyle: 'normal',
          content: '',
        }
      ],
      [
        {
          fontSize: 24,
          fontFamily: 'arial',
          fontStyle: 'normal',
          content: 'abc d',
        }
      ],
      [
        {
          fontSize: 24,
          fontFamily: 'arial',
          fontStyle: 'normal',
          content: '123 456 89',
        }
      ],
      [
        {
          fontSize: 24,
          fontFamily: 'arial',
          fontStyle: 'normal',
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
  const handleEditorInput = useCallback((value: string) => {
    setEditorContent(value);
  }, [setEditorContent]);

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