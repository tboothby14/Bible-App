// Passage resolution. Local-first (instant, offline-safe); falls back to the
// free bible-api.com (World English Bible) for references not in the library.

import { PASSAGES } from '../data/bibleText.js'

const remoteCache = {}

export async function fetchPassage(ref) {
  // 1. Local library — instant and always available.
  if (PASSAGES[ref]) {
    return { ...PASSAGES[ref], translation: 'WEB', source: 'local' }
  }
  // 2. Session cache for previously-fetched remote passages.
  if (remoteCache[ref]) return remoteCache[ref]

  // 3. Live fetch for custom / unknown references.
  try {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(ref)}?translation=web`,
    )
    if (res.ok) {
      const data = await res.json()
      if (data.verses?.length) {
        const passage = {
          reference: data.reference || ref,
          book: data.verses[0]?.book_name || ref.split(/\s*\d/)[0].trim(),
          verses: data.verses.map((v) => ({ n: v.verse, t: (v.text || '').trim() })),
          translation: 'WEB',
          source: 'remote',
        }
        remoteCache[ref] = passage
        return passage
      }
    }
  } catch {
    /* offline or blocked — fall through */
  }

  // 4. Graceful placeholder.
  return {
    reference: ref,
    book: ref.split(/\s*\d/)[0].trim(),
    verses: [{ n: 1, t: 'Passage text is unavailable offline. Connect to load this reading.' }],
    translation: 'WEB',
    source: 'missing',
  }
}
