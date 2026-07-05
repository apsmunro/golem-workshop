import { useRef, useState } from 'react'
import { exportState, importState } from '../../store/io'

/**
 * Footer controls for carrying progress between browsers: export downloads
 * the whole store as JSON, import restores it. Everything lives in
 * localStorage, so this is the learner's only backup path.
 */
export function ProgressPorter() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState<string | null>(null)

  const download = () => {
    const blob = new Blob([exportState()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'golem-workshop-progress.json'
    a.click()
    URL.revokeObjectURL(url)
    setNote('Progress exported.')
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const result = importState(await file.text())
    setNote(result.ok ? 'Progress restored.' : result.error)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex flex-wrap items-baseline gap-4">
      <button
        type="button"
        onClick={download}
        className="cursor-pointer text-sm !text-secondary underline decoration-[color:color-mix(in_srgb,var(--link)_45%,transparent)] underline-offset-[3px] transition-colors duration-[180ms] hover:!text-accent-bright"
      >
        Export progress
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer text-sm !text-secondary underline decoration-[color:color-mix(in_srgb,var(--link)_45%,transparent)] underline-offset-[3px] transition-colors duration-[180ms] hover:!text-accent-bright"
      >
        Import progress
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Import progress file"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {note ? (
        <span role="status" className="text-sm text-secondary">
          {note}
        </span>
      ) : null}
    </div>
  )
}
