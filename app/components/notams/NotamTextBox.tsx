import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MdAutoAwesome,
  MdCode,
  MdErrorOutline,
  MdHourglassEmpty,
  MdRefresh,
  MdTextSnippet
} from 'react-icons/md'

import type { Notam } from './types'

type TranslationStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'pending'
  | 'timeout'
  | 'unavailable'
  | 'invalid'
  | 'error'

interface TranslationValue {
  html: string
  summary: string
  generatedAt: string
  modelId: string
  promptSchemaVersion: string
}

interface TranslationResponse {
  status: TranslationStatus
  cached?: boolean
  translation?: TranslationValue
  error?: string
  retryAfterMs?: number
}

interface NotamTextBoxProps {
  notam: Notam
}

const MAX_CONCURRENT_TRANSLATIONS = 2
const RETRY_COOLDOWN_MS = 5_000
const MAX_CLIENT_POLL_MS = 180_000

let activeTranslations = 0
const translationQueue: Array<() => void> = []

const enqueueTranslation = async <T,>(task: () => Promise<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const run = () => {
      activeTranslations += 1
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeTranslations -= 1
          translationQueue.shift()?.()
        })
    }

    if (activeTranslations < MAX_CONCURRENT_TRANSLATIONS) {
      run()
      return
    }

    translationQueue.push(run)
  })

const abortError = (): DOMException => new DOMException('Aborted', 'AbortError')

const wait = async (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError())
      return
    }

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)
    const handleAbort = () => {
      window.clearTimeout(timeoutId)
      reject(abortError())
    }
    signal.addEventListener('abort', handleAbort, { once: true })
  })

const fetchTranslation = async (
  notam: Notam,
  signal: AbortSignal,
  onPending?: () => void
): Promise<TranslationResponse> => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < MAX_CLIENT_POLL_MS) {
    if (signal.aborted) throw abortError()

    const response = await fetch('/api/translate-notam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: notam.id,
        number: notam.number,
        type: notam.type,
        effectiveStart: notam.effectiveStart,
        effectiveEnd: notam.effectiveEnd,
        text: notam.text,
        icaoLocation: notam.icaoLocation,
        translationToken: notam.translationToken
      }),
      signal
    })

    const result = (await response.json()) as TranslationResponse
    if (result.error === 'rate_limited') {
      await wait(result.retryAfterMs ?? 6_000, signal)
      continue
    }
    if (result.status !== 'pending') return result
    onPending?.()
    await wait(result.retryAfterMs ?? 6_000, signal)
  }

  return { status: 'timeout', error: 'client_poll_timeout' }
}

const retryLabelFor = (status: TranslationStatus): string => {
  if (status === 'loading' || status === 'pending') return 'AI explanation loading.'
  if (status === 'timeout') return 'AI explanation timed out. Retry.'
  if (status === 'unavailable') return 'AI explanation unavailable.'
  if (status === 'invalid') return 'AI explanation failed validation. Retry.'
  if (status === 'error') return 'AI explanation failed. Retry.'
  return 'Explain NOTAM'
}

