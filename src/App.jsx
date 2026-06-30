import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Sun, CalendarCheck, NotebookPen, Heart, Brain, Users, HandHeart,
  BarChart3, Compass, Newspaper, Settings as SettingsIcon, Bell, Moon,
  Sparkles, Menu, X, Flame, MoreHorizontal,
} from 'lucide-react'
import { useApp } from './context/AppContext.jsx'
import { NavContext } from './context/nav.js'
import { Toasts, Avatar } from './components/ui.jsx'
import { relativeTime, formatLong } from './lib/dates.js'

import DailyReading from './pages/DailyReading.jsx'
import Progress from './pages/Progress.jsx'
import Reflections from './pages/Reflections.jsx'
import Favorites from './pages/Favorites.jsx'
import Memory from './pages/Memory.jsx'
import Group from './pages/Group.jsx'
import PrayerBoard from './pages/PrayerBoard.jsx'
import Stats from './pages/Stats.jsx'
import Theology from './pages/Theology.jsx'
import Digest from './pages/Digest.jsx'
import SettingsPage from './pages/Settings.jsx'

const NAV = [
  {
    group: 'Daily',
    items: [
      { id: 'today', label: 'Today', icon: Sun },
      { id: 'progress', label: 'Progress', icon: CalendarCheck },
      { id: 'reflections', label: 'Reflections', icon: NotebookPen },
      { id: 'favorites', label: 'Favorites', icon: Heart },
      { id: 'memory', label: 'Verse Memory', icon: Brain },
    ],
  },
  {
    group: 'Community',
    items: [
      { id: 'group', label: 'Sunrise Circle', icon: Users },
      { id: 'prayer', label: 'Prayer Board', icon: HandHeart },
    ],
  },
  {
    group: 'Discover',
    items: [
      { id: 'stats', label: 'Statistics', icon: BarChart3 },
      { id: 'theology', label: 'Theology', icon: Compass },
      { id: 'digest', label: 'Weekly Digest', icon: Newspaper },
    ],
  },
]

const PAGES = {
  today: DailyReading,
  progress: Progress,
  reflections: Reflections,
  favorites: Favorites,
  memory: Memory,
  group: Group,
  prayer: PrayerBoard,
  stats: Stats,
  theology: Theology,
  digest: Digest,
  settings: SettingsPage,
}

const TITLES = {
  today: 'Today',
  progress: 'Your Progress',
  reflections: 'Reflections',
  favorites: 'Favorite Verses',
  memory: 'Verse Memory',
  group: 'Sunrise Circle',
  prayer: 'Prayer Board',
  stats: 'Statistics',
  theology: 'Theology Deep-Dives',
  digest: 'Weekly Digest',
  settings: 'Settings',
}

