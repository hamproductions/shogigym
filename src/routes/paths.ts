export const MODE_SLUGS = ['play', 'view', 'analyze', 'openings', 'review', 'tsume', 'tesuji']

export const NOT_FOUND_PATH = '/404'

export function routeParams(pathname: string) {
  const [first, second] = pathname.split('/').filter(Boolean)
  return first === 'openings' && second ? { mode: undefined, main: second } : { mode: first, main: undefined }
}
