import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Color, Piece, PieceType, Square, pieceTypes } from 'tsshogi'
import { Box, Wrap, styled } from 'styled-system/jsx'
import { BoardFlat } from '@/rendering/BoardFlat'
import { HAND_ORDER, PIECE_CHAR, enginePositionIssue, positionOf } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { positionCorrectionIssue } from '@/utils/positionCorrection'
import { Button } from '@/app/ui/Button'
import { Segmented } from '@/app/ui/Segmented'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { Marks } from '@/app/ui/SideMark'
import type { AnalyzeGames } from './useAnalyzeGames'

type Selection = Square | { color: Color; type: PieceType } | null
const limits = {
  [PieceType.PAWN]: 18,
  [PieceType.LANCE]: 4,
  [PieceType.KNIGHT]: 4,
  [PieceType.SILVER]: 4,
  [PieceType.GOLD]: 4,
  [PieceType.BISHOP]: 2,
  [PieceType.ROOK]: 2,
}

function Editor({ games, source, keepMoves, onClose }: { games: AnalyzeGames; source: string; keepMoves: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const [history, setHistory] = useState([source])
  const [future, setFuture] = useState<string[]>([])
  const [selected, setSelected] = useState<Selection>(null)
  const [pieceType, setPieceType] = useState(PieceType.PAWN)
  const [color, setColor] = useState(Color.BLACK)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sfen = history.at(-1)!
  const position = useMemo(() => positionOf(sfen), [sfen])
  const replayIssue = positionCorrectionIssue(sfen, keepMoves ? games.positionDraft.lines : [])
  const replayError =
    replayIssue === 'invalid' ? t('positionEditor.invalid') : replayIssue === null ? null : t('positionEditor.illegalMove', { count: replayIssue })
  const issue = enginePositionIssue(sfen)
  const piece = selected instanceof Square ? position.board.at(selected) : null
  const commit = (edit: (next: ReturnType<typeof positionOf>) => void) => {
    const next = position.clone()
    edit(next)
    if (next.sfen === sfen) return
    setHistory((previous) => [...previous, next.sfen])
    setFuture([])
    setError(null)
  }
  const select = (square: Square) => {
    if (selected instanceof Square) {
      if (selected.equals(square)) return setSelected(null)
      if (position.board.at(selected)) {
        commit((next) => next.board.swap(selected, square))
        return setSelected(null)
      }
    } else if (selected) {
      if (position.board.at(square)) return setSelected(square)
      commit((next) => {
        if (next.hand(selected.color).count(selected.type) === 0) return
        next.hand(selected.color).reduce(selected.type, 1)
        next.board.set(square, new Piece(selected.color, selected.type))
      })
      return setSelected(null)
    }
    setSelected(square)
    const at = position.board.at(square)
    if (at) {
      setPieceType(at.type)
      setColor(at.color)
    }
  }
  const editPiece = (change: (current: Piece) => Piece) => {
    if (!(selected instanceof Square) || !piece) return
    commit((next) => next.board.set(selected, change(piece)))
  }
  return (
    <>
      <styled.p fontSize="sm" color="fg.muted" my="2">
        {t('positionEditor.instructions')}
      </styled.p>
      <Box display="flex" height="clamp(280px, 48vh, 520px)" minW="0">
        <BoardFlat
          position={position}
          flipped={flipped}
          tilted={false}
          selected={selected instanceof Square ? selected : (selected?.type ?? null)}
          selectedColor={selected instanceof Square ? piece?.color : selected?.color}
          targets={[]}
          arrows={[]}
          coordinates
          onSquare={select}
          onHand={(color, type) => setSelected({ color, type })}
          onDrop={() => {}}
        />
      </Box>
      <Wrap gap="2" mb="2">
        <Button
          size="sm"
          disabled={history.length < 2}
          onClick={() => {
            setFuture((previous) => [sfen, ...previous])
            setHistory((previous) => previous.slice(0, -1))
            setSelected(null)
          }}
        >
          {t('positionEditor.undo')}
        </Button>
        <Button
          size="sm"
          disabled={!future.length}
          onClick={() => {
            setHistory((previous) => [...previous, future[0]])
            setFuture((previous) => previous.slice(1))
            setSelected(null)
          }}
        >
          {t('positionEditor.redo')}
        </Button>
        <Button size="sm" onClick={() => setFlipped((previous) => !previous)}>
          {t('positionEditor.flipBoard')}
        </Button>
        <Button size="sm" disabled={!selected} onClick={() => setSelected(null)}>
          {t('positionEditor.deselect')}
        </Button>
      </Wrap>
      <styled.div display="flex" flexWrap="wrap" alignItems="center" gap="2" p="2" bg="surface.2" borderRadius="md">
        <styled.span fontSize="sm">
          {selected instanceof Square ? t('positionEditor.square', { file: selected.file, rank: selected.rank }) : t('positionEditor.selectSquare')}
        </styled.span>
        <styled.select
          aria-label={t('positionEditor.piece')}
          value={pieceType}
          onChange={(event) => setPieceType(event.target.value as PieceType)}
          minH="44px"
          px="2"
          bg="surface.3"
          borderRadius="md"
        >
          {pieceTypes.map((type) => (
            <option key={type} value={type}>
              {PIECE_CHAR[type]}
            </option>
          ))}
        </styled.select>
        <styled.select
          aria-label={t('positionEditor.owner')}
          value={color}
          onChange={(event) => setColor(event.target.value as Color)}
          minH="44px"
          px="2"
          bg="surface.3"
          borderRadius="md"
        >
          <option value={Color.BLACK}>{t('positionEditor.sente')}</option>
          <option value={Color.WHITE}>{t('positionEditor.gote')}</option>
        </styled.select>
        <Button
          size="sm"
          disabled={!(selected instanceof Square)}
          onClick={() => {
            if (selected instanceof Square) commit((next) => next.board.set(selected, new Piece(color, pieceType)))
          }}
        >
          {t('positionEditor.place')}
        </Button>
        <Button
          size="sm"
          disabled={!piece}
          onClick={() => editPiece((current) => current.withColor(current.color === Color.BLACK ? Color.WHITE : Color.BLACK))}
        >
          {t('positionEditor.changeOwner')}
        </Button>
        <Button
          size="sm"
          disabled={!piece || (!piece.isPromotable() && piece.unpromoted().type === piece.type)}
          onClick={() => editPiece((current) => (current.isPromotable() ? current.promoted() : current.unpromoted()))}
        >
          {t('positionEditor.promote')}
        </Button>
        <Button
          size="sm"
          disabled={!piece}
          onClick={() => {
            if (selected instanceof Square) commit((next) => next.board.remove(selected))
            setSelected(null)
          }}
        >
          {t('positionEditor.remove')}
        </Button>
        <Button
          size="sm"
          disabled={!piece || piece.type === PieceType.KING}
          onClick={() => {
            if (!(selected instanceof Square) || !piece) return
            commit((next) => {
              next.board.remove(selected)
              next.hand(piece.color).add(piece.unpromoted().type, 1)
            })
            setSelected(null)
          }}
        >
          {t('positionEditor.toHand')}
        </Button>
      </styled.div>
      {[Color.BLACK, Color.WHITE].map((owner) => (
        <Box key={owner} mt="3">
          <styled.strong fontSize="sm">
            <Marks>{sideMark(owner === Color.BLACK ? 'sente' : 'gote')}</Marks>{' '}
            {t(owner === Color.BLACK ? 'positionEditor.senteHand' : 'positionEditor.goteHand')}
          </styled.strong>
          <Wrap gap="2" mt="1">
            {HAND_ORDER.map((type) => (
              <styled.label key={type} display="flex" flexDirection="column" alignItems="center" fontSize="sm">
                {PIECE_CHAR[type]}
                <styled.input
                  key={position.hand(owner).count(type)}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={limits[type as keyof typeof limits]}
                  defaultValue={position.hand(owner).count(type)}
                  aria-label={`${t(owner === Color.BLACK ? 'positionEditor.senteHand' : 'positionEditor.goteHand')} ${PIECE_CHAR[type]}`}
                  onBlur={(event) => {
                    const value = event.currentTarget.value
                    const parsed = value.trim() ? Number(value) : position.hand(owner).count(type)
                    const count = Number.isFinite(parsed)
                      ? Math.max(0, Math.min(limits[type as keyof typeof limits], Math.floor(parsed)))
                      : position.hand(owner).count(type)
                    event.currentTarget.value = String(count)
                    commit((next) => next.hand(owner).set(type, count))
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                  }}
                  width="52px"
                  minH="44px"
                  textAlign="center"
                  bg="surface.2"
                  border="1px solid {colors.border}"
                  borderRadius="md"
                />
              </styled.label>
            ))}
          </Wrap>
        </Box>
      ))}
      <Box mt="3">
        <Segmented
          value={position.color}
          onChange={(value) => commit((next) => next.setColor(value))}
          options={[
            { v: Color.BLACK, t: t('positionEditor.senteTurn') },
            { v: Color.WHITE, t: t('positionEditor.goteTurn') },
          ]}
        />
      </Box>
      {issue && (
        <styled.p role="status" fontSize="sm" color="fg.muted" mt="2">
          {t(`positionEditor.issue.${issue}`)}
        </styled.p>
      )}
      {(error || replayError) && (
        <styled.p role="alert" fontSize="sm" mt="2">
          {error || replayError}
        </styled.p>
      )}
      <Wrap gap="2" mt="3">
        <Button
          variant="primary"
          disabled={!!replayError}
          onClick={() => {
            const result = games.applyPosition(sfen, keepMoves)
            setError(result)
            if (!result) onClose()
          }}
        >
          {t('positionEditor.saveCopy')}
        </Button>
        <Button
          onClick={() =>
            navigator.clipboard.writeText(sfen).then(
              () => setError(null),
              () => setError(t('games.couldNotCopyToThe')),
            )
          }
        >
          {t('positionEditor.copySfen')}
        </Button>
      </Wrap>
      <styled.p fontSize="xs" color="fg.muted" mt="2">
        {t('positionEditor.originalKept')}
      </styled.p>
    </>
  )
}

export function PositionEditor({ games, onClose }: { games: AnalyzeGames; onClose: () => void }) {
  const { t } = useTranslation()
  const [source, setSource] = useState<'start' | 'current'>('start')
  const [keepMoves, setKeepMoves] = useState(games.positionDraft.hasMoves)
  return (
    <>
      <Segmented
        value={source}
        onChange={(value) => {
          setSource(value)
          setKeepMoves(value === 'start' && games.positionDraft.hasMoves)
        }}
        options={[
          { v: 'start', t: t('positionEditor.start') },
          { v: 'current', t: t('positionEditor.current') },
        ]}
      />
      {source === 'start' && games.positionDraft.hasMoves && (
        <Box mt="2">
          <Segmented
            value={keepMoves ? 'keep' : 'position'}
            onChange={(value) => setKeepMoves(value === 'keep')}
            options={[
              { v: 'keep', t: t('positionEditor.keepMoves') },
              { v: 'position', t: t('positionEditor.positionOnly') },
            ]}
          />
        </Box>
      )}
      <Editor key={source} games={games} source={games.positionDraft[source]} keepMoves={keepMoves} onClose={onClose} />
    </>
  )
}

export function PositionEditorDialog({ games, onClose }: { games: AnalyzeGames; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Dialog label={t('positionEditor.title')} onBackdrop={onClose} maxW="800px">
      <DialogHeader title={t('positionEditor.title')} closeLabel={t('settings.closeSettings')} onClose={onClose} />
      <PositionEditor games={games} onClose={onClose} />
    </Dialog>
  )
}
