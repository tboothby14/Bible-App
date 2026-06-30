import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, ChevronLeft, ChevronRight, Trophy, CalendarCheck, Target, Award } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { RingStat } from '../components/ui.jsx'
import { monthMatrix, monthLabel, todayISO, isFuture, fromISO } from '../lib/dates.js'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MILESTONES = [7, 30, 100, 365]

export default function Progress() {
  const app = useApp()
  const now = fromISO(todayISO())
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const weeks = monthMatrix(cursor.y, cursor.m)
  const today = todayISO()

  const nextMilestone = MILESTONES.find((m) => m > app.currentStreak) || app.currentStreak
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= app.currentStreak) || 0
  const msProgress = Math.round(((app.currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)

  const shift = (d) => {
    setCursor((c) => {
      const m = c.m + d
      if (m < 0) return { y: c.y - 1, m: 11 }
      if (m > 11) return { y: c.y + 1, m: 0 }
      return { ...c, m }
    })
  }

  return (
    <div className="flow">
      {/* Streak hero */}
      <motion.div className="card card-pad card-glow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="row-between wrap" style={{ gap: 18 }}>
          <div className="streak-hero">
            <div className="flame"><Flame size={32} color="#fff" /></div>
            <div>
              <div className="streak-num gradient-text">{app.currentStreak}</div>
              <div className="muted" style={{ fontWeight: 600 }}>day streak</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="row" style={{ justifyContent: 'flex-end', color: 'var(--accent-gold)' }}>
              <Trophy size={16} /> <b>Personal best</b>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{app.bestStreak} days</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div className="row-between" style={{ marginBottom: 7 }}>
            <span className="muted" style={{ fontSize: '0.82rem' }}>{app.currentStreak} / {nextMilestone} days to next milestone</span>
            <span className="chip active" style={{ fontSize: '0.7rem' }}>🔥 {nextMilestone}-day badge</span>
          </div>
          <div className="bar"><motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${msProgress}%` }} /></div>
        </div>
      </motion.div>

      {/* Completion + tiles */}
      <div className="grid-2">
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <RingStat value={app.completionPct} size={130}>
            <div className="stat-value" style={{ fontSize: '1.7rem' }}>{app.completionPct}%</div>
            <div className="faint" style={{ fontSize: '0.72rem' }}>complete</div>
          </RingStat>
          <div>
            <div className="eyebrow">{app.plan.short}</div>
            <div style={{ fontWeight: 750, fontSize: '1.05rem', marginTop: 3 }}>{app.completedCount} of {app.planLength} days</div>
            <div className="muted" style={{ fontSize: '0.84rem', marginTop: 4, lineHeight: 1.4 }}>You’re building something lasting, one day at a time.</div>
          </div>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Tile icon={Flame} tone="var(--grad-warm)" value={app.currentStreak} label="Current streak" />
          <Tile icon={Award} tone="var(--grad-purple)" value={app.bestStreak} label="Longest streak" />
          <Tile icon={CalendarCheck} tone="var(--grad-teal)" value={app.completedCount} label="Days completed" />
          <Tile icon={Target} tone="linear-gradient(135deg,#38bdf8,#22d3ee)" value={`${app.completionPct}%`} label="Plan progress" />
        </div>
      </div>

      {/* Calendar */}
      <div className="card card-pad">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontWeight: 750, fontSize: '1.1rem' }}>{monthLabel(cursor.y, cursor.m)}</h2>
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => shift(-1)}><ChevronLeft size={17} /></button>
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => shift(1)}><ChevronRight size={17} /></button>
          </div>
        </div>
        <div className="cal-grid" style={{ marginBottom: 7 }}>
          {DOW.map((d, i) => <div key={i} className="cal-dow">{d}</div>)}
        </div>
        <div className="cal-grid">
          {weeks.flat().map((cell, i) => {
            const done = !!app.completedMap[cell.iso]
            const isTodayCell = cell.iso === today
            const future = isFuture(cell.iso)
            return (
              <motion.button
                key={cell.iso + i}
                className={`cal-cell ${!cell.inMonth ? 'muted' : ''} ${done ? 'done' : ''} ${isTodayCell ? 'today' : ''} ${future ? 'future' : ''}`}
                whileTap={{ scale: 0.88 }}
                onClick={() => !future && app.toggleComplete(cell.iso)}
                title={future ? 'Upcoming' : done ? 'Completed — tap to undo' : 'Tap to mark complete'}
              >
                {cell.day}
              </motion.button>
            )
          })}
        </div>
        <div className="row" style={{ gap: 18, marginTop: 14, fontSize: '0.76rem' }}>
          <span className="row" style={{ gap: 6 }}><span style={{ width: 13, height: 13, borderRadius: 4, background: 'var(--grad-primary)' }} /> <span className="muted">Completed</span></span>
          <span className="row" style={{ gap: 6 }}><span style={{ width: 13, height: 13, borderRadius: 4, border: '1.5px solid var(--accent-purple)' }} /> <span className="muted">Today</span></span>
        </div>
      </div>
    </div>
  )
}

function Tile({ icon: Icon, tone, value, label }) {
  return (
    <div className="stat-tile">
      <div className="icon-wrap" style={{ background: tone, color: '#04121a' }}><Icon size={19} /></div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
