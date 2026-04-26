'use client'
import { useState } from 'react'
import { imageUrl } from '@/lib/api'

export function PhotoGrid({ image }: { image: string | null }) {
  const [loaded, setLoaded] = useState(false)
  const url = imageUrl(image)
  if (!url) return null

  return (
    <div className="relative w-full h-52 rounded-xl overflow-hidden" style={{ background: 'var(--border)' }}>
      {!loaded && <div className="absolute inset-0 skeleton rounded-xl" />}
      <img
        src={url}
        alt="Photo du spot"
        className="w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  )
}
