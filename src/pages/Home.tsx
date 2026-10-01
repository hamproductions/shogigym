import { COURSES, SETUPS, sideToMove, walkNodes, type Course } from '../model'
import { go, useCards } from '../hooks'
import { isDifficult, positionKey, type Card } from '../srs'

function courseLabel(course: Course) {
  const side = course.userSide === 'sente' ? '☗ sente' : '☖ gote'
  return course.notesFromOpponentView ? `Their attack, you defend (${side})` : `You play it (${side})`
}

function courseOutcome(course: Course) {
  const deviations = countKinds(course)
  return deviations ? `${deviations} known mistake${deviations > 1 ? 's' : ''} to learn` : null
}

function countKinds(course: Course) {
  let n = 0
  const walk = (node: Course['root']) => node.branches.forEach((b) => {
    if (b.kind === 'deviation') n++
    if (b.child) walk(b.child)
  })
  walk(course.root)
  return n
}

const decisionKeys = new Map<string, string[]>(
  COURSES.map((course) => {
    const keys: string[] = []
    walkNodes(course.root, (node) => {
      if (sideToMove(node) === course.userSide && node.branches.some((b) => b.kind !== 'deviation')) keys.push(positionKey(node.sfen))
    })
    return [course.id, [...new Set(keys)]]
  }),
)

function progress(course: Course, cards: Map<string, Card>) {
  const keys = decisionKeys.get(course.id) ?? []
  const learned = keys.filter((k) => (cards.get(k)?.level ?? 0) >= 2).length
  return { learned, total: keys.length }
}

export function Home() {
  const cards = useCards()
  const byKey = new Map(cards.map((c) => [c.key, c]))
  const now = Date.now()
  const due = cards.filter((c) => c.due <= now).length
  const difficult = cards.filter(isDifficult).length

  return (
    <div className="home">
      <section className="home-intro">
        <h1>Shiken-bisha against everything</h1>
        <p>
          Pick what your opponent is doing. Each line comes from published joseki sources, has the reason for every move, and marks the mistakes that lose. The AI checks anything you try off the line.
        </p>
        <div className="quick">
          <button className="primary" onClick={() => go('drill')}>
            Review {due > 0 ? `${due} due` : 'positions'}
            {difficult > 0 && <small>, {difficult} difficult</small>}
          </button>
          <button onClick={() => go('patterns')}>Win and failure patterns</button>
          <button onClick={() => go('tsume')}>Tsume problems</button>
          <button onClick={() => go('analyze')}>Analyze a kifu</button>
          <button onClick={() => go('play')}>Free board vs AI</button>
        </div>
      </section>

      <section className="setups">
        {SETUPS.map((setup) => {
          const courses = COURSES.filter((c) => c.setupId === setup.id).sort((a, b) => Number(a.notesFromOpponentView) - Number(b.notesFromOpponentView))
          return (
            <article key={setup.id} className="setup" id={setup.id}>
              <header>
                <h2>{setup.ja}</h2>
                <p className="setup-en">{setup.name}</p>
              </header>
              <p>{setup.intro}</p>
              {setup.shikenPlan && <p className="plan">{setup.shikenPlan}</p>}
              <div className="course-links">
                {courses.map((course) => {
                  const { learned, total } = progress(course, byKey)
                  return (
                    <button key={course.id} onClick={() => go('course', course.id)}>
                      <span className="course-title">{course.title}</span>
                      <span className="course-meta">
                        {courseLabel(course)}
                        {courseOutcome(course) && `, ${courseOutcome(course)}`}
                      </span>
                      <span className="progress" aria-label={`${learned} of ${total} positions learned`}>
                        <span className="progress-fill" style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
                      </span>
                      <span className="course-meta">{learned} of {total} positions learned</span>
                    </button>
                  )
                })}
                {courses.length === 0 && (
                  <button onClick={() => go('play')}>
                    <span className="course-title">Spar vs AI</span>
                    <span className="course-meta">No book line collected yet</span>
                  </button>
                )}
              </div>
              <details className="sources">
                <summary>Sources</summary>
                <ul>
                  {setup.sources.map((s) => (
                    <li key={s}><a href={s} target="_blank" rel="noreferrer">{decodeURI(s)}</a></li>
                  ))}
                </ul>
              </details>
            </article>
          )
        })}
      </section>
    </div>
  )
}
