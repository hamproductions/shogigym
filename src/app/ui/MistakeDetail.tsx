import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { css } from 'styled-system/css'
import { Box, styled } from 'styled-system/jsx'
import type { Weakness } from '@/utils/learning'
import { colorSide, moveText, positionOf } from '@/utils/shogi'
import { PositionView } from '@/rendering/PositionView'
import { Text } from '@/components/ui'

const move = css({ px: '0.3em', borderRadius: 'xs', fontWeight: 'bold', whiteSpace: 'nowrap' })
const playedMove = css({ bg: 'color-mix(in srgb, #c4442a 24%, transparent)', boxShadow: 'inset 0 -2px 0 #c4442a' })
const bestMove = css({ bg: 'color-mix(in srgb, #2f8f4e 24%, transparent)', boxShadow: 'inset 0 -2px 0 #2f8f4e' })

type Props = { sfen: string; played: string; best: string; tag: Weakness; loss: number; reason?: string; showPlayed?: boolean }

/**
 * What went wrong in plain words. The played and better moves are tinted red and green, the same colours
 * they have on the small position picture beside the text (tap the picture to enlarge it).
 */
export function MistakeDetail({ sfen, played, best, tag, loss, reason, showPlayed }: Props) {
  const { t, i18n } = useTranslation()
  const [big, setBig] = useState(false)
  const stop = i18n.language === 'ja' ? '。' : '. '
  return (
    <Box
      display="grid"
      gridTemplateColumns={big ? '1fr' : 'minmax(0, 1fr) 104px'}
      alignItems="start"
      gap="2"
      mt="1"
      css={{ '@container (max-width: 420px)': { gridTemplateColumns: '1fr' } }}
    >
      <div>
        <Text mt="0" mb="1" fontSize="sm">
          {showPlayed && (
            <>
              {t('report.youPlayed')} <span className={`${move} ${playedMove}`}>{moveText(sfen, played)}</span>
              {stop}
            </>
          )}
          <styled.em color="accent" fontStyle="normal" fontWeight="bold" fontSize="xs">
            {t(`report.weak.${tag}.name`)}
            {stop}
          </styled.em>
          {t(`report.weak.${tag}.what`)}
          {best !== played && (
            <>
              {' '}
              {t('report.betterWas')} <span className={`${move} ${bestMove}`}>{moveText(sfen, best)}</span>{' '}
              {t('report.keepsMore', { percent: Math.max(1, Math.round(loss * 100)) })}
            </>
          )}
        </Text>
        {reason && (
          <Text tone="muted" size="sm" mt="0" mb="1">
            {reason}
          </Text>
        )}
      </div>
      <styled.button
        type="button"
        display="block"
        p="0"
        borderRadius="sm"
        bg="none"
        w={big ? 'min(300px, 100%)' : undefined}
        cursor={big ? 'zoom-out' : 'zoom-in'}
        css={{ '& > svg': { w: '100%', m: '0' }, '@container (max-width: 420px)': { w: big ? 'min(300px, 100%)' : 'min(180px, 100%)' } }}
        onClick={() => setBig((v) => !v)}
        aria-expanded={big}
        aria-label={t('report.enlargePosition')}
      >
        <PositionView sfen={sfen} played={played} best={best} flipped={colorSide(positionOf(sfen).color) === 'gote'} />
      </styled.button>
    </Box>
  )
}
