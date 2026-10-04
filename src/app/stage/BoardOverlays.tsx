import './overlays.css'
import { useTranslation } from 'react-i18next'
import { Color, promotedPieceType, type Move } from 'tsshogi'
import { useBakedPieces } from '../hooks/useBakedPieces'
import { spriteKey } from '../../rendering/sprites'
import type { Announcement } from '../hooks/useAnnouncements'


export function AnnounceBadge({ announce }: { announce: Announcement }) {
  const { t } = useTranslation()
  return (
    <div className={`app-announce ${announce.side === Color.BLACK ? 'sente' : 'gote'}${/[\u3040-\u9fff]/.test(announce.name) ? '' : ' latin'}${announce.tesuji ? ' tesuji' : ''}`} role="status">
      <span>
        {announce.side === Color.BLACK ? t('app.sente') : t('app.gote')} {announce.kind}
      </span>
      <strong>{announce.name}</strong>
    </div>
  )
}

export function PromotionPicker({ options, onPick, onCancel }: { options: Move[]; onPick: (usi: string) => void; onCancel: () => void }) {
  const { t } = useTranslation()
  const { baked } = useBakedPieces()
  return (
    <div className="app-promote" role="dialog" aria-label={t('app.promote')}>
      {options.map((m) => (
        <button key={m.usi} className={m.promote ? 'yes' : 'no'} onClick={() => onPick(m.usi)}>
          <img src={baked?.pieces.get(spriteKey(m.promote ? promotedPieceType(m.pieceType) : m.pieceType, m.color, true))} alt="" />
          <span>{m.promote ? t('app.promote2') : t('app.donTPromote')}</span>
        </button>
      ))}
      <button className="cancel" onClick={onCancel} title={t('app.cancelThisMoveEsc')}>
        <span className="app-koma-x">×</span>
        <span>{t('app.cancel')}</span>
      </button>
    </div>
  )
}

export function TsumePlate({ position, flipped, userSide }: { position: 'top' | 'bottom'; flipped: boolean; userSide: 'sente' | 'gote' }) {
  const { t } = useTranslation()
  const side = (position === 'top') === flipped ? 'sente' : 'gote'
  return (
    <span className={`app-plate ${position}`}>
      <span className="app-plate-side">{side === 'sente' ? t('app.sente') : t('app.gote')}</span>
      <span className="app-muted">{side === userSide ? t('app.youAttack') : t('app.defends')}</span>
    </span>
  )
}
