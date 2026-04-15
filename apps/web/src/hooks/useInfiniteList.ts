import { useState, useEffect, useRef, useCallback } from 'react'

interface PagedResponse<T> {
  code: number
  data: T[]
  total: number
  page: number
  limit: number
}

interface UseInfiniteListOptions {
  limit?: number
}

/**
 * Hook for infinite-scroll paginated list.
 * Attach `sentinelRef` to a div at the bottom of the list.
 * When that div enters the viewport, the next page is fetched automatically.
 */
export function useInfiniteList<T>(
  apiUrl: string,
  options: UseInfiniteListOptions = {}
) {
  const { limit = 20 } = options
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const fetchPage = useCallback(async (p: number, replace = false) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}?page=${p}&limit=${limit}`)
      const json: PagedResponse<T> = await res.json()
      if (json.code !== 200) return
      setItems((prev) => replace ? json.data : [...prev, ...json.data])
      setTotal(json.total)
      setPage(p)
      setHasMore(p * limit < json.total)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [apiUrl, limit])

  // initial load
  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    fetchPage(1, true)
  }, [fetchPage])

  // observe sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchPage(page + 1)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, page, fetchPage])

  const refresh = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    fetchPage(1, true)
  }, [fetchPage])

  return { items, loading, hasMore, total, sentinelRef, refresh }
}
