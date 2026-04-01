export default function HistoryList({ records, highlightId }) {
  if (!records.length) {
    return (
      <div style={{ color: 'var(--text3)', fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
        No saved records yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {records.map((rec) => (
        <div
          key={rec.id}
          id={`hist-${rec.id}`}
          style={{
            border: `1px solid ${highlightId === rec.id ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 10,
            background: 'var(--bg)',
            padding: '12px 16px',
            transition: 'border-color 0.3s',
          }}
        >
          <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 8, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {rec.originalText}
          </div>
          <div>
            {rec.words.map((w) => (
              <div key={w.word} className="vocab-row">
                <div className="vocab-word">{w.word}</div>
                <div className="vocab-explanation">{w.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
