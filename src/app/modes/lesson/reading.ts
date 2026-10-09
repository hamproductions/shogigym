export function stored(key: string) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function store(key: string, value: string | null) {
  try {
    if (value) sessionStorage.setItem(key, value)
    else sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export const RANDOM_KEY = 'joseki-practice:random-setup:v1'
export const ORIGIN_KEY = 'joseki-practice:reading-origin:v1'
export const RETURN_EVENT = 'joseki-practice:return-to-game'
export const returnToGame = () => {
  const mode = stored(ORIGIN_KEY)
  store(ORIGIN_KEY, null)
  if (mode) window.dispatchEvent(new CustomEvent(RETURN_EVENT, { detail: mode }))
}
