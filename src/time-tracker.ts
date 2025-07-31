/**
 * TimeTracker - Viewport-based time tracking for posts
 * 
 * Uses Intersection Observer to track when posts are 10%+ visible
 * and measures time spent looking at each post.
 */

import { postPersistence } from './post-persistence'

interface TrackedPost {
  postId: string
  element: HTMLElement
  startTime: number
  isVisible: boolean
  isPaused: boolean  // Track if paused by hover interactions
}

export class TimeTracker {
  private observer: IntersectionObserver
  private trackedPosts = new Map<string, TrackedPost>()

  constructor() {
    // Create intersection observer with 50% threshold
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersectionChanges(entries),
      {
        threshold: 0.1, // 50% of post must be visible
        rootMargin: '0px'
      }
    )
  }

  /**
   * Start tracking time for a post
   */
  startTracking(postElement: HTMLElement, postId: string): void {
    // Check if we're already tracking this post
    if (this.trackedPosts.has(postId)) {
      const existingPost = this.trackedPosts.get(postId)!
      
      // If the existing element is no longer in DOM, clean it up and continue
      if (!this.isElementInDOM(existingPost.element)) {
        console.log(`[${postId}] [TimeTracker] Found stale reference, cleaning up`)
        this.cleanupStaleEntry(postId)
      } else {
        // Element is still valid, don't track twice
        return
      }
    }

    console.log(`[${postId}] [TimeTracker] Starting tracking`)

    const trackedPost: TrackedPost = {
      postId,
      element: postElement,
      startTime: 0,
      isVisible: false,
      isPaused: false
    }

    this.trackedPosts.set(postId, trackedPost)
    this.observer.observe(postElement)
  }

  /**
   * Stop tracking a specific post and persist its time
   */
  async stopTracking(postId: string): Promise<void> {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Stopping tracking`)

    // If post is currently visible, record the final time segment
    if (trackedPost.isVisible && trackedPost.startTime > 0) {
      const timeSpent = Date.now() - trackedPost.startTime
      await this.persistTimeSpent(postId, timeSpent)
    }

    // Clean up
    this.observer.unobserve(trackedPost.element)
    this.trackedPosts.delete(postId)
  }

  /**
   * Pause time tracking for a post (like viewport exit)
   * Persists accumulated time and resets startTime
   */
  async pauseTracking(postId: string): Promise<void> {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Pausing tracking (hover enter)`)

    // If post is currently visible and not already paused, record the time segment
    if (trackedPost.isVisible && !trackedPost.isPaused && trackedPost.startTime > 0) {
      const timeSpent = Date.now() - trackedPost.startTime
      await this.persistTimeSpent(postId, timeSpent)
    }

    // Mark as paused and reset startTime
    trackedPost.isPaused = true
    trackedPost.startTime = 0
  }

  /**
   * Resume time tracking for a post (like viewport enter)
   * Sets new startTime if post is visible
   */
  resumeTracking(postId: string): void {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Resuming tracking (hover leave)`)

    // If post is visible and was paused, restart timing
    if (trackedPost.isVisible && trackedPost.isPaused) {
      trackedPost.startTime = Date.now()
    }

    // Mark as no longer paused
    trackedPost.isPaused = false
  }

  /**
   * Stop tracking all posts (cleanup)
   */
  async stopAllTracking(): Promise<void> {
    const postIds = Array.from(this.trackedPosts.keys())
    await Promise.all(postIds.map(postId => this.stopTracking(postId)))
  }

  /**
   * Handle intersection observer changes
   */
  private handleIntersectionChanges(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const postId = this.findPostIdByElement(entry.target as HTMLElement)
      if (!postId) return

      const trackedPost = this.trackedPosts.get(postId)
      if (!trackedPost) return

      // Check if element is still connected to DOM
      if (!this.isElementInDOM(trackedPost.element)) {
        console.log(`[${postId}] [TimeTracker] Element disconnected during intersection event`)
        this.cleanupStaleEntry(postId)
        return
      }

      const isVisible = entry.isIntersecting
      const now = Date.now()

      if (isVisible && !trackedPost.isVisible) {
        // Post became visible - start timing (unless paused by hover)
        console.log(`[${postId}] [TimeTracker] Entered viewport`)
        trackedPost.isVisible = true
        if (!trackedPost.isPaused) {
          trackedPost.startTime = now
        }
      } else if (!isVisible && trackedPost.isVisible) {
        // Post became invisible - record time and persist (unless already paused)
        console.log(`[${postId}] [TimeTracker] Left viewport`)
        
        let timeSpent = 0
        if (!trackedPost.isPaused && trackedPost.startTime > 0) {
          timeSpent = now - trackedPost.startTime
        }
        
        trackedPost.isVisible = false
        trackedPost.startTime = 0

        // Persist the time spent (fire and forget) - only if we had active timing
        if (timeSpent > 0) {
          this.persistTimeSpent(postId, timeSpent).catch(error => {
            console.error(`[${postId}] [TimeTracker] Failed to persist time:`, error)
          })
        }
      }
    })
  }

  /**
   * Find post ID by DOM element
   */
  private findPostIdByElement(element: HTMLElement): string | null {
    for (const [postId, trackedPost] of this.trackedPosts.entries()) {
      if (trackedPost.element === element) {
        return postId
      }
    }
    return null
  }

  /**
   * Persist time spent to storage
   */
  private async persistTimeSpent(postId: string, timeSpentMs: number): Promise<void> {
    if (timeSpentMs <= 0) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Persisting ${timeSpentMs}ms`)

    try {
      // Use the PostPersistenceManager to update time spent
      await postPersistence.updateTimeSpent(postId, timeSpentMs)
    } catch (error) {
      console.error(`[${postId}] [TimeTracker] Failed to persist time:`, error)
    }
  }

  /**
   * Check if DOM element is still connected to the document
   */
  private isElementInDOM(element: HTMLElement): boolean {
    return element.isConnected
  }

  /**
   * Clean up tracking entry for disconnected element
   */
  private cleanupStaleEntry(postId: string): void {
    const trackedPost = this.trackedPosts.get(postId)
    if (!trackedPost) {
      return
    }

    console.log(`[${postId}] [TimeTracker] Cleaning up stale DOM reference`)
    
    // Unobserve the stale element
    this.observer.unobserve(trackedPost.element)
    
    // Remove from tracking
    this.trackedPosts.delete(postId)
  }

  /**
   * Get current tracking statistics (for debugging)
   */
  getTrackingStats(): { totalTracked: number, currentlyVisible: number } {
    const totalTracked = this.trackedPosts.size
    const currentlyVisible = Array.from(this.trackedPosts.values())
      .filter(post => post.isVisible).length

    return { totalTracked, currentlyVisible }
  }
}