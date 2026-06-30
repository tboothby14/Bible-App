// Reading plans. Each plan has an ordered list of readings; the app maps the
// current day index onto this list (cycling for the MVP so every day resolves
// to a passage that has text). Each reading: { ref, theme }.

export const READING_PLANS = [
  {
    id: 'oneYear',
    name: 'One Year Bible',
    short: 'One Year',
    description: 'A sweep through the Old Testament, Psalms, and New Testament.',
    length: 365,
    accent: 'teal',
    readings: [
      { ref: 'Genesis 1:1-5', theme: 'Creation' },
      { ref: 'Psalm 1', theme: 'The two ways' },
      { ref: 'Matthew 5:1-12', theme: 'The Beatitudes' },
      { ref: 'Psalm 23', theme: 'The Good Shepherd' },
      { ref: 'John 1:1-5', theme: 'The Word' },
      { ref: 'Proverbs 3:1-8', theme: 'Trust & wisdom' },
      { ref: 'Isaiah 40:28-31', theme: 'Renewed strength' },
      { ref: 'Romans 8:31-39', theme: 'Inseparable love' },
      { ref: 'Psalm 27:1-6', theme: 'Light & salvation' },
      { ref: 'John 14:1-6', theme: 'The way' },
      { ref: 'Psalm 121', theme: 'My help' },
      { ref: 'Ephesians 2:8-10', theme: 'Grace' },
      { ref: 'Jeremiah 29:11-13', theme: 'Plans & hope' },
      { ref: 'Philippians 4:4-9', theme: 'Peace over anxiety' },
      { ref: 'Revelation 21:1-4', theme: 'All things new' },
    ],
  },
  {
    id: 'newTestament',
    name: 'New Testament in 90 Days',
    short: 'New Testament',
    description: 'Walk through the life of Christ and the early church.',
    length: 90,
    accent: 'purple',
    readings: [
      { ref: 'John 1:1-5', theme: 'The Word' },
      { ref: 'Matthew 5:1-12', theme: 'The Beatitudes' },
      { ref: 'Matthew 6:25-34', theme: 'Do not worry' },
      { ref: 'Matthew 11:28-30', theme: 'Come & rest' },
      { ref: 'John 3:16-17', theme: 'God so loved' },
      { ref: 'John 14:1-6', theme: 'The way' },
      { ref: 'John 15:1-8', theme: 'The vine' },
      { ref: 'Romans 8:31-39', theme: 'More than conquerors' },
      { ref: 'Romans 12:1-2', theme: 'Living sacrifice' },
      { ref: '1 Corinthians 13:4-8', theme: 'The way of love' },
      { ref: 'Galatians 5:22-26', theme: 'Fruit of the Spirit' },
      { ref: 'Ephesians 2:8-10', theme: 'Saved by grace' },
      { ref: 'Philippians 4:4-9', theme: 'Rejoice' },
      { ref: 'Colossians 3:12-15', theme: 'Put on love' },
      { ref: 'Hebrews 11:1-6', theme: 'Faith' },
      { ref: 'Hebrews 12:1-2', theme: 'Run the race' },
      { ref: 'James 1:2-5', theme: 'Joy in trials' },
      { ref: '1 Peter 5:6-7', theme: 'Cast your cares' },
      { ref: '1 John 4:7-12', theme: 'God is love' },
      { ref: 'Revelation 21:1-4', theme: 'New creation' },
    ],
  },
  {
    id: 'psalmsProverbs',
    name: 'Psalms & Proverbs',
    short: 'Psalms & Proverbs',
    description: 'Daily wisdom and worship for the soul.',
    length: 60,
    accent: 'cyan',
    readings: [
      { ref: 'Psalm 1', theme: 'Delight in the law' },
      { ref: 'Psalm 23', theme: 'The Good Shepherd' },
      { ref: 'Psalm 27:1-6', theme: 'Confidence' },
      { ref: 'Proverbs 3:1-8', theme: 'Trust the Lord' },
      { ref: 'Psalm 46:1-7', theme: 'God our refuge' },
      { ref: 'Psalm 91:1-6', theme: 'Shelter' },
      { ref: 'Psalm 121', theme: 'The Lord watches' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Plan',
    short: 'Custom',
    description: 'Choose your own passages, in your own order.',
    length: 0,
    accent: 'gold',
    custom: true,
    readings: [
      { ref: 'Psalm 23', theme: 'The Good Shepherd' },
      { ref: 'John 3:16-17', theme: 'God so loved' },
      { ref: 'Philippians 4:4-9', theme: 'Peace' },
    ],
  },
]

export function getPlan(id) {
  return READING_PLANS.find((p) => p.id === id) || READING_PLANS[0]
}

// Resolve a plan's reading for a 0-based day index (cycles for the MVP).
export function readingForDay(plan, dayIndex) {
  if (!plan.readings.length) return null
  const idx = ((dayIndex % plan.readings.length) + plan.readings.length) % plan.readings.length
  return { ...plan.readings[idx], index: idx, day: dayIndex + 1 }
}

// Verse of the week — rotates weekly through the plan's readings.
export function verseOfWeek(plan, weekIndex) {
  if (!plan.readings.length) return null
  const idx = (weekIndex * 3) % plan.readings.length
  return plan.readings[idx]
}
