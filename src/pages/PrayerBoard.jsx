import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HandHeart, Plus, Check, Sparkles, RotateCcw, Send, Hand } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Avatar, Modal, Segmented, EmptyState } from '../components/ui.jsx'
import { relativeTime } from '../lib/dates.js'

export default function PrayerBoard() {
  const app = useApp()
  const { group } = app
  const [tab, setTab] = useState('active')
  const [addOpen, setAddOpen] = useState(false)
  const [answering, setAnswering] = useState(null)

  const prayers = group.prayers.filter((p) => p.status === tab)
  const activeCount = group.prayers.filter((p) => p.status === 'active').length
  const answeredCount = group.prayers.filter((p) => p.status === 'answered').length

  return (
    <div className="flow">
      <AddPrayerModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AnswerModal prayer={answering} onClose={() => setAnswering(null)} />

      <div className="card card-pad">
        <div className="row-between wrap" style={{ gap: 12 }}>
          <div className="row">
            <span style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--grad-purple)', color: '#fff' }}><HandHeart size={23} /></span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Prayer Board</div>
              <div className="muted" style={{ fontSize: '0.85rem' }}>{activeCount} active · {answeredCount} answered</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}><Plus size={17} /> Add request</button>
        </div>
      </div>

      <div className="row-between wrap" style={{ gap: 10 }}>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'active', label: `Active · ${activeCount}` }, { value: 'answered', label: `Answered · ${answeredCount}` }]} />
      </div>

      {prayers.length === 0 ? (
        <div className="card card-pad">
          <EmptyState icon={HandHeart} title={tab === 'active' ? 'No active requests' : 'No answered prayers yet'}>
            {tab === 'active' ? 'Add a request and let your circle pray with you.' : 'Answered prayers will be celebrated here.'}
          </EmptyState>
        </div>
      ) : (
        <div className="flow">
          <AnimatePresence>
            {prayers.map((p) => (
              <PrayerCard key={p.id} prayer={p} onAnswer={() => setAnswering(p)} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function PrayerCard({ prayer, onAnswer }) {
  const app = useApp()
  const { group, togglePraying, reopenPrayer, addPrayerUpdate } = app
  const author = group.members.find((m) => m.id === prayer.authorId)
  const imPraying = prayer.praying.includes('me')
  const [update, setUpdate] = useState('')

  const sendUpdate = () => {
    if (!update.trim()) return
    addPrayerUpdate(prayer.id, update)
    setUpdate('')
  }

  return (
    <motion.div
      layout
      className={`prayer-card ${prayer.status === 'answered' ? 'answered' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
        <Avatar member={author} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-between">
            <div className="row" style={{ gap: 8 }}>
              <b style={{ fontSize: '0.92rem' }}>{author?.isMe ? 'You' : author?.name}</b>
              <span className="comment-time">{relativeTime(prayer.createdAt)}</span>
            </div>
            {prayer.status === 'answered' && <span className="chip active" style={{ color: 'var(--accent-green)', borderColor: 'rgba(52,211,153,0.4)', background: 'rgba(52,211,153,0.14)' }}><Sparkles size={12} /> Answered</span>}
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginTop: 6 }}>{prayer.title}</h3>
          {prayer.detail && <p className="muted" style={{ fontSize: '0.9rem', marginTop: 4, lineHeight: 1.5 }}>{prayer.detail}</p>}

          {/* Updates */}
          {prayer.updates.length > 0 && (
            <div style={{ marginTop: 12, borderLeft: '2px solid var(--card-border)', paddingLeft: 12 }}>
              {prayer.updates.map((u, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-soft)', lineHeight: 1.45 }}>{u.text}</p>
                  <span className="faint" style={{ fontSize: '0.7rem' }}>{relativeTime(u.ts)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="row-between wrap" style={{ marginTop: 14, gap: 10 }}>
            <button
              className={`btn btn-sm ${imPraying ? 'btn-soft' : 'btn-ghost'}`}
              onClick={() => togglePraying(prayer.id)}
            >
              <Hand size={14} fill={imPraying ? 'currentColor' : 'none'} />
              {imPraying ? 'Praying' : 'I’ll pray'}
              {prayer.praying.length > 0 && <span style={{ opacity: 0.7 }}>· {prayer.praying.length}</span>}
            </button>
            {prayer.status === 'active' ? (
              <button className="btn btn-sm btn-primary" onClick={onAnswer}><Check size={14} /> Mark answered</button>
            ) : (
              <button className="btn btn-sm btn-ghost" onClick={() => reopenPrayer(prayer.id)}><RotateCcw size={13} /> Reopen</button>
            )}
          </div>

          {/* Add update (author only) */}
          {author?.isMe && (
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <input className="input" style={{ padding: '8px 12px', fontSize: '0.84rem' }} placeholder="Add an update…" value={update} onChange={(e) => setUpdate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendUpdate()} />
              <button className="btn btn-ghost btn-sm" onClick={sendUpdate} disabled={!update.trim()}><Send size={15} /></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function AddPrayerModal({ open, onClose }) {
  const { addPrayer } = useApp()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')

  const submit = () => {
    if (!title.trim()) return
    addPrayer({ title, detail })
    setTitle(''); setDetail(''); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New prayer request" icon={HandHeart}
      footer={<><button className="btn btn-ghost btn-block" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-block" onClick={submit}>Add request</button></>}>
      <input className="input" placeholder="What can your circle pray for?" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 10 }} autoFocus />
      <textarea className="textarea" rows={4} placeholder="Add any details (optional)…" value={detail} onChange={(e) => setDetail(e.target.value)} />
    </Modal>
  )
}

function AnswerModal({ prayer, onClose }) {
  const { answerPrayer } = useApp()
  const [text, setText] = useState('')
  if (!prayer) return null

  const submit = () => {
    answerPrayer(prayer.id, text)
    setText('')
    onClose()
  }

  return (
    <Modal open={!!prayer} onClose={onClose} title="Celebrate an answered prayer" icon={Sparkles}
      footer={<><button className="btn btn-ghost btn-block" onClick={onClose}>Not yet</button><button className="btn btn-primary btn-block" onClick={submit}><Check size={16} /> It’s answered!</button></>}>
      <p className="muted" style={{ marginBottom: 12, fontSize: '0.9rem' }}>“{prayer.title}” — share how God answered (optional). This will set off some confetti. 🎉</p>
      <textarea className="textarea" rows={3} placeholder="How was this prayer answered?" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
    </Modal>
  )
}
