import { PostAnalysis } from './analysis'

export class ContentCache {
  private cache = new Map<string, PostAnalysis>()
  private contentHashToId = new Map<string, string>()
  
  // Generate stable hash from post content
  private generateContentHash(content: string, authorSlug: string): string {
    const combined = `${authorSlug}:${content}`
    return this.simpleHash(combined)
  }
  
  // Simple hash function (could use crypto.subtle for better hashing)
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
  
  // Generate stable ID for a post
  generateStableId(platformPostId: string | null, content: string, authorSlug: string, platform: string): string {
    if (platformPostId) {
      return `${platform}-${authorSlug}-${platformPostId}`
    }
    
    // Fallback: use content hash
    const contentHash = this.generateContentHash(content, authorSlug)
    return `${platform}-${authorSlug}-hash-${contentHash}`
  }
  
  // Check if we've already processed this post
  hasProcessed(stableId: string, contentHash: string): boolean {
    const cached = this.cache.get(stableId)
    if (!cached) return false
    
    // Double-check content hasn't changed (e.g., post was edited)
    return cached.contentHash === contentHash
  }
  
  // Store analysis result
  store(analysis: PostAnalysis): void {
    this.cache.set(analysis.id, analysis)
    this.contentHashToId.set(analysis.contentHash, analysis.id)
  }
  
  // Get stored analysis
  get(stableId: string): PostAnalysis | null {
    return this.cache.get(stableId) || null
  }
  
  // Find by content hash (fallback for when we can't extract post ID)
  findByContentHash(contentHash: string): PostAnalysis | null {
    const id = this.contentHashToId.get(contentHash)
    return id ? this.cache.get(id) || null : null
  }
  
  // Get cache stats for debugging
  getStats(): { totalEntries: number } {
    return { totalEntries: this.cache.size }
  }
}

// Global instance
export const contentCache = new ContentCache()