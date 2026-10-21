import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { styled, Wrap } from 'styled-system/jsx'
import { cachedReview, rememberReview, useReviewVersion } from '@/app/memory'
import { Button } from '@/app/ui/Button'
import type { GameChoice } from '@/app/games'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { LABELS, reviewMove } from '@/utils/analysis'
import { inBook } from '@/utils/book'
import { engineSupported } from '@/utils/engine'
import { buildReport, PHASES, playerMoves, type GameLike, type Weakness } from '@/utils/learning'
import { SETUPS } from '@/utils/model'
import { moveText, type Side } from '@/utils/shogi'
import { MistakeDetail } from '@/app/ui/MistakeDetail'
import type { Mistake } from '@/utils/mistakes'
import { Text, type TextProps } from '@/components/ui'
import { LabelBadge } from '@/app/panels/panels.styles'
import {
  ReportBar,
  ReportBarFill,
  ReportHeading,
  ReportList,
  ReportListBody,
  ReportListItem,
  ReportPattern,
  ReportPhase,
  ReportPhaseDetail,
  ReportPhases,
  ReportPraiseItem,
  ReportSection,
  ReportShow,
} from './report.styles'

export type FixRoute = 'tsume' | 'tesuji' | 'lesson'
export const FIX_ROUTE: Partial<Record<Weakness, FixRoute>> = { missedMate: 'tsume', allowedTactic: 'tesuji', openingSlip: 'lesson' }
const MIN_MOVES = 4
export const LESSONS: Record<Weakness, string[]> = {
  missedMate: ['basics-mate-words', 'endgame-mate-tesuji'],
  allowedMate: ['basics-attack-defense', 'endgame-tsumero'],
  hangs: ['basics-value'],
  allowedTactic: ['basics-forks'],
  slippedWin: ['endgame-yose'],
  openingSlip: ['basics-opening'],
  other: [],
}

function ReportText(props: TextProps) {
  return <Text m="0" lineHeight="snug" {...props} />
}

type Problem = ReturnType<typeof buildReport>['problems'][number]

function practiceItems(game: GameLike, problems: Problem[]): Mistake[] {
  const id = [game.start, ...game.moves]
    .join(' ')
    .split('')
    .reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
    .toString(36)
  return problems.map((p) => ({
    id: `${id}-${p.ply}`,
    sfen: p.sfen,
    played: p.usi,
    best: p.review.best.move,
    bestPv: p.review.best.pv,
    label: p.review.label,
    reasons: p.review.reasons,
    game: '',
    ply: p.ply,
  }))
}

type ReportProps = { game: GameLike; userSide: Side; onShow: (ply: number) => void; onRoute: (route: FixRoute) => void; onClose: () => void }

function useRatings(game: GameLike, side: Side, enabled = true) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const moves = game.moves.join(' ')
  useEffect(() => {
    const todo = playerMoves({ start: game.start, moves: moves ? moves.split(' ') : [] }, side).filter((m) => !cachedReview(m.sfen, m.usi))
    if (!enabled || !todo.length || !engineSupported()) return
    let cancelled = false
    void (async () => {
      for (let i = 0; i < todo.length && !cancelled; i++) {
        setProgress({ done: i, total: todo.length })
        try {
          rememberReview(todo[i].sfen, todo[i].usi, await reviewMove(todo[i].sfen, todo[i].usi, { movetime: 400, inBook: inBook(todo[i].sfen, todo[i].usi) }))
        } catch {
          break
        }
      }
      if (!cancelled) setProgress(null)
    })()
    return () => {
      cancelled = true
    }
  }, [game.start, moves, side, enabled])
  return progress
}

type GameReportProps = {
  game: GameLike
  userSide: Side
  rate: boolean
  onShow: (ply: number) => void
  onRoute: (route: FixRoute) => void
  onPractice: (items: Mistake[]) => void
  onLesson: (topicId: string) => void
  onExpand?: () => void
  /** Background rating owned by the app; when set the report only displays it. */
  progress?: { done: number; total: number } | null
  /** Trends choice for this game; when given the side picker also opts the game in or out. */
  choice?: GameChoice | null
  onChoose?: (choice: GameChoice) => void
}

