const SYSTEM_PROMPT = `You are a vocabulary assistant for a Chinese English learner.

Your job: explain English words/phrases based on how they are used IN THE GIVEN PASSAGE.

Rules:
1. Give a concise Chinese explanation (中文释义), 10 characters or fewer when possible.
2. Explain what the word means IN THIS SPECIFIC CONTEXT, not a generic dictionary definition.
3. If helpful, add a very brief clarification after the core meaning (still in Chinese).
4. Return JSON array ONLY, no markdown, no extra text.
5. Keep the EXACT order the words appear in the text.

Response format:
[
  {"word": "exact word from text", "explanation": "中文释义"},
  {"word": "another word", "explanation": "中文释义，简短补充"}
]`;

function buildUserPrompt(originalText, words) {
  return `Text:\n"""\n${originalText}\n"""\n\nWords to explain:\n${words.join(', ')}\n\nReturn JSON array only.`;
}

function parseResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

// Default base URLs — used when the user leaves Base URL empty
const DEFAULT_BASE_URLS = {
  anthropic: 'https://api.anthropic.com',
  openai: 'https://api.openai.com',
  deepseek: 'https://api.deepseek.com',
};

async function callAnthropic(base, apiKey, model, userPrompt) {
  const response = await fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return parseResponse(data.content[0].text);
}

async function callOpenAICompatible(base, apiKey, model, userPrompt) {
  const response = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return parseResponse(data.choices[0].message.content);
}

export async function explainWords({ provider, model, apiKey, baseUrl }, originalText, words) {
  const base = (baseUrl && baseUrl.trim()) || DEFAULT_BASE_URLS[provider] || '';
  const userPrompt = buildUserPrompt(originalText, words);

  if (provider === 'anthropic') {
    return callAnthropic(base, apiKey, model, userPrompt);
  } else {
    // openai, deepseek, custom — all use OpenAI-compatible format with Bearer auth
    return callOpenAICompatible(base, apiKey, model, userPrompt);
  }
}

export async function testConnection(settings) {
  return explainWords(settings, 'Hello world', ['Hello']);
}
