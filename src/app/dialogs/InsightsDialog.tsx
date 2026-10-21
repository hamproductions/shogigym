import { useMemo, useState } from 'react'
import { token } from 'styled-system/tokens'
import { useTranslation } from 'react-i18next'
import { Box, styled, Wrap } from 'styled-system/jsx'
import { PieceType } from 'tsshogi'
import { gameRole, loadGames } from '@/app/games'
import { useBatchRate } from '@/app/hooks/useBatchRate'
import { cachedReview, useReviewVersion } from '@/app/memory'
import { PIECE_INFO } from '@/app/pieces'
import { Button } from '@/app/ui/Button'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { Tabs } from '@/app/ui/Tabs'
import { engineSupported } from '@/utils/engine'
import { buildInsights, type InsightGame, type Recurring, type Skill, type Suggestion } from '@/utils/insights'
import { SETUPS } from '@/utils/model'
import { PIECE_CHAR } from '@/utils/shogi'
import { MistakeDetail } from '@/app/ui/MistakeDetail'
import type { Mistake } from '@/utils/mistakes'
import { Text } from '@/components/ui'
import { FIX_ROUTE, LESSONS, type FixRoute } from './ReportDialog'
import { ReportList, ReportListBody, ReportListItem } from './report.styles'
import { LabelBadge } from '@/app/panels/panels.styles'
import { SvgCircle, SvgText } from '@/app/ui/Svg'
import { spellMarks } from '@/utils/notation'

const radarLine = { fill: 'none', stroke: 'border', strokeWidth: '1' }
const RadarRing = styled('polygon', { base: radarLine })
const RadarSpoke = styled('line', { base: radarLine })
const Subheading = styled('h4', { base: { mt: '3', mx: '0', mb: '1', fontSize: 'sm' } })

const AXES: Skill['key'][] = ['opening', 'middle', 'endgame', 'convert', 'tenacity', 'punish', 'steady']

function Radar({ skills, label }: { skills: Skill[]; label: (key: Skill['key']) => string }) {
  const size = 260
  const c = size / 2
  const r = 88
  const point = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    return [c + Math.cos(a) * r * (v / 100), c + Math.sin(a) * r * (v / 100)]
  }
  const values = AXES.map((key) => skills.find((s) => s.key === key)?.value ?? 0)
  const shape = values.map((v, i) => point(i, v).join(',')).join(' ')
  return (
    <styled.svg
      w="100%"
      maxW="340px"
      overflow="visible"
      _phone={{ justifySelf: 'center', maxW: '260px' }}
      viewBox={`-80 -4 ${size + 160} ${size + 8}`}
      role="img"
      aria-label={label('opening')}
    >
      {[25, 50, 75, 100].map((ring) => (
        <RadarRing key={ring} points={AXES.map((_, i) => point(i, ring).join(',')).join(' ')} />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = point(i, 100)
        return <RadarSpoke key={i} x1={c} y1={c} x2={x} y2={y} />
      })}
      <styled.polygon fill="color-mix(in srgb, {colors.accent} 28%, transparent)" stroke="accent" strokeWidth="2" strokeLinejoin="round" points={shape} />
      {values.map((v, i) => {
        const [x, y] = point(i, v)
        const known = skills.find((s) => s.key === AXES[i])?.value !== null
        return (
          <SvgCircle
            key={i}
            fill="fg.muted"
            opacity="0.6"
            css={{ '&[data-known]': { fill: 'accent', opacity: '1' } }}
            data-known={known || undefined}
            cx={x}
            cy={y}
            r={3.5}
          />
        )
      })}
      {AXES.map((key, i) => {
        const [x, y] = point(i, 122)
        return (
          <SvgText
            key={key}
            fill="fg.default"
            fontSize="13px"
            x={x}
            y={y}
            textAnchor={x < c - 4 ? 'end' : x > c + 4 ? 'start' : 'middle'}
            dominantBaseline="middle"
          >
            {label(key)}
          </SvgText>
        )
      })}
    </styled.svg>
  )
}

function Trend({ points }: { points: (number | null)[] }) {
  const known = points.map((v, i) => (v === null ? null : { v, i })).filter((p): p is { v: number; i: number } => p !== null)
  if (known.length < 2) return null
  const w = 300
  const h = 56
  const x = (i: number) => (i / Math.max(points.length - 1, 1)) * (w - 8) + 4
  const lo = Math.max(0, Math.min(...known.map((p) => p.v)) - 5)
  const hi = Math.min(100, Math.max(...known.map((p) => p.v)) + 5)
  const y = (v: number) => h - 4 - ((v - lo) / Math.max(hi - lo, 1)) * (h - 8)
  return (
    <styled.svg w="100%" h="56px" overflow="visible" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img">
      <styled.polyline
        fill="none"
        stroke="accent"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        points={known.map((p) => `${x(p.i)},${y(p.v)}`).join(' ')}
      />
      {known.map((p) => (
        <SvgCircle key={p.i} fill="accent" cx={x(p.i)} cy={y(p.v)} r={2.8} />
      ))}
    </styled.svg>
  )
}