export function GameReport({ game, userSide, rate, progress: external, choice, onChoose, onShow, onRoute, onPractice, onLesson, onExpand }: GameReportProps) {
  const { t, i18n } = useTranslation()
  const [side, setSide] = useState<Side>(userSide)
  const version = useReviewVersion()
  const own = useRatings(game, side, rate && external === undefined)
  const progress = external === undefined ? own : external
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildReport(game, side, cachedReview), [game, side, version])
  const top = report.patterns.find((p) => p.tag !== 'other') ?? report.patterns[0]
  const route = top && FIX_ROUTE[top.tag]
  if (report.total < MIN_MOVES) return null
  return (
    <ReportSection aria-labelledby="game-report-title">
      <styled.div display="flex" alignItems="center" justifyContent="space-between" gap="2">
        <styled.h3
          id="game-report-title"
          m="0"
          whiteSpace="nowrap"
          fontFamily="mincho"
          fontSize="lg"
          fontWeight="heavy"
          letterSpacing="seal"
          textTransform="uppercase"
          color="fg.muted"
        >
          {t('report.title')}
        </styled.h3>
        <styled.div display="flex" alignItems="center" flexWrap="nowrap" gap="1" m="0" role="group" aria-label={t('report.sideLabel')}>
          {(['sente', 'gote'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              on={onChoose && choice ? choice === s : side === s}
              onClick={() => {
                setSide(s)
                onChoose?.(s)
              }}
              aria-label={t(`report.${s}`)}
              title={onChoose ? t('insights.pickSide') : undefined}
            >
              {s === 'sente' ? '☗' : '☖'}
            </Button>
          ))}
          {onChoose && (
            <Button size="sm" on={choice === 'study'} onClick={() => onChoose('study')} title={t('insights.studyTitle')}>
              {t('insights.role.study')}
            </Button>
          )}
          {onExpand && (
            <Button size="sm" variant="icon" onClick={onExpand} aria-label={t('report.expand')} title={t('report.expand')}>
              ⤢
            </Button>
          )}
        </styled.div>
      </styled.div>
      {progress && (
        <ReportText tone="muted" size="sm" role="status">
          {t('report.rating', progress)}
        </ReportText>
      )}
      {!engineSupported() && report.rated < report.total && (
        <ReportText tone="muted" size="sm">
          {t('report.noEngine')}
        </ReportText>
      )}
      {report.rated === 0 ? (
        !progress && (
          <ReportText tone="muted" size="sm">
            {rate ? t('report.noRated') : t('report.afterGame')}
          </ReportText>
        )
      ) : (
        <>
          <ReportText>
            <strong>{t('report.summary', { total: report.rated, good: report.good, percent: Math.round((report.good / report.rated) * 100) })}</strong>{' '}
            {report.accuracy !== null && (
              <Text as="span" tone="muted" size="sm">
                {t('report.accuracy', { score: report.accuracy })}
              </Text>
            )}
          </ReportText>
          <ReportPhases aria-label={t('report.phases')}>
            {PHASES.map((p) => (
              <ReportPhase key={p}>
                <span>{t(`report.phase.${p}`)}</span>
                <ReportBar>
                  <ReportBarFill style={{ ['--score' as string]: `${report.phases[p].score ?? 0}%` }} />
                </ReportBar>
                <Text as="span" tone="muted" size="sm">
                  {report.phases[p].score ?? t('report.few')}
                  {report.phases[p].avgLoss !== null && (
                    <ReportPhaseDetail>{t('report.phaseDetail', { loss: report.phases[p].avgLoss, percent: report.phases[p].mistakeRate })}</ReportPhaseDetail>
                  )}
                </Text>
              </ReportPhase>
            ))}
          </ReportPhases>
          {report.problems.length > 0 && (
            <styled.div display="grid" gap="1">
              <Button variant="primary" onClick={() => onPractice(practiceItems(game, report.problems))}>
                {t('report.practiceMistakes', { count: report.problems.length })}
              </Button>
              <ReportText tone="muted" size="xs">
                {t('report.practiceHint')}
              </ReportText>
            </styled.div>
          )}
          {top && (
            <ReportPattern>
              <strong>{t('report.patternCount', { name: t(`report.weak.${top.tag}.name`), count: top.count })}</strong>
              <ReportText>{t(`report.weak.${top.tag}.fix`)}</ReportText>
              <Wrap gap="2" align="center">
                {LESSONS[top.tag].map((id) => {
                  const topic = SETUPS.find((item) => item.id === `lesson-${id}`)
                  return (
                    topic && (
                      <Button key={id} size="sm" onClick={() => onLesson(id)}>
                        {t('report.lesson', { title: i18n.language === 'ja' ? topic.ja : topic.name })}
                      </Button>
                    )
                  )
                })}
                {route && (
                  <Button size="sm" onClick={() => onRoute(route)}>
                    {t(`report.fixWith.${route}`)}
                  </Button>
                )}
              </Wrap>
            </ReportPattern>
          )}
          {
            <>
              <styled.h4 mt="2" mx="0" mb="0" color="fg.muted" fontSize="sm">
                {t('report.problems')}
              </styled.h4>
              {report.problems.length === 0 ? (
                !progress && <ReportText>{t('report.clean')}</ReportText>
              ) : (
                <ReportList>
                  {report.problems.slice(0, 8).map((p) => (
                    <ReportListItem key={p.ply}>
                      <LabelBadge style={{ ['--label' as string]: LABELS[p.review.label].color }}>{LABELS[p.review.label].symbol}</LabelBadge>
                      <ReportListBody>
                        <strong>{t('report.played', { ply: p.ply, played: moveText(p.sfen, p.usi), loss: Math.round(p.review.loss * 100) })}</strong>
                        <MistakeDetail
                          snug
                          sfen={p.sfen}
                          played={p.usi}
                          best={p.review.best.move}
                          tag={p.tag}
                          loss={p.review.loss}
                          reason={p.review.reasons[0]}
                        />
                      </ReportListBody>
                      <ReportShow size="sm" onClick={() => onShow(p.ply)}>
                        {t('report.show')}
                      </ReportShow>
                    </ReportListItem>
                  ))}
                </ReportList>
              )}
              {report.praise.length > 0 && (
                <>
                  <styled.h4 mt="2" mx="0" mb="0" color="fg.muted" fontSize="sm">
                    {t('report.praise')}
                  </styled.h4>
                  <ReportList>
                    {report.praise.map((m) => (
                      <ReportPraiseItem key={m.ply}>
                        <LabelBadge style={{ ['--label' as string]: LABELS[m.review.label].color }}>{LABELS[m.review.label].symbol}</LabelBadge>
                        <strong>{moveText(m.sfen, m.usi)}</strong>
                        <Text as="span" tone="muted" size="sm">
                          {t('report.praiseMove', { ply: m.ply, label: LABELS[m.review.label].text })}
                        </Text>
                      </ReportPraiseItem>
                    ))}
                  </ReportList>
                </>
              )}
            </>
          }
        </>
      )}
    </ReportSection>
  )
}

