import { useEffect, useState } from 'react'

/**
 * True below the phone breakpoint. Interactives use it to swap to a
 * designed narrow layout — taller drawing, bigger touch targets — instead
 * of scaling the desktop composition down (design gate §2.5.4).
 */
export function useNarrow(query = '(max-width: 640px)'): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return narrow
}
