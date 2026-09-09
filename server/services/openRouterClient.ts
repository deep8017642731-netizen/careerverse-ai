// ============================================================
// CareerVerse AI — OpenRouter AI Client
// Model: inclusionai/ling-3.0-flash-fin:free
// ============================================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'inclusionai/ling-3.0-flash-fin:free';

export async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY;
  if (apiKey) {
    return callOpenRouterApi(apiKey, systemPrompt, userPrompt);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return callGeminiApi(geminiKey, systemPrompt, userPrompt);
  }

  throw new Error('No AI provider is configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY.');
}

async function callOpenRouterApi(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://careerverse.ai',
      'X-Title': 'CareerVerse AI',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '{}';
}

async function callGeminiApi(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '{}';
}
