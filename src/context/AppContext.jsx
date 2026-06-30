import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'
import { loadState, saveState, clearState } from '../lib/storage.js'
import { buildSeed } from '../data/seed.js'
import { getPlan, readingForDay, verseOfWeek } from '../data/readingPlans.js'
import { generateExplanation, generateDevotional } from '../lib/claude.js'
import { celebrate as fireCelebrate, burst } from '../lib/confetti.js'
import { todayISO, addDays, daysBetween } from '../lib/dates.js'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const MILESTONES = [7, 30, 100, 365]
let toastSeq = 0

function computeStreak(completed) {
  let cursor = todayISO()
  if (!completed[cursor]) cursor = addDays(cursor, -1)
  let n = 0
  while (completed[cursor]) {
    n++
    cursor = addDays(cursor, -1)
  }
  return n
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = loadState()
    return saved && saved.version === 1 ? saved : buildSeed()
  })
  const [toasts, setToasts] = useState([])
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true,
  )
  const firstRun = useRef(true)

  // ---- persist ----
  useEffect(() => {
    saveState(state)
  }, [state])

  // ---- theme ----
  const effectiveTheme =
    state.settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : state.settings.theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      effectiveTheme === 'dark' ? '#060912' : '#eef2fa',
    )
  }, [effectiveTheme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ---- toasts ----
  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const addToast = useCallback(
    (toast) => {
      const id = ++toastSeq
      setToasts((t) => [...t, { id, ...toast }])
      setTimeout(() => removeToast(id), toast.duration || 3800)
      return id
    },
    [removeToast],
  )

  // ---- derived plan / reading ----
  const plan = useMemo(() => getPlan(state.activePlanId), [state.activePlanId])
  const planLength = plan.length || plan.readings.length || 1
  const completedMap = state.progress[state.activePlanId]?.completed || {}

  const dayIndexFor = useCallback(
    (iso) => daysBetween(state.planStartISO, iso),
    [state.planStartISO],
  )
  const readingFor = useCallback(
    (iso) => readingForDay(plan, dayIndexFor(iso)),
    [plan, dayIndexFor],
  )

  const today = todayISO()
  const todayReading = useMemo(() => readingFor(today), [readingFor, today])
  const todayDayNumber = dayIndexFor(today) + 1
  const isTodayComplete = !!completedMap[today]
  const completedCount = Object.keys(completedMap).length
  const completionPct = Math.min(100, Math.round((completedCount / planLength) * 100))
  const currentStreak = useMemo(() => computeStreak(completedMap), [completedMap])
  const weekIndex = Math.floor(dayIndexFor(today) / 7)
  const weeklyVerse = useMemo(() => verseOfWeek(plan, weekIndex), [plan, weekIndex])

  // ---- milestone celebration + best streak ----
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setState((prev) => {
      let next = prev
      if (currentStreak > prev.streak.best) {
        next = { ...next, streak: { ...next.streak, best: currentStreak } }
      }
      const hit = MILESTONES.find(
        (m) => currentStreak >= m && !prev.celebratedMilestones.includes(m),
      )
      if (hit) {
        next = { ...next, celebratedMilestones: [...prev.celebratedMilestones, hit] }
        setTimeout(() => {
          fireCelebrate()
          addToast({
            tone: 'gold',
            icon: 'flame',
            title: `${hit}-day streak! 🔥`,
            msg: milestoneMessage(hit),
            duration: 5200,
          })
        }, 120)
        next = {
          ...next,
          notifications: [
            {
              id: `ms-${hit}-${Date.now()}`,
              type: 'milestone',
              title: `You hit a ${hit}-day streak!`,
              body: milestoneMessage(hit),
              ts: Date.now(),
              read: false,
            },
            ...next.notifications,
          ],
        }
      }
      return next === prev ? prev : next
    })
  }, [currentStreak, addToast])

  // ================= ACTIONS =================

  const markComplete = useCallback(
    (iso = todayISO(), { silent } = {}) => {
      setState((prev) => {
        const planId = prev.activePlanId
        const cur = prev.progress[planId]?.completed || {}
        if (cur[iso]) return prev
        const completed = { ...cur, [iso]: true }
        const progress = {
          ...prev.progress,
          [planId]: { ...prev.progress[planId], completed },
        }
        const completions = {
          ...prev.group.completions,
          me: { ...prev.group.completions.me, [iso]: true },
        }
        return {
          ...prev,
          progress,
          group: { ...prev.group, completions },
          streak: { ...prev.streak, lastCompleted: iso },
        }
      })
      if (!silent) {
        burst({ x: 0.5, y: 0.42 })
        addToast({ tone: 'teal', icon: 'check', title: 'Reading complete', msg: 'Beautifully done. See you tomorrow.' })
      }
    },
    [addToast],
  )

  const toggleComplete = useCallback((iso) => {
    setState((prev) => {
      const planId = prev.activePlanId
      const cur = { ...(prev.progress[planId]?.completed || {}) }
      const meComp = { ...prev.group.completions.me }
      if (cur[iso]) {
        delete cur[iso]
        delete meComp[iso]
      } else {
        cur[iso] = true
        meComp[iso] = true
      }
      return {
        ...prev,
        progress: { ...prev.progress, [planId]: { ...prev.progress[planId], completed: cur } },
        group: { ...prev.group, completions: { ...prev.group.completions, me: meComp } },
      }
    })
  }, [])

  const saveReflection = useCallback((iso, text) => {
    setState((prev) => ({
      ...prev,
      reflections: { ...prev.reflections, [iso]: { text, updatedAt: Date.now() } },
    }))
  }, [])

  const isFavorite = useCallback(
    (reference, text) =>
      state.favorites.some((f) => f.reference === reference && f.text === text),
    [state.favorites],
  )

  const toggleFavorite = useCallback(
    (verse) => {
      let added = false
      setState((prev) => {
        const exists = prev.favorites.find(
          (f) => f.reference === verse.reference && f.text === verse.text,
        )
        if (exists) {
          return { ...prev, favorites: prev.favorites.filter((f) => f.id !== exists.id) }
        }
        added = true
        const fav = {
          id: `f-${Date.now()}`,
          reference: verse.reference,
          text: verse.text,
          tags: verse.tags || [],
          createdAt: Date.now(),
        }
        return { ...prev, favorites: [fav, ...prev.favorites] }
      })
      addToast(
        added
          ? { tone: 'gold', icon: 'heart', title: 'Saved to favorites', msg: verse.reference }
          : { tone: 'dim', icon: 'heart', title: 'Removed from favorites', msg: verse.reference },
      )
      return added
    },
    [addToast],
  )

  const addFavorite = useCallback((verse) => {
    setState((prev) => {
      if (prev.favorites.some((f) => f.reference === verse.reference && f.text === verse.text)) return prev
      return {
        ...prev,
        favorites: [
          { id: `f-${Date.now()}`, reference: verse.reference, text: verse.text, tags: verse.tags || [], createdAt: Date.now() },
          ...prev.favorites,
        ],
      }
    })
  }, [])

  const removeFavorite = useCallback((id) => {
    setState((prev) => ({ ...prev, favorites: prev.favorites.filter((f) => f.id !== id) }))
  }, [])

  const addFavoriteTag = useCallback((id, tag) => {
    const clean = tag.trim().toLowerCase()
    if (!clean) return
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.map((f) =>
        f.id === id && !f.tags.includes(clean) ? { ...f, tags: [...f.tags, clean] } : f,
      ),
    }))
  }, [])

  const removeFavoriteTag = useCallback((id, tag) => {
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.map((f) =>
        f.id === id ? { ...f, tags: f.tags.filter((t) => t !== tag) } : f,
      ),
    }))
  }, [])

  // ---- group ----
  const postComment = useCallback((iso, text) => {
    if (!text.trim()) return
    setState((prev) => {
      const day = prev.group.comments[iso] || []
      const comment = { id: `c-${Date.now()}`, authorId: 'me', text: text.trim(), ts: Date.now() }
      return {
        ...prev,
        group: { ...prev.group, comments: { ...prev.group.comments, [iso]: [...day, comment] } },
      }
    })
  }, [])

  const addPrayer = useCallback(
    ({ title, detail }) => {
      setState((prev) => ({
        ...prev,
        group: {
          ...prev.group,
          prayers: [
            {
              id: `p-${Date.now()}`,
              authorId: 'me',
              title: title.trim(),
              detail: detail.trim(),
              status: 'active',
              createdAt: Date.now(),
              answeredAt: null,
              praying: [],
              updates: [],
            },
            ...prev.group.prayers,
          ],
        },
      }))
      addToast({ tone: 'purple', icon: 'pray', title: 'Prayer added', msg: 'Your circle can pray with you.' })
    },
    [addToast],
  )

  const togglePraying = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      group: {
        ...prev.group,
        prayers: prev.group.prayers.map((p) => {
          if (p.id !== id) return p
          const praying = p.praying.includes('me')
            ? p.praying.filter((x) => x !== 'me')
            : [...p.praying, 'me']
          return { ...p, praying }
        }),
      },
    }))
  }, [])

  const answerPrayer = useCallback(
    (id, updateText) => {
      setState((prev) => ({
        ...prev,
        group: {
          ...prev.group,
          prayers: prev.group.prayers.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'answered',
                  answeredAt: Date.now(),
                  updates: updateText?.trim()
                    ? [...p.updates, { text: updateText.trim(), ts: Date.now() }]
                    : p.updates,
                }
              : p,
          ),
        },
      }))
      setTimeout(fireCelebrate, 80)
      addToast({ tone: 'green', icon: 'check', title: 'Prayer answered! 🎉', msg: 'God is faithful.', duration: 4600 })
    },
    [addToast],
  )

  const reopenPrayer = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      group: {
        ...prev.group,
        prayers: prev.group.prayers.map((p) =>
          p.id === id ? { ...p, status: 'active', answeredAt: null } : p,
        ),
      },
    }))
  }, [])

  const addPrayerUpdate = useCallback((id, text) => {
    if (!text.trim()) return
    setState((prev) => ({
      ...prev,
      group: {
        ...prev.group,
        prayers: prev.group.prayers.map((p) =>
          p.id === id ? { ...p, updates: [...p.updates, { text: text.trim(), ts: Date.now() }] } : p,
        ),
      },
    }))
  }, [])

  // ---- memory verses ----
  const addMemoryVerse = useCallback(
    ({ ref, text }) => {
      setState((prev) => {
        if (prev.memoryVerses.some((m) => m.ref === ref)) return prev
        return {
          ...prev,
          memoryVerses: [
            { id: `m-${Date.now()}`, ref, text, addedISO: todayISO(), mastery: 0, lastReviewed: null },
            ...prev.memoryVerses,
          ],
        }
      })
      addToast({ tone: 'cyan', icon: 'brain', title: 'Added to memory', msg: ref })
    },
    [addToast],
  )

  const reviewMemoryVerse = useCallback((id, correct) => {
    setState((prev) => ({
      ...prev,
      memoryVerses: prev.memoryVerses.map((m) =>
        m.id === id
          ? {
              ...m,
              mastery: Math.max(0, Math.min(5, m.mastery + (correct ? 1 : -1))),
              lastReviewed: Date.now(),
            }
          : m,
      ),
    }))
  }, [])

  const removeMemoryVerse = useCallback((id) => {
    setState((prev) => ({ ...prev, memoryVerses: prev.memoryVerses.filter((m) => m.id !== id) }))
  }, [])

  // ---- settings ----
  const setPlan = useCallback(
    (planId) => {
      setState((prev) => ({ ...prev, activePlanId: planId }))
      const p = getPlan(planId)
      addToast({ tone: 'teal', icon: 'book', title: 'Plan switched', msg: p.name })
    },
    [addToast],
  )

  const setTheme = useCallback((theme) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, theme } }))
  }, [])

  const toggleTheme = useCallback(() => {
    const nextTheme = effectiveTheme === 'dark' ? 'light' : 'dark'
    setState((prev) => ({ ...prev, settings: { ...prev.settings, theme: nextTheme } }))
  }, [effectiveTheme])

  const setApiKey = useCallback((apiKey) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, apiKey } }))
  }, [])

  const setSetting = useCallback((key, value) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }))
  }, [])

  const updateProfile = useCallback((name) => {
    setState((prev) => {
      const initials = name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'
      const members = prev.group.members.map((m) =>
        m.isMe ? { ...m, name: name.trim(), initials } : m,
      )
      return {
        ...prev,
        profile: { ...prev.profile, name: name.trim(), initials },
        group: { ...prev.group, members },
      }
    })
  }, [])

  // ---- AI (cached) ----
  const ensureExplanation = useCallback(
    async (reference, text) => {
      if (state.explanationsCache[reference]) return state.explanationsCache[reference]
      const result = await generateExplanation({ apiKey: state.settings.apiKey, reference, text })
      setState((prev) => ({
        ...prev,
        explanationsCache: { ...prev.explanationsCache, [reference]: result },
      }))
      return result
    },
    [state.explanationsCache, state.settings.apiKey],
  )

  const ensureDevotional = useCallback(
    async (iso, reference, theme) => {
      if (state.devotionalCache[iso]) return state.devotionalCache[iso]
      const result = await generateDevotional({ apiKey: state.settings.apiKey, reference, theme })
      setState((prev) => ({
        ...prev,
        devotionalCache: { ...prev.devotionalCache, [iso]: result },
      }))
      return result
    },
    [state.devotionalCache, state.settings.apiKey],
  )

  // ---- notifications ----
  const dismissNotification = useCallback((id) => {
    setState((prev) => ({ ...prev, notifications: prev.notifications.filter((n) => n.id !== id) }))
  }, [])

  const markNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }))
  }, [])

  const pushNotification = useCallback((note) => {
    setState((prev) => ({
      ...prev,
      notifications: [
        { id: `n-${Date.now()}`, ts: Date.now(), read: false, ...note },
        ...prev.notifications,
      ],
    }))
  }, [])

  // Reading reminder: if today's reading isn't done by render and reminders on.
  useEffect(() => {
    if (!state.settings.reminders) return
    if (isTodayComplete) return
    const exists = state.notifications.some((n) => n.type === 'reminder' && n.day === today)
    if (exists) return
    const t = setTimeout(() => {
      pushNotification({
        type: 'reminder',
        day: today,
        title: 'Today’s reading is waiting',
        body: 'A few quiet minutes in the Word — you’ve got a streak going.',
      })
    }, 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTodayComplete, state.settings.reminders, today])

  const applyInvite = useCallback(
    (code) => {
      setState((prev) => {
        if (prev.seenInvite) return prev
        return { ...prev, seenInvite: true }
      })
      addToast({ tone: 'purple', icon: 'users', title: 'Invite applied', msg: `You’re viewing ${state.group.name}` })
    },
    [addToast, state.group.name],
  )

  const resetApp = useCallback(() => {
    clearState()
    setState(buildSeed())
    addToast({ tone: 'dim', icon: 'check', title: 'Reset complete', msg: 'Fresh start with sample data.' })
  }, [addToast])

  const value = {
    ...state,
    plan,
    planLength,
    completedMap,
    today,
    todayReading,
    todayDayNumber,
    isTodayComplete,
    completedCount,
    completionPct,
    currentStreak,
    bestStreak: Math.max(state.streak.best, currentStreak),
    weeklyVerse,
    effectiveTheme,
    dayIndexFor,
    readingFor,
    // actions
    markComplete,
    toggleComplete,
    saveReflection,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    addFavoriteTag,
    removeFavoriteTag,
    postComment,
    addPrayer,
    togglePraying,
    answerPrayer,
    reopenPrayer,
    addPrayerUpdate,
    addMemoryVerse,
    reviewMemoryVerse,
    removeMemoryVerse,
    setPlan,
    setTheme,
    toggleTheme,
    setApiKey,
    setSetting,
    updateProfile,
    ensureExplanation,
    ensureDevotional,
    dismissNotification,
    markNotificationsRead,
    pushNotification,
    applyInvite,
    resetApp,
    // toasts
    toasts,
    addToast,
    removeToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function milestoneMessage(n) {
  switch (n) {
    case 7:
      return 'A full week in the Word. A rhythm is forming.'
    case 30:
      return 'Thirty days! This is becoming who you are.'
    case 100:
      return 'One hundred days of faithfulness. Remarkable.'
    case 365:
      return 'A whole year. What God has built in you is no small thing.'
    default:
      return 'Keep going — every day counts.'
  }
}
