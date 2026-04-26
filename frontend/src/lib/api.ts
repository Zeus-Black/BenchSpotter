import type { Bench, NewBenchPayload, Comment } from '@/types'

const BASE = '/api'

export async function fetchBenches(): Promise<Bench[]> {
  const res = await fetch(`${BASE}/benches`)
  if (!res.ok) throw new Error('Failed to fetch benches')
  return res.json()
}

export async function createBench(payload: NewBenchPayload): Promise<Bench> {
  const form = new FormData()
  form.append('latitude', String(payload.latitude))
  form.append('longitude', String(payload.longitude))
  if (payload.title) form.append('title', payload.title)
  if (payload.description) form.append('description', payload.description)
  if (payload.note != null) form.append('note', String(payload.note))
  if (payload.privacy != null) form.append('privacy', String(payload.privacy))
  if (payload.romantic != null) form.append('romantic', String(payload.romantic))
  if (payload.comfort != null) form.append('comfort', String(payload.comfort))
  if (payload.image) form.append('image', payload.image)

  const res = await fetch(`${BASE}/benches`, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status} — ${text}`)
  }
  return res.json()
}

export async function fetchComments(benchId: number, skip = 0, limit = 5): Promise<Comment[]> {
  const res = await fetch(`${BASE}/benches/${benchId}/comments?skip=${skip}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch comments')
  return res.json()
}

export async function postComment(benchId: number, author: string, content: string): Promise<Comment> {
  const form = new FormData()
  form.append('author', author)
  form.append('content', content)
  const res = await fetch(`${BASE}/benches/${benchId}/comments`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Failed to post comment')
  return res.json()
}

export function imageUrl(filename: string | null): string | null {
  if (!filename) return null
  return `${BASE}/static/${filename}`
}
