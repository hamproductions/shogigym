declare module 'virtual:course-index' {
  import type { LessonEntry } from '@/utils/catalog'
  import type { RawCourse } from '@/utils/model'
  const index: { joseki: RawCourse[]; lessons: LessonEntry[] }
  export default index
}

declare module 'virtual:course-trainable' {
  const trainable: Record<string, Record<'sente' | 'gote', string[]>>
  export default trainable
}

declare module 'virtual:book-positions' {
  const book: { files: string[]; at: Record<string, number[]> }
  export default book
}

declare module 'virtual:english-move-facts' {
  const moveFacts: (typeof import('@/locales/en.json'))['moveFacts']
  export default moveFacts
}
