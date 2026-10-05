import { mainStrategies, strategyById } from '@/data/strategies'

const SITE = 'Shogi Gym 将棋ジム'
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://hamproductions.github.io/shogilab').replace(/\/$/, '')

const MODES: Record<string, { title: string; description: string }> = {
  play: { title: 'Play the AI', description: 'Play shogi against the AI at beginner to full strength, with a coach that explains every move.' },
  view: { title: 'Watch the bots', description: 'Watch two shogi bots play automatically and explore the board with a free camera.' },
  analyze: { title: 'Analyze a game', description: 'Load a KIF or play out a game, rate every move and explore variations with the engine.' },
  openings: { title: 'Openings', description: 'Learn shogi openings for your main strategy with study and quiz modes, from beginner to amateur 1–2 dan.' },
  review: { title: 'Review', description: 'Spaced repetition of the positions you have learned and the mistakes from your games.' },
  tsume: { title: 'Tsume', description: 'Shogi checkmate puzzles (詰将棋) from 1 to 7 moves, with staged hints.' },
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
  return {
    title: SITE,
    description: 'A free shogi training gym: learn openings for every strategy, review, tsume and tesuji, play the AI and analyze your games.',
  }
}

export const knownMain = (id: string) => mainStrategies().some((s) => s.id === id)

export function metaTags(title: string, description: string, pathname: string) {
  const url = `${SITE_URL}${pathname.endsWith('/') ? pathname : `${pathname}/`}`
  const image = `${SITE_URL}/og.png`
  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1280' },
    { property: 'og:image:height', content: '640' },
    { property: 'og:locale', content: 'ja_JP' },
    { property: 'og:locale:alternate', content: 'en_US' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'keywords', content: '将棋, 定跡, 詰将棋, 手筋, shogi, shogi openings, joseki, tsume, tesuji, shogi AI, 将棋ジム' },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SITE,
        url: `${SITE_URL}/`,
        image,
        description,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any (web browser)',
        inLanguage: ['ja', 'en'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      },
    },
  ]
}
