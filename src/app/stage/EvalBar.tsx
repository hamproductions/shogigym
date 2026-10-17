import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { useGlide } from '@/app/hooks/useGlide'
import { SideMark } from '@/app/ui/SideMark'
import { evalBarNumber } from './stage.styles'

export function EvalBar({ rate, flipped }: { rate: number; flipped: boolean }) {
  const { t } = useTranslation()
  const sente = Math.round(rate * 100)
  const bottomShare = flipped ? 1 - rate : rate
  const fill = useGlide<HTMLDivElement>('height', bottomShare * 100)
  return (
    <styled.div
      position="relative"
      flex="none"
      alignSelf="stretch"
      w="var(--eval-bar-width)"
      mr="0"
      overflow="hidden"
      bg="#1d1a17"
      boxShadow="inset 0 0 0 1px {colors.border}"
      _compact={{ display: 'none' }}
      title={t('app.winChance', { value: sente, value2: 100 - sente })}
      aria-label={t('app.winChanceShort')}
    >
      <styled.div ref={fill} position="absolute" left="0" right="0" bottom="0" bg="#f1eadb" style={{ height: `${bottomShare * 100}%` }} />
      <span className={evalBarNumber({ place: bottomShare >= 0.5 ? 'bottom' : 'top' })}>
        <SideMark side={rate >= 0.5 ? 'sente' : 'gote'} flipped={flipped} />
        <br />
        {Math.round(Math.max(rate, 1 - rate) * 100)}
      </span>
    </styled.div>
  )
}
