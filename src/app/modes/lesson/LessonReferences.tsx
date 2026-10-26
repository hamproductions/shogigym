import { styled } from 'styled-system/jsx'
import type { JsxStyleProps } from 'styled-system/types'
import type { LessonReference } from '@/utils/catalog'
import { Marks } from '@/app/ui/SideMark'

export function LessonReferences({ references, ja, ...styles }: JsxStyleProps & { references: LessonReference[]; ja: boolean }) {
  return (
    <styled.p {...styles}>
      {ja ? 'このアプリのために書き下ろした教材です。' : 'Written for this app.'}
      {references.map((ref) => (
        <span key={ref.url}>
          <br />
          {ref.adapted ? (ja ? '翻案元：' : 'Adapted from: ') : ja ? '参考：' : 'See also: '}
          <a href={ref.url} target="_blank" rel="noreferrer">
            <Marks>{ref.title}</Marks>
          </a>{' '}
          ({ref.license})
        </span>
      ))}
    </styled.p>
  )
}
