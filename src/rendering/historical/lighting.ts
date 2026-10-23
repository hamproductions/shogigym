import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

const sunDirection = new THREE.Vector3(-18, 28, -14).normalize()
const environments = new WeakMap<THREE.Scene, THREE.WebGLRenderTarget>()

export function battlefieldSky() {
  const sky = new Sky()
  sky.scale.setScalar(1000)
  sky.renderOrder = 1000
  sky.material.uniforms.turbidity.value = 4
  sky.material.uniforms.rayleigh.value = 1.2
  sky.material.uniforms.mieCoefficient.value = 0.004
  sky.material.uniforms.mieDirectionalG.value = 0.82
  sky.material.uniforms.cloudCoverage.value = 0
  sky.material.uniforms.sunPosition.value.copy(sunDirection).multiplyScalar(450000)
  return sky
}

export function addBattlefieldLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer, compact: boolean) {
  const sky = battlefieldSky()
  scene.add(sky)
  scene.background = new THREE.Color(0xded2ad)
  scene.fog = new THREE.Fog(0xded2ad, 32, 85)
  const sun = new THREE.DirectionalLight(0xffefd2, 3)
  sun.position.copy(sunDirection).multiplyScalar(40)
  sun.castShadow = true
  sun.shadow.mapSize.setScalar(compact ? 512 : 1024)
  sun.shadow.camera.left = sun.shadow.camera.bottom = -18
  sun.shadow.camera.right = sun.shadow.camera.top = 18
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 90
  sun.shadow.camera.updateProjectionMatrix()
  sun.shadow.bias = -0.0001
  sun.shadow.normalBias = 0.008
  sun.shadow.radius = 1.5
  scene.add(sun, sun.target, new THREE.HemisphereLight(0xffefcf, 0xc3a36c, 0.65))

  const environmentScene = new THREE.Scene()
  const environmentSky = battlefieldSky()
  environmentSky.material.uniforms.showSunDisc.value = false
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x7e8260 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.3
  environmentScene.add(environmentSky, ground)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const target = pmrem.fromScene(environmentScene, 0.04, 0.1, 100, { size: 128 })
  scene.environment = target.texture
  scene.environmentIntensity = 0.25
  environments.set(scene, target)
  pmrem.dispose()
  environmentSky.geometry.dispose()
  environmentSky.material.dispose()
  ground.geometry.dispose()
  ground.material.dispose()
  environmentScene.clear()
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMappingExposure = 1
}

export function disposeBattlefieldLighting(scene: THREE.Scene) {
  environments.get(scene)?.dispose()
  environments.delete(scene)
  scene.environment = null
}
