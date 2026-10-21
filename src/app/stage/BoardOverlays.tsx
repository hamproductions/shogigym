import { useTranslation } from 'react-i18next'
import type { CSSProperties } from 'react'
import { Color, promotedPieceType, type Move } from 'tsshogi'
import type { PromotionAtlas } from '@/rendering/sprites'
import type { Announcement } from '@/app/hooks/useAnnouncements'
import { cx } from '@/app/ui/cx'
import { Muted, PlateBox, PlateSide } from '@/app/panels/panels.styles'
import { styled } from 'styled-system/jsx'
import inkMask from './announcement-ink.png'
import { announce as announceStyle, announceName, announceSeal, promoteChoice } from './stage.styles'

export function AnnounceBadge({ announce }: { announce: Announcement }) {
  const { t } = useTranslation()
  const japanese = /[\u3040-\u9fff]/.test(announce.name)
  return (
    <div
      className={announceStyle({ tone: announce.tesuji ? 'tesuji' : announce.side === Color.BLACK ? 'sente' : 'gote' })}
      style={{ '--glyph-count': [...announce.name].length, '--announce-mask': `url(${inkMask})` } as CSSProperties}
      role="status"
    >
      <styled.div
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="4"
        w="64%"
        transform="translateY(16px)"
        _narrow={{ gap: '3', transform: 'translateY(2px)' }}
      >
        <styled.div position="relative" display="grid" gap="0.5" minW="0">
          <styled.div
            order="2"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="3"
            w="100%"
            p="0"
            color="#fff4df"
            textShadow="0 1px 2px #000"
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="0.24em"
            animation="app-announce-detail 450ms 160ms ease both"
            _before={{ content: '""', w: '24px', h: '1px', bg: 'accent' }}
            _narrow={{ gap: '2', fontSize: '11px', letterSpacing: '0.12em', _before: { w: '16px' } }}
            _motionReduce={{ animation: 'none' }}
          >
            <span>{announce.side === Color.BLACK ? t('app.sente') : t('app.gote')}</span>
            <styled.span pl="3" borderLeft="1px solid color-mix(in srgb, {colors.accent} 45%, transparent)">
              {announce.kind}
            </styled.span>
          </styled.div>
          <strong className={announceName({ latin: !japanese })}>
            {japanese ? (
              <>
                <styled.span position="absolute" w="1px" h="1px" overflow="hidden" clipPath="inset(50%)" whiteSpace="nowrap">
                  {announce.name}
                </styled.span>
                {[...announce.name].map((glyph, i) => (
                  <styled.span
                    key={i}
                    animation="app-announce-glyph 420ms cubic-bezier(0.16, 1, 0.3, 1) calc(100ms + var(--glyph-index) * 28ms) both"
                    _motionReduce={{ animation: 'none' }}
                    style={{ '--glyph-index': i } as CSSProperties}
                    aria-hidden="true"
                  >
                    {glyph}
                  </styled.span>
                ))}
              </>
            ) : (
              announce.name
            )}
          </strong>
        </styled.div>
        <span className={announceSeal({ latin: !japanese })} aria-hidden="true">
          {announce.seal}
        </span>
      </styled.div>
    </div>
  )
}

export function PromotionPicker({
  options,
  faces,
  onPick,
  onCancel,
}: {
  options: Move[]
  faces: PromotionAtlas | null
  onPick: (usi: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  return (
    <styled.div
      position="absolute"
      top="50%"
      left="50%"
      zIndex="promote"
      transform="translate(-50%, -50%)"
      display="flex"
      gap="2.5"
      p="3"
      borderRadius="lg"
      bg="overlay"
      boxShadow="inset 0 0 0 1px {colors.border}, {shadows.lg}"
      role="dialog"
      aria-label={t('app.promote')}
    >
      {options.map((m) => (
        <button key={m.usi} className={promoteChoice({ kind: m.promote ? 'yes' : 'no' })} onClick={() => onPick(m.usi)}>
          <styled.span
            w="72px"
            h="72px"
            backgroundRepeat="no-repeat"
            style={
              faces
                ? {
                    backgroundImage: `url(${faces.image})`,
                    backgroundSize: `${faces.columns * 100}% ${faces.rows * 100}%`,
                    backgroundPosition: `${((faces.types.indexOf(m.promote ? promotedPieceType(m.pieceType) : m.pieceType) % faces.columns) / (faces.columns - 1)) * 100}% ${(Math.floor(faces.types.indexOf(m.promote ? promotedPieceType(m.pieceType) : m.pieceType) / faces.columns) / (faces.rows - 1)) * 100}%`,
                  }
                : undefined
            }
            aria-hidden="true"
          />
          <span>{m.promote ? t('app.promote2') : t('app.donTPromote')}</span>
        </button>
      ))}
      <button className={promoteChoice({ kind: 'cancel' })} onClick={onCancel} title={t('app.cancelThisMoveEsc')}>
        <styled.span display="grid" placeItems="center" h="56px" fontSize="30px" fontWeight="regular" opacity="0.8">
          ×
        </styled.span>
        <span>{t('app.cancel')}</span>
      </button>
    </styled.div>
  )
}

export function TsumePlate({ place: position, flipped, userSide }: { place: 'top' | 'bottom'; flipped: boolean; userSide: 'sente' | 'gote' }) {
  const { t } = useTranslation()
  const side = (position === 'top') === flipped ? 'sente' : 'gote'
  return (
    <PlateBox as="span" className={cx('app-plate', position)}>
      <PlateSide>{side === 'sente' ? t('app.sente') : t('app.gote')}</PlateSide>
      <Muted as="span">{side === userSide ? t('app.youAttack') : t('app.defends')}</Muted>
    </PlateBox>
  )
}
