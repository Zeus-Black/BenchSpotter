'use client'
import { useDragControls, motion, AnimatePresence } from 'framer-motion'
import type { Bench } from '@/types'
import { BenchCard } from './BenchCard'

export function BottomSheet({ bench, onClose }: { bench: Bench | null; onClose: () => void }) {
  const drag = useDragControls()

  return (
    <AnimatePresence>
      {bench && (
        <motion.div
          key={bench.id}
          className="fixed z-40 bottom-0 left-0 right-0 sm:left-auto sm:right-4 sm:bottom-4 sm:top-4 sm:w-[380px] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.85 }}
          drag="y"
          dragControls={drag}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.02, bottom: 0.55 }}
          onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
        >
          {/* Handle */}
          <div
            className="flex justify-center items-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing shrink-0"
            onPointerDown={e => drag.start(e)}
          >
            <div className="w-8 h-1 rounded-full" style={{ background: 'var(--border)' }} />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-opacity hover:opacity-60"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            ✕
          </button>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
            <BenchCard bench={bench} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
