export interface PostAnalysis {
  id: string
  contentHash: string
  platformPostId?: string // Platform's actual post ID from URL
  platform: string // 'twitter', 'instagram', 'facebook', etc.
  classification: Record<string, number> // User-configurable classification categories
  processedAt: number
  authorName: string
}