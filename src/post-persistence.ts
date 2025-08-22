/**
 * Chrome Storage-based Post Persistence Manager
 * 
 * Stores post analysis data, classification results, and UI artifacts
 * in Chrome's local storage to avoid expensive recomputations.
 */

import { PostContent } from './types'
import { Task } from './task-manager'
import { ClassificationResult } from './classification'
import { storageManager } from './storage-manager'

export interface SubcategoryScore {
  score: number         // Pure classification score (0-1)
}

export interface CategoryScore {
  subcategories: { [subcategoryName: string]: SubcategoryScore }
  totalScore: number    // Sum of all subcategory classification scores
}

export interface DateRangeAnalytics {
  categories: {
    [categoryName: string]: {
      subcategories: { [subcategoryName: string]: number }  // aggregated time-weighted scores
      totalScore: number  // sum of subcategory scores
    }
  }
  totalAttentionScore: number
  totalTimeSpent: number  // sum of all post timeSpent in date range
  postCount: number       // number of posts in date range
  dateRange: { startDate: Date, endDate: Date }
}

export interface PostCacheEntry {
  id: string                           // Platform-specific stable ID (e.g., 'twitter-john-doe-123456')
  postData: PostContent               // Text, author, media URLs
  classification: ClassificationResult | null  // AI analysis results
  state: 'pending' | 'analyzing' | 'complete' | 'failed'
  artifacts: {
    overlayId: string                 // Unique overlay ID based on stable post ID
  }
  metadata: {
    lastSeen: number                  // Timestamp when last encountered
    timeSpent: number                 // Total time user spent on this post
    platform: string                 // 'twitter', etc.
    screenStatus?: {
      enabled: boolean                // Default: false
      lastUpdated: number             // Timestamp when status was last changed
    }
  }
  tasks: Task[]                       // Text extraction tasks for this post
  accumulatedText: string             // Running total of all completed task text
  lastClassificationText: string      // Text used for most recent classification
  debug: Record<string, any>          // Extensible debug info dictionary
}

export class PostPersistenceManager {
  private static readonly STORAGE_KEY = 'content'

  /**
   * Store complete post analysis in Chrome storage
   */
  async storePost(entry: PostCacheEntry): Promise<void> {
    try {
      // Get existing content dictionary from StorageManager
      const content = storageManager.get(PostPersistenceManager.STORAGE_KEY) || {}
      content[entry.id] = entry
      
      // Store updated content dictionary via StorageManager
      storageManager.set(PostPersistenceManager.STORAGE_KEY, content)
      
      console.log(`[Persistence] Stored post: ${entry.id}`)
    } catch (error) {
      console.error(`[Persistence] Failed to store post ${entry.id}:`, error)
      throw error
    }
  }

  /**
   * Retrieve post from Chrome storage
   */
  async getPost(postId: string): Promise<PostCacheEntry | null> {
    try {
      const content = storageManager.get(PostPersistenceManager.STORAGE_KEY) || {}
      const entry = content[postId] || null
      
      if (entry) {
        console.log(`[Persistence] Retrieved post: ${postId} (state: ${entry.state})`)
        // Update lastSeen timestamp (fire and forget)
        this.updatePost(postId, { 
          metadata: { ...entry.metadata, lastSeen: Date.now() } 
        }).catch(err => console.warn('Failed to update lastSeen:', err))
      }
      
      return entry
    } catch (error) {
      console.error(`[Persistence] Failed to retrieve post ${postId}:`, error)
      return null
    }
  }

  /**
   * Check if post exists and has complete analysis
   */
  async hasCompleteAnalysis(postId: string): Promise<boolean> {
    const entry = await this.getPost(postId)
    return entry?.state === 'complete' && entry.classification !== null
  }

  /**
   * Update specific fields of a stored post
   */
  async updatePost(postId: string, updates: Partial<PostCacheEntry>): Promise<void> {
    try {
      const content = storageManager.get(PostPersistenceManager.STORAGE_KEY) || {}
      const existingEntry = content[postId]
      
      if (!existingEntry) {
        console.warn(`[Persistence] Cannot update non-existent post: ${postId}`)
        return
      }

      const updatedEntry: PostCacheEntry = {
        ...existingEntry,
        ...updates,
        metadata: {
          ...existingEntry.metadata,
          ...updates.metadata
        },
        artifacts: {
          ...existingEntry.artifacts,
          ...updates.artifacts
        },
        debug: {
          ...existingEntry.debug,
          ...updates.debug
        }
      }

      content[postId] = updatedEntry
      
      // Store updated content dictionary via StorageManager
      storageManager.set(PostPersistenceManager.STORAGE_KEY, content)
      
      console.log(`[Persistence] Updated post: ${postId}`)
    } catch (error) {
      console.error(`[Persistence] Failed to update post ${postId}:`, error)
      throw error
    }
  }

