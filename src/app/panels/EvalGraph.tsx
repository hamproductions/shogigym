import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, styled } from 'styled-system/jsx'
import { LABELS, type Label } from '@/utils/analysis'
import { SvgPath, SvgText } from '@/app/ui/Svg'

const W = 360
const H = 88

export function EvalGraph({
  values,
  labels,
  ply: cursor,
  onJump,
}: {
  values: (number | undefined)[]
  labels: (Label | undefined)[]
  ply: number
  onJump: (i: number) => void
}) {
  const { t } = useTranslation()
  const id = useId()
  const n = Math.max(values.length - 1, 1)
  const x = (i: number) => (i / n) * W
  const y = (cp: number) => H / 2 - (Math.max(-2000, Math.min(2000, cp)) / 2000) * (H / 2 - 4)
  const known = values.map((v, i) => (v === undefined ? null : [x(i), y(v)])).filter((p): p is number[] => p !== null)
  const line = known.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
  const area = known.length ? `${line}L${known.at(-1)![0].toFixed(1)},${H / 2}L${known[0][0].toFixed(1)},${H / 2}Z` : ''
  const selected = labels[cursor]
  return (
    <Box position="relative">
      <Box
        position="absolute"
        left="1"
        top="1"
        h="80px"
        zIndex="1"
        pointerEvents="none"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        color="fg.muted"
        fontSize="xs"
        lineHeight="tight"
        _narrow={{ h: '26px', fontSize: '2xs' }}
      >
        <span title={t('graph.senteAhead')} aria-label={t('graph.senteAhead')}>
          ☗
        </span>
        <span title={t('graph.goteAhead')} aria-label={t('graph.goteAhead')}>
          ☖
        </span>
      </Box>
      <styled.svg
        display="block"
        w="100%"
        h="88px"
        borderRadius="sm"
        bg="color-mix(in srgb, {colors.fg.default} 6%, transparent)"
        cursor="pointer"
        _narrow={{ h: '34px' }}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={t('graph.evaluationByMove')}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onJump(Math.round(((e.clientX - rect.left) / rect.width) * n))
        }}
      >
        <defs>
          <clipPath id={`${id}-sente`}>
            <rect width={W} height={H / 2} />
          </clipPath>
          <clipPath id={`${id}-gote`}>
            <rect y={H / 2} width={W} height={H / 2} />
          </clipPath>
        </defs>
        <styled.line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="border.strong" strokeWidth="1" />
        {area && <SvgPath d={area} fill="color-mix(in srgb, {colors.success} 24%, transparent)" clipPath={`url(#${id}-sente)`} />}
        {area && <SvgPath d={area} fill="color-mix(in srgb, {colors.info} 24%, transparent)" clipPath={`url(#${id}-gote)`} />}
        {line && <SvgPath d={line} fill="none" stroke="fg.default" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />}
        <styled.line x1={x(cursor)} x2={x(cursor)} y1="0" y2={H} stroke="accent" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {labels.map((label, i) => {
          const value = values[i]
          if (!label || value === undefined) return null
          const meta = LABELS[label]
          return (
            <styled.g key={i} fill="light-dark(color-mix(in srgb, var(--label) 55%, #000), var(--label))" style={{ ['--label' as string]: meta.color }}>
              <title>
                {i}: {meta.symbol} {meta.text}
              </title>
              <circle cx={x(i)} cy={y(value)} r={i === cursor ? 3.5 : 2.5} />
              {(n <= 32 || i === cursor) && (
                <SvgText
                  font="{fontWeights.bold} 9px {fonts.sans}"
                  textAnchor="middle"
                  x={Math.max(8, Math.min(W - 8, x(i)))}
                  y={Math.max(12, Math.min(H - 4, y(value) - 7))}
                >
                  {meta.symbol}
                </SvgText>
              )}
            </styled.g>
          )
        })}
      </styled.svg>
      {selected && (
        <Box display="flex" gap="2" mt="1" fontSize="xs" color="fg.muted" style={{ ['--label' as string]: LABELS[selected].color }}>
          <span>{cursor}</span>
          <styled.strong color="light-dark(color-mix(in srgb, var(--label) 55%, #000), var(--label))">
            {LABELS[selected].symbol} {LABELS[selected].text}
          </styled.strong>
        </Box>
      )}
    </Box>
  )
}
