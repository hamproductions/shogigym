import { go, useHashRoute } from './hooks'
import { Home } from './pages/Home'
import { CoursePage } from './pages/CoursePage'
import { Drill } from './pages/Drill'
import { Tsume } from './pages/Tsume'
import { Analyze } from './pages/Analyze'
import { Play } from './pages/Play'
import { Patterns } from './pages/Patterns'

const NAV = [
  { route: '', label: 'Openings' },
  { route: 'patterns', label: 'Patterns' },
  { route: 'drill', label: 'Review' },
  { route: 'tsume', label: 'Tsume' },
  { route: 'analyze', label: 'Analyze' },
  { route: 'play', label: 'Free board' },
]

export default function App() {
  const [page = '', ...rest] = useHashRoute()
  const active = page === 'course' ? '' : page
  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => go()}>
          <span className="brand-mark">四</span> Shiken-bisha dojo
        </button>
        <nav>
          {NAV.map((n) => (
            <button key={n.route} className={active === n.route ? 'on' : ''} onClick={() => go(...(n.route ? [n.route] : []))}>
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {page === '' && <Home />}
        {page === 'course' && <CoursePage id={rest[0]} nodeId={rest[1]} />}
        {page === 'patterns' && <Patterns />}
        {page === 'drill' && <Drill />}
        {page === 'tsume' && <Tsume />}
        {page === 'analyze' && <Analyze />}
        {page === 'play' && <Play sfen={rest[0]} />}
      </main>
      <footer className="footer">
        GPL-3.0. Engine: YaneuraOu (WASM build by mizar, GPL-3.0). Joseki data: Shiryu181/shogi-joseki (GPL-3.0) plus lines from hibitonshi.com and Wikipedia. Tsume: YaneuraOu mate set. Rules and kifu: tsshogi (MIT).
      </footer>
    </>
  )
}
