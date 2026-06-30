import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookText, Flame, Award, CalendarDays, Hash, TrendingUp, Sparkles, Library } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Sparkline } from '../components/ui.jsx'
import { PASSAGES } from '../data/bibleText.js'
import { lastNDays, fromISO, todayISO } from '../lib/dates.js'

const STOPWORDS = new Set([
  'about', 'above', 'after', 'again', 'their', 'there', 'these', 'thing', 'think', 'today', 'which',
  'would', 'could', 'should', 'because', 'being', 'where', 'while', 'every', 'still', 'going', 'really',
  'something', 'myself', 'instead', 'whatever', 'always', 'never', 'cannot', 'though', 'around', 'rather',
  'that', 'this', 'with', 'have', 'from', 'they', 'will', 'into', 'just', 'when', 'than', 'then', 'them',
  'what', 'your', 'about', 'over', 'much', 'keep', 'know', 'feel', 'like', 'need', 'want', 'even', 'more',
])

function bookOf(ref) {
  const m = ref.match(/^([\d\s]*[A-Za-z][A-Za-z\s]*?)\s+\d/)
  return m ? m[1].trim() : ref
}

export default function Stats() {
  const app = useApp()
  const today = todayISO()
  const completed = Object.keys(app.completedMap)

  const stats = useMemo(() => {
    // verses read
    let verses = app.statsBaseline.versesRead
    completed.forEach((iso) => {
      const ref = app.readingFor(iso)?.ref
      verses += PASSAGES[ref]?.verses.length || 5
    })

    // days this month / year
    const now = fromISO(today)
    const thisMonth = completed.filter((iso) => {
      const d = fromISO(iso)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const thisYear = completed.filter((iso) => fromISO(iso).getFullYear() === now.getFullYear()).length

    // favorite books
    const bookCount = {}
    const bump = (ref, n = 1) => { const b = bookOf(ref); bookCount[b] = (bookCount[b] || 0) + n }
    completed.forEach((iso) => app.readingFor(iso)?.ref && bump(app.readingFor(iso).ref))
    app.favorites.forEach((f) => bump(f.reference))
    app.memoryVerses.forEach((m) => bump(m.ref))
    const books = Object.entries(bookCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const maxBook = books[0]?.[1] || 1

    // themes from reflections
    const wordCount = {}
    let totalWords = 0
    let entryCount = 0
    Object.values(app.reflections).forEach((r) => {
      if (!r.text?.trim()) return
      entryCount++
      const words = r.text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
      totalWords += words.filter(Boolean).length
      words.forEach((w) => {
        if (w.length > 4 && !STOPWORDS.has(w)) wordCount[w] = (wordCount[w] || 0) + 1
      })
    })
    app.favorites.forEach((f) => f.tags.forEach((t) => { wordCount[t] = (wordCount[t] || 0) + 2 }))
    const themes = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 12)
    const avgWords = entryCount ? Math.round(totalWords / entryCount) : 0

    // sparkline last 14 days (reflection words)
    const spark = lastNDays(14).map((iso) => {
      const r = app.reflections[iso]
      return r?.text?.trim() ? r.text.trim().split(/\s+/).length : 0
    })

    return { verses, thisMonth, thisYear, books, maxBook, themes, avgWords, spark }
  }, [completed, app.reflections, app.favorites, app.memoryVerses, app.statsBaseline, app.readingFor, today])

  return (
    <div className="flow">
      {/* Top tiles */}
      <div className="stat-grid">
        <Tile icon={BookText} tone="var(--grad-teal)" value={stats.verses.toLocaleString()} label="Verses read" />
        <Tile icon={Award} tone="var(--grad-purple)" value={app.bestStreak} label="Longest streak" />
        <Tile icon={Flame} tone="var(--grad-warm)" value={app.currentStreak} label="Current streak" />
        <Tile icon={CalendarDays} tone="linear-gradient(135deg,#38bdf8,#22d3ee)" value={app.completedCount} label="Total days" />
      </div>

      <div className="grid-2">
        {/* Favorite books */}
        <div className="card card-pad">
          <div className="row" style={{ marginBottom: 16 }}><Library size={18} style={{ color: 'var(--accent-teal)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Favorite Books</h2></div>
          <div className="flow" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {stats.books.map(([book, n], i) => (
              <div key={book}>
                <div className="row-between" style={{ marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{book}</span>
                  <span className="faint" style={{ fontSize: '0.78rem' }}>{n} {n === 1 ? 'time' : 'times'}</span>
                </div>
                <div className="bar"><motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${(n / stats.maxBook) * 100}%` }} transition={{ delay: i * 0.05 }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection activity */}
        <div className="card card-pad">
          <div className="row" style={{ marginBottom: 16 }}><TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Reflection Activity</h2></div>
          <div className="row-between" style={{ marginBottom: 18 }}>
            <div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats.avgWords}</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>avg words / entry</div>
            </div>
            <Sparkline data={stats.spark} width={150} height={44} color="var(--accent-cyan)" />
          </div>
          <div className="divider" />
          <div className="row-between">
            <div><div className="stat-value" style={{ fontSize: '1.3rem' }}>{stats.thisMonth}</div><div className="muted" style={{ fontSize: '0.78rem' }}>this month</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.3rem' }}>{stats.thisYear}</div><div className="muted" style={{ fontSize: '0.78rem' }}>this year</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.3rem' }}>{Object.values(app.reflections).filter((r) => r.text?.trim()).length}</div><div className="muted" style={{ fontSize: '0.78rem' }}>reflections</div></div>
          </div>
        </div>
      </div>

      {/* Themes */}
      <div className="card card-pad">
        <div className="row" style={{ marginBottom: 16 }}><Hash size={18} style={{ color: 'var(--accent-purple)' }} /><h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>Themes You Return To</h2></div>
        {stats.themes.length === 0 ? (
          <div className="muted" style={{ fontSize: '0.88rem' }}>Write a few reflections and your recurring themes will surface here.</div>
        ) : (
          <div className="row wrap" style={{ gap: 9 }}>
            {stats.themes.map(([word, n], i) => {
              const scale = 0.82 + Math.min(n, 5) * 0.12
              return (
                <motion.span
                  key={word}
                  className="chip"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ fontSize: `${scale}rem`, background: 'rgba(167,139,250,0.12)', borderColor: 'rgba(167,139,250,0.25)', color: 'var(--accent-purple)' }}
                >
                  {word} <span style={{ opacity: 0.6 }}>{n}</span>
                </motion.span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Tile({ icon: Icon, tone, value, label }) {
  return (
    <motion.div className="stat-tile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="icon-wrap" style={{ background: tone, color: '#04121a' }}><Icon size={19} /></div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  )
}
