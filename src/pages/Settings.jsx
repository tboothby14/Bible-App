import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Sparkles, Palette, Bell, RotateCcw, Eye, EyeOff, Check, Loader2, ExternalLink, BookOpen,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Avatar, Switch, Segmented } from '../components/ui.jsx'
import { testApiKey } from '../lib/claude.js'
import { TRANSLATION_FULL } from '../data/bibleText.js'

export default function Settings() {
  const app = useApp()
  const [name, setName] = useState(app.profile.name)
  const [key, setKey] = useState(app.settings.apiKey)
  const [show, setShow] = useState(false)
  const [testing, setTesting] = useState(false)
  const [keyStatus, setKeyStatus] = useState(null)

  const saveName = () => {
    if (name.trim() && name.trim() !== app.profile.name) app.updateProfile(name)
  }

  const saveKey = (val) => {
    setKey(val)
    app.setApiKey(val.trim())
    setKeyStatus(null)
  }

  const verify = async () => {
    if (!key.trim()) return
    setTesting(true)
    setKeyStatus(null)
    try {
      await testApiKey(key.trim())
      setKeyStatus('ok')
      app.addToast({ tone: 'green', icon: 'check', title: 'API key works', msg: 'Live AI insights enabled.' })
    } catch (e) {
      setKeyStatus('error:' + (e.message || 'failed'))
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flow" style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Profile */}
      <Card icon={User} title="Profile" tone="var(--grad-teal)">
        <div className="row" style={{ gap: 16, marginBottom: 16 }}>
          <Avatar member={app.profile} size={56} />
          <div>
            <div className="faint" style={{ fontSize: '0.74rem' }}>Member since {new Date(app.profile.joinedISO).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
            <div style={{ fontWeight: 700 }}>🔥 {app.currentStreak}-day streak · {app.completedCount} days read</div>
          </div>
        </div>
        <label className="faint" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Display name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
      </Card>

      {/* Claude AI */}
      <Card icon={Sparkles} title="AI Insights" tone="var(--grad-purple)">
        <p className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.55, marginBottom: 14 }}>
          Connect your Anthropic API key to generate live passage explanations and devotional lines with <b>Claude Sonnet</b>. Without a key, the app uses thoughtful built-in samples. Your key is stored only in this browser.
        </p>
        <label className="faint" style={{ fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>Anthropic API key</label>
        <div className="row" style={{ gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="input"
              type={show ? 'text' : 'password'}
              placeholder="sk-ant-..."
              value={key}
              onChange={(e) => saveKey(e.target.value)}
              style={{ paddingRight: 40 }}
            />
            <button className="faint" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShow((s) => !s)}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="btn btn-ghost" onClick={verify} disabled={!key.trim() || testing}>
            {testing ? <Loader2 size={16} className="spin" /> : keyStatus === 'ok' ? <Check size={16} /> : 'Test'}
          </button>
        </div>
        {keyStatus === 'ok' && <div style={{ color: 'var(--accent-green)', fontSize: '0.8rem', marginTop: 8 }}>✓ Connected — live AI is on.</div>}
        {keyStatus?.startsWith('error') && <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: 8 }}>{keyStatus.slice(6)}</div>}
        <a className="row" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: 12, gap: 5 }}>
          Get an API key <ExternalLink size={13} />
        </a>
      </Card>

      {/* Appearance */}
      <Card icon={Palette} title="Appearance" tone="linear-gradient(135deg,#38bdf8,#22d3ee)">
        <div className="row-between">
          <div>
            <div style={{ fontWeight: 650 }}>Theme</div>
            <div className="faint" style={{ fontSize: '0.8rem' }}>Auto-detects your system preference</div>
          </div>
          <Segmented
            value={app.settings.theme}
            onChange={app.setTheme}
            options={[{ value: 'system', label: 'Auto' }, { value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card icon={Bell} title="Reminders" tone="var(--grad-warm)">
        <div className="row-between">
          <div>
            <div style={{ fontWeight: 650 }}>Daily reading reminder</div>
            <div className="faint" style={{ fontSize: '0.8rem' }}>A gentle in-app nudge if today’s reading isn’t done</div>
          </div>
          <Switch on={app.settings.reminders} onClick={() => app.setSetting('reminders', !app.settings.reminders)} />
        </div>
      </Card>

      {/* About / reset */}
      <Card icon={BookOpen} title="About" tone="var(--surface-hover)" tdark>
        <div className="muted" style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
          <div className="row-between"><span>Translation</span><b style={{ color: 'var(--text)' }}>{TRANSLATION_FULL}</b></div>
          <div className="divider" />
          <div className="row-between"><span>Active plan</span><b style={{ color: 'var(--text)' }}>{app.plan.name}</b></div>
          <div className="divider" />
          <div className="row-between"><span>Your data</span><span>Stored locally in this browser</span></div>
        </div>
        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 16, color: 'var(--accent-red)', borderColor: 'rgba(251,113,133,0.3)' }}
          onClick={() => {
            if (window.confirm('Reset all data and restore the sample content? This cannot be undone.')) app.resetApp()
          }}
        >
          <RotateCcw size={15} /> Reset app to sample data
        </button>
      </Card>

      <div className="center faint" style={{ fontSize: '0.78rem', padding: '8px 0 20px' }}>
        Lumen · made for daily light ✨
      </div>
    </div>
  )
}

function Card({ icon: Icon, title, tone, tdark, children }) {
  return (
    <motion.div className="card card-pad" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="row" style={{ marginBottom: 16 }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', background: tone, color: tdark ? 'var(--text)' : '#04121a' }}><Icon size={18} /></span>
        <h2 style={{ fontWeight: 750, fontSize: '1.06rem' }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}