type InsightTab = 'fix' | 'skills' | 'recurring'

type Props = {
  onClose: () => void
  onPractice: (items: Mistake[]) => void
  onRoute: (route: FixRoute) => void
  onLesson: (topicId: string) => void
}

export function InsightsDialog({ onClose, onPractice, onRoute, onLesson }: Props) {
  const { t, i18n } = useTranslation()
  const ja = i18n.language === 'ja'
  const [stored] = useState(() => loadGames())
  const [tab, setTab] = useState<InsightTab>('fix')
  const version = useReviewVersion()
  const included: InsightGame[] = useMemo(
    () =>
      stored
        .filter((g) => gameRole(g) === 'mine' && g.moves.length >= 4)
        .map((g) => ({ id: g.id, title: g.title, start: g.start, moves: g.moves, side: g.userSide, savedAt: g.savedAt, result: g.result })),
    [stored],
  )
  const progress = useBatchRate(included, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const insights = useMemo(() => buildInsights(included, cachedReview), [included, version])
  const go = (fn: () => void) => () => {
    onClose()
    fn()
  }
  const pieceName = (type: string) => (ja ? PIECE_CHAR[type as PieceType] : PIECE_INFO[type as PieceType].en)
  const practiceItems = (): Mistake[] =>
    insights.recurring.map((r) => ({
      id: `trend-${r.sfen.split(' ')[0]}-${r.best}`,
      sfen: r.sfen,
      played: r.example.usi,
      best: r.best,
      bestPv: r.example.review.best.pv,
      label: r.example.review.label,
      reasons: r.example.review.reasons,
      game: '',
      ply: r.ply,
    }))
  const actions = (s: Suggestion) => {
    const buttons: { key: string; label: string; run: () => void }[] = []
    const lesson = (id: string) => {
      const topic = SETUPS.find((item) => item.id === `lesson-${id}`)
      if (topic) buttons.push({ key: id, label: t('report.lesson', { title: ja ? topic.ja : topic.name }), run: go(() => onLesson(id)) })
    }
    const route = (r: FixRoute) => buttons.push({ key: r, label: t(`report.fixWith.${r}`), run: go(() => onRoute(r)) })
    if (s.kind === 'recurring')
      buttons.push({ key: 'practice', label: t('insights.practice', { count: insights.recurring.length }), run: go(() => onPractice(practiceItems())) })
    if (s.kind === 'phase') s.phase === 'opening' ? lesson('basics-opening') : s.phase === 'middle' ? route('tesuji') : route('tsume')
    if (s.kind === 'weakness' && s.tag) {
      LESSONS[s.tag].forEach(lesson)
      const r = FIX_ROUTE[s.tag]
      if (r) route(r)
    }
    if (s.kind === 'convert') lesson('endgame-yose')
    if (s.kind === 'tenacity') lesson('basics-attack-defense')
    if (s.kind === 'punish') route('tesuji')
    if (s.kind === 'steady') lesson('basics-opening')
    return buttons
  }
  const suggestionText = (s: Suggestion) => {
    const params: Record<string, string | number> = { ...s.params }
    if (s.phase) params.phase = t(`insights.phaseName.${s.phase}`)
    if (s.tag) params.name = t(`report.weak.${s.tag}.name`)
    if (s.kind === 'piece') params.piece = pieceName(String(s.params.piece))
    return t(`insights.suggest.${s.kind}`, params)
  }
  const recurringText = (r: Recurring) => t('insights.recurringItem', { count: r.count, games: r.games })
  const trend = insights.games.map((g) => g.accuracy)
  return (
    <Dialog
      label={t('insights.title')}
      display="flex"
      flexDirection="column"
      w="min(720px, calc(100vw - 24px))"
      maxH="min(640px, calc(100dvh - 24px))"
      overflow="hidden"
      onBackdrop={onClose}
    >
      <DialogHeader title={t('insights.title')} closeLabel={t('viewer.close')} onClose={onClose} />
      <Text tone="muted" size="xs" mb="4" title={spellMarks(t('insights.scopeHint'), i18n.language)}>
        {t('insights.includedOf', { count: included.length, total: stored.length })}
        {included.length > 0 && ` / ${t('insights.coverage', insights.coverage)}`}
        {progress && ` / ${t('insights.rating', progress)}`}
      </Text>
      {!engineSupported() && (
        <Text tone="muted" size="sm" mb="4">
          {t('insights.noEngine')}
        </Text>
      )}
      {included.length === 0 ? (
        <Text mb="4">{stored.length > 0 ? t('insights.none') : t('insights.noGames')}</Text>
      ) : (
        <>
          <Tabs
            flex="none"
            items={(['fix', 'skills', 'recurring'] as const).map((id) => ({
              id,
              label: id === 'recurring' && insights.recurring.length ? `${t('insights.recurring')} ${insights.recurring.length}` : t(`insights.${id}`),
            }))}
            value={tab}
            onChange={setTab}
          />
          <Box flex="1 1 auto" minH="min(340px, 50dvh)" overflowY="auto" pt="3" role="tabpanel">
            {tab === 'fix' &&
              (insights.suggestions.length === 0 ? (
                <Text tone="muted" size="sm" my="1em">
                  {t('insights.fixEmpty')}
                </Text>
              ) : (
                <styled.ol display="grid" m="0" p="0" listStyle="none">
                  {insights.suggestions.slice(0, 4).map((s, i) => (
                    <styled.li key={s.kind} py="3" borderBottom="1px solid {colors.border}" _first={{ pt: '0' }}>
                      <Text mb="2" fontSize={i === 0 ? 'md' : undefined} fontWeight={i === 0 ? 'bold' : undefined}>
                        {suggestionText(s)}
                      </Text>
                      <Wrap gap="2" align="center">
                        {actions(s).map((a) => (
                          <Button key={a.key} size="sm" onClick={a.run}>
                            {a.label}
                          </Button>
                        ))}
                      </Wrap>
                    </styled.li>
                  ))}
                </styled.ol>
              ))}
            {tab === 'skills' && (
              <Box display="grid" gridTemplateColumns="minmax(200px, 300px) 1fr" alignItems="start" gap="4" _phone={{ gridTemplateColumns: '1fr' }}>
                <Radar skills={insights.skills} label={(key) => t(`insights.skill.${key}`)} />
                <div>
                  <styled.ul display="grid" gap="2" m="0" p="0" listStyle="none">
                    {insights.skills.map((s) => (
                      <styled.li
                        key={s.key}
                        display="grid"
                        gridTemplateColumns="7em 1fr 2.2em"
                        gridTemplateAreas={`'name bar value' '. detail detail'`}
                        columnGap="2"
                        alignItems="center"
                        title={s.key in { convert: 1, tenacity: 1, punish: 1, steady: 1 } ? t(`insights.skillHint.${s.key}`) : undefined}
                      >
                        <styled.span gridArea="name" fontSize="sm">
                          {t(`insights.skill.${s.key}`)}
                        </styled.span>
                        <styled.i gridArea="bar" display="block" h="6px" borderRadius="full" bg="border" overflow="hidden">
                          <styled.u
                            display="block"
                            h="100%"
                            w="var(--score)"
                            borderRadius="inherit"
                            bg="accent"
                            textDecoration="none"
                            style={{ ['--score' as string]: `${s.value ?? 0}%` }}
                          />
                        </styled.i>
                        <styled.b gridArea="value" textAlign="right" fontSize="md" fontVariantNumeric="tabular-nums">
                          {s.value ?? '–'}
                        </styled.b>
                        <styled.small gridArea="detail" color="fg.muted" fontSize="2xs">
                          {s.value === null
                            ? t('insights.few')
                            : s.avgLoss !== undefined
                              ? t('report.phaseDetail', { loss: s.avgLoss, percent: s.mistakeRate })
                              : t('insights.nOfN', { hits: s.hits, total: s.total })}
                        </styled.small>
                      </styled.li>
                    ))}
                  </styled.ul>
                  {trend.filter((v) => v !== null).length >= 2 && (
                    <>
                      <Subheading>
                        {t('insights.trend')}{' '}
                        <Text as="span" tone="muted" size="sm">
                          {t('insights.trendHint')}
                        </Text>
                      </Subheading>
                      <Trend points={trend} />
                    </>
                  )}
                </div>
              </Box>
            )}
            {tab === 'recurring' && (
              <>
                {insights.recurring.length === 0 ? (
                  <Text tone="muted" size="sm" my="1em">
                    {t('insights.recurringEmpty')}
                  </Text>
                ) : (
                  <>
                    <Button variant="primary" mb="3" onClick={go(() => onPractice(practiceItems()))}>
                      {t('insights.practice', { count: insights.recurring.length })}
                    </Button>
                    <ReportList>
                      {insights.recurring.map((r) => (
                        <ReportListItem key={r.sfen}>
                          <LabelBadge style={{ ['--label' as string]: token.var('colors.accent') }}>{r.count}×</LabelBadge>
                          <ReportListBody>
                            <strong>{recurringText(r)}</strong>
                            <MistakeDetail
                              showPlayed
                              sfen={r.sfen}
                              played={r.example.usi}
                              best={r.best}
                              tag={r.tag}
                              loss={r.example.review.loss}
                              reason={r.example.review.reasons[0]}
                            />
                          </ReportListBody>
                        </ReportListItem>
                      ))}
                    </ReportList>
                  </>
                )}
                {insights.pieces.length > 0 && (
                  <>
                    <Subheading>{t('insights.pieces')}</Subheading>
                    <styled.ul m="0" pl="5" fontSize="sm">
                      {insights.pieces.slice(0, 3).map((p) => (
                        <li key={p.piece}>{t('insights.pieceItem', { piece: pieceName(p.piece), mistakes: p.mistakes, moves: p.moves, percent: p.rate })}</li>
                      ))}
                    </styled.ul>
                  </>
                )}
              </>
            )}
          </Box>
        </>
      )}
    </Dialog>
  )
}
