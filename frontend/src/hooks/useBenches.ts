'use client'
import { useState, useEffect, useCallback } from 'react'
import { fetchBenches, createBench } from '@/lib/api'
import type { Bench, NewBenchPayload } from '@/types'

export function useBenches() {
  const [benches, setBenches] = useState<Bench[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchBenches()
      setBenches(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const addBench = useCallback(async (payload: NewBenchPayload): Promise<Bench> => {
    const bench = await createBench(payload)
    setBenches(prev => [...prev, bench])
    return bench
  }, [])

  return { benches, loading, error, addBench, reload: load }
}
