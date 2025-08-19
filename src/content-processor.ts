import { SocialMediaPlatform, PostElement } from './types'
import { PostAnalysis } from './analysis'
import { classifyText } from './classification'
import { postPersistence, PostCacheEntry, ClassificationResult } from './post-persistence'
import { settingsManager } from './settings'
import { nutritionFactsOverlay } from './nutrition-label'
import { TimeTracker } from './time-tracker'
import { TaskManager, Task } from './task-manager'

export class ContentProcessor {
  public platform: SocialMediaPlatform
  public timeTracker: TimeTracker
  private taskManager: TaskManager

  constructor(platform?: SocialMediaPlatform) {
    this.platform = platform
    this.timeTracker = new TimeTracker()
    this.taskManager = new TaskManager(this.handleTaskCompletion.bind(this))
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

  // Main processing method that uses task-based text aggregation
  async processPost(post: PostElement): Promise<PostAnalysis | null> {
    // Check if we already have a cache entry for this post
    const cachedEntry = await postPersistence.getPost(post.id)
    
    if (cachedEntry) {
      if (cachedEntry.state === 'complete' && cachedEntry.classification) {
        console.log(`[${post.id}] Using cached analysis`)
        return this.convertCacheEntryToAnalysis(cachedEntry)
      } else if (cachedEntry.state === 'analyzing' || cachedEntry.state === 'pending') {
        console.log(`[${post.id}] Analysis already in progress`)
        // Tasks may already be running, let them continue
        return null
      }
    }

    console.log(`[${post.id}] Starting task-based analysis`)
    
    try {
      // Extract basic content for initial cache entry
      const content = this.platform.extractPostContent(post)
      
      // Create pending entry in storage
      await postPersistence.createPendingEntry(post.id, content, this.platform.getPlatformName())
      
      // Update state to analyzing
      await postPersistence.updatePost(post.id, { state: 'analyzing' })
      
      // Initialize task queue - this will start all tasks asynchronously
      this.taskManager.initializeTasksForPost(post.id, this.platform, post)
      
      console.log(`[${post.id}] Task queue initialized, processing will continue asynchronously`)
      
      // Return null since we're now processing asynchronously
      // Results will be available when tasks complete
      return null
      
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

  // Generate overlay content for a classification result
  generateOverlayContent(classification: ClassificationResult, timeSpentMs: number, postState: string = 'complete'): string {
    return nutritionFactsOverlay(classification, timeSpentMs, postState)
  }

  // Stop tracking a specific post (useful when posts are removed from DOM)
  async stopTrackingPost(postId: string): Promise<void> {
    await this.timeTracker.stopTracking(postId)
  }

  // Cleanup all time tracking (useful for page navigation or extension shutdown)
  async cleanup(): Promise<void> {
    await this.timeTracker.stopAllTracking()
  }

  // Start time tracking for a post (exposed method for content.ts)
  async startTimeTracking(post: PostElement): Promise<void> {
    await this.timeTracker.startTracking(post.element, post.id)
  }

  // Get current time tracking statistics (for debugging)
  getTimeTrackingStats(): { totalTracked: number, currentlyVisible: number } {
    return this.timeTracker.getTrackingStats()
  }

  /**
   * Handle task completion - called by TaskManager when any task completes
   */
  private async handleTaskCompletion(postId: string, completedTask: Task, accumulatedText: string): Promise<void> {
    console.log(`[${postId}] [ContentProcessor] Task completed: ${completedTask.type}`)
    console.log(`[${postId}] [ContentProcessor] Accumulated text: "${accumulatedText}"`)
    console.log(`[handleTaskCompletion] Today's analytics:`, await postPersistence.getTodayAnalytics());

    try {
      // Get current tasks from TaskManager
      const allTasks = this.taskManager.getTasks(postId)
      
      // Update storage with current task state and accumulated text
      await postPersistence.updateTaskData(postId, allTasks, accumulatedText, accumulatedText)

      // Check if this is a remote-analysis task completion
      if (completedTask.type === 'remote-analysis' && completedTask.status === 'completed') {
        console.log(`[${postId}] [ContentProcessor] Remote analysis completed - using high-quality classification`)
        
        const remoteClassification = this.taskManager.getRemoteAnalysisResult(postId)
        if (remoteClassification) {
          // Use the high-quality remote classification and update state atomically
          await postPersistence.updatePost(postId, { 
            classification: remoteClassification,
            state: 'complete'
          })
          
          // Check if post should be screened based on classification
          if (this.shouldScreenPost(remoteClassification)) {
            console.log(`[${postId}] [ContentProcessor] Post should be screened based on remote classification`)
            
            // Find the current PostElement and show screen immediately
            const post = this.findPostElementById(postId)
            if (post) {
              await this.platform.showResistScreen(post)
              console.log(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on remote classification`)
            } else {
              console.warn(`[${postId}] [ContentProcessor] Could not find post element for immediate screening`)
            }
            await postPersistence.updateScreenStatus(postId, true)
            console.log(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on remote classification`)
          } else {
            console.log(`[${postId}] [ContentProcessor] Post should not be screened based on remote classification`)
          }
        } else {
          console.error(`[${postId}] [ContentProcessor] Remote analysis completed but no valid classification found`)
        }
        
        return // Exit early - remote analysis takes precedence
      }

      // Check if remote analysis has already completed - if so, don't override with local classification
      if (this.taskManager.hasRemoteAnalysisCompleted(postId)) {
        console.log(`[${postId}] [ContentProcessor] Remote analysis already completed - skipping local classification`)
        
        // Still check if all tasks are complete for state management
        const areAllComplete = this.taskManager.areAllTasksCompleted(postId)
        if (areAllComplete) {
          console.log(`[${postId}] [ContentProcessor] All tasks completed, marking as complete`)
          await postPersistence.updatePost(postId, { state: 'complete' })
        }
        
        return
      }

      // Only perform local classification if we have meaningful text and remote analysis hasn't completed
      if (accumulatedText.trim()) {
        // Perform incremental classification with accumulated text
        console.log(`[${postId}] [ContentProcessor] Performing local incremental classification`)
        const classification = await this.analyzeContent(accumulatedText, postId)
        
        // Update classification results in storage (this will be overridden if remote analysis completes later)
        await postPersistence.updatePost(postId, { classification })
        
        // Check if post should be screened based on classification
        if (this.shouldScreenPost(classification)) {
          // Find the current PostElement and show screen immediately
          const post = this.findPostElementById(postId)
          if (post) {
            await this.platform.showResistScreen(post)
            console.log(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on local classification`)
          } else {
            console.warn(`[${postId}] [ContentProcessor] Could not find post element for immediate screening`)
          }
          await postPersistence.updateScreenStatus(postId, true)
          console.log(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on local classification`)
        }

        
        // Check if all tasks are complete
        const areAllComplete = this.taskManager.areAllTasksCompleted(postId)
        if (areAllComplete) {
          console.log(`[${postId}] [ContentProcessor] All tasks completed, marking as complete`)
          await postPersistence.updatePost(postId, { state: 'complete' })
        } else {
          console.log(`[${postId}] [ContentProcessor] Tasks still pending, keeping state as analyzing`)
        }
        
        console.log(`[${postId}] [ContentProcessor] Local classification updated:`, Object.keys(classification))
      } else {
        console.log(`[${postId}] [ContentProcessor] No meaningful text yet, skipping local classification`)
      }

    } catch (error) {
      console.error(`[${postId}] [ContentProcessor] Task completion handling failed:`, error)
      await postPersistence.markFailed(postId, error instanceof Error ? error.message : 'Task completion error')
    }
  }

  /**
   * Determine if a post should be screened based on its classification
   */
  private shouldScreenPost(classification: ClassificationResult): boolean {
    // Screen posts with high Education content (threshold: 0.5)
    // This can be made configurable in settings later
    const threshold = 0.5
    console.log(`[ContentProcessor] Classification:`, classification)
    console.log(`[ContentProcessor] Classification categories:`, Object.keys(classification))
    
    const entertainmentScore = classification?.['Entertainment']?.totalScore || 0
    const emotionScore = classification?.['Emotion']?.totalScore || 0
    const shouldScreen = entertainmentScore >= threshold || emotionScore >= threshold
    /*
    if (shouldScreen) {
      console.log(`[ContentProcessor] Post should be screened: Education score=${educationScore} >= threshold=${threshold}`)
    } else {
      console.log(`[ContentProcessor] Post should not be screened: Education score=${educationScore} < threshold=${threshold}`)
    }
      */
    
    return shouldScreen
  }

  /**
   * Find PostElement by postId for immediate screen operations
   */
  private findPostElementById(postId: string): PostElement | null {
    if (!this.platform) return null
    
    const posts = this.platform.detectPosts()
    return posts.find(post => post.id === postId) || null
  }

  /**
   * Get task statistics for debugging
   */
  getTaskStats(postId: string): { total: number, pending: number, running: number, completed: number, failed: number } {
    return this.taskManager.getTaskStats(postId)
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