export const NotamTextBox = ({ notam }: NotamTextBoxProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)
  const [status, setStatus] = useState<TranslationStatus>(
    notam.cachedTranslation ? 'ready' : 'idle'
  )
  const [translation, setTranslation] = useState<TranslationValue | null>(
    notam.cachedTranslation ?? null
  )
  const [showTranslation, setShowTranslation] = useState(Boolean(notam.cachedTranslation))
  const [requested, setRequested] = useState(Boolean(notam.cachedTranslation))
  const [retryAfter, setRetryAfter] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [isFresh, setIsFresh] = useState(false)

  const requestTranslation = useCallback(
    (force = false) => {
      if (status === 'loading' || status === 'pending') return
      if (requested && !force) return
      if (retryAfter > Date.now()) {
        setNow(Date.now())
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setRequested(true)
      setStatus('loading')
      enqueueTranslation(() =>
        fetchTranslation(notam, controller.signal, () => {
          if (!mountedRef.current || controller.signal.aborted) return
          setStatus('pending')
        })
      )
        .then((result) => {
          if (!mountedRef.current || controller.signal.aborted) return
          if (result.status === 'ready' && result.translation) {
            setTranslation(result.translation)
            setShowTranslation(true)
            setStatus('ready')
            setIsFresh(true)
            window.setTimeout(() => setIsFresh(false), 900)
            return
          }

          setShowTranslation(false)
          setStatus(result.status)
          if (
            result.status === 'timeout' ||
            result.status === 'error' ||
            result.status === 'invalid'
          ) {
            setRetryAfter(
              Date.now() + (result.retryAfterMs ?? RETRY_COOLDOWN_MS)
            )
          }
        })
        .catch((error) => {
          if (
            !mountedRef.current ||
            controller.signal.aborted ||
            (error instanceof Error && error.name === 'AbortError')
          ) {
            return
          }
          setShowTranslation(false)
          setStatus('error')
          setRetryAfter(Date.now() + RETRY_COOLDOWN_MS)
        })
    },
    [notam, requested, retryAfter, status]
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    abortRef.current?.abort()
    setStatus(notam.cachedTranslation ? 'ready' : 'idle')
    setTranslation(notam.cachedTranslation ?? null)
    setShowTranslation(Boolean(notam.cachedTranslation))
    setRequested(Boolean(notam.cachedTranslation))
    setRetryAfter(0)
    setIsFresh(false)
  }, [
    notam.cachedTranslation,
    notam.effectiveEnd,
    notam.effectiveStart,
    notam.icaoLocation,
    notam.id,
    notam.number,
    notam.text,
    notam.type
  ])

  useEffect(() => {
    if (retryAfter <= now) return
    const timeoutId = window.setTimeout(() => {
      setNow(Date.now())
    }, retryAfter - now)
    return () => window.clearTimeout(timeoutId)
  }, [now, retryAfter])

  useEffect(() => {
    const node = containerRef.current
    if (!node || requested) return

    if (!('IntersectionObserver' in window)) {
      requestTranslation()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          requestTranslation()
          observer.disconnect()
        }
      },
      { rootMargin: '160px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [requestTranslation, requested])

  const showErrorState =
    status === 'timeout' ||
    status === 'error' ||
    status === 'invalid' ||
    status === 'unavailable'
  const cooldownActive = retryAfter > now
  const handleButtonClick = () => {
    if (status === 'ready') {
      setShowTranslation((current) => !current)
      return
    }
    requestTranslation(true)
  }

  const buttonLabel =
    status === 'ready'
      ? showTranslation
        ? 'Show raw FAA NOTAM text'
        : 'Show AI explanation'
      : cooldownActive
        ? 'Retry available shortly'
      : retryLabelFor(status)

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg border border-base-300 bg-base-100"
    >
      {showTranslation && translation && (
        <MdAutoAwesome
          aria-hidden="true"
          className="absolute left-2 top-2 z-10 h-4 w-4 text-warning"
        />
      )}
      <button
        type="button"
        className="btn btn-circle btn-ghost btn-xs absolute right-1 top-1 z-10 bg-base-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={handleButtonClick}
        disabled={
          status === 'loading' ||
          status === 'pending' ||
          status === 'unavailable' ||
          cooldownActive
        }
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        {status === 'loading' || status === 'pending'
          ? <MdHourglassEmpty className="h-3.5 w-3.5 animate-pulse motion-reduce:animate-none" />
          : status === 'ready'
            ? showTranslation
              ? <MdCode className="h-3.5 w-3.5" />
              : <MdTextSnippet className="h-3.5 w-3.5" />
            : showErrorState
              ? <MdRefresh className="h-3.5 w-3.5" />
              : <MdTextSnippet className="h-3.5 w-3.5" />}
      </button>

      <div
        className={[
          'max-h-[22rem] overflow-y-auto overscroll-contain p-3 pr-8 sm:max-h-[26rem] lg:max-h-[30rem]',
          showTranslation && translation ? 'pl-8' : ''
        ].join(' ')}
      >
        {showTranslation && translation
          ? (
            <div
              className={[
                'space-y-2 text-sm leading-relaxed text-base-content transition-opacity duration-300 motion-reduce:transition-none',
                isFresh ? 'opacity-80' : 'opacity-100',
                '[&_h4]:mt-2 [&_h4]:font-semibold [&_ol>li]:ml-4 [&_ol>li]:list-decimal [&_p]:mb-2 [&_ul>li]:ml-4 [&_ul>li]:list-disc'
              ].join(' ')}
              dangerouslySetInnerHTML={{ __html: translation.html }}
            />
            )
          : (
            <div
              className="whitespace-pre-wrap break-words text-sm"
              title={notam.text}
            >
              {notam.text}
            </div>
            )}

        {status === 'ready' && !showTranslation && (
          <div
            className={[
              'mt-2 inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-[0.7rem] font-medium text-warning transition-opacity duration-300 motion-reduce:transition-none',
              isFresh ? 'opacity-100' : 'opacity-80'
            ].join(' ')}
          >
            Explanation ready
          </div>
        )}

        {showErrorState && (
          <div className="mt-2 flex items-center gap-1 text-[0.7rem] text-base-content/60">
            <MdErrorOutline className="h-3 w-3" />
            {status === 'unavailable'
              ? 'AI explanation is not configured. Raw FAA text remains shown.'
              : cooldownActive
                ? 'Explanation unavailable. Retry will be available shortly.'
                : 'Explanation unavailable. Raw FAA text remains shown.'}
          </div>
        )}
      </div>
    </div>
  )
}
