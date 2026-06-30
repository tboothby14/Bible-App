import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import {
  Check,
  Heart,
  Flame,
  HandHeart,
  Users,
  BookOpen,
  Brain,
  Sparkles,
  X,
  Inbox,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

/* ---------- Avatar ---------- */
export function Avatar({ member, size = 36 }) {
  if (!member) return null
  return (
    <div
      className="avatar"
      title={member.name}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), background: member.avatar }}
    >
      {member.initials}
    </div>
  )
}

export function AvatarStack({ members, size = 28, max = 4 }) {
  const shown = members.slice(0, max)
  const extra = members.length - shown.length
  return (
    <div className="avatar-stack">
      {shown.map((m) => (
        <Avatar key={m.id} member={m} size={size} />
      ))}
      {extra > 0 && (
        <div
          className="avatar"
          style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: 'var(--surface-hover)', color: 'var(--text-dim)' }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}

/* ---------- Section header ---------- */
export function SectionHead({ icon: Icon, title, children, color = 'var(--accent-teal)' }) {
  return (
    <div className="section-head">
      {Icon && (
        <span style={{ color }}>
          <Icon size={19} />
        </span>
      )}
      <h2>{title}</h2>
      {children && <div className="spacer">{children}</div>}
    </div>
  )
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, icon: Icon, children, footer, maxWidth }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            style={maxWidth ? { maxWidth } : undefined}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              {Icon && (
                <span style={{ color: 'var(--accent-teal)' }}>
                  <Icon size={20} />
                </span>
              )}
              <h3>{title}</h3>
              <button className="icon-btn" style={{ marginLeft: 'auto', width: 34, height: 34 }} onClick={onClose} aria-label="Close">
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Toasts ---------- */
const TOAST_ICONS = {
  check: Check,
  heart: Heart,
  flame: Flame,
  pray: HandHeart,
  users: Users,
  book: BookOpen,
  brain: Brain,
  sparkles: Sparkles,
}
const TOAST_TONES = {
  teal: 'var(--grad-teal)',
  purple: 'var(--grad-purple)',
  gold: 'var(--grad-warm)',
  green: 'linear-gradient(135deg,#34d399,#2dd4bf)',
  cyan: 'linear-gradient(135deg,#38bdf8,#22d3ee)',
  dim: 'var(--surface-hover)',
}

export function Toasts() {
  const { toasts, removeToast } = useApp()
  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.icon] || Sparkles
          return (
            <motion.div
              key={t.id}
              className="toast"
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              onClick={() => removeToast(t.id)}
            >
              <span
                className="t-icon"
                style={{ background: TOAST_TONES[t.tone] || TOAST_TONES.teal, color: t.tone === 'dim' ? 'var(--text)' : '#04121a' }}
              >
                <Icon size={16} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="toast-title">{t.title}</div>
                {t.msg && <div className="toast-msg">{t.msg}</div>}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Ring stat ---------- */
export function RingStat({ value = 0, size = 132, stroke = 11, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, value) / 100) * c
  return (
    <div className="ring-stat" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2dd4bf" />
            <stop offset="0.5" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-prog"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  )
}

/* ---------- Misc ---------- */
export function EmptyState({ icon: Icon = Inbox, title, children }) {
  return (
    <div className="empty-state">
      <div className="ico">
        <Icon size={26} />
      </div>
      <div style={{ fontWeight: 700, color: 'var(--text-soft)', marginBottom: 4 }}>{title}</div>
      {children && <div style={{ fontSize: '0.86rem' }}>{children}</div>}
    </div>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Switch({ on, onClick }) {
  return <button className={`switch ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} role="switch" />
}

export function MasteryDots({ level }) {
  return (
    <div className="row" style={{ gap: 4 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: i < level ? 'var(--accent-teal)' : 'var(--surface-hover)',
          }}
        />
      ))}
    </div>
  )
}

export function Sparkline({ data, width = 120, height = 34, color = 'var(--accent-teal)' }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const step = width / Math.max(1, data.length - 1)
  const points = data.map((d, i) => `${i * step},${height - (d / max) * (height - 4) - 2}`).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <circle key={i} cx={i * step} cy={height - (d / max) * (height - 4) - 2} r="2" fill={color} />
      ))}
    </svg>
  )
}

/* page transition wrapper */
export function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
