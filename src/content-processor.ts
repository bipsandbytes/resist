import { SocialMediaPlatform, PostElement } from './types'
import { PostAnalysis } from './analysis'
import { classifyText, ContentCategory } from './classification'
import { postPersistence, PostCacheEntry, ClassificationResult } from './post-persistence'

export class ContentProcessor {
  private platform: SocialMediaPlatform

  constructor(platform: SocialMediaPlatform) {
    this.platform = platform
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
      const classification = await this.analyzeContent(content.text)
      
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
  private async analyzeContent(text: string): Promise<ClassificationResult> {
    try {
      console.log(`[Classification] Analyzing text: "${text.substring(0, 100)}..."`)
      console.log(`[Classification] About to call classifyText...`)
      
      // Use our classification system
      const classificationResult = await classifyText(text)
      
      console.log(`[Classification] classifyText returned:`, classificationResult)
      console.log(`[Classification] Result: ${classificationResult.category} (${(classificationResult.confidence * 100).toFixed(1)}%)`)
      
      // Calculate attention score based on category and content characteristics
      const emotionWeight = classificationResult.scores[ContentCategory.EMOTION] * 0.4
      const entertainmentWeight = classificationResult.scores[ContentCategory.ENTERTAINMENT] * 0.3
      const educationWeight = classificationResult.scores[ContentCategory.EDUCATION] * 0.1
      const lengthFactor = Math.min(1.0, text.length / 280) * 0.2
      
      const attentionScore = Math.min(1.0, 
        emotionWeight + entertainmentWeight + educationWeight + lengthFactor
      )
      
      // Convert to ClassificationResult format
      const classification: ClassificationResult = {
        education: classificationResult.scores[ContentCategory.EDUCATION],
        entertainment: classificationResult.scores[ContentCategory.ENTERTAINMENT], 
        emotion: classificationResult.scores[ContentCategory.EMOTION],
        primaryCategory: classificationResult.category,
        confidence: classificationResult.confidence,
        attentionScore
      }
      
      console.log(`[Classification] Final classification:`, classification)
      return classification
      
    } catch (error) {
      console.error('[Classification] Failed to classify text:', error)
      
      // Fallback to basic heuristics if AI classification fails
      const fallbackClassification: ClassificationResult = {
        education: 0.33,
        entertainment: 0.33,
        emotion: 0.33,
        primaryCategory: ContentCategory.ENTERTAINMENT,
        confidence: 0.33,
        attentionScore: 0.5
      }
      
      console.log(`[Classification] Using fallback classification:`, fallbackClassification)
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