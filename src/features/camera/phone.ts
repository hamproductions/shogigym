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

export const phoneUrl = (id?: string) => `${location.origin}${import.meta.env.BASE_URL}${PHONE_PATH}${id ? `?to=${encodeURIComponent(id)}` : ''}`

const ROOM = 'shogigym-room-'
const TARGET_KEY = 'joseki-practice:camera-target:v1'

export function lastDesk() {
  try {
    return localStorage.getItem(TARGET_KEY)
  } catch {
    return null
  }
}

export function rememberDesk(id: string) {
  if (id.startsWith(ROOM)) return
  try {
    localStorage.setItem(TARGET_KEY, id)
  } catch {
    return
  }
}

function publicAddress(): Promise<string | null> {
  return new Promise((resolve) => {
    const connection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    const done = (address: string | null) => {
      clearTimeout(timer)
      connection.close()
      resolve(address)
    }
    const timer = setTimeout(() => done(null), 10000)
    connection.onicecandidate = ({ candidate }) => {
      const parts = candidate?.candidate.split(' ') ?? []
      if (parts[7] === 'srflx' && parts[4]?.includes('.')) done(parts[4])
    }
    connection.createDataChannel('probe')
    connection
      .createOffer()
      .then((offer) => connection.setLocalDescription(offer))
      .catch(() => done(null))
  })
}

export async function roomId(attempts = 3): Promise<string | null> {
  const address = await publicAddress()
  if (!address && attempts > 1) return roomId(attempts - 1)
  if (!address) return null
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`shogigym:${address}`)))
  return ROOM + [...digest.slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const createPeer = async (id?: string): Promise<Peer> => {
  const { default: PeerClass } = await import('peerjs')
  return id ? new PeerClass(id) : new PeerClass()
}

export type PhoneLink = 'waiting' | 'connected' | 'error'

export function receivePhone(onStream: (stream: MediaStream | null) => void, onLink: (link: PhoneLink) => void) {
  const peers: Peer[] = []
  let stopped = false
  let retry = 0
  const listen = async (id: string, primary: boolean) => {
    const created = await createPeer(id)
    if (stopped) return created.destroy()
    peers.push(created)
    if (primary) created.on('open', () => onLink('waiting'))
    created.on('error', (error) => {
      if (error.type === 'unavailable-id') {
        created.destroy()
        if (!stopped) retry = window.setTimeout(() => void listen(id, primary), 5000)
      } else if (primary) onLink('error')
    })
    created.on('disconnected', () => !stopped && !created.destroyed && created.reconnect())
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
  }
  void listen(deskId(), true)
  void roomId().then((id) => {
    if (id && !stopped) void listen(id, false)
  })
  return () => {
    stopped = true
    clearTimeout(retry)
    peers.forEach((peer) => peer.destroy())
  }
}

async function sharpen(connection: RTCPeerConnection) {
  for (const sender of connection.getSenders()) {
    if (sender.track?.kind !== 'video') continue
    const parameters = sender.getParameters()
    parameters.degradationPreference = 'maintain-resolution'
    parameters.encodings = (parameters.encodings?.length ? parameters.encodings : [{}]).map((encoding) => ({
      ...encoding,
      maxBitrate: 6_000_000,
      scaleResolutionDownBy: 1,
    }))
    await sender.setParameters(parameters).catch(() => undefined)
  }
}

export function sendPhone(to: string, stream: MediaStream, onLink: (link: PhoneLink) => void) {
  let peer: Peer | null = null
  let stopped = false
  let connected = false
  const restart = () => {
    peer?.destroy()
    peer = null
    connected = false
    void createPeer().then((created) => {
      if (stopped) return created.destroy()
      peer = created
      created.on('open', () => {
        const media = created.call(to, stream)
        media.peerConnection?.addEventListener('connectionstatechange', () => {
          const state = media.peerConnection.connectionState
          connected = state === 'connected'
          if (connected) void sharpen(media.peerConnection)
          onLink(connected ? 'connected' : 'waiting')
        })
        media.on('close', () => {
          connected = false
          onLink('waiting')
        })
      })
      created.on('error', (error) => error.type !== 'peer-unavailable' && onLink('error'))
    })
  }
  restart()
  const watchdog = window.setInterval(() => !connected && restart(), 6000)
  return () => {
    stopped = true
    clearInterval(watchdog)
    peer?.destroy()
  }
}
