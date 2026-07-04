import { useEffect, useState } from 'react'
import { toRoman } from '../../lib/roman'

interface Lecture {
  n: number
  title: string
  videoId: string
  url: string
  slides?: string
}

interface LecturesFile {
  year: number
  lectures: Lecture[]
}

let lecturesCache: LecturesFile | null = null

interface LectureCalloutProps {
  /** lecture number in the 2023 playlist */
  n: number
  /** start time like "12m40s" appended to the YouTube URL */
  at?: string
  note?: string
}

export function LectureCallout({ n, at, note }: LectureCalloutProps) {
  const [lecture, setLecture] = useState<Lecture | null>(
    lecturesCache?.lectures.find((l) => l.n === n) ?? null,
  )

  useEffect(() => {
    if (lecturesCache) return
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/course/lectures.json`)
      .then((r) => r.json())
      .then((data: LecturesFile) => {
        lecturesCache = data
        if (!cancelled) setLecture(data.lectures.find((l) => l.n === n) ?? null)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [n])

  if (!lecture) return null
  const href = at ? `${lecture.url}&t=${at}` : lecture.url

  return (
    <aside className="my-10 rounded-card border border-line bg-surface p-5">
      <p className="eyebrow">Lecture {toRoman(lecture.n)} · Statistical Rethinking 2023</p>
      <p className="mt-2">
        <a href={href} target="_blank" rel="noreferrer">
          {lecture.title}
        </a>
        {at ? <span className="ml-2 font-mono text-xs text-secondary">from {at}</span> : null}
      </p>
      {note ? <p className="mt-1 text-sm text-secondary">{note}</p> : null}
    </aside>
  )
}
