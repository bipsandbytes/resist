/**
 * Chrome Storage-based Post Persistence Manager
 * 
 * Stores post analysis data, classification results, and UI artifacts
 * in Chrome's local storage to avoid expensive recomputations.
 */

import { PostContent } from './types'
import { Task } from './task-manager'
import { ClassificationResult } from './classification'

export interface SubcategoryScore {
  score: number         // Pure classification score (0-1)
}

export interface CategoryScore {
  subcategories: { [subcategoryName: string]: SubcategoryScore }
  totalScore: number    // Sum of all subcategory classification scores
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
    return new Promise((resolve, reject) => {
      try {
        // Get existing content dictionary
        chrome.storage.local.get(PostPersistenceManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            console.error(`[Persistence] Failed to get content for storing post ${entry.id}:`, chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
            return
          }
          
          const content = result[PostPersistenceManager.STORAGE_KEY] || {}
          content[entry.id] = entry
          
          // Store updated content dictionary
          chrome.storage.local.set({ [PostPersistenceManager.STORAGE_KEY]: content }, () => {
            if (chrome.runtime.lastError) {
              console.error(`[Persistence] Failed to store post ${entry.id}:`, chrome.runtime.lastError)
              reject(chrome.runtime.lastError)
            } else {
              console.log(`[Persistence] Stored post: ${entry.id}`)
              resolve()
            }
          })
        })
      } catch (error) {
        console.error(`[Persistence] Failed to store post ${entry.id}:`, error)
        reject(error)
      }
    })
  }

  /**
   * Retrieve post from Chrome storage
   */
  async getPost(postId: string): Promise<PostCacheEntry | null> {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(PostPersistenceManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            console.error(`[Persistence] Failed to retrieve post ${postId}:`, chrome.runtime.lastError)
            resolve(null)
            return
          }
          
          const content = result[PostPersistenceManager.STORAGE_KEY] || {}
          const entry = content[postId] || null
          
          if (entry) {
            console.log(`[Persistence] Retrieved post: ${postId} (state: ${entry.state})`)
            // Update lastSeen timestamp (fire and forget)
            this.updatePost(postId, { 
              metadata: { ...entry.metadata, lastSeen: Date.now() } 
            }).catch(err => console.warn('Failed to update lastSeen:', err))
          }
          
          resolve(entry)
        })
      } catch (error) {
        console.error(`[Persistence] Failed to retrieve post ${postId}:`, error)
        resolve(null)
      }
    })
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
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(PostPersistenceManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            console.error(`[Persistence] Failed to get content for updating post ${postId}:`, chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
            return
          }
          
          const content = result[PostPersistenceManager.STORAGE_KEY] || {}
          const existingEntry = content[postId]
          
          if (!existingEntry) {
            console.warn(`[Persistence] Cannot update non-existent post: ${postId}`)
            resolve()
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
          
          // Store updated content dictionary
          chrome.storage.local.set({ [PostPersistenceManager.STORAGE_KEY]: content }, () => {
            if (chrome.runtime.lastError) {
              console.error(`[Persistence] Failed to update post ${postId}:`, chrome.runtime.lastError)
              reject(chrome.runtime.lastError)
            } else {
              console.log(`[Persistence] Updated post: ${postId}`)
              resolve()
            }
          })
        })
      } catch (error) {
        console.error(`[Persistence] Failed to update post ${postId}:`, error)
        reject(error)
      }
    })
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
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(PostPersistenceManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            console.error('[Persistence] Failed to get all posts:', chrome.runtime.lastError)
            resolve([])
            return
          }
          
          const content = result[PostPersistenceManager.STORAGE_KEY] || {}
          const posts = Object.values(content) as PostCacheEntry[]
          
          resolve(posts)
        })
      } catch (error) {
        console.error('[Persistence] Failed to get all posts:', error)
        resolve([])
      }
    })
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
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(PostPersistenceManager.STORAGE_KEY, (result) => {
          if (chrome.runtime.lastError) {
            console.error(`[Persistence] Failed to get content for updating time for post ${postId}:`, chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
            return
          }
          
          const content = result[PostPersistenceManager.STORAGE_KEY] || {}
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
          
          // Store updated content dictionary
          chrome.storage.local.set({ [PostPersistenceManager.STORAGE_KEY]: content }, () => {
            if (chrome.runtime.lastError) {
              console.error(`[Persistence] Failed to update time for post ${postId}:`, chrome.runtime.lastError)
              reject(chrome.runtime.lastError)
            } else {
              console.log(`[Persistence] Updated time for post ${postId}: +${additionalTimeMs}ms (total: ${updatedEntry.metadata.timeSpent}ms)`)
              resolve()
            }
          })
        })
      } catch (error) {
        console.error(`[Persistence] Failed to update time for post ${postId}:`, error)
        reject(error)
      }
    })
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
      
      console.log(`[Persistence] Updated screen status for ${postId}: ${enabled ? 'ON' : 'OFF'}`)
    } catch (error) {
      console.error(`[Persistence] Failed to update screen status for ${postId}:`, error)
    }
  }

  /**
   * Clear all stored posts (for debugging)
   */
  async clearAllPosts(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [PostPersistenceManager.STORAGE_KEY]: {} }, () => {
          if (chrome.runtime.lastError) {
            console.error('[Persistence] Failed to clear all posts:', chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
          } else {
            console.log('[Persistence] Cleared all posts')
            resolve()
          }
        })
      } catch (error) {
        console.error('[Persistence] Failed to clear all posts:', error)
        reject(error)
      }
    })
  }
}

// Singleton instance
export const postPersistence = new PostPersistenceManager()