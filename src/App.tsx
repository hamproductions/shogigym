import { Component, useEffect, useState, type ReactNode } from 'react'
import { Workshop } from './workshop/Workshop'
import { PieceViewer } from './workshop/PieceViewer'

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
        <h1>Something went wrong</h1>
        <p>{this.state.error.message}</p>
        <p>Your progress and settings are safe. Resetting only clears the game that was open.</p>
        <button onClick={this.reset}>Reset the open game and reload</button>
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
      {hash === '#viewer' ? (
        <div className="ws">
          <PieceViewer page onClose={() => (location.hash = '')} />
        </div>
      ) : (
        <Workshop />
      )}
    </Recover>
  )
}
