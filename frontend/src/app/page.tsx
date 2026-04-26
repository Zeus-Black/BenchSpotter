'use client'
import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomSheet } from '@/components/BottomSheet'
import { BenchForm } from '@/components/BenchForm'
import { useBenches } from '@/hooks/useBenches'
import type { Bench } from '@/types'

const MapView = dynamic(() => import('@/components/Map'), { ssr: false })

export default function Home() {
  const { benches, loading, addBench } = useBenches()
  const [selected, setSelected] = useState<Bench | null>(null)
  const [placing, setPlacing] = useState(false)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)

  const handleBenchClick = useCallback((bench: Bench) => {
    setSelected(bench)
    setPlacing(false)
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (placing) {
      setPending({ lat, lng })
      setPlacing(false)
    } else {
      setSelected(null)
    }
  }, [placing])

  const handleAdd = async (payload: Parameters<typeof addBench>[0]) => {
    const bench = await addBench(payload)
    setPending(null)
    setSelected(bench)
  }

  const togglePlacing = () => {
    setPlacing(p => !p)
    setSelected(null)
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <MapView
        benches={benches}
        selectedId={selected?.id ?? null}
        onBenchClick={handleBenchClick}
        onMapClick={handleMapClick}
        placingMode={placing}
      />

      {/* Header */}
      <motion.div
        className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2.5">
          {/* Logo mark — pin avec banc intégré */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            {/* Fond arrondi */}
            <rect width="28" height="28" rx="8" fill="var(--accent)"/>
            {/* Banc — assise */}
            <rect x="6" y="13" width="16" height="2.5" rx="1.25" fill="white"/>
            {/* Banc — dossier */}
            <rect x="7.5" y="10" width="13" height="1.8" rx="0.9" fill="white" opacity="0.65"/>
            {/* Banc — pieds gauche */}
            <rect x="7.5" y="15.5" width="2.5" height="4" rx="1" fill="white"/>
            {/* Banc — pieds droit */}
            <rect x="18" y="15.5" width="2.5" height="4" rx="1" fill="white"/>
          </svg>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            BenchSpotter
          </span>
          <AnimatePresence>
            {!loading && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs px-2 py-0.5 rounded-full tabular-nums font-medium"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
              >
                {benches.length}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Add bench button */}
      <div className="absolute bottom-8 left-4 z-20 flex flex-col items-start gap-2">
        <AnimatePresence>
          {placing && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="glass rounded-xl px-4 py-2 text-xs font-medium"
              style={{ color: 'var(--text-2)' }}
            >
              Cliquez sur la carte pour placer un banc
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={togglePlacing}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-light text-xl transition-all"
          style={placing ? {
            background: 'var(--accent-bg)',
            border: '1.5px solid var(--accent-border)',
            color: 'var(--accent)',
            boxShadow: '0 0 0 4px var(--accent-bg)',
          } : {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            boxShadow: 'var(--shadow-md)',
          }}
          title={placing ? 'Annuler' : 'Ajouter un banc'}
        >
          <motion.span
            animate={{ rotate: placing ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'block', lineHeight: 1 }}
          >
            +
          </motion.span>
        </motion.button>
      </div>

      {/* Bottom sheet */}
      <BottomSheet bench={selected} onClose={() => setSelected(null)} />

      {/* Form modal */}
      <AnimatePresence>
        {pending && (
          <BenchForm
            lat={pending.lat}
            lng={pending.lng}
            onSubmit={handleAdd}
            onCancel={() => setPending(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
