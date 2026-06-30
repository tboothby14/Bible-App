import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, Copy, Download, Mail, NotebookPen, MessagesSquare, HandHeart, Hash, CalendarCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Avatar } from '../components/ui.jsx'
import { copyText } from '../lib/share.js'
import { lastNDays, formatShort, formatMedium, todayISO } from '../lib/dates.js'

const STOP = new Set(['that', 'this', 'with', 'have', 'from', 'they', 'will', 'into', 'just', 'when', 'than', 'then', 'them', 'what', 'your', 'about', 'today', 'their', 'there', 'these', 'which', 'would', 'could', 'being', 'where', 'while', 'every', 'really', 'trying'])

export default function Digest() {
  const app = useApp()
  const { group } = app
  const week = lastNDays(7)
  const memberById = (id) => group.members.find((m) => m.id === id)

  const data = useMemo(() => {
    const myReflections = week
      .filter((iso) => app.reflections[iso]?.text?.trim())
      .map((iso) => ({ iso, ref: app.readingFor(iso)?.ref, text: app.reflections[iso].text }))

    const friendComments = []
    week.forEach((iso) => {
      ;(group.comments[iso] || []).forEach((c) => {
        if (c.authorId !== 'me') friendComments.push({ ...c, iso })
      })
    })
    friendComments.sort((a, b) => b.text.length - a.text.length)

    const wordCount = {}
    myReflections.forEach((r) => {
      r.text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).forEach((w) => {
        if (w.length > 4 && !STOP.has(w)) wordCount[w] = (wordCount[w] || 0) + 1
      })
    })
    const themes = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w)

    const weekSet = new Set(week)
    const answered = group.prayers.filter((p) => p.status === 'answered' && p.answeredAt && week.includes(new Date(p.answeredAt).toISOString().slice(0, 10)))
    const active = group.prayers.filter((p) => p.status === 'active')
    const daysDone = week.filter((iso) => app.completedMap[iso]).length

    return { myReflections, friendComments: friendComments.slice(0, 3), themes, answered, active, daysDone }
  }, [week, app.reflections, app.completedMap, group, app.readingFor])

  const digestText = useMemo(() => {
    const lines = []
    lines.push(`LUMEN — Weekly Digest`)
    lines.push(`${formatMedium(week[0])} – ${formatMedium(todayISO())}`)
    lines.push('')
    lines.push(`You completed ${data.daysDone}/7 readings this week.`)
    if (data.themes.length) lines.push(`Themes: ${data.themes.join(', ')}`)
    lines.push('')
    lines.push('YOUR REFLECTIONS')
    data.myReflections.forEach((r) => lines.push(`• ${r.ref || formatShort(r.iso)} — ${r.text}`))
    if (!data.myReflections.length) lines.push('• (none yet this week)')
    lines.push('')
    lines.push('FROM YOUR CIRCLE')
    data.friendComments.forEach((c) => lines.push(`• ${memberById(c.authorId)?.name}: ${c.text}`))
    if (!data.friendComments.length) lines.push('• (no comments this week)')
    lines.push('')
    lines.push('PRAYERS')
    data.answered.forEach((p) => lines.push(`✓ Answered — ${p.title}`))
    data.active.forEach((p) => lines.push(`• Praying — ${p.title}`))
    lines.push('')
    lines.push('— shared from Lumen')
    return lines.join('\n')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, week])

  const doCopy = async () => {
    await copyText(digestText)
    app.addToast({ tone: 'teal', icon: 'check', title: 'Digest copied', msg: 'Paste it anywhere.' })
  }
  const doDownload = () => {
    const blob = new Blob([digestText], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `lumen-digest-${todayISO()}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
    app.addToast({ tone: 'purple', icon: 'sparkles', title: 'Digest downloaded' })
  }
  const doEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('My Lumen Weekly Digest')}&body=${encodeURIComponent(digestText)}`
  }

  return (
    <div className="flow">
      <motion.div className="card card-pad card-glow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="row-between wrap" style={{ gap: 14 }}>
          <div className="row">
            <span style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--grad-primary)', color: '#04121a' }}><Newspaper size={23} /></span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Your Week in the Word</div>
              <div className="muted" style={{ fontSize: '0.85rem' }}>{formatShort(week[0])} – {formatShort(todayISO())}</div>
            </div>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={doCopy}><Copy size={14} /> Copy</button>
            <button className="btn btn-ghost btn-sm" onClick={doDownload}><Download size={14} /> Export</button>
            <button className="btn btn-primary btn-sm" onClick={doEmail}><Mail size={14} /> Email</button>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 18, marginTop: 18 }}>
          <Stat icon={CalendarCheck} label="Days completed" value={`${data.daysDone}/7`} />
          <Stat icon={NotebookPen} label="Reflections" value={data.myReflections.length} />
          <Stat icon={HandHeart} label="Answered prayers" value={data.answered.length} />
        </div>
      </motion.div>

      {/* Themes */}
      {data.themes.length > 0 && (
        <div className="card card-pad">
          <div className="row" style={{ marginBottom: 12 }}><Hash size={17} style={{ color: 'var(--accent-purple)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.02rem' }}>This Week’s Themes</h2></div>
          <div className="row wrap" style={{ gap: 8 }}>
            {data.themes.map((t) => <span key={t} className="tag" style={{ fontSize: '0.78rem' }}>{t}</span>)}
          </div>
        </div>
      )}

      {/* Reflections */}
      <div className="card card-pad">
        <div className="row" style={{ marginBottom: 14 }}><NotebookPen size={18} style={{ color: 'var(--accent-teal)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Your Reflections</h2></div>
        {data.myReflections.length === 0 ? (
          <div className="muted" style={{ fontSize: '0.88rem' }}>No reflections this week yet — there’s still time.</div>
        ) : (
          <div className="flow" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.myReflections.map((r) => (
              <div key={r.iso} style={{ borderLeft: '2px solid var(--accent-teal)', paddingLeft: 14 }}>
                <div className="gradient-text" style={{ fontWeight: 700, fontSize: '0.84rem' }}>{r.ref || formatShort(r.iso)}</div>
                <p className="muted" style={{ fontSize: '0.9rem', marginTop: 3, lineHeight: 1.5 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends' comments */}
      <div className="card card-pad">
        <div className="row" style={{ marginBottom: 14 }}><MessagesSquare size={18} style={{ color: 'var(--accent-cyan)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Top Insights from Your Circle</h2></div>
        {data.friendComments.length === 0 ? (
          <div className="muted" style={{ fontSize: '0.88rem' }}>No comments from your circle this week.</div>
        ) : (
          <div className="flow" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.friendComments.map((c) => {
              const m = memberById(c.authorId)
              return (
                <div key={c.id} className="row" style={{ gap: 11, alignItems: 'flex-start' }}>
                  <Avatar member={m} size={34} />
                  <div className="bubble" style={{ borderRadius: 14 }}>
                    <div className="comment-name">{m?.name}</div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Prayers */}
      <div className="card card-pad">
        <div className="row" style={{ marginBottom: 14 }}><HandHeart size={18} style={{ color: 'var(--accent-purple)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Prayer & Praise</h2></div>
        <div className="flow" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {data.answered.map((p) => (
            <div key={p.id} className="row" style={{ gap: 9 }}>
              <span style={{ color: 'var(--accent-green)' }}>✓</span>
              <span style={{ fontSize: '0.9rem' }}><b>Answered:</b> {p.title}</span>
            </div>
          ))}
          {data.active.map((p) => (
            <div key={p.id} className="row" style={{ gap: 9 }}>
              <span style={{ color: 'var(--accent-purple)' }}>•</span>
              <span className="muted" style={{ fontSize: '0.9rem' }}>Still praying: {p.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <Icon size={18} className="muted" />
      <div>
        <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{value}</div>
        <div className="faint" style={{ fontSize: '0.74rem' }}>{label}</div>
      </div>
    </div>
  )
}
