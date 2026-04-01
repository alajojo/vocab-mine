const SETTINGS_KEY = 'vocabmine_settings';
const RECORDS_KEY = 'vocabmine_records';

export const DEFAULT_SETTINGS = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKey: '',
  baseUrl: '',
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function addRecord(originalText, wordsWithExplanations) {
  const records = loadRecords();
  const id = `rec_${Date.now()}`;
  const words = wordsWithExplanations.map((w) => ({
    word: w.word,
    explanation: w.explanation,
    position: originalText.indexOf(w.word),
  }));
  const record = {
    id,
    createdAt: new Date().toISOString(),
    originalText,
    words,
  };
  records.unshift(record);
  saveRecords(records);
  return record;
}

export function exportRecords() {
  const records = loadRecords();
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vocab-mine-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importRecords(jsonArray) {
  if (!Array.isArray(jsonArray)) throw new Error('Invalid format: expected an array');
  for (const item of jsonArray) {
    if (!item.id || !item.originalText || !Array.isArray(item.words)) {
      throw new Error('Invalid record structure');
    }
  }
  saveRecords(jsonArray);
  return jsonArray;
}
