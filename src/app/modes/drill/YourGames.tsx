import '../lesson/lesson.css'
import { useTranslation } from 'react-i18next'
import { loadGames, type StoredGame } from '../../games'
import { savedAtLabel, sideMark } from '../../lib/notation'
import { Button } from '../../ui/Button'

export function YourGames({ onOpen }: { onOpen: (g: StoredGame) => void }) {
  const { t } = useTranslation()
  const games = loadGames().filter((g) => g.vsAi).slice(0, 6)
  if (!games.length) return null
  return (
    <div className="app-your-games">
      <strong>{t('review.yourGames')}</strong>
      {games.map((g) => (
        <div key={g.id} className="app-your-game">
          <span className={`app-result-chip ${g.result ?? ''}`}>{t(`review.result.${g.result ?? 'none'}`)}</span>
          <span className="app-your-game-title">{sideMark(g.userSide)} {savedAtLabel(new Date(g.savedAt))}</span>
          <span className="app-muted">{t('review.moveCount', { count: g.moves.length })}</span>
          <Button size="sm" onClick={() => onOpen(g)}>{t('review.reviewGame')}</Button>
        </div>
      ))}
    </div>
  )
}
