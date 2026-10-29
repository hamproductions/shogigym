import { useEffect, useSyncExternalStore } from 'react'
import { buildCatalog, type LessonEntry, type Setup } from './catalog'
import { positionOf, colorSide, type Side } from './shogi'
import type { Text } from '@/data/strategies'
import type { LessonFigure } from './curriculum'
import { localizeEnglish } from './notation'
import { positionHash } from './positionHash'
import { DERIVED, derive } from './derivedCourses'

export type { Setup } from './catalog'

export type MoveKind = 'main' | 'alt' | 'deviation'

export type MoveDemo = { title: string; usi: string[]; text: string }

export type JosekiMove = {
  usi: string
  kind: MoveKind
  note?: string
  noteEn?: string
  aim?: string
  openEnded?: boolean
  demos?: MoveDemo[]
  punishNote?: string
  child: JosekiNode | null
}

export type JosekiNode = {
  id: string
  sfen: string
  comment?: string
  commentEn?: string
  figures?: LessonFigure[]
  branches: JosekiMove[]
}

export type RawCourse = {
  id: string
  title: string
  titleEn?: string
  myStrategy: string
  opponentStrategy: string
  mySide: Side
  userSide?: Side
  source?: string
  goalFormation?: string
  goalLabel?: string
  root: JosekiNode
  mainLine?: string[]
  file?: string
  derivedFrom?: string
}

export type Course = RawCourse & {
  userSide: Side
  notesFromOpponentView: boolean
  noEngine?: boolean
  quizTargets?: boolean
  quizPrompt?: Text
  series?: { topicId: string; ids: string[]; random?: boolean }
  setupId: string
  baseId: string
  main: string | null
  vs: string | null
  mirrored: boolean
}

