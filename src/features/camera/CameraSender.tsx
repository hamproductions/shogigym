import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { sendPhone, type PhoneLink } from './phone'

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
  const [link, setLink] = useState<PhoneLink | 'camera'>('camera')
  const [error, setError] = useState('')
  const to = typeof location === 'undefined' ? '' : (new URLSearchParams(location.search).get('to') ?? '')

  useEffect(() => {
    const element = video.current
    if (!element || !to) return
    let stop = () => {}
    let media: MediaStream | null = null
    let lock: WakeLockSentinel | null = null
    navigator.wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => undefined)
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then((stream) => {
        media = stream
        element.srcObject = stream
        element.play().catch(() => undefined)
        setLink('waiting')
        stop = sendPhone(to, stream, setLink)
      })
      .catch((e: DOMException) => setError(`${e.name}: ${e.message}`))
    return () => {
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
          (!to
            ? t('camera.senderNoTarget')
            : t(link === 'connected' ? 'camera.senderConnected' : link === 'error' ? 'camera.senderError' : 'camera.senderWaiting'))}
      </Bar>
    </Screen>
  )
}
