'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { VibeMeter } from './VibeMeter'
import { PhotoGrid } from './PhotoGrid'
import { fetchComments, postComment } from '@/lib/api'
import type { Bench, Comment } from '@/types'

function Stars({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= Math.round(note) ? 'var(--accent)' : 'none'}
          stroke="var(--accent)" strokeWidth="1.8">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs tabular-nums" style={{ color: 'var(--text-3)' }}>{note.toFixed(1)}</span>
    </div>
  )
}

// SVG icons pour les apps cartographiques
function IconGoogleMaps() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  )
}

function IconGoogleEarth() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3.6 9h16.8M3.6 15h16.8"/>
      <path d="M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18"/>
    </svg>
  )
}

function IconArcGIS() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <polygon points="12,2 22,19 2,19"/>
      <line x1="12" y1="9" x2="12" y2="15"/>
      <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
    </svg>
  )
}

interface ExtLinkProps { href: string; label: string; icon: React.ReactNode }

function ExtLink({ href, label, icon }: ExtLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors group"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-2)',
        color: 'var(--text-2)',
        textDecoration: 'none',
      }}
    >
      <span className="flex items-center gap-2.5 text-xs font-medium">
        <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
        {label}
      </span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.35 }}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15,3 21,3 21,9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </motion.a>
  )
}

export function BenchCard({ bench }: { bench: Bench }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchComments(bench.id).then(setComments).catch(() => {})
  }, [bench.id])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setPosting(true)
    try {
      const c = await postComment(bench.id, author || 'Anonyme', content)
      setComments(p => [...p, c])
      setContent('')
    } finally { setPosting(false) }
  }

  const { latitude: lat, longitude: lng } = bench
  const title = bench.title || `Spot #${bench.id}`

  const mapLinks = [
    {
      href: `https://maps.google.com/?q=${lat},${lng}`,
      label: 'Google Maps',
      icon: <IconGoogleMaps />,
    },
    {
      href: `https://earth.google.com/web/@${lat},${lng},100a,500d,35y,0h,45t,0r`,
      label: 'Google Earth',
      icon: <IconGoogleEarth />,
    },
    {
      href: `https://www.arcgis.com/apps/mapviewer/index.html?center=${lng},${lat}&level=17`,
      label: 'ArcGIS',
      icon: <IconArcGIS />,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold leading-snug" style={{ color: 'var(--text)' }}>
          {title}
        </h2>
        <div className="flex items-center gap-3 mt-1">
          <Stars note={bench.note} />
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-3)' }}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Photo */}
      <PhotoGrid image={bench.image} />

      {/* Description */}
      {bench.description && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {bench.description}
        </p>
      )}

      {/* Ouvrir dans */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-3)' }}>
          Ouvrir dans
        </span>
        <div className="flex flex-col gap-1.5">
          {mapLinks.map(l => (
            <ExtLink key={l.label} href={l.href} label={l.label} icon={l.icon} />
          ))}
        </div>
      </div>

      {/* Vibe Metrics */}
      <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-3)' }}>Vibe</span>
        <VibeMeter label="Confort"    value={bench.comfort}  color="#a67c45" />
        <VibeMeter label="Privacy"    value={bench.privacy}  color="#6b8fba" />
        <VibeMeter label="Romantique" value={bench.romantic} color="#b87070" />
      </div>

      {/* Commentaires */}
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-3)' }}>
          Commentaires ({comments.length})
        </span>
        {comments.length === 0 && (
          <p className="text-xs italic" style={{ color: 'var(--text-3)' }}>Aucun commentaire pour l'instant.</p>
        )}
        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
          {comments.map(c => (
            <div key={c.id} className="p-3 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{c.author}</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-xs leading-snug" style={{ color: 'var(--text-2)' }}>{c.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleComment} className="flex flex-col gap-2">
          <input
            type="text" placeholder="Votre nom (optionnel)"
            value={author} onChange={e => setAuthor(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <div className="flex gap-2">
            <input
              type="text" placeholder="Ajouter un commentaire..."
              value={content} onChange={e => setContent(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <motion.button
              type="submit" disabled={posting || !content.trim()}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-30"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
            >
              {posting ? '...' : 'Envoyer'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
