import { useCallback, useEffect, useRef, useState } from "react";

type EditorInputProps = {
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
  body,
  selection,
  onChange,
  onSelectionChange,
}: EditorInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Textarea OnChange event handler.
   */
  const handleChange = useCallback(({ target: { value } }) => {
    onChange(value);
  }, [onChange]);

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
      onChange={handleChange}
      value={body}
      ref={textareaRef}
    ></textarea>
  );
}

export default EditorInput