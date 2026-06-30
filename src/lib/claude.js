// Claude API integration (claude-sonnet-4-6, called directly from the browser).
// Powers passage explanations and the daily devotional line.
// Gracefully falls back to thoughtful offline content when no API key is set.

const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

async function callClaude({ apiKey, system, user, maxTokens = 320 }) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required to call the Anthropic API from a browser context.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) {
    let detail = ''
    try {
      const err = await res.json()
      detail = err?.error?.message || ''
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Anthropic API error ${res.status}`)
  }
  const data = await res.json()
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
}

const EXPLAIN_SYSTEM =
  'You are a warm, wise Bible study companion. Given a passage, write a concise, ' +
  'thoughtful explanation in exactly 2–3 sentences. First illuminate the core ' +
  'theological meaning, then offer one grounded, practical application for daily life. ' +
  'Be encouraging and clear; avoid clichés, jargon, and headings. Write as flowing prose, ' +
  'no labels, no markdown.'

const DEVO_SYSTEM =
  'You write a single luminous, hope-filled devotional line inspired by a Bible passage — ' +
  'the kind of sentence someone would want on their lock screen. One sentence, under 22 words, ' +
  'evocative but never cheesy. Return only the line itself, with no quotation marks, no attribution.'

export async function generateExplanation({ apiKey, reference, text }) {
  if (apiKey) {
    return callClaude({
      apiKey,
      system: EXPLAIN_SYSTEM,
      user: `Passage: ${reference}\n\n"${text}"\n\nExplain this passage.`,
      maxTokens: 320,
    })
  }
  return offlineExplanation(reference, text)
}

export async function generateDevotional({ apiKey, reference, theme }) {
  if (apiKey) {
    return callClaude({
      apiKey,
      system: DEVO_SYSTEM,
      user: `Passage: ${reference}${theme ? ` (theme: ${theme})` : ''}. Write today's devotional line.`,
      maxTokens: 60,
    })
  }
  return offlineDevotional(reference, theme)
}

export async function testApiKey(apiKey) {
  await callClaude({
    apiKey,
    system: 'Reply with the single word: ok',
    user: 'ping',
    maxTokens: 8,
  })
  return true
}

// ---------- Offline fallbacks (used when no API key is configured) ----------

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function offlineExplanation(reference, text) {
  const opener = (text || '').split(/[.!?]/)[0].trim()
  const templates = [
    `At its heart, ${reference} reminds us that God meets us exactly where we are — not where we pretend to be. The invitation here is to bring your real self to him. Today, let this passage slow you down enough to actually receive what it offers rather than rushing past it.`,
    `${reference} points beyond circumstances to the unchanging character of God. The truth it carries doesn't depend on how your day is going; it rests on who he is. Carry one line of it with you today and let it reframe a moment that would otherwise unsettle you.`,
    `This passage holds together comfort and challenge: it assures us of God's nearness while calling us to respond in trust. That tension is where real faith grows. Choose one small, concrete way to live out its truth before the day ends.`,
    `In ${reference}, grace and invitation meet — God gives freely, and asks us to receive with open hands. The practical move is to stop striving long enough to trust. Let the opening words, "${opener}," settle into a single prayer today.`,
  ]
  return new Promise((resolve) =>
    setTimeout(() => resolve(templates[hash(reference) % templates.length]), 650),
  )
}

function offlineDevotional(reference, theme) {
  const lines = [
    'Grace arrives before you ask, and stays longer than you deserve.',
    'You are held by the One who holds the stars — rest in that today.',
    'The smallest light still undoes the oldest darkness.',
    'His mercies are new this morning, made fresh for exactly this day.',
    'Let go of the map; trust the hand that already knows the way.',
    'Peace is not the absence of the storm but the presence within it.',
    'You are not too far, too late, or too much for the love of God.',
    'Wherever you are, he is already there, waiting to be found.',
  ]
  const key = hash((reference || '') + (theme || ''))
  return new Promise((resolve) => setTimeout(() => resolve(lines[key % lines.length]), 500))
}
