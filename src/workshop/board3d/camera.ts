import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FLAT } from './dimensions'
import { cameraFit, layout } from './layout'
import type { Board3DProps, SceneState } from './types'

const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

function syncControls(s: SceneState, orbit: boolean) {
  if (orbit && !s.controls) {
    const controls = new OrbitControls(s.camera, s.renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.enableDamping = true
    controls.maxPolarAngle = Math.PI * 0.48
    controls.minDistance = 6
    controls.maxDistance = 80
    s.controls = controls
  }
  if (!orbit && s.controls) {
    s.controls.dispose()
    s.controls = null
  }
}

export function updateView(s: SceneState, props: Board3DProps, dt: number) {
  const { camera } = s
  s.tilt += (s.tiltTarget - s.tilt) * ease(dt, 9)
  const flip = props.flipped ? Math.PI : 0
  if (!s.settled) {
    s.root.rotation.y = flip
    s.settled = true
  }
  s.root.rotation.y += (flip - s.root.rotation.y) * ease(dt, 12)
  if (Math.abs(flip - s.root.rotation.y) < 0.002) s.root.rotation.y = flip
  const distance = cameraFit(camera.aspect, s.tilt, props.sideRoom ?? 0) / (2 * Math.tan((camera.fov * Math.PI) / 360))
  const angle = (FLAT ? 0 : 0.02) + s.tilt * 0.8
  const pan = layout.portrait ? 0 : s.tilt * 0.6
  syncControls(s, !!props.orbit)
  const near = s.controls ? 0.1 : Math.max(0.1, distance - 45)
  const far = s.controls ? 400 : distance + 120
  if (camera.near !== near || camera.far !== far) {
    camera.near = near
    camera.far = far
    camera.updateProjectionMatrix()
  }
  if (s.controls) s.controls.update()
  else {
    camera.position.set(pan, Math.cos(angle) * distance, Math.sin(angle) * distance)
    camera.lookAt(pan, 0, s.tilt * 0.4)
  }
}
