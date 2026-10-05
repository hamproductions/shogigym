export const mm = (n: number) => n / 35.2

export const TATAMI_W = mm(910)
export const TATAMI_L = mm(1820)
export const TABLE_H = mm(740)
export const ROOM_H = mm(2400)

export const TRADITIONAL_ROOM = { halfX: 2 * TATAMI_W, halfZ: 3 * TATAMI_W }
export const CASUAL_ROOM = { halfX: mm(2200), halfZ: mm(2700) }
export const TABLE = { halfW: mm(1100) / 2, halfD: mm(800) / 2 }
export const ZABUTON = { w: 16.5, h: 1.6, d: 17.5, gap: 14 }
