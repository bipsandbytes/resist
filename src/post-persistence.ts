/**
 * Chrome Storage-based Post Persistence Manager
 * 
 * Stores post analysis data, classification results, and UI artifacts
 * in Chrome's local storage to avoid expensive recomputations.
 */

import { PostContent } from './types'

export interface SubcategoryScore {
  score: number         // Pure classification score (0-1)
}

export interface CategoryScore {
  subcategories: { [subcategoryName: string]: SubcategoryScore }
  totalScore: number    // Sum of all subcategory classification scores
}

export interface ClassificationResult {
  categories: { [categoryName: string]: CategoryScore }
  totalAttentionScore: number  // Sum of all category classification scores
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
    timeSpent: number                 // Total time user spent on this post (mock for now)
    platform: string                 // 'twitter', etc.
  }
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
        timeSpent: 0, // Mock for now
        platform
      },
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