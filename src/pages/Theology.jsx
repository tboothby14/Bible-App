import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'
import { THEOLOGY_CONCEPTS } from '../data/crossReferences.js'
import { useNav } from '../context/nav.js'

const ACCENT = {
  teal: 'var(--accent-teal)', purple: 'var(--accent-purple)', gold: 'var(--accent-gold)',
  cyan: 'var(--accent-cyan)', pink: 'var(--accent-pink)', green: 'var(--accent-green)',
}

export default function Theology() {
  const { go } = useNav()
  const [active, setActive] = useState(null)
  const concept = THEOLOGY_CONCEPTS.find((c) => c.id === active)

  return (
    <div className="flow">
      <AnimatePresence mode="wait">
        {!concept ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flow">
            <div className="hero-verse">
              <span className="eyebrow">Explore the Big Ideas</span>
              <p className="font-serif" style={{ fontSize: 'clamp(1.2rem,2.6vw,1.6rem)', marginTop: 8, lineHeight: 1.4 }}>
                Trace a single thread — grace, covenant, redemption — across the whole of Scripture.
              </p>
            </div>
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))' }}>
              {THEOLOGY_CONCEPTS.map((c, i) => (
                <motion.button
                  key={c.id}
                  className="card card-pad card-hover"
                  style={{ textAlign: 'left' }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setActive(c.id)}
                >
                  <div className="row-between" style={{ marginBottom: 10 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: ACCENT[c.color], color: '#04121a' }}>
                      <Compass size={19} />
                    </span>
                    <span className="chip" style={{ fontSize: '0.68rem' }}>{c.verses.length} passages</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>{c.term}</h3>
                  <p className="muted" style={{ fontSize: '0.85rem', marginTop: 6, lineHeight: 1.5 }}>{c.summary}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flow">
            <button className="btn btn-ghost btn-sm" onClick={() => setActive(null)}><ArrowLeft size={15} /> All concepts</button>
            <div className="card card-pad" style={{ background: `linear-gradient(135deg, ${ACCENT[concept.color]}22, transparent)` }}>
              <div className="row" style={{ marginBottom: 12 }}>
                <span style={{ width: 52, height: 52, borderRadius: 15, display: 'grid', placeItems: 'center', background: ACCENT[concept.color], color: '#04121a' }}><Compass size={24} /></span>
                <h2 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' }}>{concept.term}</h2>
              </div>
              <p className="font-serif" style={{ fontSize: '1.15rem', lineHeight: 1.55, color: 'var(--text-soft)' }}>{concept.summary}</p>
            </div>

            <div className="card card-pad">
              <div className="row" style={{ marginBottom: 14 }}><BookOpen size={18} style={{ color: ACCENT[concept.color] }} /><h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Across Scripture</h2></div>
              <div className="flow" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {concept.verses.map((v) => (
                  <button
                    key={v.ref}
                    className="card card-hover"
                    style={{ padding: 16, textAlign: 'left', background: 'var(--surface-2)' }}
                    onClick={() => go('today', { ref: v.ref })}
                  >
                    <div className="row-between" style={{ marginBottom: 6 }}>
                      <span className="gradient-text" style={{ fontWeight: 750, fontSize: '0.94rem' }}>{v.ref}</span>
                      <ArrowUpRight size={16} className="muted" />
                    </div>
                    <p className="font-serif" style={{ fontSize: '0.98rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>{v.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="card card-pad">
              <h2 style={{ fontWeight: 750, fontSize: '1rem', marginBottom: 12 }}>Keep exploring</h2>
              <div className="row wrap" style={{ gap: 8 }}>
                {THEOLOGY_CONCEPTS.filter((c) => c.id !== concept.id).map((c) => (
                  <button key={c.id} className="chip chip-btn" onClick={() => setActive(c.id)}>{c.term}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
