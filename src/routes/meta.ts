import { mainStrategies, strategyById } from '../data/strategies'

const SITE = 'Shogi Gym 将棋ジム'

const MODES: Record<string, { title: string; description: string }> = {
  play: { title: 'Play the AI', description: 'Play shogi against the AI at beginner to full strength, with a coach that explains every move.' },
  analyze: { title: 'Analyze a game', description: 'Load a KIF or play out a game, rate every move and explore variations with the engine.' },
  openings: { title: 'Openings', description: 'Learn shogi openings for your main strategy with study and quiz modes, from beginner to amateur 1–2 dan.' },
  review: { title: 'Review', description: 'Spaced repetition of the positions you have learned and the mistakes from your games.' },
  tsume: { title: 'Tsume', description: 'Mate problems from 1 to 7 moves with staged hints.' },
  tesuji: { title: 'Tesuji', description: 'Find the tactical trick: pawn tesuji, forks, focal points and more.' },
}

export function pageMeta(mode: string | undefined, main: string | undefined) {
  const strategy = main ? strategyById(main) : undefined
  if (strategy)
    return {
      title: `${strategy.ja} ${strategy.en} openings · ${SITE}`,
      description: `Learn ${strategy.en} (${strategy.ja}): its plans and the main lines against each opponent setup, with study and quiz modes.`,
    }
  const m = mode ? MODES[mode] : undefined
  if (m) return { title: `${m.title} · ${SITE}`, description: m.description }
  return { title: SITE, description: 'A free shogi training gym: learn openings for every strategy, review, tsume and tesuji, play the AI and analyze your games.' }
}

export const knownMain = (id: string) => mainStrategies().some((s) => s.id === id)