export function ReportDialog({ game, userSide, onShow, onRoute, onClose }: ReportProps) {
  const { t } = useTranslation()
  const [side, setSide] = useState<Side>(userSide)
  const version = useReviewVersion()
  const progress = useRatings(game, side)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildReport(game, side, cachedReview), [game, side, version])
  const top = report.patterns.find((p) => p.tag !== 'other') ?? report.patterns[0]
  const route = top && FIX_ROUTE[top.tag]
  const go = (fn: () => void) => () => {
    onClose()
    fn()
  }
  const enough = report.total >= MIN_MOVES

  return (
    <Dialog label={t('report.title')} w="min(600px, 100%)" display="flex" flexDirection="column" gap="4" onBackdrop={onClose}>
      <DialogHeader title={t('report.title')} closeLabel={t('viewer.close')} mb="-2" onClose={onClose} />
      <styled.div display="flex" alignItems="center" gap="2">
        <Text as="span" tone="muted" size="sm">
          {t('report.sideLabel')}
        </Text>
        {(['sente', 'gote'] as const).map((s) => (
          <Button key={s} size="sm" on={side === s} onClick={() => setSide(s)}>
            {t(`report.${s}`)}
          </Button>
        ))}
      </styled.div>

      {!enough ? (
        <ReportText>{t('report.tooShort')}</ReportText>
      ) : (
        <>
          {progress && (
            <ReportText tone="muted" size="sm" role="status">
              {t('report.rating', progress)}
            </ReportText>
          )}
          {!engineSupported() && report.rated < report.total && (
            <ReportText tone="muted" size="sm">
              {t('report.noEngine')}
            </ReportText>
          )}
          {report.rated === 0 ? (
            !progress && <ReportText>{t('report.noRated')}</ReportText>
          ) : (
            <>
              <ReportSection>
                <ReportText>
                  <strong>{t('report.summary', { total: report.rated, good: report.good, percent: Math.round((report.good / report.rated) * 100) })}</strong>{' '}
                  {report.accuracy !== null && (
                    <Text as="span" tone="muted" size="sm">
                      {t('report.accuracy', { score: report.accuracy })}
                    </Text>
                  )}
                </ReportText>
                <ReportPhases aria-label={t('report.phases')}>
                  {PHASES.map((p) => (
                    <ReportPhase key={p}>
                      <span>{t(`report.phase.${p}`)}</span>
                      <ReportBar>
                        <ReportBarFill style={{ ['--score' as string]: `${report.phases[p].score ?? 0}%` }} />
                      </ReportBar>
                      <Text as="span" tone="muted" size="sm">
                        {report.phases[p].score ?? t('report.few')}
                        {report.phases[p].avgLoss !== null && (
                          <ReportPhaseDetail>
                            {t('report.phaseDetail', { loss: report.phases[p].avgLoss, percent: report.phases[p].mistakeRate })}
                          </ReportPhaseDetail>
                        )}
                      </Text>
                    </ReportPhase>
                  ))}
                </ReportPhases>
              </ReportSection>

              {top && (
                <ReportPattern as="section" display="grid" gap="2">
                  <ReportHeading>{t('report.pattern')}</ReportHeading>
                  <strong>{t('report.patternCount', { name: t(`report.weak.${top.tag}.name`), count: top.count })}</strong>
                  <ReportText>{t(`report.weak.${top.tag}.fix`)}</ReportText>
                  {route && (
                    <Button size="sm" variant="primary" onClick={go(() => onRoute(route))}>
                      {t(`report.fixWith.${route}`)}
                    </Button>
                  )}
                </ReportPattern>
              )}

              <ReportSection>
                <ReportHeading>{t('report.problems')}</ReportHeading>
                {report.problems.length === 0 ? (
                  !progress && <ReportText>{t('report.clean')}</ReportText>
                ) : (
                  <ReportList>
                    {report.problems.slice(0, 6).map((p) => (
                      <ReportListItem key={p.ply}>
                        <LabelBadge style={{ ['--label' as string]: LABELS[p.review.label].color }}>{LABELS[p.review.label].symbol}</LabelBadge>
                        <ReportListBody>
                          <strong>{t('report.played', { ply: p.ply, played: moveText(p.sfen, p.usi), loss: Math.round(p.review.loss * 100) })}</strong>
                          <MistakeDetail
                            snug
                            sfen={p.sfen}
                            played={p.usi}
                            best={p.review.best.move}
                            tag={p.tag}
                            loss={p.review.loss}
                            reason={p.review.reasons[0]}
                          />
                        </ReportListBody>
                        <ReportShow size="sm" onClick={go(() => onShow(p.ply))}>
                          {t('report.show')}
                        </ReportShow>
                      </ReportListItem>
                    ))}
                  </ReportList>
                )}
              </ReportSection>

              {report.praise.length > 0 && (
                <ReportSection>
                  <ReportHeading>{t('report.praise')}</ReportHeading>
                  <ReportList>
                    {report.praise.map((m) => (
                      <ReportPraiseItem key={m.ply}>
                        <LabelBadge style={{ ['--label' as string]: LABELS[m.review.label].color }}>{LABELS[m.review.label].symbol}</LabelBadge>
                        <strong>{moveText(m.sfen, m.usi)}</strong>
                        <Text as="span" tone="muted" size="sm">
                          {t('report.praiseMove', { ply: m.ply, label: LABELS[m.review.label].text })}
                        </Text>
                      </ReportPraiseItem>
                    ))}
                  </ReportList>
                </ReportSection>
              )}
            </>
          )}
        </>
      )}
      <ReportText tone="muted" size="sm">
        {t('report.privacy')}
      </ReportText>
    </Dialog>
  )
}
