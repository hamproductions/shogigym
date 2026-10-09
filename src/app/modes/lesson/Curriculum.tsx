import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CATEGORY_EN, TOPICS, exampleCourse, topicText, type Topic } from '@/utils/curriculum'
import { coursesOf } from '@/utils/book'
import { courseTitle, type Course } from '@/utils/model'
import { PROBLEMS } from '@/app/practice'
import { scrollPanelTop } from '@/app/hooks/useLayout'
import { Button } from '@/app/ui/Button'
import type { LessonMode } from '@/app/types'

const KEY = 'joseki-practice:curriculum:v1'
const TOPIC_KEY = 'joseki-practice:reading:v1'

function savedReviews(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && TOPICS.some((topic) => topic.id === id)))] : []
  } catch {
    return []
  }
}

function savedTopic() {
  try {
    return sessionStorage.getItem(TOPIC_KEY)
  } catch {
    return null
  }
}

type Props = { onOpen: (course: Course, mode: LessonMode) => void; onBack: () => void }

export function Curriculum({ onOpen, onBack }: Props) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const ja = lang === 'ja'
  const [selected, setSelected] = useState<string | null>(savedTopic)
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [reviews, setReviews] = useState(savedReviews)
  const [revealed, setRevealed] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const selectTopic = (id: string | null) => {
    setSelected(id)
    setRevealed(false)
    try {
      if (id) sessionStorage.setItem(TOPIC_KEY, id)
      else sessionStorage.removeItem(TOPIC_KEY)
    } catch {
      setSaveError(true)
    }
  }
  const topic = TOPICS.find((item) => item.id === selected)
  const content = topic?.content
  const categoryName = (name: string) => (ja ? name : (CATEGORY_EN[name] ?? name))
  const title = (item: Topic) => (item.content ? topicText(item.content.title, lang) : item.title)
  const categories = [...new Set(TOPICS.map((item) => item.path[0]))]
  const q = query.trim().toLowerCase()
  const matches = TOPICS.filter(
    (item) =>
      (!category || item.path[0] === category) &&
      (!q ||
        `${item.title} ${item.content?.title.en ?? ''} ${item.path.map(categoryName).join(' ')} ${item.content?.paragraphs.map((p) => `${p.ja} ${p.en}`).join(' ') ?? ''}`
          .toLowerCase()
          .includes(q)),
  )

  useEffect(() => {
    scrollPanelTop()
  }, [selected])

  const markReviewed = () => {
    if (!topic) return
    const next = reviews.includes(topic.id) ? reviews.filter((id) => id !== topic.id) : [...reviews, topic.id]
    setReviews(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      setSaveError(false)
    } catch {
      setSaveError(true)
    }
  }

  if (topic && content) {
    const index = TOPICS.indexOf(topic)
    const practice = coursesOf(content.practice?.courseIds ?? [])
    const mate = content.practice?.tsume
    const problem = mate && PROBLEMS.find((item) => item.mate === mate)
    return (
      <article className="app-picker app-curriculum" aria-label={title(topic)}>
        <button className="app-back" onClick={() => selectTopic(null)}>
          {ja ? 'すべての学習項目' : 'All topics'}
        </button>
        <p className="app-muted">{topic.path.map(categoryName).join(' / ')}</p>
        <h2 className="app-picker-title">{title(topic)}</h2>
        {content.paragraphs.map((paragraph, i) => (
          <p className="app-topic-paragraph" key={i}>
            {topicText(paragraph, lang)}
          </p>
        ))}
        <section className="app-topic-check" aria-labelledby="topic-check">
          <h3 id="topic-check" className="app-sub">
            {ja ? '理解を確認' : 'Check your understanding'}
          </h3>
          <p>{topicText(content.question, lang)}</p>
          <Button aria-expanded={revealed} onClick={() => setRevealed((value) => !value)}>
            {ja ? (revealed ? '解説を隠す' : '解説を見る') : revealed ? 'Hide explanation' : 'Show explanation'}
          </Button>
          {revealed && <p role="status">{topicText(content.answer, lang)}</p>}
        </section>
        {!!content.examples?.length && <h3 className="app-sub">{ja ? '盤で練習' : 'Practice on the board'}</h3>}
        {content.examples?.map((example, i) => (
          <div className="app-topic-practice" key={i}>
            <strong>{topicText(example.title, lang)}</strong>
            <div className="app-actions">
              <Button onClick={() => onOpen(exampleCourse(topic, example, i, lang), 'study')}>{ja ? '手順を学ぶ' : 'Study moves'}</Button>
              <Button onClick={() => onOpen(exampleCourse(topic, example, i, lang), 'quiz')}>{ja ? 'クイズ' : 'Quiz'}</Button>
            </div>
          </div>
        ))}
        {!!practice.length && <h3 className="app-sub">{ja ? '関連レッスン' : 'Related lessons'}</h3>}
        {practice.map((course) => (
          <Button key={course.id} onClick={() => onOpen(course, 'study')}>
            {courseTitle(course, lang)}
          </Button>
        ))}
        {problem && (
          <Button
            onClick={() =>
              onOpen(
                exampleCourse(
                  topic,
                  { title: { ja: `関連する${mate}手詰の練習`, en: `Related mate-in-${mate} practice` }, startSfen: problem.sfen, moves: problem.pv },
                  100,
                  lang,
                  {
                    ja: '最後の王手に対して、玉の逃げ道、王手駒の取り方、合駒を確認しましょう。',
                    en: 'Verify the final check against every king escape, capture of the checking piece and interposition.',
                  },
                ),
                'quiz',
              )
            }
          >
            {ja ? `関連する${mate}手詰を練習する` : `Practice related mate in ${mate}`}
          </Button>
        )}
        {topic.id === '7921' && (
          <a className="app-source" href={`${import.meta.env.BASE_URL}curriculum/shogi-board.svg`} download="shogi-board.svg">
            {ja ? '印刷用盤をダウンロード' : 'Download printable board'}
          </a>
        )}
        <a className="app-source" href={topic.source} target="_blank" rel="noopener noreferrer">
          {ja ? '参考記事：ゼロから始める将棋研究所' : 'Source article: Shogi Joutatsu'}
        </a>
        <label className="app-check-row">
          <input type="checkbox" checked={reviews.includes(topic.id)} onChange={markReviewed} />
          <span>{ja ? '復習済み（習得の判定ではありません）' : 'Reviewed (not a mastery score)'}</span>
        </label>
        {saveError && <p role="status">{ja ? 'このブラウザでは進捗を保存できません。' : 'Progress could not be saved in this browser.'}</p>}
        <nav className="app-actions" aria-label={ja ? '学習項目の移動' : 'Topic navigation'}>
          <Button disabled={index === 0} onClick={() => selectTopic(TOPICS[index - 1].id)}>
            {ja ? '前の項目' : 'Previous topic'}
          </Button>
          <Button disabled={index === TOPICS.length - 1} onClick={() => selectTopic(TOPICS[index + 1].id)}>
            {ja ? '次の項目' : 'Next topic'}
          </Button>
        </nav>
      </article>
    )
  }

  return (
    <div className="app-picker app-curriculum">
      <h2 className="app-picker-title">{ja ? '将棋を学ぶ' : 'Learn shogi'}</h2>
      <p className="app-picker-intro">
        {ja
          ? 'ルールから定跡、終盤、勉強法まで。すべての分野をここから学べます。'
          : 'Rules, openings, endgames, study methods and shogi culture. Explore every subject here.'}
      </p>
      <Button onClick={onBack}>{ja ? '従来の定跡練習' : 'Opening practice'}</Button>
      <p className="app-muted">{ja ? `${reviews.length} / ${TOPICS.length} 項目を復習済み` : `${reviews.length} of ${TOPICS.length} topics reviewed`}</p>
      <input
        className="app-search"
        aria-label={ja ? '学習項目を検索' : 'Search all topics'}
        placeholder={ja ? 'ルール、手筋、戦法などを検索' : 'Search rules, tactics, openings…'}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <label className="app-topic-filter">
        <span>{ja ? '分野' : 'Subject'}</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">{ja ? 'すべての分野' : 'All subjects'}</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {categoryName(name)}
            </option>
          ))}
        </select>
      </label>
      {!matches.length && (
        <p role="status">{ja ? '該当する項目がありません。検索語または分野を変更してください。' : 'No topics match. Change the search or subject.'}</p>
      )}
      {matches.map((item, i) => {
        const group = item.path.join(' / ')
        return (
          <Fragment key={item.id}>
            {(i === 0 || matches[i - 1].path.join(' / ') !== group) && <h3 className="app-sub">{item.path.map(categoryName).join(' / ')}</h3>}
            <button className="app-setup" onClick={() => selectTopic(item.id)}>
              <span className="app-lib-ja">{title(item)}</span>
              <span className="app-lib-en">
                {reviews.includes(item.id) ? (ja ? '復習済み' : 'Reviewed') : ja ? '読む・理解を確認' : 'Read and check understanding'}
              </span>
              <span className="app-setup-go" aria-hidden="true">
                ›
              </span>
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
