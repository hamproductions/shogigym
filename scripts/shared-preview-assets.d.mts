import type { Plugin } from 'vite'

export function sharedPreviewPlugin(): Plugin
export function sharePreviewOutput(output: string): void
export function sharedPreviewAssets(): Map<string, { source: string; hash: string; same: boolean; base: string }>
