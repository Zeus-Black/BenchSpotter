'use client'
import { motion } from 'framer-motion'

interface VibeMeterProps {
  label: string
  value: number
  color: string
}

export function VibeMeter({ label, value, color }: VibeMeterProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
          {label}
        </span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>
          {value.toFixed(1)}<span className="text-xs font-normal" style={{ color: 'var(--text-3)' }}>/5</span>
        </span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
        />
      </div>
    </div>
  )
}
