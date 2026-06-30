import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, CheckCircle2, Check, Share2, Heart, Send, ArrowLeft,
  Quote, NotebookPen, MessagesSquare, Sparkles, ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useNav } from '../context/nav.js'
import { fetchPassage } from '../lib/bibleApi.js'
import { READING_PLANS } from '../data/readingPlans.js'
import ScriptureView from '../components/ScriptureView.jsx'
import { Explanation, CrossReferences } from '../components/insight.jsx'
import ShareSheet from '../components/ShareSheet.jsx'
import { Avatar } from '../components/ui.jsx'
import { relativeTime } from '../lib/dates.js'

export default function DailyReading() {
  const app = useApp()
  const { params, go } = useNav()
  const browsingRef = params.ref
  const reading = browsingRef ? { ref: browsingRef, theme: null } : app.todayReading
  const isToday = !browsingRef

  const [passage, setPassage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [devotional, setDevotional] = useState(app.devotionalCache[app.today] || '')
  const [shareVerse, setShareVerse] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchPassage(reading.ref).then((p) => {
      if (alive) {
        setPassage(p)
        setLoading(false)
      }
    })
    return () => { alive = false }
  }, [reading.ref])

  useEffect(() => {
    if (!isToday) return
    let alive = true
    app.ensureDevotional(app.today, reading.ref, reading.theme).then((d) => {
      if (alive) setDevotional(d)
    })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isToday, reading.ref])

  const passageText = passage?.verses.map((v) => v.t).join(' ') || ''
  const fullVerse = { reference: reading.ref, text: passageText }

  return (
    <div className="flow">
      <ShareSheet open={!!shareVerse} onClose={() => setShareVerse(null)} verse={shareVerse} />

      {browsingRef ? (
        <button className="btn btn-ghost btn-sm" onClick={() => go('today')}>
          <ArrowLeft size={15} /> Back to today
        </button>
      ) : (
        <>
          {/* Devotional hero */}
          <motion.div
            className="hero-verse"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="eyebrow">Today’s Devotional</span>
            <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
              <span className="quote-mark">“</span>
              <p className="font-serif" style={{ fontSize: 'clamp(1.3rem,3vw,1.9rem)', lineHeight: 1.4, fontWeight: 500 }}>
                {devotional || <span className="dots"><i /><i /><i /></span>}
              </p>
            </div>
          </motion.div>

          {/* Plan selector */}
          <div className="card card-pad">
            <div className="row-between wrap" style={{ gap: 12 }}>
              <div className="row">
                <span style={{ width: 42, height: 42, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'var(--grad-teal)', color: '#04121a', flexShrink: 0 }}>
                  <BookOpen size={20} />
                </span>
                <div>
                  <div className="faint" style={{ fontSize: '0.74rem', fontWeight: 600 }}>READING PLAN · DAY {app.todayDayNumber}</div>
                  <div style={{ fontWeight: 750, fontSize: '1rem' }}>{app.plan.name}</div>
                </div>
              </div>
              <select className="select" value={app.activePlanId} onChange={(e) => app.setPlan(e.target.value)}>
                {READING_PLANS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Reading card */}
      <motion.div className="card card-pad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="row-between wrap" style={{ marginBottom: 18, gap: 10 }}>
          <div>
            <div className="eyebrow">{reading.theme || 'Scripture'}</div>
            <h2 className="gradient-text" style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: 2 }}>{reading.ref}</h2>
            {passage && <div className="faint" style={{ fontSize: '0.74rem', marginTop: 2 }}>{passage.translation} · World English Bible</div>}
          </div>
          <div className="row">
            <button className="icon-btn" title="Save full passage" onClick={() => app.toggleFavorite(fullVerse)}>
              <Heart size={18} fill={app.isFavorite(reading.ref, passageText) ? 'currentColor' : 'none'} style={{ color: app.isFavorite(reading.ref, passageText) ? 'var(--accent-gold)' : undefined }} />
            </button>
            <button className="icon-btn" title="Share" onClick={() => setShareVerse(fullVerse)}>
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flow">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 16, width: `${92 - i * 8}%` }} />
            ))}
          </div>
        ) : (
          <ScriptureView passage={passage} />
        )}
        <div className="faint" style={{ fontSize: '0.74rem', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Heart size={12} /> Tap any verse to save it to your favorites
        </div>
      </motion.div>

      {/* Mark complete (today only) */}
      {isToday && (
        <AnimatePresence mode="wait">
          {app.isTodayComplete ? (
            <motion.div
              key="done"
              className="card card-pad"
              style={{ background: 'linear-gradient(120deg, rgba(45,212,191,0.14), rgba(56,189,248,0.1))', borderColor: 'rgba(45,212,191,0.3)' }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="row">
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                  style={{ width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--grad-teal)', color: '#04121a' }}
                >
                  <Check size={24} strokeWidth={3} />
                </motion.span>
                <div>
                  <div style={{ fontWeight: 750 }}>Today’s reading complete</div>
                  <div className="muted" style={{ fontSize: '0.86rem' }}>{app.currentStreak}-day streak · keep the light going 🔥</div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => app.toggleComplete(app.today)}>Undo</button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="todo"
              className="btn btn-primary btn-block"
              style={{ padding: '15px', fontSize: '1rem' }}
              onClick={() => app.markComplete(app.today)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.97 }}
            >
              <CheckCircle2 size={20} /> Mark today’s reading complete
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* AI explanation */}
      {!loading && <Explanation reference={reading.ref} text={passageText} />}

      {/* Reflection (today only) */}
      {isToday && <ReflectionBox />}

      {/* Cross references */}
      {!loading && (
        <div className="card card-pad">
          <CrossReferences reference={reading.ref} onOpenRef={(ref) => go('today', { ref })} />
        </div>
      )}

      {/* Group chat (today only) */}
      {isToday && <DayChat />}
    </div>
  )
}

function ReflectionBox() {
  const { reflections, today, saveReflection } = useApp()
  const [text, setText] = useState(reflections[today]?.text || '')
  const [status, setStatus] = useState('idle')
  const timer = useRef(null)

  const onChange = (e) => {
    const val = e.target.value
    setText(val)
    setStatus('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      saveReflection(today, val)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 1600)
    }, 600)
  }

  return (
    <div className="card card-pad">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div className="row">
          <NotebookPen size={18} style={{ color: 'var(--accent-purple)' }} />
          <h2 style={{ fontSize: '1.06rem', fontWeight: 750 }}>Your Reflection</h2>
        </div>
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="faint"
              style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {status === 'saving' ? 'Saving…' : <><Check size={13} /> Saved</>}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <textarea
        className="textarea"
        rows={4}
        placeholder="What is God showing you in this passage today? Write freely — it saves as you type."
        value={text}
        onChange={onChange}
      />
    </div>
  )
}

function DayChat() {
  const { group, today, postComment } = useApp()
  const [text, setText] = useState('')
  const comments = group.comments[today] || []
  const memberById = (id) => group.members.find((m) => m.id === id)

  const send = () => {
    if (!text.trim()) return
    postComment(today, text)
    setText('')
  }

  return (
    <div className="card card-pad">
      <div className="row" style={{ marginBottom: 14 }}>
        <MessagesSquare size={18} style={{ color: 'var(--accent-cyan)' }} />
        <h2 style={{ fontSize: '1.06rem', fontWeight: 750 }}>Circle Chat</h2>
        <span className="chip" style={{ marginLeft: 'auto' }}>{comments.length} {comments.length === 1 ? 'note' : 'notes'}</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        {comments.length === 0 && <div className="muted" style={{ fontSize: '0.86rem', padding: '8px 0' }}>Be the first to share a thought on today’s reading.</div>}
        {comments.map((c) => {
          const m = memberById(c.authorId)
          return (
            <div className="comment" key={c.id}>
              <Avatar member={m} size={34} />
              <div className={`bubble ${c.authorId === 'me' ? 'me' : ''}`}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="comment-name">{m?.name}</span>
                  <span className="comment-time">{relativeTime(c.ts)}</span>
                </div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <input
          className="input"
          placeholder="Share an encouragement or question…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary" onClick={send} disabled={!text.trim()} style={{ padding: '11px 14px' }}>
          <Send size={17} />
        </button>
      </div>
    </div>
  )
}