const files = {
  ...import.meta.glob<string>('../../vendor/shiryu-joseki/src/data/joseki/*.json', { query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../data/joseki/*.json', { query: '?raw', import: 'default' }),
  ...import.meta.glob<string>('../data/lessons/*.json', { query: '?raw', import: 'default' }),
}

let JOSEKI: RawCourse[] = []

export const COURSES: Course[] = []

export const SETUPS: Setup[] = []

export const courseById = (id: string) => COURSES.find((c) => c.id === id)

const fileOfBase = new Map<string, string>()
const pendingFiles = new Set<string>()
const fileLoads = new Map<string, Promise<void>>()
const courseListeners = new Set<() => void>()
let courseVersion = 0

export const loadedCourses = () => courseVersion

const indexFetch = typeof window === 'undefined' ? null : import('virtual:course-index')
indexFetch?.catch(() => undefined)
let catalogLoad: Promise<void> | null = null

export function loadCatalog() {
  if (!catalogLoad) {
    catalogLoad = (indexFetch ?? import('virtual:course-index')).then(({ default: index }) => {
      JOSEKI = index.joseki.map((raw) => localizeEnglish(raw))
      const lessons = index.lessons.map((lesson) => localizeEnglish(lesson)).sort((a, b) => a.order - b.order)
      const catalog = buildCatalog(JOSEKI, lessons)
      COURSES.push(...catalog.courses)
      SETUPS.push(...localizeEnglish(catalog.setups))
      for (const raw of JOSEKI) fileOfBase.set(raw.id, raw.file!)
      for (const lesson of lessons) for (const course of lesson.courses) fileOfBase.set(course.id, course.file!)
      fileOfBase.forEach((file) => pendingFiles.add(file))
      changed()
    })
    catalogLoad.catch(() => (catalogLoad = null))
  }
  return catalogLoad
}

export const catalogLoaded = () => SETUPS.length > 0

const changed = () => {
  courseVersion++
  courseListeners.forEach((listener) => listener())
}

let trainable: Record<string, Record<Side, string[]>> | null = null
let trainableLoad: Promise<void> | null = null

export function trainableHashes(course: Course) {
  if (!trainable)
    trainableLoad ??= import('virtual:course-trainable').then(
      (module) => {
        trainable = module.default
        changed()
      },
      (error) => {
        trainableLoad = null
        console.warn('progress index not loaded', error)
      },
    )
  return trainable?.[course.baseId]?.[course.userSide]
}

const fileOf = (course: Pick<Course, 'id'> & Partial<Pick<Course, 'baseId'>>) => fileOfBase.get(course.baseId ?? course.id) ?? fileOfBase.get(course.id)

export const courseLoaded = (course: Pick<Course, 'id'> & Partial<Pick<Course, 'baseId'>>) => !pendingFiles.has(fileOf(course) ?? '')

function fill(raw: RawCourse, lesson = false) {
  COURSES.forEach((course, at) => {
    if (course.baseId !== raw.id) return
    COURSES[at] = lesson
      ? { ...course, ...raw, mainLine: course.mainLine, file: course.file }
      : { ...course, root: raw.root, source: raw.source, goalFormation: raw.goalFormation, goalLabel: raw.goalLabel }
  })
}

function loadFile(file: string): Promise<void> {
  if (!pendingFiles.has(file)) return Promise.resolve()
  let loading = fileLoads.get(file)
  if (!loading) {
    loading = files[file]().then((text) => {
      if (file.startsWith('../data/lessons/')) {
        const lesson = localizeEnglish(JSON.parse(text) as LessonEntry)
        lesson.courses.forEach((raw) => fill(raw, true))
        const setup = SETUPS.find((entry) => entry.id === `lesson-${lesson.id}`)
        if (setup) setup.check = lesson.check
      } else {
        const raw = localizeEnglish(JSON.parse(text) as RawCourse)
        fill(raw)
        for (const spec of DERIVED) if (spec.from === raw.id) fill(derive(raw, spec))
      }
      pendingFiles.delete(file)
      changed()
    })
    loading.catch(() => fileLoads.delete(file))
    fileLoads.set(file, loading)
  }
  return loading
}

export async function loadCourse(course: Course): Promise<Course> {
  const file = fileOf(course)
  if (!file || !pendingFiles.has(file)) return course
  await loadFile(file)
  return courseById(course.id) ?? course
}

export const loadAllJoseki = () =>
  loadCatalog()
    .then(() => Promise.all(JOSEKI.map((raw) => loadFile(raw.file!))))
    .then(() => undefined)

let bookPositions: Promise<{ files: string[]; at: Record<string, number[]> }> | null = null

export async function loadBookFor(sfens: readonly string[]) {
  if (!bookPositions) {
    bookPositions = import('virtual:book-positions').then((module) => module.default)
    bookPositions.catch(() => (bookPositions = null))
  }
  const [{ files, at }] = await Promise.all([bookPositions, loadCatalog()])
  const needed = new Set(sfens.flatMap((sfen) => at[positionHash(sfen)] ?? []))
  await Promise.all([...needed].map((index) => loadFile(files[index])))
}

export const prefetchCourses = (courses: Course[]) =>
  courses.forEach((course) => void loadCourse(course).catch((error) => console.warn('course not loaded', error)))

const subscribeCourses = (listener: () => void) => {
  courseListeners.add(listener)
  return () => {
    courseListeners.delete(listener)
  }
}

export const useCourseVersion = () =>
  useSyncExternalStore(
    subscribeCourses,
    () => courseVersion,
    () => 0,
  )

export function useLoadedCourses(courses: Course[]): Course[] | null {
  useCourseVersion()
  const pending = [...new Set(courses.flatMap((course) => fileOf(course) ?? []))].filter((file) => pendingFiles.has(file))
  useEffect(() => {
    pending.forEach((file) => void loadFile(file).catch((error) => console.warn('course not loaded', error)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.join(' ')])
  return pending.length ? null : courses.map((course) => courseById(course.id) ?? course)
}

export const sideToMove = (node: JosekiNode): Side => colorSide(positionOf(node.sfen).color)

export function findPath(root: JosekiNode, targetId: string): JosekiMove[] | null {
  for (const branch of root.branches) {
    if (!branch.child) continue
    if (branch.child.id === targetId) return [branch]
    const rest = findPath(branch.child, targetId)
    if (rest) return [branch, ...rest]
  }
  return null
}

export function walkNodes(root: JosekiNode, visit: (node: JosekiNode, path: JosekiMove[]) => void, path: JosekiMove[] = []) {
  visit(root, path)
  for (const branch of root.branches) if (branch.child) walkNodes(branch.child, visit, [...path, branch])
}

export type Verdict = 'good' | 'mistake' | 'opponent-mistake' | 'book'

export function verdictFor(course: Course, mover: Side, kind: MoveKind): Verdict {
  if (kind !== 'deviation') return mover === course.userSide ? 'good' : 'book'
  return mover === course.userSide ? 'mistake' : 'opponent-mistake'
}

export const courseTitle = (course: Pick<Course, 'title' | 'titleEn'>, lang: string) => (lang === 'ja' ? course.title : (course.titleEn ?? course.title))
