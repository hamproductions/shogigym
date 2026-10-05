import {
  Color,
  SpecialMoveType,
  Move,
  Record,
  RecordFormatType,
  RecordMetadataKey,
  detectRecordFormat,
  exportKIF,
  importCSA,
  importJKFString,
  importKI2,
  importKIF,
} from 'tsshogi'
import { COURSES, type Course, type JosekiNode } from './model'
import { applyUsi } from './shogi'
import type { DetectionPreset, DetectionResult } from './formationTags'

const START = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'

export type Game = {
  title: string
  startSfen: string
  moves: string[]
  comments?: string[]
  ending?: string
  detectionPreset?: DetectionPreset
  detectionResult?: DetectionResult
}

export function decodeKifuFile(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
  if (!utf8.includes('�')) return utf8
  return new TextDecoder('shift_jis').decode(buffer)
}

export function parseGame(text: string): Game | Error {
  const data = text.trim()
  if (!data) return new Error('Paste a kifu first.')
  const format = detectRecordFormat(data)
  const record: Record | Error =
    format === RecordFormatType.KIF
      ? importKIF(data)
      : format === RecordFormatType.KI2
        ? importKI2(data)
        : format === RecordFormatType.CSA
          ? importCSA(data)
          : format === RecordFormatType.JKF
            ? importJKFString(data)
            : format === RecordFormatType.USEN
              ? Record.newByUSEN(data)
              : format === RecordFormatType.SFEN
                ? Record.newByUSI(`sfen ${data}`)
                : Record.newByUSI(data)
  if (record instanceof Error) {
    const bad = /^Invalid move: (\S+)/.exec(record.message)?.[1]
    const tokens = /\bmoves\b/.test(data)
      ? data
          .slice(data.search(/\bmoves\b/) + 5)
          .trim()
          .split(/\s+/)
      : []
    const sfenStart = /\bsfen\s+(\S+\s+[bw]\s+\S+\s+\d+)/.exec(data)?.[1] ?? START
    let at = -1
    let pos: string | null = sfenStart
    for (let i = 0; i < tokens.length && pos; i++) {
      pos = applyUsi(pos, tokens[i])
      if (!pos) at = i
    }
    return new Error(bad ? `move ${at >= 0 ? at + 1 : '?'} (${at >= 0 ? tokens[at] : bad}) is not a legal move in that position` : record.message)
  }
  const moves = record.moves
    .map((node) => node.move)
    .filter((m): m is Move => m instanceof Move)
    .map((m) => m.usi)
  if (moves.length === 0 && record.initialPosition.sfen.startsWith(START.slice(0, -2)))
    return new Error("that doesn't look like a game record (KIF, KI2, CSA, USI or SFEN)")
  const usiTokens =
    /\bmoves\b/.test(data) && (format === RecordFormatType.USI || !format)
      ? data
          .slice(data.search(/\bmoves\b/) + 5)
          .trim()
          .split(/\s+/)
          .filter(Boolean)
      : null
  if (usiTokens && usiTokens.length !== moves.length)
    return new Error(`move ${moves.length + 1} (${usiTokens[moves.length]}) is not a legal move in that position`)
  const players = [record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME), record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)].filter(
    Boolean,
  )
  const comments = record.moves.slice(0, moves.length + 1).map((node) => node.comment.trim())
  const last = record.moves[record.moves.length - 1]
  const ending = last && !(last.move instanceof Move) && last.ply > 0 ? `${last.ply % 2 === 1 ? '☗ Sente' : '☖ Gote'}: ${last.displayText}` : undefined
  const preset = /^手合割[：:]\s*(\S+)/m.exec(data)?.[1]
  const generalPresets = ['平手', '香落ち', '右香落ち', '角落ち', '飛車落ち', '飛香落ち', '二枚落ち', '二枚持ち', '三枚落ち', '四枚落ち', '六枚落ち']
  let detectionPreset: DetectionPreset | undefined =
    preset && generalPresets.includes(preset) ? { hirateLike: ['平手', '香落ち', '右香落ち'].includes(preset), generalPreset: true } : undefined
  const count = (value: string) => {
    if (!value) return 1
    if (/^\d+$/.test(value)) return Number(value)
    const digits = '〇一二三四五六七八九'
    if (value.includes('十')) {
      const [tens, units] = value.split('十')
      return (tens ? digits.indexOf(tens) : 1) * 10 + (units ? digits.indexOf(units) : 0)
    }
    return digits.indexOf(value)
  }
  const rawHand = /\bsfen\s+\S+\s+[bw]\s+(\S+)/.exec(data)?.[1] ?? (format === RecordFormatType.SFEN ? data.split(/\s+/)[2] : undefined)
  const kingHands = [0, 0] as [number, number]
  for (const [index, owner] of ['先手', '後手'].entries()) {
    const held = new RegExp(`^${owner}の持駒[：:]([^\\n]+)`, 'm').exec(data)?.[1]
    const king = held?.match(/[玉王]([〇一二三四五六七八九十\d]*)/)
    kingHands[index] = king
      ? count(king[1])
      : Number(new RegExp(`(\\d*)${index === 0 ? 'K' : 'k'}`).exec(rawHand ?? '')?.[1] || (rawHand?.includes(index === 0 ? 'K' : 'k') ? 1 : 0))
  }
  if (kingHands.some(Boolean)) detectionPreset = { ...detectionPreset, kingHands }
  const type = last && !(last.move instanceof Move) ? last.move.type : undefined
  const actor = moves.length % 2 ? (record.initialPosition.color === Color.BLACK ? Color.WHITE : Color.BLACK) : record.initialPosition.color
  const loses = [SpecialMoveType.RESIGN, SpecialMoveType.MATE, SpecialMoveType.TIMEOUT, SpecialMoveType.FOUL_LOSE, SpecialMoveType.LOSE_BY_DEFAULT].some(
    (value) => value === type,
  )
  const wins = [SpecialMoveType.FOUL_WIN, SpecialMoveType.WIN_BY_DEFAULT].some((value) => value === type)
  const detectionResult: DetectionResult | undefined =
    loses || wins
      ? { winner: loses ? (actor === Color.BLACK ? Color.WHITE : Color.BLACK) : actor, checkmate: type === SpecialMoveType.MATE }
      : type === SpecialMoveType.IMPASS
        ? { impasse: true }
        : undefined
  return {
    detectionResult,
    detectionPreset,
    title: players.length ? players.join(' vs ') : 'Imported game',
    startSfen: record.initialPosition.sfen,
    moves,
    comments: comments.some(Boolean) ? comments : undefined,
    ending,
  }
}

