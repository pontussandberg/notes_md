import { useCallback, useState } from "react";
import EditorInput from "./EditorInput";
import EditorRenderer from "./EditorRenderer";

const Editor = () => {
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
        body={editorContent}
        selection={selection}
        onSelectionChange={handleRendererSelectionChange}
      />
    </>
  )
}

export default Editor