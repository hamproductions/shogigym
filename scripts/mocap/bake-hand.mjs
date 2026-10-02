import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [, , out, kalidokitDir, ...inputs] = process.argv
const { Hand } = await import(resolve(kalidokitDir, 'dist/kalidokit.umd.js'))

const CLIPS = {
  slide: ['gDkfPTeSL4k.mp4', 0, 99, 'Plain move: hand comes in flat, index and middle fingers on top of the piece, slide it one square and press'],
  carry: ['Kca2IJ5fY0Q.mp4', 0, 99, 'Longer move: pinch with thumb, index and middle, lift and carry low, set down and press with index and middle pointing down'],
  drop: ['VEoAIDb_A_Q.mp4', 0, 5.8, 'Drop from hand: piece held upright between fingers and thumb, set down on the square, press with index and middle'],
  capture: ['Ect3MPJkxqg.mp4', 0, 99, 'Capture: take the opponent piece off the square, then bring your own piece in and press'],
  promote: ['jPGNz64Q6DY.mp4', 0, 99, 'Promotion: pinch, lift, turn the piece over in the fingers, set it down and press'],
}
const SAMPLES = 24
const sources = inputs.map((p) => JSON.parse(readFileSync(p, 'utf8')))
const round = (v) => Math.round(v * 1000) / 1000
const result = {
  source: 'Japan Shogi Association, 将棋の指し方（手つきの所作） playlist (youtube.com/playlist?list=PL3Yk9nXcisMu8VawUEyTOJnF_jGc6yqkb). MediaPipe Hand Landmarker world landmarks, smoothed, solved to VRM right-hand finger bone rotations with Kalidokit Hand.solve (radians, XYZ euler, Kalidokit convention)',
  moves: {},
}
for (const [kind, [clip, lo, hi, about]] of Object.entries(CLIPS)) {
  const byT = new Map()
  for (const src of sources) for (const fr of src[clip].frames) if (fr.t >= lo && fr.t <= hi && !byT.has(fr.t)) byT.set(fr.t, fr.world)
  const rows = [...byT.entries()].sort((a, b) => a[0] - b[0])
  const t0 = rows[0][0]
  const t1 = rows.at(-1)[0]
  const samples = []
  for (let k = 0; k < SAMPLES; k++) {
    const t = t0 + ((t1 - t0) * k) / (SAMPLES - 1)
    let total = 0
    const acc = Array.from({ length: 21 }, () => [0, 0, 0])
    for (const [rt, w] of rows) {
      const wt = Math.exp(-(((rt - t) / 0.1) ** 2))
      total += wt
      w.forEach((p, i) => p.forEach((v, j) => (acc[i][j] += wt * v)))
    }
    const lm = acc.map(([x, y, z]) => ({ x: x / total, y: y / total, z: z / total }))
    const solved = Hand.solve(lm, 'Right')
    const frame = {}
    for (const [bone, r] of Object.entries(solved)) if (bone !== 'RightWrist') frame[bone] = [round(r.x), round(r.y), round(r.z)]
    samples.push(frame)
  }
  result.moves[kind] = { about, clip, duration: round(t1 - t0), frames: rows.length, samples }
  console.log(kind, rows.length, 'frames')
}
writeFileSync(out, JSON.stringify(result))
