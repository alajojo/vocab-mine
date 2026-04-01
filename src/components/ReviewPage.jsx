export default function ReviewPage({ records, onJumpToRecord }) {
  // Flatten all words from all records, deduplicated by word text
  const allWords = [];
  const seen = new Set();
  for (const rec of records) {
    for (const w of rec.words) {
      if (!seen.has(w.word)) {
        seen.add(w.word);
        allWords.push({ ...w, recordId: rec.id });
      }
    }
  }

  if (!allWords.length) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
        No vocabulary yet. Start by analyzing some text in the Query tab.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 20px', gap: 12, padding: '6px 8px', borderBottom: '2px solid var(--border)', marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>WORD</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>EXPLANATION</div>
        <div />
      </div>
      {allWords.map((item) => (
        <div
          key={item.word}
          onClick={() => onJumpToRecord(item.recordId)}
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr 20px',
            gap: 12,
            padding: '8px 8px',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
          onMouseLeave={(e) => e.currentTarget.style.background = ''}
        >
          <div className="vocab-word">{item.word}</div>
          <div className="vocab-explanation">{item.explanation}</div>
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>→</div>
        </div>
      ))}
    </div>
  );
}
