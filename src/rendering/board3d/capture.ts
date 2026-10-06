import * as THREE from 'three'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export function createCapture(width: number, height = width) {
  const source = new THREE.WebGLRenderTarget(width, height, { samples: 4, type: THREE.HalfFloatType })
  const output = new THREE.WebGLRenderTarget(width, height)
  const pass = new OutputPass()
  const pixels = new Uint8Array(width * height * 4)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(width, height)
  return {
    render: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
      const previous = renderer.getRenderTarget()
      const color = renderer.getClearColor(new THREE.Color())
      const alpha = renderer.getClearAlpha()
      const exposure = renderer.toneMappingExposure
      try {
        renderer.setRenderTarget(source)
        renderer.setClearColor(0x000000, 0)
        renderer.toneMappingExposure = 0.82
        renderer.render(scene, camera)
        pass.render(renderer, output, source, 0, false)
        renderer.readRenderTargetPixels(output, 0, 0, width, height, pixels)
      } finally {
        renderer.setRenderTarget(previous)
        renderer.setClearColor(color, alpha)
        renderer.toneMappingExposure = exposure
      }
      const row = width * 4
      for (let y = 0; y < height; y++) image.data.set(pixels.subarray(y * row, (y + 1) * row), (height - y - 1) * row)
      ctx.putImageData(image, 0, 0)
      return canvas
    },
    dispose: () => {
      source.dispose()
      output.dispose()
      pass.dispose()
    },
  }
}
