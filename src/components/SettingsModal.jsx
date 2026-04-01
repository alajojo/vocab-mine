import { useState, useEffect, useRef } from 'react';
import { loadSettings, saveSettings, exportRecords, importRecords, loadRecords } from '../lib/storage';
import { testConnection } from '../lib/ai-client';

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'custom', label: 'Custom' },
];

const BASE_URL_PLACEHOLDERS = {
  anthropic: 'https://api.anthropic.com',
  openai: 'https://api.openai.com',
  deepseek: 'https://api.deepseek.com',
  custom: 'Enter your API endpoint',
};

export default function SettingsModal({ onClose, onRecordsChange }) {
  const [form, setForm] = useState(loadSettings());
  const [status, setStatus] = useState('');
  const [testing, setTesting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSave() {
    saveSettings(form);
    setStatus('Settings saved.');
    setTimeout(() => setStatus(''), 2000);
  }

  async function handleTest() {
    setTesting(true);
    setStatus('Testing...');
    try {
      await testConnection(form);
      setStatus('Connection successful!');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setTesting(false);
    }
  }

  function handleExport() {
    exportRecords();
  }

  function handleImportClick() {
    fileInputRef.current.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      importRecords(json);
      onRecordsChange?.();
      setStatus(`Imported ${json.length} records.`);
    } catch (err) {
      setStatus(`Import failed: ${err.message}`);
    }
    e.target.value = '';
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(30,46,26,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380,
          background: 'var(--bg)',
          borderRadius: 14,
          padding: '24px 28px',
          boxShadow: '0 8px 32px rgba(30,46,26,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Settings</div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>API Provider</label>
          <select className="settings-select" value={form.provider} onChange={(e) => handleChange('provider', e.target.value)}>
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Model name</label>
          <input
            className="settings-input"
            type="text"
            placeholder="claude-sonnet-4-20250514"
            value={form.model}
            onChange={(e) => handleChange('model', e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>API Key</label>
          <input
            className="settings-input"
            type="password"
            placeholder="sk-..."
            value={form.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Base URL (optional)</label>
          <input
            className="settings-input"
            type="text"
            placeholder={BASE_URL_PLACEHOLDERS[form.provider] ?? 'Enter your API endpoint'}
            value={form.baseUrl}
            onChange={(e) => handleChange('baseUrl', e.target.value)}
          />
        </div>

        {status && (
          <div style={{ fontSize: 13, color: status.startsWith('Error') ? 'var(--word)' : 'var(--accent-dark)', padding: '6px 10px', background: 'var(--surface)', borderRadius: 6 }}>
            {status}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-analyze" onClick={handleSave}>Save</button>
          <button className="btn btn-modify" onClick={handleTest} disabled={testing}>
            {testing ? 'Testing...' : 'Test connection'}
          </button>
          <button className="btn btn-clear" onClick={onClose}>Close</button>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', gap: 8 }}>
          <button className="btn" style={{ background: 'var(--text2)', boxShadow: '0 2px 8px rgba(90,125,80,0.3)' }} onClick={handleExport}>
            Export data
          </button>
          <button className="btn" style={{ background: 'var(--text2)', boxShadow: '0 2px 8px rgba(90,125,80,0.3)' }} onClick={handleImportClick}>
            Import data
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
