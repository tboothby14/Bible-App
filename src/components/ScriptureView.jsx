import { useApp } from '../context/AppContext.jsx'

function parseRef(reference) {
  const m = reference.match(/^([\d\s]*[A-Za-z][A-Za-z\s]*?)\s+(\d+)/)
  return { book: m ? m[1].trim() : reference, chapter: m ? m[2] : '' }
}

export default function ScriptureView({ passage }) {
  const { isFavorite, toggleFavorite } = useApp()
  if (!passage) return null
  const { book, chapter } = parseRef(passage.reference)

  return (
    <div className="scripture" aria-label={`${passage.reference} scripture text`}>
      {passage.verses.map((v) => {
        const verseRef = chapter ? `${book} ${chapter}:${v.n}` : `${passage.reference}:${v.n}`
        const fav = isFavorite(verseRef, v.t)
        return (
          <span
            key={v.n}
            className={`verse-span ${fav ? 'fav' : ''}`}
            onClick={() => toggleFavorite({ reference: verseRef, text: v.t })}
            title={fav ? 'Remove from favorites' : 'Tap to save this verse'}
            style={{ cursor: 'pointer' }}
          >
            <span className="vnum">{v.n}</span>
            {v.t}{' '}
          </span>
        )
      })}
    </div>
  )
}