  /**
   * Create a new cache entry for a post that's starting analysis
   */
  async createPendingEntry(postId: string, postData: PostContent, platform: string): Promise<PostCacheEntry> {
    const entry: PostCacheEntry = {
      id: postId,
      postData,
      classification: null,
      state: 'pending',
      artifacts: {
        overlayId: `overlay-${postId}`
      },
      metadata: {
        lastSeen: Date.now(),
        timeSpent: 0,
        platform
      },
      tasks: [],                          // Will be populated by TaskManager
      accumulatedText: '',               // Will be built up as tasks complete
      lastClassificationText: '',        // Will track what was classified
      debug: {}
    }

    await this.storePost(entry)
    return entry
  }

  /**
   * Mark post as complete with analysis results
   */
  async markComplete(postId: string, classification: ClassificationResult): Promise<void> {
    await this.updatePost(postId, {
      classification,
      state: 'complete'
    })
  }

  /**
   * Mark post as failed
   */
  async markFailed(postId: string, error?: string): Promise<void> {
    const updates: Partial<PostCacheEntry> = {
      state: 'failed'
    }
    
    if (error) {
      updates.debug = { lastError: error, failedAt: Date.now() }
    }
    
    await this.updatePost(postId, updates)
  }

  /**
   * Get all stored posts (for debugging)
   */
  async getAllPosts(): Promise<PostCacheEntry[]> {
    try {
      const content = storageManager.get(PostPersistenceManager.STORAGE_KEY) || {}
      const posts = Object.values(content) as PostCacheEntry[]
      return posts
    } catch (error) {
      console.error('[Persistence] Failed to get all posts:', error)
      return []
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ totalPosts: number, completeAnalyses: number, pendingAnalyses: number }> {
    const posts = await this.getAllPosts()
    return {
      totalPosts: posts.length,
      completeAnalyses: posts.filter(p => p.state === 'complete').length,
      pendingAnalyses: posts.filter(p => p.state === 'pending' || p.state === 'analyzing').length
    }
  }

  /**
   * Update time spent for a specific post
   */
  async updateTimeSpent(postId: string, additionalTimeMs: number): Promise<void> {
    try {
      const content = storageManager.get(PostPersistenceManager.STORAGE_KEY) || {}
      let existingEntry = content[postId]
      
      if (!existingEntry) {
        // Create minimal entry for time tracking if post doesn't exist yet
        console.log(`[Persistence] Creating minimal entry for time tracking: ${postId}`)
        existingEntry = {
          id: postId,
          postData: { text: '', authorName: '', mediaElements: [] },
          classification: null,
          state: 'pending',
          artifacts: { overlayId: `overlay-${postId}` },
          metadata: {
            lastSeen: Date.now(),
            timeSpent: 0,
            platform: 'unknown'
          },
          tasks: [],
          accumulatedText: '',
          lastClassificationText: '',
          debug: {}
        }
      }

      // Add the additional time to existing timeSpent
      const updatedEntry: PostCacheEntry = {
        ...existingEntry,
        metadata: {
          ...existingEntry.metadata,
          timeSpent: existingEntry.metadata.timeSpent + additionalTimeMs,
          lastSeen: Date.now()
        }
      }

      content[postId] = updatedEntry
      
      // Store updated content dictionary via StorageManager
      storageManager.set(PostPersistenceManager.STORAGE_KEY, content)
      
      console.log(`[Persistence] Updated time for post ${postId}: +${additionalTimeMs}ms (total: ${updatedEntry.metadata.timeSpent}ms)`)
    } catch (error) {
      console.error(`[Persistence] Failed to update time for post ${postId}:`, error)
      throw error
    }
  }

  /**
   * Update tasks and accumulated text for a post
   */
  async updateTaskData(postId: string, tasks: Task[], accumulatedText: string, lastClassificationText: string): Promise<void> {
    await this.updatePost(postId, {
      tasks,
      accumulatedText,
      lastClassificationText
    })
  }

  /**
   * Check if screen should be enabled for today
   * Returns false if no status exists or status is from previous day
   */
  async isScreenEnabledForToday(postId: string): Promise<boolean> {
    try {
      const entry = await this.getPost(postId)
      if (!entry?.metadata?.screenStatus) {
        return false // Default to OFF if no status exists
      }
      
      const { enabled, lastUpdated } = entry.metadata.screenStatus
      const today = new Date().toDateString()
      const statusDate = new Date(lastUpdated).toDateString()
      
      // If status is from a different day, ignore it and default to OFF
      if (statusDate !== today) {
        return false
      }
      
      return enabled
    } catch (error) {
      console.error(`[Persistence] Failed to check screen status for ${postId}:`, error)
      return false // Default to OFF on error
    }
  }

  /**
   * Update screen status with current timestamp
   */
  async updateScreenStatus(postId: string, enabled: boolean): Promise<void> {
    try {
      const now = Date.now()
      const entry = await this.getPost(postId)
      
      if (entry) {
        // Update existing entry
        await this.updatePost(postId, {
          metadata: {
            ...entry.metadata,
            screenStatus: {
              enabled,
              lastUpdated: now
            }
          }
        })
      }
      
      console.log(`[Persistence] Updated screen status for ${postId}: ${enabled}`)
    } catch (error) {
      console.error(`[Persistence] Failed to update screen status for ${postId}:`, error)
    }
  }

  /**
   * Clear all stored posts (for debugging)
   */
  async clearAllPosts(): Promise<void> {
    try {
      storageManager.set(PostPersistenceManager.STORAGE_KEY, {})
      console.log('[Persistence] Cleared all posts')
    } catch (error) {
      console.error('[Persistence] Failed to clear all posts:', error)
      throw error
    }
  }

  /**
   * Get analytics for posts within a date range
   * Computes time-weighted scores: subcategoryScore × timeSpent for each post
   */
  async getDateRangeAnalytics(startDate: Date, endDate: Date): Promise<DateRangeAnalytics> {
    try {
      const allPosts = await this.getAllPosts()
      
      // Filter posts by date range and completion status
      const postsInRange = allPosts.filter(post => {
        if (post.state !== 'complete' || !post.classification || !post.metadata.timeSpent) return false
        
        const postDate = new Date(post.metadata.lastSeen)
        return postDate >= startDate && postDate <= endDate
      })

      console.log(`[Analytics] Found ${postsInRange.length} complete posts in date range ${startDate.toDateString()} - ${endDate.toDateString()}`)

      // Initialize aggregation structure
      const categoryTotals: { [categoryName: string]: { subcategories: { [subcategoryName: string]: number }, totalScore: number } } = {}
      let totalAttentionScore = 0
      let totalTimeSpent = 0

      // Process each post in the date range
      for (const post of postsInRange) {
        const timeSpent = post.metadata.timeSpent / 1000 // convert to seconds
        totalTimeSpent += timeSpent

        // Process each category in the post's classification
        for (const [categoryName, categoryData] of Object.entries(post.classification)) {
          // Skip totalAttentionScore field
          if (categoryName === 'totalAttentionScore') continue

          // Initialize category if not exists
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = {
              subcategories: {},
              totalScore: 0
            }
          }

          // Process each subcategory
          for (const [subcategoryName, subcategoryData] of Object.entries(categoryData.subcategories)) {
            const subcategoryScore = subcategoryData.score
            const timeWeightedScore = subcategoryScore * timeSpent

            // Add to running total for this subcategory
            if (!categoryTotals[categoryName].subcategories[subcategoryName]) {
              categoryTotals[categoryName].subcategories[subcategoryName] = 0
            }
            categoryTotals[categoryName].subcategories[subcategoryName] += timeWeightedScore

          }
        }
      }

      // Calculate category totals from subcategory sums
      for (const [categoryName, categoryData] of Object.entries(categoryTotals)) {
        categoryData.totalScore = Object.values(categoryData.subcategories).reduce((sum, score) => sum + score, 0)
        totalAttentionScore += categoryData.totalScore
      }

      const analytics: DateRangeAnalytics = {
        categories: categoryTotals,
        totalAttentionScore,
        totalTimeSpent,
        postCount: postsInRange.length,
        dateRange: { startDate, endDate }
      }

      console.log(`[Analytics] Final results: ${totalAttentionScore} total attention score across ${postsInRange.length} posts (${totalTimeSpent}ms total time)`)
      return analytics

    } catch (error) {
      console.error('[Analytics] Failed to compute date range analytics:', error)
      
      // Return empty analytics on error
      return {
        categories: {},
        totalAttentionScore: 0,
        totalTimeSpent: 0,
        postCount: 0,
        dateRange: { startDate, endDate }
      }
    }
  }

  /**
   * Get analytics for today (midnight to now)
   */
  async getTodayAnalytics(): Promise<DateRangeAnalytics> {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    return this.getDateRangeAnalytics(startOfToday, endOfToday)
  }

  /**
   * Get analytics for this week (Monday to Sunday)
   */
  async getThisWeekAnalytics(): Promise<DateRangeAnalytics> {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday = 0

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - daysFromMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return this.getDateRangeAnalytics(startOfWeek, endOfWeek)
  }

  /**
   * Get analytics for this month
   */
  async getThisMonthAnalytics(): Promise<DateRangeAnalytics> {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    
    return this.getDateRangeAnalytics(startOfMonth, endOfMonth)
  }

  /**
   * Get analytics for the last N days
   */
  async getLastNDaysAnalytics(days: number): Promise<DateRangeAnalytics> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    
    return this.getDateRangeAnalytics(startDate, endDate)
  }
}

// Singleton instance
export const postPersistence = new PostPersistenceManager()