import * as THREE from 'three'

type Particle = { at: THREE.Vector3; velocity: THREE.Vector3; born: number; life: number; size: number; gravity: number }

export function createBattlefieldEffects() {
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 96)
  mesh.frustumCulled = false
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  const particles: (Particle | undefined)[] = Array.from({ length: 96 })
  const transform = new THREE.Object3D()
  const color = new THREE.Color()
  let cursor = 0
  transform.scale.setScalar(0)
  transform.updateMatrix()
  for (let i = 0; i < particles.length; i++) {
    mesh.setMatrixAt(i, transform.matrix)
    mesh.setColorAt(i, color)
  }
  return {
    mesh,
    burst(kind: 'step' | 'hit' | 'promotion' | 'spirit', at: THREE.Vector3, time: number) {
      const count = kind === 'spirit' ? 4 : kind === 'step' ? 5 : kind === 'hit' ? 24 : 36
      for (let i = 0; i < count; i++) {
        const slot = cursor++ % particles.length
        const fraction = ((slot * 73 + i * 31) % 97) / 97
        const angle = i * 2.399963 + slot
        const speed = (0.3 + fraction) * (kind === 'spirit' ? 0.15 : kind === 'step' ? 0.4 : 1.3)
        particles[slot] = {
          at: at.clone().add(new THREE.Vector3(0, kind === 'hit' ? 0.5 : 0.035, 0)),
          velocity: new THREE.Vector3(Math.cos(angle) * speed, kind === 'step' ? 0.2 + fraction * 0.3 : 0.6 + fraction * 1.5, Math.sin(angle) * speed),
          born: time,
          life: kind === 'step' ? 400 : 650,
          size: kind === 'step' ? 0.025 : 0.014 + fraction * 0.018,
          gravity: kind === 'spirit' ? -0.2 : kind === 'step' ? 1.5 : 4,
        }
        color.setHex(
          kind === 'spirit'
            ? i % 2
              ? 0x97e9ff
              : 0xe2fbff
            : kind === 'step'
              ? 0xb5a480
              : kind === 'promotion'
                ? i % 2
                  ? 0xdba83d
                  : 0xffe5a0
                : i % 3
                  ? 0xffcf78
                  : 0xfff3d1,
        )
        mesh.setColorAt(slot, color)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    },
    update(time: number) {
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        if (!particle) continue
        const elapsed = Math.max(0, time - particle.born)
        const seconds = elapsed / 1000
        transform.position.copy(particle.at).addScaledVector(particle.velocity, seconds)
        transform.position.y -= (particle.gravity * seconds * seconds) / 2
        transform.scale.setScalar(elapsed >= particle.life ? 0 : particle.size * (1 - elapsed / particle.life))
        transform.updateMatrix()
        mesh.setMatrixAt(i, transform.matrix)
        if (elapsed >= particle.life) particles[i] = undefined
      }
      mesh.instanceMatrix.needsUpdate = true
    },
  }
}

export type BattlefieldEffects = ReturnType<typeof createBattlefieldEffects>
