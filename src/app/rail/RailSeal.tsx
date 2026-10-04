import { useTranslation } from 'react-i18next'

export function RailSeal() {
  const { t } = useTranslation()
  return (
    <div className="app-seal" title={t('app.shogilab')}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 3 L50 11 L57 61 H7 L14 11 Z" fill="#e9c98f" stroke="#7a4a1c" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M32 7.5 L47.2 14.3 L53.4 57.5 H10.6 L16.8 14.3 Z" fill="none" stroke="#c8442f" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
        <text x="32" y="47" textAnchor="middle" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize="30" fill="#1d140c">
          究
        </text>
      </svg>
    </div>
  )
}
