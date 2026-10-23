import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { styled } from 'styled-system/jsx'
import { DevPage } from './pieces.styles'
import { mountHistoricalScene } from './HistoricalScene'

export default function HistoricalTest() {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => mountHistoricalScene(host.current!), [])
  return (
    <DevPage ref={host}>
      <Link to="/">Back to app</Link>
      <styled.h1 fontSize="xl" my="3">
        Historical figure workshop
      </styled.h1>
      <p>All 14 forms. Drag to orbit, scroll to inspect, hover for identity and movement.</p>
      <styled.div display="flex" gap="2" flexWrap="wrap" my="3">
        <button id="mode">Show battlefield</button>
        <button id="side">Reverse ownership</button>
        <select id="piece" aria-label="Piece" />
        <button id="reset">Reset</button>
      </styled.div>
      <styled.div id="view" h="min(70vh, 760px)" minH="320px" touchAction="none" />
      <p id="status" />
      <styled.div display="flex" gap="2" flexWrap="wrap" my="3">
        <button data-action="move">Move</button>
        <button data-action="attack">Attack</button>
        <button data-action="promote">成り · transform</button>
        <button data-action="defeat">Defeat</button>
        <button data-action="drop">Drop</button>
      </styled.div>
      <styled.canvas id="minimap" width={180} height={180} w="180px" h="180px" />
      <p>Isolated asset and motion study. Covered ox-cart is an art interpretation.</p>
    </DevPage>
  )
}
