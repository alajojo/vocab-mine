export default function WordTags({ words, onRemove }) {
  if (!words.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {words.map((word) => (
        <span key={word} className="word-pill">
          {word}
          <button onClick={() => onRemove(word)} aria-label={`Remove ${word}`}>×</button>
        </span>
      ))}
    </div>
  );
}
