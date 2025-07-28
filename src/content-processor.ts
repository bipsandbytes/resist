import { SocialMediaPlatform, PostElement } from './types'
import { PostAnalysis } from './analysis'
import { classifyText } from './classification'
import { postPersistence, PostCacheEntry, ClassificationResult } from './post-persistence'
import { settingsManager } from './settings'

export class ContentProcessor {
  private platform: SocialMediaPlatform

  constructor(platform: SocialMediaPlatform) {
    this.platform = platform
    // Initialize settings on construction
    this.initializeSettings()
  }

  private async initializeSettings(): Promise<void> {
    try {
      await settingsManager.initializeSettings()
      console.log('[ContentProcessor] Settings initialized')
    } catch (error) {
      console.error('[ContentProcessor] Failed to initialize settings:', error)
    }
  }

  // Main processing method that uses persistence
  async processPost(post: PostElement): Promise<PostAnalysis | null> {
    // Check if we already have analysis for this post
    const cachedEntry = await postPersistence.getPost(post.id)
    
    if (cachedEntry) {
      if (cachedEntry.state === 'complete' && cachedEntry.classification) {
        console.log(`[${post.id}] Using cached analysis`)
        return this.convertCacheEntryToAnalysis(cachedEntry)
      } else if (cachedEntry.state === 'analyzing' || cachedEntry.state === 'pending') {
        console.log(`[${post.id}] Analysis already in progress`)
        return null // Don't start duplicate analysis
      }
    }

    console.log(`[${post.id}] Starting new analysis`)
    
    try {
      // Extract content for analysis
      const content = this.platform.extractPostContent(post)
      
      // Create pending entry in storage
      await postPersistence.createPendingEntry(post.id, content, this.platform.getPlatformName())
      
      // Update state to analyzing
      await postPersistence.updatePost(post.id, { state: 'analyzing' })
      
      // Perform analysis (this would be your actual AI/classification logic)
      const classification = await this.analyzeContent(content.text, post.id)
      
      // Store complete analysis result
      await postPersistence.markComplete(post.id, classification)
      
      // Create analysis result
      const analysis: PostAnalysis = {
        id: post.id,
        contentHash: '', // No longer needed with stable IDs
        platformPostId: this.extractPlatformPostId(post),
        platform: this.platform.getPlatformName(),
        classification,
        processedAt: Date.now(),
        authorName: content.authorName
      }
      
      console.log(`[${post.id}] Analysis complete for ${content.text}`)
      console.log(`[${post.id}] Analysis complete -`, Object.entries(classification).map(([key, value]) => `${key}: ${value}`).join(', '))
      
      return analysis
      
    } catch (error) {
      console.error(`[${post.id}] Processing failed:`, error)
      await postPersistence.markFailed(post.id, error instanceof Error ? error.message : 'Unknown error')
      return null
    }
  }

  // Convert cache entry to PostAnalysis format for compatibility
  private convertCacheEntryToAnalysis(entry: PostCacheEntry): PostAnalysis {
    if (!entry.classification) {
      throw new Error('Cannot convert cache entry without classification to analysis')
    }
    
    return {
      id: entry.id,
      contentHash: '', // No longer needed
      platformPostId: this.extractPlatformPostId({ id: entry.id } as PostElement),
      platform: entry.metadata.platform,
      classification: entry.classification,
      processedAt: entry.metadata.lastSeen,
      authorName: entry.postData.authorName
    }
  }

  // Process multiple posts efficiently
  async processPosts(posts: PostElement[]): Promise<PostAnalysis[]> {
    const results: PostAnalysis[] = []
    
    console.log(`Processing ${posts.length} posts`)
    
    // Process each post (using individual processPost logic for caching)
    const processingPromises = posts.map(post => this.processPost(post))
    const allResults = await Promise.all(processingPromises)
    
    // Add non-null results
    results.push(...allResults.filter(result => result !== null) as PostAnalysis[])
    
    return results
  }

  // Real AI-powered content analysis using transformers.js
  private async analyzeContent(text: string, tweetId?: string): Promise<ClassificationResult> {
    const logPrefix = tweetId ? `[${tweetId}]` : '[Classification]'
    
    try {
      console.log(`${logPrefix} Analyzing text: "${text.substring(0, 100)}..."`)
      console.log(`${logPrefix} About to call classifyText...`)
      
      // Get ingredient categories from settings
      const ingredientCategories = await settingsManager.getIngredientCategories()
      
      // Use our classification system with ingredient categories
      const classification = await classifyText(text, ingredientCategories, tweetId)
      
      // Calculate total attention score
      let totalAttentionScore = 0
      for (const categoryData of Object.values(classification)) {
        totalAttentionScore += categoryData.totalScore
      }
      
      // Add total to the classification result
      const classificationResult: ClassificationResult = {
        ...classification,
        totalAttentionScore
      }
      
      console.log(`${logPrefix} Final classification:`, classificationResult)
      return classificationResult
      
    } catch (error) {
      console.error(`${logPrefix} Failed to classify text:`, error)
      
      // Fallback to basic heuristics if AI classification fails
      const fallbackClassification: ClassificationResult = {
        totalAttentionScore: 0
      }
      
      console.log(`${logPrefix} Using fallback classification:`, fallbackClassification)
      return fallbackClassification
    }
  }

  private extractPlatformPostId(post: PostElement): string | undefined {
    // Extract the actual platform post ID from stable ID format: twitter-username-statusId
    const parts = post.id.split('-')
    if (parts.length >= 3) {
      return parts[2] // Return the status ID part
    }
    return undefined
  }

  // Get cached analysis for a post
  async getCachedAnalysis(post: PostElement): Promise<PostAnalysis | null> {
    const cachedEntry = await postPersistence.getPost(post.id)
    if (cachedEntry?.state === 'complete' && cachedEntry.classification) {
      return this.convertCacheEntryToAnalysis(cachedEntry)
    }
    return null
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ totalPosts: number, completeAnalyses: number, pendingAnalyses: number }> {
    return await postPersistence.getStorageStats()
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