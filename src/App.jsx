import { useState, useRef, useEffect } from 'react';
import TextPanel from './components/TextPanel';
import WordTags from './components/WordTags';
import ExplanationPanel from './components/ExplanationPanel';
import HistoryList from './components/HistoryList';
import ReviewPage from './components/ReviewPage';
import SettingsModal from './components/SettingsModal';
import { explainWords } from './lib/ai-client';
import { loadSettings, loadRecords, addRecord } from './lib/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('query');
  const [showSettings, setShowSettings] = useState(false);

  const [selectedWords, setSelectedWords] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [records, setRecords] = useState(loadRecords);
  const [highlightId, setHighlightId] = useState(null);
  const [scrollToId, setScrollToId] = useState(null);

  const textPanelRef = useRef(null);

  useEffect(() => {
    if (!scrollToId) return;
    setActiveTab('query');
    const timer = setTimeout(() => {
      const el = document.getElementById(`hist-${scrollToId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightId(scrollToId);
        setTimeout(() => setHighlightId(null), 2000);
      }
      setScrollToId(null);
    }, 120);
    return () => clearTimeout(timer);
  }, [scrollToId]);

  function handleWordsSelected(words) {
    setSelectedWords(words);
  }

  function handleRemoveWord(word) {
    // Remove matching <mark> from the text panel DOM
    const editorEl = document.querySelector('.text-panel-editor');
    if (editorEl) {
      const marks = editorEl.querySelectorAll('mark');
      for (const m of marks) {
        if (m.textContent.trim() === word) {
          m.replaceWith(document.createTextNode(m.textContent));
          editorEl.normalize();
          break;
        }
      }
    }
    setSelectedWords((prev) => prev.filter((w) => w !== word));
  }

  async function handleAnalyze() {
    if (!selectedWords.length) return;
    const originalText = textPanelRef.current?.getText() || '';
    if (!originalText) return;
    const settings = loadSettings();
    setLoading(true);
    setError('');
    try {
      const results = await explainWords(settings, originalText, selectedWords);
      const sorted = [...results].sort((a, b) => {
        return originalText.indexOf(a.word) - originalText.indexOf(b.word);
      });
      setExplanations(sorted);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleModify() {
    setExplanations([]);
    setError('');
  }

  function handleSave() {
    if (!explanations.length) return;
    const originalText = textPanelRef.current?.getText() || '';
    addRecord(originalText, explanations);
    setRecords(loadRecords());
    textPanelRef.current?.reset();
    setSelectedWords([]);
    setExplanations([]);
    setError('');
  }

  function handleClear() {
    textPanelRef.current?.reset();
    setSelectedWords([]);
    setExplanations([]);
    setError('');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-dark)', marginRight: 20 }}>
            VocabMine
          </span>
          <button className={`nav-tab ${activeTab === 'query' ? 'active' : ''}`} onClick={() => setActiveTab('query')}>
            Query
          </button>
          <button className={`nav-tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
            Review
          </button>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text2)', padding: '4px 8px' }}
          title="Settings"
        >
          ⚙
        </button>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
        {activeTab === 'query' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>Original text</div>
                <TextPanel ref={textPanelRef} onWordsSelected={handleWordsSelected} />
                <WordTags words={selectedWords} onRemove={handleRemoveWord} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>Explanations</div>
                <ExplanationPanel explanations={explanations} loading={loading} error={error} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-analyze"
                onClick={handleAnalyze}
                disabled={loading || !selectedWords.length}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
              <button
                className="btn btn-modify"
                onClick={handleModify}
                disabled={!explanations.length}
              >
                Modify
              </button>
              <button
                className="btn btn-save"
                onClick={handleSave}
                disabled={!explanations.length}
              >
                Save
              </button>
              <button className="btn btn-clear" onClick={handleClear}>
                Clear
              </button>
            </div>

            {records.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ borderTop: '1px solid var(--border)', marginBottom: 20 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 14 }}>
                  Query history
                </div>
                <HistoryList records={records} highlightId={highlightId} />
              </div>
            )}
          </>
        )}

        {activeTab === 'review' && (
          <ReviewPage records={records} onJumpToRecord={(id) => setScrollToId(id)} />
        )}
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onRecordsChange={() => setRecords(loadRecords())}
        />
      )}
    </div>
  );
}
