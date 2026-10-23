import * as THREE from 'three'
import { createBattlefield, battlefieldSurface } from '@/rendering/historical/battlefield'
import { addBattlefieldLighting, disposeBattlefieldLighting } from '@/rendering/historical/lighting'
import { compactRendering } from '@/rendering/board3d/dimensions'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FIGURES, createFigure, disposeFigures, poseFigure, type Figure, type FigureId } from '@/rendering/historical/figures'

export function mountHistoricalScene(host: HTMLElement) {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  host.querySelector('#view')!.appendChild(renderer.domElement)
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(7, 8, 11)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.5, 0)
  controls.enableDamping = true
  addBattlefieldLighting(scene, renderer, compactRendering())
  scene.add(createBattlefield(4.73, 5.16))
  const board = new THREE.Group()
  const surface = new THREE.Mesh(new THREE.BoxGeometry(9.46, 0.2, 10.32), battlefieldSurface(4.73, 5.16))
  surface.position.y = -0.1
  surface.receiveShadow = true
  board.add(surface)
  scene.add(board)
  const figures: Figure[] = []
  const group = new THREE.Group()
  scene.add(group)
  const hintGroup = new THREE.Group()
  scene.add(hintGroup)
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x307d9b, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  let selected: Figure
  let gallery = true
  let camp = 0
  let action = ''
  let actionStart = 0
  let origin = new THREE.Vector3()
  let incoming: Figure | undefined
  const select = host.querySelector<HTMLSelectElement>('#piece')!
  select.replaceChildren()
  FIGURES.forEach((spec) => select.add(new Option(`${spec.name} · ${spec.body}`, spec.id)))
  const status = host.querySelector('#status')!
  function hints() {
    hintGroup.clear()
    if (gallery) return
    const spec = selected.userData.spec
    const gold = spec.id === 'gold' || ['prom-silver', 'prom-knight', 'prom-lance', 'tokin'].includes(spec.id)
    const forward = camp ? 1 : -1
    const points: number[][] = []
    if (gold) points.push([-1, forward], [0, forward], [1, forward], [-1, 0], [1, 0], [0, -forward])
    else if (spec.id === 'knight') points.push([-1, forward * 2], [1, forward * 2])
    else if (spec.id === 'pawn') points.push([0, forward])
    else if (spec.id === 'silver') points.push([0, forward], [-1, -1], [-1, 1], [1, -1], [1, 1])
    else if (spec.id === 'king')
      for (let x = -1; x <= 1; x++)
        for (let z = -1; z <= 1; z++) {
          if (x || z) points.push([x, z])
        }
    else {
      for (let x = -4; x <= 4; x++)
        for (let z = -4; z <= 4; z++) {
          if (!x && !z) continue
          if (
            spec.id === 'lance'
              ? x === 0 && z * forward > 0
              : ['rook', 'dragon'].includes(spec.id)
                ? x === 0 || z === 0 || (spec.id === 'dragon' && Math.abs(x) === 1 && Math.abs(z) === 1)
                : Math.abs(x) === Math.abs(z) || (spec.id === 'dragon-horse' && Math.abs(x) + Math.abs(z) === 1)
          )
            points.push([x, z])
        }
    }
    for (const [x, z] of points) {
      const marker = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20), markerMaterial)
      marker.rotation.x = -Math.PI / 2
      marker.position.set(x, 0.025, z * 1.1)
      hintGroup.add(marker)
    }
  }
  function rebuild() {
    group.clear()
    figures.length = 0
    incoming = undefined
    action = ''
    board.visible = !gallery
    camera.position.set(gallery ? 7 : 10, gallery ? 8 : 12, gallery ? 11 : 14)
    if (gallery)
      FIGURES.forEach((spec, index) => {
        const figure = createFigure(spec.id, camp)
        figure.position.set(((index % 7) - 3) * 1.65, 0, (Math.floor(index / 7) - 0.5) * 3.2)
        figure.rotation.y = camp * Math.PI
        group.add(figure)
        figures.push(figure)
      })
    else {
      for (const side of [0, 1])
        for (let file = 0; file < 9; file++) {
          const id = (['lance', 'knight', 'silver', 'gold', 'king', 'gold', 'silver', 'knight', 'lance'] as FigureId[])[file]
          const figure = createFigure(id, side)
          figure.position.set(file - 4, 0, (side ? -4 : 4) * 1.1)
          figure.rotation.y = side * Math.PI
          group.add(figure)
          figures.push(figure)
        }
      selected = createFigure(select.value as FigureId, camp)
      selected.rotation.y = camp * Math.PI
      group.add(selected)
      figures.push(selected)
    }
    selected = gallery ? figures[FIGURES.findIndex((spec) => spec.id === select.value)] : selected
    status.textContent = `${selected.userData.spec.name} — ${selected.userData.spec.moves}`
    hints()
  }
  select.onchange = rebuild
  host.querySelector<HTMLButtonElement>('#mode')!.onclick = () => {
    gallery = !gallery
    host.querySelector('#mode')!.textContent = gallery ? 'Show battlefield' : 'Show all 14 forms'
    rebuild()
  }
  host.querySelector<HTMLButtonElement>('#side')!.onclick = () => {
    camp = 1 - camp
    rebuild()
  }
  for (const button of host.querySelectorAll<HTMLButtonElement>('[data-action]'))
    button.onclick = () => {
      if (action) return
      action = button.dataset.action!
      actionStart = performance.now() / 1000
      origin = selected.position.clone()
      if (action === 'promote') {
        const next = selected.userData.spec.promotion
        if (!next) {
          action = ''
          status.textContent = 'This form does not promote.'
          return
        }
        incoming = createFigure(next, camp)
        incoming.position.copy(origin)
        incoming.rotation.copy(selected.rotation)
        incoming.scale.setScalar(0.001)
        group.add(incoming)
      }
    }
  const particles = new Float32Array(90 * 3)
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))
  const sparks = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xffd57a, size: 0.075, transparent: true }))
  scene.add(sparks)
  sparks.visible = false
  const minimap = host.querySelector<HTMLCanvasElement>('#minimap')!
  const ctx = minimap.getContext('2d')!
  function resize() {
    const rect = host.querySelector('#view')!.getBoundingClientRect()
    renderer.setSize(rect.width, rect.height)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)
  resize()
  rebuild()
  renderer.setAnimationLoop((milliseconds) => {
    const time = milliseconds / 1000
    const t = time - actionStart
    const duration = action === 'promote' ? 0.4 : 0.26
    const phase = Math.min(t / duration, 1)
    for (const figure of figures)
      poseFigure(figure, time, figure === selected && action === 'move' ? 1 : 0, figure === selected && action === 'attack' ? phase : -1)
    if (action === 'move') {
      selected.position.z = origin.z + (camp ? 1 : -1) * 1.1 * phase
      selected.position.y = selected.userData.spec.body === 'horse' ? Math.sin(phase * Math.PI) * 0.7 : 0
    }
    if (action === 'drop') selected.position.y = Math.pow(1 - phase, 2) * 3
    if (action === 'defeat') {
      selected.rotation.z = phase * 1.4
      selected.position.y = -phase * 0.2
    }
    if (action === 'promote' && incoming) {
      const scale = Math.max(0.001, 1 - phase * 2)
      selected.scale.setScalar(scale)
      incoming.scale.setScalar(Math.max(0.001, Math.min(1, (phase - 0.4) * 2)))
      incoming.rotation.y = camp * Math.PI + (1 - phase) * Math.PI * 2
    }
    sparks.visible = !!action && ['attack', 'promote', 'drop'].includes(action)
    if (sparks.visible) {
      for (let i = 0; i < 90; i++) {
        const angle = i * 2.399
        const distance = ((t * 0.8 + i / 90) % 1) * (action === 'promote' ? 0.9 : 0.5)
        particles[i * 3] = selected.position.x + Math.cos(angle) * distance
        particles[i * 3 + 1] = distance * 2
        particles[i * 3 + 2] = selected.position.z + Math.sin(angle) * distance
      }
      particleGeometry.attributes.position.needsUpdate = true
    }
    if (action && t >= duration) {
      if (incoming) {
        group.remove(selected)
        figures[figures.indexOf(selected)] = incoming
        selected = incoming
        selected.scale.setScalar(1)
        selected.rotation.y = camp * Math.PI
        incoming = undefined
        select.value = selected.userData.spec.id
        hints()
        status.textContent = `${selected.userData.spec.name} — ${selected.userData.spec.moves}`
      }
      action = ''
    }
    ctx.fillStyle = '#e8ddbc'
    ctx.fillRect(0, 0, 180, 180)
    ctx.strokeStyle = '#9f9579'
    for (let i = 0; i <= 9; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 20, 0)
      ctx.lineTo(i * 20, 180)
      ctx.moveTo(0, i * 20)
      ctx.lineTo(180, i * 20)
      ctx.stroke()
    }
    for (const figure of figures) {
      const x = 90 + figure.position.x * 18
      const y = 90 + figure.position.z * 16.4
      ctx.fillStyle = figure === selected ? '#bf572f' : figure.userData.camp ? '#283e51' : '#817044'
      ctx.beginPath()
      ctx.moveTo(x, y + (figure.userData.camp ? 5 : -5))
      ctx.lineTo(x - 4, y + (figure.userData.camp ? -4 : 4))
      ctx.lineTo(x + 4, y + (figure.userData.camp ? -4 : 4))
      ctx.closePath()
      ctx.fill()
    }
    controls.update()
    renderer.render(scene, camera)
  })
  host.querySelector<HTMLButtonElement>('#reset')!.onclick = rebuild
  function dispose() {
    disposeBattlefieldLighting(scene)
    renderer.setAnimationLoop(null)
    controls.dispose()
    window.removeEventListener('resize', resize)
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    scene.traverse((object) => {
      if (object instanceof THREE.Light) object.dispose()
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        geometries.add(object.geometry)
        const list = Array.isArray(object.material) ? object.material : [object.material]
        list.forEach((material) => materials.add(material))
      }
    })
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
    disposeFigures()
    renderer.dispose()
    renderer.domElement.remove()
  }

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  renderer.domElement.addEventListener('pointermove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, (-(event.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(figures, true)[0]
    let owner: THREE.Object3D | undefined = hit?.object
    while (owner && !owner.userData.spec) owner = owner.parent ?? undefined
    const spec = owner?.userData.spec
    renderer.domElement.title = spec ? `${spec.name} · ${spec.moves}` : ''
  })
  return dispose
}
