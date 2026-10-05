import * as THREE from 'three'

const BRUSH = '"Yuji Boku", "Yuji Syuku", "Shippori Mincho B1", serif'

let brushReady: Promise<unknown> | null = null

export function loadBrush() {
  brushReady ??= import('@fontsource/yuji-boku/400.css')
    .then(() => document.fonts.load(`400 200px ${BRUSH}`, '王手ありがとうございました'))
    .catch(() => undefined)
  return brushReady
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d')!)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function glowTexture() {
  return canvasTexture(128, 128, (g) => {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.25, 'rgba(255,255,255,0.55)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.12)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
  })
}

export function ringTexture() {
  return canvasTexture(256, 256, (g) => {
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.62, 'rgba(255,255,255,0)')
    grad.addColorStop(0.86, 'rgba(255,255,255,0.55)')
    grad.addColorStop(0.93, 'rgba(255,255,255,1)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
  })
}

function seeded(seed: number) {
  let x = seed
  return () => {
    x = (x * 16807) % 2147483647
    return x / 2147483647
  }
}

function inkSwipe(g: CanvasRenderingContext2D, w: number, h: number, rand: () => number) {
  g.save()
  g.translate(w / 2, h / 2)
  g.rotate(-0.06)
  for (let i = 0; i < 70; i++) {
    const y = (rand() - 0.5) * h * 0.42
    const x0 = -w * (0.44 + rand() * 0.05)
    const x1 = w * (0.4 + rand() * 0.08)
    g.strokeStyle = `rgba(14,8,8,${0.12 + rand() * 0.25})`
    g.lineWidth = 6 + rand() * 22
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(x0, y)
    g.bezierCurveTo(x0 * 0.4, y + (rand() - 0.5) * 30, x1 * 0.5, y + (rand() - 0.5) * 30, x1, y + (rand() - 0.5) * 16)
    g.stroke()
  }
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(14,8,8,${0.3 + rand() * 0.6})`
    g.beginPath()
    g.arc(w * (0.32 + rand() * 0.18) * (rand() < 0.5 ? -1 : 1), (rand() - 0.5) * h * 0.7, 2 + rand() * 9, 0, Math.PI * 2)
    g.fill()
  }
  g.restore()
}

export function stampTexture(text: string, fill: string, glow: string) {
  const w = 1024
  const h = 512
  return canvasTexture(w, h, (g) => {
    const rand = seeded(text.charCodeAt(0) * 31 + text.length)
    inkSwipe(g, w, h, rand)
    g.font = `400 ${text.length > 1 ? 300 : 340}px ${BRUSH}`
    const size = (text.length > 1 ? 300 : 340) * Math.min(1, (w - 128) / g.measureText(text).width)
    g.font = `400 ${size}px ${BRUSH}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.save()
    g.translate(w / 2, h / 2 + 8)
    g.rotate(-0.04)
    g.shadowColor = glow
    g.shadowBlur = 48
    g.fillStyle = glow
    g.fillText(text, 0, 0)
    g.shadowBlur = 0
    g.lineJoin = 'round'
    g.lineWidth = 10
    g.strokeStyle = 'rgba(10,6,6,0.95)'
    g.strokeText(text, 0, 0)
    g.fillStyle = fill
    g.fillText(text, 0, 0)
    g.restore()
  })
}
