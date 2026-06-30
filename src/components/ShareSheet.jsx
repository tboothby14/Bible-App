import { useState } from 'react'
import { Copy, ImageDown, MessagesSquare, Share2, Check } from 'lucide-react'
import { Modal } from './ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { copyText, verseShareText, downloadVerseImage } from '../lib/share.js'

export default function ShareSheet({ open, onClose, verse }) {
  const { postComment, today, addToast } = useApp()
  const [copied, setCopied] = useState(false)

  if (!verse) return null

  const doCopy = async () => {
    const ok = await copyText(verseShareText(verse.reference, verse.text))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    addToast(ok
      ? { tone: 'teal', icon: 'check', title: 'Copied to clipboard', msg: verse.reference }
      : { tone: 'dim', icon: 'check', title: 'Copy unavailable', msg: 'Select and copy manually' })
  }

  const doImage = () => {
    downloadVerseImage(verse)
    addToast({ tone: 'purple', icon: 'sparkles', title: 'Image saved', msg: 'A shareable card was downloaded.' })
  }

  const doGroup = () => {
    postComment(today, `📖 ${verse.reference} — "${verse.text}"`)
    addToast({ tone: 'cyan', icon: 'users', title: 'Shared to your circle', msg: 'Posted in today’s chat.' })
    onClose()
  }

  const Action = ({ icon: Icon, title, sub, onClick, tone }) => (
    <button className="card card-hover" style={{ padding: 16, textAlign: 'left', width: '100%' }} onClick={onClick}>
      <div className="row">
        <span style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: tone, color: '#04121a', flexShrink: 0 }}>
          <Icon size={19} />
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{title}</div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>{sub}</div>
        </div>
      </div>
    </button>
  )

  return (
    <Modal open={open} onClose={onClose} title="Share this verse" icon={Share2}>
      <div className="hero-verse" style={{ padding: 20, marginBottom: 16 }}>
        <p className="scripture" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{verse.text}</p>
        <div className="gradient-text" style={{ fontWeight: 750, marginTop: 10 }}>{verse.reference}</div>
      </div>
      <div className="flow">
        <Action icon={copied ? Check : Copy} title={copied ? 'Copied!' : 'Copy to clipboard'} sub="Verse text + reference" onClick={doCopy} tone="var(--grad-teal)" />
        <Action icon={ImageDown} title="Generate image" sub="Aesthetic card to download & share" onClick={doImage} tone="var(--grad-purple)" />
        <Action icon={MessagesSquare} title="Share to your circle" sub="Post in today’s group chat" onClick={doGroup} tone="linear-gradient(135deg,#38bdf8,#22d3ee)" />
      </div>
    </Modal>
  )
}
