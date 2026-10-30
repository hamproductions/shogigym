import type Peer from 'peerjs'

export const PHONE_SOURCE = 'phone'
export const PHONE_PATH = 'camera-send'

const DESK_KEY = 'joseki-practice:camera-desk:v1'
const PREFIX = 'shogigym-desk-'

export function deskId() {
  try {
    const saved = localStorage.getItem(DESK_KEY)
    if (saved) return saved
    const id = `${PREFIX}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
    localStorage.setItem(DESK_KEY, id)
    return id
  } catch {
    return `${PREFIX}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
  }
}

export const phoneUrl = (id: string) => `${location.origin}${import.meta.env.BASE_URL}${PHONE_PATH}?to=${encodeURIComponent(id)}`

const createPeer = async (id?: string): Promise<Peer> => {
  const { default: PeerClass } = await import('peerjs')
  return id ? new PeerClass(id) : new PeerClass()
}

export type PhoneLink = 'waiting' | 'connected' | 'error'

export function receivePhone(onStream: (stream: MediaStream | null) => void, onLink: (link: PhoneLink) => void) {
  let peer: Peer | null = null
  let stopped = false
  void createPeer(deskId()).then((created) => {
    if (stopped) return created.destroy()
    peer = created
    created.on('open', () => onLink('waiting'))
    created.on('error', () => onLink('error'))
    created.on('disconnected', () => !stopped && created.reconnect())
    created.on('call', (call) => {
      call.answer()
      call.on('stream', (stream) => {
        onLink('connected')
        onStream(stream)
      })
      call.on('close', () => {
        onLink('waiting')
        onStream(null)
      })
    })
  })
  return () => {
    stopped = true
    peer?.destroy()
  }
}

export function sendPhone(to: string, stream: MediaStream, onLink: (link: PhoneLink) => void) {
  let peer: Peer | null = null
  let stopped = false
  let retry = 0
  const call = () => {
    if (!peer || stopped) return
    const media = peer.call(to, stream)
    media.on('stream', () => undefined)
    media.peerConnection?.addEventListener('connectionstatechange', () => {
      const state = media.peerConnection.connectionState
      if (state === 'connected') onLink('connected')
      if (state === 'failed' || state === 'disconnected') {
        onLink('waiting')
        retry = window.setTimeout(call, 1500)
      }
    })
    media.on('close', () => {
      onLink('waiting')
      if (!stopped) retry = window.setTimeout(call, 1500)
    })
  }
  void createPeer().then((created) => {
    if (stopped) return created.destroy()
    peer = created
    created.on('open', call)
    created.on('error', () => {
      onLink('error')
      if (!stopped) retry = window.setTimeout(call, 2000)
    })
    created.on('disconnected', () => !stopped && created.reconnect())
  })
  return () => {
    stopped = true
    clearTimeout(retry)
    peer?.destroy()
  }
}
