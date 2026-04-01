export default function ExplanationPanel({ explanations, loading, error }) {
  if (loading) {
    return (
      <div className="panel panel-surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text3)', fontSize: 14 }}>Analyzing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel panel-surface" style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ color: 'var(--word)', fontSize: 13, padding: 4 }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="panel panel-surface">
      {explanations.length === 0 ? (
        <div style={{ color: 'var(--text3)', fontSize: 14, fontStyle: 'italic' }}>
          Explanations will appear here after analysis.
        </div>
      ) : (
        explanations.map((item) => (
          <div key={item.word} className="vocab-row">
            <div className="vocab-word">{item.word}</div>
            <div className="vocab-explanation">{item.explanation}</div>
          </div>
        ))
      )}
    </div>
  );
}
