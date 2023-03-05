import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DocumentFile } from "./Editor.types";

type EditorInputProps = {
  documentFile: DocumentFile;
  body: string;
  selection: {
    start: number;
    end: number;
  };
  onChange: (value: string) => void;
  onSelectionChange?: (
    selectionStart: number,
    selectionEnd: number,
  ) => void;
}

const EditorInput = ({
  documentFile,
  body,
  selection,
  onChange,
  onSelectionChange,
}: EditorInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getRowBySelectionIndex = useCallback((selectionIndex: number) => {

  }, [])

  const selectionIndexHasStyles = useCallback((selectionIndex: number) => {
    documentFile
  }, []);

  /**
   * Textarea OnChange event handler.
   */
  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLTextAreaElement>,
    selectionOnCapture: EditorInputProps['selection']
  ) => {
    console.log('selectionOnCapture',selectionOnCapture)

    if (selectionOnCapture.start === selectionOnCapture.end) {

    }

    onChange(event.target.value);
  }, [onChange, body]);

  /**
   * Textarea OnSelectionChange event handler.
   */
  const handleSelectionChange = useCallback(({ target }) => {
    const { current: textareaEl } = textareaRef;
    if (!textareaEl) {
      return;
    }

    if (onSelectionChange) {
      const { selectionStart, selectionEnd } = target;
      onSelectionChange(selectionStart, selectionEnd);
    }
  }, [onSelectionChange]);

  /**
   * Set textarea selection when selection prop changes.
   */
  useEffect(() => {
    const { current: textareaEl } = textareaRef;
    if (!textareaEl) {
      return;
    }

    const start = Math.min(selection.start, selection.end)
    const end = Math.max(selection.start, selection.end)

    textareaEl.setSelectionRange(start, end);
    textareaEl.focus()
  }, [selection, textareaRef]);

  return (
    <textarea
      onSelect={handleSelectionChange}
      onChange={(event) => handleChange(event, selection)}
      value={body}
      ref={textareaRef}
    ></textarea>
  );
}

export default EditorInput