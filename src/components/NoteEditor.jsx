import React, { useEffect, useCallback } from 'react';
import { highlightGlossary } from '../utils/glossary';
import { debounce } from '../utils/helpers';

function NoteEditor({ note, onChange, editorRef }) {
  // Debounced save to prevent too frequent updates
  const debouncedSave = useCallback(
    debounce((content) => {
      if (onChange && typeof onChange === 'function') {
        onChange(note.id, content);
      }
    }, 500),
    [note.id, onChange]
  );

  useEffect(() => {
    if (editorRef.current && note && !note.encrypted) {
      // Only update if content has changed to prevent cursor jumps
      if (editorRef.current.innerHTML !== note.content) {
        const highlighted = highlightGlossary(note.content);
        editorRef.current.innerHTML = highlighted;
      }
    }
  }, [note?.id]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    debouncedSave(content);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const fragment = document.createRange().createContextualFragment(text);
    range.deleteContents();
    range.insertNode(fragment);
    
    // Move cursor to end of pasted content
    range.setStartAfter(fragment);
    range.setEndAfter(fragment);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleKeyDown = (e) => {
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  return (
    <div
      ref={editorRef}
      className="note-editor"
      contentEditable={!note.encrypted}
      onInput={handleInput}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      spellCheck={true}
      data-placeholder="Start writing..."
    ></div>
  );
}

export default NoteEditor;
