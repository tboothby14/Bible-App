import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, NotebookPen, Check, Pencil, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { EmptyState } from '../components/ui.jsx'
import { formatLong, formatShort } from '../lib/dates.js'

export default function Reflections() {
  const app = useApp()
  const [query, setQuery] = useState('')

  const entries = useMemo(() => {
    return Object.entries(app.reflections)
      .filter(([, r]) => r.text?.trim())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([iso, r]) => ({ iso, ...r, ref: app.readingFor(iso)?.ref }))
  }, [app.reflections, app.readingFor])

  const filtered = entries.filter(
    (e) =>
      !query ||
      e.text.toLowerCase().includes(query.toLowerCase()) ||
      (e.ref || '').toLowerCase().includes(query.toLowerCase()),
  )

  const totalWords = entries.reduce((s, e) => s + e.text.trim().split(/\s+/).length, 0)
  const avgWords = entries.length ? Math.round(totalWords / entries.length) : 0

  return (
    <div className="flow">
      <div className="grid-2">
        <div className="card card-pad row" style={{ gap: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'var(--grad-purple)', color: '#fff' }}><NotebookPen size={20} /></span>
          <div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{entries.length}</div>
            <div className="muted" style={{ fontSize: '0.84rem' }}>reflections written</div>
          </div>
        </div>
        <div className="card card-pad row" style={{ gap: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'var(--grad-teal)', color: '#04121a' }}><Pencil size={19} /></span>
          <div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{avgWords}</div>
            <div className="muted" style={{ fontSize: '0.84rem' }}>avg words per entry</div>
          </div>
        </div>
      </div>

      <div className="search-wrap">
        <Search size={17} />
        <input className="input" placeholder="Search your reflections…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon={NotebookPen} title={query ? 'No matches found' : 'No reflections yet'}>
            {query ? 'Try a different search.' : 'Your daily reflections will gather here, searchable forever.'}
          </EmptyState>
        </div>
      ) : (
        <div className="flow">
          <AnimatePresence>
            {filtered.map((e, i) => (
              <Entry key={e.iso} entry={e} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function Entry({ entry, index }) {
  const { saveReflection, today } = useApp()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(entry.text)
  const [status, setStatus] = useState('idle')
  const timer = useRef(null)

  const onChange = (e) => {
    const val = e.target.value
    setText(val)
    setStatus('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      saveReflection(entry.iso, val)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1400)
    }, 600)
  }

  return (
    <motion.div
      layout
      className="card card-pad"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <div className="row-between" style={{ marginBottom: 10 }}>
        <div>
          <div className="row" style={{ gap: 7, color: 'var(--text-soft)' }}>
            <Calendar size={14} className="muted" />
            <b style={{ fontSize: '0.9rem' }}>{formatLong(entry.iso)}</b>
            {entry.iso === today && <span className="pill-gradient">Today</span>}
          </div>
          {entry.ref && <div className="gradient-text" style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: 3 }}>{entry.ref}</div>}
        </div>
        <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setEditing((v) => !v)} title="Edit">
          {editing ? (status === 'saving' ? <span className="dots" style={{ transform: 'scale(0.7)' }}><i /><i /><i /></span> : <Check size={16} />) : <Pencil size={15} />}
        </button>
      </div>
      {editing ? (
        <textarea className="textarea" rows={4} value={text} onChange={onChange} autoFocus />
      ) : (
        <p style={{ color: 'var(--text-soft)', lineHeight: 1.62, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{text}</p>
      )}
      <div className="faint" style={{ fontSize: '0.72rem', marginTop: 10 }}>{text.trim().split(/\s+/).length} words · {formatShort(entry.iso)}</div>
    </motion.div>
  )
}
