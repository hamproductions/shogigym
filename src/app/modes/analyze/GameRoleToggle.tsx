import { useTranslation } from 'react-i18next'
import type { GameChoice } from '@/app/games'
import { Segmented } from '@/app/ui/Segmented'

/** Opt a game in or out of your cross-game trends: ☗ / ☖ is your side, Study leaves it out. */
export function GameRoleToggle({ value, onChange }: { value: GameChoice; onChange: (choice: GameChoice) => void }) {
  const { t } = useTranslation()
  return (
    <Segmented
      size="small"
      className="app-role-toggle"
      label={t('insights.countIn')}
      value={value}
      onChange={onChange}
      options={[
        { v: 'sente', t: t('insights.role.sente') },
        { v: 'gote', t: t('insights.role.gote') },
        { v: 'study', t: t('insights.role.study') },
      ]}
    />
  )
}
