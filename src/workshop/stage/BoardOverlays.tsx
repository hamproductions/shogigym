import { useTranslation } from 'react-i18next'
import { Color, promotedPieceType, type Move } from 'tsshogi'
import { pieceFaceUrl } from '../board3d/piece'
import type { Announcement } from '../hooks/useAnnouncements'


export function AnnounceBadge({ announce }: { announce: Announcement }) {
  const { t } = useTranslation()
  return (
    <div className={`ws-announce ${announce.side === Color.BLACK ? 'sente' : 'gote'}`} role="status">
      <span>
        {announce.side === Color.BLACK ? t('workshop.sente') : t('workshop.gote')} {announce.kind}
      </span>
      <strong>{announce.name}</strong>
    </div>
  )
}

export function PromotionPicker({ options, onPick, onCancel }: { options: Move[]; onPick: (usi: string) => void; onCancel: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="ws-promote" role="dialog" aria-label={t('workshop.promote')}>
      {options.map((m) => (
        <button key={m.usi} className={m.promote ? 'yes' : 'no'} onClick={() => onPick(m.usi)}>
          <img className="ws-koma-face" src={pieceFaceUrl(m.promote ? promotedPieceType(m.pieceType) : m.pieceType, Color.BLACK)} alt="" />
          <span>{m.promote ? t('workshop.promote2') : t('workshop.donTPromote')}</span>
        </button>
      ))}
      <button className="cancel" onClick={onCancel} title={t('workshop.cancelThisMoveEsc')}>
        <span className="ws-koma-x">×</span>
        <span>{t('workshop.cancel')}</span>
      </button>
    </div>
  )
}

export function TsumePlate({ position, flipped, userSide }: { position: 'top' | 'bottom'; flipped: boolean; userSide: 'sente' | 'gote' }) {
  const { t } = useTranslation()
  const side = (position === 'top') === flipped ? 'sente' : 'gote'
  return (
    <span className={`ws-plate ${position}`}>
      <span className="ws-plate-side">{side === 'sente' ? t('workshop.sente') : t('workshop.gote')}</span>
      <span className="ws-muted">{side === userSide ? t('workshop.youAttack') : t('workshop.defends')}</span>
    </span>
  )
}
