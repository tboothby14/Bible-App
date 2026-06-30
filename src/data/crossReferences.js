// Theology concepts (deep-dives) + a cross-reference graph for the explorer.

export const THEOLOGY_CONCEPTS = [
  {
    id: 'grace',
    term: 'Grace',
    color: 'teal',
    summary:
      'Unearned favor — God giving freely what we could never deserve or repay. The heartbeat of the gospel.',
    verses: [
      { ref: 'Ephesians 2:8-10', text: 'For by grace you have been saved through faith… it is the gift of God.' },
      { ref: 'Romans 3:23-24', text: 'All have sinned… being justified freely by his grace through the redemption in Christ Jesus.' },
      { ref: '2 Corinthians 12:9', text: '“My grace is sufficient for you, for my power is made perfect in weakness.”' },
      { ref: 'Titus 2:11', text: 'For the grace of God has appeared, bringing salvation to all people.' },
    ],
  },
  {
    id: 'covenant',
    term: 'Covenant',
    color: 'purple',
    summary:
      'God binding himself to his people by promise — a relationship he initiates and keeps even when we fail.',
    verses: [
      { ref: 'Genesis 9:13', text: 'I set my rainbow in the cloud… a sign of a covenant between me and the earth.' },
      { ref: 'Jeremiah 31:33', text: 'I will put my law in their inward parts… I will be their God, and they shall be my people.' },
      { ref: 'Luke 22:20', text: '“This cup is the new covenant in my blood, which is poured out for you.”' },
      { ref: 'Hebrews 8:6', text: 'He is the mediator of a better covenant, established on better promises.' },
    ],
  },
  {
    id: 'redemption',
    term: 'Redemption',
    color: 'gold',
    summary:
      'To be bought back and set free — God paying the price to release us from sin, slavery, and death.',
    verses: [
      { ref: 'Ephesians 1:7', text: 'In him we have our redemption through his blood, the forgiveness of our trespasses.' },
      { ref: 'Colossians 1:13-14', text: 'He delivered us from the power of darkness… in whom we have our redemption.' },
      { ref: 'Galatians 3:13', text: 'Christ redeemed us from the curse of the law, having become a curse for us.' },
      { ref: 'Titus 2:14', text: 'He gave himself for us, that he might redeem us from all iniquity.' },
    ],
  },
  {
    id: 'faith',
    term: 'Faith',
    color: 'cyan',
    summary:
      'Trust that leans its full weight on God — assurance of what we hope for, conviction of what we cannot see.',
    verses: [
      { ref: 'Hebrews 11:1-6', text: 'Now faith is assurance of things hoped for, proof of things not seen.' },
      { ref: 'Romans 10:17', text: 'So faith comes by hearing, and hearing by the word of God.' },
      { ref: 'James 2:17', text: 'Faith, if it has no works, is dead in itself.' },
      { ref: 'Ephesians 2:8-10', text: 'By grace you have been saved through faith.' },
    ],
  },
  {
    id: 'love',
    term: 'Love',
    color: 'pink',
    summary:
      'The self-giving heart of God — patient, sacrificial, and the mark by which his people are known.',
    verses: [
      { ref: '1 John 4:7-12', text: 'Love is of God… God is love.' },
      { ref: '1 Corinthians 13:4-8', text: 'Love is patient and is kind… Love never fails.' },
      { ref: 'John 3:16-17', text: 'For God so loved the world, that he gave his one and only Son.' },
      { ref: 'Romans 8:31-39', text: 'Nothing… will be able to separate us from God’s love.' },
    ],
  },
  {
    id: 'hope',
    term: 'Hope',
    color: 'green',
    summary:
      'Confident expectation anchored in God’s faithfulness — not wishful thinking, but a sure and steady future.',
    verses: [
      { ref: 'Jeremiah 29:11-13', text: 'Thoughts of peace… to give you hope and a future.' },
      { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace in believing.' },
      { ref: 'Isaiah 40:28-31', text: 'Those who wait for the LORD will renew their strength.' },
      { ref: 'Revelation 21:1-4', text: 'He will wipe away every tear… the first things have passed away.' },
    ],
  },
  {
    id: 'peace',
    term: 'Peace',
    color: 'teal',
    summary:
      'Wholeness and rest that come from God — a calm that guards the heart even when circumstances rage.',
    verses: [
      { ref: 'Philippians 4:4-9', text: 'The peace of God, which surpasses all understanding, will guard your hearts.' },
      { ref: 'John 14:27', text: '“Peace I leave with you. My peace I give to you… don’t let your heart be troubled.”' },
      { ref: 'Isaiah 26:3', text: 'You will keep whoever’s mind is steadfast in perfect peace, because he trusts in you.' },
      { ref: 'Psalm 46:1-7', text: 'God is our refuge and strength, a very present help in trouble.' },
    ],
  },
  {
    id: 'wisdom',
    term: 'Wisdom',
    color: 'gold',
    summary:
      'Skill for living God’s way — seeing life from his perspective and choosing the path of life.',
    verses: [
      { ref: 'Proverbs 3:1-8', text: 'Trust in the LORD with all your heart… he will make your paths straight.' },
      { ref: 'James 1:2-5', text: 'If any of you lacks wisdom, let him ask of God.' },
      { ref: 'Psalm 1', text: 'His delight is in the law of the LORD… he meditates day and night.' },
      { ref: '1 Corinthians 1:30', text: 'Christ Jesus, who was made to us wisdom from God.' },
    ],
  },
]

export function getConcept(id) {
  return THEOLOGY_CONCEPTS.find((c) => c.id === id)
}

// Cross-reference graph keyed by passage reference.
export const CROSS_REFERENCES = {
  'Genesis 1:1-5': [
    { ref: 'John 1:1-5', note: 'The Word present at creation' },
    { ref: 'Psalm 19:1', note: 'The heavens declare God’s glory' },
    { ref: 'Hebrews 11:1-6', note: 'By faith we understand the universe was framed' },
  ],
  'Psalm 23': [
    { ref: 'John 15:1-8', note: 'Christ the true vine & shepherd-care' },
    { ref: 'Revelation 21:1-4', note: 'God dwelling with his people forever' },
    { ref: 'Psalm 121', note: 'The Lord as keeper & guide' },
  ],
  'John 3:16-17': [
    { ref: '1 John 4:7-12', note: 'God’s love revealed in sending his Son' },
    { ref: 'Romans 8:31-39', note: 'He did not spare his own Son' },
    { ref: 'Ephesians 2:8-10', note: 'Saved by grace, the gift of God' },
  ],
  'Philippians 4:4-9': [
    { ref: 'Matthew 6:25-34', note: 'Do not be anxious — seek first the kingdom' },
    { ref: '1 Peter 5:6-7', note: 'Cast all your cares on him' },
    { ref: 'Psalm 46:1-7', note: 'God our refuge in trouble' },
  ],
  'Matthew 6:25-34': [
    { ref: 'Philippians 4:4-9', note: 'Peace over anxiety' },
    { ref: '1 Peter 5:6-7', note: 'He cares for you' },
    { ref: 'Psalm 23', note: 'The Shepherd provides' },
  ],
  'Romans 8:31-39': [
    { ref: 'John 3:16-17', note: 'God gave his Son for us' },
    { ref: '1 John 4:7-12', note: 'The depth of God’s love' },
    { ref: 'Psalm 27:1-6', note: 'Whom shall I fear?' },
  ],
  'Ephesians 2:8-10': [
    { ref: 'Romans 12:1-2', note: 'Living out the new life' },
    { ref: 'John 3:16-17', note: 'Salvation as gift' },
    { ref: 'Galatians 5:22-26', note: 'Created for good works / fruit' },
  ],
  'Isaiah 40:28-31': [
    { ref: 'Matthew 11:28-30', note: 'Come to me and find rest' },
    { ref: 'Psalm 121', note: 'My help comes from the Lord' },
    { ref: '2 Corinthians 12:9', note: 'Power made perfect in weakness' },
  ],
  'John 15:1-8': [
    { ref: 'Galatians 5:22-26', note: 'The fruit the vine produces' },
    { ref: 'Psalm 1', note: 'A tree that bears fruit in season' },
    { ref: 'Colossians 3:12-15', note: 'Abiding produces Christlike character' },
  ],
}

// Suggest related references for any passage; falls back to thematic links.
export function relatedFor(ref) {
  if (CROSS_REFERENCES[ref]) return CROSS_REFERENCES[ref]
  return [
    { ref: 'Psalm 23', note: 'The Shepherd’s care' },
    { ref: 'Philippians 4:4-9', note: 'Peace & gratitude' },
    { ref: 'Romans 8:31-39', note: 'God’s unfailing love' },
  ]
}
