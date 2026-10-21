import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'

export function RailSeal() {
  const { t } = useTranslation()
  return (
    <styled.div
      flex="none"
      w="44px"
      h="44px"
      mb="3"
      _compact={{ w: '32px', h: '32px', mt: '0', mr: '2px', mb: '0', ml: '0' }}
      _short={{ transform: 'scale(0.75)' }}
      title={t('app.shogilab')}
    >
      <styled.svg w="100%" h="100%" filter="drop-shadow({shadows.sm})" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 3 L50 11 L57 61 H7 L14 11 Z" fill="#e9c98f" stroke="#7a4a1c" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M32 7.5 L47.2 14.3 L53.4 57.5 H10.6 L16.8 14.3 Z" fill="none" stroke="#c8442f" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
        <text x="32" y="47" textAnchor="middle" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize="30" fill="#1d140c">
          究
        </text>
      </styled.svg>
    </styled.div>
  )
}
