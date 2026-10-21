import { Link } from 'react-router'
import { styled } from 'styled-system/jsx'
import { notFoundMeta } from './meta'
import { StatusPage } from './StatusPage'
import { StatusText, statusAction, useDocumentEnglish } from './status'

export const meta = notFoundMeta

const ActionLink = styled(Link, { base: statusAction })

const SECTIONS = [
  { to: '/play', ja: '対局', en: 'Play AI' },
  { to: '/openings', ja: '学習', en: 'Learn' },
  { to: '/tsume', ja: '詰将棋', en: 'Tsume' },
]

export function NotFound() {
  const en = useDocumentEnglish()
  return (
    <StatusPage title={en ? 'Page not found' : 'ページが見つかりません'}>
      <StatusText>
        {en
          ? 'There is no page at this address. Check the URL, or go to one of these pages.'
          : 'このアドレスにはページがありません。URLを確認するか、次のページへ移動してください。'}
      </StatusText>
      <styled.nav display="flex" flexWrap="wrap" gap="2" aria-label={en ? 'Pages' : 'ページ'}>
        <ActionLink to="/" bg="accent" color="accent.contrast">
          {en ? 'Home' : 'ホーム'}
        </ActionLink>
        {SECTIONS.map((s) => (
          <ActionLink key={s.to} to={s.to} bg="surface.2" color="fg.default">
            {en ? s.en : s.ja}
          </ActionLink>
        ))}
      </styled.nav>
    </StatusPage>
  )
}

export default NotFound
