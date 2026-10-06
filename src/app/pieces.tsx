import './piece-guide.css'
import { Color, PieceType, Square } from 'tsshogi'
import { positionOf } from '@/utils/shogi'
import { useTranslation } from 'react-i18next'
import { PIECE_INFO, type Step } from './pieceInfo'

type CellKind = 'self' | 'slide' | 'step'

/** Which diagram cell (relative to the piece, within two squares) each step marks; the first matching step wins. */
function diagramKinds(steps: Step[]) {
  const kinds = new Map<string, CellKind>([['0,0', 'self']])
  for (const { dx, dy, slide } of steps) {
    const reach = slide ? 2 : 1
    for (let k = 1; k <= reach; k++) {
      const key = `${k * dx},${k * dy}`
      if (!kinds.has(key)) kinds.set(key, slide ? 'slide' : 'step')
    }
  }
  return kinds
}

function MoveDiagram({ steps }: { steps: Step[] }) {
  const kinds = diagramKinds(steps)
  const cells = []
  for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) cells.push(<i key={`${x},${y}`} className={kinds.get(`${x},${y}`) ?? ''} />)
  return (
    <div className="app-piece-grid" aria-hidden="true">
      {cells}
    </div>
  )
}

export function PieceGuide({ sfen, from }: { sfen: string; from: Square | PieceType }) {
  const { t, i18n: lang } = useTranslation()
  const ja = lang.language === 'ja'
  const position = positionOf(sfen)
  const type = from instanceof Square ? position.board.at(from)?.type : from
  if (type === undefined) return null
  const info = PIECE_INFO[type]
  const inHand = !(from instanceof Square)
  const kingName = type === PieceType.KING && from instanceof Square && position.board.at(from)?.color === Color.BLACK ? '王将' : info.ja
  return (
    <div className="app-piece-guide">
      <MoveDiagram steps={info.steps} />
      <div>
        <strong>
          {kingName} {!ja && <span>{kingName === '王将' ? 'ōshō' : info.reading}</span>}
        </strong>
        {!ja && <span className="app-piece-en">{info.en}</span>}
        <p>{info.moves}</p>
        {info.promotes && !inHand && (
          <p className="app-muted">
            {info.promotes} {t('pieces.aPieceMayPromoteWhen')}
          </p>
        )}
        {inHand && <p className="app-muted">{t('pieces.aCapturedPieceIsYours')}</p>}
      </div>
    </div>
  )
}
