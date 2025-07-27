import { SocialMediaPlatform, PostElement } from './types'
import { contentCache } from './content-cache'
import { PostAnalysis } from './analysis'

export class ContentProcessor {
  private platform: SocialMediaPlatform

  constructor(platform: SocialMediaPlatform) {
    this.platform = platform
  }

  // Main processing method that uses caching
  async processPost(post: PostElement): Promise<PostAnalysis | null> {
    // Check if we should process this post (not already cached)
    if (!this.platform.shouldProcessPost(post)) {
      console.log(`[${post.id}] Skipping - already processed`)
      return contentCache.get(post.id)
    }

    console.log(`[${post.id}] Processing new post`)
    
    try {
      // Extract content for analysis
      const content = this.platform.extractPostContent(post)
      
      // Perform analysis (this would be your actual AI/classification logic)
      const classification = await this.analyzeContent(content.text)
      
      // Create analysis result
      const analysis: PostAnalysis = {
        id: post.id,
        contentHash: this.generateContentHash(content.text, content.authorName),
        platformPostId: this.extractPlatformPostId(post),
        platform: this.platform.getPlatformName(),
        classification,
        processedAt: Date.now(),
        authorName: content.authorName
      }
      
      // Store in cache
      this.platform.markPostProcessed(post, analysis)
      
      console.log(`[${post.id}] Analysis complete -`, Object.entries(classification).map(([key, value]) => `${key}: ${value}`).join(', '))
      
      return analysis
      
    } catch (error) {
      console.error(`[${post.id}] Processing failed:`, error)
      return null
    }
  }

  // Process multiple posts efficiently
  async processPosts(posts: PostElement[]): Promise<PostAnalysis[]> {
    const results: PostAnalysis[] = []
    
    // First, quickly identify which posts need processing
    const postsToProcess = posts.filter(post => this.platform.shouldProcessPost(post))
    const cachedPosts = posts.filter(post => !this.platform.shouldProcessPost(post))
    
    console.log(`Processing ${postsToProcess.length} new posts, ${cachedPosts.length} already cached`)
    
    // Get cached results immediately
    for (const post of cachedPosts) {
      const cached = contentCache.get(post.id)
      if (cached) {
        results.push(cached)
      }
    }
    
    // Process new posts (could be done in parallel for better performance)
    const processingPromises = postsToProcess.map(post => this.processPost(post))
    const newResults = await Promise.all(processingPromises)
    
    // Add non-null results
    results.push(...newResults.filter(result => result !== null) as PostAnalysis[])
    
    return results
  }

  // Mock analysis function - replace with your actual classification logic
  private async analyzeContent(text: string): Promise<Record<string, number>> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock classification based on keywords (replace with real AI)
    const categoryKeywords = {
      education: ['learn', 'study', 'research', 'science', 'knowledge', 'education'],
      entertainment: ['funny', 'lol', 'meme', 'joke', 'entertainment', 'viral'],
      emotion: ['angry', 'sad', 'happy', 'excited', 'upset', 'outraged']
    }
    
    const textLower = text.toLowerCase()
    const classification: Record<string, number> = {}
    
    // Calculate scores for each category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const hasKeyword = keywords.some(keyword => textLower.includes(keyword))
      classification[category] = hasKeyword ? Math.random() * 0.4 + 0.6 : Math.random() * 0.4 + 0.1
    }
    
    // Add attention score based on content characteristics
    classification.attentionScore = Math.min(1.0, 
      (text.length / 280) * 0.5 + 
      (classification.entertainment || 0) * 0.3 + 
      (classification.emotion || 0) * 0.2
    )
    
    return classification
  }

  private generateContentHash(content: string, author: string): string {
    const combined = `${author}:${content}`
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  private extractPlatformPostId(post: PostElement): string | undefined {
    // Extract the actual platform post ID if available
    const parts = post.id.split('-')
    if (parts.length >= 2 && parts[1] !== 'hash') {
      return parts[1]
    }
    return undefined
  }

  // Get cached analysis for a post
  getCachedAnalysis(post: PostElement): PostAnalysis | null {
    return contentCache.get(post.id)
  }

  // Get cache statistics
  getCacheStats(): { totalEntries: number } {
    return contentCache.getStats()
  }
}

// Example usage in content script:
/*
import { TwitterPlatform } from './platforms/twitter'
import { ContentProcessor } from './content-processor'

const platform = new TwitterPlatform()
const processor = new ContentProcessor(platform)

// Process all visible posts
const posts = platform.detectPosts()
const analyses = await processor.processPosts(posts)

// When new posts are detected via mutation observer
platform.observeNewContent(async (newPosts) => {
  const newAnalyses = await processor.processPosts(newPosts)
  // Handle new analyses...
})
*/