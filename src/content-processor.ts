import { SocialMediaPlatform, PostElement, PostContent } from './types'
import { PostAnalysis } from './analysis'
import { classifyText } from './classification'
import { postPersistence, PostCacheEntry } from './post-persistence'
import { ClassificationResult } from './classification'
import { settingsManager } from './settings'
import { nutritionFactsOverlay } from './nutrition-label'
import { TimeTracker } from './time-tracker'
import { TaskManager, Task } from './task-manager'
import { logger } from './utils/logger'

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
    logger.info('[ContentProcessor] Constructor completed')
  }

  private async initializeSettings(): Promise<void> {
    logger.debug('[ContentProcessor] initializeSettings() called')
    try {
      logger.debug('[ContentProcessor] About to call settingsManager.initializeSettings()...')

      const result = await settingsManager.initializeSettings()
      logger.info('[ContentProcessor] Settings initialized successfully, result:', result)
    } catch (error) {
      logger.error('[ContentProcessor] Failed to initialize settings:', error)
      logger.error('[ContentProcessor] Error details:', error)
      logger.error('[ContentProcessor] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    }
  }

  // Main processing method that uses task-based text aggregation
  async processPost(post: PostElement): Promise<PostAnalysis | null> {
    // Check if we already have a cache entry for this post
    const cachedEntry = await postPersistence.getPost(post.id)
    
    if (cachedEntry) {
      if (cachedEntry.state === 'complete' && cachedEntry.classification) {
        logger.info(`[${post.id}] Using cached analysis`)
        return this.convertCacheEntryToAnalysis(cachedEntry)
      } else if (cachedEntry.state === 'analyzing' || cachedEntry.state === 'pending') {
        logger.info(`[${post.id}] Analysis already in progress`)
        logger.debug(`[${post.id}] cachedEntry:`, cachedEntry)
        logger.debug(`[${post.id}] hasRemoteAnalysisPending:`, this.taskManager.hasRemoteAnalysisPending(post.id, cachedEntry.tasks))
        // Check if this is a special case: analyzing/pending with pending remote-analysis task
        if (this.taskManager.hasRemoteAnalysisPending(post.id, cachedEntry.tasks)) {
          logger.info(`[${post.id}] Special case: Found pending remote-analysis task, adding another remote-analysis task`)
          
          // Add another remote-analysis task to the queue
          this.taskManager.addRemoteAnalysisTask(post.id, this.platform, post)
          
          logger.info(`[${post.id}] Additional remote-analysis task added`)
        }
        
        // Tasks may already be running, let them continue
        return null
      }
    }

    logger.info(`[${post.id}] Starting task-based analysis`)
    
    try {
      // Extract basic content for initial cache entry
      const content = this.platform.extractPostContent(post)
      
      // Create pending entry in storage
      await postPersistence.createPendingEntry(post.id, content, this.platform.getPlatformName())
      
      // Update state to analyzing
      await postPersistence.updatePost(post.id, { state: 'analyzing' })
      
      // Initialize task queue - this will start all tasks asynchronously
      this.taskManager.initializeTasksForPost(post.id, this.platform, post)
      
      logger.info(`[${post.id}] Task queue initialized, processing will continue asynchronously`)
      
      // Return null since we're now processing asynchronously
      // Results will be available when tasks complete
      return null
      
    } catch (error) {
      logger.error(`[${post.id}] Processing failed:`, error)
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
    
    logger.info(`Processing ${posts.length} posts`)
    
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
      logger.info(`${logPrefix} Analyzing text: "${text.substring(0, 100)}..."`)
      logger.info(`${logPrefix} About to call classifyText...`)
      
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
        ...classification
      }
      ;(classificationResult as any).totalAttentionScore = totalAttentionScore
      
      logger.info(`${logPrefix} Final classification:`, classificationResult)
      return classificationResult
      
    } catch (error) {
      logger.error(`${logPrefix} Failed to classify text:`, error)
      
      // Fallback to basic heuristics if AI classification fails
      const fallbackClassification: ClassificationResult = {}
      ;(fallbackClassification as any).totalAttentionScore = 0
      
      logger.info(`${logPrefix} Using fallback classification:`, fallbackClassification)
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
  generateOverlayContent(classification: ClassificationResult, timeSpentMs: number, postState: string = 'complete', postContent?: PostContent): string {
    return nutritionFactsOverlay(classification, timeSpentMs, postState, postContent)
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
    logger.info(`[${postId}] [ContentProcessor] Task completed: ${completedTask.type}`)
    logger.info(`[${postId}] [ContentProcessor] Accumulated text: "${accumulatedText}"`)
    logger.info(`[handleTaskCompletion] Today's analytics:`, await postPersistence.getTodayAnalytics());

    try {
      // Get current tasks from TaskManager
      const allTasks = this.taskManager.getTasks(postId)
      
      // Update storage with current task state and accumulated text
      await postPersistence.updateTaskData(postId, allTasks, accumulatedText, accumulatedText)

      // Check if this is a remote-analysis task completion
      if (completedTask.type === 'remote-analysis' && completedTask.status === 'completed') {
        logger.info(`[${postId}] [ContentProcessor] Remote analysis completed - using high-quality classification`)
        
        const remoteClassification = this.taskManager.getRemoteAnalysisResult(postId)
        if (remoteClassification) {
          // Use the high-quality remote classification and update state atomically
          await postPersistence.updatePost(postId, { 
            classification: remoteClassification,
            state: 'complete'
          })
          
          // Check if post should be screened based on classification
          const post = this.findPostElementById(postId)
          if (post && await this.shouldScreenPost(remoteClassification, post)) {
              logger.info(`[${postId}] [ContentProcessor] Post should be screened based on remote classification`)
              
              // Show screen immediately
              await this.platform.showResistScreen(post)
              logger.info(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on remote classification`)
              await postPersistence.updateScreenStatus(postId, true)
              logger.info(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on remote classification`)
          } else if (!post) {
              logger.warn(`[${postId}] [ContentProcessor] Could not find post element for screening check`)
          } else {
              logger.info(`[${postId}] [ContentProcessor] Post should not be screened based on remote classification`)
          }
        
          logger.info(`[${postId}] [ContentProcessor] Remote classification successfully updated:`, Object.keys(remoteClassification))
        } else {
          logger.error(`[${postId}] [ContentProcessor] Remote analysis completed but no valid classification found`)
        }
        
        return // Exit early - remote analysis takes precedence
      }

      // Check if remote analysis has already completed - if so, don't override with local classification
      if (this.taskManager.hasRemoteAnalysisCompleted(postId)) {
        logger.info(`[${postId}] [ContentProcessor] Remote analysis already completed - skipping local classification`)
        
        // Still check if all tasks are complete for state management
        const areAllComplete = this.taskManager.areAllTasksCompleted(postId)
        if (areAllComplete) {
          logger.info(`[${postId}] [ContentProcessor] All tasks completed, marking as complete`)
          await postPersistence.updatePost(postId, { state: 'complete' })
        }
        
        return
      }

      // Only perform local classification if we have meaningful text and remote analysis hasn't completed
      if (accumulatedText.trim()) {
        // Perform incremental classification with accumulated text
        logger.info(`[${postId}] [ContentProcessor] Performing local incremental classification`)
        const classification = await this.analyzeContent(accumulatedText, postId)
        
        // Update classification results in storage (this will be overridden if remote analysis completes later)
        await postPersistence.updatePost(postId, { classification })
        
        // Check if all tasks are complete
        const areAllComplete = this.taskManager.areAllTasksCompleted(postId)
        if (areAllComplete) {
          logger.info(`[${postId}] [ContentProcessor] All tasks completed, marking as complete`)
          await postPersistence.updatePost(postId, { state: 'complete' })
        } else {
          logger.info(`[${postId}] [ContentProcessor] Tasks still pending, keeping state as analyzing`)
        }

        // Check if post should be screened based on classification
        const post = this.findPostElementById(postId)
        if (areAllComplete && post && await this.shouldScreenPost(classification, post)) {
          // Show screen immediately
          await this.platform.showResistScreen(post)
          logger.info(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on local classification`)
          await postPersistence.updateScreenStatus(postId, true)
          logger.info(`[${postId}] [ContentProcessor] Auto-screening enabled and displayed based on local classification`)
        } else if (!post) {
          logger.warn(`[${postId}] [ContentProcessor] Could not find post element for screening check`)
        }
        
        logger.info(`[${postId}] [ContentProcessor] Local classification updated:`, Object.keys(classification))
      } else {
        logger.info(`[${postId}] [ContentProcessor] No meaningful text yet, skipping local classification`)
      }

    } catch (error) {
      logger.error(`[${postId}] [ContentProcessor] Task completion handling failed:`, error)
      await postPersistence.markFailed(postId, error instanceof Error ? error.message : 'Task completion error')
    }
  }

  /**
   * Check if a post should be screened due to media filtering
   */
  private async shouldScreenPostForMedia(post: PostElement): Promise<boolean> {
    return false;
    try {
      const filters = await settingsManager.getFilters()
      
      if (filters.filterImagesVideos) {
        // Extract post content to check for media
        const content = this.platform.extractPostContent(post)
        
        if (content.mediaElements && content.mediaElements.length > 0) {
          logger.info(`[${post.id}] [ContentProcessor] Post contains media and user has enabled media filtering - screening needed`)
          logger.debug(`[${post.id}] [ContentProcessor] Media filtering criteria met: filterImagesVideos=${filters.filterImagesVideos}, mediaElements.length=${content.mediaElements.length}`)
          return true // Screen the post due to media
        } else {
          logger.debug(`[${post.id}] [ContentProcessor] Media filtering not applied: filterImagesVideos=${filters.filterImagesVideos}, hasMedia=${content.mediaElements && content.mediaElements.length > 0}`)
        }
      }
      
      return false // No media filtering needed
      
    } catch (error) {
      logger.warn(`[${post.id}] [ContentProcessor] Failed to check media filters:`, error)
      return false // Fall back to not screening on error
    }
  }

  /**
   * Determine if a post should be screened based on budget constraints or media filtering
   */
  private async shouldScreenPost(classification: ClassificationResult, post: PostElement): Promise<boolean> {
    try {
      // Check media filtering first (if enabled)
      const shouldScreenForMedia = await this.shouldScreenPostForMedia(post)
      if (shouldScreenForMedia) {
        return true // Screen the post due to media
      }
      
      // Check budget constraints (existing logic)
      const budgets = await settingsManager.getBudgets()
      
      // Get today's analytics (what's already consumed)
      const todayAnalytics = await postPersistence.getTodayAnalytics()
      
      logger.info(`[ContentProcessor] Checking budgets constraints for new post`)
      logger.info(`[ContentProcessor] Current budgets:`, budgets)
      logger.info(`[ContentProcessor] Today's budgets consumption:`, todayAnalytics)
      
      // Check each category to see if adding this post would exceed budget
      for (const [categoryName, categoryData] of Object.entries(classification)) {
        // Skip totalAttentionScore field
        if (categoryName === 'totalAttentionScore') continue
        
        // Get budget for this category (convert from minutes to seconds)
        const categoryBudget = budgets[categoryName]
        if (!categoryBudget) continue
        
        const categoryBudgetSeconds = categoryBudget.total * 60
        const currentCategoryTime = todayAnalytics.categories[categoryName]?.totalScore || 0
        if (categoryData.totalScore < 0.2) continue
        
        // Check if adding this post's category score would exceed budget
        if (categoryData.totalScore + currentCategoryTime > categoryBudgetSeconds) {
          logger.info(`[ContentProcessor] Post would exceed ${categoryName} budget: ${currentCategoryTime}s + ${categoryData.totalScore}s > ${categoryBudgetSeconds}s`)
          return true // Screen the post
        }
        
        // Check subcategories as well
        for (const [subcategoryName, subcategoryData] of Object.entries(categoryData.subcategories)) {
          const subcategoryBudget = categoryBudget.subcategories?.[subcategoryName] || 0
          if (subcategoryBudget > 0) {
            const subcategoryBudgetSeconds = subcategoryBudget * 60
            const currentSubcategoryTime = todayAnalytics.categories[categoryName]?.subcategories?.[subcategoryName] || 0
            if (subcategoryData.score < 0.2) continue
            
            if (subcategoryData.score + currentSubcategoryTime > subcategoryBudgetSeconds) {
              logger.info(`[ContentProcessor] Post would exceed ${categoryName}/${subcategoryName} subcategory budget: ${currentSubcategoryTime}s + ${subcategoryData.score}s > ${subcategoryBudgetSeconds}s`)
              return true // Screen the post
            }
          }
        }
      }
      
      logger.info(`[ContentProcessor] Post within budget limits, no screening needed`)
      return false // Don't screen the post
      
    } catch (error) {
      logger.error(`[ContentProcessor] Error checking screening criteria:`, error)
      // If we can't check screening criteria, fall back to not screening (safer default)
      return false
    }
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