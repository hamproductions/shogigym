import { Trainer } from '../components/Trainer'
import { courseById, SETUPS } from '../model'
import { go } from '../hooks'

export function CoursePage({ id }: { id: string }) {
  const course = courseById(id)
  if (!course) {
    return (
      <div className="page">
        <p>That line does not exist. <button className="link" onClick={() => go()}>Back to all openings</button></p>
      </div>
    )
  }
  const setup = SETUPS.find((s) => s.id === course.setupId)!
  return (
    <div className="page">
      <div className="crumbs">
        <button className="link" onClick={() => go()}>All openings</button> / {setup.ja}
      </div>
      <Trainer key={course.id} course={course} title={course.title} defaultOpponent="off" />
      <details className="course-info">
        <summary>About this line</summary>
        <p><strong>Goal:</strong> {course.goalFormation}</p>
        {course.source && <p className="muted small">{course.source}</p>}
      </details>
    </div>
  )
}
