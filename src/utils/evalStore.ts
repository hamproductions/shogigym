import { binaryStore, type BinaryFile } from './binaryStore'

export type EvalFile = BinaryFile
const store = binaryStore('joseki-practice:eval', 'nnue')
export const readEvalFile = store.read
export const saveEvalFile = store.save
export const clearEvalFile = store.clear
export const useEvalFile = store.useInfo
