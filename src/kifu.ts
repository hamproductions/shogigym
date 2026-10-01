import { Move, Record, RecordFormatType, RecordMetadataKey, detectRecordFormat, importCSA, importJKFString, importKI2, importKIF } from 'tsshogi'
import { COURSES, type Course, type JosekiNode } from './model'

export type Game = { title: string; startSfen: string; moves: string[] }

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
    format === RecordFormatType.KIF ? importKIF(data)
    : format === RecordFormatType.KI2 ? importKI2(data)
    : format === RecordFormatType.CSA ? importCSA(data)
    : format === RecordFormatType.JKF ? importJKFString(data)
    : format === RecordFormatType.USEN ? Record.newByUSEN(data)
    : format === RecordFormatType.SFEN ? Record.newByUSI(`sfen ${data}`)
    : Record.newByUSI(data)
  if (record instanceof Error) return record
  const moves = record.moves.map((node) => node.move).filter((m): m is Move => m instanceof Move).map((m) => m.usi)
  const players = [record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME), record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)].filter(Boolean)
  return {
    title: players.length ? players.join(' vs ') : 'Imported game',
    startSfen: record.initialPosition.sfen,
    moves,
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
