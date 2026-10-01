import { useState } from 'react'
import { InitialPositionSFEN, Position } from 'tsshogi'
import { Trainer } from '../components/Trainer'
import { go } from '../hooks'
import { colorSide, type Side } from '../shogi'

export function Play({ sfen }: { sfen?: string }) {
  const start = sfen && Position.isValidSFEN(sfen) ? sfen : InitialPositionSFEN.STANDARD
  const toMove = colorSide(Position.newBySFEN(start)!.color)
  const [side, setSide] = useState<Side>(toMove)
  const [round, setRound] = useState(0)
  return (
    <div className="page">
      <div className="crumbs">
        <button className="link" onClick={() => go()}>All openings</button> / Free board
      </div>
      <div className="row play-head">
        <h1>Free board</h1>
        <div className="segmented">
          <button className={side === 'sente' ? 'on' : ''} onClick={() => { setSide('sente'); setRound((r) => r + 1) }}>I play ☗ sente</button>
          <button className={side === 'gote' ? 'on' : ''} onClick={() => { setSide('gote'); setRound((r) => r + 1) }}>I play ☖ gote</button>
        </div>
      </div>
      <Trainer key={`${start}-${side}-${round}`} startSfen={start} userSide={side} defaultOpponent="ai" />
    </div>
  )
}
