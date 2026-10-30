import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { lastDesk, rememberDesk, roomId, sendPhone, type PhoneLink } from './phone'

const Screen = styled('main', {
  base: { position: 'fixed', inset: '0', display: 'flex', flexDirection: 'column', bg: 'black', color: 'white', fontFamily: 'sans' },
})

const Video = styled('video', { base: { flex: '1', minH: '0', width: '100%', objectFit: 'contain' } })

const Bar = styled('p', {
  base: { m: '0', p: '3', fontSize: 'md', textAlign: 'center', bg: 'rgba(0,0,0,0.7)', '&[data-link=connected]': { color: 'success' } },
})

export function CameraSender() {
  const { t } = useTranslation()
  const video = useRef<HTMLVideoElement | null>(null)
  const [link, setLink] = useState<PhoneLink | 'camera' | 'lost'>('camera')
  const [error, setError] = useState('')
  const to = typeof location === 'undefined' ? '' : (new URLSearchParams(location.search).get('to') ?? '')

  useEffect(() => {
    const element = video.current
    if (!element) return
    let stop = () => {}
    let stopped = false
    let media: MediaStream | null = null
    let lock: WakeLockSentinel | null = null
    navigator.wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => undefined)
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((stream) => {
        media = stream
        stream.getVideoTracks().forEach((track) => (track.contentHint = 'detail'))
        element.srcObject = stream
        element.play().catch(() => undefined)
        setLink('waiting')
        if (to) rememberDesk(to)
        return to ? [to] : roomId().then((room) => [...new Set([lastDesk(), room].filter((id): id is string => !!id))])
      })
      .then((targets) => {
        if (stopped || !media || !targets) return
        if (!targets.length) return setLink('lost')
        const links = new Map<string, PhoneLink>()
        const stops = new Map<string, () => void>()
        targets.forEach((target) =>
          stops.set(
            target,
            sendPhone(target, media!, (next) => {
              links.set(target, next)
              if (next === 'connected') {
                rememberDesk(target)
                stops.forEach((other, id) => id !== target && other())
              }
              const all = [...links.values()]
              setLink(all.includes('connected') ? 'connected' : all.length === targets.length && all.every((l) => l === 'error') ? 'error' : 'waiting')
            }),
          ),
        )
        stop = () => stops.forEach((s) => s())
      })
      .catch((e: DOMException) => setError(`${e.name}: ${e.message}`))
    return () => {
      stopped = true
      stop()
      media?.getTracks().forEach((track) => track.stop())
      lock?.release().catch(() => undefined)
    }
  }, [to])

  return (
    <Screen>
      <Video ref={video} playsInline muted autoPlay />
      <Bar role="status" data-link={link}>
        {error ||
          t(
            link === 'lost'
              ? 'camera.senderNoTarget'
              : link === 'connected'
                ? 'camera.senderConnected'
                : link === 'error'
                  ? 'camera.senderError'
                  : 'camera.senderWaiting',
          )}
      </Bar>
    </Screen>
  )
}
