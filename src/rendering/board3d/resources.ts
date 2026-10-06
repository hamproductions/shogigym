import type * as THREE from 'three'

type Resource = THREE.Texture | THREE.BufferGeometry
const ownership = new WeakMap<Resource, { users: number; cached: boolean }>()

function entry(resource: Resource) {
  let state = ownership.get(resource)
  if (!state) ownership.set(resource, (state = { users: 0, cached: false }))
  return state
}

export function cacheResource<T extends Resource>(resource: T) {
  entry(resource).cached = true
  return resource
}

export function evictResource(resource: Resource) {
  const state = entry(resource)
  state.cached = false
  if (!state.users) resource.dispose()
}

export function retainResource(resource: Resource) {
  entry(resource).users++
}

export function disposeUnusedResource(resource: Resource) {
  if (!entry(resource).users) resource.dispose()
}

export function releaseResource(resource: Resource, keepCached = true) {
  const state = entry(resource)
  if (state.users) state.users--
  if (!state.users && (!state.cached || !keepCached)) resource.dispose()
}