const strip = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

let bookIndex: Map<string, { course: Course; node: JosekiNode }[]> | null = null

export function bookLookup(sfen: string) {
  if (!bookIndex) {
    bookIndex = new Map()
    for (const course of COURSES) {
      const walk = (node: JosekiNode) => {
        const key = strip(node.sfen)
        bookIndex!.set(key, [...(bookIndex!.get(key) ?? []), { course, node }])
        node.branches.forEach((b) => b.child && b.kind !== 'deviation' && walk(b.child))
      }
      walk(course.root)
    }
  }
  return bookIndex.get(strip(sfen)) ?? []
}

export const accuracyFromLoss = (lossPercent: number) => Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * lossPercent) - 3.1669))

export function exportGame(start: string, lines: string[][], names: { sente?: string; gote?: string; title?: string } = {}): string {
  const record = Record.newByUSI(`sfen ${start}`)
  if (record instanceof Error) return ''
  for (const line of lines) {
    record.goto(0)
    for (const usi of line) {
      const move = record.position.createMoveByUSI(usi)
      if (!move || !record.append(move)) break
    }
  }
  record.goto(0)
  if (names.sente) record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_NAME, names.sente)
  if (names.gote) record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_NAME, names.gote)
  if (names.title) record.metadata.setStandardMetadata(RecordMetadataKey.TITLE, names.title)
  record.metadata.setStandardMetadata(RecordMetadataKey.DATE, new Date().toLocaleDateString('ja-JP'))
  return exportKIF(record)
}
