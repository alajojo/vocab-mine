import { useRef, useState, useImperativeHandle, forwardRef } from 'react';

const TextPanel = forwardRef(function TextPanel({ onWordsSelected }, ref) {
  const editorRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const textRef = useRef('');

  useImperativeHandle(ref, () => ({
    getText: () => textRef.current,
    reset: () => {
      textRef.current = '';
      setLocked(false);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        editorRef.current.contentEditable = 'true';
        editorRef.current.style.cursor = '';
      }
    },
  }));

  function handleClick() {
    if (!locked) editorRef.current.focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text.trim()) return;
    textRef.current = text;
    const el = editorRef.current;
    el.innerText = text;
    el.contentEditable = 'false';
    el.style.cursor = 'crosshair';
    setLocked(true);
  }

  function handleMouseUp() {
    if (!locked) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const el = editorRef.current;
    if (!el.contains(range.commonAncestorContainer)) return;

    const selectedText = range.toString().trim();
    if (!selectedText) { selection.removeAllRanges(); return; }

    try {
      if (
        range.startContainer === range.endContainer &&
        range.startContainer.nodeType === Node.TEXT_NODE
      ) {
        const mark = document.createElement('mark');
        range.surroundContents(mark);
      } else {
        const mark = document.createElement('mark');
        const fragment = range.extractContents();
        mark.textContent = fragment.textContent;
        range.insertNode(mark);
        el.normalize();
      }
    } catch (_) {
      // ignore selection errors
    }

    selection.removeAllRanges();

    // Collect unique marked words in document order
    const marks = el.querySelectorAll('mark');
    const seen = new Set();
    const words = [];
    for (const m of marks) {
      const w = m.textContent.trim();
      if (w && !seen.has(w)) {
        seen.add(w);
        words.push(w);
      }
    }
    onWordsSelected(words);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={editorRef}
        className="panel text-panel-editor"
        contentEditable={locked ? 'false' : 'true'}
        suppressContentEditableWarning
        onClick={handleClick}
        onPaste={handlePaste}
        onMouseUp={handleMouseUp}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          fontSize: 14,
          color: 'var(--text)',
        }}
      />
      {!locked && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 16,
            color: 'var(--text3)',
            fontStyle: 'italic',
            fontSize: 14,
            pointerEvents: 'none',
            lineHeight: 1.7,
          }}
        >
          Paste English text here, then drag to select words...
        </div>
      )}
    </div>
  );
});

export default TextPanel;
