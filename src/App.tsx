import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { Workshop } from './workshop/Workshop'
import { PieceViewer } from './workshop/PieceViewer'
import i18n from './i18n'

const KomadaiTest = import.meta.env.DEV ? lazy(() => import('./workshop/KomadaiTest')) : null

class Recover extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  reset = () => {
    try {
      localStorage.removeItem('joseki-practice:session:v2')
    } catch (error) {
      console.warn('session not cleared', error)
    }
    location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="ws-crash">
        <h1>{i18n.t('app.somethingWentWrong')}</h1>
        <p>{this.state.error.message}</p>
        <p>{i18n.t('app.yourProgressAndSettingsAre')}</p>
        <button onClick={this.reset}>{i18n.t('app.resetTheOpenGameAnd')}</button>
      </div>
    )
  }
}

export default function App() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => setHash(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return (
    <Recover>
      {KomadaiTest && hash === '#komadai' ? (
        <Suspense fallback={null}>
          <KomadaiTest />
        </Suspense>
      ) : hash === '#viewer' ? (
        <div className="ws">
          <PieceViewer page onClose={() => (location.hash = '')} />
        </div>
      ) : (
        <Workshop />
      )}
    </Recover>
  )
}
