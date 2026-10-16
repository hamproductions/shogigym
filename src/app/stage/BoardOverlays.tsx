import './announce.css'
import { useTranslation } from 'react-i18next'
import type { CSSProperties } from 'react'
import { Color, promotedPieceType, type Move } from 'tsshogi'
import type { PromotionAtlas } from '@/rendering/sprites'
import type { Announcement } from '@/app/hooks/useAnnouncements'
import { cx } from '@/app/ui/cx'
import { muted, plate, plateSide } from '@/app/panels/panels.styles'
import inkMask from './announcement-ink.png'
import {
  announce as announceStyle,
  announceContent,
  announceGlyph,
  announceLayout,
  announceMeta,
  announceName,
  announceReadable,
  announceSeal,
  cancelMark,
  promote,
  promoteChoice,
  promotionFace,
} from './stage.styles'

export function AnnounceBadge({ announce }: { announce: Announcement }) {
  const { t } = useTranslation()
  const japanese = /[\u3040-\u9fff]/.test(announce.name)
  return (
    <div
      className={announceStyle({ tone: announce.tesuji ? 'tesuji' : announce.side === Color.BLACK ? 'sente' : 'gote' })}
      style={{ '--glyph-count': [...announce.name].length, '--announce-mask': `url(${inkMask})` } as CSSProperties}
      role="status"
    >
      <div className={announceLayout}>
        <div className={announceContent}>
          <div className={announceMeta}>
            <span>{announce.side === Color.BLACK ? t('app.sente') : t('app.gote')}</span>
            <span>{announce.kind}</span>
          </div>
          <strong className={announceName({ latin: !japanese })}>
            {japanese ? (
              <>
                <span className={announceReadable}>{announce.name}</span>
                {[...announce.name].map((glyph, i) => (
                  <span key={i} className={announceGlyph} style={{ '--glyph-index': i } as CSSProperties} aria-hidden="true">
                    {glyph}
                  </span>
                ))}
              </>
            ) : (
              announce.name
            )}
          </strong>
        </div>
        <span className={announceSeal({ latin: !japanese })} aria-hidden="true">
          {announce.seal}
        </span>
      </div>
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
    <div className={promote} role="dialog" aria-label={t('app.promote')}>
      {options.map((m) => (
        <button key={m.usi} className={promoteChoice({ kind: m.promote ? 'yes' : 'no' })} onClick={() => onPick(m.usi)}>
          <span
            className={promotionFace}
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
        <span className={cancelMark}>×</span>
        <span>{t('app.cancel')}</span>
      </button>
    </div>
  )
}

export function TsumePlate({ position, flipped, userSide }: { position: 'top' | 'bottom'; flipped: boolean; userSide: 'sente' | 'gote' }) {
  const { t } = useTranslation()
  const side = (position === 'top') === flipped ? 'sente' : 'gote'
  return (
    <span className={cx('app-plate', position, plate)}>
      <span className={plateSide}>{side === 'sente' ? t('app.sente') : t('app.gote')}</span>
      <span className={muted}>{side === userSide ? t('app.youAttack') : t('app.defends')}</span>
    </span>
  )
}
