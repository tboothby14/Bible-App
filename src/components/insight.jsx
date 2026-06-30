import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Wand2, Link2, ArrowUpRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { relatedFor } from '../data/crossReferences.js'

/* ---------- AI passage explanation ---------- */
export function Explanation({ reference, text }) {
  const { ensureExplanation, explanationsCache, settings } = useApp()
  const cached = explanationsCache[reference]
  const [content, setContent] = useState(cached || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await ensureExplanation(reference, text)
      setContent(r)
    } catch (e) {
      setError(e.message || 'Something went wrong generating this insight.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card card-pad" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.10), rgba(45,212,191,0.06)), var(--surface)' }}>
      <div className="row" style={{ marginBottom: content || loading ? 14 : 0 }}>
        <span
          style={{
            width: 36, height: 36, borderRadius: 11, display: 'grid', placeItems: 'center',
            background: 'var(--grad-purple)', color: '#fff',
          }}
        >
          <Sparkles size={18} />
        </span>
        <div>
          <div style={{ fontWeight: 750, fontSize: '0.96rem' }}>AI Insight</div>
          <div className="faint" style={{ fontSize: '0.74rem' }}>
            {settings.apiKey ? 'Powered by Claude' : 'Sample insight · add a key in Settings for live AI'}
          </div>
        </div>
        {!content && !loading && (
          <button className="btn btn-soft btn-sm" style={{ marginLeft: 'auto' }} onClick={generate}>
            <Wand2 size={15} /> Explain
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flow"
          >
            <div className="ai-thinking" style={{ marginBottom: 12 }}>
              <span className="dots">
                <i /><i /><i />
              </span>
              Reflecting on {reference}…
            </div>
            <div className="skeleton" style={{ height: 13, width: '100%' }} />
            <div className="skeleton" style={{ height: 13, width: '92%' }} />
            <div className="skeleton" style={{ height: 13, width: '74%' }} />
          </motion.div>
        )}
        {!loading && content && (
          <motion.p
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: 'var(--text-soft)', lineHeight: 1.66, fontSize: '0.96rem' }}
          >
            {content}
          </motion.p>
        )}
      </AnimatePresence>
      {error && (
        <div style={{ color: 'var(--accent-red)', fontSize: '0.82rem', marginTop: 8 }}>{error}</div>
      )}
    </div>
  )
}

/* ---------- Cross-reference explorer ---------- */
export function CrossReferences({ reference, onOpenRef }) {
  const refs = relatedFor(reference)
  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <Link2 size={17} style={{ color: 'var(--accent-cyan)' }} />
        <h2 style={{ fontSize: '1.06rem', fontWeight: 750 }}>Cross-References</h2>
      </div>
      <div className="grid-auto">
        {refs.map((r) => (
          <button
            key={r.ref}
            className="card card-pad card-hover"
            style={{ textAlign: 'left', padding: 16 }}
            onClick={() => onOpenRef?.(r.ref)}
          >
            <div className="row-between">
              <div className="gradient-text" style={{ fontWeight: 750, fontSize: '0.96rem' }}>{r.ref}</div>
              <ArrowUpRight size={16} className="muted" />
            </div>
            <div className="muted" style={{ fontSize: '0.84rem', marginTop: 4, lineHeight: 1.45 }}>{r.note}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
