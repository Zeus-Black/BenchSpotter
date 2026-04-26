'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NewBenchPayload } from '@/types'

interface SliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  color: string
}

function Slider({ label, value, onChange, color }: SliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-24 shrink-0" style={{ color: 'var(--text-2)' }}>{label}</span>
      <input
        type="range" min={0} max={5} step={0.5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1"
        style={{ accentColor: color }}
      />
      <span className="text-xs font-semibold tabular-nums w-6 text-right" style={{ color }}>{value}</span>
    </div>
  )
}

export function BenchForm({ lat, lng, onSubmit, onCancel }: {
  lat: number; lng: number
  onSubmit: (p: NewBenchPayload) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [note, setNote]         = useState(3)
  const [privacy, setPrivacy]   = useState(3)
  const [romantic, setRomantic] = useState(3)
  const [comfort, setComfort]   = useState(3)
  const [image, setImage]       = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [submitting, setSub]    = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => { setImage(f); setPreview(URL.createObjectURL(f)) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSub(true)
    try {
      await onSubmit({ latitude: lat, longitude: lng, title: title || undefined, description: desc || undefined, note, privacy, romantic, comfort, image: image || undefined })
    } finally { setSub(false) }
  }

  const inputStyle = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(28,24,20,0.3)', backdropFilter: 'blur(6px)' }} onClick={onCancel} />

      <motion.div
        className="relative w-full max-w-md rounded-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: '24px' }}
        initial={{ y: 32, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Nouveau spot</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
          </div>
          <button onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-opacity hover:opacity-60"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text" placeholder="Titre du spot (ex: Le banc du belvédère)"
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={inputStyle}
          />
          <textarea
            placeholder="Description du lieu..."
            value={desc} onChange={e => setDesc(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-colors"
            style={inputStyle}
          />

          {/* Vibe */}
          <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Vibe Metrics</span>
            <Slider label="Confort"    value={comfort}  onChange={setComfort}  color="#a67c45" />
            <Slider label="Privacy"    value={privacy}  onChange={setPrivacy}  color="#6b8fba" />
            <Slider label="Romantique" value={romantic} onChange={setRomantic} color="#b87070" />
          </div>

          {/* Note */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
            <span className="text-xs font-semibold uppercase tracking-widest shrink-0" style={{ color: 'var(--text-3)' }}>Note</span>
            <input type="range" min={0} max={5} step={0.5} value={note} onChange={e => setNote(Number(e.target.value))} className="flex-1" style={{ accentColor: '#a67c45' }} />
            <span className="text-xs font-semibold tabular-nums w-6 text-right text-accent">{note}</span>
          </div>

          {/* Photo upload */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className="rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden"
            style={{ borderColor: dragging ? 'var(--accent)' : 'var(--border)' }}
          >
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            {preview ? (
              <div className="relative h-36">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <span className="text-xs text-white font-medium">Changer la photo</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-8" style={{ color: 'var(--text-3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <span className="text-xs">Glisser une photo ou cliquer</span>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              Annuler
            </button>
            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
