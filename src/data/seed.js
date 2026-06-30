// MVP seed state. Built relative to "today" so streaks, calendars and the
// group feed always look alive. Used only on first load (no saved state).

import { todayISO, addDays, lastNDays } from '../lib/dates.js'

export const MEMBER_COLORS = {
  me: 'linear-gradient(135deg,#2dd4bf,#38bdf8)',
  maya: 'linear-gradient(135deg,#a78bfa,#818cf8)',
  daniel: 'linear-gradient(135deg,#38bdf8,#22d3ee)',
  sofia: 'linear-gradient(135deg,#f472b6,#fb7185)',
}

function ts(daysAgo, hour = 8) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, Math.floor((daysAgo * 17) % 60), 0, 0)
  return d.getTime()
}

export function buildSeed() {
  const today = todayISO()
  const days = lastNDays(7) // oldest -> newest, includes today
  const [d6, d5, d4, d3, d2, d1] = days // d1 = yesterday

  const members = [
    { id: 'me', name: 'Thomas', initials: 'T', avatar: MEMBER_COLORS.me, isMe: true },
    { id: 'maya', name: 'Maya Chen', initials: 'MC', avatar: MEMBER_COLORS.maya },
    { id: 'daniel', name: 'Daniel Okafor', initials: 'DO', avatar: MEMBER_COLORS.daniel },
    { id: 'sofia', name: 'Sofia Reyes', initials: 'SR', avatar: MEMBER_COLORS.sofia },
  ]

  // Reflections for the past 7 days (not today — that's still open).
  const reflections = {
    [d6]: {
      text: 'Starting in the Word again. “In the beginning God created” — there is comfort knowing nothing in my life is outside his making. He brings order to formless places.',
      updatedAt: ts(6),
    },
    [d5]: {
      text: 'Psalm 1 — I want my roots near the stream, not blown around like chaff. Convicted about what I let shape my thinking. Delighting in his word, not just reading it.',
      updatedAt: ts(5),
    },
    [d4]: {
      text: 'The Beatitudes flip everything. Blessed are the poor in spirit. I keep trying to be strong; Jesus blesses the ones who know they are not. A grace I needed today.',
      updatedAt: ts(4),
    },
    [d3]: {
      text: 'Psalm 23 will never get old. “I shall lack nothing.” Sat with that line for a while. Trying to trust the Shepherd with the thing I keep gripping so tightly.',
      updatedAt: ts(3),
    },
    [d2]: {
      text: 'John 1 — the light shines in the darkness and the darkness has not overcome it. Whatever this week holds, that sentence is steady ground. Grateful.',
      updatedAt: ts(2),
    },
    [d1]: {
      text: 'Proverbs 3 — “Trust in the Lord with all your heart, and lean not on your own understanding.” Leaning is exactly what I do. Asking for grace to acknowledge him today.',
      updatedAt: ts(1),
    },
  }

  // Group comments per reading day.
  const comments = {
    [d6]: [
      { id: 'c1', authorId: 'maya', text: 'Genesis 1 hits different in the morning. He still speaks light into dark places. 🌅', ts: ts(6, 7) },
      { id: 'c2', authorId: 'daniel', text: 'Needed this start. Praying over a chaotic week and trusting he brings order.', ts: ts(6, 9) },
    ],
    [d5]: [
      { id: 'c3', authorId: 'sofia', text: '“like a tree planted by the streams of water” — that’s the prayer for this season.', ts: ts(5, 8) },
    ],
    [d4]: [
      { id: 'c4', authorId: 'daniel', text: 'Blessed are the meek really challenged me today.', ts: ts(4, 7) },
      { id: 'c5', authorId: 'maya', text: 'Same. Strength under control, not weakness. ❤️', ts: ts(4, 8) },
    ],
    [d3]: [
      { id: 'c6', authorId: 'maya', text: 'My cup runs over. Counting blessings instead of worries tonight.', ts: ts(3, 21) },
      { id: 'c7', authorId: 'sofia', text: 'Praying you feel led beside still waters this week, Thomas. 🙏', ts: ts(3, 21) },
    ],
    [d2]: [
      { id: 'c8', authorId: 'daniel', text: 'The light shines in the darkness. Holding onto that one today.', ts: ts(2, 6) },
    ],
    [d1]: [
      { id: 'c9', authorId: 'sofia', text: 'Trust > understanding. Easier said than lived but he is faithful.', ts: ts(1, 7) },
      { id: 'c10', authorId: 'maya', text: 'Amen. Straight paths, even when I can’t see the next bend.', ts: ts(1, 9) },
    ],
    [today]: [
      { id: 'c11', authorId: 'maya', text: 'Good morning, circle! Already done today’s reading. So good. ☀️', ts: ts(0, 6) },
    ],
  }

  // Who has completed each of the last 7 days (the group calendar).
  const completions = {
    me: { [d6]: true, [d5]: true, [d4]: true, [d3]: true, [d2]: true, [d1]: true },
    maya: { [d6]: true, [d5]: true, [d4]: true, [d3]: true, [d2]: true, [d1]: true, [today]: true },
    daniel: { [d6]: true, [d5]: true, [d3]: true, [d2]: true, [d1]: true, [today]: true },
    sofia: { [d6]: true, [d4]: true, [d3]: true, [d2]: true, [d1]: true },
  }

  const prayers = [
    {
      id: 'p1', authorId: 'maya', title: 'Job interview Thursday',
      detail: 'Interviewing for a role I’d love. Praying for peace and clarity, and that God’s will would be done either way.',
      status: 'active', createdAt: ts(2), answeredAt: null, praying: ['me', 'daniel', 'sofia'],
      updates: [{ text: 'Made it to the final round! Thank you all for praying.', ts: ts(1, 18) }],
    },
    {
      id: 'p2', authorId: 'daniel', title: 'Strength for my mom’s surgery',
      detail: 'Her procedure is next week. Praying for the surgeons’ hands and for our family’s peace.',
      status: 'active', createdAt: ts(3), answeredAt: null, praying: ['me', 'maya'],
      updates: [],
    },
    {
      id: 'p3', authorId: 'sofia', title: 'Housing for the fall',
      detail: 'Lease fell through and I needed a place by month’s end.',
      status: 'answered', createdAt: ts(12), answeredAt: ts(4), praying: ['me', 'maya', 'daniel'],
      updates: [{ text: 'Signed a lease today — a better place than the first! God provides. 🙌', ts: ts(4, 15) }],
    },
    {
      id: 'p4', authorId: 'me', title: 'Peace during finals',
      detail: 'Exams stacked up and anxiety was high.',
      status: 'answered', createdAt: ts(15), answeredAt: ts(6), praying: ['maya', 'daniel', 'sofia'],
      updates: [{ text: 'Finished, and the peace of Philippians 4 carried me. Grateful.', ts: ts(6, 16) }],
    },
    {
      id: 'p5', authorId: 'maya', title: 'Healing for my friend',
      detail: 'A close friend was in the hospital.',
      status: 'answered', createdAt: ts(20), answeredAt: ts(9), praying: ['me', 'sofia'],
      updates: [{ text: 'She’s home and recovering well. Thank you, Jesus.', ts: ts(9, 12) }],
    },
  ]

  const favorites = [
    {
      id: 'f1', reference: 'Philippians 4:6-7',
      text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts.',
      tags: ['peace', 'anxiety'], createdAt: ts(5),
    },
    {
      id: 'f2', reference: 'Psalm 23:1',
      text: 'The LORD is my shepherd; I shall lack nothing.',
      tags: ['trust', 'comfort'], createdAt: ts(3),
    },
    {
      id: 'f3', reference: 'Isaiah 40:31',
      text: 'Those who wait for the LORD will renew their strength. They will mount up with wings like eagles.',
      tags: ['strength', 'hope'], createdAt: ts(1),
    },
  ]

  const memoryVerses = [
    { id: 'm1', ref: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall lack nothing.', addedISO: addDays(today, -20), mastery: 5, lastReviewed: ts(2) },
    { id: 'm2', ref: 'Philippians 4:6', text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.', addedISO: addDays(today, -7), mastery: 3, lastReviewed: ts(1) },
    { id: 'm3', ref: 'John 3:16', text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.', addedISO: today, mastery: 1, lastReviewed: null },
  ]

  // Pre-cached AI content so the app feels complete without an API key.
  const explanationsCache = {
    'Psalm 23': 'David pictures God as a shepherd who provides, guides, and protects — even through the darkest valley. The promise isn’t a life without danger but a Presence within it. Today, name the “valley” you’re walking and let the Shepherd’s nearness, not the circumstance, set your peace.',
    'John 3:16-17': 'In one sentence Jesus compresses the whole gospel: God’s love is the source, the gift of his Son is the cost, and belief is the open hand that receives. He came not to condemn but to rescue. Receive that love today instead of trying to earn it.',
    'Philippians 4:4-9': 'Paul’s antidote to anxiety isn’t denial but redirection — turning worry into specific, thankful prayer, then fixing the mind on what is true and lovely. The result is a peace that “guards” the heart like a sentry. Practice it: trade one anxious thought for one honest prayer.',
    'Matthew 6:25-34': 'Jesus confronts worry by re-anchoring our trust: the Father who feeds birds and clothes fields surely knows your needs. The cure for anxiety is reordered priorities — seek his kingdom first. Let today’s concerns be enough for today.',
  }

  const devotionalCache = {
    [d6]: 'Before the world had shape, Love spoke — and you are not outside his making.',
    [d5]: 'Sink your roots where the living water runs, and you will bear fruit in due season.',
    [d4]: 'Heaven blesses the empty hands; it is the poor in spirit who inherit the kingdom.',
    [d3]: 'You are shepherded, not abandoned — even the valley is a path he walks beside you.',
    [d2]: 'The darkness has tried for ages to win, and the smallest light still undoes it.',
    [d1]: 'Trade your map for his hand; the paths you cannot see, he can already make straight.',
    [today]: 'Today is unwritten — open it like a gift, and let the first word be his.',
  }

  return {
    version: 1,
    profile: { id: 'me', name: 'Thomas', initials: 'T', avatar: MEMBER_COLORS.me, joinedISO: addDays(today, -34) },
    settings: { theme: 'system', reminders: true, apiKey: '', soundCelebrations: true },
    activePlanId: 'newTestament',
    planStartISO: addDays(today, -28),
    progress: {
      newTestament: {
        completed: { [d6]: true, [d5]: true, [d4]: true, [d3]: true, [d2]: true, [d1]: true },
      },
      oneYear: { completed: {} },
      psalmsProverbs: { completed: {} },
      custom: { completed: {} },
    },
    streak: { current: 6, best: 14, lastCompleted: d1 },
    reflections,
    favorites,
    memoryVerses,
    explanationsCache,
    devotionalCache,
    statsBaseline: { versesRead: 286, daysCompleted: 28 },
    group: {
      id: 'g1',
      name: 'Sunrise Circle',
      inviteCode: 'GRACE7',
      members,
      comments,
      prayers,
      completions,
    },
    notifications: [],
    celebratedMilestones: [],
    seenInvite: false,
  }
}
