// Sharing helpers: clipboard + a generated aesthetic verse image (canvas).

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for non-secure contexts
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

export function verseShareText(reference, text) {
  return `"${text}"\n— ${reference}\n\nshared from Lumen`
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export function generateVerseImage({ reference, text }) {
  const W = 1080
  const H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0a1430')
  bg.addColorStop(0.5, '#0a0f20')
  bg.addColorStop(1, '#160f2a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Ambient glows
  const glow = (x, y, r, color) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, color)
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg
    ctx.fillRect(0, 0, W, H)
  }
  glow(180, 200, 460, 'rgba(45,212,191,0.22)')
  glow(900, 260, 480, 'rgba(167,139,250,0.22)')
  glow(620, 980, 520, 'rgba(56,189,248,0.16)')

  // Border frame
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.lineWidth = 2
  ctx.strokeRect(56, 56, W - 112, H - 112)

  // Quote mark
  ctx.fillStyle = 'rgba(45,212,191,0.55)'
  ctx.font = '900 180px Georgia, serif'
  ctx.textAlign = 'left'
  ctx.fillText('“', 108, 320)

  // Verse text
  ctx.fillStyle = '#eef2fb'
  ctx.textAlign = 'center'
  const fontSize = text.length > 260 ? 42 : text.length > 160 ? 50 : 58
  ctx.font = `400 ${fontSize}px Georgia, serif`
  const lines = wrapLines(ctx, text, W - 260)
  const lineHeight = fontSize * 1.5
  const blockHeight = lines.length * lineHeight
  let y = H / 2 - blockHeight / 2 + fontSize
  for (const l of lines) {
    ctx.fillText(l, W / 2, y)
    y += lineHeight
  }

  // Reference
  ctx.font = '700 34px Inter, Arial, sans-serif'
  const refGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0)
  refGrad.addColorStop(0, '#5eead4')
  refGrad.addColorStop(1, '#c4b5fd')
  ctx.fillStyle = refGrad
  ctx.fillText(reference.toUpperCase(), W / 2, y + 56)

  // Brand
  ctx.fillStyle = 'rgba(180,196,230,0.5)'
  ctx.font = '600 24px Inter, Arial, sans-serif'
  ctx.fillText('· LUMEN ·', W / 2, H - 110)

  return canvas.toDataURL('image/png')
}

export function downloadVerseImage({ reference, text }) {
  const url = generateVerseImage({ reference, text })
  const a = document.createElement('a')
  a.href = url
  a.download = `${reference.replace(/[^\w]+/g, '-').toLowerCase()}-lumen.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
