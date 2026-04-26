import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BenchSpotter — Find Your Spot',
  description: 'Découvrez les meilleurs bancs, curatés pour les explorateurs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </body>
    </html>
  )
}
