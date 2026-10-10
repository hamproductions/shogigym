import type { LessonReference } from '@/utils/catalog'

export function LessonReferences({ references, ja, className }: { references: LessonReference[]; ja: boolean; className: string }) {
  return (
    <p className={className}>
      {ja ? 'このアプリのために書き下ろした教材です。' : 'Written for this app.'}
      {references.map((ref) => (
        <span key={ref.url}>
          {' '}
          {ref.adapted ? (ja ? '翻案元：' : 'Adapted from: ') : ja ? '参考：' : 'See also: '}
          <a href={ref.url} target="_blank" rel="noreferrer">
            {ref.title}
          </a>{' '}
          ({ref.license})
        </span>
      ))}
    </p>
  )
}
