import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Star, RotateCw, Check, X, Plus, Trash2, ChevronRight, Sparkle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { MasteryDots, EmptyState, Modal } from '../components/ui.jsx'
import { fetchPassage } from '../lib/bibleApi.js'

export default function Memory() {
  const app = useApp()
  const [addOpen, setAddOpen] = useState(false)

  const weekly = app.weeklyVerse
  const inMemory = weekly && app.memoryVerses.some((m) => m.ref === weekly.ref)

  const addWeekly = async () => {
    const p = await fetchPassage(weekly.ref)
    const text = p.verses.map((v) => v.t).join(' ')
    app.addMemoryVerse({ ref: weekly.ref, text })
  }

  return (
    <div className="flow">
      <AddVerseModal open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Verse of the week */}
      {weekly && (
        <motion.div className="hero-verse" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="row-between wrap" style={{ gap: 12 }}>
            <span className="eyebrow" style={{ color: 'var(--accent-gold)' }}>✦ Verse of the Week</span>
            {!inMemory ? (
              <button className="btn btn-soft btn-sm" onClick={addWeekly}><Plus size={14} /> Memorize this</button>
            ) : (
              <span className="chip active"><Check size={13} /> In your deck</span>
            )}
          </div>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 500, marginTop: 10 }}>{weekly.ref}</h2>
          <p className="muted" style={{ marginTop: 6 }}>{weekly.theme}</p>
        </motion.div>
      )}

      {/* Flashcard quiz */}
      <div className="card card-pad">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <div className="row"><Brain size={19} style={{ color: 'var(--accent-cyan)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.1rem' }}>Flashcard Review</h2></div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Add verse</button>
        </div>
        {app.memoryVerses.length === 0 ? (
          <EmptyState icon={Brain} title="No verses to review yet">Add a verse to start building your memory deck.</EmptyState>
        ) : (
          <Quiz />
        )}
      </div>

      {/* Deck list */}
      {app.memoryVerses.length > 0 && (
        <div className="card card-pad">
          <h2 style={{ fontWeight: 750, fontSize: '1.06rem', marginBottom: 14 }}>Your Deck · {app.memoryVerses.length}</h2>
          <div className="flow" style={{ '--space': '10px' }}>
            {app.memoryVerses.map((m) => (
              <div key={m.id} className="card" style={{ padding: 14, background: 'var(--surface-2)' }}>
                <div className="row-between">
                  <div className="gradient-text" style={{ fontWeight: 750, fontSize: '0.94rem' }}>{m.ref}</div>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => app.removeMemoryVerse(m.id)}><Trash2 size={14} /></button>
                </div>
                <p className="muted" style={{ fontSize: '0.86rem', marginTop: 6, lineHeight: 1.5 }}>{m.text}</p>
                <div className="row-between" style={{ marginTop: 10 }}>
                  <MasteryDots level={m.mastery} />
                  <span className="faint" style={{ fontSize: '0.72rem' }}>{m.mastery === 5 ? '⭐ Mastered' : `Mastery ${m.mastery}/5`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Quiz() {
  const { memoryVerses, reviewMemoryVerse } = useApp()
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = memoryVerses[idx % memoryVerses.length]

  const advance = () => {
    setFlipped(false)
    setTimeout(() => setIdx((i) => (i + 1) % memoryVerses.length), 180)
  }
  const grade = (correct) => {
    reviewMemoryVerse(card.id, correct)
    advance()
  }

  return (
    <div>
      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
        <div className="flashcard-inner">
          <div className="flash-face flash-front">
            <Sparkle size={26} style={{ color: 'var(--accent-cyan)', marginBottom: 14 }} />
            <div className="eyebrow">Can you recall it?</div>
            <h3 className="gradient-text" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8 }}>{card.ref}</h3>
            <div className="faint row" style={{ gap: 6, marginTop: 18, fontSize: '0.78rem' }}><RotateCw size={13} /> Tap to reveal</div>
          </div>
          <div className="flash-face flash-back">
            <p className="font-serif" style={{ fontSize: '1.12rem', lineHeight: 1.55 }}>{card.text}</p>
            <div className="gradient-text" style={{ fontWeight: 750, marginTop: 14 }}>{card.ref}</div>
          </div>
        </div>
      </div>
      <div className="row" style={{ gap: 10, marginTop: 16 }}>
        <button className="btn btn-ghost btn-block" onClick={() => grade(false)}><X size={16} /> Review again</button>
        <button className="btn btn-primary btn-block" onClick={() => grade(true)}><Check size={16} /> I knew it</button>
      </div>
      <div className="row-between" style={{ marginTop: 12 }}>
        <span className="faint" style={{ fontSize: '0.76rem' }}>Card {(idx % memoryVerses.length) + 1} of {memoryVerses.length}</span>
        <button className="faint row" style={{ fontSize: '0.78rem', gap: 4 }} onClick={advance}>Skip <ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

function AddVerseModal({ open, onClose }) {
  const { addMemoryVerse, favorites } = useApp()
  const [ref, setRef] = useState('')
  const [text, setText] = useState('')

  const submit = () => {
    if (!ref.trim() || !text.trim()) return
    addMemoryVerse({ ref: ref.trim(), text: text.trim() })
    setRef(''); setText(''); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a verse to memorize" icon={Brain}
      footer={<><button className="btn btn-ghost btn-block" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-block" onClick={submit}>Add to deck</button></>}>
      {favorites.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="faint" style={{ fontSize: '0.78rem', marginBottom: 8 }}>From your favorites</div>
          <div className="row wrap" style={{ gap: 6 }}>
            {favorites.slice(0, 6).map((f) => (
              <button key={f.id} className="chip chip-btn" onClick={() => { setRef(f.reference); setText(f.text) }}>{f.reference}</button>
            ))}
          </div>
        </div>
      )}
      <input className="input" placeholder="Reference (e.g., Joshua 1:9)" value={ref} onChange={(e) => setRef(e.target.value)} style={{ marginBottom: 10 }} />
      <textarea className="textarea" rows={4} placeholder="Verse text…" value={text} onChange={(e) => setText(e.target.value)} />
    </Modal>
  )
}
