// Date helpers — all ISO dates are local 'YYYY-MM-DD' strings.

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MON_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function toISO(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO() {
  return toISO(new Date())
}

export function addDays(iso, n) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export function daysBetween(a, b) {
  const ms = fromISO(b).getTime() - fromISO(a).getTime()
  return Math.round(ms / 86400000)
}

export function isToday(iso) {
  return iso === todayISO()
}

export function isFuture(iso) {
  return daysBetween(todayISO(), iso) > 0
}

export function weekday(iso) {
  return DOW[fromISO(iso).getDay()]
}

export function formatLong(iso) {
  const d = fromISO(iso)
  return `${DOW_FULL[d.getDay()]}, ${MON_FULL[d.getMonth()]} ${d.getDate()}`
}

export function formatMedium(iso) {
  const d = fromISO(iso)
  return `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function formatShort(iso) {
  const d = fromISO(iso)
  return `${MON[d.getMonth()]} ${d.getDate()}`
}

// last N days including today, oldest first
export function lastNDays(n, endISO = todayISO()) {
  return Array.from({ length: n }, (_, i) => addDays(endISO, -(n - 1 - i)))
}

// Build a month grid (array of weeks of 7 ISO strings, padded with prev/next month days)
export function monthMatrix(year, month) {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const start = new Date(year, month, 1 - startOffset)
  const weeks = []
  let cur = start
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      week.push({ iso: toISO(cur), inMonth: cur.getMonth() === month, day: cur.getDate() })
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1)
    }
    weeks.push(week)
    if (cur.getMonth() !== month && w >= 4) break
  }
  return weeks
}

export function monthLabel(year, month) {
  return `${MON_FULL[month]} ${year}`
}

export function relativeTime(ts) {
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 45) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'yesterday'
  if (day < 7) return `${day}d ago`
  const wk = Math.floor(day / 7)
  if (wk < 5) return `${wk}w ago`
  return formatShort(toISO(new Date(ts)))
}

export const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