export default function App() {
  const app = useApp()
  const [view, setView] = useState('today')
  const [params, setParams] = useState({})
  const [bellOpen, setBellOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const go = (next, p = {}) => {
    setParams(p)
    setView(next)
    setBellOpen(false)
    setMoreOpen(false)
    window.scrollTo({ top: 0 })
    document.querySelector('.page-scroll')?.scrollTo?.({ top: 0 })
  }

  // Apply ?invite=CODE
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('invite')
    if (code) {
      app.applyInvite(code)
      go('group')
      window.history.replaceState({}, '', window.location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unread = app.notifications.filter((n) => !n.read).length
  const activePrayers = app.group.prayers.filter((p) => p.status === 'active').length

  const Current = PAGES[view] || DailyReading

  const subtitle = useMemo(() => {
    switch (view) {
      case 'today': return formatLong(app.today)
      case 'group': return `${app.group.members.length} members · invite ${app.group.inviteCode}`
      case 'prayer': return `${activePrayers} active · ${app.group.prayers.filter((p) => p.status === 'answered').length} answered`
      case 'progress': return app.plan.name
      default: return null
    }
  }, [view, app.today, app.group, activePrayers, app.plan.name])

  return (
    <NavContext.Provider value={{ view, params, go }}>
      <div className="app-bg" />
      <div className="app-shell">
        {/* ---------- Sidebar ---------- */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark"><Sparkles size={20} color="#04121a" /></div>
            <div>
              <div className="brand-name">Lumen</div>
              <div className="brand-sub">Bible Study</div>
            </div>
          </div>
          <nav style={{ flex: 1, overflowY: 'auto' }}>
            {NAV.map((g) => (
              <div key={g.group}>
                <div className="nav-group-label">{g.group}</div>
                {g.items.map((it) => (
                  <button
                    key={it.id}
                    className={`nav-item ${view === it.id ? 'active' : ''}`}
                    onClick={() => go(it.id)}
                  >
                    <it.icon size={18} />
                    {it.label}
                    {it.id === 'prayer' && activePrayers > 0 && <span className="nav-badge">{activePrayers}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-foot">
            <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => go('settings')}>
              <SettingsIcon size={18} /> Settings
            </button>
            <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar member={app.profile} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.profile.name}</div>
                <div className="faint" style={{ fontSize: '0.72rem' }}>🔥 {app.currentStreak}-day streak</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------- Main ---------- */}
        <div className="main-area">
          <header className="topbar">
            <div className="topbar-title">
              <h1>{TITLES[view]}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            <div className="topbar-actions">
              <div className="chip" style={{ padding: '7px 12px' }} title="Current streak">
                <Flame size={15} style={{ color: 'var(--accent-gold)' }} />
                <b>{app.currentStreak}</b>
              </div>
              <div style={{ position: 'relative' }}>
                <button className="icon-btn" onClick={() => { setBellOpen((o) => !o); app.markNotificationsRead() }} aria-label="Notifications">
                  <Bell size={18} />
                  {unread > 0 && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 9, height: 9, borderRadius: '50%', background: 'var(--accent-pink)', boxShadow: '0 0 0 2px var(--bg)' }} />
                  )}
                </button>
                <AnimatePresence>
                  {bellOpen && (
                    <NotificationPanel onClose={() => setBellOpen(false)} />
                  )}
                </AnimatePresence>
              </div>
              <button className="icon-btn" onClick={app.toggleTheme} aria-label="Toggle theme">
                {app.effectiveTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>

          <main className="page-scroll">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Current />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ---------- Mobile nav ---------- */}
      <nav className="mobile-nav">
        {[
          { id: 'today', label: 'Today', icon: Sun },
          { id: 'progress', label: 'Progress', icon: CalendarCheck },
          { id: 'group', label: 'Circle', icon: Users },
          { id: 'prayer', label: 'Prayer', icon: HandHeart },
          { id: '__more', label: 'More', icon: MoreHorizontal },
        ].map((it) => (
          <button
            key={it.id}
            className={view === it.id ? 'active' : ''}
            onClick={() => (it.id === '__more' ? setMoreOpen(true) : go(it.id))}
          >
            <it.icon size={21} />
            {it.label}
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="mobile-more-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              className="card"
              style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: 18, maxHeight: '70vh', overflowY: 'auto' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="row-between" style={{ marginBottom: 12 }}>
                <h3 style={{ fontWeight: 750 }}>Menu</h3>
                <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setMoreOpen(false)}><X size={17} /></button>
              </div>
              <div className="grid-auto" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[...NAV.flatMap((g) => g.items), { id: 'settings', label: 'Settings', icon: SettingsIcon }].map((it) => (
                  <button key={it.id} className={`nav-item ${view === it.id ? 'active' : ''}`} style={{ background: 'var(--surface-2)' }} onClick={() => go(it.id)}>
                    <it.icon size={18} /> {it.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toasts />
    </NavContext.Provider>
  )
}

function NotificationPanel({ onClose }) {
  const { notifications, dismissNotification } = useApp()
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      style={{ position: 'absolute', right: 0, top: 48, width: 320, padding: 14, zIndex: 50 }}
    >
      <div className="row-between" style={{ marginBottom: 10 }}>
        <b style={{ fontSize: '0.92rem' }}>Notifications</b>
        <button className="faint" style={{ fontSize: '0.74rem' }} onClick={onClose}>Close</button>
      </div>
      {notifications.length === 0 ? (
        <div className="muted center" style={{ fontSize: '0.84rem', padding: '14px 0' }}>You’re all caught up ✨</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
          {notifications.map((n) => (
            <div key={n.id} className="card" style={{ padding: 12, background: 'var(--surface-2)' }}>
              <div className="row-between">
                <b style={{ fontSize: '0.84rem' }}>{n.title}</b>
                <button className="faint" onClick={() => dismissNotification(n.id)}><X size={14} /></button>
              </div>
              <div className="muted" style={{ fontSize: '0.8rem', marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
              <div className="faint" style={{ fontSize: '0.7rem', marginTop: 5 }}>{relativeTime(n.ts)}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
