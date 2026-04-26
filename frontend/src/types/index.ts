export interface Comment {
  id: number
  author: string
  content: string
  created_at: string
}

export interface Bench {
  id: number
  latitude: number
  longitude: number
  title: string | null
  description: string | null
  note: number
  image: string | null
  privacy: number
  romantic: number
  comfort: number
  comments: Comment[]
}

export interface NewBenchPayload {
  latitude: number
  longitude: number
  title?: string
  description?: string
  note?: number
  privacy?: number
  romantic?: number
  comfort?: number
  image?: File
}
