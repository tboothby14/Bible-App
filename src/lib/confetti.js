import confetti from 'canvas-confetti'

const COLORS = ['#2dd4bf', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6']

export function burst(origin = { x: 0.5, y: 0.5 }) {
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 38,
    origin,
    colors: COLORS,
    scalar: 0.9,
    disableForReducedMotion: true,
  })
}

export function celebrate() {
  const end = Date.now() + 900
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: COLORS,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: COLORS,
      disableForReducedMotion: true,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.45 },
    colors: COLORS,
    disableForReducedMotion: true,
  })
  frame()
}
