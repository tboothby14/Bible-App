import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, Share2, Plus, X, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { EmptyState } from '../components/ui.jsx'
import ShareSheet from '../components/ShareSheet.jsx'
import { formatShort } from '../lib/dates.js'

export default function Favorites() {
  const app = useApp()
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [share, setShare] = useState(null)

  const allTags = useMemo(() => {
    const set = new Set()
    app.favorites.forEach((f) => f.tags.forEach((t) => set.add(t)))
    return [...set].sort()
  }, [app.favorites])

  const filtered = app.favorites.filter((f) => {
    const matchTag = !activeTag || f.tags.includes(activeTag)
    const matchQuery =
      !query ||
      f.reference.toLowerCase().includes(query.toLowerCase()) ||
      f.text.toLowerCase().includes(query.toLowerCase())
    return matchTag && matchQuery
  })

  return (
    <div className="flow">
      <ShareSheet open={!!share} onClose={() => setShare(null)} verse={share} />

      <div className="card card-pad row" style={{ gap: 16, justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 16 }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--grad-warm)', color: '#fff' }}><Heart size={22} fill="#fff" /></span>
          <div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>{app.favorites.length}</div>
            <div className="muted" style={{ fontSize: '0.84rem' }}>verses you’ve treasured</div>
          </div>
        </div>
      </div>

      <div className="search-wrap">
        <Search size={17} />
        <input className="input" placeholder="Search favorites…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {allTags.length > 0 && (
        <div className="row wrap" style={{ gap: 8 }}>
          <button className={`chip chip-btn ${!activeTag ? 'active' : ''}`} onClick={() => setActiveTag(null)}>All</button>
          {allTags.map((t) => (
            <button key={t} className={`chip chip-btn ${activeTag === t ? 'active' : ''}`} onClick={() => setActiveTag(activeTag === t ? null : t)}>
              <Tag size={12} /> {t}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon={Heart} title="No favorites yet">
            Tap any verse while reading to save it here, with tags to organize what speaks to you.
          </EmptyState>
        </div>
      ) : (
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          <AnimatePresence>
            {filtered.map((f) => (
              <FavCard key={f.id} fav={f} onShare={() => setShare({ reference: f.reference, text: f.text })} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function FavCard({ fav, onShare }) {
  const { removeFavorite, addFavoriteTag, removeFavoriteTag } = useApp()
  const [adding, setAdding] = useState(false)
  const [tag, setTag] = useState('')

  const submit = () => {
    if (tag.trim()) addFavoriteTag(fav.id, tag)
    setTag('')
    setAdding(false)
  }

  return (
    <motion.div
      layout
      className="card card-pad card-hover"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="row-between" style={{ marginBottom: 10 }}>
        <div className="gradient-text" style={{ fontWeight: 750, fontSize: '0.98rem' }}>{fav.reference}</div>
        <div className="row" style={{ gap: 4 }}>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={onShare} title="Share"><Share2 size={15} /></button>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => removeFavorite(fav.id)} title="Remove">
            <Heart size={15} fill="var(--accent-gold)" style={{ color: 'var(--accent-gold)' }} />
          </button>
        </div>
      </div>
      <p className="font-serif" style={{ fontSize: '1rem', lineHeight: 1.55, color: 'var(--text-soft)', flex: 1 }}>{fav.text}</p>
      <div className="row wrap" style={{ gap: 6, marginTop: 14 }}>
        {fav.tags.map((t) => (
          <span key={t} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {t}
            <button onClick={() => removeFavoriteTag(fav.id, t)} style={{ display: 'grid', placeItems: 'center', color: 'inherit', opacity: 0.7 }}><X size={11} /></button>
          </span>
        ))}
        {adding ? (
          <input
            className="input"
            style={{ width: 110, padding: '4px 9px', fontSize: '0.74rem', borderRadius: 7 }}
            placeholder="tag…"
            value={tag}
            autoFocus
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            onBlur={submit}
          />
        ) : (
          <button className="chip chip-btn" style={{ padding: '3px 9px', fontSize: '0.7rem' }} onClick={() => setAdding(true)}>
            <Plus size={11} /> tag
          </button>
        )}
      </div>
      <div className="faint" style={{ fontSize: '0.7rem', marginTop: 10 }}>Saved {formatShort(new Date(fav.createdAt).toISOString().slice(0, 10))}</div>
    </motion.div>
  )
}
