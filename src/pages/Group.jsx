import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check, Link2, MessagesSquare, HandHeart, ChevronRight, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useNav } from '../context/nav.js'
import { Avatar, AvatarStack } from '../components/ui.jsx'
import { copyText } from '../lib/share.js'
import { lastNDays, weekday, todayISO, relativeTime } from '../lib/dates.js'

export default function Group() {
  const app = useApp()
  const { go } = useNav()
  const { group } = app
  const [copied, setCopied] = useState(false)
  const today = todayISO()
  const days = lastNDays(7)

  const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${group.inviteCode}`

  const copyCode = async (value) => {
    await copyText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    app.addToast({ tone: 'cyan', icon: 'users', title: 'Invite copied', msg: 'Send it to a friend to join.' })
  }

  const doneToday = group.members.filter((m) => group.completions[m.id]?.[today])
  const todayComments = group.comments[today] || []
  const activePrayers = group.prayers.filter((p) => p.status === 'active')

  return (
    <div className="flow">
      {/* Header */}
      <motion.div className="card card-pad card-glow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="row-between wrap" style={{ gap: 14 }}>
          <div className="row">
            <span style={{ width: 50, height: 50, borderRadius: 15, display: 'grid', placeItems: 'center', background: 'var(--grad-primary)', color: '#04121a' }}><Users size={24} /></span>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>{group.name}</h2>
              <div className="muted" style={{ fontSize: '0.86rem' }}>{group.members.length} members reading together</div>
            </div>
          </div>
          <AvatarStack members={group.members} size={38} max={5} />
        </div>

        <div className="card" style={{ padding: 14, marginTop: 18, background: 'var(--surface-2)' }}>
          <div className="row-between wrap" style={{ gap: 10 }}>
            <div>
              <div className="faint" style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em' }}>INVITE CODE</div>
              <div className="gradient-text" style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.12em' }}>{group.inviteCode}</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => copyCode(group.inviteCode)}>{copied ? <Check size={14} /> : <Copy size={14} />} Code</button>
              <button className="btn btn-primary btn-sm" onClick={() => copyCode(inviteLink)}><Link2 size={14} /> Copy link</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today */}
      <div className="card card-pad">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Today’s Reading</h2>
          <span className="chip">{doneToday.length}/{group.members.length} done</span>
        </div>
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))' }}>
          {group.members.map((m) => {
            const done = !!group.completions[m.id]?.[today]
            return (
              <div key={m.id} className="card" style={{ padding: '12px 14px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10, borderColor: done ? 'rgba(45,212,191,0.3)' : undefined }}>
                <div style={{ position: 'relative' }}>
                  <Avatar member={m} size={38} />
                  {done && (
                    <span style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--grad-teal)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px var(--surface-solid)' }}>
                      <Check size={11} color="#04121a" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 650, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.isMe ? 'You' : m.name.split(' ')[0]}</div>
                  <div className="faint" style={{ fontSize: '0.72rem' }}>{done ? 'Completed' : 'Not yet'}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly grid */}
      <div className="card card-pad">
        <h2 style={{ fontWeight: 750, fontSize: '1.06rem', marginBottom: 14 }}>This Week Together</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 380 }}>
            <thead>
              <tr>
                <th></th>
                {days.map((d) => (
                  <th key={d} className="faint" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0 0 8px', textAlign: 'center' }}>{weekday(d)[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.members.map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: '5px 10px 5px 0' }}>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar member={m} size={26} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{m.isMe ? 'You' : m.name.split(' ')[0]}</span>
                    </div>
                  </td>
                  {days.map((d) => {
                    const done = !!group.completions[m.id]?.[d]
                    return (
                      <td key={d} style={{ textAlign: 'center', padding: 4 }}>
                        <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 7, background: done ? 'var(--grad-primary)' : 'var(--surface-2)', border: done ? 'none' : '1px solid var(--card-border)' }} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid-2">
        <button className="card card-pad card-hover" style={{ textAlign: 'left' }} onClick={() => go('today')}>
          <div className="row-between">
            <div className="row"><MessagesSquare size={18} style={{ color: 'var(--accent-cyan)' }} /><b>Circle Chat</b></div>
            <ChevronRight size={17} className="muted" />
          </div>
          <div className="muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
            {todayComments.length > 0 ? `${todayComments.length} ${todayComments.length === 1 ? 'message' : 'messages'} today · last ${relativeTime(todayComments[todayComments.length - 1].ts)}` : 'No messages yet today — start one.'}
          </div>
        </button>
        <button className="card card-pad card-hover" style={{ textAlign: 'left' }} onClick={() => go('prayer')}>
          <div className="row-between">
            <div className="row"><HandHeart size={18} style={{ color: 'var(--accent-purple)' }} /><b>Prayer Board</b></div>
            <ChevronRight size={17} className="muted" />
          </div>
          <div className="muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>{activePrayers.length} active requests · pray for your circle</div>
        </button>
      </div>
    </div>
  )
}
